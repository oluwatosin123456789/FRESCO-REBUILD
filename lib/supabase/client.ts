import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'
import { demoSupabaseClient } from './demo'

let browserClient: SupabaseClient | undefined

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return demoSupabaseClient()
  if (!browserClient) {
    browserClient = createBrowserClient(url, key)
  }
  return browserClient
}