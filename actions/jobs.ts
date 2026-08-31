'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getRecruiterJobs(recruiterId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('jobs')
    .select(`
      id, title, company_name, location, job_type, workplace_type, status, created_at,
      job_skills (
        skill_id, is_mandatory, min_proficiency_score,
        skills ( name, category )
      )
    `)
    .eq('recruiter_id', recruiterId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching recruiter jobs:', error)
    return { success: false, data: [] }
  }

  return { success: true, data }
}

export async function createJobAction(formData: FormData, skills: Array<{ skill_id: string; is_mandatory: boolean; min_score: number }>) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Not authenticated' }

    // 1. Insert job
    const { data: job, error: jobError } = await (supabase as any)
      .from('jobs')
      .insert({
        recruiter_id: user.id,
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        company_name: formData.get('company_name') as string,
        job_type: formData.get('job_type') as 'internship' | 'full_time' | 'part_time' | 'contract',
        workplace_type: formData.get('workplace_type') as 'remote' | 'on_site' | 'hybrid',
        location: formData.get('location') as string,
        stipend_min: Number(formData.get('stipend_min')),
        stipend_max: Number(formData.get('stipend_max')),
        currency: 'INR',
        experience_level: formData.get('experience_level') as string,
        status: 'active'
      })
      .select('id')
      .single()

    if (jobError) return { success: false, error: jobError.message }

    // 2. Insert job skills
    if (skills && skills.length > 0) {
      const jobSkillsToInsert = skills.map((s) => ({
        job_id: job.id,
        skill_id: s.skill_id,
        is_mandatory: s.is_mandatory,
        min_proficiency_score: s.min_score
      }))

      const { error: skillsError } = await (supabase as any).from('job_skills').insert(jobSkillsToInsert)
      if (skillsError) return { success: false, error: skillsError.message }
    }

    revalidatePath('/industry')
    revalidatePath('/industry/jobs')
    
    return { success: true, jobId: job.id }
  } catch (err: any) {
    return { success: false, error: err.message || 'An unexpected error occurred' }
  }
}
