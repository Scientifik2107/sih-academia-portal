import type { Metadata } from 'next'
import Link from 'next/link'
import { ShieldX, ArrowLeft } from 'lucide-react'

export const metadata: Metadata = { title: 'Access Denied' }

export default function UnauthorizedPage({
  searchParams,
}: {
  searchParams: { reason?: string; role?: string; attemptedPath?: string }
}) {
  const { reason, role, attemptedPath } = searchParams

  const messages: Record<string, string> = {
    forbidden:  `Your role (${role ?? 'unknown'}) does not have access to ${attemptedPath ?? 'that page'}.`,
    'no-profile':
      'Your account does not have a role profile set up. Please contact support.',
  }

  const message = messages[reason ?? ''] ?? 'You are not authorized to view this page.'

  const backHref = role
    ? `/${role}`
    : '/login'

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="glass-card max-w-md w-full p-10 text-center animate-slide-up">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-900/30 border border-red-700/30">
          <ShieldX className="h-8 w-8 text-red-400" />
        </div>

        <h1 className="text-2xl font-bold text-white mb-3">Access Denied</h1>
        <p className="text-sm text-white/50 leading-relaxed mb-8">{message}</p>

        <div className="flex flex-col gap-3">
          <Link href={backHref} className="btn-primary justify-center">
            <ArrowLeft className="h-4 w-4" />
            {role ? 'Back to My Dashboard' : 'Back to Sign In'}
          </Link>
          <Link href="/" className="btn-ghost justify-center text-xs">
            Go to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
