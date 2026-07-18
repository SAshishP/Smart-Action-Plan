// Best-effort step counter using the phone's motion sensor.
// Falls back to manual entry when the sensor or permission isn't available.

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
