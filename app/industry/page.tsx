import { getAuthUser } from '@/lib/auth'
import { getRecruiterJobs } from '@/actions/jobs'
import { Building2, Plus, Users, MapPin, Briefcase, Sparkles } from 'lucide-react'
import Link from 'next/link'

export default async function IndustryDashboardPage() {
  const user = await getAuthUser()
  if (!user) return null

  // Fetch recruiter's active jobs
  const res = await getRecruiterJobs(user.id)
  const jobs = res.success && res.data ? res.data : []

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-brand-400 uppercase tracking-wider mb-1">
            <Building2 className="h-4 w-4" />
            Recruiter Portal
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Industry Dashboard
          </h1>
          <p className="mt-2 text-sm text-white/50 max-w-xl leading-relaxed">
            Manage your job postings and instantly source verified candidates using our pgvector semantic matching engine.
          </p>
        </div>
        <Link href="/industry/post-job" className="btn-primary shrink-0 flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Post New Job
        </Link>
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-emerald-400" />
          Your Active Postings
        </h2>

        {jobs.length === 0 ? (
          <div className="glass-card p-12 text-center flex flex-col items-center border-dashed">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface-hover mb-4">
              <Briefcase className="h-6 w-6 text-white/30" />
            </div>
            <h3 className="text-lg font-semibold text-white">No active jobs</h3>
            <p className="text-sm text-white/40 mt-1 max-w-sm mb-6">
              You haven&apos;t posted any jobs yet. Create your first posting to start sourcing candidates.
            </p>
            <Link href="/industry/post-job" className="btn-primary flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Job Posting
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-6">
            {jobs.map((job: any) => (
              <div key={job.id} className="glass-card-hover p-6 flex flex-col group relative overflow-hidden">
                <div className="flex items-start justify-between gap-4 mb-4 z-10">
                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-brand-300 transition-colors">
                      {job.title}
                    </h3>
                    <div className="flex items-center gap-3 text-sm text-white/50 mt-1">
                      <span className="flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5" />
                        {job.company_name}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5" />
                        {job.location}
                      </span>
                    </div>
                  </div>
                  <div className="px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider bg-surface-hover text-white/70 border-surface-border">
                    {job.job_type.replace('_', ' ')}
                  </div>
                </div>

                <div className="mt-auto pt-4 border-t border-surface-border flex items-center justify-between z-10">
                  <div className="flex flex-wrap gap-2">
                    {job.job_skills?.slice(0, 3).map((js: any) => (
                      <span key={js.skill_id} className="inline-flex items-center rounded-md bg-surface-hover px-2 py-1 text-xs font-medium text-white/70 ring-1 ring-inset ring-white/10">
                        {js.skills.name}
                      </span>
                    ))}
                    {job.job_skills?.length > 3 && (
                      <span className="inline-flex items-center rounded-md bg-surface px-2 py-1 text-xs font-medium text-white/40">
                        +{job.job_skills.length - 3}
                      </span>
                    )}
                  </div>
                  
                  <Link 
                    href={`/industry/candidates?jobId=${job.id}`} 
                    className="ml-4 flex items-center gap-1.5 px-4 py-2 rounded-lg font-semibold text-sm transition-all bg-brand-600 hover:bg-brand-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.3)] hover:shadow-[0_0_25px_rgba(99,102,241,0.5)] shrink-0"
                  >
                    <Sparkles className="h-4 w-4 text-brand-200" />
                    Find Candidates
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
