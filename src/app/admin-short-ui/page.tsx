import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { fetchAll } from '@/lib/queries'
import { Dashboard } from '@/components/Dashboard'

// Route protection is enforced twice, deliberately: middleware.ts bounces
// unauthenticated requests before this page even runs (the real security
// boundary, since it also covers the admin API routes), and this
// server-side check is the belt-and-suspenders fallback plus the source of
// the initial data fetch. Never trust a client-only redirect here.
export default async function AdminPage() {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  const ownerEmail = process.env.OWNER_EMAIL?.toLowerCase()

  if (!user || user.email?.toLowerCase() !== ownerEmail) {
    redirect('/login')
  }

  const { items, categories, collections } = await fetchAll(supabase)

  return (
    <Dashboard
      userId={user.id}
      userEmail={user.email ?? ''}
      initialItems={items}
      initialCategories={categories}
      initialCollections={collections}
    />
  )
}
