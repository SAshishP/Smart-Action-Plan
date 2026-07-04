// Cloud sync (Phase 2). Every function is safe to call when the cloud
// isn't configured or the user isn't logged in — it just does nothing.

import { supabase } from './supabase.js'

export async function currentUser() {
  if (!supabase) return null
  const { data } = await supabase.auth.getUser()
  return data?.user || null
}

export async function pullProfile() {
  const u = await currentUser()
  if (!u) return null
  const { data, error } = await supabase
    .from('profiles').select('data').eq('id', u.id).maybeSingle()
  if (error) { console.error('pullProfile:', error.message); return null }
  return data?.data || null
}

export async function pushProfile(profile) {
  const u = await currentUser()
  if (!u) return
  const { error } = await supabase.from('profiles').upsert({
    id: u.id, data: profile, updated_at: new Date().toISOString(),
  })
  if (error) console.error('pushProfile:', error.message)
}

export async function pullDay(dayKey) {
  const u = await currentUser()
  if (!u) return null
  const { data, error } = await supabase
    .from('days').select('data').eq('user_id', u.id).eq('day', dayKey).maybeSingle()
  if (error) { console.error('pullDay:', error.message); return null }
  return data?.data || null
}

export async function pushDay(dayKey, dayData) {
  const u = await currentUser()
  if (!u) return
  const { error } = await supabase.from('days').upsert({
    user_id: u.id, day: dayKey, data: dayData, updated_at: new Date().toISOString(),
  })
  if (error) console.error('pushDay:', error.message)
}

// Upload the 12 onboarding photos to the private 'photos' bucket.
// Runs in the background after profile creation; failures never block the app.
export async function uploadInitialPhotos(profile) {
  const u = await currentUser()
  if (!u || !profile?.photos) return
  for (const [slot, dataUrl] of Object.entries(profile.photos)) {
    try {
      const blob = await (await fetch(dataUrl)).blob()
      const path = `${u.id}/${slot}_initial.jpg`
      const { error } = await supabase.storage
        .from('photos')
        .upload(path, blob, { contentType: 'image/jpeg', upsert: true })
      if (!error) {
        await supabase.from('photos').insert({
          user_id: u.id, slot, storage_path: path,
        })
      } else {
        console.error('photo upload:', slot, error.message)
      }
    } catch (e) {
      console.error('photo upload:', slot, e)
    }
  }
}

export async function signOutEverywhere() {
  if (supabase) await supabase.auth.signOut()
  // Clear this phone's cache so the next person can't see the previous user
  try {
    Object.keys(localStorage)
      .filter((k) => k.startsWith('sap_'))
      .forEach((k) => localStorage.removeItem(k))
  } catch { /* ignore */ }
}
