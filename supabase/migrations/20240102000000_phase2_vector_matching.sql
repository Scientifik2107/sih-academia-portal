-- ==============================================================================
-- ACADEMIA-INDUSTRY COLLABORATION PORTAL (Smart India Hackathon)
-- PHASE 2: PGVECTOR EXTENSION, VECTOR EMBEDDINGS & MATCHING STORED PROCEDURES
-- ==============================================================================

-- 1. ENABLE PGVECTOR EXTENSION
CREATE EXTENSION IF NOT EXISTS vector;

-- ==============================================================================
-- 2. ALTER TABLES TO STORE EMBEDDINGS (1536-Dimensional Vectors)
-- ==============================================================================

-- Student Profiles Embedding
ALTER TABLE public.student_profiles 
    ADD COLUMN IF NOT EXISTS embedding vector(1536),
    ADD COLUMN IF NOT EXISTS embedding_updated_at TIMESTAMPTZ;

-- Jobs Embedding
ALTER TABLE public.jobs 
    ADD COLUMN IF NOT EXISTS embedding vector(1536),
    ADD COLUMN IF NOT EXISTS embedding_updated_at TIMESTAMPTZ;

-- Academician Opportunities Embedding
ALTER TABLE public.academician_opportunities 
    ADD COLUMN IF NOT EXISTS embedding vector(1536),
    ADD COLUMN IF NOT EXISTS embedding_updated_at TIMESTAMPTZ;

-- ==============================================================================
-- 3. HNSW INDEXES (Hierarchical Navigable Small World for Cosine Distance)
-- ==============================================================================

CREATE INDEX IF NOT EXISTS idx_student_profiles_embedding_hnsw 
    ON public.student_profiles 
    USING hnsw (embedding vector_cosine_ops) 
    WITH (m = 16, ef_construction = 64);

CREATE INDEX IF NOT EXISTS idx_jobs_embedding_hnsw 
    ON public.jobs 
    USING hnsw (embedding vector_cosine_ops) 
    WITH (m = 16, ef_construction = 64);

CREATE INDEX IF NOT EXISTS idx_academician_opps_embedding_hnsw 
    ON public.academician_opportunities 
    USING hnsw (embedding vector_cosine_ops) 
    WITH (m = 16, ef_construction = 64);

