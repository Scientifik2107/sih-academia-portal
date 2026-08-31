'use server'

import { createClient } from '@/lib/supabase/server'
import { SkillGapAnalysisResult, SkillGapItem } from '@/types/database.types'
import { ActionResponse } from './matching'

export interface AnalyzeSkillGapsParams {
  studentId: string
  jobId: string
}

/**
 * Server Action: analyzeSkillGaps
 * Compares a student's verified & self-reported competencies against a target job's benchmarks.
 * Pinpoints missing mandatory skills, deficient proficiencies, and generates a structured learning roadmap.
 */
export async function analyzeSkillGaps(
  params: AnalyzeSkillGapsParams
): Promise<ActionResponse<SkillGapAnalysisResult>> {
  try {
    const supabase = createClient()
    const { studentId, jobId } = params

    if (!studentId || !jobId) {
      return { success: false, error: 'Both studentId and jobId are required for gap analysis.' }
    }

    const { data, error } = await (supabase.rpc as any)('analyze_student_job_skill_gap', {
      p_student_id: studentId,
      p_job_id: jobId,
    })

    if (error) {
      console.error('Error in analyze_student_job_skill_gap RPC:', error)
      return { success: false, error: error.message }
    }

    const rawData = data as any

    const matchingSkills: SkillGapItem[] = Array.isArray(rawData?.matching_skills)
      ? rawData.matching_skills
      : []

    const deficientSkills: SkillGapItem[] = Array.isArray(rawData?.deficient_skills)
      ? rawData.deficient_skills
      : []

    const missingMandatory: SkillGapItem[] = Array.isArray(rawData?.missing_mandatory_skills)
      ? rawData.missing_mandatory_skills
      : []

    const missingOptional: SkillGapItem[] = Array.isArray(rawData?.missing_optional_skills)
      ? rawData.missing_optional_skills
      : []

    // Generate intelligent prioritized learning recommendations
    const recommendations: NonNullable<SkillGapAnalysisResult['learning_recommendations']> = []

    // 1. Missing Mandatory -> High Priority
    missingMandatory.forEach((item) => {
      recommendations.push({
        skill_name: item.skill_name,
        category: item.category,
        priority: 'HIGH',
        target_proficiency: item.required_proficiency,
        suggested_focus: `Mandatory requirement: Complete foundational curriculum and benchmark assessment to reach ${item.required_proficiency}/100.`,
      })
    })

    // 2. Deficient Skills -> Medium Priority
    deficientSkills.forEach((item) => {
      recommendations.push({
        skill_name: item.skill_name,
        category: item.category,
        priority: 'MEDIUM',
        target_proficiency: item.required_proficiency,
        suggested_focus: `Competency gap (${item.student_proficiency}/100 vs required ${item.required_proficiency}/100): Upgrade proficiency by +${item.gap || (item.required_proficiency - item.student_proficiency)} points.`,
      })
    })

    // 3. Missing Optional -> Low Priority (Competitive edge)
    missingOptional.forEach((item) => {
      recommendations.push({
        skill_name: item.skill_name,
        category: item.category,
        priority: 'LOW',
        target_proficiency: item.required_proficiency,
        suggested_focus: `Preferred bonus skill: Explore introductory modules to gain a competitive advantage in interviews.`,
      })
    })

    const analysisResult: SkillGapAnalysisResult = {
      student_id: rawData?.student_id || studentId,
      job_id: rawData?.job_id || jobId,
      readiness_score: Number(rawData?.readiness_score) || 0,
      matching_skills: matchingSkills,
      deficient_skills: deficientSkills,
      missing_mandatory_skills: missingMandatory,
      missing_optional_skills: missingOptional,
      summary: {
        total_matching: matchingSkills.length,
        total_deficient: deficientSkills.length,
        total_missing_mandatory: missingMandatory.length,
        total_missing_optional: missingOptional.length,
      },
      learning_recommendations: recommendations,
    }

    return {
      success: true,
      data: analysisResult,
      meta: {
        count:
          matchingSkills.length +
          deficientSkills.length +
          missingMandatory.length +
          missingOptional.length,
        threshold: 0,
        timestamp: new Date().toISOString(),
      },
    }
  } catch (err: any) {
    console.error('Unexpected error in analyzeSkillGaps:', err)
    return {
      success: false,
      error: err?.message || 'An unexpected error occurred while analyzing skill gaps.',
    }
  }
}
