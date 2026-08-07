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

// Only the app's own origins may drive this endpoint from a browser. With '*'
// any attacker-hosted page could call it, which matters because the anon key
// that reaches it is public by design. Set AI_ALLOWED_ORIGINS to a comma list
// of your real origins:
//   supabase secrets set AI_ALLOWED_ORIGINS=https://your-app.vercel.app
// Vercel preview deployments get a fresh subdomain each time, so *.vercel.app
// previews are matched by suffix rather than needing a new secret per deploy.
const ALLOWED_ORIGINS: string[] = (Deno.env.get('AI_ALLOWED_ORIGINS') || '')
  .split(',').map((s: string) => s.trim()).filter(Boolean)

function originAllowed(origin: string): boolean {
  if (!origin) return false
  if (ALLOWED_ORIGINS.includes(origin)) return true
  // Local development.
  if (/^https?:\/\/(localhost|127\.0\.0\.1|\d+\.\d+\.\d+\.\d+)(:\d+)?$/.test(origin)) return true
  // The owner's own Vercel previews, only when a *.vercel.app origin was
  // configured — otherwise this rule is off entirely.
  if (ALLOWED_ORIGINS.some((o: string) => o.endsWith('.vercel.app')) && /^https:\/\/[a-z0-9-]+\.vercel\.app$/.test(origin)) return true
  return false
}

// No allow-list configured means the old permissive behaviour, so an owner who
// upgrades without setting the secret does not silently lose their assistant.
// The startup log line is there to make that state visible rather than quiet.
if (!ALLOWED_ORIGINS.length) {
  console.warn('AI_ALLOWED_ORIGINS is not set — accepting any origin. Set it to lock this down.')
}

function corsFor(req: Request) {
  const origin = req.headers.get('origin') || ''
  const allow = !ALLOWED_ORIGINS.length ? '*' : originAllowed(origin) ? origin : ''
  return {
    ...(allow ? { 'Access-Control-Allow-Origin': allow } : {}),
    'Vary': 'Origin',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  }
}

function json(body: unknown, status = 200, req?: Request) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...(req ? corsFor(req) : { 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' }),
      'Content-Type': 'application/json',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}

// ---- audit logging -------------------------------------------------------

const admin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

const LOG_ON = Deno.env.get('LOG_AI') !== 'off'
const LOG_IMAGES = Deno.env.get('LOG_AI_IMAGES') !== 'off'

// ---- limits --------------------------------------------------------------

// 4 photos at ~700 KB of base64 each, plus the profile and the thread, with
// headroom. Above this the isolate risks being OOM-killed mid-request, which
// looks like a mystery outage rather than a rejected request.
const MAX_BODY_BYTES = 6 * 1024 * 1024

// A real conversation never needs more than this, and capping both the number
// of turns and the size of each one keeps the system prompt from being pushed
// out of the context window by a caller-supplied wall of text.
const MAX_TURNS = 30
const MAX_TURN_CHARS = 8000

// Per-user quota. Deliberately generous for real use and ruinous for a script.
const QUOTA = {
  perHour: Number(Deno.env.get('AI_QUOTA_HOUR') || 40),
  perDay: Number(Deno.env.get('AI_QUOTA_DAY') || 150),
}

// Read the body with a hard ceiling. Content-Length is caller-supplied and can
// lie, so the cap is enforced on bytes actually received.
async function readCapped(req: Request, max: number): Promise<string | null> {
  if (!req.body) return ''
  const reader = req.body.getReader()
  const chunks: Uint8Array[] = []
  let total = 0
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    total += value.length
    if (total > max) {
      try { await reader.cancel() } catch { /* already closed */ }
      return null
    }
    chunks.push(value)
  }
  const all = new Uint8Array(total)
  let at = 0
  for (const c of chunks) { all.set(c, at); at += c.length }
  return new TextDecoder().decode(all)
}

