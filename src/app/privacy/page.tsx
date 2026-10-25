import Link from 'next/link'
import { IconArrowLeft, IconShield } from '@/components/Icons'

export const metadata = { title: 'Privacy Policy — Cloud Clipboard' }

export default function PrivacyPage() {
  return (
    <main className="min-h-dvh max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <div className="glass p-6 sm:p-8 space-y-5 animate-scale-pop">
        <div className="flex items-center gap-2.5 text-sky-400">
          <IconShield size={22} />
          <h1 className="text-xl font-bold tracking-tight text-white">Privacy Policy</h1>
        </div>
        <p className="text-xs text-slate-400">Last updated: October 25, 2026</p>

        <p className="text-sm text-slate-300 leading-relaxed">
          Cloud Clipboard is a single-owner personal application. It is not a public commercial service and does not
          collect personal data from the general public.
        </p>

        <h2 className="text-sm font-semibold text-white pt-2">What is stored</h2>
        <p className="text-sm text-slate-300 leading-relaxed">
          The owner&apos;s account email, and whatever clipboard items (text, links, snippets,
          shortcuts, media references) the owner saves. Data is stored in a Supabase Postgres
          database and protected by Row Level Security, scoped to the owner&apos;s account.
        </p>

        <h2 className="text-sm font-semibold text-white pt-2">Guest access</h2>
        <p className="text-sm text-slate-300 leading-relaxed">
          The owner may issue temporary, time-limited access codes to let a guest view a read-only
          slice of the clipboard. Guest sessions are tracked only to enforce expiry and revocation,
          and carry no identifying information beyond a session token.
        </p>

        <h2 className="text-sm font-semibold text-white pt-2">Infrastructure &amp; Security</h2>
        <p className="text-sm text-slate-300 leading-relaxed">
          Data is hosted by Supabase (database/auth) and Vercel (application hosting). No data is
          monetized, sold, or shared with any other third party.
        </p>

        <h2 className="text-sm font-semibold text-white pt-2">Contact</h2>
        <p className="text-sm text-slate-300 leading-relaxed">
          Questions about this policy can be directed to the app owner directly.
        </p>

        <div className="pt-4 border-t border-white/[0.08]">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-400 hover:text-sky-300 transition-colors"
          >
            <IconArrowLeft size={14} />
            <span>Back to Dashboard</span>
          </Link>
        </div>
      </div>
    </main>
  )
}
