// SAP AI assistant — Supabase Edge Function
// Your Gemini key lives here on the server. Users never see or enter keys.
// Deploy:  supabase functions deploy ai-chat
// Secret:  supabase secrets set GEMINI_API_KEY=your_key_here

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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })
  if (req.method !== 'POST') return json({ error: 'POST only' }, 405)

  try {
    const key = Deno.env.get('GEMINI_API_KEY')
    if (!key) return json({ error: 'AI key not set on the server yet.' }, 500)

    const model = Deno.env.get('GEMINI_MODEL') || 'gemini-2.5-flash'
    const { messages = [], profile = {}, image } = await req.json()

    if (!Array.isArray(messages) || messages.length === 0) {
      return json({ error: 'No message received.' }, 400)
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

    // Attach the photo (if any) to the latest user message
    if (image?.data) {
      const last = contents[contents.length - 1]
      if (last?.role === 'user') {
        last.parts.push({
          inline_data: { mime_type: image.mime || 'image/jpeg', data: image.data },
        })
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
      return json({ error: msg }, r.status === 429 ? 429 : 502)
    }

    const reply =
      data?.candidates?.[0]?.content?.parts
        ?.map((p: { text?: string }) => p.text || '')
        .join('') || 'I could not form a reply — try rephrasing that.'

    return json({ reply })
  } catch (e) {
    return json({ error: `Server error: ${String(e)}` }, 500)
  }
})
