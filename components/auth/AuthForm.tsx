'use client'

import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Loader2, GraduationCap, Briefcase, BookOpen, Building2 } from 'lucide-react'
import { signInAction, signUpAction } from '@/actions/auth'

type Mode = 'login' | 'signup'
type Role = 'student' | 'industry' | 'academician' | 'institution'

const ROLES: { value: Role; label: string; icon: React.ElementType; color: string }[] = [
  { value: 'student',     label: 'Student',      icon: GraduationCap, color: 'text-violet-400' },
  { value: 'industry',    label: 'Industry',     icon: Briefcase,     color: 'text-sky-400' },
  { value: 'academician', label: 'Academician',  icon: BookOpen,      color: 'text-emerald-400' },
  { value: 'institution', label: 'Institution',  icon: Building2,     color: 'text-amber-400' },
]

interface AuthFormProps {
  mode: Mode
  defaultRole?: string
}

export function AuthForm({ mode, defaultRole }: AuthFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [selectedRole, setSelectedRole] = useState<Role>(
    (ROLES.find((r) => r.value === defaultRole)?.value) ?? 'student',
  )
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const formRef = useRef<HTMLFormElement>(null)

  async function handleSubmit(formData: FormData) {
    setError(null)
    if (mode === 'signup') formData.set('role', selectedRole)

    startTransition(async () => {
      const action = mode === 'login' ? signInAction : signUpAction
      const result = await action(formData)
      if (result?.error) setError(result.error)
    })
  }

  return (
    <form
      ref={formRef}
      action={handleSubmit}
      className="glass-card p-8 space-y-5"
    >
      {/* Role selector (signup only) */}
      {mode === 'signup' && (
        <div>
          <label className="label">I am a…</label>
          <div className="grid grid-cols-2 gap-2">
            {ROLES.map(({ value, label, icon: Icon, color }) => (
              <button
                key={value}
                type="button"
                onClick={() => setSelectedRole(value)}
                className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                  selectedRole === value
                    ? 'border-brand-500 bg-brand-900/50 text-white'
                    : 'border-surface-border bg-surface-hover text-white/50 hover:text-white hover:border-white/20'
                }`}
              >
                <Icon className={`h-4 w-4 ${selectedRole === value ? color : 'text-white/30'}`} />
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Full name (signup only) */}
      {mode === 'signup' && (
        <div>
          <label htmlFor="full_name" className="label">Full Name</label>
          <input
            id="full_name"
            name="full_name"
            type="text"
            required
            autoComplete="name"
            placeholder="Rahul Sharma"
            className="input"
          />
        </div>
      )}

      {/* Email */}
      <div>
        <label htmlFor="email" className="label">Email Address</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@college.edu"
          className="input"
        />
      </div>

      {/* Password */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="password" className="label mb-0">Password</label>
          {mode === 'login' && (
            <a href="#" className="text-xs text-brand-400 hover:text-brand-300 transition-colors">
              Forgot password?
            </a>
          )}
        </div>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            required
            minLength={8}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            placeholder="••••••••"
            className="input pr-12"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-700/40 bg-red-900/20 px-4 py-3 text-sm text-red-300"
        >
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isPending}
        className="btn-primary w-full justify-center"
      >
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {mode === 'login' ? 'Signing in…' : 'Creating account…'}
          </>
        ) : mode === 'login' ? (
          'Sign In'
        ) : (
          'Create Account'
        )}
      </button>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-surface-border" />
        </div>
        <div className="relative flex justify-center text-xs text-white/30">
          <span className="bg-surface-card px-3">or</span>
        </div>
      </div>

      {/* OAuth placeholder (Google) */}
      <button
        type="button"
        disabled
        className="btn-ghost w-full justify-center opacity-50 cursor-not-allowed text-xs"
        title="OAuth coming in Phase 4"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        Continue with Google (Phase 4)
      </button>
    </form>
  )
}
