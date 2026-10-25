export const metadata = { title: 'Privacy Policy — Cloud Clipboard' }

export default function PrivacyPage() {
  return (
    <main className="min-h-dvh max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <div className="glass p-6 sm:p-8 space-y-4">
        <h1 className="text-xl font-semibold tracking-tight">Privacy Policy</h1>
        <p className="text-xs text-white/40">Last updated: October 25, 2026</p>

        <p className="text-sm text-white/70 leading-relaxed">
          Cloud Clipboard is a single-owner personal app. It is not a public product and does not
          collect data from the general public.
        </p>

        <h2 className="text-sm font-semibold mt-4">What is stored</h2>
        <p className="text-sm text-white/70 leading-relaxed">
          The owner&apos;s account email, and whatever clipboard items (text, links, snippets,
          shortcuts, media references) the owner saves. Data is stored in a Supabase Postgres
          database and protected by Row Level Security, scoped to the owner&apos;s account.
        </p>

        <h2 className="text-sm font-semibold mt-4">Guest access</h2>
        <p className="text-sm text-white/70 leading-relaxed">
          The owner may issue temporary, time-limited access codes to let a guest view a read-only
          slice of the clipboard. Guest sessions are tracked only to enforce expiry and revocation,
          and carry no identifying information beyond a session token.
        </p>

        <h2 className="text-sm font-semibold mt-4">Third parties</h2>
        <p className="text-sm text-white/70 leading-relaxed">
          Data is hosted by Supabase (database/auth) and Vercel (application hosting). No data is
          sold or shared with any other third party.
        </p>

        <h2 className="text-sm font-semibold mt-4">Contact</h2>
        <p className="text-sm text-white/70 leading-relaxed">
          Questions about this policy can be directed to the app owner directly.
        </p>

        <a href="/" className="inline-block text-sm text-sky-300 underline underline-offset-2 mt-4">← Back</a>
      </div>
    </main>
  )
}
