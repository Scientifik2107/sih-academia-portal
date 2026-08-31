'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTransition } from 'react'
import {
  GraduationCap, Briefcase, BookOpen, Building2,
  LayoutDashboard, Search, FileText, BarChart3,
  Users, PlusCircle, ClipboardList, Settings,
  TrendingUp, FlaskConical, LogOut, Zap, ChevronRight,
} from 'lucide-react'
import { signOutAction } from '@/actions/auth'

type Role = 'student' | 'industry' | 'academician' | 'institution'

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
}

const NAV_MAP: Record<Role, NavItem[]> = {
  student: [
    { label: 'Dashboard',       href: '/student',           icon: LayoutDashboard },
    { label: 'Job Matches',     href: '/student/matches',   icon: Search },
    { label: 'Skill Gap',       href: '/student/skill-gap', icon: TrendingUp },
    { label: 'My Applications', href: '/student/apply',     icon: FileText },
    { label: 'Portfolio',       href: '/student/portfolio', icon: ClipboardList },
    { label: 'Settings',        href: '/student/settings',  icon: Settings },
  ],
  industry: [
    { label: 'Dashboard',        href: '/industry',               icon: LayoutDashboard },
    { label: 'Post a Job',       href: '/industry/post-job',      icon: PlusCircle },
    { label: 'My Listings',      href: '/industry/jobs',          icon: Briefcase },
    { label: 'Find Candidates',  href: '/industry/candidates',    icon: Users },
    { label: 'Applications',     href: '/industry/applications',  icon: ClipboardList },
    { label: 'Settings',         href: '/industry/settings',      icon: Settings },
  ],
  academician: [
    { label: 'Dashboard',        href: '/academician',              icon: LayoutDashboard },
    { label: 'FDP Programs',     href: '/academician/fdp',          icon: BookOpen },
    { label: 'Opportunities',    href: '/academician/opportunities', icon: Search },
    { label: 'My Applications',  href: '/academician/apply',        icon: FileText },
    { label: 'Research',         href: '/academician/research',     icon: FlaskConical },
    { label: 'Settings',         href: '/academician/settings',     icon: Settings },
  ],
  institution: [
    { label: 'Dashboard',        href: '/institution',              icon: LayoutDashboard },
    { label: 'Batch Analytics',  href: '/institution/analytics',   icon: BarChart3 },
    { label: 'Verify Students',  href: '/institution/verify',      icon: ClipboardList },
    { label: 'Academicians',     href: '/institution/academicians', icon: BookOpen },
    { label: 'Opportunities',    href: '/institution/opportunities',icon: PlusCircle },
    { label: 'Settings',         href: '/institution/settings',    icon: Settings },
  ],
}

const ROLE_META: Record<Role, { label: string; icon: React.ElementType; gradient: string }> = {
  student:     { label: 'Student Portal',      icon: GraduationCap, gradient: 'from-violet-600 to-indigo-600' },
  industry:    { label: 'Recruiter Portal',    icon: Briefcase,     gradient: 'from-sky-600 to-cyan-600' },
  academician: { label: 'Faculty Portal',      icon: BookOpen,      gradient: 'from-emerald-600 to-teal-600' },
  institution: { label: 'Institution Portal',  icon: Building2,     gradient: 'from-amber-600 to-orange-600' },
}

interface SidebarProps {
  role: Role
  fullName: string
  avatarUrl?: string | null
  email: string
}

export function Sidebar({ role, fullName, avatarUrl, email }: SidebarProps) {
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()
  const navItems = NAV_MAP[role]
  const meta     = ROLE_META[role]
  const RoleIcon = meta.icon

  const initials = fullName
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()

  function handleSignOut() {
    startTransition(async () => {
      await signOutAction()
    })
  }

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-surface-border bg-surface-card">
      {/* ── Wordmark ──────────────────────────────────── */}
      <div className="flex items-center gap-2.5 border-b border-surface-border px-5 py-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-purple-600">
          <Zap className="h-3.5 w-3.5 text-white" />
        </div>
        <span className="text-sm font-bold tracking-tight">AcadBridge</span>
      </div>

      {/* ── Role badge ────────────────────────────────── */}
      <div className="mx-4 mt-4 mb-2 flex items-center gap-2.5 rounded-xl border border-surface-border bg-surface-hover px-3 py-2.5">
        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${meta.gradient}`}>
          <RoleIcon className="h-4 w-4 text-white" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold text-white">{meta.label}</p>
          <p className="truncate text-[10px] text-white/40">{email}</p>
        </div>
      </div>

      {/* ── Nav items ─────────────────────────────────── */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-3" aria-label="Main navigation">
        {navItems.map(({ label, href, icon: Icon }) => {
          const isActive =
            href === `/${role}` ? pathname === href : pathname.startsWith(href)

          return (
            <Link
              key={href}
              href={href}
              className={isActive ? 'nav-item-active' : 'nav-item'}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="flex-1 text-sm">{label}</span>
              {isActive && <ChevronRight className="h-3.5 w-3.5 shrink-0" />}
            </Link>
          )
        })}
      </nav>

      {/* ── User card + sign out ───────────────────────── */}
      <div className="border-t border-surface-border p-3">
        <div className="flex items-center gap-3 rounded-xl px-2 py-2.5">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarUrl}
              alt={fullName}
              className="h-8 w-8 rounded-full object-cover ring-1 ring-surface-border"
            />
          ) : (
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${meta.gradient} text-[11px] font-bold text-white`}>
              {initials}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-white">{fullName}</p>
            <p className="truncate text-[10px] text-white/40 capitalize">{role}</p>
          </div>
          <button
            onClick={handleSignOut}
            disabled={isPending}
            title="Sign out"
            className="rounded-lg p-1.5 text-white/30 hover:text-red-400 hover:bg-red-900/20 transition-all duration-200 disabled:opacity-50"
            aria-label="Sign out"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </aside>
  )
}
