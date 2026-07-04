# SAP · Phase 2 setup — cloud + admin view + AI assistant

Follow these once, top to bottom (~30 minutes). Everything is free tier.

## 1. Create the database (Supabase)

1. Go to supabase.com → sign in with GitHub → **New project**
   (any name, set a strong database password, pick the region closest to you).
2. Left sidebar → **SQL Editor** → paste the whole contents of
   `supabase/schema.sql` → **Run**. This creates the tables AND the
   Row Level Security rules — the guarantee that users only ever see
   their own data.
3. Left sidebar → **Storage** → **New bucket** → name it exactly `photos`,
   keep it **Private** → Create.
4. Left sidebar → **Authentication → Sign In / Up → Email** →
   turn **OFF "Confirm email"**. (The free email sender is limited to a
   couple of mails per hour — with confirmation off, friends sign up
   instantly with just email + password.)

## 2. Connect the app to it

1. In Supabase: **Project Settings → API**. Copy the **Project URL** and
   the **anon public key**.
2. In your project folder, create a file named `.env`:

   ```
   VITE_SUPABASE_URL=https://YOURPROJECT.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ...your anon key...
   ```

3. In Vercel: your project → **Settings → Environment Variables** → add the
   same two variables → then **Deployments → Redeploy**.

The anon key is designed to be public — it's in every user's app. Safety
comes from the Row Level Security rules, not from hiding this key.

## 3. Turn on the AI assistant

1. Get a free Gemini API key: aistudio.google.com → **Get API key**.
2. Install the Supabase CLI (one time):

   ```
   npm install -g supabase
   ```

3. In your project folder, run (replace YOURPROJECT with the ref from your
   Supabase project URL):

   ```
   supabase login
   supabase link --project-ref YOURPROJECT
   supabase secrets set GEMINI_API_KEY=your_gemini_key_here
   supabase functions deploy ai-chat
   ```

Your key stays on the server. Users never enter anything.
If the AI ever errors with "model not found", set a different model:
`supabase secrets set GEMINI_MODEL=gemini-2.0-flash` and redeploy.

## 4. Your admin view (your laptop)

Open your Supabase dashboard any time:

- **Table Editor → profiles** — every user's full profile (JSON per row)
- **Table Editor → days** — every user's daily trackers, one row per day
- **Storage → photos** — every user's photos, in a folder per user ID
- **Authentication → Users** — the list of all accounts

Only your Supabase login can see this. Nobody else gets admin — exactly
as you wanted. Never share your Supabase password or the
`service_role` key with anyone.

## 5. What changed in the app

- New sign-in / create-account screen (email + password)
- Everything users do now saves locally AND syncs to your cloud
- Onboarding photos upload to your private storage bucket automatically
- New **Assistant** tab: context-aware AI chat that knows the user's
  profile, answers questions, makes plans, and analyzes photos
  (food → calorie estimate, face/body/hair → observations & suggestions)
- Sign out clears that phone's cached data (safe on shared phones)

## Free-tier limits to know (honest numbers)

- Database 500 MB — years of tracker data for 50 users, not a concern.
- Storage 1 GB — roughly 8,000–10,000 compressed photos. Fine for a long
  time; if it ever fills, we add a cleanup or a second free bucket.
- Gemini free tier — a daily request cap shared by all users. If friends
  chat heavily the app shows "free AI limit reached — resets tomorrow"
  instead of crashing. If it happens often, we add caching or a second key.
- Supabase free projects **pause after 7 days with zero activity** —
  daily use prevents this; if it ever pauses, one click in the dashboard
  resumes it.

## Next (Phase 2.5 / 3)

- Scheduled push reminders that fire with the app closed (needs the cloud
  above verified working first — say "add push reminders" when ready)
- Workout module with the 3D muscle model, Diet module with recipes and
  Open Food Facts, full menstrual module
