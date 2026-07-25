// Goal timeline: when will I get there?
// Uses REAL measured rate when there's enough weigh-in history, otherwise
// projects from the calorie target. Always honest about which one it used.

import { calorieTarget } from './nutrition.js'
import { goalKey } from './exercises.js'

const KCAL_PER_KG = 7700          // ≈ energy in 1 kg of body fat
const SAFE = { lose: [0.25, 1.0], gain: [0.1, 0.5] }

export function goalTimeline(profile = {}, series = []) {
  const target = Number(profile.targetWeight)
  const weighIns = series.filter((d) => d.weightKg > 0)
  const current = weighIns.length ? weighIns[weighIns.length - 1].weightKg : Number(profile.weight)
  if (!current) return { ready: false, why: 'Add your weight in Profile to see a timeline.' }
  if (!target) return { ready: false, why: 'Set a target weight in Profile and SAP will project your timeline.' }

  const kgToGo = Math.round((current - target) * 10) / 10
  const dir = kgToGo > 0 ? 'lose' : kgToGo < 0 ? 'gain' : 'maintain'
  if (dir === 'maintain' || Math.abs(kgToGo) < 0.3) {
    return { ready: true, done: true, current, target,
      headline: 'You’re at your target 🎉', note: 'Now the goal is holding it — that’s the real win.' }
  }

  // measured rate: needs 2+ weigh-ins at least 10 days apart
  let ratePerWeek = 0
  let source = 'estimated'
  if (weighIns.length >= 2) {
    const first = weighIns[0], last = weighIns[weighIns.length - 1]
    const days = (new Date(last.date) - new Date(first.date)) / 86400000
    if (days >= 10) {
      const change = first.weightKg - last.weightKg      // + = losing
      const perWeek = (change / days) * 7
      if ((dir === 'lose' && perWeek > 0.05) || (dir === 'gain' && perWeek < -0.05)) {
        ratePerWeek = Math.abs(perWeek)
        source = 'measured'
      }
    }
  }

  if (!ratePerWeek) {
    // project from the plan's calorie gap
    const tdeeish = calorieTarget({ ...profile, goals: 'maintain' })
    const planned = calorieTarget(profile)
    const gap = Math.abs(tdeeish - planned) || (goalKey(profile.goals) === 'muscle' ? 300 : 400)
    ratePerWeek = (gap * 7) / KCAL_PER_KG
  }

  const [lo, hi] = SAFE[dir]
  const capped = Math.min(Math.max(ratePerWeek, lo), hi)
  const weeks = Math.max(1, Math.ceil(Math.abs(kgToGo) / capped))
  const eta = new Date(Date.now() + weeks * 7 * 86400000)

  return {
    ready: true, done: false, current, target, dir,
    kgToGo: Math.abs(kgToGo),
    ratePerWeek: Math.round(capped * 100) / 100,
    weeks,
    etaLabel: eta.toLocaleDateString(undefined, { month: 'long', year: 'numeric' }),
    etaDate: eta.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }),
    source,
    fast: ratePerWeek > hi,
    headline: `${Math.abs(kgToGo)} kg to ${dir} · about ${weeks} week${weeks > 1 ? 's' : ''}`,
    note: source === 'measured'
      ? `Based on your actual weigh-ins (${Math.round(capped * 100) / 100} kg/week). Real progress isn’t a straight line — plateaus and water-weight swings are normal.`
      : `Projected from your calorie target (${Math.round(capped * 100) / 100} kg/week). Log your weight weekly and this switches to your real measured rate.`,
    warn: ratePerWeek > hi
      ? `Your current pace is faster than ${hi} kg/week. Quick loss usually costs muscle and rebounds — the timeline above uses a safe pace instead.`
      : null,
  }
}

// Weekly milestones for a progress feel
export function milestones(tl) {
  if (!tl?.ready || tl.done) return []
  const out = []
  const step = Math.max(1, Math.round(tl.kgToGo / 4 * 10) / 10)
  for (let i = 1; i <= 4; i++) {
    const kg = Math.min(tl.kgToGo, Math.round(step * i * 10) / 10)
    const wk = Math.ceil(kg / tl.ratePerWeek)
    const d = new Date(Date.now() + wk * 7 * 86400000)
    out.push({
      label: `${kg} kg ${tl.dir === 'lose' ? 'down' : 'up'}`,
      when: d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' }),
      weight: Math.round((tl.dir === 'lose' ? tl.current - kg : tl.current + kg) * 10) / 10,
    })
    if (kg >= tl.kgToGo) break
  }
  return out
}
