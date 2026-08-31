'use client'

import { Target, CheckCircle2, AlertTriangle, BookOpen, ExternalLink, Activity } from 'lucide-react'

interface SkillGapAnalyzerProps {
  gapData: any // Using any for mockability 
}

export function SkillGapAnalyzer({ gapData }: SkillGapAnalyzerProps) {
  if (!gapData) {
    return (
      <div className="glass-card p-12 text-center flex flex-col items-center border-dashed">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface-hover mb-4">
          <Activity className="h-6 w-6 text-white/30" />
        </div>
        <h3 className="text-lg font-semibold text-white">No gap analysis available</h3>
        <p className="text-sm text-white/40 mt-1 max-w-sm">
          Apply to a job or wait for AI recommendations to see your personalized skill gap analysis.
        </p>
      </div>
    )
  }

  const {
    readiness_score,
    matching_skills = [],
    deficient_skills = [],
    missing_mandatory_skills = [],
    missing_optional_skills = [],
    learning_recommendations = [],
  } = gapData

  const weaknesses = [
    ...missing_mandatory_skills.map((s: any) => ({ ...s, type: 'missing_mandatory' })),
    ...deficient_skills.map((s: any) => ({ ...s, type: 'deficient' })),
    ...missing_optional_skills.map((s: any) => ({ ...s, type: 'missing_optional' })),
  ]

  return (
    <div className="space-y-6">
      {/* Overview Score */}
      <div className="glass-card p-6 flex flex-col sm:flex-row items-center gap-6 overflow-hidden relative">
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-48 h-48 bg-brand-500/10 rounded-full blur-[80px] pointer-events-none" />
        
        <div className="relative flex items-center justify-center shrink-0">
          <svg className="w-24 h-24 transform -rotate-90">
            <circle
              cx="48"
              cy="48"
              r="40"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              className="text-surface-border"
            />
            <circle
              cx="48"
              cy="48"
              r="40"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={251.2}
              strokeDashoffset={251.2 - (251.2 * readiness_score) / 100}
              strokeLinecap="round"
              className="text-brand-500 transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-white">{readiness_score.toFixed(0)}</span>
            <span className="text-[10px] text-white/40 font-semibold uppercase">Score</span>
          </div>
        </div>

        <div className="text-center sm:text-left z-10">
          <h3 className="text-xl font-bold text-white">Target Job Readiness</h3>
          <p className="text-sm text-white/50 mt-1 max-w-md leading-relaxed">
            Based on your profile, you meet {readiness_score.toFixed(0)}% of the requirements for your top recommended job. Focus on the red areas to improve your chances.
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Strengths */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <h4 className="font-semibold text-white">Verified Strengths</h4>
          </div>
          
          {matching_skills.length === 0 ? (
            <p className="text-sm text-white/40 italic">No verified skills match the requirements.</p>
          ) : (
            <ul className="space-y-3">
              {matching_skills.map((skill: any) => (
                <li key={skill.skill_id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white/80">{skill.skill_name}</span>
                    {skill.is_verified && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-emerald-900/30 text-emerald-400 border border-emerald-700/30">
                        Verified
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-white/40">
                    {skill.student_proficiency} / {skill.required_proficiency}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Weaknesses */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-4 w-4 text-amber-400" />
            <h4 className="font-semibold text-white">Skill Gaps to Address</h4>
          </div>

          {weaknesses.length === 0 ? (
            <p className="text-sm text-white/40 italic">You meet all requirements!</p>
          ) : (
            <ul className="space-y-4">
              {weaknesses.slice(0, 5).map((skill: any, i) => {
                const required = skill.required_proficiency || 50
                const current = skill.student_proficiency || 0
                const percent = (current / required) * 100
                const isMandatory = skill.type === 'missing_mandatory' || (skill.type === 'deficient' && skill.is_mandatory)

                return (
                  <li key={`${skill.skill_id}-${i}`}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="font-medium text-white/80 flex items-center gap-1.5">
                        {skill.skill_name}
                        {isMandatory && <span className="text-red-400 text-[10px] uppercase font-bold">*Mandatory</span>}
                      </span>
                      <span className="text-white/40 text-xs">{current} / {required}</span>
                    </div>
                    {/* Progress Bar */}
                    <div className="h-1.5 w-full bg-surface-border rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${isMandatory ? 'bg-red-500' : 'bg-amber-500'}`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>

      {/* Recommended Learning */}
      {learning_recommendations.length > 0 && (
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="h-4 w-4 text-brand-400" />
            <h4 className="font-semibold text-white">Recommended Learning Path</h4>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {learning_recommendations.map((rec: any, idx: number) => (
              <a 
                key={idx}
                href="#"
                className="block p-4 rounded-xl border border-surface-border bg-surface-hover hover:border-brand-500/40 hover:bg-surface-card transition-all group"
              >
                <div className="flex justify-between items-start mb-2">
                  <h5 className="font-semibold text-sm text-white group-hover:text-brand-300 transition-colors">
                    {rec.skill_name}
                  </h5>
                  <ExternalLink className="h-3 w-3 text-white/30 group-hover:text-brand-400 transition-colors" />
                </div>
                <p className="text-xs text-white/50 line-clamp-2">
                  {rec.suggested_focus}
                </p>
                <div className="mt-3 inline-flex items-center gap-1 rounded bg-surface px-1.5 py-0.5 text-[10px] font-medium text-white/40">
                  Target: {rec.target_proficiency}
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
