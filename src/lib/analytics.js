// Pure analytics — no imports, fully testable.
// Takes raw day records and produces chart series + honest insights.

export function dayKeyOffset(daysAgo, from = new Date()) {
  const d = new Date(from)
  d.setDate(d.getDate() - daysAgo)
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

// map: Map(dateKey -> rawDayData) → continuous last-n-days array (oldest first)
export function buildSeries(map, n = 30, from = new Date()) {
  const out = []
  for (let i = n - 1; i >= 0; i--) {
    const date = dayKeyOffset(i, from)
    const d = map.get(date) || {}
    out.push({
      date,
      label: date.slice(8) + '/' + date.slice(5, 7),
      water: Number(d.water) || 0,
      steps: Number(d.steps) || 0,
      sleep: parseFloat(d.sleepHours) || 0,
      calsIn: Number(d.calsIn) || 0,
      calsOut: Number(d.calsOut) || 0,
      planDone: d.planDone ? Object.values(d.planDone).filter(Boolean).length : 0,
      logged: Boolean(
        (Number(d.water) || 0) || (Number(d.steps) || 0) || parseFloat(d.sleepHours) ||
        (Number(d.calsIn) || 0) || (Number(d.calsOut) || 0) ||
        (d.planDone && Object.values(d.planDone).some(Boolean)) ||
        (Array.isArray(d.todos) && d.todos.length)
      ),
    })
  }
  return out
}

const avg = (arr) => (arr.length ? arr.reduce((s, x) => s + x, 0) / arr.length : 0)
const r1 = (x) => Math.round(x * 10) / 10

export function computeStats(series) {
  const logged = series.filter((d) => d.logged)
  let streak = 0
  for (let i = series.length - 1; i >= 0; i--) {
    if (series[i].logged) streak++
    else if (i === series.length - 1) continue // today not logged yet doesn't break the streak
    else break
  }
  return {
    daysLogged: logged.length,
    streak,
    avgWater: r1(avg(logged.filter((d) => d.water > 0).map((d) => d.water))),
    avgSleep: r1(avg(logged.filter((d) => d.sleep > 0).map((d) => d.sleep))),
    avgSteps: Math.round(avg(logged.filter((d) => d.steps > 0).map((d) => d.steps))),
    totalBurn: logged.reduce((s, d) => s + d.calsOut, 0),
  }
}

// Cross-module insights. targets: { waterGoal, calTarget }
export function insights(series, targets = {}) {
  const logged = series.filter((d) => d.logged)
  if (logged.length < 3) {
    return ['Log 3 or more days and cross-module insights unlock here — comparisons between your water, sleep, steps and calories.']
  }
  const out = []
  const { waterGoal = 8, calTarget = 0 } = targets

  const hitWater = logged.filter((d) => d.water >= waterGoal)
  out.push(`You hit your water goal ${hitWater.length} of ${logged.length} logged days${hitWater.length / logged.length >= 0.7 ? ' — genuinely strong.' : '.'}`)

  const sleepDays = logged.filter((d) => d.sleep > 0)
  if (sleepDays.length >= 4 && hitWater.length >= 2 && hitWater.length < logged.length) {
    const sHit = avg(hitWater.filter((d) => d.sleep > 0).map((d) => d.sleep))
    const sMiss = avg(logged.filter((d) => d.water < waterGoal && d.sleep > 0).map((d) => d.sleep))
    if (sHit && sMiss) {
      out.push(`On water-goal days you slept ${r1(sHit)}h on average vs ${r1(sMiss)}h on other days${sHit - sMiss >= 0.4 ? ' — hydration and sleep are moving together for you.' : '.'}`)
    }
  }

  const best = logged.reduce((a, b) => (b.steps > a.steps ? b : a), logged[0])
  if (best.steps > 0) out.push(`Best movement day: ${best.date} with ${best.steps.toLocaleString()} steps.`)

  if (calTarget > 0) {
    const calDays = logged.filter((d) => d.calsIn > 0)
    if (calDays.length >= 3) {
      const under = calDays.filter((d) => d.calsIn <= calTarget)
      out.push(`You stayed at or under your ${calTarget} kcal target ${under.length} of ${calDays.length} days you tracked food.`)
    }
  }

  const active = logged.filter((d) => d.calsOut > 0)
  if (active.length) {
    out.push(`Workouts/burn logged on ${active.length} of ${logged.length} days — total ${active.reduce((s, d) => s + d.calsOut, 0).toLocaleString()} kcal burned.`)
  }

  const planDays = logged.filter((d) => d.planDone > 0)
  if (planDays.length >= 3) {
    out.push(`Daily-plan items ticked: ${Math.round(avg(planDays.map((d) => d.planDone)))} per day on average — consistency beats intensity.`)
  }
  return out
}

export const AFFIRMATIONS = [
  '{name}, you don’t have to feel ready. You have to start.',
  'Every glass of water, every step — {name} is voting for the person they’re becoming.',
  'Today’s effort is invisible. This month’s effort won’t be. Keep going, {name}.',
  '{name}, rest is part of the plan, not a failure of it.',
  'You’ve survived 100% of your hardest days, {name}. Today is just Tuesday.',
  'Small and consistent, {name}. That’s the whole secret.',
  'The plan works if {name} works the plan — one checkbox at a time.',
  '{name}, comparison is noise. Yesterday-you is the only competition.',
  'Discipline is self-respect in action, {name}.',
  'Your future self is already grateful, {name}. Give them one more good day.',
  '{name}, progress photos change slowly, then suddenly. Stay in the game.',
  'Energy follows action, {name} — start small and it shows up.',
  'You’re not behind, {name}. You’re on day N of a long win.',
  'Drink the water. Take the walk. Sleep on time. Boring wins, {name}.',
]

export function affirmationOfTheDay(name = '') {
  const first = String(name).split(' ')[0] || 'friend'
  // Day index tied to the LOCAL calendar day (matching todayKey()/dayKeyOffset()
  // elsewhere), not the UTC epoch day — otherwise the quote flips at UTC
  // midnight instead of local midnight for most users.
  const now = new Date()
  const localDayNumber = Math.floor(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 86400000)
  const idx = localDayNumber % AFFIRMATIONS.length
  return AFFIRMATIONS[idx].replaceAll('{name}', first)
}
