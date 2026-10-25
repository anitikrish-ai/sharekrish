import 'server-only'
import { createHmac, timingSafeEqual } from 'node:crypto'

// A guest never gets a Supabase session — that would mean handing out
// credentials for a shared account. Instead, once /api/guest/verify
// confirms a code is valid, the server mints a small signed token
// (session id + expiry, HMAC'd with GUEST_SESSION_SECRET) and sets it as
// an HttpOnly cookie. Every /view request re-checks the signature and the
// expiry, and /api/guest/data re-checks guest_sessions.revoked against the
// DB — so revoking a session server-side takes effect immediately even
// though the cookie itself is stateless.
export interface GuestTokenPayload {
  sessionId: string
  expiresAt: number // epoch ms
}

function secret() {
  const s = process.env.GUEST_SESSION_SECRET
  if (!s) throw new Error('GUEST_SESSION_SECRET is not set')
  return s
}

export function signGuestToken(payload: GuestTokenPayload): string {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const sig = createHmac('sha256', secret()).update(body).digest('base64url')
  return `${body}.${sig}`
}

export function verifyGuestToken(token: string | undefined | null): GuestTokenPayload | null {
  if (!token) return null
  const [body, sig] = token.split('.')
  if (!body || !sig) return null

  const expectedSig = createHmac('sha256', secret()).update(body).digest('base64url')
  const a = Buffer.from(sig)
  const b = Buffer.from(expectedSig)
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null

  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString()) as GuestTokenPayload
    if (typeof payload.sessionId !== 'string' || typeof payload.expiresAt !== 'number') return null
    if (Date.now() > payload.expiresAt) return null
    return payload
  } catch {
    return null
  }
}

export const GUEST_COOKIE_NAME = 'cc_guest'
