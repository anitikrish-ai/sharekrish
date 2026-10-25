# Cloud Clipboard

A personal, cloud-synced clipboard PWA: text, links, code snippets, shortcuts, favorite media,
categories and collections — searchable, pinnable, archivable, and synced in real time across
your own trusted devices. One owner account manages everything from `/admin-short-ui`; anyone
you hand a short-lived access code to gets read-only access at `/view`.

Built with Next.js 14 (App Router), Supabase (Auth + Postgres + Realtime), and a lightweight
CSS "liquid glass" interface — no mock data, no placeholder content, nothing fake left in the code.

## How it's secured, in plain terms

- **Owner account** — sign-up is intentionally not exposed. The only person who can ever use
  `/admin-short-ui` is whoever controls `OWNER_EMAIL`'s inbox (passwordless magic-link sign-in).
  Even if someone else requests a magic link for a different address, the server checks the
  signed-in email against `OWNER_EMAIL` and immediately signs them back out if it doesn't match.
  Sign in on your two phones with that one email and both become "approved devices" — there's no
  separate device-approval table because the owner session *is* the approval.
- **Row Level Security** — every owner-facing table (`items`, `categories`, `collections`) has
  RLS policies that only allow `auth.uid() = user_id`. Even a leaked anon key can't read or write
  another user's data (there's normally only one user: you).