-- ==============================================================================
-- 4. VECTOR MATCHING STORED PROCEDURES (RPCs)
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 4.1 RPC: match_jobs_to_student
-- Returns ranked jobs for a student using semantic cosine similarity & hybrid score
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.match_jobs_to_student(
    p_student_id UUID,
    p_match_threshold FLOAT DEFAULT 0.0,
    p_match_count INT DEFAULT 10,
    p_query_embedding vector(1536) DEFAULT NULL
)
RETURNS TABLE (
    job_id UUID,
    recruiter_id UUID,
    company_name TEXT,
    title TEXT,
    description TEXT,
    job_type public.job_type_enum,
    workplace_type public.workplace_type_enum,
    location TEXT,
    stipend_range TEXT,
    status public.job_status_enum,
    deadline TIMESTAMPTZ,
    vector_similarity NUMERIC,
    discrete_match_score NUMERIC,
    hybrid_score NUMERIC,
    has_applied BOOLEAN,
    required_skills JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
    v_target_embedding vector(1536);
BEGIN
    -- Resolve embedding: either provided directly or retrieved from student profile
    IF p_query_embedding IS NOT NULL THEN
        v_target_embedding := p_query_embedding;
    ELSE
        SELECT embedding INTO v_target_embedding 
        FROM public.student_profiles 
        WHERE id = p_student_id;
    END IF;

    RETURN QUERY
    WITH job_matches AS (
        SELECT 
            j.id AS j_id,
            j.recruiter_id AS j_recruiter_id,
            j.company_name AS j_company_name,
            j.title AS j_title,
            j.description AS j_description,
            j.job_type AS j_job_type,
            j.workplace_type AS j_workplace_type,
            j.location AS j_location,
            j.stipend_range AS j_stipend_range,
            j.status AS j_status,
            j.deadline AS j_deadline,
            CASE 
                WHEN v_target_embedding IS NOT NULL AND j.embedding IS NOT NULL THEN
                    ROUND(GREATEST(0.0, (1 - (j.embedding <=> v_target_embedding)))::numeric * 100, 2)
                ELSE
                    0.00
            END AS v_sim,
            public.calculate_job_match_score(p_student_id, j.id) AS d_score,
            EXISTS (
                SELECT 1 FROM public.applications a 
                WHERE a.job_id = j.id AND a.applicant_id = p_student_id
            ) AS applied_flag,
            COALESCE(
                (
                    SELECT jsonb_agg(
                        jsonb_build_object(
                            'skill_id', s.id,
                            'skill_name', s.name,
                            'category', s.category,
                            'is_mandatory', js.is_mandatory,
                            'min_proficiency_score', js.min_proficiency_score
                        )
                    )
                    FROM public.job_skills js
                    JOIN public.skills s ON js.skill_id = s.id
                    WHERE js.job_id = j.id
                ),
                '[]'::jsonb
            ) AS req_skills
        FROM public.jobs j
        WHERE j.status = 'active'
    )
    SELECT 
        jm.j_id,
        jm.j_recruiter_id,
        jm.j_company_name,
        jm.j_title,
        jm.j_description,
        jm.j_job_type,
        jm.j_workplace_type,
        jm.j_location,
        jm.j_stipend_range,
        jm.j_status,
        jm.j_deadline,
        jm.v_sim,
        jm.d_score,
        -- Hybrid calculation: 50% Vector Similarity + 50% Discrete Skill Matching
        ROUND(
            CASE 
                WHEN jm.v_sim > 0 THEN ((jm.v_sim * 0.50) + (jm.d_score * 0.50))
                ELSE jm.d_score
            END,
            2
        ) AS h_score,
        jm.applied_flag,
        jm.req_skills
    FROM job_matches jm
    WHERE 
        (jm.v_sim >= (p_match_threshold * 100) OR jm.d_score >= (p_match_threshold * 100))
    ORDER BY 
        -- Rank primarily by hybrid score descending, then discrete score
        (CASE WHEN jm.v_sim > 0 THEN ((jm.v_sim * 0.50) + (jm.d_score * 0.50)) ELSE jm.d_score END) DESC,
        jm.d_score DESC
    LIMIT p_match_count;
END;
$$;

COMMENT ON FUNCTION public.match_jobs_to_student IS 'Vector-powered hybrid job recommendation engine for students.';

-- ------------------------------------------------------------------------------
-- 4.2 RPC: match_students_to_job
-- Returns ranked student candidate pool for a recruiter job posting
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.match_students_to_job(
    p_job_id UUID,
    p_match_threshold FLOAT DEFAULT 0.0,
    p_match_count INT DEFAULT 10,
    p_verified_only BOOLEAN DEFAULT false,
    p_query_embedding vector(1536) DEFAULT NULL
)
RETURNS TABLE (
    student_id UUID,
    full_name TEXT,
    avatar_url TEXT,
    email TEXT,
    institution_name TEXT,
    degree TEXT,
    department TEXT,
    graduation_year INTEGER,
    cgpa NUMERIC,
    verified_status public.verification_status,
    summary TEXT,
    resume_url TEXT,
    vector_similarity NUMERIC,
    discrete_match_score NUMERIC,
    hybrid_score NUMERIC,
    student_skills JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
    v_job_embedding vector(1536);
BEGIN
    -- Resolve job embedding
    IF p_query_embedding IS NOT NULL THEN
        v_job_embedding := p_query_embedding;
    ELSE
        SELECT embedding INTO v_job_embedding 
        FROM public.jobs 
        WHERE id = p_job_id;
    END IF;

    RETURN QUERY
    WITH candidate_matches AS (
        SELECT 
            sp.id AS s_id,
            p.full_name AS s_full_name,
            p.avatar_url AS s_avatar_url,
            p.email AS s_email,
            COALESCE(ip.institution_name, 'Independent Candidate') AS s_inst_name,
            sp.degree AS s_degree,
            sp.department AS s_department,
            sp.graduation_year AS s_grad_year,
            sp.cgpa AS s_cgpa,
            sp.verified_status AS s_verified_status,
            sp.summary AS s_summary,
            sp.resume_url AS s_resume_url,
            CASE 
                WHEN v_job_embedding IS NOT NULL AND sp.embedding IS NOT NULL THEN
                    ROUND(GREATEST(0.0, (1 - (sp.embedding <=> v_job_embedding)))::numeric * 100, 2)
                ELSE
                    0.00
            END AS v_sim,
            public.calculate_job_match_score(sp.id, p_job_id) AS d_score,
            COALESCE(
                (
                    SELECT jsonb_agg(
                        jsonb_build_object(
                            'skill_id', s.id,
                            'skill_name', s.name,
                            'category', s.category,
                            'proficiency_score', ss.proficiency_score,
                            'is_verified', ss.is_verified,
                            'verification_source', ss.verification_source
                        )
                    )
                    FROM public.student_skills ss
                    JOIN public.skills s ON ss.skill_id = s.id
                    WHERE ss.student_id = sp.id
                ),
                '[]'::jsonb
            ) AS s_skills
        FROM public.student_profiles sp
        JOIN public.profiles p ON sp.id = p.id
        LEFT JOIN public.institution_profiles ip ON sp.institution_id = ip.id
        WHERE 
            (NOT p_verified_only OR sp.verified_status = 'verified')
    )
    SELECT 
        cm.s_id,
        cm.s_full_name,
        cm.s_avatar_url,
        cm.s_email,
        cm.s_inst_name,
        cm.s_degree,
        cm.s_department,
        cm.s_grad_year,
        cm.s_cgpa,
        cm.s_verified_status,
        cm.s_summary,
        cm.s_resume_url,
        cm.v_sim,
        cm.d_score,
        -- Hybrid calculation
        ROUND(
            CASE 
                WHEN cm.v_sim > 0 THEN ((cm.v_sim * 0.50) + (cm.d_score * 0.50))
                ELSE cm.d_score
            END,
            2
        ) AS h_score,
        cm.s_skills
    FROM candidate_matches cm
    WHERE 
        (cm.v_sim >= (p_match_threshold * 100) OR cm.d_score >= (p_match_threshold * 100))
    ORDER BY 
        (CASE WHEN cm.v_sim > 0 THEN ((cm.v_sim * 0.50) + (cm.d_score * 0.50)) ELSE cm.d_score END) DESC,
        cm.d_score DESC
    LIMIT p_match_count;
END;
$$;

COMMENT ON FUNCTION public.match_students_to_job IS 'Reverse talent search engine ranking candidates for recruiters via vector and verified skill similarity.';

-- ------------------------------------------------------------------------------
-- 4.3 RPC: analyze_student_job_skill_gap
-- Computes granular skill gaps, deficiencies, and readiness index for a student/job pair
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.analyze_student_job_skill_gap(
    p_student_id UUID,
    p_job_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
    v_result JSONB;
    v_matching_skills JSONB;
    v_deficient_skills JSONB;
    v_missing_mandatory JSONB;
    v_missing_optional JSONB;
    v_readiness_score NUMERIC;
BEGIN
    -- 1. Matching skills (Student has skill AND proficiency >= required)
    SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
            'skill_id', s.id,
            'skill_name', s.name,
            'category', s.category,
            'is_mandatory', js.is_mandatory,
            'required_proficiency', js.min_proficiency_score,
            'student_proficiency', ss.proficiency_score,
            'is_verified', ss.is_verified,
            'surplus', ss.proficiency_score - js.min_proficiency_score
        )
    ), '[]'::jsonb)
    INTO v_matching_skills
    FROM public.job_skills js
    JOIN public.skills s ON js.skill_id = s.id
    JOIN public.student_skills ss ON js.skill_id = ss.skill_id AND ss.student_id = p_student_id
    WHERE js.job_id = p_job_id AND ss.proficiency_score >= js.min_proficiency_score;

    -- 2. Deficient skills (Student has skill, but proficiency < required)
    SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
            'skill_id', s.id,
            'skill_name', s.name,
            'category', s.category,
            'is_mandatory', js.is_mandatory,
            'required_proficiency', js.min_proficiency_score,
            'student_proficiency', ss.proficiency_score,
            'is_verified', ss.is_verified,
            'gap', js.min_proficiency_score - ss.proficiency_score
        )
    ), '[]'::jsonb)
    INTO v_deficient_skills
    FROM public.job_skills js
    JOIN public.skills s ON js.skill_id = s.id
    JOIN public.student_skills ss ON js.skill_id = ss.skill_id AND ss.student_id = p_student_id
    WHERE js.job_id = p_job_id AND ss.proficiency_score < js.min_proficiency_score;

    -- 3. Missing Mandatory skills (Job requires skill as mandatory, student does NOT have it)
    SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
            'skill_id', s.id,
            'skill_name', s.name,
            'category', s.category,
            'is_mandatory', true,
            'required_proficiency', js.min_proficiency_score,
            'student_proficiency', 0,
            'gap', js.min_proficiency_score
        )
    ), '[]'::jsonb)
    INTO v_missing_mandatory
    FROM public.job_skills js
    JOIN public.skills s ON js.skill_id = s.id
    LEFT JOIN public.student_skills ss ON js.skill_id = ss.skill_id AND ss.student_id = p_student_id
    WHERE js.job_id = p_job_id AND js.is_mandatory = true AND ss.skill_id IS NULL;

    -- 4. Missing Optional skills (Job desires skill as optional, student does NOT have it)
    SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
            'skill_id', s.id,
            'skill_name', s.name,
            'category', s.category,
            'is_mandatory', false,
            'required_proficiency', js.min_proficiency_score,
            'student_proficiency', 0,
            'gap', js.min_proficiency_score
        )
    ), '[]'::jsonb)
    INTO v_missing_optional
    FROM public.job_skills js
    JOIN public.skills s ON js.skill_id = s.id
    LEFT JOIN public.student_skills ss ON js.skill_id = ss.skill_id AND ss.student_id = p_student_id
    WHERE js.job_id = p_job_id AND js.is_mandatory = false AND ss.skill_id IS NULL;

    -- 5. Calculate readiness score
    v_readiness_score := public.calculate_job_match_score(p_student_id, p_job_id);

    -- Build consolidated JSON payload
    v_result := jsonb_build_object(
        'student_id', p_student_id,
        'job_id', p_job_id,
        'readiness_score', v_readiness_score,
        'matching_skills', v_matching_skills,
        'deficient_skills', v_deficient_skills,
        'missing_mandatory_skills', v_missing_mandatory,
        'missing_optional_skills', v_missing_optional,
        'summary', jsonb_build_object(
            'total_matching', jsonb_array_length(v_matching_skills),
            'total_deficient', jsonb_array_length(v_deficient_skills),
            'total_missing_mandatory', jsonb_array_length(v_missing_mandatory),
            'total_missing_optional', jsonb_array_length(v_missing_optional)
        )
    );

    RETURN v_result;
END;
$$;

COMMENT ON FUNCTION public.analyze_student_job_skill_gap IS 'Performs deep diagnostic skill gap analysis between student proficiencies and target job benchmarks.';
