import 'server-only'
import { createClient } from '@supabase/supabase-js'

// Service-role client — bypasses RLS entirely. Used ONLY by server-side API
// routes (never imported by a Client Component; the `server-only` import
// above makes that a build error, not just a convention). Its one job is
// access_codes / guest_sessions bookkeeping and serving the scoped,
// read-only slice of `items` a valid guest session is allowed to see.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}
