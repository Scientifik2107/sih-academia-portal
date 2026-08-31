'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createJobAction } from '@/actions/jobs'
import { Building2, Plus, ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function PostJobPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    const formData = new FormData(e.currentTarget)
    
    // For this UI scaffolding, we pass an empty skills array, but in a real scenario
    // we would have a multi-select skill picker component here.
    const res = await createJobAction(formData, [])
    
    if (res.success) {
      router.push('/industry')
    } else {
      setError(res.error || 'Failed to create job')
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <Link href="/industry" className="inline-flex items-center gap-2 text-xs font-medium text-white/50 hover:text-white transition-colors mb-4">
          <ArrowLeft className="h-3 w-3" />
          Back to Dashboard
        </Link>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Create Job Posting
        </h1>
        <p className="mt-2 text-sm text-white/50 max-w-xl leading-relaxed">
          Define your requirements clearly. Our AI will automatically translate this into a vector signature to find the best candidates.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="glass-card p-8 space-y-8">
        {error && (
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium">
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="title" className="label text-white/80">Job Title</label>
            <input
              type="text"
              id="title"
              name="title"
              required
              placeholder="e.g. Frontend Engineer Intern"
              className="input w-full bg-surface-hover border-surface-border text-white placeholder:text-white/20 focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="company_name" className="label text-white/80">Company Name</label>
            <input
              type="text"
              id="company_name"
              name="company_name"
              required
              placeholder="Your company"
              className="input w-full bg-surface-hover border-surface-border text-white placeholder:text-white/20 focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="description" className="label text-white/80">Job Description</label>
          <textarea
            id="description"
            name="description"
            required
            rows={4}
            placeholder="Describe the role, responsibilities, and what you are looking for..."
            className="input w-full bg-surface-hover border-surface-border text-white placeholder:text-white/20 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 resize-none"
          />
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label htmlFor="job_type" className="label text-white/80">Job Type</label>
            <select
              id="job_type"
              name="job_type"
              className="input w-full bg-surface-hover border-surface-border text-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500 appearance-none"
            >
              <option value="internship">Internship</option>
              <option value="full_time">Full Time</option>
              <option value="part_time">Part Time</option>
              <option value="contract">Contract</option>
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="workplace_type" className="label text-white/80">Workplace</label>
            <select
              id="workplace_type"
              name="workplace_type"
              className="input w-full bg-surface-hover border-surface-border text-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500 appearance-none"
            >
              <option value="remote">Remote</option>
              <option value="on_site">On-site</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="location" className="label text-white/80">Location</label>
            <input
              type="text"
              id="location"
              name="location"
              placeholder="e.g. Bengaluru"
              className="input w-full bg-surface-hover border-surface-border text-white placeholder:text-white/20 focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="stipend_min" className="label text-white/80">Min Stipend / Salary (INR)</label>
            <input
              type="number"
              id="stipend_min"
              name="stipend_min"
              placeholder="e.g. 20000"
              className="input w-full bg-surface-hover border-surface-border text-white placeholder:text-white/20 focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="stipend_max" className="label text-white/80">Max Stipend / Salary (INR)</label>
            <input
              type="number"
              id="stipend_max"
              name="stipend_max"
              placeholder="e.g. 50000"
              className="input w-full bg-surface-hover border-surface-border text-white placeholder:text-white/20 focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>
        </div>

        {/* Mocking the Dynamic Required Skills input for Phase 4.2 UI scaffolding */}
        <div className="space-y-2 pt-4 border-t border-surface-border">
          <label className="label text-white/80">Required Skills (Vector Match Criteria)</label>
          <div className="p-6 rounded-lg border border-dashed border-surface-border bg-surface-hover/50 text-center">
            <p className="text-sm text-white/50 mb-4">
              Select technical skills to build the candidate vector profile.
            </p>
            <button type="button" className="btn-ghost text-xs py-1.5 px-3 inline-flex items-center gap-1.5">
              <Plus className="h-3 w-3" />
              Add Skill Requirement
            </button>
          </div>
        </div>

        <div className="pt-6 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex items-center gap-2 min-w-[160px] justify-center"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Building2 className="h-4 w-4" />
                Post Job
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
