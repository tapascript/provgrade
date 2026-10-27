import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const canRealtime =
  typeof window !== 'undefined' && !!supabaseUrl && !!supabaseAnonKey

if (!canRealtime) {
  console.warn(
    'Live dashboard disabled: set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env',
  )
}

/**
 * Browser-only Supabase client used for realtime subscriptions.
 * Uses the anon (public) key - never the service-role key in the browser.
 */
export const supabaseBrowser = canRealtime
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null
