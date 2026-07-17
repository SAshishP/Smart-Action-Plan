// Menstrual cycle engine — history-based cycle length, phase detection for
// any date, predictions, and the phase guide (diet/workout/relief).

export function cycleLength(profile = {}) {
  const h = (profile.periodHistory || []).slice(-6)
  if (h.length >= 2) {
    const gaps = []
    for (let i = 1; i < h.length; i++) {
      const g = Math.round((new Date(h[i]) - new Date(h[i - 1])) / 86400000)
      if (g >= 18 && g <= 45) gaps.push(g)
    }
    if (gaps.length) {
      const avg = Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length)
      return Math.min(35, Math.max(21, avg))
    }
  }
  return 28
}

function phaseAt(dayOfCycle, len) {
  // scale the classic 28-day phases to the user's cycle length
  const s = len / 28
  if (dayOfCycle <= Math.round(5 * s)) return 'menstrual'
  if (dayOfCycle <= Math.round(13 * s)) return 'follicular'
  if (dayOfCycle <= Math.round(16 * s)) return 'ovulation'
  return 'luteal'
}

const PHASE_NOTES = {
  menstrual: 'Menstrual phase: rest more — movement helps cramps, intensity doesn’t.',
  follicular: 'Follicular phase: energy rising — a great window to push harder.',
  ovulation: 'Ovulation: peak energy days (warm up properly).',
  luteal: 'Luteal phase: energy dips and cravings are normal — go gentler.',
}

// offsetDays: 0 = today, +2 = day after tomorrow (for weekly planning)
export function cycleInfoAt(profile = {}, offsetDays = 0) {
  if (profile.gender !== 'female' || !profile.lastPeriodStart) return null
  const start = new Date(profile.lastPeriodStart).getTime()
  if (isNaN(start)) return null
  const len = cycleLength(profile)
  const elapsed = Math.floor((Date.now() + offsetDays * 86400000 - start) / 86400000)
  const day = ((elapsed % len) + len) % len + 1
  const phase = phaseAt(day, len)
  return { day, phase, len, note: PHASE_NOTES[phase] }
}

export const cycleInfo = (profile) => cycleInfoAt(profile, 0)

export function predictions(profile = {}) {
  const ci = cycleInfo(profile)
  if (!ci) return null
  const len = ci.len
  const start = new Date(profile.lastPeriodStart)
  const next = new Date(start.getTime() + len * 86400000)
  const ovulation = new Date(next.getTime() - 14 * 86400000)
  const fertileFrom = new Date(ovulation.getTime() - 4 * 86400000)
  const fmt = (d) => d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  return {
    nextPeriod: fmt(next),
    daysToNext: Math.max(0, Math.ceil((next - Date.now()) / 86400000)),
    fertileWindow: `${fmt(fertileFrom)} – ${fmt(ovulation)}`,
    note: 'Estimates from your logged cycles — bodies aren’t clocks, and this is not contraception-grade prediction.',
  }
}

// Returns the profile patch for logging a period start today (or a date)
export function logPeriodPatch(profile = {}, dateKey) {
  const d = dateKey || new Date().toISOString().slice(0, 10)
  const history = [...new Set([...(profile.periodHistory || []), d])].sort()
  return { lastPeriodStart: d, periodHistory: history.slice(-12) }
}

export const PHASE_GUIDE = {
  menstrual: {
    title: 'Menstrual (period days)',
    eat: ['Iron-rich food: dal, rajma, spinach, dates, fish', 'Warm meals & soups', 'Dark chocolate (portioned) for cravings', 'Plenty of water — it reduces bloating'],
    avoid: ['Excess caffeine (worsens cramps)', 'Very salty food (bloating)', 'Alcohol', 'Skipping meals'],
    workout: 'Gentle only: walking, stretching, glute bridges, child pose. Skip heavy lifts and intense core work.',
    relief: ['Heat pad / hot water bottle on the lower belly 15–20 min', 'Light walk — movement genuinely eases cramps', 'Magnesium-rich snacks (pumpkin seeds, dark chocolate)', 'Sleep 8h+ — pain feels worse tired', 'Severe pain that stops your day is worth a doctor visit, not endurance'],
  },
  follicular: {
    title: 'Follicular (energy rising)',
    eat: ['Protein + complex carbs to fuel training', 'Fresh vegetables and fruit', 'Fermented food (curd/yogurt) for gut'],
    avoid: ['Nothing special — this is your strongest food-tolerance window'],
    workout: 'Best phase to push: heavier lifts, new PRs, harder cardio. Recovery is fastest now.',
    relief: ['Ride the energy — schedule your hardest workouts this week'],
  },
  ovulation: {
    title: 'Ovulation (peak days)',
    eat: ['Lighter, fiber-rich meals', 'Cruciferous veg (broccoli, cabbage)', 'Hydrate extra'],
    avoid: ['Heavy greasy meals — digestion is a bit slower'],
    workout: 'Peak strength and energy — go for it, but warm up well; injury risk is slightly higher around ovulation.',
    relief: ['Mild one-sided twinges can be normal for a day; persistent pain isn’t — check with a doctor'],
  },
  luteal: {
    title: 'Luteal (pre-period)',
    eat: ['Complex carbs + magnesium: oats, banana, nuts, dark chocolate', 'Calcium (curd, milk) may ease PMS', 'Smaller, more frequent meals for cravings'],
    avoid: ['Refined sugar binges (crash → worse mood)', 'Excess salt', 'Too much caffeine'],
    workout: 'Moderate: strength at −1 set, yoga, walks. Honor low-energy days without guilt.',
    relief: ['Cravings are chemistry, not weakness — planned snacks beat willpower', 'Prioritize sleep; PMS amplifies on short nights', 'Journal or vent — mood swings are the phase, not you'],
  },
}
