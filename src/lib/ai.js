// One place that talks to the ai-chat edge function.
// Throws a friendly Error on any problem; callers show e.message.

import { supabase } from './supabase.js'
import { metricsSummary } from './body.js'
import { activeConditions } from './conditions.js'
import { calorieTarget, proteinTarget } from './nutrition.js'

export function profileSummary(p) {
  if (!p) return {}
  const { name, dob, gender, height, weight, goals, dietType, bodyType,
    allergies, medications, foodsToAvoid, skinSensitivity, activityLevel,
    lifestyle, ethnicity, location, wakeTime, sleepTime, workStart, workEnd,
    lastPeriodStart } = p
  return { name, dob, gender, height, weight, goals, dietType, bodyType,
    allergies, medications, foodsToAvoid, skinSensitivity, activityLevel,
    lifestyle, ethnicity, location, wakeTime, sleepTime, workStart, workEnd,
    lastPeriodStart,
    ...bodyContext(p) }
}

// Everything the v5 Body report knows, handed to the assistant on every call.
// Purely additive — nothing above is replaced. Without this the AI tab invents
// its own calorie target and answers a PCOS question as though the user never
// logged PCOS: the one place SAP would look like it forgot something it
// clearly knows.
function bodyContext(p) {
  const conditions = activeConditions(p)
  const protein = proteinTarget(p)
  const measurements = trim({
    neck: p.neck, chest: p.chest, waist: p.waist,
    hips: p.hips, thigh: p.thigh, arm: p.arm,
  })

  return {
    targetWeight: p.targetWeight || undefined,
    medicalConditions: p.medicalConditions || undefined,
    measurementsCm: Object.keys(measurements).length ? measurements : undefined,
    healthConditions: conditions.length ? conditions.map((c) => c.name) : undefined,
    // Merged and de-duplicated, so the assistant never suggests something the
    // Diet or Fit tab would have filtered out.
    conditionFoodRules: pick(conditions.flatMap((c) => c.limit || []), 10),
    conditionTrainingRules: pick(conditions.flatMap((c) => c.avoid || []), 8),
    bodyComposition: metricsSummary(p) || undefined,
    dailyTargets: {
      calories: calorieTarget(p),
      // null means kidney disease — SAP deliberately sets no protein number,
      // and the assistant must not helpfully supply one.
      proteinGrams: protein == null
        ? 'deliberately not set — kidney disease, their doctor sets this'
        : protein,
    },
  }
}

const pick = (list, n) => {
  const out = [...new Set(list)].slice(0, n)
  return out.length ? out : undefined
}

const trim = (obj) =>
  Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== '' && v != null))

// messages: [{role:'user'|'model', text}]
// images (optional): [{ mime, data(base64, no prefix) }]
// source (optional): which screen asked — recorded in the ai_messages log
export async function askAI({ messages, profile, images, source = 'chat' }) {
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
        source,
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
