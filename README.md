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

---

# 🎉 SAP is complete — all 7 phases

**Tabs:** 🏠 Home (day plan, trackers, cycle tile, todos, reminders) ·
📐 Body (BMI, body fat %, fat map, days-to-goal, sagging/stretch-mark/cellulite
protocols, health-condition guidance) ·
💪 Fit (3D muscle body, equipment-aware plans, cycle-aware, progress photos + AI) ·
🍽️ Diet (targets, allergy-safe meal plans, recipes, world food search, photo
calorie counter) · 🧴 Care (weather-tuned skin & hair routines, product shelf,
face/hair progress + AI) · 👔 Style (AI body/color analysis, occasion outfits,
haircut/beard/makeup guides, AI wardrobe) · 📊 Stats (charts, insights, AI
monthly review, transformation strip, your why + affirmations) · ✨ AI
(context-aware assistant with photo analysis).

**Owner maintenance (5 minutes a month):**
- Open your Supabase dashboard weekly — it's your admin view AND it keeps the
  free project from pausing.
- Backup: Supabase → Database → Backups exist on free tier, but for photos,
  occasionally download the storage bucket. Your users trusted you with this.
- If the AI stops replying: check aistudio.google.com quota, or set a
  different model (see PHASE2-SETUP.md).
- Watch storage: Supabase dashboard shows usage. At ~80% of 1 GB, tell me —
  we'll add cleanup or a second bucket.

**Ship an update:** edit → git push → Vercel deploys → users' installed apps
refresh on next open. Server functions redeploy with
`supabase functions deploy <name>` only when you change them.

## If you ever see a problem screen (or before: a blank page)

1. **Deploy rule: always replace the WHOLE folder, never mix old and new
   files.** Mixed versions are the #1 cause of broken builds.
2. A "😵 Something went wrong" screen now appears instead of any blank page,
   with three fixes: Try again · **Reload fresh** (clears a stuck update —
   use this first) · Reset app data on this phone (cloud data stays).
3. The app also self-heals automatically: two crashes in a row trigger a
   cache + service-worker reset on its own.
4. On iPhone, after any deploy: force-close the installed app and reopen it
   once to pick up the update.

## v4 upgrades

- **Cycle calendar** — tap any past day on a real calendar (Cycle tab) to log
  or un-log a period start; period history now shows a running count, days
  since the previous one, and a delete button per entry. Added Anxiety, Low
  mood and Irritable to the symptom list.
- **"Edit my routine"** (Home) — add your own daily items (prayer, meds,
  class, commute…) with times and day-of-week filters, hide any default plan
  item you don't do, and preview the resulting day.
- **"Timeline to my goal"** (Stats) — projects a date you'll hit your target
  weight from your real weigh-ins (or estimates from your calorie target),
  with milestones. Set your target weight from Profile or directly on Stats.
- **Smarter allergy filtering** — an allergy to an ingredient (e.g. soy) now
  also blocks foods made from it (tofu, miso, tempeh, etc.) instead of only
  matching the literal word.
- **Medication-food interactions** (Diet) — informational warnings for common
  interactions (e.g. grapefruit + statins), never "stop taking" advice.
- **Today's calories bar** (Diet) — eaten / left / burned at a glance, plus a
  "log what you actually ate" flow (typed, with optional AI calorie estimate)
  that can replace a planned meal.
- **Care reorder** — Precautions now shows right after the weather info
  instead of near the bottom of the page.
- **Persistent AI chat** — Assistant conversations now survive switching tabs
  or closing the app (stored on-device only, not synced to the cloud yet),
  with a Clear button to start fresh.

## v5 — the Body report (📐 Body tab)

A new tab that turns the numbers and photos you already gave SAP into a single
readable assessment, plus what to actually do about each thing it finds.

- **BMI** with the healthy weight range in kg for your height. Uses the WHO
  Asian cut-offs (healthy tops out at 23, not 25) when your ethnicity or
  location indicates it — South Asian bodies carry more visceral fat at the
  same BMI, and the standard chart calls a genuinely at-risk waist "normal".