// Magic-byte sniff on the first bytes of the base64 payload. Returns the real
// mime type, or null when it is not an image we accept. We decode only the
// first few bytes rather than the whole payload.
function sniffImage(b64: string): string | null {
  if (typeof b64 !== 'string' || b64.length < 16) return null
  let head: Uint8Array
  try {
    const bin = atob(b64.slice(0, 32).replace(/[^A-Za-z0-9+/=]/g, ''))
    head = Uint8Array.from(bin, (c) => c.charCodeAt(0))
  } catch {
    return null
  }
  if (head[0] === 0xff && head[1] === 0xd8 && head[2] === 0xff) return 'image/jpeg'
  if (head[0] === 0x89 && head[1] === 0x50 && head[2] === 0x4e && head[3] === 0x47) return 'image/png'
  if (head[0] === 0x52 && head[1] === 0x49 && head[2] === 0x46 && head[3] === 0x46 &&
      head[8] === 0x57 && head[9] === 0x45 && head[10] === 0x42 && head[11] === 0x50) return 'image/webp'
  return null
}

// Rolling-window quota, counted from the audit log that already exists — so
// there is no second source of truth to keep in step. Fails OPEN: if the count
// query breaks, users keep working and the owner sees it in the logs. A quota
// check that can take the whole assistant down is worse than the abuse it
// prevents.
async function withinQuota(userId: string): Promise<{ ok: boolean; message: string; retryAfter: number }> {
  try {
    const now = Date.now()
    const hourAgo = new Date(now - 3600_000).toISOString()
    const dayAgo = new Date(now - 86_400_000).toISOString()

    const [hour, day] = await Promise.all([
      admin.from('ai_messages').select('id', { count: 'exact', head: true })
        .eq('user_id', userId).gte('created_at', hourAgo),
      admin.from('ai_messages').select('id', { count: 'exact', head: true })
        .eq('user_id', userId).gte('created_at', dayAgo),
    ])

    if (hour.error || day.error) return { ok: true, message: '', retryAfter: 0 }
    if ((hour.count ?? 0) >= QUOTA.perHour) {
      return { ok: false, message: 'You have used a lot of AI in the last hour — it opens up again shortly.', retryAfter: 3600 }
    }
    if ((day.count ?? 0) >= QUOTA.perDay) {
      return { ok: false, message: 'That is today\'s AI limit. It resets tomorrow.', retryAfter: 86400 }
    }
    return { ok: true, message: '', retryAfter: 0 }
  } catch {
    return { ok: true, message: '', retryAfter: 0 }
  }
}

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
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsFor(req) })
  if (req.method !== 'POST') return json({ error: 'POST only' }, 405, req)

  const startedAt = Date.now()
  let userId: string | null = null
  let lastUserText = ''
  let source = 'chat'
  let imageCount = 0
  let imagePaths: string[] | null = null
  let usedModel = ''

  try {
    const key = Deno.env.get('GEMINI_API_KEY')
    if (!key) return json({ error: 'AI key not set on the server yet.' }, 500, req)

    // ---- FAIL CLOSED ON IDENTITY -----------------------------------------
    // The platform's verify_jwt only proves the bearer token was SIGNED BY
    // THIS PROJECT. The publishable anon key is exactly such a token, and it
    // ships inside the public JS bundle — so verify_jwt alone lets anyone who
    // views source call this endpoint. getUser() rejects the anon key ("missing
    // sub claim") and we get null back, which is the ONLY thing standing
    // between the owner's Gemini key and the open internet. Resolve it first,
    // before any parsing or any outbound call, and refuse when it is null.
    userId = await userIdFrom(req)
    if (!userId) return json({ error: 'Sign in to use the assistant.' }, 401, req)

    // ---- QUOTA ------------------------------------------------------------
    // Checked before the body is read so a flood costs us as little as
    // possible. Fails OPEN on an infrastructure error: a broken quota table
    // must not take the assistant down for everyone.
    const quota = await withinQuota(userId)
    if (!quota.ok) {
      return json({ error: quota.message, retryAfter: quota.retryAfter }, 429, req)
    }

    const model = Deno.env.get('GEMINI_MODEL') || 'gemini-2.5-flash'
    usedModel = model

    // Cap the raw body before parsing. Content-Length is a hint, not a
    // guarantee, so the read below is also bounded.
    const declared = Number(req.headers.get('content-length') || 0)
    if (declared > MAX_BODY_BYTES) {
      return json({ error: 'That request is too large. Try fewer or smaller photos.' }, 413, req)
    }
    const rawBody = await readCapped(req, MAX_BODY_BYTES)
    if (rawBody === null) {
      return json({ error: 'That request is too large. Try fewer or smaller photos.' }, 413, req)
    }

    let parsed: Record<string, unknown>
    try {
      parsed = JSON.parse(rawBody)
    } catch {
      return json({ error: 'Malformed request.' }, 400, req)
    }

    const { messages = [], profile = {}, image, images, source: src } = parsed as {
      messages?: Array<{ role?: string; text?: string }>
      profile?: unknown
      image?: { mime?: string; data?: string }
      images?: Array<{ mime?: string; data?: string }>
      source?: string
    }
    // Keep the audit label readable and free of path separators. `source` is
    // interpolated into a storage object key below; storage keys are opaque so
    // "../" cannot traverse, but a clean label keeps admin_photos legible.
    if (typeof src === 'string' && src) source = src.replace(/[^a-z0-9_-]/gi, '').slice(0, 40) || 'chat'

    if (!Array.isArray(messages) || messages.length === 0) {
      return json({ error: 'No message received.' }, 400, req)
    }

    // Accept either a single image or an array (e.g. initial vs latest photo)
    const imageList: Array<{ mime?: string; data: string }> =
      (Array.isArray(images) ? images.filter((i) => i?.data) : image?.data ? [image] : []) as Array<{ mime?: string; data: string }>
    if (imageList.length > 4) imageList.length = 4

    // Reject anything that is not actually a JPEG/PNG/WebP. This is not what
    // stops a determined user putting a junk file in their own storage folder
    // — the storage RLS policy already permits that directly, and always did.
    // It is here so the model is never handed something that is not an image
    // and so the archived copy is honestly labelled.
    for (const img of imageList) {
      const kind = sniffImage(img.data)
      if (!kind) return json({ error: 'One of those files is not a photo.' }, 400, req)
      img.mime = kind
    }

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
      'avoid, skin sensitivity, schedule, gender, health conditions, body',
      'measurements and body composition.',
      '',
      `USER PROFILE: ${JSON.stringify(profile)}`,
      '',
      'Rules:',
      '- Be warm, specific and practical. Short answers for short questions.',
      '- NEVER suggest anything containing the user\'s allergies or avoided foods.',
      '- Respect healthConditions in every answer, and honour conditionFoodRules',
      '  and conditionTrainingRules — the rest of the app already filters meals',
      '  and exercises by them, so contradicting them makes SAP look broken.',
      '- dailyTargets holds the calorie and protein numbers the app itself shows.',
      '  Use those exact figures rather than calculating your own. If',
      '  proteinGrams says it is deliberately not set, do not supply a number.',
      '- Never tell anyone to start, stop or change a medication or a dose.',
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
    // Only two roles exist as far as Gemini is concerned, and anything that is
    // not literally 'user' becomes 'model' — so a caller cannot invent a third
    // role (e.g. 'system') and smuggle instructions in past the system prompt.
    // Each turn is length-capped so a single enormous message cannot crowd the
    // system prompt out of the context window.
    const contents = messages.slice(-MAX_TURNS).map((m) => ({
      role: m?.role === 'user' ? 'user' : 'model',
      parts: [{ text: String(m?.text ?? '').slice(0, MAX_TURN_CHARS) }] as Part[],
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
      return json({ error: msg }, r.status === 429 ? 429 : 502, req)
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

    return json({ reply }, 200, req)
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
    return json({ error: `Server error: ${String(e)}` }, 500, req)
  }
})
