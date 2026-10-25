import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Server-side client for Server Components / Route Handlers, bound to the
// request's cookies so it carries the same owner session as the browser
// client. Still goes through RLS — this is not a privilege escalation,
// just the server-side half of the same authenticated session.
export function createServerSupabaseClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch {
            // called from a Server Component with no response to write to —
            // middleware refreshes the session cookie on navigations instead
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch {
            // see above
          }
        },
      },
    }
  )
}