- **Guest access** — `access_codes` and `guest_sessions` have **no** RLS policies for anon/authenticated
  roles at all, so they're unreachable except through the server's service-role key. A guest never
  gets a Supabase session; they get a short HMAC-signed cookie minted only after the server verifies
  the code server-side (expiry, revocation, and use-count are all re-checked on *every* request to
  `/api/guest/data`, not just at verification time — so revoking a code from the dashboard takes
  effect on the guest's very next request).
- **Secrets** — `SUPABASE_SERVICE_ROLE_KEY` and `GUEST_SESSION_SECRET` are only read in files marked
  `server-only` (a build-time guard, not just a comment) and are never sent to the browser.

## Features

- **3×3 quick-access grid** — your pinned/favorite/recent items, one tap to copy.
- **Item types** — text, link, code snippet, shortcut, and favorite image/video/music (stored by URL).
- **Organization** — custom categories (with color), collections, search, pin, favorite, archive, recent.
- **Full CRUD**, optimistic UI updates, and Supabase Realtime sync so your two phones stay in sync
  live without refreshing.
- **Owner-generated guest access codes** — 5-minute default expiry (configurable 1–120 min),
  optional category restriction, a max-devices limit, and one-click revocation.
- **PWA** — installable to a home screen, app-shell caching via a small hand-written service worker
  (no caching of your actual clipboard data — that's always fetched fresh).
- **Liquid glass UI** — translucent `backdrop-filter` surfaces, fine borders, restrained motion
  (and `prefers-reduced-motion` is respected), responsive at every width with no overlapping layout.

## Project structure

```
src/app/
  admin-short-ui/     owner dashboard (protected)
  view/                guest read-only view (code-gated)
  login/               owner magic-link sign-in
  auth/callback/       exchanges the magic link, enforces OWNER_EMAIL
  api/access-codes/    owner-only: create / list / revoke guest codes
  api/guest/verify/     redeem a code -> signed guest cookie
  api/guest/data/       read-only item feed for an active guest session
src/components/        UI (Glass, Dashboard, ItemCard, ItemEditor, AccessCodePanel, …)
src/lib/                Supabase clients, guest-token signing, shared queries/types
src/middleware.ts       blocks /admin-short-ui and the owner API routes from non-owners
supabase/migrations/    SQL schema + RLS policies
public/                 manifest, service worker, app icons
```

## 1. Create the Supabase project

1. Go to [supabase.com](https://supabase.com) → New project. Pick a region close to you.
2. **Free tier note, stated honestly:** Supabase's free projects pause automatically after about
   a week of no API activity. This app has no guaranteed 24/7 uptime on the free tier — a paused
   project needs manual un-pausing from the Supabase dashboard before it responds again. For
   personal use this is normally fine (opening the app once in a while keeps it active); don't
   rely on it for anything that needs to be always-on.
3. In **Project Settings → API**, copy the **Project URL**, **anon public key**, and
   **service_role key** — you'll need all three.
4. In **SQL Editor**, paste and run the contents of `supabase/migrations/0001_init.sql`. (If you
   later add more migrations, run them in filename order the same way, or use the Supabase CLI:
   `supabase db push`.)
5. In **Authentication → Providers**, leave Email enabled. In **Authentication → URL Configuration**,
   set the **Site URL** to your eventual production URL (see deployment below) and add
   `http://localhost:3000/auth/callback` under **Redirect URLs** for local testing, plus
   `https://<your-vercel-domain>/auth/callback` for production.
6. In **Authentication → Providers → Email**, you can leave "Confirm email" on — magic links don't
   need it, but it doesn't hurt. Sign-up itself doesn't need to be disabled: the app enforces
   single-owner access at the application layer (`auth/callback` checks `OWNER_EMAIL`), so even if
   someone else requests a magic link, they're signed back out immediately and never reach the
   dashboard or any owner-only API route.

## 2. Configure environment variables

Copy `.env.example` to `.env.local` for local dev, and fill in:

```
NEXT_PUBLIC_SUPABASE_URL=            # Project URL from step 1.3
NEXT_PUBLIC_SUPABASE_ANON_KEY=       # anon public key from step 1.3
SUPABASE_SERVICE_ROLE_KEY=           # service_role key from step 1.3 — keep this secret
OWNER_EMAIL=you@example.com          # the only email allowed into /admin-short-ui
GUEST_SESSION_SECRET=                # random 32+ char string, e.g.: openssl rand -base64 32
```

Never commit `.env.local` — it's already in `.gitignore`.

## 3. Run it locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. Sign in with `OWNER_EMAIL` to reach `/admin-short-ui`; open
`http://localhost:3000/view` in a private window to test the guest flow with a code you generate
from the dashboard's **Share** button.

## 4. Deploy

### GitHub

```bash
git remote add origin https://github.com/<your-username>/sharekrish.git
git branch -M main
git push -u origin main
```

(The repo is already initialized and committed locally — see the commit history for what's in it.)

### Vercel — deploying as `sharekrish.vercel.app`

1. Go to [vercel.com/new](https://vercel.com/new) and import the GitHub repo.
2. **Project name:** set it to `sharekrish` on the import screen (or afterwards in
   **Project Settings → General → Project Name**). Vercel derives the free `*.vercel.app` subdomain
   directly from the project name, so naming it `sharekrish` is what gives you
   **`https://sharekrish.vercel.app`**. If that exact name is already taken on Vercel's shared
   domain, Vercel will suffix it (e.g. `sharekrish-yourname.vercel.app`) — you'll see the final
   URL on the project dashboard immediately after the first deploy.
3. Under **Environment Variables**, add the same five variables from step 2 (all of them, including
   the service role key and `GUEST_SESSION_SECRET` — Vercel keeps these server-side and never
   ships them to the browser for the non-`NEXT_PUBLIC_` ones).
4. Deploy. Once it's live, go back to Supabase **Authentication → URL Configuration** and add
   `https://sharekrish.vercel.app/auth/callback` to the Redirect URLs (and update Site URL to match)
   — magic-link sign-in will fail until that's done.
5. Visit `https://sharekrish.vercel.app`, sign in with `OWNER_EMAIL` on both of your phones, and
   you're set up.

## Honest limitations / what's left to you

- **No guaranteed uptime.** As noted above, Supabase's free tier pauses inactive projects; Vercel's
  free tier has no uptime SLA either. This is a personal tool, not a production service with an SLA.
- **Guest sessions last 30 minutes** once a code is redeemed (separate from the code's own expiry
  window, which defaults to 5 minutes and is what limits how long someone has to *enter* the code).
  Change `GUEST_SESSION_MINUTES` in `src/app/api/guest/verify/route.ts` if you want a different
  redeemed-session length.
- **Favorite media (image/video/music)** are stored as URLs you paste in, not uploaded files — there's
  no file storage/CDN wired up. Adding Supabase Storage for actual uploads is a reasonable next step
  if you want that instead of linking to externally-hosted media.
- **Email delivery for magic links** depends on Supabase's built-in email sending, which is rate-limited
  on the free tier. For heavier use, configure a custom SMTP provider under
  **Authentication → Settings → SMTP Settings** in the Supabase dashboard.
- **`npm audit`** will show a few moderate/high advisories in `postcss`/`tailwindcss` — these are
  build-time-only dev dependencies (they run when compiling CSS during `npm run build`, not in the
  deployed server/browser code), so they don't expose end users. Next.js itself is pinned to
  `14.2.35`, the latest patched release in the 14.x line as of this writing.

## License

MIT — do whatever you like with it.
