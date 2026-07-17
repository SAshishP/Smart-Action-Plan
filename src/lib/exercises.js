// Exercise library + plan builder.
// equip: 'home' (no equipment) · 'db' (dumbbells) · 'gym' (machines/full gym)
// Muscle ids match the 3D body: chest, shoulders, biceps, triceps, forearms,
// abs, obliques, lats, traps, lowerback, glutes, quads, hamstrings, calves, cardio

export const MUSCLE_NAMES = {
  chest: 'Chest', shoulders: 'Shoulders', biceps: 'Biceps', triceps: 'Triceps',
  forearms: 'Forearms', abs: 'Abs', obliques: 'Obliques', lats: 'Back (lats)',
  traps: 'Traps', lowerback: 'Lower back', glutes: 'Glutes', quads: 'Quads',
  hamstrings: 'Hamstrings', calves: 'Calves', cardio: 'Full body / cardio',
}

const E = (id, name, equip, primary, secondary, kcalMin, steps, dos, donts) =>
  ({ id, name, equip, primary, secondary, kcalMin, steps, dos, donts })

export const EXERCISES = [
  // ---- home / bodyweight ----
  E('pushup', 'Push-ups', 'home', ['chest'], ['triceps', 'shoulders', 'abs'], 8,
    ['Hands under shoulders, body in one straight line.', 'Lower your chest until elbows hit ~90°.', 'Push the floor away back to the top.'],
    ['Squeeze glutes and abs the whole time.', 'Elbows at ~45° from the body.'],
    ['Don’t let hips sag or pike up.', 'Don’t flare elbows straight out.']),
  E('inclinepushup', 'Incline push-ups (easier)', 'home', ['chest'], ['triceps', 'shoulders'], 6,
    ['Hands on a bed/table edge, body straight.', 'Lower chest to the edge.', 'Press back up.'],
    ['Higher surface = easier. Progress lower over weeks.'],
    ['Don’t bend at the hips.']),
  E('squat', 'Bodyweight squats', 'home', ['quads'], ['glutes', 'hamstrings'], 8,
    ['Feet shoulder-width, toes slightly out.', 'Sit back and down like into a chair.', 'Drive through heels to stand.'],
    ['Chest up, knees tracking over toes.', 'Go as deep as comfortable.'],
    ['Don’t let heels lift.', 'Don’t cave knees inward.']),
  E('lunge', 'Lunges', 'home', ['quads'], ['glutes', 'hamstrings'], 8,
    ['Step one foot forward.', 'Lower until both knees are ~90°.', 'Push back to standing, switch legs.'],
    ['Keep torso tall.', 'Short pause at the bottom.'],
    ['Front knee shouldn’t pass far over toes.', 'Don’t slam the back knee down.']),
  E('glutebridge', 'Glute bridge', 'home', ['glutes'], ['hamstrings', 'lowerback'], 5,
    ['Lie on your back, knees bent, feet flat.', 'Drive hips up, squeeze glutes hard at the top.', 'Lower with control.'],
    ['Pause 1–2s at the top.'],
    ['Don’t arch the lower back to go higher.']),
  E('plank', 'Plank', 'home', ['abs'], ['obliques', 'lowerback', 'shoulders'], 4,
    ['Forearms down, body in one straight line.', 'Brace like someone might poke your stomach.', 'Hold 30–60s.'],
    ['Breathe steadily.'],
    ['Don’t hold your breath.', 'Don’t drop the hips.']),
  E('sideplank', 'Side plank', 'home', ['obliques'], ['abs', 'shoulders'], 4,
    ['On one forearm, feet stacked, lift hips.', 'Hold, then switch sides.'],
    ['Straight line ear→ankle.'],
    ['Don’t let hips drop.']),
  E('mountainclimber', 'Mountain climbers', 'home', ['cardio'], ['abs', 'shoulders'], 10,
    ['Start in push-up position.', 'Drive knees to chest alternately, fast.'],
    ['Keep hips level and low.'],
    ['Don’t bounce hips up.']),
  E('burpee', 'Burpees', 'home', ['cardio'], ['chest', 'quads'], 12,
    ['Squat down, hands to floor.', 'Kick back to a push-up, chest to floor.', 'Jump feet in, jump up.'],
    ['Steady pace beats sloppy speed.'],
    ['Skip the jump if knees complain.']),
  E('superman', 'Superman hold', 'home', ['lowerback'], ['glutes'], 4,
    ['Lie face down, arms extended.', 'Lift arms, chest and legs off the floor.', 'Hold 2s, lower.'],
    ['Look at the floor to keep the neck neutral.'],
    ['Don’t yank the neck upward.']),
  E('tricepdip', 'Chair tricep dips', 'home', ['triceps'], ['shoulders', 'chest'], 6,
    ['Hands on a chair edge behind you, legs out.', 'Bend elbows to lower your body.', 'Press back up.'],
    ['Keep elbows pointing straight back.'],
    ['Don’t shrug shoulders to your ears.', 'Don’t go painfully deep.']),
  E('calfraise', 'Calf raises', 'home', ['calves'], [], 4,
    ['Stand tall, rise onto your toes.', 'Pause at the top, lower slowly.'],
    ['Full range: heel low to high tiptoe.'],
    ['Don’t bounce.']),
  E('highknees', 'High knees', 'home', ['cardio'], ['quads', 'abs'], 11,
    ['Run in place driving knees to hip height.', 'Pump arms.'],
    ['Land softly on the balls of your feet.'],
    ['Don’t lean back.']),
  E('birddog', 'Bird dog', 'home', ['lowerback'], ['abs', 'glutes'], 3,
    ['On all fours.', 'Extend opposite arm and leg.', 'Hold 2s, switch.'],
    ['Move slow; hips stay level.'],
    ['Don’t rotate the torso.']),
  E('walk', 'Brisk walk', 'home', ['cardio'], ['calves', 'quads'], 5,
    ['Walk fast enough that talking is slightly hard.', '20–40 minutes.'],
    ['Great on rest and low-energy days.'],
    []),
  E('stretch', 'Full-body stretching', 'home', ['cardio'], [], 3,
    ['Gentle stretches: neck, shoulders, hips, hamstrings.', 'Hold each 20–30s, breathe.'],
    ['Perfect for sore or low-energy days.'],
    ['No bouncing in stretches.']),

  // ---- dumbbells ----
  E('dbbench', 'Dumbbell floor/bench press', 'db', ['chest'], ['triceps', 'shoulders'], 7,
    ['Lie down, dumbbells above chest.', 'Lower to chest level with control.', 'Press back up.'],
    ['Wrists straight above elbows.'],
    ['Don’t bounce weights at the bottom.']),
  E('dbrow', 'One-arm dumbbell row', 'db', ['lats'], ['biceps', 'traps'], 7,
    ['One hand on a support, flat back.', 'Pull the dumbbell to your hip.', 'Lower slowly.'],
    ['Pull with the elbow, not the hand.'],
    ['Don’t twist the torso.']),
  E('dbpress', 'Dumbbell shoulder press', 'db', ['shoulders'], ['triceps', 'traps'], 7,
    ['Dumbbells at shoulder height.', 'Press straight up until arms extend.', 'Lower with control.'],
    ['Ribs down, core tight.'],
    ['Don’t arch the lower back.']),
  E('dbcurl', 'Dumbbell bicep curls', 'db', ['biceps'], ['forearms'], 5,
    ['Arms at sides, palms forward.', 'Curl up without swinging.', 'Lower slowly (3s).'],
    ['Elbows pinned to your sides.'],
    ['Don’t swing the back.']),
  E('dbext', 'Overhead tricep extension', 'db', ['triceps'], ['shoulders'], 5,
    ['One dumbbell overhead with both hands.', 'Lower behind the head.', 'Extend back up.'],
    ['Elbows point forward, close to head.'],
    ['Don’t flare elbows wide.']),
  E('goblet', 'Goblet squat', 'db', ['quads'], ['glutes', 'abs'], 8,
    ['Hold one dumbbell at your chest.', 'Squat deep, elbows inside knees.', 'Stand tall.'],
    ['The weight helps you balance — go deeper.'],
    ['Don’t round the upper back.']),
  E('dbrdl', 'Dumbbell Romanian deadlift', 'db', ['hamstrings'], ['glutes', 'lowerback'], 7,
    ['Dumbbells in front of thighs.', 'Push hips back, slide weights down shins.', 'Squeeze glutes to stand.'],
    ['Feel the hamstring stretch, flat back always.'],
    ['Don’t round the lower back.', 'It’s a hip hinge, not a squat.']),
  E('dblat', 'Lateral raises', 'db', ['shoulders'], ['traps'], 5,
    ['Light dumbbells at sides.', 'Raise arms to shoulder height.', 'Lower slowly.'],
    ['Lead with elbows, slight bend.'],
    ['Don’t shrug or swing.']),
  E('dbshrug', 'Dumbbell shrugs', 'db', ['traps'], ['forearms'], 4,
    ['Heavy-ish dumbbells at sides.', 'Shrug shoulders straight up to ears.', 'Pause, lower slowly.'],
    ['Straight up and down.'],
    ['Don’t roll the shoulders.']),
  E('farmer', 'Farmer carry', 'db', ['forearms'], ['traps', 'abs'], 6,
    ['Heaviest comfortable dumbbells.', 'Walk tall 30–40 steps.', 'Rest, repeat.'],
    ['Shoulders back, brisk small steps.'],
    ['Don’t lean to one side.']),
  E('dblunge', 'Dumbbell lunges', 'db', ['quads'], ['glutes', 'hamstrings'], 8,
    ['Dumbbells at sides.', 'Lunge forward, both knees ~90°.', 'Push back, alternate.'],
    ['Torso tall.'],
    ['Don’t let the front knee cave in.']),

  // ---- gym machines ----
  E('latpulldown', 'Lat pulldown', 'gym', ['lats'], ['biceps'], 7,
    ['Grip wider than shoulders.', 'Pull the bar to your upper chest.', 'Control it back up.'],
    ['Chest up, lead with elbows.'],
    ['Don’t lean way back and heave.']),
  E('chestpress', 'Chest press machine', 'gym', ['chest'], ['triceps', 'shoulders'], 7,
    ['Handles at mid-chest height.', 'Press out until arms extend.', 'Return with control.'],
    ['Shoulder blades pinned back.'],
    ['Don’t bang the weight stack.']),
  E('seatedrow', 'Seated cable row', 'gym', ['lats'], ['biceps', 'traps'], 7,
    ['Sit tall, grab the handle.', 'Pull to your stomach, squeeze back.', 'Let arms extend slowly.'],
    ['Squeeze shoulder blades together.'],
    ['Don’t rock the torso.']),
  E('legpress', 'Leg press', 'gym', ['quads'], ['glutes', 'hamstrings'], 8,
    ['Feet shoulder-width on the platform.', 'Lower until knees ~90°.', 'Press without locking knees.'],
    ['Lower back stays on the pad.'],
    ['Never fully lock the knees.']),
  E('legcurl', 'Leg curl machine', 'gym', ['hamstrings'], ['calves'], 6,
    ['Pad above your heels.', 'Curl heels toward glutes.', 'Return slowly.'],
    ['Squeeze at the top.'],
    ['Don’t lift hips off the pad.']),
  E('legext', 'Leg extension machine', 'gym', ['quads'], [], 6,
    ['Pad on the shins.', 'Extend legs to straight.', 'Lower slowly.'],
    ['Pause 1s at the top.'],
    ['Don’t kick the weight up.']),
  E('pushdown', 'Cable tricep pushdown', 'gym', ['triceps'], ['forearms'], 5,
    ['Elbows pinned at sides.', 'Push the bar down to thighs.', 'Control back up.'],
    ['Only forearms move.'],
    ['Don’t lean your body weight on it.']),
  E('pecdeck', 'Pec deck fly', 'gym', ['chest'], ['shoulders'], 6,
    ['Forearms/hands on the pads.', 'Bring arms together in front.', 'Open slowly.'],
    ['Slight elbow bend throughout.'],
    ['Don’t stretch painfully far back.']),
  E('treadmill', 'Treadmill run / incline walk', 'gym', ['cardio'], ['quads', 'calves'], 10,
    ['Warm up 3 min easy.', 'Run or steep-walk 15–25 min.', 'Cool down 3 min.'],
    ['Incline walking is knee-friendly cardio.'],
    ['Don’t hold the rails while inclining.']),
  E('cycle', 'Stationary cycling', 'gym', ['cardio'], ['quads', 'calves'], 9,
    ['Seat at hip height.', '15–25 min steady, or 30s fast / 60s easy intervals.'],
    ['Knees track straight.'],
    ['Don’t let knees splay out.']),
]

