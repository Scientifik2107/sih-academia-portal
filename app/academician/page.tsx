import { getAuthUser } from '@/lib/auth'
import { BookOpen, Users, Presentation, ExternalLink, Activity, Network, CheckCircle2 } from 'lucide-react'

export default async function AcademicianDashboardPage() {
  const user = await getAuthUser()
  if (!user) return null

  // Mock data for UI scaffolding
  const opportunities = [
    {
      id: '1',
      type: 'Faculty Development Program',
      title: 'Advanced AI & LLM Integration in Engineering Curricula',
      company: 'Google Cloud India',
      duration: '4 Weeks',
      stipend: 'Fully Funded',
      tags: ['Generative AI', 'Pedagogy', 'Cloud computing'],
      status: 'Open'
    },
    {
      id: '2',
      type: 'Industry Consultancy',
      title: 'Optimizing Logistics Routing using Quantum Algorithms',
      company: 'Amazon Research',
      duration: '6 Months',
      stipend: '₹3,00,000 Research Grant',
      tags: ['Quantum Computing', 'Algorithms', 'Operations Research'],
      status: 'Closing Soon'
    }
  ]

  const collaborations = [
    {
      id: 'c1',
      title: 'Next-Gen EV Battery Thermal Management',
      partner: 'Tata Motors R&D',
      role: 'Principal Investigator',
      status: 'Active',
      progress: 65,
      students_involved: 4
    }
  ]

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-brand-400 uppercase tracking-wider mb-1">
            <BookOpen className="h-4 w-4" />
            Academician Portal
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Welcome, <span className="gradient-text">Prof. {user.full_name.split(' ')[0]}</span>
          </h1>
          <p className="mt-2 text-sm text-white/50 max-w-xl leading-relaxed">
            Discover industry-sponsored Faculty Development Programs (FDPs) and manage your active corporate research collaborations.
          </p>
        </div>
      </div>

      <div className="grid xl:grid-cols-12 gap-8">
        {/* Left Column: Opportunities Feed */}
        <div className="xl:col-span-8 space-y-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Presentation className="h-5 w-5 text-brand-400" />
            Industry Programs & FDPs
          </h2>
          
          <div className="space-y-4">
            {opportunities.map((opp) => (
              <div key={opp.id} className="glass-card-hover p-6 group">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-brand-500/20 text-brand-300 border border-brand-500/30">
                        {opp.type}
                      </span>
                      {opp.status === 'Closing Soon' && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          Closing Soon
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-white group-hover:text-brand-300 transition-colors">
                      {opp.title}
                    </h3>
                    <p className="text-sm text-white/50 mt-1 flex items-center gap-2">
                      <Network className="h-4 w-4" /> {opp.company}
                    </p>
                  </div>
                  <button className="btn-ghost shrink-0 py-2 px-4 group-hover:border-brand-500/50 group-hover:bg-brand-900/20 text-sm flex items-center gap-2">
                    View Details <ExternalLink className="h-3 w-3" />
                  </button>
                </div>

                <div className="mt-4 pt-4 border-t border-surface-border flex items-center justify-between">
                  <div className="flex flex-wrap gap-2">
                    {opp.tags.map(tag => (
                      <span key={tag} className="inline-flex items-center rounded-md bg-surface-hover px-2 py-1 text-xs font-medium text-white/70 ring-1 ring-inset ring-white/10">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="text-right shrink-0 ml-4 text-sm font-medium text-white/80">
                    {opp.stipend} • {opp.duration}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Active Collaborations */}
        <div className="xl:col-span-4 space-y-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Activity className="h-5 w-5 text-emerald-400" />
            My Collaborations
          </h2>

          <div className="space-y-4">
            {collaborations.map(collab => (
              <div key={collab.id} className="glass-card p-5">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-white/90">{collab.title}</h4>
                </div>
                <p className="text-sm text-white/50 mb-4">{collab.partner}</p>
                
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-white/60">Project Progress</span>
                      <span className="text-emerald-400 font-medium">{collab.progress}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-surface-border rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${collab.progress}%` }} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-surface-border">
                    <span className="text-xs text-white/50 flex items-center gap-1.5">
                      <CheckCircle2 className="h-3 w-3" /> {collab.role}
                    </span>
                    <span className="text-xs text-white/50 flex items-center gap-1.5">
                      <Users className="h-3 w-3" /> {collab.students_involved} Students
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
