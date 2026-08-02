// SAP AI assistant — Supabase Edge Function
// Your Gemini key lives here on the server. Users never see or enter keys.
// Deploy:  supabase functions deploy ai-chat
// Secret:  supabase secrets set GEMINI_API_KEY=your_key_here
//
// Every request+reply is logged to ai_messages (see supabase/schema-phase3.sql)
// so the project owner can review activity in the dashboard. Logging happens
// here rather than in the app so it covers all screens and can't be skipped by
// the client. Set LOG_AI=off to disable, LOG_AI_IMAGES=off to keep text only.

import { createClient } from 'npm:@supabase/supabase-js@2'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  })
}

// ---- audit logging -------------------------------------------------------

const admin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

const LOG_ON = Deno.env.get('LOG_AI') !== 'off'
const LOG_IMAGES = Deno.env.get('LOG_AI_IMAGES') !== 'off'

// The platform already verified the JWT before we ran, so we re-read it here
// only to learn *which* user this is.
async function userIdFrom(req: Request): Promise<string | null> {
  const token = req.headers.get('Authorization')?.replace(/^Bearer\s+/i, '')
  if (!token) return null
  try {
    const { data } = await admin.auth.getUser(token)
    return data?.user?.id || null
  } catch {
    return null
  }
}

// Keep a copy of anything the user photographed, alongside their other photos.
// Each one is also registered in the `photos` table with a slot naming the
// screen it came from ('chat_diet-photo'), so it shows up in admin_photos with
// a readable label instead of being an anonymous file in the bucket.
async function archiveImages(
  userId: string,
  source: string,
  imgs: Array<{ mime?: string; data: string }>
): Promise<string[]> {
  const paths: string[] = []
  const today = new Date().toISOString().slice(0, 10)
  for (let i = 0; i < imgs.length; i++) {
    try {
      const bytes = Uint8Array.from(atob(imgs[i].data), (c) => c.charCodeAt(0))
      const stamp = new Date().toISOString().replace(/[:.]/g, '-')
      const path = `${userId}/chat/${source}_${stamp}_${i}.jpg`
      const { error } = await admin.storage
        .from('photos')
        .upload(path, bytes, { contentType: imgs[i].mime || 'image/jpeg', upsert: true })
      if (error) { console.error('archive image:', error.message); continue }
      paths.push(path)
      const { error: rowErr } = await admin.from('photos').insert({
        user_id: userId, slot: `chat_${source}`, taken_on: today, storage_path: path,
      })
      if (rowErr) console.error('archive image row:', rowErr.message)
    } catch (e) {
      console.error('archive image:', e)
    }
  }
  return paths
}

type LogRow = {
  user_id: string
  source: string
  user_text: string
  reply_text: string | null
  image_count: number
  image_paths: string[] | null
  model: string
  latency_ms: number
  error: string | null
}

async function logCall(row: LogRow) {
  if (!LOG_ON) return
  const { error } = await admin.from('ai_messages').insert(row)
  if (error) console.error('ai_messages insert:', error.message)
}

// --------------------------------------------------------------------------

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })
  if (req.method !== 'POST') return json({ error: 'POST only' }, 405)

  const startedAt = Date.now()
  let userId: string | null = null
  let lastUserText = ''
  let source = 'chat'
  let imageCount = 0
  let imagePaths: string[] | null = null
  let usedModel = ''

  try {
    const key = Deno.env.get('GEMINI_API_KEY')
    if (!key) return json({ error: 'AI key not set on the server yet.' }, 500)

    const model = Deno.env.get('GEMINI_MODEL') || 'gemini-2.5-flash'
    usedModel = model
    const { messages = [], profile = {}, image, images, source: src } = await req.json()
    if (typeof src === 'string' && src) source = src.slice(0, 40)

    if (!Array.isArray(messages) || messages.length === 0) {
      return json({ error: 'No message received.' }, 400)
    }

    // Accept either a single image or an array (e.g. initial vs latest photo)
    const imageList: Array<{ mime?: string; data: string }> =
      Array.isArray(images) ? images.filter((i) => i?.data) : image?.data ? [image] : []
    if (imageList.length > 4) imageList.length = 4

    // Everything needed for the audit row, gathered before we call out to Gemini
    // so a failure downstream still gets logged with the user's question intact.
    userId = await userIdFrom(req)
    imageCount = imageList.length
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i]?.role === 'user') { lastUserText = String(messages[i].text || ''); break }
    }
    if (userId && imageList.length && LOG_IMAGES) {
      imagePaths = await archiveImages(userId, source, imageList)
    }

    const system = [
      'You are the personal assistant inside SAP (Smart Action Plan), a private',
      'lifestyle app. You know this user\'s profile and you personalize every',
      'answer to it: their goals, diet type, allergies, medications, foods to',
      'avoid, skin sensitivity, schedule, and gender.',
      '',
      `USER PROFILE: ${JSON.stringify(profile)}`,
      '',
      'Rules:',
      '- Be warm, specific and practical. Short answers for short questions.',
      '- NEVER suggest anything containing the user\'s allergies or avoided foods.',
      '- If a food photo is sent, estimate the dish, portion size and calories,',
      '  and say clearly it is an estimate.',
      '- If a body/face/hair photo is sent, give constructive, kind observations',
      '  and practical suggestions. Never body-shame.',
      '- You give lifestyle suggestions, not medical advice. For symptoms,',
      '  medications, injuries or anything health-critical, advise seeing a',
      '  doctor. Do not diagnose.',
      '- If asked about menstrual phases, adapt diet/workout advice to the phase.',
    ].join('\n')

    type Part = { text?: string; inline_data?: { mime_type: string; data: string } }
    const contents = messages.map((m: { role: string; text: string }) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: String(m.text || '') }] as Part[],
    }))

    // Attach the photo(s) to the latest user message
    if (imageList.length) {
      const last = contents[contents.length - 1]
      if (last?.role === 'user') {
        for (const img of imageList) {
          last.parts.push({
            inline_data: { mime_type: img.mime || 'image/jpeg', data: img.data },
          })
        }
      }
    }

    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: system }] },
          contents,
          generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
        }),
      }
    )

    const data = await r.json()
    if (!r.ok) {
      const msg = data?.error?.message || 'The AI service returned an error.'
      if (userId) {
        await logCall({
          user_id: userId, source, user_text: lastUserText, reply_text: null,
          image_count: imageCount, image_paths: imagePaths, model: usedModel,
          latency_ms: Date.now() - startedAt, error: msg,
        })
      }
      return json({ error: msg }, r.status === 429 ? 429 : 502)
    }

    const reply =
      data?.candidates?.[0]?.content?.parts
        ?.map((p: { text?: string }) => p.text || '')
        .join('') || 'I could not form a reply — try rephrasing that.'

    if (userId) {
      await logCall({
        user_id: userId, source, user_text: lastUserText, reply_text: reply,
        image_count: imageCount, image_paths: imagePaths, model: usedModel,
        latency_ms: Date.now() - startedAt, error: null,
      })
    }

    return json({ reply })
  } catch (e) {
    // Logging must never turn a working reply into a failure — but a genuine
    // crash is still worth recording against the user who hit it.
    if (userId) {
      await logCall({
        user_id: userId, source, user_text: lastUserText, reply_text: null,
        image_count: imageCount, image_paths: imagePaths, model: usedModel,
        latency_ms: Date.now() - startedAt, error: String(e),
      }).catch(() => {})
    }
    return json({ error: `Server error: ${String(e)}` }, 500)
  }
})
