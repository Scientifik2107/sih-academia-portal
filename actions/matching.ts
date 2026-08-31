'use server'

import { createClient } from '@/lib/supabase/server'
import {
  JobMatchResult,
  CandidateMatchResult,
  RequiredSkill,
  StudentDemonstratedSkill,
} from '@/types/database.types'

export interface GetStudentMatchesParams {
  studentId: string
  matchThreshold?: number // 0.0 to 1.0 (default 0.0)
  limit?: number // default 10
  customEmbedding?: number[] | null
}

export interface GetCandidateMatchesParams {
  jobId: string
  matchThreshold?: number // 0.0 to 1.0 (default 0.0)
  limit?: number // default 10
  verifiedOnly?: boolean // default false
  customEmbedding?: number[] | null
}

export interface ActionResponse<T> {
  success: boolean
  data?: T
  error?: string
  meta?: {
    count: number
    threshold: number
    timestamp: string
  }
}

/**
 * Server Action: getStudentMatches
 * Fetches ranked job and internship matches for a student using pgvector cosine similarity
 * and discrete skill match scoring.
 */
export async function getStudentMatches(
  params: GetStudentMatchesParams
): Promise<ActionResponse<JobMatchResult[]>> {
  try {
    const supabase = createClient()
    const { studentId, matchThreshold = 0.0, limit = 10, customEmbedding = null } = params

    if (!studentId) {
      return { success: false, error: 'Student ID is required.' }
    }

    const embeddingString = customEmbedding ? `[${customEmbedding.join(',')}]` : null

    const { data, error } = await (supabase.rpc as any)('match_jobs_to_student', {
      p_student_id: studentId,
      p_match_threshold: matchThreshold,
      p_match_count: limit,
      p_query_embedding: embeddingString,
    })

    if (error) {
      console.error('Error in match_jobs_to_student RPC:', error)
      return { success: false, error: error.message }
    }

    const formattedMatches: JobMatchResult[] = (data || []).map((row: any) => ({
      job_id: row.job_id,
      recruiter_id: row.recruiter_id,
      company_name: row.company_name,
      title: row.title,
      description: row.description,
      job_type: row.job_type,
      workplace_type: row.workplace_type,
      location: row.location,
      stipend_range: row.stipend_range,
      status: row.status,
      deadline: row.deadline,
      vector_similarity: Number(row.vector_similarity) || 0,
      discrete_match_score: Number(row.discrete_match_score) || 0,
      hybrid_score: Number(row.hybrid_score) || 0,
      has_applied: Boolean(row.has_applied),
      required_skills: (Array.isArray(row.required_skills)
        ? row.required_skills
        : []) as RequiredSkill[],
    }))

    return {
      success: true,
      data: formattedMatches,
      meta: {
        count: formattedMatches.length,
        threshold: matchThreshold,
        timestamp: new Date().toISOString(),
      },
    }
  } catch (err: any) {
    console.error('Unexpected error in getStudentMatches:', err)
    return {
      success: false,
      error: err?.message || 'An unexpected error occurred while fetching job matches.',
    }
  }
}

/**
 * Server Action: getCandidateMatches
 * Reverse talent search allowing industry recruiters to find top matching student candidates
 * for an active job posting.
 */
export async function getCandidateMatches(
  params: GetCandidateMatchesParams
): Promise<ActionResponse<CandidateMatchResult[]>> {
  try {
    const supabase = createClient()
    const {
      jobId,
      matchThreshold = 0.0,
      limit = 10,
      verifiedOnly = false,
      customEmbedding = null,
    } = params

    if (!jobId) {
      return { success: false, error: 'Job ID is required.' }
    }

    const embeddingString = customEmbedding ? `[${customEmbedding.join(',')}]` : null

    const { data, error } = await (supabase.rpc as any)('match_students_to_job', {
      p_job_id: jobId,
      p_match_threshold: matchThreshold,
      p_match_count: limit,
      p_verified_only: verifiedOnly,
      p_query_embedding: embeddingString,
    })

    if (error) {
      console.error('Error in match_students_to_job RPC:', error)
      return { success: false, error: error.message }
    }

    const formattedCandidates: CandidateMatchResult[] = (data || []).map((row: any) => ({
      student_id: row.student_id,
      full_name: row.full_name,
      avatar_url: row.avatar_url,
      email: row.email,
      institution_name: row.institution_name,
      degree: row.degree,
      department: row.department,
      graduation_year: row.graduation_year,
      cgpa: row.cgpa !== null ? Number(row.cgpa) : null,
      verified_status: row.verified_status,
      summary: row.summary,
      resume_url: row.resume_url,
      vector_similarity: Number(row.vector_similarity) || 0,
      discrete_match_score: Number(row.discrete_match_score) || 0,
      hybrid_score: Number(row.hybrid_score) || 0,
      student_skills: (Array.isArray(row.student_skills)
        ? row.student_skills
        : []) as StudentDemonstratedSkill[],
    }))

    return {
      success: true,
      data: formattedCandidates,
      meta: {
        count: formattedCandidates.length,
        threshold: matchThreshold,
        timestamp: new Date().toISOString(),
      },
    }
  } catch (err: any) {
    console.error('Unexpected error in getCandidateMatches:', err)
    return {
      success: false,
      error: err?.message || 'An unexpected error occurred while searching for candidates.',
    }
  }
}
