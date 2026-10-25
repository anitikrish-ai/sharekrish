import Link from 'next/link'
import { IconArrowLeft, IconFileText } from '@/components/Icons'

export const metadata = { title: 'Terms & Conditions — Cloud Clipboard' }

export default function TermsPage() {
  return (
    <main className="min-h-dvh max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <div className="glass p-6 sm:p-8 space-y-5 animate-scale-pop">
        <div className="flex items-center gap-2.5 text-sky-400">
          <IconFileText size={22} />
          <h1 className="text-xl font-bold tracking-tight text-white">Terms &amp; Conditions</h1>
        </div>
        <p className="text-xs text-slate-400">Last updated: October 25, 2026</p>

        <p className="text-sm text-slate-300 leading-relaxed">
          Cloud Clipboard is a personal, single-owner application provided as-is without uptime
          guarantees. Database activity follows the configured Supabase hosting specifications.
        </p>

        <h2 className="text-sm font-semibold text-white pt-2">Access &amp; Permissions</h2>
        <p className="text-sm text-slate-300 leading-relaxed">
          Only the configured owner account may sign in and manage data. Guest access is limited
          to time-boxed, owner-issued codes and is read-only. The owner may revoke any guest
          session at any time.
        </p>

        <h2 className="text-sm font-semibold text-white pt-2">Acceptable Use</h2>
        <p className="text-sm text-slate-300 leading-relaxed">
          Guest access codes are meant exclusively for individuals the owner has shared them with.
          Automated code generation, brute-forcing, or unauthorized access attempts are strictly prohibited.
        </p>

        <h2 className="text-sm font-semibold text-white pt-2">Warranty Disclaimer</h2>
        <p className="text-sm text-slate-300 leading-relaxed">
          This app is provided without warranty of any kind. The owner is not liable for data loss
          or temporary service interruptions.
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
