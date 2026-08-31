import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// ──────────────────────────────────────────────────────────────────────────────
// Role → allowed route prefixes
// ──────────────────────────────────────────────────────────────────────────────
type UserRole = 'student' | 'industry' | 'academician' | 'institution'

const ROLE_HOME: Record<UserRole, string> = {
  student:      '/student',
  industry:     '/industry',
  academician:  '/academician',
  institution:  '/institution',
}

const ROLE_ALLOWED_PREFIXES: Record<UserRole, string[]> = {
  student:     ['/student'],
  industry:    ['/industry'],
  academician: ['/academician'],
  institution: ['/institution'],
}

// Routes that are public (no session required)
const PUBLIC_PATHS = ['/', '/login', '/signup', '/auth', '/unauthorized']

// ──────────────────────────────────────────────────────────────────────────────
// Helper: resolve the currently-authenticated user's role
// We read `profile.role` from the `profiles` table via Supabase server client.
// ──────────────────────────────────────────────────────────────────────────────
async function getUserRole(
  request: NextRequest,
  response: NextResponse,
): Promise<{ role: UserRole | null; userId: string | null }> {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            response.cookies.set(name, value, options as any),
          )
        },
      },
    },
  )

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) return { role: null, userId: null }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profileRaw, error: profileError } = await (supabase as any)
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profileError || !profileRaw?.role) return { role: null, userId: user.id }

  return { role: profileRaw.role as UserRole, userId: user.id }
}

// ──────────────────────────────────────────────────────────────────────────────
// Middleware
// ──────────────────────────────────────────────────────────────────────────────
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 1. Always pass through Next.js internals and static assets
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  const response = NextResponse.next({ request })

  // 2. Allow public pages without checking session
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
    return response
  }

  // 3. All protected routes require a valid session + role
  const { role, userId } = await getUserRole(request, response)

  if (!userId) {
    // No session → redirect to login
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    loginUrl.searchParams.set('redirectedFrom', pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (!role) {
    // Session exists but no profile row yet → send to complete-profile or unauthorized
    const url = request.nextUrl.clone()
    url.pathname = '/unauthorized'
    url.searchParams.set('reason', 'no-profile')
    return NextResponse.redirect(url)
  }

  // 4. Enforce role-based route access
  const allowedPrefixes = ROLE_ALLOWED_PREFIXES[role]
  const isAllowed = allowedPrefixes.some((prefix) => pathname.startsWith(prefix))

  if (!isAllowed) {
    // Wrong role for this route → redirect to their dashboard home
    const url = request.nextUrl.clone()
    url.pathname = '/unauthorized'
    url.searchParams.set('reason', 'forbidden')
    url.searchParams.set('role', role)
    url.searchParams.set('attemptedPath', pathname)
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static / _next/image (Next.js build assets)
     * - favicon.ico and other static root files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
