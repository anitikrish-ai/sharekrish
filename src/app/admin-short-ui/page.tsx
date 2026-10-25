import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { fetchAll } from '@/lib/queries'
import { Dashboard } from '@/components/Dashboard'
import type { Category, ClipItem, Collection } from '@/lib/types'

// Route protection is enforced twice, deliberately: middleware.ts bounces
// unauthenticated requests before this page even runs (the real security
// boundary, since it also covers the admin API routes), and this
// server-side check is the belt-and-suspenders fallback plus the source of
// the initial data fetch. Never trust a client-only redirect here.
export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  const ownerEmail = process.env.OWNER_EMAIL?.toLowerCase()

  if (!user || user.email?.toLowerCase() !== ownerEmail) {
    redirect('/login')
  }

  let items: ClipItem[] = []
  let categories: Category[] = []
  let collections: Collection[] = []

  try {
    const data = await fetchAll(supabase)
    items = data.items
    categories = data.categories
    collections = data.collections
  } catch (err) {
    console.error('Initial data fetch notice:', err)
  }

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

