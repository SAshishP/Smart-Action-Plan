// Phase 2 cloud layer. Safe to import today: it returns null until you
// create a free Supabase project and add the two env vars below to a
// `.env` file (and to Vercel → Project → Settings → Environment Variables):
//
//   VITE_SUPABASE_URL=https://xxxx.supabase.co
//   VITE_SUPABASE_ANON_KEY=eyJ...
//
// The anon key is safe to ship in the app; real security comes from
// Row Level Security policies (see supabase/schema.sql).

import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = url && anonKey ? createClient(url, anonKey) : null
export const cloudReady = Boolean(supabase)
