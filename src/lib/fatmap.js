// Where your body stores fat — and what actually changes each area.
//
// A region's level comes from three sources, best first:
//   1. the AI photo read (analysis.fatMap: { belly: 3, thighs: 1, … })
//   2. your tape measurements (waist-to-hip decides android vs gynoid)
//   3. the older analysis.fatAreas list, so accounts from before this feature
//      still get a map instead of an empty screen
//
// The honest framing runs through every entry: you cannot choose where fat
// leaves from. The deficit decides how much comes off; genetics and hormones
// decide the order. What targeted work *does* do is build the muscle under the
// area, which changes the shape once the fat is gone — and that is worth doing
// for real reasons, not as a spot-reduction promise.

export const REGIONS = [
  {
    key: 'belly',
    name: 'Belly / abdomen',
    icon: '🎯',
    aliases: ['belly', 'stomach', 'abdomen', 'tummy', 'abs', 'midsection', 'lower belly'],
    stores:
      'Visceral fat sits behind the abdominal wall, around your organs. It is driven by calorie surplus, poor sleep, chronic stress, alcohol and insulin resistance more than by any specific food.',
    good:
      'It is metabolically active fat, which is exactly why it responds fastest. Belly fat is usually the first thing to visibly change once a deficit starts.',
    exercises: ['plank', 'sideplank', 'mountainclimber', 'deadbug', 'birddog', 'walk'],
    extra: [
      { name: 'Dead bug', how: 'On your back, arms up, knees at 90°. Lower the opposite arm and leg slowly while your lower back stays glued to the floor. 8 each side × 3.' },
      { name: 'Hollow-body hold', how: 'On your back, press the lower back down, lift shoulders and legs slightly. Hold 20–30s × 3. Harder than it looks.' },
      { name: 'Post-meal walk', how: '10–15 min after your largest meal. This is the highest-return belly-fat habit in the whole app, and it costs you nothing.' },
    ],
    habits: [
      'Sleep 7–9 hours — under 6 hours raises cortisol and visceral fat storage independently of what you eat',
      'Alcohol goes to the middle first. Cutting it alone visibly changes waistlines',
      'Protein and fibre at every meal — the fullness does the calorie work for you',
    ],
    myth: 'Crunches burn about 5 kcal a minute and burn fat from nowhere in particular. They build the muscle that shows once the fat is gone — that is the real reason to do them.',
    timeline: 'Waist usually drops 2–4 cm in the first 6–8 weeks of a consistent deficit — often before the scale moves much.',
  },
  {
    key: 'lovehandles',
    name: 'Love handles / flanks',
    icon: '🫱',
    aliases: ['love handles', 'flanks', 'muffin top', 'obliques', 'sides', 'hip fat'],
    stores:
      'The flank pad sits over the obliques, just above the hip bone. It is subcutaneous fat, so it is less of a health issue than belly fat — and stubbornly slower to shift.',
    good:
      'Building the obliques and the glute-medius underneath narrows the visual line of the waist even before the fat pad is gone.',
    exercises: ['sideplank', 'mountainclimber', 'farmer', 'dbrow', 'walk', 'burpee'],
    extra: [
      { name: 'Side plank with hip dips', how: 'Hold a side plank, lower the hip a few inches and drive it back up. 10 each side × 3.' },
      { name: 'Suitcase carry', how: 'One heavy dumbbell in one hand, walk 30 steps tall without leaning. Switch. The obliques work hard to stop you tipping.' },
      { name: 'Standing side bend (bodyweight only)', how: 'Reach one hand down the side of the leg, return tall. 15 each side. Skip the weight — loading this thickens the waist.' },
    ],
    habits: [
      'This is one of the last areas to go for most people. Patience is genuinely the technique here',
      'Keep the deficit moderate — an aggressive one costs you the muscle that shapes the waist',
    ],
    myth:
      'Weighted side bends do not burn flank fat. They build the obliques, which for a narrow waist is the opposite of what you want — keep this area lean and unloaded, and shape the shoulders and glutes instead to make the waist look smaller.',
    timeline: 'Typically visible change at 10–16 weeks — noticeably behind the belly.',
  },
  {
    key: 'thighs',
    name: 'Thighs',
    icon: '🦵',
    aliases: ['thighs', 'legs', 'quads', 'inner thigh', 'upper legs'],
    stores:
      'Oestrogen directs fat toward the thighs and hips, which is why this pattern is far more common in women. These fat cells have more alpha-2 receptors — they release fat more reluctantly than belly fat does.',
    good:
      'Metabolically, this is the safest place to store fat. It is protective, not dangerous. And leg muscle is the biggest calorie-burning tissue you own.',
    exercises: ['squat', 'lunge', 'goblet', 'legpress', 'legcurl', 'cycle', 'dbrdl'],
    extra: [
      { name: 'Bulgarian split squat', how: 'Back foot on a chair, drop the back knee straight down. 8–10 each leg × 3. Brutal, and the single best leg builder here.' },
      { name: 'Step-ups', how: 'Onto a knee-height step, drive through the whole foot, control the way down. 12 each leg × 3.' },
      { name: 'Incline walking', how: '15° treadmill incline or a real hill, 25–30 min. Burns well and shapes the legs without pounding the knees.' },
    ],
    habits: [
      'Train legs heavy — bigger quads and glutes change the leg line far more than "toning" ever will',
      'Do not fear leg work making you bulky. Building visible leg muscle takes years of deliberate effort',
    ],
    myth: 'Inner-thigh machines and "thigh gap" routines do not reduce thigh fat. Nothing does, locally. The deficit does it, the leg training shapes what is underneath.',
    timeline: 'Usually 12–20 weeks. This is the slow one — expect the upper body to change first, sometimes by months.',
  },
  {
    key: 'hips',
    name: 'Hips & glutes',
    icon: '🍑',
    aliases: ['hips', 'glutes', 'butt', 'seat', 'saddlebags', 'buttocks'],
    stores: 'The classic oestrogen-driven storage site, along with the thighs. Very responsive to muscle building, very slow to release fat.',
    good: 'The most trainable area on the body for shape. Glute development changes a silhouette faster than fat loss does.',
    exercises: ['glutebridge', 'squat', 'dbrdl', 'lunge', 'legpress', 'goblet'],
    extra: [
      { name: 'Hip thrust', how: 'Upper back on a sofa edge, weight across the hips, drive up and squeeze hard for 2s. 10–12 × 4. The single best glute builder there is.' },
      { name: 'Cable or band kickback', how: 'Drive the heel straight back, squeeze, control the return. 15 each side × 3.' },
      { name: 'Lateral band walk', how: 'Band above the knees, small side steps in a half-squat, 20 each direction × 3. Hits the glute-medius that shapes the upper hip.' },
    ],
    habits: ['Progressive overload matters more here than anywhere — add weight or reps every week', 'Protein 1.6 g/kg, or you are training without materials'],
    myth: 'You cannot slim the hips selectively. You can build the glute above them, which changes the whole shape of the area — and that works far faster than waiting for fat loss.',
    timeline: 'Visible glute shape in 8–12 weeks of real progressive lifting. Fat loss from here: 4–6 months.',
  },
  {
    key: 'arms',
    name: 'Arms',
    icon: '💪',
    aliases: ['arms', 'upper arms', 'triceps', 'bat wings', 'biceps', 'underarm'],
    stores: 'The back-of-arm (tricep) fat pad is a common early storage site and one of the more responsive ones.',
    good: 'Arms respond quickly to both fat loss and training — this is usually one of the first places people notice change.',
    exercises: ['tricepdip', 'pushup', 'dbcurl', 'dbext', 'pushdown', 'dbpress'],
    extra: [
      { name: 'Close-grip push-up', how: 'Hands under the chest, elbows tucked to the ribs. 8–12 × 3. The best bodyweight tricep builder.' },
      { name: 'Overhead tricep extension', how: 'One dumbbell in both hands overhead, lower behind the head, extend. 12 × 3. Hits the long head — the part that fills the back of the arm.' },
      { name: 'Band pull-apart', how: '15 × 3. Not an arm move, but it fixes the rounded shoulders that make arms look worse than they are.' },
    ],
    habits: ['Train the triceps twice as much as the biceps — they are two thirds of the arm', 'Posture changes how arms look instantly, before any fat moves'],
    myth: 'Tricep kickbacks with a 1 kg weight do not "tone" anything. Build real tricep mass with load, lose fat with the deficit — those are two separate jobs and both are needed.',
    timeline: '8–12 weeks for visible change, faster than most areas.',
  },
  {
    key: 'chest',
    name: 'Chest',
    icon: '🫁',
    aliases: ['chest', 'pecs', 'breast', 'man boobs', 'moobs', 'gynecomastia', 'bust'],
    stores:
      'Chest fat sits over the pectoral muscle. In men, persistent firm tissue under the nipple can be gynecomastia — actual glandular tissue, which is hormonal and does not respond to training or dieting at all.',
    good: 'Fat over the pec responds normally to a deficit, and pec development lifts the whole area visually.',
    exercises: ['pushup', 'inclinepushup', 'dbbench', 'chestpress', 'pecdeck', 'dbrow'],
    extra: [
      { name: 'Incline press', how: 'Bench or dumbbells at a 30° incline, 8–12 × 4. Builds the upper chest, which is what lifts the area.' },
      { name: 'Push-up to failure ladder', how: '3 sets, each one taken close to failure. Progress to decline push-ups over the weeks.' },
    ],
    habits: ['Rows and rear-delt work alongside pressing — rounded shoulders make any chest look worse'],
    myth:
      'If it is soft and shrinks as you lean out, it is fat and training helps. If it is a firm disc directly under the nipple that has not moved despite real fat loss, that is glandular and only a doctor can address it — worth an actual appointment rather than another year of push-ups.',
    timeline: 'Fat: 10–14 weeks. Glandular tissue: never, without medical treatment.',
  },
  {
    key: 'back',
    name: 'Back',
    icon: '🔙',
    aliases: ['back', 'bra bulge', 'upper back', 'lower back fat', 'lats'],
    stores: 'Back fat sits in folds that get emphasised by rounded posture and by anything tight across the area.',
    good: 'Lat and upper-back development is the fastest visual fix on the whole body — a wider back makes the waist look smaller immediately.',
    exercises: ['dbrow', 'latpulldown', 'seatedrow', 'superman', 'birddog'],
    extra: [
      { name: 'Face pulls', how: 'Rope to the face, elbows high, squeeze the rear delts. 15 × 3. Fixes posture and fills out the upper back.' },
      { name: 'Lat pullover', how: 'Dumbbell over the chest, arc back over the head with straight-ish arms. 12 × 3.' },
      { name: 'Well-fitted underwear', how: 'Not an exercise, but a band that is too tight creates most of what people call "bra bulge". Get sized properly — it is the fastest fix on this list.' },
    ],
    habits: ['Pull twice as often as you push', 'Stand every 45 minutes — a rounded upper back exaggerates every fold'],
    myth: 'There is no back-fat exercise. There is a stronger back, better posture, and a deficit — those three together transform the area.',
    timeline: '10–16 weeks, with posture improvements visible far sooner.',
  },
  {
    key: 'face',
    name: 'Face & chin',
    icon: '😊',
    aliases: ['face', 'chin', 'double chin', 'cheeks', 'jawline', 'neck fat', 'submental'],
    stores: 'Facial fullness comes from three separate things: body fat, water retention from sodium and alcohol, and genetic buccal fat that never leaves.',
    good: 'The face is often the first place people notice fat loss — usually within the first 4–6 weeks.',
    exercises: ['walk', 'cycle', 'treadmill'],
    extra: [
      { name: 'Cut evening sodium', how: 'Most "puffy face" is overnight water. Less salt at dinner plus proper hydration visibly changes the morning face within a week.' },
      { name: 'Sleep on your back, head slightly raised', how: 'Reduces the morning fluid pooling that makes the face look heavier than it is.' },
      { name: 'Chin tucks', how: '10 × 3 daily. This will not burn chin fat — but it strengthens the deep neck flexors, and the forward-head posture it fixes is what creates half of all "double chins".' },
    ],
    habits: ['Alcohol and late salty food show on the face by morning — more than anywhere else on the body', 'Photograph in the same light: face changes are easy to miss in a mirror you see daily'],
    myth: '"Face yoga" and jaw exercisers do not burn facial fat. Chewing gum builds masseter muscle, which makes the jaw look wider, not sharper. Overall fat loss and less sodium are the entire honest answer.',
    timeline: 'Water changes in 3–7 days. Real facial fat loss at 4–8 weeks.',
  },
  {
    key: 'calves',
    name: 'Calves & ankles',
    icon: '🦶',
    aliases: ['calves', 'ankles', 'lower legs', 'cankles'],
    stores: 'Mostly muscle and fluid rather than fat. Persistent ankle swelling is usually circulation or fluid, not body fat.',
    good: 'Calves shape up fast with direct work and respond well to walking.',
    exercises: ['calfraise', 'walk', 'cycle', 'treadmill'],
    extra: [
      { name: 'Standing calf raise', how: 'Full range off a step, 2s down. 15 × 4.' },
      { name: 'Legs up the wall', how: '10 min in the evening — genuinely reduces fluid pooling after a day of standing.' },
    ],
    habits: ['Move every hour if you stand or sit all day'],
    myth: 'Ankle fat is rarely fat. If one ankle swells more than the other, or swelling is new and persistent, get it looked at rather than trained.',
    timeline: 'Fluid: days. Muscle shape: 8–12 weeks.',
  },
]

