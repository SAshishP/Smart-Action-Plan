// Skin & shape concerns: sagging, stretch marks, cellulite, loose skin.
//
// These are the things people actually search for at 1am and get sold garbage
// about. So every entry here is built the same way:
//
//   what it actually is  →  what genuinely helps  →  what does nothing
//   →  a realistic timeline  →  when the honest answer is a doctor
//
// Nothing here promises to erase anything. Where the real answer is "this does
// not fully reverse", it says so — because a plan built on a false promise is
// the one that gets abandoned in week three.

const K = (key, name, icon, o) => ({ key, name, icon, sexes: 'all', ...o })

export const CONCERNS = [
  K('breastsag', 'Breast sagging / lift', '🌸', {
    sexes: 'female',
    aliases: ['sagging breasts', 'saggy breasts', 'breast sag', 'ptosis', 'droopy breasts', 'breast lift', 'saggy chest'],
    what:
      'Breasts contain no muscle. Their position is held by skin elasticity and Cooper’s ligaments — and once those ligaments stretch, they do not shorten again. What changes with age, pregnancy, breastfeeding, weight swings and gravity is those two tissues, not muscle.',
    honest:
      'So the honest headline: no exercise lifts breast tissue itself. Anyone selling you a "natural breast lift" workout is selling you something. What training genuinely does is build the pectoral muscle behind the breast and pull the shoulders back — and that changes projection, height and the whole line of the chest visibly. It is a real improvement, achieved indirectly. A surgical lift is the only thing that repositions the tissue itself, and that is a legitimate choice, not a failure.',
    helps: [
      'Build the pec behind it — more muscle volume behind the breast pushes it forward and up. This is the single biggest visual change available without surgery',
      'Fix rounded shoulders. Posture alone changes apparent chest height more than most people expect, and it works the day you fix it',
      'A properly fitted bra. Around 8 in 10 women wear the wrong band size, and an unsupported band is a genuine contributor to ligament stretch over years — especially during exercise',
      'A real sports bra for any impact training. Non-negotiable if you run',
      'Lose weight slowly. Fast loss deflates the fat that gives breasts volume and leaves the skin behind',
      'Do not smoke — it destroys elastin directly, and this is one of the areas that shows it first',
      'Sunscreen on the chest. Sun damage to décolletage skin is cumulative, permanent and very visible',
      'Stay hydrated and eat enough protein and vitamin C — both are structural inputs for collagen',
    ],
    exercises: [
      { name: 'Incline dumbbell press', how: '30° incline, 8–12 reps × 4. The upper-chest fibres are the ones that lift the whole area — this is the most important movement on the list.' },
      { name: 'Push-ups (incline → flat → decline)', how: '3 sets close to failure. Start with hands on a table if needed, and lower the surface every couple of weeks.' },
      { name: 'Dumbbell fly', how: 'Slight elbow bend, wide arc, feel the stretch. 12 × 3. Builds the width of the pec.' },
      { name: 'Chest press machine or pec deck', how: '10–12 × 4 if you have gym access.' },
      { name: 'Band pull-aparts', how: '15 × 3 daily. Opens the shoulders — the posture half of the fix.' },
      { name: 'Face pulls', how: '15 × 3. Rear delts and upper back. Rounded shoulders collapse the chest forward; this undoes it.' },
      { name: 'Wall angels', how: 'Back flat to a wall, slide the arms up and down. 10 × 3. Free, and you can do it anywhere.' },
    ],
    doesNothing: [
      'Creams, oils and "firming" serums — nothing topical reaches ligament or restores it',
      'Ice massage, cold showers, "breast lift" massage routines',
      'Chest-focused ab-belt style devices',
      'Any food or supplement claiming to lift or firm',
    ],
    timeline: 'Pec development is visible at 8–12 weeks of real progressive lifting. Posture changes show within 2–4 weeks. Neither is instant, and both are permanent while you keep training.',
    doctor:
      'A plastic surgeon is the only route to actual repositioning (mastopexy), and it is a reasonable choice — especially after pregnancy or major weight loss. See a doctor sooner for: a new lump, skin dimpling or puckering, nipple discharge, or a change affecting only one side. Those are not cosmetic questions.',
  }),

  K('lovehandles', 'Love handles', '🫱', {
    aliases: ['love handles', 'muffin top', 'flanks', 'side fat'],
    what:
      'A subcutaneous fat pad over the obliques, just above the hip bone. Less of a health concern than belly fat — and considerably more stubborn, because these fat cells release fat more reluctantly.',
    honest:
      'There is no exercise that removes fat from this area. What works is the deficit for the fat, plus shoulder and glute development to change the waist-to-shoulder ratio — which is what actually makes a waist read as narrow.',
    helps: [
      'A moderate calorie deficit, held for long enough — this area is usually one of the last to change',
      'Build shoulders and glutes. Widening above and below narrows the middle visually, and it works immediately in a way fat loss does not',
      'Keep the obliques strong but do not load them heavily — a thick oblique widens the waist',
      'Sleep and alcohol both matter here more than people expect',
    ],
    exercises: [
      { name: 'Side plank with hip dip', how: '10 each side × 3.' },
      { name: 'Suitcase carry', how: 'One heavy dumbbell, 30 steps tall without leaning. 3 rounds each side.' },
      { name: 'Pallof press', how: 'Band or cable at chest height, press straight out and resist the twist. 12 each side × 3. Anti-rotation beats rotation for a lean waist.' },
      { name: 'Lateral raises', how: '15 × 4. Wider shoulders, narrower-looking waist. The fastest visual win available.' },
      { name: 'Hip thrusts', how: '10–12 × 4. Same logic from below.' },
    ],
    doesNothing: [
      'Weighted side bends and heavy Russian twists — they build the muscle that widens the waist',
      'Waist trainers and sweat belts — they move water, not fat, and can restrict breathing',
      'Any "melt the muffin top" workout',
    ],
    timeline: '10–16 weeks for the fat. Shoulder and glute work changes the silhouette in 6–8 weeks.',
    doctor: 'Nothing medical here — but if you are lean everywhere else and this pad has not moved in a year, that is what CoolSculpting and liposuction exist for. Discuss with a dermatologist rather than a clinic that only sells one thing.',
  }),

  K('stretchmarks', 'Stretch marks', '🌊', {
    aliases: ['stretch marks', 'striae', 'stretchmarks', 'tiger stripes'],
    what:
      'Tears in the dermis — the middle layer of skin — from rapid stretching during growth spurts, pregnancy, fast weight change or fast muscle gain. Steroid use and Cushing’s also cause them. Around 8 in 10 people have them somewhere.',
    honest:
      'Two stages, and the stage decides everything. Red or purple marks (striae rubrae) are new, still have blood supply, and genuinely respond to treatment. White or silver marks (striae albae) are mature scar tissue — those fade slowly on their own and no cream will erase them. Anything promising to remove old white marks is lying to you. Treatment can make them significantly less visible; nothing makes them disappear.',
    helps: [
      'Treat them while they are still red — this window is the whole ballgame, and it lasts roughly 6–12 months',
      'Tretinoin (prescription retinoid) applied to red marks has the strongest evidence of any topical. Not during pregnancy or breastfeeding',
      'Centella asiatica (gotu kola) and hyaluronic acid have modest but real supporting trial data',
      'Massage the cream in for several minutes rather than dabbing it — the massage is doing part of the work',
      'Keep the skin genuinely moisturised, especially during pregnancy or any rapid weight change',
      'Change weight gradually — 0.5–0.75 kg a week gives skin time to adapt, which prevents new marks',
      'Protect them from sun. Marks do not tan, so they show more against tanned skin, permanently',
      'Vitamin C, zinc and protein — the raw materials for collagen repair',
    ],
    exercises: [
      { name: 'Strength training', how: 'Filling the area with muscle stretches the skin taut, which visibly flattens marks. Works especially well on thighs, hips and arms.' },
      { name: 'Steady pacing', how: 'The single most effective preventive measure for new marks — do not gain or lose fast.' },
    ],
    doesNothing: [
      'Cocoa butter, olive oil, vitamin E oil, almond oil — all tested, all no better than plain moisturiser at prevention',
      'Any cream claiming to erase mature white marks',
      'Lemon, toothpaste, sugar scrubs and other home remedies — several of these damage skin',
      'Waiting. The window where treatment works is while they are still red',
    ],
    timeline: 'Red marks: 3–6 months of consistent treatment for meaningful fading. White marks: they slowly become less noticeable over years, and clinical treatment gets you further than time will.',
    doctor:
      'A dermatologist has the tools that genuinely work on mature marks: microneedling, fractional laser, radiofrequency — typically 3–6 sessions for a 30–60% improvement in appearance. Worth a real consultation. See a doctor promptly instead if marks appear suddenly without weight or growth change, especially with easy bruising or a rounder face — that combination can point to a hormonal cause worth investigating.',
  }),

  K('cellulite', 'Cellulite', '🌾', {
    aliases: ['cellulite', 'orange peel', 'dimpling', 'cottage cheese skin'],
    what:
      'Fat pushing up between vertical bands of connective tissue that tether skin to muscle. Women’s bands run vertically and men’s run in a criss-cross — which is the entire reason 80–90% of women have cellulite and very few men do. It is a structural difference, not a fitness one.',
    honest:
      'Cellulite is not a sign of being unfit or overweight. Lean athletes have it. Teenagers have it. It is normal female anatomy, and there is no cure — only degrees of reduced appearance. Anyone selling a cure is selling a lie, and an expensive one.',
    helps: [
      'Build muscle underneath, especially glutes and hamstrings. Filling the space smooths the surface — the most reliable non-clinical improvement available',
      'Lower body fat somewhat. Less fat pushing through means shallower dimples',
      'Stay hydrated and eat enough protein for skin quality',
      'Do not smoke — it degrades the connective tissue directly',
      'Retinol creams thicken the skin slightly over 6+ months. Modest, real, slow',
      'Caffeine creams tighten temporarily for a few hours. Fine for an event, useless as a strategy',
    ],
    exercises: [
      { name: 'Hip thrusts', how: '10–12 × 4. The single best glute builder — and glutes are where this matters most.' },
      { name: 'Romanian deadlifts', how: '10 × 4. Hamstrings, the other half of the shape.' },
      { name: 'Bulgarian split squats', how: '8–10 each leg × 3.' },
      { name: 'Step-ups', how: '12 each leg × 3.' },
      { name: 'Walking and stair climbing', how: 'Daily. Circulation and general leg conditioning.' },
    ],
    doesNothing: [
      'Dry brushing, cupping, foam rolling and lymphatic massage — pleasant, temporary at best',
      'Detox teas, waist trainers, and every "cellulite diet"',
      'Any cream promising removal',
      'Losing more weight than is healthy for you — very lean people still have cellulite',
    ],
    timeline: '3–6 months of consistent lower-body strength training for a visible smoothing. It reduces; it does not vanish.',
    doctor:
      'Clinical options with real evidence exist and they are the only things that treat the actual cause: Cellfina and subcision cut the tethering bands, Qwo is an injectable that dissolves them, and radiofrequency plus acoustic wave therapy help modestly. A dermatologist is the right person to ask — not a spa.',
  }),

  K('looseskin', 'Loose skin after weight loss', '🎈', {
    aliases: ['loose skin', 'saggy skin', 'skin apron', 'excess skin', 'hanging skin'],
    what:
      'Skin stretched for a long time loses elastin. After significant fat loss it does not always retract — and how much it does depends on how long you carried the weight, your age, genetics, sun exposure and smoking history. Very little of it is under your control.',
    honest:
      'A crucial distinction first: in the first 6–12 months after weight loss, most of what looks like loose skin is actually residual subcutaneous fat that has not gone yet. Give it time before concluding anything. True loose skin, after real time, does not come back with exercise — and after major weight loss, surgery is the only thing that removes it. That is not a failure of your effort. It is a skin problem, not a fat problem.',
    helps: [
      'Lose weight at 0.5–0.75 kg a week rather than crashing — the single biggest controllable factor',
      'Build muscle in the area. Filling the space from underneath is the only "natural" fix that does anything measurable',
      'Wait 12–18 months at your goal weight before judging. Skin retracts slowly and most people quit judging too early',
      'Protein 1.6 g/kg, vitamin C, zinc, collagen or gelatin — the raw materials, worth having in place',
      'Hydration and daily moisturiser',
      'Strict sun protection and no smoking — both destroy the elastin you are hoping will do the work',
    ],
    exercises: [
      { name: 'Progressive strength training', how: '3–4×/week, whole body. The only thing that fills the space. Prioritise the areas that bother you most.' },
      { name: 'Eat at maintenance while building', how: 'Once you are at goal weight, stop dieting. You cannot build the muscle that fills skin while in a deficit.' },
    ],
    doesNothing: [
      'Firming creams, wraps and "skin tightening" oils',
      'Cold showers and dry brushing',
      'Collagen supplements alone, without training — the evidence is weak and it is not a shortcut',
      'Waiting while still losing weight — judge the skin only once the weight is stable',
    ],
    timeline: 'Skin retraction continues for 12–24 months after weight stabilises. Muscle filling: 6–12 months of serious training.',
    doctor:
      'After losing 30 kg or more, excess skin is usually surgical — abdominoplasty, brachioplasty, body lift. Many people find it medically necessary rather than cosmetic when skin folds cause rashes, infections or restrict movement, and it is sometimes covered for that reason. A plastic surgeon consultation is information, not a commitment.',
  }),

  K('doublechin', 'Double chin', '😌', {
    aliases: ['double chin', 'submental fat', 'chin fat', 'neck fat', 'jawline'],
    what:
      'Three separate causes get called the same thing: submental fat, fluid retention, and forward-head posture that shortens and slackens the neck line. Genetics decide a lot of it — plenty of lean people have one.',
    honest:
      'Facial exercises do not burn facial fat. Nothing burns fat in one place. But posture is a genuinely large component here, and posture you can fix in weeks.',
    helps: [
      'Overall fat loss — the face is often the first place it shows, usually within 4–6 weeks',
      'Fix forward-head posture. Chin tucks daily. A surprising share of "double chins" is a neck position problem',
      'Cut evening sodium and alcohol — a lot of morning chin fullness is water',
      'Sleep on your back with the head slightly raised',
      'Raise your screen to eye level. Looking down at a phone all day is what created the posture in the first place',
    ],
    exercises: [
      { name: 'Chin tucks', how: 'Glide the chin straight back to make a double chin deliberately, hold 5s. 10 × 3 daily. Strengthens the deep neck flexors that hold the head up.' },
      { name: 'Wall posture check', how: 'Heels, hips, upper back and head against a wall. Hold 30s × 3.' },
      { name: 'Cardio', how: '150+ min a week. This is the part that actually reduces the fat.' },
    ],
    doesNothing: [
      '"Face yoga", jaw exercisers and chewing gum — gum builds the masseter, which widens the jaw rather than sharpening it',
      'Chin straps and facial slimming devices',
      'Face rollers for fat (they do move fluid temporarily, which is a different and much smaller claim)',
    ],
    timeline: 'Water: 3–7 days. Posture: 3–6 weeks. Fat: 8–16 weeks depending on the overall deficit.',
    doctor: 'Kybella (deoxycholic acid injections) dissolves submental fat and is FDA-approved. Submental liposuction is the other route. Both are dermatologist territory.',
  }),

  K('batwings', 'Upper-arm sagging', '👋', {
    sexes: 'female',
    aliases: ['bat wings', 'batwings', 'saggy arms', 'flabby arms', 'arm sag', 'underarm'],
    what: 'Fat over the triceps plus skin laxity. Extremely common, extremely responsive — this is one of the more fixable items on the whole list.',
    honest:
      'Light-weight "toning" does nothing. The tricep is two thirds of your upper arm and it needs real load to grow. Build it, lose the fat, and the arm changes shape faster than almost anywhere else on the body.',
    helps: [
      'Train triceps with actual weight — 8–12 reps that are genuinely hard by the last one',
      'Train the whole arm and shoulder: rear delts and lats change the line of the upper arm too',
      'Overall fat loss',
      'Fix posture — rounded shoulders rotate the arm inward and make it look worse than it is',
    ],
    exercises: [
      { name: 'Overhead tricep extension', how: '12 × 3. Hits the long head, which is the part that fills the back of the arm.' },
      { name: 'Close-grip push-ups', how: 'Hands under the chest, elbows tucked. 8–12 × 3.' },
      { name: 'Chair dips', how: '10–15 × 3, elbows pointing straight back.' },
      { name: 'Cable pushdowns', how: '12–15 × 3 if you have a gym.' },
      { name: 'Dumbbell rows', how: '10 × 3. Back development changes the whole upper-arm line.' },
    ],
    doesNothing: [
      '1 kg dumbbells for 50 reps — that is cardio for the arms, not a growth stimulus',
      'Arm wraps and sweat sleeves',
      'Any "arm slimming" routine that never increases the weight',
    ],
    timeline: '8–12 weeks for visible change. One of the faster wins available.',
    doctor: 'After major weight loss, brachioplasty (an arm lift) is the surgical option — it leaves a scar along the inner arm, which is worth knowing before you decide.',
  }),

  K('bellypooch', 'Lower belly pooch', '🤍', {
    aliases: ['lower belly', 'pooch', 'mummy tummy', 'belly overhang', 'apron belly', 'fupa', 'diastasis'],
    what:
      'Four different things present identically here: lower-belly subcutaneous fat, bloating, an anterior pelvic tilt pushing the abdomen forward, and diastasis recti — a separation of the abdominal muscles that is very common after pregnancy.',
    honest:
      'The fix depends entirely on which one it is, and this is where most people go wrong. If it is diastasis recti, crunches and planks make it measurably worse. Check first, then train.',
    helps: [
      'Check for diastasis recti before any core programme: lie on your back, knees bent, one hand behind your head. Lift your head slightly and press the fingers of the other hand just above and below the belly button. Feel for a gap. More than 2 finger-widths wide, or a soft area with no tension, means start with rehab, not crunches',
      'If there is a gap: diaphragmatic breathing, deep transverse-abdominis work, heel slides and dead bugs. A pelvic-floor physiotherapist is genuinely worth the appointment',
      'If it is an anterior pelvic tilt: stretch the hip flexors, strengthen glutes and deep core. The belly moves back within weeks',
      'If it is bloating: look at meal size, fibre changes, food triggers and gut health rather than at the gym',
      'If it is fat: the deficit, and patience — the lower belly is genuinely one of the last places to change',
    ],
    exercises: [
      { name: 'Diaphragmatic breathing', how: 'Lie down, hand on the belly, breathe into the hand for 4s, out for 6s. 5 min daily. The foundation of every core rehab programme, and the step everyone skips.' },
      { name: 'Dead bug', how: '8 each side × 3, lower back pressed flat throughout.' },
      { name: 'Heel slides', how: 'On your back, slide one heel out and back while the core stays braced. 10 each side × 3.' },
      { name: 'Glute bridge', how: '12 × 3 with a 2s squeeze. Fixes the pelvic tilt half.' },
      { name: 'Pallof press', how: '12 each side × 3. Deep-core work with no spinal flexion — safe with a diastasis.' },
      { name: 'Hip flexor stretch', how: 'Half-kneeling, tuck the tailbone, 30s each side × 2.' },
    ],
    doesNothing: [
      'Crunches and sit-ups if you have a diastasis — they actively widen the gap',
      'Waist trainers and belly binders as a fix (a short-term postpartum support band from a physio is a different thing)',
      '"Flat tummy" teas and detox anything',
    ],
    timeline: 'Pelvic tilt: 4–8 weeks. Diastasis rehab: 3–6 months of consistent work. Fat: 12–20 weeks.',
    doctor:
      'See a pelvic-floor physiotherapist for any postpartum core work — this is the most underused and most effective referral in this entire app. A gap that has not closed after 12 months of proper rehab is sometimes surgically repaired.',
  }),

  K('posture', 'Posture-driven shape', '🧍', {
    aliases: ['posture', 'rounded shoulders', 'hunchback', 'forward head', 'slouch', 'kyphosis'],
    what: 'Sitting, phones and desks shorten the front of the body and weaken the back of it. The result reads as a heavier, shorter, less defined silhouette than your actual body composition.',
    honest:
      'This is the fastest visual change available to anyone — it changes how you look immediately, before a gram of fat moves. It is also the most neglected.',
    helps: [
      'Pull twice as much as you push in every training week',
      'Stand up every 45 minutes. A timer works better than intent',
      'Screen top at eye height. Phone up to your face, not your face down to your phone',
      'Stretch the chest and hip flexors, strengthen the upper back and glutes',
    ],
    exercises: [
      { name: 'Band pull-aparts', how: '15 × 3 daily.' },
      { name: 'Face pulls', how: '15 × 3.' },
      { name: 'Wall angels', how: '10 × 3.' },
      { name: 'Doorway chest stretch', how: '30s each side × 3.' },
      { name: 'Chin tucks', how: '10 × 3.' },
      { name: 'Hip flexor stretch', how: '30s each side × 2.' },
    ],
    doesNothing: ['Posture-corrector braces worn passively — they let the muscles switch off and weaken further', 'Just "remembering" to sit up straight without strengthening anything'],
    timeline: 'Visible in 2–4 weeks. Habitual in about 8.',
    doctor: 'A physiotherapist for pain, numbness, or a curve that looks asymmetric from behind — that last one is worth ruling out scoliosis.',
  }),
]

