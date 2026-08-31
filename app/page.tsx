import Link from 'next/link'
import {
  GraduationCap,
  Briefcase,
  BookOpen,
  Building2,
  Brain,
  Shield,
  TrendingUp,
  ArrowRight,
  Zap,
  Users,
  BarChart3,
} from 'lucide-react'

// ── Static data ───────────────────────────────────────────────────────────────

const ROLES = [
  {
    icon: GraduationCap,
    role: 'student' as const,
    title: 'Students',
    tagline: 'Discover your skill gap. Land your dream role.',
    points: [
      'AI-powered job match scores',
      'Verified portfolio badges',
      'Real-time skill gap analysis',
      'Curated job & internship feed',
    ],
    gradient: 'from-violet-600 to-indigo-600',
    glow:     'shadow-indigo-900/40',
    href:     '/login?role=student',
  },
  {
    icon: Briefcase,
    role: 'industry' as const,
    title: 'Industry',
    tagline: 'Find talent. Fast. Verified.',
    points: [
      'Semantic candidate search',
      'Skill-vector ranked shortlisting',
      'One-click job posting',
      'Placement analytics dashboard',
    ],
    gradient: 'from-sky-600 to-cyan-600',
    glow:     'shadow-cyan-900/40',
    href:     '/login?role=industry',
  },
  {
    icon: BookOpen,
    role: 'academician' as const,
    title: 'Academicians',
    tagline: 'Grow. Research. Consult.',
    points: [
      'FDP & training opportunities',
      'Industry consultancy projects',
      'Research grants & joint labs',
      'Guest lecture connections',
    ],
    gradient: 'from-emerald-600 to-teal-600',
    glow:     'shadow-emerald-900/40',
    href:     '/login?role=academician',
  },
  {
    icon: Building2,
    role: 'institution' as const,
    title: 'Institutions',
    tagline: 'Monitor. Verify. Benchmark.',
    points: [
      'Batch placement readiness',
      'Student credential verification',
      'Department analytics',
      'Industry collaboration tracker',
    ],
    gradient: 'from-amber-600 to-orange-600',
    glow:     'shadow-amber-900/40',
    href:     '/login?role=institution',
  },
]

const FEATURES = [
  {
    icon: Brain,
    title: 'pgvector Semantic Matching',
    description:
      'Cosine-similarity job matching powered by 1 536-dimensional skill embeddings. 50 % vector + 50 % discrete scoring.',
  },
  {
    icon: Shield,
    title: 'Zero-Trust RLS',
    description:
      'PostgreSQL Row Level Security enforced on every table. Each role sees only what they are authorized to see.',
  },
  {
    icon: TrendingUp,
    title: 'Real-time Skill Gaps',
    description:
      'Automated gap-analysis stored procedure computes which skills to acquire next and by how much.',
  },
  {
    icon: Users,
    title: 'Multi-Role RBAC',
    description:
      'Four distinct stakeholder roles with server-enforced middleware. Wrong-role access is blocked at the edge.',
  },
  {
    icon: BarChart3,
    title: 'Placement Analytics',
    description:
      'Institutions monitor batch readiness, department-wise performance, and verified vs. unverified student counts.',
  },
  {
    icon: Zap,
    title: 'Sub-ms Match Scoring',
    description:
      'All heavy match computation runs inside PostgreSQL via PL/pgSQL — zero round-trips, instant results.',
  },
]

