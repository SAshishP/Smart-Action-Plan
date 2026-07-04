# SAP — Smart Action Plan · Phase 1

One codebase that runs as an installable app on iPhone, Android, and Pixel —
shared with a single link, no app store needed.

## What's inside (Phase 1)

- Splash screen with the SAP logo
- 7-step onboarding: consent → basics (DOB with auto-age, gender) → body →
  health (allergies, meds, diet) → lifestyle (work/wake/sleep times) →
  socials → 12 initial photos (compressed on-device)
- Gender-adaptive theme (the whole app recolors itself)
- Dashboard: personalized morning-to-night plan built from the profile
  (the "Day Arc"), water tracker with a goal from body weight, steps,
  sleep, calories in/out, menstrual cycle tile (female profiles),
  daily motivation, to-do list, notification permission
- Everything saves on the device and survives closing the app

## Run it on your laptop (first time)

1. Install Node.js LTS from nodejs.org (one time).
2. Open this folder in VS Code → Terminal → run:

   ```
   npm install
   npm run dev
   ```

3. It prints two URLs. Open the `Network` one (e.g. `http://192.168.x.x:5173`)
   on your iPhone — phone and laptop must be on the same Wi-Fi. That's your
   live test on the 11 Pro Max.

## Put it online + get your shareable link (free)

1. Create a GitHub repo, push this folder to it.
2. Go to vercel.com → sign in with GitHub → "Add New Project" → pick the repo
   → Deploy. Nothing to configure; Vercel detects Vite automatically.
3. You get a link like `https://sap-yourname.vercel.app`. **That is the link
   you share with friends.**

## How friends install it

- **iPhone:** open the link in Safari → Share button → **Add to Home Screen**.
- **Android/Pixel:** open the link in Chrome → tap the **Install app** prompt
  (or menu → Add to Home screen).

After that it's an app: own icon, full screen, works offline, no browser bar.

## Known Phase 1 limits (on purpose — fixed in Phase 2)

- Data lives on each phone only. Phase 2 connects the free Supabase cloud
  (schema is ready in `supabase/schema.sql`) so you see all users' data from
  your laptop, and users get login + backup. Row Level Security in that file
  is what guarantees users can only ever see their own data.
- Photos are stored compressed on-device; phone storage for this is ~5 MB,
  enough for the initial 12 photos. Progress photo history moves to Supabase
  Storage in Phase 2.
- The daily plan is rule-based. Phase 2 adds the AI assistant (Gemini free
  tier via a Supabase Edge Function — your key stays on the server, users
  never enter anything).
- Reminders: the button asks notification permission now; scheduled push
  reminders (that fire with the app closed) come with the Phase 2 backend.
  On iPhone, notifications only work after Add to Home Screen (iOS rule).

## Roadmap

- **Phase 2** — Supabase login/cloud sync, admin visibility, AI assistant,
  photo analysis, AI-generated day plans, push reminders
- **Phase 3** — Workout module (3D muscle model), Diet module (recipes,
  food-photo calories via Open Food Facts + AI), full menstrual module
- **Phase 4** — Skin & hair care, Style module, Analysis dashboard
  (charts across all modules), Android APK via Capacitor

## If something breaks

- White screen after an edit → check the terminal running `npm run dev`
  for the exact file and line.
- "Storage is full" alert → too many photos on-device; that's the Phase 2
  migration signal.
- Changes not appearing on phones after deploy → the PWA auto-updates on
  next open; force-close and reopen the app once.
