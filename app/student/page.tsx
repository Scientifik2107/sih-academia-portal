import { getAuthUser } from '@/lib/auth'
import { getStudentMatches } from '@/actions/matching'
import { analyzeSkillGaps } from '@/actions/skill-gaps'
import { GraduationCap, ArrowRight, TrendingUp, Briefcase } from 'lucide-react'
import { JobMatchFeed } from '@/components/dashboard/student/JobMatchFeed'
import { SkillGapAnalyzer } from '@/components/dashboard/student/SkillGapAnalyzer'
import Link from 'next/link'

export default async function StudentDashboardPage() {
  const user = await getAuthUser()

  if (!user) return null

  // Fetch job matches using pgvector backend
  const matchRes = await getStudentMatches({ studentId: user.id, limit: 3 })
  const matches = matchRes?.success && matchRes.data ? matchRes.data : []

  // If we have matches, grab the top job to analyze the skill gap
  let gapData = null
  if (matches.length > 0) {
    const topJobId = matches[0].job_id
    const gapRes = await analyzeSkillGaps({ studentId: user.id, jobId: topJobId })
    if (gapRes?.success && gapRes.data) {
      gapData = gapRes.data
    }
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-brand-400 uppercase tracking-wider mb-1">
            <GraduationCap className="h-4 w-4" />
            Student Dashboard
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Welcome back,{' '}
            <span className="gradient-text">{user.full_name.split(' ')[0]}</span>
          </h1>
          <p className="mt-2 text-sm text-white/50 max-w-xl leading-relaxed">
            Here&apos;s your AI-powered placement readiness overview. We&apos;ve analyzed your verified skills against active industry requirements.
          </p>
        </div>
      </div>

      <div className="grid xl:grid-cols-12 gap-8">
        {/* Left Column: Skill Gap Analyzer (Takes up more space) */}
        <div className="xl:col-span-7 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-brand-400" />
              Skill Gap Analysis
            </h2>
            <Link href="/student/skill-gap" className="text-xs font-medium text-brand-400 hover:text-brand-300 flex items-center gap-1 transition-colors">
              Full Analysis <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <SkillGapAnalyzer gapData={gapData} />
        </div>

        {/* Right Column: Job Match Feed */}
        <div className="xl:col-span-5 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-emerald-400" />
              Top Recommended Jobs
            </h2>
            <Link href="/student/matches" className="text-xs font-medium text-brand-400 hover:text-brand-300 flex items-center gap-1 transition-colors">
              View All <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <JobMatchFeed matches={matches} />
        </div>
      </div>
    </div>
  )
}
