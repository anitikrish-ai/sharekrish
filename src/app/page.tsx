import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export default async function RootPage() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return (
      <main className="min-h-dvh flex items-center justify-center p-6 text-center">
        <div className="glass glass-strong max-w-md p-8 rounded-2xl border border-white/10">
          <h1 className="text-xl font-semibold tracking-tight mb-2 text-rose-300">Setup Required</h1>
          <p className="text-sm text-white/70 mb-4 leading-relaxed">
            Missing Supabase environment variables. Please add <code>NEXT_PUBLIC_SUPABASE_URL</code> and <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in your environment or Vercel settings.
          </p>
          <p className="text-xs text-white/40">
            See README.md or .env.local for the required configuration.
          </p>
        </div>
      </main>
    )
  }

  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  redirect(user ? '/admin-short-ui' : '/login')
}
