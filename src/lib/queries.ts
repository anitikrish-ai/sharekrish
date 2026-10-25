import type { SupabaseClient } from '@supabase/supabase-js'
import type { Category, ClipItem, Collection, ItemType } from './types'

// Thin query helpers shared between the dashboard and the item editor.
// Every call runs under the signed-in owner's RLS-scoped client, so there's
// no user_id filtering here — Postgres already enforces that per the
// policies in supabase/migrations/0001_init.sql.

export async function fetchAll(supabase: SupabaseClient) {
  const [items, categories, collections] = await Promise.all([
    supabase.from('items').select('*').order('is_pinned', { ascending: false }).order('updated_at', { ascending: false }),
    supabase.from('categories').select('*').order('sort_order', { ascending: true }),
    supabase.from('collections').select('*').order('created_at', { ascending: true }),
  ])
  if (items.error) throw items.error
  if (categories.error) throw categories.error
  if (collections.error) throw collections.error
  return {
    items: items.data as ClipItem[],
    categories: categories.data as Category[],
    collections: collections.data as Collection[],
  }
}

export interface ItemInput {
  type: ItemType
  title: string
  content: string
  url?: string | null
  language?: string | null
  category_id?: string | null
  collection_id?: string | null
}

export async function createItem(supabase: SupabaseClient, userId: string, input: ItemInput) {
  const { data, error } = await supabase
    .from('items')
    .insert({ ...input, user_id: userId })
    .select()
    .single()
  if (error) throw error
  return data as ClipItem
}

export async function updateItem(supabase: SupabaseClient, id: string, patch: Partial<ItemInput>) {
  const { data, error } = await supabase.from('items').update(patch).eq('id', id).select().single()
  if (error) throw error
  return data as ClipItem
}

export async function deleteItem(supabase: SupabaseClient, id: string) {
  const { error } = await supabase.from('items').delete().eq('id', id)
  if (error) throw error
}

export async function toggleField(
  supabase: SupabaseClient,
  id: string,
  field: 'is_favorite' | 'is_pinned' | 'is_archived',
  value: boolean
) {
  const { error } = await supabase.from('items').update({ [field]: value }).eq('id', id)
  if (error) throw error
}

export async function createCategory(supabase: SupabaseClient, userId: string, name: string, color: string) {
  const { data, error } = await supabase
    .from('categories')
    .insert({ user_id: userId, name, color })
    .select()
    .single()
  if (error) throw error
  return data as Category
}

export async function deleteCategory(supabase: SupabaseClient, id: string) {
  const { error } = await supabase.from('categories').delete().eq('id', id)
  if (error) throw error
}

export async function createCollection(supabase: SupabaseClient, userId: string, name: string) {
  const { data, error } = await supabase
    .from('collections')
    .insert({ user_id: userId, name })
    .select()
    .single()
  if (error) throw error
  return data as Collection
}
