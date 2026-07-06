// Loads the last N days of tracker data: local records merged with the
// cloud (cloud wins per-day), returned as a continuous series for charts.

import { supabase } from './supabase.js'
import { buildSeries, dayKeyOffset } from './analytics.js'

function localDays() {
  const out = []
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith('sap_day_')) {
        try {
          out.push([key.slice(8), JSON.parse(localStorage.getItem(key))])
        } catch { /* skip corrupt entry */ }
      }
    }
  } catch { /* storage blocked */ }
  return out
}

export async function getHistory(n = 30) {
  const map = new Map(localDays())
  if (supabase) {
    try {
      const { data: userData } = await supabase.auth.getUser()
      const user = userData?.user
      if (user) {
        const since = dayKeyOffset(n - 1)
        const { data, error } = await supabase
          .from('days').select('day, data')
          .eq('user_id', user.id).gte('day', since)
        if (!error && data) {
          for (const row of data) {
            map.set(row.day, { ...(map.get(row.day) || {}), ...(row.data || {}) })
          }
        }
      }
    } catch (e) {
      console.error('history cloud pull:', e)
    }
  }
  return buildSeries(map, n)
}
