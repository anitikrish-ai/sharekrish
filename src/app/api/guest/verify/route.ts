import { NextResponse, type NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { signGuestToken, GUEST_COOKIE_NAME } from '@/lib/guestSession'

const GUEST_SESSION_MINUTES = 30 // how long a *redeemed* session lasts, separate from the code's own TTL

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const { code } = await request.json().catch(() => ({ code: '' }))
  if (typeof code !== 'string' || !code.trim()) {
    return NextResponse.json({ error: 'Enter an access code.' }, { status: 400 })
  }

  const admin = createAdminClient()
  const { data: accessCode, error } = await admin
    .from('access_codes')
    .select('*')
    .eq('code', code.trim())
    .maybeSingle()

  if (error) return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })

  const now = Date.now()
  const invalid =
    !accessCode ||
    accessCode.revoked ||
    new Date(accessCode.expires_at).getTime() < now ||
    accessCode.sessions_used >= accessCode.max_sessions

  // Deliberately vague — don't tell a guesser *why* a code failed
  // (expired vs. revoked vs. used up vs. never existed).
  if (invalid) {
    return NextResponse.json({ error: 'That code is invalid or has expired.' }, { status: 401 })
  }

  const sessionExpiresAt = now + GUEST_SESSION_MINUTES * 60_000

  const { data: session, error: sessionError } = await admin
    .from('guest_sessions')
    .insert({
      access_code_id: accessCode!.id,
      user_id: accessCode!.user_id,
      expires_at: new Date(sessionExpiresAt).toISOString(),
    })
    .select()
    .single()

  if (sessionError) return NextResponse.json({ error: 'Could not start a session.' }, { status: 500 })

  await admin
    .from('access_codes')
    .update({ sessions_used: accessCode!.sessions_used + 1 })
    .eq('id', accessCode!.id)

  const token = signGuestToken({ sessionId: session.id, expiresAt: sessionExpiresAt })

  const response = NextResponse.json({ ok: true, expiresAt: sessionExpiresAt })
  response.cookies.set(GUEST_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: new Date(sessionExpiresAt),
  })
  return response
}
