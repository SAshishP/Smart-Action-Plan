// Storage layer: writes locally first (instant, works offline),
// then syncs to the cloud in the background when logged in.

import { pushProfile, pushDay } from './cloud.js'

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
    console.error('Storage full or blocked:', e)
    alert('Storage is full on this device. Your data still syncs to the cloud when online.')
    return false
  }
}

export function getProfile() {
  return read(PROFILE_KEY, null)
}

export function saveProfile(profile, opts = {}) {
  const ok = write(PROFILE_KEY, profile)
  if (!opts.localOnly) pushProfile(profile).catch(() => {})
  return ok
}

export function todayKey() {
  const d = new Date()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

const EMPTY_DAY = {
  water: 0,
  steps: 0,
  sleepHours: '',
  calsIn: 0,
  calsOut: 0,
  todos: [],
  planDone: {},
  meals: [],        // [{ id, name, kcal }]
  weightKg: '',     // optional daily weigh-in
  mood: '',         // cycle/mood log
  symptoms: [],     // cycle symptom log
}

export function getDay(key = todayKey()) {
  return { ...EMPTY_DAY, ...read(DAY_PREFIX + key, {}) }
}

export function saveDay(data, key = todayKey(), opts = {}) {
  const ok = write(DAY_PREFIX + key, data)
  if (!opts.localOnly) pushDay(key, data).catch(() => {})
  return ok
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

export function waterGoal(profile) {
  const kg = Number(profile?.weight)
  if (!kg || kg <= 0) return 8
  return Math.max(8, Math.round((kg * 33) / 250))
}
