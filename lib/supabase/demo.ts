import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * A no-op auth surface used when Supabase credentials are not configured
 * (e.g. a preview/hackathon deploy without env vars). Every method resolves
 * without error so the demo flows still work through the local client session
 * (see lib/auth/client-session.ts) and pages can prerender.
 */
const DEMO_AUTH = {
  signInWithPassword: async () => ({ data: { user: null, session: null }, error: null }),
  signUp: async () => ({ data: { user: null, session: {} }, error: null }),
  resetPasswordForEmail: async () => ({ error: null }),
  updateUser: async () => ({ error: null }),
  exchangeCodeForSession: async () => ({ data: { user: null, session: null }, error: null }),
  getUser: async () => ({ data: { user: null }, error: null }),
}

export function demoSupabaseClient(): SupabaseClient {
  return { auth: DEMO_AUTH } as unknown as SupabaseClient
}