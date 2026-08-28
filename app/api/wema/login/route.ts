import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const res = NextResponse.redirect(new URL('/wema/portfolio', request.url))
  res.cookies.set('wema_session', '1', {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 12,
  })
  return res
}