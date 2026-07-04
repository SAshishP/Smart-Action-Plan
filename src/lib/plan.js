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
  const sleep = toMin(profile.sleepTime, 22 * 60 + 30)
  const goal = (profile.goals || '').toLowerCase()
  const sensitiveSkin =
    profile.skinSensitivity && profile.skinSensitivity !== 'none'

  const items = []
  let id = 0
  const add = (time, title, detail) =>
    items.push({ id: `p${id++}`, time: fmt(time), min: time, title, detail })

  add(wake, 'Wake up', 'Open the curtains — light first, phone later.')
  add(wake + 5, 'Drink water', '1 full glass before anything else.')
  add(wake + 15, 'Brush + freshen up', '')
  add(wake + 25, 'Morning skin care', sensitiveSkin
    ? 'Gentle cleanser only — your skin is marked sensitive.'
    : 'Cleanse, moisturize, sunscreen.')
  if (goal.includes('lose') || goal.includes('fit') || goal.includes('muscle')) {
    add(wake + 40, 'Morning walk / stretch', '15–20 min to switch the body on.')
  }
  add(wake + 70, 'Bath', '')
  add(wake + 90, 'Breakfast', profile.dietType
    ? `Keep it ${profile.dietType} — protein first.`
    : 'Protein first, sugar last.')
  add(workStart - 15, 'Dress up', 'Outfit of the day — Style module coming soon.')
  add(workStart, 'Work starts', profile.job ? String(profile.job) : '')
  add(workStart + 120, 'Water check', 'Glass #3 by now?')
  add(Math.round((workStart + workEnd) / 2), 'Lunch', 'Eat away from the screen.')
  add(workEnd - 180, 'Snack + water', 'Something light, not fried.')
  add(workEnd, 'Work ends', 'Close the laptop properly.')
  add(workEnd + 45, 'Workout', goal
    ? `Focused on: ${profile.goals}. Full plans arrive in the Workout module.`
    : 'Move for 30–45 min — anything counts.')
  add(workEnd + 120, 'Dinner', 'Lighter than lunch, 3h before sleep.')
  add(sleep - 120, 'Me time / family / friends', 'Guilt-free. This is on the plan on purpose.')
  add(sleep - 45, 'Prep for tomorrow', 'Clothes out, bag packed, one note for morning-you.')
  add(sleep - 25, 'Night skin care', sensitiveSkin
    ? 'Fragrance-free moisturizer only.'
    : 'Cleanse + moisturize.')
  add(sleep, 'Sleep', 'Phone on the other side of the room.')

  return items.sort((a, b) => a.min - b.min)
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
