# SAP · Security

Written after an adversarial audit that actually ran the attacks against this
project rather than reading the code and worrying. Thirteen candidate issues
were found; eight did not survive verification and are listed at the bottom with
the reason, because knowing what is *already* safe matters as much as knowing
what was not.

## The honest headline

**Nothing is unhackable, and any app that tells you otherwise is lying to you.**
What is achievable — and what SAP now does — is that the **server is the only
thing that decides anything**. A user with dev tools open can change any value
in their own browser and it buys them nothing, because every rule that matters
is enforced in Postgres or in an edge function, not in the JavaScript that
shipped to their phone.

Client-side "hardening" — obfuscating the bundle, disabling right-click,
detecting dev tools — is theatre. It stops nobody and it is not in this app.

## Why nobody can get admin

There is no in-app admin panel. Not hidden, not permission-gated — it does not
exist. Your admin view is the Supabase dashboard, which runs as `service_role`,
a key that lives only on Supabase's servers and in your own logged-in browser
session. It is never sent to the app, never in the bundle, never on a user's
phone.

So the attack "change the user in the admin panel from inspect element" has no
target. There is no client-side admin flag to flip, because there is no
client-side admin.

The `admin_*` views are additionally `REVOKE`d from `anon` and `authenticated`,
so even a crafted API call from a signed-in user cannot read them.

## What was actually wrong, and is now fixed

### 1. The AI endpoint was a free public proxy — CRITICAL

Supabase's `verify_jwt` only proves a token was *signed by this project*. The
publishable anon key is exactly such a token, and it ships inside the public JS
bundle. It passed the gate; `getUser()` then returned null; and **nothing checked
that null**. Anyone who viewed source could run your Gemini key with no account:

```
curl -X POST https://<project>.supabase.co/functions/v1/ai-chat \
  -H 'Authorization: Bearer <ANON_KEY_FROM_BUNDLE>' \
  -d '{"messages":[{"role":"user","text":"write me an essay"}]}'
```

Worse, the logging call was wrapped in `if (userId)`, so these requests were
invisible in `ai_messages` — the abuse would not have appeared in your dashboard
at all.

**Fixed:** the function resolves the user first and returns 401 when there is no
real user behind the token, before any parsing or any outbound call.

### 2. No rate limit of any kind — HIGH

One signed-up user could drain the Gemini quota and fill the storage bucket in a
loop. **Fixed:** a per-user rolling quota (40/hour, 150/day by default, tunable
via `AI_QUOTA_HOUR` / `AI_QUOTA_DAY`) counted from the audit log that already
exists. It fails **open** — if the count query breaks, users keep working rather
than the assistant going down for everyone.

### 3. The audit log was forgeable — MEDIUM

Any signed-in user could `POST /rest/v1/ai_messages` and insert rows with
attacker-chosen `reply_text`, an `image_paths` array pointing at another user's
files, and a backdated `created_at`. Confirmed: it returned 201. Those rows
appeared in `admin_activity` and `admin_chat` looking completely genuine.

A log its own subject can write to is worse than no log, because you would have
trusted it. **Fixed:** `INSERT` revoked from clients entirely. The edge function
writes as `service_role` and is now the only writer.

*Cost:* the one-time recovery of pre-cloud chat threads out of an old device's
localStorage is gone. That was a nicety; a trustworthy audit trail is not.

### 4. Server-side requests to any address — MEDIUM (SSRF)

`push_subscriptions.endpoint` was fully attacker-controlled, and the
`send-reminders` cron — running as `service_role` — POSTs to whatever is stored
there, every 15 minutes, forever. Inserting
`http://169.254.169.254/latest/meta-data/` (the cloud metadata address, which on
many platforms hands out credentials) returned 201.

**Fixed:** a database `CHECK` constraint limiting endpoints to the five real
push services, a trigger ensuring the JSON blob's endpoint matches the column
(they are separate values and only one was checked), and a host allow-list in
the function itself for rows that predate the constraint.

### 5. Supporting hardening

- Wildcard CORS (`*`) replaced with an allow-list via `AI_ALLOWED_ORIGINS`, so a
  third-party page cannot drive the endpoint from a victim's browser.
- Request body capped at 6 MB, enforced on bytes actually received rather than
  the caller-supplied `Content-Length`.
- Images magic-byte sniffed; the caller's claimed MIME type is discarded.
- Conversation capped at 30 turns × 8000 chars, so a wall of caller-supplied
  text cannot push the system prompt out of the context window. Any role that is
  not literally `user` becomes `model`, so no third role can be smuggled in.
- `app_events` constrained to sane sizes.

## What you must run for any of this to take effect

```
# 1. Database changes
#    Supabase → SQL Editor → paste supabase/schema-security.sql → Run

# 2. Both edge functions
supabase functions deploy ai-chat
supabase functions deploy send-reminders

# 3. Lock CORS to your real origin
supabase secrets set AI_ALLOWED_ORIGINS=https://your-app.vercel.app
```

Until step 1 runs, the audit log stays forgeable and the SSRF stays open. Until
step 2 runs, the AI endpoint stays a public proxy. **The critical fix is step 2.**

## What was checked and found already safe

These were investigated and did **not** hold up. Listed because "we looked and
it was fine" is information too.

| Claim | Why it failed |
|---|---|
| Caller-set `Content-Type` lets a user host arbitrary HTML | The storage RLS policy already permits any authenticated user to upload any file type to their own prefix directly — the edge function adds no capability. The bucket is private, and the app never reads photos back from storage (no `createSignedUrl` / `getPublicUrl` anywhere), so no render path exists. |
| Path traversal via `source` into another user's folder | Storage keys are opaque S3-style object names; `..` is stored literally and never resolved. `userId` comes from the verified token, not the body. |
| No size cap → memory exhaustion | Real, but grants nothing: a user can already write to their own storage prefix directly, faster and without the base64 overhead. Capped anyway. |
| Prompt injection via the profile object | The profile is the caller's own data being used to answer the caller's own question. There is no other user's data in the context to leak. |
| `app_events` forgeable | True and harmless — a user forging their own screen-view events harms nobody. Size-capped so it cannot bloat the database. |
| Missing CSP / clickjacking headers | Worth adding as defence in depth, but no demonstrated impact here: the app renders no third-party content and holds its session in localStorage, not cookies. |
| `photos.storage_path` is free text | A user can register a row pointing at another user's path, but nothing reads photos back from storage, and the file itself stays protected by the storage policy. |
| Anon key visible in the bundle | Working as designed. It is a publishable key; safety comes from RLS, not from hiding it. It became a problem only via issue 1, which is fixed. |

## Your data-handling responsibilities

This app holds body photos and health data belonging to real people who trust
you. Two things worth being deliberate about:

- **The photo scan refuses inappropriate images by design.** The prompt returns
  `UNSUITABLE` and stores nothing if an image contains nudity or appears to show
  a minor. Intimate-area guidance is text-only and never asks for a photo. Do not
  remove this — it protects your users and it protects you.
- **You can read everything in the dashboard.** That is the point of the admin
  view, and your users were told the owner can see their data. Treat it
  accordingly, and never share your Supabase password or the `service_role` key.
