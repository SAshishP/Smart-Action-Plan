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

// Upload one dated progress photo (e.g. weekly body front)
export async function uploadProgressPhoto(dataUrl, slot, dateKey) {
  const u = await currentUser()
  if (!u || !dataUrl) return
  try {
    const blob = await (await fetch(dataUrl)).blob()
    const path = `${u.id}/${slot}_${dateKey}.jpg`
    const { error } = await supabase.storage
      .from('photos')
      .upload(path, blob, { contentType: 'image/jpeg', upsert: true })
    if (!error) {
      await supabase.from('photos').insert({
        user_id: u.id, slot, taken_on: dateKey, storage_path: path,
      })
    } else {
      console.error('progress upload:', error.message)
    }
  } catch (e) {
    console.error('progress upload:', e)
  }
}

// ---- admin visibility (Phase 3) -------------------------------------------

// New AI calls are logged server-side by the ai-chat function. This recovers
// what existing users already have sitting in localStorage from before that:
// their saved chat thread, and any day they logged while offline or pre-cloud.
// Runs once per device, never blocks the UI, and never repeats on failure-free
// completion.
const BACKFILL_FLAG = 'sap_backfilled_v1'

export async function backfillLocalData() {
  const u = await currentUser()
  if (!u) return
  try {
    if (localStorage.getItem(BACKFILL_FLAG)) return
  } catch {
    return   // storage blocked — nothing local to recover anyway
  }

  // 1. Local chat thread → ai_messages, paired user question + model reply
  try {
    const raw = localStorage.getItem('sap_chat_v1')
    const msgs = raw ? JSON.parse(raw) : []
    const rows = []
    for (let i = 0; i < msgs.length; i++) {
      if (msgs[i]?.role !== 'user') continue
      const next = msgs[i + 1]
      rows.push({
        user_id: u.id,
        source: 'backfill',
        user_text: String(msgs[i].text || ''),
        reply_text: next?.role === 'model' ? String(next.text || '') : null,
        image_count: msgs[i].img ? 1 : 0,
      })
    }
    if (rows.length) {
      const { error } = await supabase.from('ai_messages').insert(rows)
      if (error) console.error('backfill chat:', error.message)
    }
  } catch (e) {
    console.error('backfill chat:', e)
  }

  // 2. Any local day the cloud hasn't seen
  try {
    const local = []
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (k && k.startsWith('sap_day_')) {
        try { local.push({ day: k.slice(8), data: JSON.parse(localStorage.getItem(k)) }) }
        catch { /* skip corrupt entry */ }
      }
    }
    if (local.length) {
      const { data: have } = await supabase
        .from('days').select('day').eq('user_id', u.id)
      const known = new Set((have || []).map((r) => r.day))
      const missing = local
        .filter((d) => !known.has(d.day))
        .map((d) => ({ user_id: u.id, day: d.day, data: d.data }))
      if (missing.length) {
        const { error } = await supabase.from('days').upsert(missing)
        if (error) console.error('backfill days:', error.message)
      }
    }
  } catch (e) {
    console.error('backfill days:', e)
  }

  try { localStorage.setItem(BACKFILL_FLAG, '1') } catch { /* ignore */ }
}

// Lightweight activity trail. Fire-and-forget: never awaited by the UI.
export async function trackEvent(event, meta = {}) {
  const u = await currentUser()
  if (!u) return
  const { error } = await supabase
    .from('app_events').insert({ user_id: u.id, event, meta })
  if (error) console.error('trackEvent:', error.message)
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
