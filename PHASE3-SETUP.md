# SAP · Phase 3 setup — see everything your users do

~5 minutes. Do Phase 2 first (cloud must be live).

After this, every AI conversation, every daily log, every profile and every
screen open is visible to you in the Supabase dashboard. Users still can't see
each other — only you, through the dashboard, can see everyone.

## 1. Run the schema

Supabase → **SQL Editor** → paste all of `supabase/schema-phase3.sql` → Run.

That creates two tables (`ai_messages`, `app_events`) and six `admin_*` views.
Safe to re-run any time.

## 2. Redeploy the AI function

```
supabase functions deploy ai-chat
```

It now writes every request and reply to `ai_messages` before returning.
No new secrets needed — `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are
already provided to every function automatically.

## 3. Ship the app

Push to GitHub → Vercel redeploys. Nothing else to configure.

---

## Where to look

Supabase → **Table Editor** → switch the schema dropdown to `public` and pick a
view. Or use the SQL Editor for anything ad-hoc.

| View | What it answers |
|---|---|
| `admin_users` | Who signed up, their profile, how active they are. **Start here.** |
| `admin_activity` | Live feed — newest AI question + answer first, all users |
| `admin_chat` | Full untruncated transcripts, grouped per user |
| `admin_days` | Water, steps, sleep, calories, weight, mood, meals, todos per day |
| `admin_events` | Screen-by-screen activity trail |
| `admin_engagement` | Per user per day: how many AI calls and actions |
| `admin_photos` | Every photo with a readable label — no filename decoding |
| `admin_photo_coverage` | Which of the 12 onboarding shots each user has / is missing |

### Handy queries

Everything one person has ever asked the AI:

```sql
select created_at, source, user_text, reply_text
from admin_chat where email = 'someone@gmail.com'
order by created_at;
```

Today's activity across all users:

```sql
select * from admin_activity
where created_at > now() - interval '24 hours';
```

Who's gone quiet:

```sql
select email, name, last_day_logged, last_ai_at
from admin_users
where last_day_logged < current_date - 3 or last_day_logged is null
order by last_day_logged nulls first;
```

What people ask about most:

```sql
select source, count(*) from ai_messages group by source order by 2 desc;
```

### Photos

Query `admin_photos` rather than browsing the bucket — it names every shot for
you, so you always know which picture you're looking at:

```sql
select label, kind, taken_on, storage_path
from admin_photos where email = 'someone@gmail.com'
order by taken_on desc;
```

```
 label                       | kind       | taken_on   | storage_path
 --------------------------- | ---------- | ---------- | ---------------------------
 Sent to AI · diet photo     | AI chat    | 2026-08-02 | 3f2a…/chat/diet-photo_…jpg
 Body · Front                | Progress   | 2026-07-28 | 3f2a…/body_front_2026-07-28.jpg
 Face · Front                | Onboarding | 2026-07-04 | 3f2a…/face_front_initial.jpg
 Wardrobe item               | Wardrobe   | 2026-07-02 | 3f2a…/wardrobe_1751…jpg
```

`kind` tells you where it came from: **Onboarding** (the original 12),
**Progress** (weekly re-shoots), **AI chat** (sent to the assistant — food,
body, hair), **Wardrobe** (clothing added in Style).

To see what a user still hasn't given you, or which shot is stale enough to be
worth asking them to redo:

```sql
select label, have_photo, latest
from admin_photo_coverage where email = 'someone@gmail.com'
order by have_photo, label;
```

To actually view a file: Storage → `photos` bucket → paste the `storage_path`
into the search box. The bucket is private, so there's no public URL — use the
dashboard, or generate a signed URL if you need to share one.

---

## What about users from before this update?

- **Profiles, daily logs, photos** — already in the cloud. Visible immediately.
- **Chat history** — only ever existed on their phones. The app now uploads
  whatever is still saved on each device (up to the last 60 messages) the next
  time that user opens it, tagged `source = 'backfill'`. Anything they cleared
  or that fell off the 60-message limit is gone for good.

Rows tagged `backfill` came from the device, so they're less trustworthy than
the server-written ones — treat them as best-effort recovery.

## Switches

```
supabase secrets set LOG_AI=off          # stop logging entirely
supabase secrets set LOG_AI_IMAGES=off   # log text only, don't archive photos
```

Removing a secret (or setting it to anything other than `off`) turns logging
back on.

## Note

`ai_messages` holds the health questions, symptoms, body photos and food
habits your users typed in private. Anyone with your Supabase password can read
all of it. Turn on 2FA for your Supabase account, and consider telling users in
the app that chats are stored and reviewable — right now the Assistant screen
doesn't say so.
