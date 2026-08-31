/**
 * Shared auth helpers used in Server Actions and Route Handlers.
 * Wraps @supabase/ssr to avoid repeating boilerplate in every action.
 */
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database.types'

export type UserRole = 'student' | 'industry' | 'academician' | 'institution'

export interface AuthUser {
  id: string
  email: string
  role: UserRole
  full_name: string
  avatar_url: string | null
}

/** Returns the authenticated user with their role, or null. */
export async function getAuthUser(): Promise<AuthUser | null> {
  const cookieStore = cookies()

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>) => {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              cookieStore.set(name, value, options as any),
            )
          } catch {
            // Ignore: called from a Server Component where cookies are read-only.
          }
        },
      },
    },
  )

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) return null

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profileRaw } = await (supabase as any)
    .from('profiles')
    .select('role, full_name, email, avatar_url')
    .eq('id', user.id)
    .single()

  const profile = profileRaw as { role: string; full_name: string; email: string; avatar_url: string | null } | null

  if (!profile) return null

  return {
    id: user.id,
    email: profile.email,
    role: profile.role as UserRole,
    full_name: profile.full_name,
    avatar_url: profile.avatar_url,
  }
}
