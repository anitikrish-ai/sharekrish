export const metadata = { title: 'Terms & Conditions — Cloud Clipboard' }

export default function TermsPage() {
  return (
    <main className="min-h-dvh max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <div className="glass p-6 sm:p-8 space-y-4">
        <h1 className="text-xl font-semibold tracking-tight">Terms &amp; Conditions</h1>
        <p className="text-xs text-white/40">Last updated: October 25, 2026</p>

        <p className="text-sm text-white/70 leading-relaxed">
          Cloud Clipboard is a personal, single-owner tool, provided as-is, with no uptime
          guarantee. The underlying database may pause during periods of inactivity on its free
          tier, which can briefly delay access.
        </p>

        <h2 className="text-sm font-semibold mt-4">Access</h2>
        <p className="text-sm text-white/70 leading-relaxed">
          Only the configured owner account may sign in and manage data. Guest access is limited
          to time-boxed, owner-issued codes and is read-only. The owner may revoke any guest
          session at any time.
        </p>

        <h2 className="text-sm font-semibold mt-4">Acceptable use</h2>
        <p className="text-sm text-white/70 leading-relaxed">
          Guest access codes are for people the owner has personally shared them with. Do not
          attempt to guess codes, bypass access controls, or use this app to store or share
          unlawful content.
        </p>

        <h2 className="text-sm font-semibold mt-4">No warranty</h2>
        <p className="text-sm text-white/70 leading-relaxed">
          This app is provided without warranty of any kind. The owner is not liable for data loss
          or service interruption.
        </p>

        <a href="/" className="inline-block text-sm text-sky-300 underline underline-offset-2 mt-4">← Back</a>
      </div>
    </main>
  )
}
