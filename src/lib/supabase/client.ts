'use client'

import { createBrowserClient } from '@supabase/ssr'

// Browser client — runs under the owner's Supabase Auth session (cookie-based
// via @supabase/ssr), so every query it makes is subject to the RLS policies
// in supabase/migrations/0001_init.sql. There is no separate "device
// approval" table: being signed in as the owner *is* the approved-device
// check, enforced by Supabase Auth + RLS rather than a bespoke allowlist.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
