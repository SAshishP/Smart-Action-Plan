// Phase 1: rule-based morning-to-night plan built from the profile.
// Phase 2 upgrades this to AI-generated plans; the Dashboard won't change.

function toMin(hhmm, fallback) {
  if (!hhmm || !/^\d{1,2}:\d{2}$/.test(hhmm)) return fallback
  const [h, m] = hhmm.split(':').map(Number)
  if (h > 23 || m > 59) return fallback
  return h * 60 + m
}

function fmt(min) {
  min = ((min % 1440) + 1440) % 1440
  const h24 = Math.floor(min / 60)
  const m = min % 60
  const ampm = h24 >= 12 ? 'PM' : 'AM'
  let h = h24 % 12
  if (h === 0) h = 12
  return `${h}:${String(m).padStart(2, '0')} ${ampm}`
}

export function generatePlan(profile = {}) {
  const wake = toMin(profile.wakeTime, 6 * 60 + 30)
  const workStart = toMin(profile.workStart, 9 * 60)
  const workEnd = toMin(profile.workEnd, 18 * 60)
  const sleepRaw = toMin(profile.sleepTime, 22 * 60 + 30)
  // A sleep time earlier than wake (e.g. 2:30 AM) actually falls after
  // midnight — push it a day forward so the evening still sorts and
  // cascades in order. fmt() below wraps it back to a normal clock time.
  const sleep = sleepRaw < wake ? sleepRaw + 1440 : sleepRaw
  const goal = (profile.goals || '').toLowerCase()
  const sensitiveSkin =
    profile.skinSensitivity && profile.skinSensitivity !== 'none'

  const items = []
  let id = 0
  const add = (time, title, detail, customId) =>
    items.push({ id: customId || `p${id++}`, time: fmt(time), min: time, title, detail,
      custom: Boolean(customId) })

  // Lays out a sequence of steps starting at `from`, spacing each one `gap`
  // minutes after the last — but compresses every gap by the same ratio if
  // the whole sequence would otherwise run past `until`. Keeps a tight
  // schedule in order instead of overlapping or crossing a fixed anchor
  // like "Work starts" or "Sleep". Returns the time of the last step.
  function cascade(from, until, steps) {
    const totalGap = steps.reduce((s, x) => s + x.gap, 0)
    const budget = Math.max(until - from, 0)
    const scale = totalGap > 0 ? Math.min(1, budget / totalGap) : 1
    let t = from
    for (const s of steps) {
      t += Math.max(1, Math.round(s.gap * scale))
      add(t, s.title, s.detail)
    }
    return t
  }

  add(wake, 'Wake up', 'Open the curtains — light first, phone later.')
  const morningSteps = [
    { gap: 5, title: 'Drink water', detail: '1 full glass before anything else.' },
    { gap: 10, title: 'Brush + freshen up', detail: '' },
    { gap: 10, title: 'Morning skin care', detail: sensitiveSkin
      ? 'Gentle cleanser only — your skin is marked sensitive.'
      : 'Cleanse, moisturize, sunscreen.' },
  ]
  if (goal.includes('lose') || goal.includes('fit') || goal.includes('muscle')) {
    morningSteps.push({ gap: 15, title: 'Morning walk / stretch', detail: '15–20 min to switch the body on.' })
  }
  morningSteps.push({ gap: 30, title: 'Bath', detail: '' })
  morningSteps.push({ gap: 20, title: 'Breakfast', detail: profile.dietType
    ? `Keep it ${profile.dietType} — protein first.`
    : 'Protein first, sugar last.' })
  // Breakfast (the last morning step) always finishes before work starts —
  // a fixed wake+90 offset alone could otherwise land it right on top of
  // work on an early or tight-scheduled day.
  const breakfast = cascade(wake, workStart - 5, morningSteps)

  // "Dress up" always follows breakfast — a work-relative offset alone can
  // land it before breakfast when wake and workStart are close together.
  add(Math.max(breakfast + 10, workStart - 15), 'Dress up', 'Outfit of the day — Style module coming soon.')
  add(workStart, 'Work starts', profile.job ? String(profile.job) : '')

  // Lunch used to be purely the midpoint of the work hours, with no relation
  // to breakfast — on an early/short work day that could land it barely an
  // hour after breakfast. It now always keeps a real gap from breakfast and
  // stays inside the work window.
  const workLen = Math.max(workEnd - workStart, 3 * 60)
  const lunchIdeal = Math.max(workStart + Math.round(workLen / 2), breakfast + 4 * 60, workStart + 90)
  const lunch = Math.max(Math.min(lunchIdeal, workEnd - 30), workStart + 30)
  const waterCheck = workStart + 120
  if (waterCheck > workStart + 20 && waterCheck < lunch - 20) {
    add(waterCheck, 'Water check', 'Glass #3 by now?')
  }
  add(lunch, 'Lunch', 'Eat away from the screen.')
  const snack = Math.max(lunch + 3 * 60, workEnd - 90)
  if (snack < workEnd - 15) {
    add(snack, 'Snack + water', 'Something light, not fried.')
  }
  add(workEnd, 'Work ends', 'Close the laptop properly.')

  // The evening used to anchor Workout/Dinner off workEnd and the wind-down
  // block off sleep independently — on a late-work or early-sleep day that
  // could show "Me time" before "Work ends", or "Dinner" after "Sleep".
  // Cascading them together keeps the whole evening in order, compressing
  // gaps if the day genuinely doesn't leave much room before bed.
  cascade(workEnd, sleep - 5, [
    { gap: 45, title: 'Workout', detail: goal
      ? `Focused on: ${profile.goals}. Full plans arrive in the Workout module.`
      : 'Move for 30–45 min — anything counts.' },
    { gap: 45, title: 'Dinner', detail: 'Lighter than lunch, ideally a few hours before bed.' },
    { gap: 60, title: 'Me time / family / friends', detail: 'Guilt-free. This is on the plan on purpose.' },
    { gap: 75, title: 'Prep for tomorrow', detail: 'Clothes out, bag packed, one note for morning-you.' },
    { gap: 20, title: 'Night skin care', detail: sensitiveSkin
      ? 'Fragrance-free moisturizer only.'
      : 'Cleanse + moisturize.' },
  ])
  add(sleep, 'Sleep', 'Phone on the other side of the room.')

  // ---- the user's own routine items (prayer, class, meds, commute, anything) ----
  const todayDow = new Date().getDay()
  for (const c of profile.customRoutine || []) {
    if (!c || !c.title) continue
    if (Array.isArray(c.days) && c.days.length && !c.days.includes(todayDow)) continue
    add(toMin(c.time, 8 * 60), c.title, c.detail || '', c.id || `c${Math.random()}`)
  }

  // ---- items the user chose to hide from their day ----
  const hidden = profile.hiddenPlanTitles || []
  return items
    .filter((i) => !hidden.includes(i.title))
    .sort((a, b) => a.min - b.min)
}

export const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// Every title the generator can produce (for the hide/show editor)
export function baseTitles(profile = {}) {
  const plain = generatePlan({ ...profile, customRoutine: [], hiddenPlanTitles: [] })
  return plain.map((i) => i.title)
}

const QUOTES = [
  'Small steps every day beat big plans every January.',
  'You don’t need more time. You need fewer excuses today.',
  'Discipline is choosing what you want most over what you want now.',
  'The body keeps the score. Give it good points today.',
  'One glass of water. One walk. One win. Stack them.',
  'You are not behind. You are one day of action away.',
  'Progress photos exist because mirrors have short memories.',
  'Consistency looks boring daily and shocking yearly.',
  'Do it tired. Do it slow. Just do it today.',
  'Future you is watching. Make them proud, not busy.',
]

export function quoteOfTheDay() {
  const dayIndex = Math.floor(Date.now() / 86400000)
  return QUOTES[dayIndex % QUOTES.length]
}
