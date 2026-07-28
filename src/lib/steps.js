// Best-effort step counter using the phone's motion sensor.
// Falls back to manual entry when the sensor or permission isn't available.

// ---- steps → calories burned ----------------------------------------------
// Walking burns roughly weight(kg) × 0.0005 kcal per step (~0.035 kcal/step at
// 70 kg → ~350 kcal for 10k steps). Kept as pure functions so every screen
// computes the same number.
export function stepCalories(steps, weightKg) {
  const kg = Number(weightKg) > 0 ? Number(weightKg) : 65
  const s = Math.max(0, Math.floor(Number(steps) || 0))
  return Math.round(s * kg * 0.0005)
}

// Calories from logged workouts only. Back-fills older days that stored their
// workout burn directly in calsOut (before step-calories existed).
export function workoutBurn(day = {}) {
  return Number(day.workoutCals != null ? day.workoutCals : day.calsOut) || 0
}

// Total active burn shown in the meter: logged workouts + walking.
export function totalBurn(day = {}, weightKg) {
  return workoutBurn(day) + stepCalories(day.steps, weightKg)
}

export function stepSensorAvailable() {
  return typeof window !== 'undefined' && typeof window.DeviceMotionEvent !== 'undefined'
}

export function needsMotionPermission() {
  return typeof window !== 'undefined' &&
    typeof window.DeviceMotionEvent !== 'undefined' &&
    typeof window.DeviceMotionEvent.requestPermission === 'function'
}

export async function requestMotionPermission() {
  if (!needsMotionPermission()) return 'granted'
  try {
    return await window.DeviceMotionEvent.requestPermission()
  } catch {
    return 'denied'
  }
}

// Simple peak-detection pedometer: watches the acceleration vector's
// magnitude and counts a step each time it rises past a moving baseline.
export function startStepTracking(onStep) {
  let baseline = null
  let lastStepAt = 0
  const SMOOTHING = 0.15
  const THRESHOLD = 1.6 // m/s^2 above baseline counts as a step "bounce"
  const MIN_INTERVAL_MS = 300 // ~200 steps/min max

  function handleMotion(e) {
    const acc = e.accelerationIncludingGravity || e.acceleration
    if (!acc || acc.x == null) return
    const mag = Math.sqrt((acc.x || 0) ** 2 + (acc.y || 0) ** 2 + (acc.z || 0) ** 2)
    if (baseline == null) { baseline = mag; return }
    const now = Date.now()
    if (mag - baseline > THRESHOLD && now - lastStepAt > MIN_INTERVAL_MS) {
      lastStepAt = now
      onStep()
    }
    baseline = baseline + (mag - baseline) * SMOOTHING
  }

  window.addEventListener('devicemotion', handleMotion)
  return () => window.removeEventListener('devicemotion', handleMotion)
}
