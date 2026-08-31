import type { Metadata } from 'next'
import Link from 'next/link'
import { AuthForm } from '@/components/auth/AuthForm'
import { Zap } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Create Account',
  description: 'Create your AcadBridge account',
}

export default function SignupPage({
  searchParams,
}: {
  searchParams: { role?: string }
}) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-16">
      {/* Background */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 h-[600px] w-[600px] rounded-full bg-purple-700/10 blur-[120px]" />
      </div>

      <div className="w-full max-w-md animate-slide-up">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 shadow-lg shadow-brand-900/50 group-hover:scale-105 transition-transform">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">AcadBridge</span>
          </Link>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white">Create your account</h1>
            <p className="mt-1 text-sm text-white/40">
              Choose your role and get started in seconds
            </p>
          </div>
        </div>

        <AuthForm mode="signup" defaultRole={searchParams.role} />

        <p className="mt-6 text-center text-sm text-white/40">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-brand-400 hover:text-brand-300 transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
