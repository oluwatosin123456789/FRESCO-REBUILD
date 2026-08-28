import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      const role = user?.user_metadata?.role
      const dest =
        role === 'CONSUMER' ? '/consumer' : role === 'WEMA_ANALYST' ? '/wema' : '/farmer'
      return NextResponse.redirect(`${origin}${next === '/' ? dest : next}`)
    }
  }

  return NextResponse.redirect(`${origin}/auth/login`)
}