- **Body fat %** via the US Navy tape method (neck + waist, plus hips for
  women) — the most accurate result possible without a DEXA scan. Falls back to
  a BMI-and-age estimate when measurements are missing, and tells you exactly
  which ones to add and how much accuracy you gain. Shows fat mass, lean mass
  and a confidence range, never a fake-precise single number.
- **Waist-to-height, waist-to-hip and waist circumference** with the risk band
  for each. Waist-to-height is the best single-tape predictor of visceral fat
  there is: keep your waist under half your height.
- **Fat map** — every body region rated from your photo scan and your tape
  measurements, worst first, with per-area exercise protocols, the habits that
  matter there, a realistic timeline, and the myth to stop believing. Framed
  honestly throughout: you don't get to choose where fat leaves from. The
  deficit decides how much; genetics and hormones decide the order. Targeted
  work builds the muscle underneath so there's a shape there when it goes.
- **Days to your goal** — an actual date, with milestones, the daily calorie gap
  it assumes, and the body fat % you should land at. Slowed automatically for
  conditions that genuinely slow fat loss, so the date is one your body can meet.
- **Sagging, stretch marks, cellulite, loose skin, love handles, double chin,
  lower-belly pooch, posture** — each with what it actually is, what genuinely
  helps, the exercises, **what does nothing**, a timeline, and when the honest
  answer is a doctor rather than another year of trying. Nothing here promises
  to erase anything it can't.
- **Health conditions** — PCOS/PCOD, thyroid (both directions), insulin
  resistance, type 2 diabetes, blood pressure, cholesterol, fatty liver,
  anaemia, endometriosis, asthma, knee and back pain, IBS, reflux, gout, kidney
  disease, pregnancy, postpartum, menopause, coeliac, lactose intolerance and
  migraine. Tick them in Onboarding or Profile — or just type "PCOD and
  thyroid" and SAP picks it up from your own words.

**What ticking a condition actually changes** — it is not a label, it rewires
the app:

- Calorie target drops ~7% for hypothyroidism, because a slow thyroid really
  does burn less. Protein target rises to 1.6 g/kg for PCOS and menopause.
- Pregnancy switches the whole app off deficits — the target becomes
  maintenance regardless of what your goal says.
- Kidney disease **hides** the protein number on purpose. That one has to come
  from your doctor, not an app.
- Unsafe exercises disappear from your plans: no lunges or jumping with a knee
  problem, no sit-ups or Superman with a disc issue, no planks or supine work
  during pregnancy. The Workout tab names what it removed and why.
- Meal plans reorder — lower-GI and higher-protein options surface first for
  PCOS and insulin resistance, soy-sauce dishes thin out for high blood
  pressure. Nothing is hidden; you can still swap to anything.
- Coeliac disease hard-blocks gluten through the same filter as an allergy,
  because it causes intestinal damage rather than discomfort.
- Every condition carries its own **🚩 see a doctor for** list.

**Photo scan upgrade.** The AI now also rates every body region 0–3, estimates
your body fat visually, and flags sagging, stretch marks (new/red vs
mature/white — the stage decides whether treatment works at all) and muscle
definition. The 📐 Body scan hands the model your *measured* BMI and body fat %
up front, so it interprets real numbers instead of guessing them off a picture.

**Measurements.** Neck, chest, waist, hips, thigh and arm, in Onboarding,
Profile and Body. Each save keeps a dated snapshot, so the tape becomes a trend.
Neck + waist (+ hips for women) is what unlocks the accurate body fat method —
about two minutes of work for a much better number.

