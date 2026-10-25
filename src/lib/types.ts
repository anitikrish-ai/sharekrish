export type ItemType = 'text' | 'link' | 'snippet' | 'shortcut' | 'image' | 'video' | 'music'

export interface Category {
  id: string
  user_id: string
  name: string
  color: string
  icon: string
  sort_order: number
  created_at: string
}

export interface Collection {
  id: string
  user_id: string
  name: string
  created_at: string
}

export interface ClipItem {
  id: string
  user_id: string
  type: ItemType
  title: string
  content: string
  url: string | null
  language: string | null
  category_id: string | null
  collection_id: string | null
  is_favorite: boolean
  is_pinned: boolean
  is_archived: boolean
  created_at: string
  updated_at: string
}

export interface AccessCode {
  id: string
  user_id: string
  code: string
  category_ids: string[] | null
  max_sessions: number
  sessions_used: number
  expires_at: string
  revoked: boolean
  created_at: string
}