const byId = Object.fromEntries(EXERCISES.map((e) => [e.id, e]))

export function goalKey(goalsText = '') {
  const g = String(goalsText).toLowerCase()
  if (/(muscle|gain|bulk|strong|strength)/.test(g)) return 'muscle'
  if (/(lose|fat|weight|slim|lean|cut)/.test(g)) return 'lose'
  return 'fit'
}

export function setsRepsFor(goal, isCardio) {
  if (isCardio) return goal === 'lose' ? '3 rounds × 45s' : '2 rounds × 45s'
  if (goal === 'muscle') return '4 sets × 8–10'
  if (goal === 'lose') return '3 sets × 15'
  return '3 sets × 12'
}

export { cycleInfo, cycleInfoAt } from './cycle.js'
import { cycleInfoAt as _cycleAt } from './cycle.js'

const GENTLE = ['walk', 'stretch', 'glutebridge', 'birddog', 'plank']
const SPLITS = [
  { title: 'Push day', groups: ['chest', 'shoulders', 'triceps'] },
  { title: 'Pull day', groups: ['lats', 'biceps', 'traps', 'forearms'] },
  { title: 'Legs & core day', groups: ['quads', 'hamstrings', 'glutes', 'calves', 'abs'] },
]

// equip: 'home' | 'db' | 'gym'  (gym includes everything)
export function buildWorkout(profile, equip = 'home', dayOffset = 0) {
  const goal = goalKey(profile?.goals)
  const ci = _cycleAt(profile, dayOffset)
  const pool = EXERCISES.filter((e) =>
    equip === 'gym' ? true : equip === 'db' ? e.equip !== 'gym' : e.equip === 'home'
  )
  const dayIdx = Math.floor(Date.now() / 86400000) + dayOffset
  const rotate = (arr) => arr.slice(dayIdx % Math.max(arr.length, 1)).concat(arr.slice(0, dayIdx % Math.max(arr.length, 1)))

  // Menstrual phase → gentle recovery session regardless of goal
  if (ci?.phase === 'menstrual') {
    return {
      title: 'Gentle recovery session',
      goal, cycle: ci,
      focus: 'Easy movement, hips and lower back comfort',
      avoid: 'Heavy lifts, intense core work, anything that spikes pain',
      exercises: GENTLE.map((id) => byId[id]).filter(Boolean),
    }
  }

  if (goal === 'muscle') {
    const split = SPLITS[dayIdx % 3]
    const main = rotate(pool.filter((e) => e.primary.some((m) => split.groups.includes(m)))).slice(0, 6)
    const list = main.length >= 3 ? main : rotate(pool.filter((e) => e.primary[0] !== 'cardio')).slice(0, 6)
    return {
      title: split.title, goal, cycle: ci,
      focus: split.groups.map((g) => MUSCLE_NAMES[g]).join(', '),
      avoid: 'Training the same muscles hard two days in a row; ego weights with bad form',
      exercises: list,
    }
  }

  if (goal === 'lose') {
    const cardio = rotate(pool.filter((e) => e.primary[0] === 'cardio' && e.id !== 'stretch')).slice(0, 3)
    const strength = rotate(pool.filter((e) => e.primary[0] !== 'cardio')).slice(0, 4)
    return {
      title: 'Fat-burn circuit', goal, cycle: ci,
      focus: 'Big movements + elevated heart rate; minimal rest (30–45s)',
      avoid: 'Long rests between exercises; skipping the strength half — muscle burns calories all day',
      exercises: [...cardio, ...strength],
    }
  }

  const mixed = rotate(pool).slice(0, 6)
  return {
    title: 'Full-body session', goal, cycle: ci,
    focus: 'A bit of everything — strength, core, and a finisher',
    avoid: 'Rushing form to finish faster',
    exercises: mixed,
  }
}

