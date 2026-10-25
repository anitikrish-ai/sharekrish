import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Gatekeeper for /admin-short-ui. This is the server-enforced half of
// "only approved devices can manage data" — a device is "approved" by
// having a valid Supabase session for the owner account, and that account
// is the only one allowed to sign up (see src/app/login/page.tsx + the
// OWNER_EMAIL check in the auth callback). Anyone else's token, or no
// token, is bounced to /login before any admin page or admin API route runs.
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin-short-ui')
  // The only owner-only API surface is access-codes. Item/category/collection
  // CRUD goes straight through the browser Supabase client, enforced by RLS
  // (supabase/migrations/0001_init.sql) rather than a Next.js API route, so
  // there's nothing else here to gate.
  const isAdminApi = request.nextUrl.pathname.startsWith('/api/access-codes')

  const ownerEmail = process.env.OWNER_EMAIL?.toLowerCase()
  const isOwner = !!user && !!ownerEmail && user.email?.toLowerCase() === ownerEmail

  if ((isAdminRoute || isAdminApi) && !isOwner) {
    if (isAdminApi) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('next', request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  return response
}

export const config = {
  matcher: [
    '/admin-short-ui/:path*',
    '/api/access-codes/:path*',
  ],
}
