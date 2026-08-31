export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'student' | 'industry' | 'academician' | 'institution'
export type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected'
export type JobType = 'internship' | 'full_time' | 'part_time' | 'contract'
export type WorkplaceType = 'remote' | 'on_site' | 'hybrid'
export type JobStatus = 'draft' | 'active' | 'paused' | 'closed' | 'archived'
export type OpportunityType =
  | 'fdp'
  | 'research_grant'
  | 'consultancy'
  | 'curriculum_review'
  | 'guest_lecture'
  | 'joint_lab'
export type OpportunityStatus = 'open' | 'in_progress' | 'closed' | 'archived'
export type ApplicationStatus =
  | 'applied'
  | 'under_review'
  | 'shortlisted'
  | 'interviewing'
  | 'accepted'
  | 'rejected'
  | 'withdrawn'
export type SkillCategory =
  | 'programming_languages'
  | 'frameworks_libraries'
  | 'databases'
  | 'cloud_devops'
  | 'ai_ml_datascience'
  | 'cybersecurity'
  | 'core_engineering'
  | 'soft_skills'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          role: UserRole
          full_name: string
          email: string
          avatar_url: string | null
          phone: string | null
          bio: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          role: UserRole
          full_name: string
          email: string
          avatar_url?: string | null
          phone?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          role?: UserRole
          full_name?: string
          email?: string
          avatar_url?: string | null
          phone?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      institution_profiles: {
        Row: {
          id: string
          institution_name: string
          aishe_code: string | null
          accreditation_grade: string | null
          state: string
          city: string
          website: string | null
          is_verified_institution: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          institution_name: string
          aishe_code?: string | null
          accreditation_grade?: string | null
          state: string
          city: string
          website?: string | null
          is_verified_institution?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          institution_name?: string
          aishe_code?: string | null
          accreditation_grade?: string | null
          state?: string
          city?: string
          website?: string | null
          is_verified_institution?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "institution_profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      industry_profiles: {
        Row: {
          id: string
          company_name: string
          industry_sector: string
          cin_or_gstin: string | null
          company_size: string | null
          website: string | null
          is_verified_company: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          company_name: string
          industry_sector: string
          cin_or_gstin?: string | null
          company_size?: string | null
          website?: string | null
          is_verified_company?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_name?: string
          industry_sector?: string
          cin_or_gstin?: string | null
          company_size?: string | null
          website?: string | null
          is_verified_company?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "industry_profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      academician_profiles: {
        Row: {
          id: string
          institution_id: string | null
          department: string
          designation: string
          highest_qualification: string | null
          orcid_id: string | null
          research_areas: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          institution_id?: string | null
          department: string
          designation: string
          highest_qualification?: string | null
          orcid_id?: string | null
          research_areas?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          institution_id?: string | null
          department?: string
          designation?: string
          highest_qualification?: string | null
          orcid_id?: string | null
          research_areas?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "academician_profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "academician_profiles_institution_id_fkey"
            columns: ["institution_id"]
            referencedRelation: "institution_profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      student_profiles: {
        Row: {
          id: string
          institution_id: string | null
          roll_number: string | null
          department: string
          degree: string
          graduation_year: number
          cgpa: number | null
          verified_status: VerificationStatus
          verified_at: string | null
          verified_by: string | null
          summary: string | null
          resume_url: string | null
          github_url: string | null
          linkedin_url: string | null
          portfolio_url: string | null
          embedding: string | null
          embedding_updated_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          institution_id?: string | null
          roll_number?: string | null
          department: string
          degree: string
          graduation_year: number
          cgpa?: number | null
          verified_status?: VerificationStatus
          verified_at?: string | null
          verified_by?: string | null
          summary?: string | null
          resume_url?: string | null
          github_url?: string | null
          linkedin_url?: string | null
          portfolio_url?: string | null
          embedding?: string | null
          embedding_updated_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          institution_id?: string | null
          roll_number?: string | null
          department?: string
          degree?: string
          graduation_year?: number
          cgpa?: number | null
          verified_status?: VerificationStatus
          verified_at?: string | null
          verified_by?: string | null
          summary?: string | null
          resume_url?: string | null
          github_url?: string | null
          linkedin_url?: string | null
          portfolio_url?: string | null
          embedding?: string | null
          embedding_updated_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_profiles_institution_id_fkey"
            columns: ["institution_id"]
            referencedRelation: "institution_profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      skills: {
        Row: {
          id: string
          name: string
          category: SkillCategory
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          category: SkillCategory
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          category?: SkillCategory
          description?: string | null
          created_at?: string
        }
        Relationships: []
      }
      student_skills: {
        Row: {
          id: string
          student_id: string
          skill_id: string
          proficiency_score: number
          is_verified: boolean
          verified_by: string | null
          verification_source: string
          last_assessed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          student_id: string
          skill_id: string
          proficiency_score: number
          is_verified?: boolean
          verified_by?: string | null
          verification_source?: string
          last_assessed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          skill_id?: string
          proficiency_score?: number
          is_verified?: boolean
          verified_by?: string | null
          verification_source?: string
          last_assessed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_skills_student_id_fkey"
            columns: ["student_id"]
            referencedRelation: "student_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_skills_skill_id_fkey"
            columns: ["skill_id"]
            referencedRelation: "skills"
            referencedColumns: ["id"]
          }
        ]
      }
      jobs: {
        Row: {
          id: string
          recruiter_id: string
          company_name: string | null
          title: string
          description: string
          job_type: JobType
          workplace_type: WorkplaceType
          location: string | null
          stipend_min: number | null
          stipend_max: number | null
          currency: string
          stipend_range: string | null
          experience_level: string | null
          status: JobStatus
          deadline: string | null
          embedding: string | null
          embedding_updated_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          recruiter_id: string
          company_name?: string | null
          title: string
          description: string
          job_type: JobType
          workplace_type?: WorkplaceType
          location?: string | null
          stipend_min?: number | null
          stipend_max?: number | null
          currency?: string
          experience_level?: string | null
          status?: JobStatus
          deadline?: string | null
          embedding?: string | null
          embedding_updated_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          recruiter_id?: string
          company_name?: string | null
          title?: string
          description?: string
          job_type?: JobType
          workplace_type?: WorkplaceType
          location?: string | null
          stipend_min?: number | null
          stipend_max?: number | null
          currency?: string
          experience_level?: string | null
          status?: JobStatus
          deadline?: string | null
          embedding?: string | null
          embedding_updated_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "jobs_recruiter_id_fkey"
            columns: ["recruiter_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      job_skills: {
        Row: {
          id: string
          job_id: string
          skill_id: string
          is_mandatory: boolean
          min_proficiency_score: number
          created_at: string
        }
        Insert: {
          id?: string
          job_id: string
          skill_id: string
          is_mandatory?: boolean
          min_proficiency_score?: number
          created_at?: string
        }
        Update: {
          id?: string
          job_id?: string
          skill_id?: string
          is_mandatory?: boolean
          min_proficiency_score?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_skills_job_id_fkey"
            columns: ["job_id"]
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_skills_skill_id_fkey"
            columns: ["skill_id"]
            referencedRelation: "skills"
            referencedColumns: ["id"]
          }
        ]
      }
      academician_opportunities: {
        Row: {
          id: string
          creator_id: string
          opportunity_type: OpportunityType
          title: string
          description: string
          organization_name: string
          budget_or_grant: number | null
          currency: string
          duration: string | null
          status: OpportunityStatus
          deadline: string | null
          embedding: string | null
          embedding_updated_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          creator_id: string
          opportunity_type: OpportunityType
          title: string
          description: string
          organization_name: string
          budget_or_grant?: number | null
          currency?: string
          duration?: string | null
          status?: OpportunityStatus
          deadline?: string | null
          embedding?: string | null
          embedding_updated_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          creator_id?: string
          opportunity_type?: OpportunityType
          title?: string
          description?: string
          organization_name?: string
          budget_or_grant?: number | null
          currency?: string
          duration?: string | null
          status?: OpportunityStatus
          deadline?: string | null
          embedding?: string | null
          embedding_updated_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "academician_opportunities_creator_id_fkey"
            columns: ["creator_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      applications: {
        Row: {
          id: string
          applicant_id: string
          job_id: string | null
          academician_opportunity_id: string | null
          status: ApplicationStatus
          cover_note: string | null
          resume_snapshot_url: string | null
          calculated_match_score: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          applicant_id: string
          job_id?: string | null
          academician_opportunity_id?: string | null
          status?: ApplicationStatus
          cover_note?: string | null
          resume_snapshot_url?: string | null
          calculated_match_score?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          applicant_id?: string
          job_id?: string | null
          academician_opportunity_id?: string | null
          status?: ApplicationStatus
          cover_note?: string | null
          resume_snapshot_url?: string | null
          calculated_match_score?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_applicant_id_fkey"
            columns: ["applicant_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_job_id_fkey"
            columns: ["job_id"]
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_academician_opportunity_id_fkey"
            columns: ["academician_opportunity_id"]
            referencedRelation: "academician_opportunities"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_job_match_score: {
        Args: {
          p_student_id: string
          p_job_id: string
        }
        Returns: number
      }
      match_jobs_to_student: {
        Args: {
          p_student_id: string
          p_match_threshold?: number
          p_match_count?: number
          p_query_embedding?: string | null
        }
        Returns: {
          job_id: string
          recruiter_id: string
          company_name: string | null
          title: string
          description: string
          job_type: JobType
          workplace_type: WorkplaceType
          location: string | null
          stipend_range: string | null
          status: JobStatus
          deadline: string | null
          vector_similarity: number
          discrete_match_score: number
          hybrid_score: number
          has_applied: boolean
          required_skills: {
            skill_id: string
            skill_name: string
            category: SkillCategory
            is_mandatory: boolean
            min_proficiency_score: number
          }[]
        }[]
      }
      match_students_to_job: {
        Args: {
          p_job_id: string
          p_match_threshold?: number
          p_match_count?: number
          p_verified_only?: boolean
          p_query_embedding?: string | null
        }
        Returns: {
          student_id: string
          full_name: string
          avatar_url: string | null
          email: string
          institution_name: string
          degree: string
          department: string
          graduation_year: number
          cgpa: number | null
          verified_status: VerificationStatus
          summary: string | null
          resume_url: string | null
          vector_similarity: number
          discrete_match_score: number
          hybrid_score: number
          student_skills: {
            skill_id: string
            skill_name: string
            category: SkillCategory
            proficiency_score: number
            is_verified: boolean
            verification_source: string
          }[]
        }[]
      }
      analyze_student_job_skill_gap: {
        Args: {
          p_student_id: string
          p_job_id: string
        }
        Returns: {
          student_id: string
          job_id: string
          readiness_score: number
          matching_skills: {
            skill_id: string
            skill_name: string
            category: SkillCategory
            is_mandatory: boolean
            required_proficiency: number
            student_proficiency: number
            is_verified: boolean
            surplus: number
          }[]
          deficient_skills: {
            skill_id: string
            skill_name: string
            category: SkillCategory
            is_mandatory: boolean
            required_proficiency: number
            student_proficiency: number
            is_verified: boolean
            gap: number
          }[]
          missing_mandatory_skills: {
            skill_id: string
            skill_name: string
            category: SkillCategory
            is_mandatory: boolean
            required_proficiency: number
            student_proficiency: number
            gap: number
          }[]
          missing_optional_skills: {
            skill_id: string
            skill_name: string
            category: SkillCategory
            is_mandatory: boolean
            required_proficiency: number
            student_proficiency: number
            gap: number
          }[]
          summary: {
            total_matching: number
            total_deficient: number
            total_missing_mandatory: number
            total_missing_optional: number
          }
        }
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: UserRole
      }
      is_institution_for_student: {
        Args: {
          p_student_id: string
        }
        Returns: boolean
      }
      is_job_owner: {
        Args: {
          p_job_id: string
        }
        Returns: boolean
      }
      is_opportunity_owner: {
        Args: {
          p_opp_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      user_role: UserRole
      verification_status: VerificationStatus
      job_type_enum: JobType
      workplace_type_enum: WorkplaceType
      job_status_enum: JobStatus
      opportunity_type_enum: OpportunityType
      opportunity_status_enum: OpportunityStatus
      application_status_enum: ApplicationStatus
      skill_category_enum: SkillCategory
    }
  }
}

// ------------------------------------------------------------------------------
// Domain & Return Interfaces for Matching & Skill Gap Analysis
// ------------------------------------------------------------------------------

export interface RequiredSkill {
  skill_id: string
  skill_name: string
  category: SkillCategory
  is_mandatory: boolean
  min_proficiency_score: number
}

export interface StudentDemonstratedSkill {
  skill_id: string
  skill_name: string
  category: SkillCategory
  proficiency_score: number
  is_verified: boolean
  verification_source: string
}

export interface JobMatchResult {
  job_id: string
  recruiter_id: string
  company_name: string | null
  title: string
  description: string
  job_type: JobType
  workplace_type: WorkplaceType
  location: string | null
  stipend_range: string | null
  status: JobStatus
  deadline: string | null
  vector_similarity: number
  discrete_match_score: number
  hybrid_score: number
  has_applied: boolean
  required_skills: RequiredSkill[]
}

export interface CandidateMatchResult {
  student_id: string
  full_name: string
  avatar_url: string | null
  email: string
  institution_name: string
  degree: string
  department: string
  graduation_year: number
  cgpa: number | null
  verified_status: VerificationStatus
  summary: string | null
  resume_url: string | null
  vector_similarity: number
  discrete_match_score: number
  hybrid_score: number
  student_skills: StudentDemonstratedSkill[]
}

export interface SkillGapItem {
  skill_id: string
  skill_name: string
  category: SkillCategory
  is_mandatory: boolean
  required_proficiency: number
  student_proficiency: number
  is_verified?: boolean
  gap?: number
  surplus?: number
}

export interface SkillGapSummary {
  total_matching: number
  total_deficient: number
  total_missing_mandatory: number
  total_missing_optional: number
}

export interface SkillGapAnalysisResult {
  student_id: string
  job_id: string
  readiness_score: number
  matching_skills: SkillGapItem[]
  deficient_skills: SkillGapItem[]
  missing_mandatory_skills: SkillGapItem[]
  missing_optional_skills: SkillGapItem[]
  summary: SkillGapSummary
  learning_recommendations?: {
    skill_name: string
    category: SkillCategory
    priority: 'HIGH' | 'MEDIUM' | 'LOW'
    target_proficiency: number
    suggested_focus: string
  }[]
}
