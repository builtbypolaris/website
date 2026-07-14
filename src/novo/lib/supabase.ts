import { createClient } from '@supabase/supabase-js'

// Strip ALL whitespace: a pasted env var containing a line break gets baked
// into the bundle and makes every fetch throw "Invalid value" (illegal header
// character). This happened on Vercel once — never trust pasted secrets.
const url = ((import.meta.env.VITE_SUPABASE_URL as string) ?? '').replace(/\s+/g, '')
const key = ((import.meta.env.VITE_SUPABASE_ANON_KEY as string) ?? '').replace(/\s+/g, '')

if (!url || !key) {
  throw new Error(`Supabase env vars missing — VITE_SUPABASE_URL=${url}, VITE_SUPABASE_ANON_KEY=${key ? '[set]' : 'undefined'}`)
}

export const supabase = createClient(url, key)
