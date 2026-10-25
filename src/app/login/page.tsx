'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [error, setError] = useState('')

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
    <main className="min-h-dvh flex items-center justify-center p-6">
      <div className="glass glass-strong w-full max-w-sm p-8 animate-rise-in">
        <h1 className="text-xl font-semibold tracking-tight mb-1">Cloud Clipboard</h1>
        <p className="text-sm text-white/60 mb-6">Sign in with your owner email to manage your clipboard.</p>

        {status === 'sent' ? (
          <p className="text-sm text-sky-300 bg-sky-400/10 border border-sky-400/20 rounded-xl p-3">
            Check <strong>{email}</strong> for a sign-in link.
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
              className="w-full rounded-xl bg-black/30 border border-white/15 px-4 py-3 text-sm outline-none focus-visible:border-sky-400/60 placeholder:text-white/35"
            />
            <button
              type="submit"
              disabled={status === 'sending'}
              className="glass glass-interactive w-full rounded-xl px-4 py-3 text-sm font-medium disabled:opacity-50"
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
