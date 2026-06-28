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

  const db = createServerClient(supabaseUrl, serviceKey, { cookies: { getAll: () => [], setAll: () => {} } })

  // Supabase SSR may chunk the token across multiple cookies (sb-*-auth-token.0, .1, ...)
  // Collect and assemble all chunks in order
  const tokenCookies = allCookies
    .filter(c => c.name.includes('auth-token'))
    .sort((a, b) => a.name.localeCompare(b.name))

  if (tokenCookies.length === 0) return null

  try {
    // Assemble value (chunked cookies need to be joined)
    const raw = tokenCookies.map(c => c.value).join('')
    const decoded = decodeURIComponent(raw)
    let parsed = JSON.parse(decoded)
    // Some versions wrap in an array
    if (Array.isArray(parsed)) parsed = JSON.parse(parsed.join(''))
    const accessToken: string | undefined = parsed?.access_token
    if (!accessToken) return null

    const { data: { user } } = await db.auth.getUser(accessToken)
    return user ?? null
  } catch {
    // Fallback: try using createServerClient with cookies for auth
    try {
      const client = createServerClient(supabaseUrl, serviceKey, {
        cookies: {
          getAll: () => allCookies,
          setAll: () => {},
        },
      })
      const { data: { user } } = await client.auth.getUser()
      return user ?? null
    } catch {
      return null
    }
  }
}
