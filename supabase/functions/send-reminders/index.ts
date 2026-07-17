// SAP · send-reminders — runs every 15 minutes (scheduled by pg_cron).
// Looks at each subscribed phone, builds that user's plan times from their
// profile in THEIR timezone, and pushes any reminder due in the next 15 min.
//
// Deploy:  supabase functions deploy send-reminders --no-verify-jwt
// Secrets: VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, CRON_SECRET

import { createClient } from 'npm:@supabase/supabase-js@2'
import webpush from 'npm:web-push@3'

function toMin(hhmm: unknown, fallback: number): number {
  if (typeof hhmm !== 'string' || !/^\d{1,2}:\d{2}$/.test(hhmm)) return fallback
  const [h, m] = hhmm.split(':').map(Number)
  if (h > 23 || m > 59) return fallback
  return h * 60 + m
}

function localMinutes(tz: string): number {
  try {
    const s = new Intl.DateTimeFormat('en-GB', {
      timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: false,
    }).format(new Date())
    const [h, m] = s.split(':').map(Number)
    return h * 60 + m
  } catch {
    const d = new Date()
    return d.getUTCHours() * 60 + d.getUTCMinutes()
  }
}

// Mirror of the app's day plan, trimmed to the reminders worth interrupting for
function reminders(p: Record<string, unknown>) {
  const wake = toMin(p.wakeTime, 390)
  const ws = toMin(p.workStart, 540)
  const we = toMin(p.workEnd, 1080)
  const sleep = toMin(p.sleepTime, 1350)
  const lunch = Math.round((ws + we) / 2)
  return [
    { min: wake, title: 'Good morning ☀️', body: 'Start with a full glass of water.' },
    { min: wake + 90, title: 'Breakfast time', body: 'Protein first — fuel the day.' },
    { min: ws + 120, title: 'Water check 💧', body: 'Glass #3 by now?' },
    { min: lunch, title: 'Lunch', body: 'Eat away from the screen.' },
    { min: we - 180, title: 'Snack + water', body: 'Something light, not fried.' },
    { min: we + 45, title: 'Workout time 💪', body: '30–45 minutes. Future you is watching.' },
    { min: we + 120, title: 'Dinner', body: 'Lighter than lunch, 3h before sleep.' },
    { min: sleep - 45, title: 'Prep for tomorrow', body: 'Clothes out, bag packed, one note for morning-you.' },
    { min: sleep - 25, title: 'Night care 🌙', body: 'Skin care, then wind down.' },
    { min: sleep, title: 'Sleep time', body: 'Phone away. Good night.' },
  ]
}

Deno.serve(async (req) => {
  // Only the scheduler (which knows the secret) may trigger this
  const secret = Deno.env.get('CRON_SECRET')
  if (secret && req.headers.get('x-cron-secret') !== secret) {
    return new Response('forbidden', { status: 403 })
  }

  const pub = Deno.env.get('VAPID_PUBLIC_KEY')
  const priv = Deno.env.get('VAPID_PRIVATE_KEY')
  if (!pub || !priv) return Response.json({ error: 'VAPID keys not set' }, { status: 500 })
  webpush.setVapidDetails('mailto:admin@sap.app', pub, priv)

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const { data: subs, error } = await supabase
    .from('push_subscriptions')
    .select('endpoint, subscription, tz, user_id')
  if (error) return Response.json({ error: error.message }, { status: 500 })

  const { data: profs } = await supabase.from('profiles').select('id, data')
  const profileOf = new Map((profs || []).map((p) => [p.id, p.data || {}]))

  let sent = 0
  let removed = 0

  for (const s of subs || []) {
    const profile = profileOf.get(s.user_id) || {}
    const now = localMinutes(s.tz || 'UTC')
    const due = reminders(profile).filter((r) => {
      const m = ((r.min % 1440) + 1440) % 1440
      return m >= now && m < now + 15
    })
    for (const r of due) {
      try {
        await webpush.sendNotification(
          s.subscription,
          JSON.stringify({ title: r.title, body: r.body })
        )
        sent++
      } catch (e) {
        const code = (e as { statusCode?: number }).statusCode
        if (code === 404 || code === 410) {
          // Phone unsubscribed / app removed — clean up
          await supabase.from('push_subscriptions').delete().eq('endpoint', s.endpoint)
          removed++
        } else {
          console.error('push failed:', s.endpoint.slice(0, 40), e)
        }
      }
    }
  }

  return Response.json({ sent, removed, checked: (subs || []).length })
})
