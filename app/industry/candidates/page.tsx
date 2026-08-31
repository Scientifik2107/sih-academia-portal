import { getAuthUser } from '@/lib/auth'
import { getCandidateMatches } from '@/actions/matching'
import { Sparkles, ArrowLeft, GraduationCap, Building, ShieldCheck, Mail, FileText, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function CandidateSearchPage({
  searchParams,
}: {
  searchParams: { jobId?: string }
}) {
  const user = await getAuthUser()
  if (!user) return null

  const jobId = searchParams.jobId
  if (!jobId) {
    redirect('/industry')
  }

  // Fetch AI reverse search matches using pgvector
  const matchRes = await getCandidateMatches({ jobId, limit: 10 })
  const candidates = matchRes?.success && matchRes.data ? matchRes.data : []

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <Link href="/industry" className="inline-flex items-center gap-2 text-xs font-medium text-white/50 hover:text-white transition-colors mb-4">
          <ArrowLeft className="h-3 w-3" />
          Back to Jobs
        </Link>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/20 text-brand-400">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              AI Candidate Search
            </h1>
            <p className="mt-1 text-sm text-white/50 max-w-xl leading-relaxed">
              Showing top semantic matches from our pgvector engine for this job posting.
            </p>
          </div>
        </div>
      </div>

      {candidates.length === 0 ? (
        <div className="glass-card p-12 text-center flex flex-col items-center border-dashed">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface-hover mb-4">
            <GraduationCap className="h-6 w-6 text-white/30" />
          </div>
          <h3 className="text-lg font-semibold text-white">No candidates found</h3>
          <p className="text-sm text-white/40 mt-1 max-w-sm">
            We couldn&apos;t find any students matching your exact vector criteria right now. Check back later.
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {candidates.map((candidate: any) => {
            const isHighMatch = candidate.hybrid_score >= 80
            
            return (
              <div key={candidate.student_id} className="glass-card-hover p-6 flex flex-col md:flex-row gap-6 relative overflow-hidden group">
                {/* Glow for high matches */}
                {isHighMatch && (
                  <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
                )}

                {/* Candidate Info */}
                <div className="flex-1 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      <div className="h-12 w-12 rounded-full bg-surface-hover border border-surface-border flex items-center justify-center text-lg font-bold text-white/80 overflow-hidden shrink-0">
                        {candidate.avatar_url ? (
                          <img src={candidate.avatar_url} alt={candidate.full_name} className="h-full w-full object-cover" />
                        ) : (
                          candidate.full_name.charAt(0)
                        )}
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-bold text-white group-hover:text-brand-300 transition-colors flex items-center gap-2">
                          {candidate.full_name}
                          {candidate.verified_status === 'verified' && (
                            <div className="flex items-center gap-1 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-900/40 text-emerald-400 border border-emerald-700/50" title="Verified by Institution">
                              <ShieldCheck className="h-3 w-3" />
                              Verified
                            </div>
                          )}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-white/50 mt-1">
                          <span className="flex items-center gap-1.5">
                            <Building className="h-3.5 w-3.5" />
                            {candidate.institution_name}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <GraduationCap className="h-3.5 w-3.5" />
                            {candidate.degree} • Class of {candidate.graduation_year}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-sm text-white/60 leading-relaxed max-w-3xl line-clamp-2">
                    {candidate.summary || 'No summary provided.'}
                  </div>
                  
                  {/* Skills tags */}
                  <div className="flex flex-wrap gap-2">
                    {candidate.student_skills?.slice(0, 5).map((skill: any) => (
                      <span key={skill.skill_id} className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                        skill.is_verified 
                          ? 'bg-emerald-900/20 text-emerald-300 ring-emerald-700/30' 
                          : 'bg-surface-hover text-white/70 ring-white/10'
                      }`}>
                        {skill.skill_name}
                        {skill.is_verified && <ShieldCheck className="h-3 w-3 ml-1 opacity-70" />}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Score & Actions */}
                <div className="md:border-l border-surface-border md:pl-6 flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-4 shrink-0">
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1">
                      Match Score
                    </span>
                    <div className={`text-3xl font-black ${
                      isHighMatch ? 'text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'text-amber-400'
                    }`}>
                      {candidate.hybrid_score.toFixed(0)}%
                    </div>
                    {candidate.cgpa && (
                      <div className="text-xs text-white/50 font-medium mt-1">
                        CGPA: <span className="text-white/80">{candidate.cgpa}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col gap-2 w-full md:w-auto">
                    <button className="btn-primary flex items-center justify-center gap-2 text-sm py-2 px-6">
                      <Mail className="h-4 w-4" />
                      Contact
                    </button>
                    {candidate.resume_url && (
                      <button className="btn-ghost flex items-center justify-center gap-2 text-sm py-2 px-6 group-hover:border-brand-500/50">
                        <FileText className="h-4 w-4" />
                        Resume
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
