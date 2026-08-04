// Daily calorie & protein targets (Mifflin-St Jeor), adjusted by goal — and
// then by any health condition the user has logged. A slow thyroid genuinely
// burns less; pregnancy means no deficit at all; kidney disease means this app
// does not set a protein number. Those adjustments happen here so every screen
// that reads a target gets the corrected one.

import { ageFromDob } from './store.js'
import { goalKey } from './exercises.js'
import { calorieFactor, deficitBlocked, proteinOverride } from './conditions.js'

const ACTIVITY = [
  ['sedentary', 1.2],
  ['lightly', 1.375],
  ['very', 1.725], // check 'very' before 'active'
  ['active', 1.55],
]

// Total daily energy expenditure before any goal adjustment.
export function tdee(profile = {}) {
  const w = Number(profile.weight) || 65
  const h = Number(profile.height) || 168
  const age = Number(ageFromDob(profile.dob)) || 27
  const base = 10 * w + 6.25 * h - 5 * age + (profile.gender === 'female' ? -161 : 5)
  const act = (ACTIVITY.find(([k]) => String(profile.activityLevel || '').toLowerCase().includes(k)) || [null, 1.375])[1]
  return Math.round(base * act * calorieFactor(profile))
}

export function calorieTarget(profile = {}) {
  let target = tdee(profile)
  const goal = goalKey(profile.goals)
  // A condition that blocks deficits overrides the goal entirely — this is the
  // one place where what the user typed as a goal does not win.
  if (deficitBlocked(profile)) return Math.max(1200, Math.round(target / 10) * 10)
  if (goal === 'lose') target -= 400
  if (goal === 'muscle') target += 300
  return Math.max(1200, Math.round(target / 10) * 10)
}

export function proteinTarget(profile = {}) {
  const override = proteinOverride(profile)
  if (override === null) return null // kidney disease — doctor sets this, not us
  const w = Number(profile.weight) || 65
  const perKg = override ?? (goalKey(profile.goals) === 'muscle' ? 1.6 : 1.2)
  return Math.round(w * perKg)
}

// Why the number looks the way it does — shown under the target so it never
// reads as an arbitrary figure.
export function targetExplained(profile = {}) {
  const factor = calorieFactor(profile)
  const blocked = deficitBlocked(profile)
  const out = []
  if (blocked) out.push(`Set to maintenance, not a deficit — ${blocked.name} is logged, and losing fat is not the goal right now.`)
  if (factor < 1) out.push(`Lowered by ${Math.round((1 - factor) * 100)}% because a logged condition slows your resting burn. This is the honest number, not the discouraging one.`)
  if (factor > 1) out.push(`Raised by ${Math.round((factor - 1) * 100)}% because a logged condition increases your resting burn.`)
  const p = proteinOverride(profile)
  if (p === null) out.push('Protein target hidden on purpose — with kidney disease that number has to come from your doctor.')
  else if (p) out.push(`Protein raised to ${p} g per kg of body weight for your logged conditions.`)
  return out
}