const FAT_FOCUS = {
  belly: 'extra core & obliques work', 'love handles': 'obliques + overall calorie burn',
  thighs: 'more lower-body volume', arms: 'an arm finisher each session',
  chest: 'chest emphasis + overall deficit', back: 'rowing volume + overall deficit',
}

// Add photo-analysis emphasis to any built plan
export function withAnalysisFocus(plan, profile) {
  const areas = profile?.analysis?.fatAreas || []
  const extras = [...new Set(areas.map((a) => FAT_FOCUS[a]).filter(Boolean))]
  if (extras.length) {
    return { ...plan, focus: plan.focus + '. From your photos: ' + extras.join('; ') + ' (spot reduction is a myth — the deficit does the slimming, the focus work does the shaping).' }
  }
  return plan
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const REST = (why) => ({
  title: 'Rest & recovery', goal: 'rest', cycle: null,
  focus: why, avoid: 'Feeling guilty about resting — muscle is built on rest days',
  exercises: ['walk', 'stretch'].map((id) => EXERCISES.find((e) => e.id === id)),
})

// The whole current week (Mon–Sun), goal-aware rest days, cycle-aware per date
export function generateWeek(profile, equip = 'home') {
  const goal = goalKey(profile?.goals)
  const today = new Date()
  const jsDay = today.getDay()
  const toMonday = (jsDay + 6) % 7
  const week = []
  for (let i = 0; i < 7; i++) {
    const offset = i - toMonday
    const date = new Date(today.getTime() + offset * 86400000)
    const wd = date.getDay()
    const restDay = goal === 'muscle' ? (wd === 4 || wd === 0) : wd === 0
    const plan = restDay
      ? REST(goal === 'muscle' ? 'Walk 20–30 min + full-body stretching. Growth happens today.' : 'Easy walk + stretching. Reset for the week.')
      : withAnalysisFocus(buildWorkout(profile, equip, offset), profile)
    week.push({
      offset,
      dayName: DAY_NAMES[wd],
      dateLabel: date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' }),
      isToday: offset === 0,
      plan,
    })
  }
  return week
}

export const WARMUP = [
  { name: 'March in place + arm circles', how: '60s marching while circling arms forward then back.' },
  { name: 'Leg swings', how: 'Hold a wall; swing each leg front-back ×10, side-side ×10.' },
  { name: 'Hip circles', how: 'Hands on hips, big slow circles, 8 each way.' },
  { name: 'Torso twists', how: 'Feet planted, rotate gently side to side ×15.' },
  { name: 'Cat–cow', how: 'On all fours, arch and round the spine slowly ×8.' },
]

export const COOLDOWN = [
  { name: 'Hamstring stretch', how: 'Heel forward, hinge at hips, flat back. 30s/side.' },
  { name: 'Quad stretch', how: 'Pull heel to glute, knees together, tall posture. 30s/side.' },
  { name: 'Doorway chest stretch', how: 'Forearm on the frame, step through gently. 30s/side.' },
  { name: 'Child’s pose', how: 'Knees wide, arms long, breathe slow. 45s.' },
  { name: 'Cross-body shoulder stretch', how: 'Pull the arm across the chest. 30s/side.' },
]


// Rough calories for the checked exercises, scaled by body weight
export function estimateCalories(exercises, doneIds, weightKg) {
  const factor = (Number(weightKg) > 0 ? Number(weightKg) : 70) / 70
  const minutesEach = 4
  const total = exercises
    .filter((e) => doneIds.includes(e.id))
    .reduce((sum, e) => sum + e.kcalMin * minutesEach, 0)
  return Math.round(total * factor)
}