const byKey = Object.fromEntries(CONCERNS.map((c) => [c.key, c]))
export const getConcern = (key) => byKey[key] || null

// Concerns that apply to this profile's gender.
export function pickableConcerns(profile = {}) {
  const g = String(profile.gender || '').toLowerCase()
  return CONCERNS.filter((c) => c.sexes === 'all' || c.sexes === g)
}

// Match free text (from the photo scan, or the user's own words) to a concern.
export function concernKeyFor(text) {
  const t = String(text).toLowerCase().trim()
  if (!t) return null
  const hit = CONCERNS.find((c) => c.key === t || c.aliases.some((a) => t === a || t.includes(a)))
  return hit ? hit.key : null
}

// What SAP should show this user, and why it picked each one:
//   - anything the photo scan flagged (analysis.concerns)
//   - anything they ticked themselves (profile.concerns)
//   - anything their situation implies (postpartum → belly pooch, and so on)
export function activeConcerns(profile = {}) {
  const a = profile.analysis || {}
  const out = new Map()
  const add = (key, why) => {
    const c = byKey[key]
    if (!c) return
    if (c.sexes !== 'all' && c.sexes !== String(profile.gender || '').toLowerCase()) return
    if (!out.has(key)) out.set(key, { ...c, why })
  }

  for (const raw of a.concerns || []) {
    const k = concernKeyFor(raw)
    if (k) add(k, 'Flagged in your photo analysis')
  }
  for (const k of profile.concerns || []) add(k, 'You added this yourself')

  const cond = new Set(profile.conditions || [])
  if (cond.has('postpartum')) {
    add('bellypooch', 'Standard after delivery — check for diastasis before any core work')
    add('stretchmarks', 'Common after pregnancy')
    add('looseskin', 'Common after pregnancy')
  }
  if (cond.has('pregnancy')) add('stretchmarks', 'Worth preventing now rather than treating later')
  if (cond.has('menopause')) add('breastsag', 'Falling oestrogen affects skin elasticity')

  for (const p of a.posture || []) {
    if (p) add('posture', 'From your posture analysis')
  }

  return [...out.values()]
}

// Everything not currently shown — offered as "anything else you want help
// with?" so nobody has to go hunting for the topic they actually came for.
export function otherConcerns(profile = {}) {
  const active = new Set(activeConcerns(profile).map((c) => c.key))
  return pickableConcerns(profile).filter((c) => !active.has(c.key))
}
