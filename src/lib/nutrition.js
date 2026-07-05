// Daily calorie & protein targets (Mifflin-St Jeor), adjusted by goal.
import { ageFromDob } from './store.js'
import { goalKey } from './exercises.js'

const ACTIVITY = [
  ['sedentary', 1.2],
  ['lightly', 1.375],
  ['very', 1.725],   // check 'very' before 'active'
  ['active', 1.55],
]

export function calorieTarget(profile = {}) {
  const w = Number(profile.weight) || 65
  const h = Number(profile.height) || 168
  const age = Number(ageFromDob(profile.dob)) || 27
  const base = 10 * w + 6.25 * h - 5 * age + (profile.gender === 'female' ? -161 : 5)
  const act = (ACTIVITY.find(([k]) => String(profile.activityLevel || '').toLowerCase().includes(k)) || [null, 1.375])[1]
  let target = base * act
  const goal = goalKey(profile.goals)
  if (goal === 'lose') target -= 400
  if (goal === 'muscle') target += 300
  return Math.max(1200, Math.round(target / 10) * 10)
}

export function proteinTarget(profile = {}) {
  const w = Number(profile.weight) || 65
  const perKg = goalKey(profile.goals) === 'muscle' ? 1.6 : 1.2
  return Math.round(w * perKg)
}
