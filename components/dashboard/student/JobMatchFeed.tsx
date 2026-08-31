'use client'

import { Briefcase, Building2, MapPin, ExternalLink, Sparkles } from 'lucide-react'

interface JobMatchFeedProps {
  matches: any[] // Using any here to accommodate JobMatchResult since we might need to mock it if empty
}

export function JobMatchFeed({ matches }: JobMatchFeedProps) {
  if (!matches || matches.length === 0) {
    return (
      <div className="glass-card p-12 text-center flex flex-col items-center border-dashed">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface-hover mb-4">
          <Briefcase className="h-6 w-6 text-white/30" />
        </div>
        <h3 className="text-lg font-semibold text-white">No matches found yet</h3>
        <p className="text-sm text-white/40 mt-1 max-w-sm">
          Complete your profile and add more skills to see AI-recommended jobs here.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {matches.map((job) => {
        const isHighMatch = job.hybrid_score >= 80
        const isMediumMatch = job.hybrid_score >= 60 && job.hybrid_score < 80

        return (
          <div
            key={job.job_id}
            className="glass-card-hover p-6 flex flex-col sm:flex-row gap-5 relative overflow-hidden group"
          >
            {/* High match glow effect */}
            {isHighMatch && (
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
            )}

            <div className="flex-1">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-brand-300 transition-colors">
                    {job.title}
                  </h3>
                  <div className="flex items-center gap-3 text-sm text-white/50 mt-1">
                    <span className="flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5" />
                      {job.company_name || 'Confidential'}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" />
                      {job.location || 'Remote'}
                    </span>
                  </div>
                </div>
                
                {/* Match Badge */}
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold shrink-0 ${
                  isHighMatch 
                    ? 'bg-emerald-900/40 text-emerald-300 border-emerald-700/50 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                    : isMediumMatch
                    ? 'bg-amber-900/40 text-amber-300 border-amber-700/50'
                    : 'bg-surface-hover text-white/60 border-surface-border'
                }`}>
                  <Sparkles className="h-3.5 w-3.5" />
                  {job.hybrid_score.toFixed(0)}% Match
                </div>
              </div>

              <p className="text-sm text-white/60 line-clamp-2 mt-3 leading-relaxed">
                {job.description}
              </p>

              {/* Skills Tags */}
              <div className="mt-4 flex flex-wrap gap-2">
                {job.required_skills?.slice(0, 4).map((skill: any) => (
                  <span
                    key={skill.skill_id}
                    className="inline-flex items-center rounded-md bg-surface-hover px-2 py-1 text-xs font-medium text-white/70 ring-1 ring-inset ring-white/10"
                  >
                    {skill.skill_name}
                  </span>
                ))}
                {job.required_skills?.length > 4 && (
                  <span className="inline-flex items-center rounded-md bg-surface px-2 py-1 text-xs font-medium text-white/40">
                    +{job.required_skills.length - 4} more
                  </span>
                )}
              </div>
            </div>

            <div className="sm:border-l sm:border-surface-border sm:pl-5 flex flex-col justify-between shrink-0">
              <div className="text-right hidden sm:block">
                <p className="text-xs text-white/40 uppercase tracking-wider font-semibold">Compensation</p>
                <p className="text-sm font-medium text-white mt-0.5">{job.stipend_range || 'Not specified'}</p>
              </div>
              <button className="btn-ghost w-full sm:w-auto mt-4 sm:mt-0 text-xs py-2 px-4 group-hover:border-brand-500/50 group-hover:bg-brand-900/20">
                View Details
                <ExternalLink className="h-3 w-3" />
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
