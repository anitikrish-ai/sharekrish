import { NextResponse, type NextRequest } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

// Exchanges the magic-link code for a session, then checks the signed-in
// email against OWNER_EMAIL before letting the session stand — Supabase
// Auth alone would let *anyone* who guesses/receives a link sign up;
// this is what actually makes it single-owner.
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code')
  const supabase = createServerSupabaseClient()

  if (code) {
    const { data } = await supabase.auth.exchangeCodeForSession(code)
    const email = data.user?.email?.toLowerCase()
    const ownerEmail = process.env.OWNER_EMAIL?.toLowerCase()

    if (!email || email !== ownerEmail) {
      await supabase.auth.signOut()
      return NextResponse.redirect(
        new URL('/login?error=not_owner', request.url)
      )
    }
  }

  return NextResponse.redirect(new URL('/admin-short-ui', request.url))
}