const byKey = Object.fromEntries(REGIONS.map((r) => [r.key, r]))
export const getRegion = (key) => byKey[key] || null

export const LEVELS = ['none', 'light', 'moderate', 'high']

// Match a free-text area name the AI (or an old profile) used to a region key.
export function regionKeyFor(text) {
  const t = String(text).toLowerCase().trim()
  if (!t) return null
  const hit = REGIONS.find((r) => r.key === t || r.aliases.some((a) => t === a || t.includes(a)))
  return hit ? hit.key : null
}

// Build the map. Returns every region sorted worst-first, each with a 0–3
// level, where that level came from, and the full protocol.
export function fatMap(profile = {}, metrics = null) {
  const a = profile.analysis || {}
  const fromAI = a.fatMap && typeof a.fatMap === 'object' ? a.fatMap : {}
  const legacy = Array.isArray(a.fatAreas) ? a.fatAreas : []

  // Tape measurements say which *pattern* the body follows, which fills in
  // regions the photo could not judge.
  const whr = metrics?.ratios?.find((r) => r.key === 'whr')
  const pattern = whr?.shape || null
  const waistRow = metrics?.ratios?.find((r) => r.key === 'waist')
  const waistHigh = waistRow ? waistRow.tone !== 'good' : false

  const rows = REGIONS.map((r) => {
    let level = 0
    let source = null

    const ai = Number(fromAI[r.key])
    if (Number.isFinite(ai) && ai >= 0) {
      level = Math.min(3, Math.max(0, Math.round(ai)))
      source = 'photo'
    }

    if (source == null && legacy.some((x) => regionKeyFor(x) === r.key)) {
      level = 2
      source = 'photo'
    }

    // Measurements can only raise a level, never lower a photo read.
    if (pattern === 'apple' && (r.key === 'belly' || r.key === 'lovehandles') && level < 2) {
      level = 2
      source = source || 'measurements'
    }
    if (pattern === 'pear' && (r.key === 'thighs' || r.key === 'hips') && level < 2) {
      level = 2
      source = source || 'measurements'
    }
    if (waistHigh && r.key === 'belly' && level < 2) {
      level = 2
      source = source || 'measurements'
    }

    return { ...r, level, levelLabel: LEVELS[level], source, pct: (level / 3) * 100 }
  })

  const ranked = [...rows].sort((a2, b2) => b2.level - a2.level)
  const focus = ranked.filter((r) => r.level >= 2)

  return {
    regions: ranked,
    focus,
    pattern,
    rated: rows.some((r) => r.source),
    headline: focus.length
      ? `Your fat sits mainly at: ${focus.map((f) => f.name.toLowerCase()).join(', ')}.`
      : 'Not enough data yet to map where your fat sits — run the body scan, or add your waist and hip measurements.',
    truth:
      'Read this as a map, not a menu. You do not get to pick where fat leaves from — the calorie deficit decides how much goes, and your genes and hormones decide the order. What the targeted work below does is build the muscle underneath, so that when the fat does go, there is a shape there worth seeing.',
  }
}

// Everything the user should do for one region, assembled from the exercise
// library plus this file's extras. exerciseIndex is EXERCISES keyed by id;
// blockedIds comes from conditions.js so an injury never gets prescribed into.
export function regionProtocol(regionKey, exerciseIndex = {}, blockedIds = new Set()) {
  const r = byKey[regionKey]
  if (!r) return null
  const moves = r.exercises.map((id) => exerciseIndex[id]).filter(Boolean).filter((e) => !blockedIds.has(e.id))
  const removed = r.exercises.filter((id) => blockedIds.has(id)).map((id) => exerciseIndex[id]?.name).filter(Boolean)
  return { ...r, moves, removed }
}
