// One place that talks to the ai-chat edge function.
// Throws a friendly Error on any problem; callers show e.message.

import { supabase } from './supabase.js'

export function profileSummary(p) {
  if (!p) return {}
  const { name, dob, gender, height, weight, goals, dietType, bodyType,
    allergies, medications, foodsToAvoid, skinSensitivity, activityLevel,
    lifestyle, ethnicity, location, wakeTime, sleepTime, workStart, workEnd,
    lastPeriodStart } = p
  return { name, dob, gender, height, weight, goals, dietType, bodyType,
    allergies, medications, foodsToAvoid, skinSensitivity, activityLevel,
    lifestyle, ethnicity, location, wakeTime, sleepTime, workStart, workEnd,
    lastPeriodStart }
}

// messages: [{role:'user'|'model', text}]
// images (optional): [{ mime, data(base64, no prefix) }]
export async function askAI({ messages, profile, images }) {
  if (!supabase) throw new Error('Cloud isn’t set up yet.')
  const { data } = await supabase.auth.getSession()
  const session = data?.session
  if (!session) throw new Error('You are signed out — sign in again to use the assistant.')

  const res = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        messages,
        profile: profileSummary(profile),
        images: images && images.length ? images : undefined,
      }),
    }
  )
  const body = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(
      res.status === 429
        ? 'The free AI limit for today is reached — it resets tomorrow.'
        : body.error || 'The assistant had a problem. Try again.'
    )
  }
  return body.reply || '…'
}

export function dataUrlToImage(dataUrl) {
  return { mime: 'image/jpeg', data: dataUrl.split(',')[1] }
}
