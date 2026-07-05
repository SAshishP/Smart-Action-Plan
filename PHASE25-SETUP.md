# SAP · Phase 2.5 setup — push reminders (app closed = still works)

~15 minutes, all free. Do Phase 2 first (cloud must be live).

## 1. Generate your push keys (one time, on your laptop)

```
npx web-push generate-vapid-keys
```

It prints a **Public Key** and a **Private Key**. Keep both handy.

## 2. Give the keys to the right places

**Public key → the app.** Add to your `.env` AND to Vercel
(Settings → Environment Variables):

```
VITE_VAPID_PUBLIC_KEY=your_public_key_here
```

**Both keys + a secret → the server.** In your project folder:

```
supabase secrets set VAPID_PUBLIC_KEY=your_public_key_here
supabase secrets set VAPID_PRIVATE_KEY=your_private_key_here
supabase secrets set CRON_SECRET=any_long_random_text_you_invent
```

## 3. Database + schedule

1. Supabase → SQL Editor → run **PART 1** of `supabase/schema-phase25.sql`.
2. Supabase → Database → **Extensions** → enable `pg_cron` and `pg_net`.
3. In `schema-phase25.sql` **PART 2**, replace `YOURPROJECT` (your project
   ref) and `YOUR_SECRET` (the CRON_SECRET you invented) → run it.

## 4. Deploy the sender

```
supabase functions deploy send-reminders --no-verify-jwt
```

(`--no-verify-jwt` lets the scheduler call it; the CRON_SECRET check
inside the function keeps everyone else out.)

## 5. Ship the updated app

```
npm install        (one new package for the service worker)
```

Then push to GitHub → Vercel redeploys → done.

## 6. Every phone opts in once

Each user (including you) taps **🔔 Enable reminders on this phone** on the
dashboard and allows notifications. That's it — from then on they get
morning water, breakfast, water checks, lunch, workout, dinner, prep, and
sleep nudges at *their* plan times, in *their* timezone, app open or closed.

iPhone rule (Apple's, not ours): reminders only work when SAP was **added
to the Home Screen** and opened from that icon at least once.

## Test it works

Ask for a reminder without waiting for one to be due — call the function
yourself from your laptop:

```
curl -X POST "https://YOURPROJECT.supabase.co/functions/v1/send-reminders" -H "x-cron-secret: YOUR_SECRET"
```

You'll get back `{"sent":N,"removed":0,"checked":M}` — `checked` is how many
phones are subscribed. To force a real notification, temporarily set your
profile's wake time to a couple of minutes from now, run the curl, and watch
your phone. (Set it back after.)

## If something doesn't fire

- iPhone shows "can't receive push here yet" → it's open in Safari, not the
  installed icon. Add to Home Screen, open from the icon, tap again.
- `checked: 0` → nobody has tapped the 🔔 button since this update.
- Sent but nothing appears on iPhone → check Settings → Notifications → SAP
  is allowed, and Focus/DND isn't blocking it.
