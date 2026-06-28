import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const PLACEHOLDER_URL = 'https://placeholder.supabase.co'
const PLACEHOLDER_KEY = 'placeholder-anon-key'

export function isSupabaseConfiguredServer() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  return !!(url && !url.includes('your_supabase') && key && !key.includes('your_supabase'))
}

export async function createServerSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const configured = isSupabaseConfiguredServer()
  const cookieStore = await cookies()
  return createServerClient(
    configured ? url! : PLACEHOLDER_URL,
    configured ? key! : PLACEHOLDER_KEY,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
}

// Reliably get the authenticated user by reading JWT from cookie and
// verifying it with the service role key. Works with new sb_publishable_ keys.
export async function getAuthUser() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceKey) return null

  const cookieStore = await cookies()
  const allCookies  = cookieStore.getAll()

  // Find the Supabase auth session cookie (sb-<ref>-auth-token)
  const authCookie = allCookies.find(c => /sb-.+-auth-token$/.test(c.name))
  if (!authCookie) return null

  try {
    let parsed = JSON.parse(decodeURIComponent(authCookie.value))
    // Supabase chunked cookies are arrays; take first chunk
    if (Array.isArray(parsed)) parsed = JSON.parse(parsed.join(''))
    const accessToken: string | undefined = parsed?.access_token
    if (!accessToken) return null

    const db = createServerClient(supabaseUrl, serviceKey, { cookies: { getAll: () => [], setAll: () => {} } })
    const { data: { user } } = await db.auth.getUser(accessToken)
    return user ?? null
  } catch {
    return null
  }
}
