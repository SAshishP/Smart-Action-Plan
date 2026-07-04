// Phase 1 storage: everything lives on the device (localStorage).
// Phase 2 swaps these same functions to Supabase, so no screen code changes.

const PROFILE_KEY = 'sap_profile_v1'
const DAY_PREFIX = 'sap_day_'

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch (e) {
    // localStorage is full (photos are big) — fail loudly instead of crashing silently
    console.error('Storage full or blocked:', e)
    alert('Storage is full on this device. Photos will sync to the cloud in the next update — for now, try smaller photos.')
    return false
  }
}

export function getProfile() {
  return read(PROFILE_KEY, null)
}

export function saveProfile(profile) {
  return write(PROFILE_KEY, profile)
}

export function todayKey() {
  const d = new Date()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

const EMPTY_DAY = {
  water: 0,          // glasses (250 ml)
  steps: 0,
  sleepHours: '',
  calsIn: 0,
  calsOut: 0,
  todos: [],         // { id, text, done }
  planDone: {},      // { [planItemId]: true }
}

export function getDay(key = todayKey()) {
  return { ...EMPTY_DAY, ...read(DAY_PREFIX + key, {}) }
}

export function saveDay(data, key = todayKey()) {
  return write(DAY_PREFIX + key, data)
}

export function ageFromDob(dob) {
  if (!dob) return ''
  const b = new Date(dob)
  if (isNaN(b.getTime())) return ''
  const now = new Date()
  let age = now.getFullYear() - b.getFullYear()
  const beforeBirthday =
    now.getMonth() < b.getMonth() ||
    (now.getMonth() === b.getMonth() && now.getDate() < b.getDate())
  if (beforeBirthday) age--
  return age >= 0 && age < 130 ? age : ''
}

// Water goal: ~33 ml per kg of body weight, in 250 ml glasses, min 8
export function waterGoal(profile) {
  const kg = Number(profile?.weight)
  if (!kg || kg <= 0) return 8
  return Math.max(8, Math.round((kg * 33) / 250))
}
