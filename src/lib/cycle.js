// Menstrual cycle engine — history-based cycle length, phase detection for
// any date, predictions, and the phase guide (diet/workout/relief).
//
// profile.periodHistory is a flat list of every individual day the user has
// marked as a period day (via the calendar or "period started today") — not
// just start dates. periodRuns() groups consecutive calendar days into real
// period instances so each one has an accurate start, end and day-count,
// instead of assuming every period lasts the same guessed length.

// Group a flat list of logged period days into distinct instances (runs of
// consecutive calendar days). Returns oldest-first: [{ start, end, days }].
function periodRuns(profile = {}) {
  const days = [...new Set(profile.periodHistory || [])]
    .filter((d) => !isNaN(new Date(d)))
    .sort()
  const runs = []
  for (const d of days) {
    const last = runs[runs.length - 1]
    const gap = last ? Math.round((new Date(d) - new Date(last.end)) / 86400000) : null
    if (gap === 1) {
      last.end = d
      last.days.push(d)
    } else {
      runs.push({ start: d, end: d, days: [d] })
    }
  }
  return runs
}

// Exposed for the history list — each real period instance with its true
// start, end and day-count.
export function periodInstances(profile = {}) {
  return periodRuns(profile)
}

// Keep only the days belonging to the most recent `maxRuns` period
// instances, so storage stays bounded no matter how long a period runs.
function trimToRecentRuns(periodHistory, maxRuns = 12) {
  const runs = periodRuns({ periodHistory })
  return runs.slice(-maxRuns).flatMap((r) => r.days)
}

export function cycleLength(profile = {}) {
  const runs = periodRuns(profile).slice(-6)
  if (runs.length >= 2) {
    const gaps = []
    for (let i = 1; i < runs.length; i++) {
      const g = Math.round((new Date(runs[i].start) - new Date(runs[i - 1].start)) / 86400000)
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

// Returns the profile patch for logging a period start today (or a given
// date) — pre-fills the user's usual period length (from the Cycle screen's
// "how many days does your period usually last" setting) as an editable
// estimate. Tap the calendar to trim it short or extend it if this one runs
// long — nothing here is final.
export function logPeriodPatch(profile = {}, dateKey) {
  const start = dateKey || new Date().toISOString().slice(0, 10)
  const len = Number(profile.periodLength) || 5
  const days = []
  for (let i = 0; i < len; i++) {
    days.push(new Date(new Date(start).getTime() + i * 86400000).toISOString().slice(0, 10))
  }
  const merged = [...new Set([...(profile.periodHistory || []), ...days])]
  const periodHistory = trimToRecentRuns(merged, 12)
  const runs = periodRuns({ periodHistory })
  return { periodHistory, lastPeriodStart: runs.length ? runs[runs.length - 1].start : start }
}

// Calendar marks: every logged period day exactly as logged (no guessing),
// next predicted period, and the fertile window.
export function calendarMarks(profile = {}) {
  const marks = {}
  const len = cycleLength(profile)
  const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

  for (const d of profile.periodHistory || []) {
    if (!isNaN(new Date(d))) marks[d] = 'period'
  }

  if (profile.lastPeriodStart) {
    const last = new Date(profile.lastPeriodStart)
    if (!isNaN(last)) {
      const bleedDays = Number(profile.periodLength) || Math.max(3, Math.round(5 * (len / 28)))
      // next two predicted cycles
      for (let c = 1; c <= 2; c++) {
        const next = new Date(last.getTime() + len * c * 86400000)
        for (let i = 0; i < bleedDays; i++) {
          const d = new Date(next.getTime() + i * 86400000)
          if (!marks[iso(d)]) marks[iso(d)] = 'predicted'
        }
        const ov = new Date(next.getTime() - 14 * 86400000)
        for (let i = -4; i <= 0; i++) {
          const d = new Date(ov.getTime() + i * 86400000)
          if (!marks[iso(d)]) marks[iso(d)] = 'fertile'
        }
      }
    }
  }
  return marks
}

// Toggle a single day (add if absent, remove if present) — this is how a
// specific period instance gets edited: untap a day it didn't actually
// cover, or tap extra days while it's still ongoing.
export function toggleDatePatch(profile = {}, dateKey) {
  const hist = profile.periodHistory || []
  const nextDays = hist.includes(dateKey)
    ? hist.filter((d) => d !== dateKey)
    : [...hist, dateKey]
  const periodHistory = trimToRecentRuns(nextDays, 12)
  const runs = periodRuns({ periodHistory })
  return { periodHistory, lastPeriodStart: runs.length ? runs[runs.length - 1].start : '' }
}

// Remove every day belonging to one logged period instance at once (used by
// the history list's delete button).
export function removeInstancePatch(profile = {}, run) {
  const remaining = (profile.periodHistory || []).filter((d) => !run.days.includes(d))
  const runs = periodRuns({ periodHistory: remaining })
  return { periodHistory: remaining, lastPeriodStart: runs.length ? runs[runs.length - 1].start : '' }
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