// ── Page ─────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="relative isolate min-h-screen overflow-x-hidden">
      {/* Background gradient blobs */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[700px] w-[700px] rounded-full bg-brand-700/10 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-purple-700/10 blur-[100px]" />
      </div>

      {/* ── Nav ─────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-surface-border bg-surface/80 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-purple-600">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">AcadBridge</span>
          </div>

          <div className="hidden items-center gap-8 text-sm font-medium text-white/60 sm:flex">
            <a href="#roles"    className="hover:text-white transition-colors">Roles</a>
            <a href="#features" className="hover:text-white transition-colors">Features</a>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login"  className="btn-ghost hidden sm:inline-flex py-2 px-4 text-xs">
              Sign In
            </Link>
            <Link href="/signup" className="btn-primary py-2 px-4 text-xs">
              Get Started <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </nav>
      </header>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-6 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-brand-700/40 bg-brand-900/30 px-4 py-1.5 text-xs font-medium text-brand-300 mb-8 animate-fade-in">
          <Zap className="h-3 w-3" />
          Smart India Hackathon 2024 — Problem Statement PS-1601
        </div>

        <h1 className="text-balance text-5xl font-extrabold tracking-tight leading-tight sm:text-6xl lg:text-7xl animate-slide-up">
          Bridging{' '}
          <span className="gradient-text">Academia</span>
          {' & '}
          <span className="gradient-text">Industry</span>
          <br />
          with AI-Powered Skills
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg text-white/50 leading-relaxed animate-slide-up">
          AcadBridge connects students, recruiters, faculty, and institutions
          through a verified, vector-search skill-matching engine built on
          PostgreSQL&apos;s{' '}
          <code className="rounded bg-surface-border px-1.5 py-0.5 font-mono text-brand-300 text-sm">
            pgvector
          </code>{' '}
          extension.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4 animate-fade-in">
          <Link href="/signup" className="btn-primary glow-brand">
            Create Your Account
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/login" className="btn-ghost">
            I already have an account
          </Link>
        </div>
      </section>

      {/* ── Role cards ───────────────────────────────────────────────────── */}
      <section id="roles" className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-12 text-center">
          <h2 className="section-heading">
            One Platform, Four Stakeholders
          </h2>
          <p className="mt-3 text-white/40">
            Each role has a purpose-built dashboard, enforced at the server edge.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {ROLES.map(({ icon: Icon, title, tagline, points, gradient, glow, href }) => (
            <Link
              key={title}
              href={href}
              className={`glass-card-hover group flex flex-col gap-5 p-6 shadow-xl ${glow}`}
            >
              {/* Icon */}
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} shadow-lg`}
              >
                <Icon className="h-6 w-6 text-white" />
              </div>

              <div>
                <h3 className="text-base font-bold text-white">{title}</h3>
                <p className="mt-1 text-sm text-white/50">{tagline}</p>
              </div>

              <ul className="space-y-1.5 text-xs text-white/40">
                {points.map((p) => (
                  <li key={p} className="flex items-center gap-2">
                    <span className="h-1 w-1 rounded-full bg-brand-400" />
                    {p}
                  </li>
                ))}
              </ul>

              <div className="mt-auto flex items-center gap-1.5 text-xs font-semibold text-brand-400 group-hover:text-brand-300 transition-colors">
                Enter Portal
                <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Feature grid ─────────────────────────────────────────────────── */}
      <section id="features" className="mx-auto max-w-7xl px-6 py-20 border-t border-surface-border">
        <div className="mb-12 text-center">
          <h2 className="section-heading">
            Production-Grade Architecture
          </h2>
          <p className="mt-3 text-white/40">
            Built for scale, security, and sub-millisecond intelligence.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <div key={title} className="glass-card p-6 group hover:border-brand-500/30 transition-colors duration-300">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-brand-900/60 border border-brand-700/30 group-hover:bg-brand-800/60 transition-colors">
                <Icon className="h-5 w-5 text-brand-400" />
              </div>
              <h3 className="text-sm font-semibold text-white mb-2">{title}</h3>
              <p className="text-xs leading-relaxed text-white/40">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer CTA ───────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-6 py-20 text-center">
        <div className="glass-card p-12 glow-brand">
          <h2 className="text-3xl font-bold text-white">
            Ready to bridge the gap?
          </h2>
          <p className="mt-3 text-white/40">
            Join thousands of students, recruiters, and faculty already on the platform.
          </p>
          <Link href="/signup" className="btn-primary mt-8 inline-flex">
            Start for Free
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-surface-border py-8 text-center text-xs text-white/20">
        © 2024 AcadBridge — Smart India Hackathon Project. All rights reserved.
      </footer>
    </div>
  )
}
