import { createBrowserClient } from '@supabase/ssr'

const PLACEHOLDER_URL = 'https://placeholder.supabase.co'
const PLACEHOLDER_KEY = 'placeholder-anon-key'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const configured = url && !url.includes('your_supabase') && key && !key.includes('your_supabase')
  return createBrowserClient(
    configured ? url : PLACEHOLDER_URL,
    configured ? key : PLACEHOLDER_KEY
  )
}

export function isSupabaseConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  return !!(url && !url.includes('your_supabase') && key && !key.includes('your_supabase'))
}
