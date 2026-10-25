'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { IconClipboard } from '@/components/Icons'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [error, setError] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      if (params.get('error') === 'not_owner') {
        setError('Only the designated owner email can access this clipboard.')
      }
    }
  }, [])

  async function sendLink(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending')
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) {
      setStatus('error')
      setError(error.message)
      return
    }
    setStatus('sent')
  }

  return (
    <main className="min-h-dvh flex items-center justify-center p-4 sm:p-6">
      <div className="glass glass-strong w-full max-w-sm p-6 sm:p-8 animate-scale-pop relative overflow-hidden">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-400 via-sky-500 to-teal-400 p-[1px] shadow-[0_0_25px_rgba(56,189,248,0.35)] mb-4">
          <div className="w-full h-full rounded-2xl bg-[#090d16] flex items-center justify-center">
            <IconClipboard size={22} className="text-sky-400" strokeWidth={2.2} />
          </div>
        </div>
        <h1 className="text-xl font-bold tracking-tight mb-1 text-white">Cloud Clipboard</h1>
        <p className="text-xs sm:text-sm text-white/55 mb-6">Sign in with your owner email to access your clips.</p>

        {status === 'sent' ? (
          <p className="text-xs sm:text-sm text-emerald-300 bg-emerald-500/10 border border-emerald-400/20 rounded-xl p-3.5 animate-fade-in">
            Check <strong>{email}</strong> for your magic sign-in link.
          </p>
        ) : (
          <form onSubmit={sendLink} className="space-y-3">
            <label htmlFor="email" className="sr-only">Email</label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              inputMode="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl bg-black/40 border border-white/15 px-4 py-3 text-base sm:text-sm outline-none focus-visible:border-sky-400/60 placeholder:text-white/35"
            />
            <button
              type="submit"
              disabled={status === 'sending'}
              className="glass glass-interactive w-full rounded-xl px-4 py-3 text-xs sm:text-sm font-semibold text-sky-100 bg-sky-500/20 border-sky-400/30 active:scale-95 transition-all disabled:opacity-50"
            >
              {status === 'sending' ? 'Sending link…' : 'Send sign-in link'}
            </button>
            {status === 'error' && (
              <p role="alert" className="text-sm text-rose-300">{error}</p>
            )}
          </form>
        )}

        <p className="mt-6 text-xs text-white/40">
          Only the configured owner account can sign in here. Looking for shared access?{' '}
          <a href="/view" className="underline underline-offset-2 hover:text-white/70">Open guest view</a>.
        </p>

        <p className="mt-3 text-[11px] text-white/30">
          <a href="/privacy" className="underline underline-offset-2 hover:text-white/60">Privacy</a>
          {' · '}
          <a href="/terms" className="underline underline-offset-2 hover:text-white/60">Terms</a>
        </p>
      </div>
    </main>
  )
}
