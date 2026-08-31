'use client'

import { useState } from 'react'
import { Building, Users, TrendingUp, Award, CheckCircle, CheckCircle2, XCircle, BarChart3, ShieldAlert } from 'lucide-react'

// Mock data for UI scaffolding
const mockMetrics = {
  totalPlaced: 428,
  avgPackage: '8.5 LPA',
  topCompanies: 'Google, Amazon, TCS',
  aiReadinessScore: 78
}

const mockChartData = [
  { dept: 'Computer Science', offers: 180, total: 200 },
  { dept: 'Electronics (ECE)', offers: 110, total: 150 },
  { dept: 'Mechanical', offers: 65, total: 120 },
  { dept: 'Civil', offers: 35, total: 90 },
  { dept: 'Information Tech', offers: 140, total: 160 },
]

const initialVerifications = [
  { id: '1', student: 'Rahul Sharma', dept: 'CSE', type: 'CGPA', detail: '8.9 / 10', date: '2026-09-01' },
  { id: '2', student: 'Priya Patel', dept: 'IT', type: 'Skill', detail: 'React.js (Advanced)', date: '2026-09-01' },
  { id: '3', student: 'Amit Singh', dept: 'ECE', type: 'Skill', detail: 'Embedded Systems', date: '2026-08-31' },
  { id: '4', student: 'Sneha Gupta', dept: 'CSE', type: 'CGPA', detail: '9.2 / 10', date: '2026-08-31' },
]

export default function InstitutionDashboardPage() {
  const [verifications, setVerifications] = useState(initialVerifications)

  const handleVerify = (id: string) => {
    setVerifications(verifications.filter(v => v.id !== id))
  }

  const handleReject = (id: string) => {
    setVerifications(verifications.filter(v => v.id !== id))
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in pb-20">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-brand-400 uppercase tracking-wider mb-1">
          <Building className="h-4 w-4" />
          Institution Portal
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          TPO Analytics Console
        </h1>
        <p className="mt-2 text-sm text-white/50 max-w-xl leading-relaxed">
          Monitor batch-wide placement readiness, departmental performance, and verify student credentials to boost their AI match rankings.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-6 border-b-4 border-b-emerald-500">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-white/60">Total Students Placed</h3>
            <Users className="h-5 w-5 text-emerald-400" />
          </div>
          <div className="text-3xl font-bold text-white">{mockMetrics.totalPlaced}</div>
          <p className="text-xs text-emerald-400 mt-2 flex items-center gap-1">
            <TrendingUp className="h-3 w-3" /> +12% from last year
          </p>
        </div>

        <div className="glass-card p-6 border-b-4 border-b-brand-500">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-white/60">Average Package</h3>
            <TrendingUp className="h-5 w-5 text-brand-400" />
          </div>
          <div className="text-3xl font-bold text-white">{mockMetrics.avgPackage}</div>
          <p className="text-xs text-brand-400 mt-2">Overall across departments</p>
        </div>

        <div className="glass-card p-6 border-b-4 border-b-amber-500">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-white/60">Top Recruiters</h3>
            <Building className="h-5 w-5 text-amber-400" />
          </div>
          <div className="text-lg font-bold text-white leading-tight mt-1">{mockMetrics.topCompanies}</div>
        </div>

        <div className="glass-card p-6 border-b-4 border-b-purple-500 relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-500/20 blur-2xl rounded-full pointer-events-none" />
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-white/60">AI Readiness Score</h3>
            <Award className="h-5 w-5 text-purple-400" />
          </div>
          <div className="text-3xl font-bold text-white">{mockMetrics.aiReadinessScore}<span className="text-lg text-white/40 font-normal">/100</span></div>
          <p className="text-xs text-purple-400 mt-2">Batch vector match average</p>
        </div>
      </div>

      {/* Chart & Verifications Grid */}
      <div className="grid xl:grid-cols-2 gap-8">
        
        {/* Department Chart */}
        <div className="glass-card p-6 flex flex-col">
          <div className="flex items-center gap-2 mb-8">
            <BarChart3 className="h-5 w-5 text-brand-400" />
            <h2 className="text-lg font-bold text-white">Offers by Department</h2>
          </div>
          
          <div className="flex-1 flex flex-col justify-center space-y-6">
            {mockChartData.map((data) => {
              const percentage = (data.offers / data.total) * 100
              return (
                <div key={data.dept}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium text-white/80">{data.dept}</span>
                    <span className="text-white/50">{data.offers} / {data.total} offers</span>
                  </div>
                  <div className="h-2.5 w-full bg-surface-border rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-brand-500 rounded-full relative"
                      style={{ width: `${percentage}%` }}
                    >
                      <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite]" />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Pending Verifications */}
        <div className="glass-card p-0 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-surface-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-amber-400" />
              <h2 className="text-lg font-bold text-white">Pending Verifications</h2>
            </div>
            <div className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold border border-amber-500/20">
              {verifications.length} Pending
            </div>
          </div>
          
          {verifications.length === 0 ? (
            <div className="p-12 text-center">
              <CheckCircle className="h-10 w-10 text-emerald-500/50 mx-auto mb-3" />
              <p className="text-white/60 font-medium">All caught up!</p>
              <p className="text-xs text-white/40 mt-1">No pending student verifications.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-surface-hover/50 text-white/50">
                  <tr>
                    <th className="px-6 py-4 font-medium">Student</th>
                    <th className="px-6 py-4 font-medium">Type</th>
                    <th className="px-6 py-4 font-medium">Details</th>
                    <th className="px-6 py-4 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border">
                  {verifications.map((v) => (
                    <tr key={v.id} className="hover:bg-surface-hover/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-white/90">{v.student}</div>
                        <div className="text-xs text-white/40">{v.dept}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                          v.type === 'CGPA' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        }`}>
                          {v.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-white/80">
                        {v.detail}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleReject(v.id)}
                            className="p-1.5 text-white/30 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors"
                            title="Reject"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleVerify(v.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 transition-colors text-xs font-semibold"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Verify
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