**The tape trend.** Measurements saved anywhere — Onboarding, Profile or Body —
land in the same dated history, and 📐 Body shows what each one has actually
done since the first time you recorded it ("Waist 95 → 90 cm, −5 cm in 64
days"). Two saves on the same day overwrite rather than stack, so a correction
doesn't count as progress. This is the number worth watching: a waist that drops
while the scale sits still means you lost fat and held muscle — the good version
of a plateau, and the one that makes people quit because the scale didn't move.

**The assistant knows all of it.** The ✨ AI tab now receives your health
conditions, measurements, body composition and the exact calorie and protein
targets the app is showing you — so it can't quote you a different calorie
number than the Diet tab, and it answers a PCOS question knowing you logged
PCOS. Where a condition means SAP deliberately sets no number (protein with
kidney disease), the assistant is told not to helpfully invent one either.

> Note for the owner: that last change touches `supabase/functions/ai-chat`.
> Run `supabase functions deploy ai-chat` once to pick it up. Everything else
> ships with the normal Vercel deploy.

## v6 — the deep scan, photo coaching, and a security pass

**🔬 Deep scan (📐 Body).** Reads every photo you have given SAP and rates 57
things across six groups — face skin (pores, blackheads, whiteheads, pimples,
acne scars, pigmentation, redness, oiliness, dryness, texture, tone evenness,
radiance, jawline), eyes (under-eye darkness, bags, puffiness, and *which kind*
of darkness it is — pigment, vascular or a hollow, because the three need
completely different things), body composition (definition, firmness, chest/arm/
abdominal laxity, a visual body-fat band), body skin (body acne, strawberry skin,
ingrown hairs, underarm darkness, tan lines, uneven tone, rash, hives, scars,
cellulite, dryness, body hair), hair (density, thickness, volume, curl pattern,
split ends, frizz, breakage, shine, hairline, part width, thinning pattern) and
scalp — where **oily scalp and dry scalp are now rated separately**, because they
are opposite problems with opposite treatments and one combined score could never
tell you which routine you needed.

Anything it cannot genuinely see it marks **unclear** instead of guessing, and it
shows you what percentage it could actually read. A low number is a photo
problem, not a verdict on your body.

**13 new guidance protocols** for what it finds — strawberry skin, ingrown hairs,
underarm darkness, uneven tone and tan lines, marks and scars, body acne, dry
skin, rash and hives, oily scalp, dry scalp, thinning hair, under-eye darkness —
each in the same shape as the rest of SAP: what it actually is, what genuinely
helps, **what does nothing**, a real timeline, and when the honest answer is a
doctor. Only findings rated moderate or worse surface a protocol; treating "mild"
is how an app turns a non-problem into a worry.

**📖 Photo coaching.** Every photo slot now has specific, physical instructions —
distance, lens height, angle, what to wear, and the single most common mistake
for that shot. Plus 17 rules that apply to all of them. This matters more than it
sounds: overhead light drops shadows into your eye sockets and under your jaw,
and the scan reads them as under-eye darkness and a slackening jawline. It would
hand you a plan for a problem you do not have.

**Automatic photo check.** Before a photo is saved, SAP measures its resolution,
sharpness, exposure, contrast and colour cast, and tells you plainly if it is
blurry, too dark, backlit, shot under yellow bulb light, or focused on the wall
behind you. It is always a warning and never a block — you can keep any photo you
want. Photos are also compressed less aggressively now (1280px for face and hair,
up from 720px), because telling you to shoot in HD was pointless while the app
immediately threw that detail away.

**Security.** A full adversarial audit found that the AI endpoint accepted the
public anon key and would run your Gemini key for anyone who viewed source — with
those requests invisible in your audit log. That, a missing rate limit, a
forgeable audit log and an SSRF in the reminder sender are all fixed. See
[SECURITY.md](SECURITY.md) for what was wrong, what was already safe, and what
you must deploy.

> **Owner: this release needs three things run once.**
> 1. Supabase → SQL Editor → run `supabase/schema-security.sql`
> 2. `supabase functions deploy ai-chat` and `supabase functions deploy send-reminders`
> 3. `supabase secrets set AI_ALLOWED_ORIGINS=https://your-app.vercel.app`
>
> Step 2 is the critical one.

Everything above is informative, not a medical assessment. For symptoms,
medication or anything health-critical, the app says see a doctor, and means it.
The deep scan reads normal clothed and fitness-wear photos only; it refuses
anything else and stores nothing when it does.
