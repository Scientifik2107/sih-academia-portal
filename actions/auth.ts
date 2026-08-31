'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import type { Database } from '@/types/database.types'

type UserRole = 'student' | 'industry' | 'academician' | 'institution'

const ROLE_HOME: Record<UserRole, string> = {
  student:     '/student',
  industry:    '/industry',
  academician: '/academician',
  institution: '/institution',
}

function createClient() {
  const cookieStore = cookies()
  return createServerClient<Database>(
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
          } catch { /* Server Component read-only context */ }
        },
      },
    },
  )
}

// ──────────────────────────────────────────────────────────────────────────────
// Sign In
// ──────────────────────────────────────────────────────────────────────────────
export async function signInAction(formData: FormData) {
  const email    = formData.get('email') as string
  const password = formData.get('password') as string

  const supabase = createClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) return { error: error.message }

  // Fetch role and redirect
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profileRaw } = await (supabase as any)
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .single()

  const profile = profileRaw as { role: string } | null
  const role = profile?.role as UserRole | undefined
  const destination = role ? ROLE_HOME[role] : '/unauthorized?reason=no-profile'

  redirect(destination)
}

// ──────────────────────────────────────────────────────────────────────────────
// Sign Up
// ──────────────────────────────────────────────────────────────────────────────
export async function signUpAction(formData: FormData) {
  const email     = formData.get('email') as string
  const password  = formData.get('password') as string
  const full_name = formData.get('full_name') as string
  const role      = formData.get('role') as UserRole

  const supabase = createClient()

  const { data, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name, role } },
  })

  if (signUpError) return { error: signUpError.message }
  if (!data.user)  return { error: 'Sign-up failed. Please try again.' }

  // Upsert the profiles row (the DB trigger also handles this, but we ensure it's present)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: profileError } = await (supabase as any).from('profiles').upsert({
    id:         data.user.id,
    email,
    full_name,
    role,
  })

  if (profileError) return { error: (profileError as { message: string }).message }

  redirect(ROLE_HOME[role])
}

// ──────────────────────────────────────────────────────────────────────────────
// Sign Out
// ──────────────────────────────────────────────────────────────────────────────
export async function signOutAction() {
  const supabase = createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
