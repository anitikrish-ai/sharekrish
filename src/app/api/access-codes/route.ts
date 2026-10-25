import { NextResponse, type NextRequest } from 'next/server'
import { randomInt } from 'node:crypto'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

// access_codes has no RLS policies for anon/authenticated (see migration),
// so the only way to touch it is the service-role admin client — and we
// only reach for that after confirming, via the owner's own session cookie,
// that this request really is the owner. That split (auth check with the
// user's client, the actual write with the admin client) is what makes
// "owner-generated" codes enforceable server-side rather than just a UI
// convention.
async function requireOwner() {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  const ownerEmail = process.env.OWNER_EMAIL?.toLowerCase()
  if (!user || user.email?.toLowerCase() !== ownerEmail) return null
  return user
}

function generateCode(): string {
  // 6 digits, human-typeable on a second phone's keyboard
  return String(randomInt(0, 1_000_000)).padStart(6, '0')
}

export async function GET() {
  const user = await requireOwner()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('access_codes')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ codes: data })
}

export async function POST(request: NextRequest) {
  const user = await requireOwner()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  const ttlMinutes = Number.isFinite(body.ttlMinutes) ? Math.min(Math.max(body.ttlMinutes, 1), 120) : 5
  const maxSessions = Number.isFinite(body.maxSessions) ? Math.min(Math.max(body.maxSessions, 1), 10) : 1
  const categoryIds: string[] | null = Array.isArray(body.categoryIds) && body.categoryIds.length > 0
    ? body.categoryIds
    : null

  const admin = createAdminClient()
  const expiresAt = new Date(Date.now() + ttlMinutes * 60_000).toISOString()

  // Codes are unique; retry once on the astronomically unlikely collision.
  for (let attempt = 0; attempt < 3; attempt++) {
    const code = generateCode()
    const { data, error } = await admin
      .from('access_codes')
      .insert({
        user_id: user.id,
        code,
        category_ids: categoryIds,
        max_sessions: maxSessions,
        expires_at: expiresAt,
      })
      .select()
      .single()

    if (!error) return NextResponse.json({ accessCode: data })
    if (!error.message.includes('duplicate')) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  }
  return NextResponse.json({ error: 'Could not generate a unique code, try again.' }, { status: 500 })
}

export async function DELETE(request: NextRequest) {
  const user = await requireOwner()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const id = request.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const admin = createAdminClient()
  // Revoke rather than delete: also kills any guest_sessions already
  // redeemed from this code, via the check in /api/guest/data.
  const { error } = await admin
    .from('access_codes')
    .update({ revoked: true })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await admin.from('guest_sessions').update({ revoked: true }).eq('access_code_id', id)

  return NextResponse.json({ ok: true })
}
