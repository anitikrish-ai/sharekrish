import { NextResponse, type NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyGuestToken, GUEST_COOKIE_NAME } from '@/lib/guestSession'

// Read-only data feed for /view. Every request re-verifies the signed
// cookie (expiry) AND re-checks guest_sessions.revoked in the database, so
// a revoke from the owner's dashboard takes effect on the guest's very
// next request — the cookie alone being "not expired yet" isn't enough.
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const payload = verifyGuestToken(request.cookies.get(GUEST_COOKIE_NAME)?.value)
  if (!payload) {
    return NextResponse.json({ error: 'Session expired. Enter your code again.' }, { status: 401 })
  }

  const admin = createAdminClient()
  const { data: session, error: sessionError } = await admin
    .from('guest_sessions')
    .select('*, access_codes(*)')
    .eq('id', payload.sessionId)
    .maybeSingle()

  const accessCode = session?.access_codes as
    | { category_ids: string[] | null; revoked: boolean; user_id: string }
    | undefined

  if (
    sessionError ||
    !session ||
    session.revoked ||
    !accessCode ||
    accessCode.revoked ||
    new Date(session.expires_at).getTime() < Date.now()
  ) {
    return NextResponse.json({ error: 'This guest session has ended.' }, { status: 401 })
  }

  let query = admin
    .from('items')
    .select('*')
    .eq('user_id', accessCode.user_id)
    .eq('is_archived', false)
    .order('is_pinned', { ascending: false })
    .order('updated_at', { ascending: false })

  if (accessCode.category_ids && accessCode.category_ids.length > 0) {
    query = query.in('category_id', accessCode.category_ids)
  }

  const [{ data: items, error: itemsError }, { data: categories, error: categoriesError }] = await Promise.all([
    query,
    admin.from('categories').select('*').eq('user_id', accessCode.user_id),
  ])

  if (itemsError || categoriesError) {
    return NextResponse.json({ error: 'Could not load items.' }, { status: 500 })
  }

  return NextResponse.json({
    items,
    categories,
    expiresAt: new Date(session.expires_at).getTime(),
  })
}
