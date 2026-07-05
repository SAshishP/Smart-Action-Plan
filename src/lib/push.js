// Turn on push reminders for this phone.
// Every return value is { ok, message } — never throws.

import { supabase } from './supabase.js'

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(base64)
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)))
}

export async function enablePush() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    return {
      ok: false,
      message:
        'This phone can’t receive push here yet. On iPhone: add SAP to the Home Screen, open it from that icon, then tap this again.',
    }
  }
  if (!supabase) {
    return { ok: false, message: 'Cloud isn’t connected yet (see PHASE2-SETUP.md).' }
  }
  const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY
  if (!vapidKey) {
    return { ok: false, message: 'Push keys aren’t configured yet (see PHASE25-SETUP.md).' }
  }

  const perm = await Notification.requestPermission()
  if (perm !== 'granted') {
    return {
      ok: false,
      message: 'Notifications were not allowed. Enable them for SAP in your phone Settings, then try again.',
    }
  }

  try {
    const reg = await navigator.serviceWorker.ready
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidKey),
    })
    const { data } = await supabase.auth.getUser()
    const user = data?.user
    if (!user) return { ok: false, message: 'Sign in first, then enable reminders.' }

    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
    const { error } = await supabase.from('push_subscriptions').upsert({
      endpoint: sub.endpoint,
      user_id: user.id,
      subscription: sub.toJSON(),
      tz,
    })
    if (error) return { ok: false, message: 'Could not save on the server: ' + error.message }

    return {
      ok: true,
      message: 'Reminders are ON ✅ You’ll get nudges through the day — even with the app closed.',
    }
  } catch (e) {
    return { ok: false, message: 'Could not enable push: ' + (e?.message || e) }
  }
}
