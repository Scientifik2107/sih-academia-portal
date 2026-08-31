-- ==============================================================================
-- ACADEMIA-INDUSTRY COLLABORATION PORTAL (Smart India Hackathon)
-- PHASE 1: DATABASE ARCHITECTURE & SECURITY LAYER
-- Database: PostgreSQL (Supabase Compatible)
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. CUSTOM ENUM TYPES
-- ==============================================================================

DO $$ BEGIN
    CREATE TYPE public.user_role AS ENUM (
        'student',
        'industry',
        'academician',
        'institution'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.verification_status AS ENUM (
        'unverified',
        'pending',
        'verified',
        'rejected'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.job_type_enum AS ENUM (
        'internship',
        'full_time',
        'part_time',
        'contract'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.workplace_type_enum AS ENUM (
        'remote',
        'on_site',
        'hybrid'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.job_status_enum AS ENUM (
        'draft',
        'active',
        'paused',
        'closed',
        'archived'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.opportunity_type_enum AS ENUM (
        'fdp',                  -- Faculty Development Program
        'research_grant',       -- Joint Research Project / Grant
        'consultancy',          -- Industry Consultancy Problem
        'curriculum_review',    -- Industry Syllabus Alignment
        'guest_lecture',        -- Expert Lecture Series
        'joint_lab'             -- Centre of Excellence / Co-branded Lab
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.opportunity_status_enum AS ENUM (
        'open',
        'in_progress',
        'closed',
        'archived'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.application_status_enum AS ENUM (
        'applied',
        'under_review',
        'shortlisted',
        'interviewing',
        'accepted',
        'rejected',
        'withdrawn'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.skill_category_enum AS ENUM (
        'programming_languages',
        'frameworks_libraries',
        'databases',
        'cloud_devops',
        'ai_ml_datascience',
        'cybersecurity',
        'core_engineering',
        'soft_skills'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ==============================================================================
-- 3. CORE RELATIONAL TABLES
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 3.1 PROFILES TABLE (Extends auth.users)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role public.user_role NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    avatar_url TEXT,
    phone TEXT,
    bio TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

COMMENT ON TABLE public.profiles IS 'Master profile extending Supabase auth.users with RBAC role and metadata.';

-- ------------------------------------------------------------------------------
-- 3.2 INSTITUTION PROFILES (Colleges, Universities & Institutes)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.institution_profiles (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    institution_name TEXT NOT NULL,
    aishe_code TEXT UNIQUE,
    accreditation_grade TEXT, -- e.g., 'NAAC A++', 'NBA', 'NIRF Top 50'
    state TEXT NOT NULL,
    city TEXT NOT NULL,
    website TEXT,
    is_verified_institution BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

COMMENT ON TABLE public.institution_profiles IS 'Academic institution directory and verification registry.';

-- ------------------------------------------------------------------------------
-- 3.3 INDUSTRY PROFILES (Recruiters, Corporates & Startups)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.industry_profiles (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    industry_sector TEXT NOT NULL,
    cin_or_gstin TEXT,
    company_size TEXT,
    website TEXT,
    is_verified_company BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

COMMENT ON TABLE public.industry_profiles IS 'Corporate and recruiter organizational profiles.';

-- ------------------------------------------------------------------------------
-- 3.4 ACADEMICIAN PROFILES (Professors, Researchers & Faculty)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.academician_profiles (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    institution_id UUID REFERENCES public.institution_profiles(id) ON DELETE SET NULL,
    department TEXT NOT NULL,
    designation TEXT NOT NULL,
    highest_qualification TEXT,
    orcid_id TEXT,
    research_areas TEXT[],
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

COMMENT ON TABLE public.academician_profiles IS 'Faculty and researcher profiles linking to parent institutions.';

-- ------------------------------------------------------------------------------
-- 3.5 STUDENT PROFILES (1-to-1 extension with profiles)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.student_profiles (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    institution_id UUID REFERENCES public.institution_profiles(id) ON DELETE SET NULL,
    roll_number TEXT,
    department TEXT NOT NULL,
    degree TEXT NOT NULL, -- e.g., 'B.Tech Computer Science', 'MCA'
    graduation_year INTEGER NOT NULL,
    cgpa NUMERIC(4, 2) CHECK (cgpa >= 0.00 AND cgpa <= 10.00),
    verified_status public.verification_status DEFAULT 'unverified' NOT NULL,
    verified_at TIMESTAMPTZ,
    verified_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    summary TEXT,
    resume_url TEXT,
    github_url TEXT,
    linkedin_url TEXT,
    portfolio_url TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

COMMENT ON TABLE public.student_profiles IS 'Student academic record, institutional linkage, and verified credentials.';

-- ------------------------------------------------------------------------------
-- 3.6 SKILLS MASTER TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    category public.skill_category_enum NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

COMMENT ON TABLE public.skills IS 'Master catalog of technical, engineering, and soft skills.';

-- ------------------------------------------------------------------------------
-- 3.7 STUDENT SKILLS JUNCTION TABLE (Skill gaps & verified assessments)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.student_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
    proficiency_score INTEGER NOT NULL CHECK (proficiency_score >= 0 AND proficiency_score <= 100),
    is_verified BOOLEAN DEFAULT false NOT NULL,
    verified_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    verification_source TEXT DEFAULT 'self_reported' NOT NULL,
    last_assessed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_student_skill UNIQUE (student_id, skill_id)
);

COMMENT ON TABLE public.student_skills IS 'Student competency scores, assessment verification, and credentials.';

-- ------------------------------------------------------------------------------
-- 3.8 JOBS TABLE (Industry Job & Internship postings)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recruiter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    company_name TEXT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    job_type public.job_type_enum NOT NULL,
    workplace_type public.workplace_type_enum DEFAULT 'hybrid' NOT NULL,
    location TEXT,
    stipend_min NUMERIC(12, 2),
    stipend_max NUMERIC(12, 2),
    currency VARCHAR(5) DEFAULT 'INR' NOT NULL,
    stipend_range TEXT GENERATED ALWAYS AS (
        CASE 
            WHEN stipend_min IS NOT NULL AND stipend_max IS NOT NULL THEN (stipend_min::text || ' - ' || stipend_max::text || ' ' || currency)
            WHEN stipend_min IS NOT NULL THEN ('>= ' || stipend_min::text || ' ' || currency)
            ELSE 'Competitive / Disclosed on Interview'
        END
    ) STORED,
    experience_level TEXT,
    status public.job_status_enum DEFAULT 'active' NOT NULL,
    deadline TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

COMMENT ON TABLE public.jobs IS 'Industry job and internship listings with structured compensation.';

-- ------------------------------------------------------------------------------
-- 3.9 JOB SKILLS JUNCTION TABLE (Mandatory & Optional skill criteria)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.job_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
    is_mandatory BOOLEAN DEFAULT true NOT NULL,
    min_proficiency_score INTEGER DEFAULT 50 CHECK (min_proficiency_score >= 0 AND min_proficiency_score <= 100),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_job_skill UNIQUE (job_id, skill_id)
);

COMMENT ON TABLE public.job_skills IS 'Required skill benchmarks for job match scoring algorithms.';

-- ------------------------------------------------------------------------------
-- 3.10 ACADEMICIAN OPPORTUNITIES (FDPs, Research & Consultancies)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.academician_opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    opportunity_type public.opportunity_type_enum NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    organization_name TEXT NOT NULL,
    budget_or_grant NUMERIC(12, 2),
    currency VARCHAR(5) DEFAULT 'INR' NOT NULL,
    duration TEXT,
    status public.opportunity_status_enum DEFAULT 'open' NOT NULL,
    deadline TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

COMMENT ON TABLE public.academician_opportunities IS 'Faculty Development Programs, joint research, and consultancy portals.';

-- ------------------------------------------------------------------------------
-- 3.11 APPLICATIONS TABLE (Unified Application Tracking Pipeline)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    applicant_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
    academician_opportunity_id UUID REFERENCES public.academician_opportunities(id) ON DELETE CASCADE,
    status public.application_status_enum DEFAULT 'applied' NOT NULL,
    cover_note TEXT,
    resume_snapshot_url TEXT,
    calculated_match_score NUMERIC(5, 2) CHECK (calculated_match_score >= 0.00 AND calculated_match_score <= 100.00),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT check_single_application_target CHECK (
        (job_id IS NOT NULL AND academician_opportunity_id IS NULL) OR
        (job_id IS NULL AND academician_opportunity_id IS NOT NULL)
    ),
    CONSTRAINT unique_job_application UNIQUE (applicant_id, job_id),
    CONSTRAINT unique_academic_application UNIQUE (applicant_id, academician_opportunity_id)
);

COMMENT ON TABLE public.applications IS 'Stateful candidate/faculty application pipeline with match score caching.';

-- ==============================================================================
-- 4. PERFORMANCE INDEXES
-- ==============================================================================

-- Profiles & Sub-profiles
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_student_profiles_institution ON public.student_profiles(institution_id);
CREATE INDEX IF NOT EXISTS idx_student_profiles_verified ON public.student_profiles(verified_status);
CREATE INDEX IF NOT EXISTS idx_student_profiles_grad_dept ON public.student_profiles(graduation_year, department);
CREATE INDEX IF NOT EXISTS idx_academician_profiles_institution ON public.academician_profiles(institution_id);

-- Skills & Match Scoring
CREATE INDEX IF NOT EXISTS idx_skills_category ON public.skills(category);
CREATE INDEX IF NOT EXISTS idx_student_skills_lookup ON public.student_skills(student_id, proficiency_score);
CREATE INDEX IF NOT EXISTS idx_student_skills_skill ON public.student_skills(skill_id, is_verified);
CREATE INDEX IF NOT EXISTS idx_job_skills_job ON public.job_skills(job_id);
CREATE INDEX IF NOT EXISTS idx_job_skills_skill ON public.job_skills(skill_id);

-- Jobs & Opportunities
CREATE INDEX IF NOT EXISTS idx_jobs_recruiter ON public.jobs(recruiter_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status_type ON public.jobs(status, job_type);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON public.jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_academician_opportunities_creator ON public.academician_opportunities(creator_id);
CREATE INDEX IF NOT EXISTS idx_academician_opportunities_type_status ON public.academician_opportunities(opportunity_type, status);

-- Applications
CREATE INDEX IF NOT EXISTS idx_applications_applicant ON public.applications(applicant_id);
CREATE INDEX IF NOT EXISTS idx_applications_job ON public.applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_opp ON public.applications(academician_opportunity_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON public.applications(status);

-- ==============================================================================
-- 5. DATABASE FUNCTIONS & TRIGGERS
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 5.1 Automated Timestamp Handler
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach updated_at triggers to all mutable tables
DROP TRIGGER IF EXISTS tr_profiles_updated_at ON public.profiles;
CREATE TRIGGER tr_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS tr_institution_profiles_updated_at ON public.institution_profiles;
CREATE TRIGGER tr_institution_profiles_updated_at BEFORE UPDATE ON public.institution_profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS tr_industry_profiles_updated_at ON public.industry_profiles;
CREATE TRIGGER tr_industry_profiles_updated_at BEFORE UPDATE ON public.industry_profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS tr_academician_profiles_updated_at ON public.academician_profiles;
CREATE TRIGGER tr_academician_profiles_updated_at BEFORE UPDATE ON public.academician_profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS tr_student_profiles_updated_at ON public.student_profiles;
CREATE TRIGGER tr_student_profiles_updated_at BEFORE UPDATE ON public.student_profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS tr_student_skills_updated_at ON public.student_skills;
CREATE TRIGGER tr_student_skills_updated_at BEFORE UPDATE ON public.student_skills FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS tr_jobs_updated_at ON public.jobs;
CREATE TRIGGER tr_jobs_updated_at BEFORE UPDATE ON public.jobs FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS tr_academician_opportunities_updated_at ON public.academician_opportunities;
CREATE TRIGGER tr_academician_opportunities_updated_at BEFORE UPDATE ON public.academician_opportunities FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS tr_applications_updated_at ON public.applications;
CREATE TRIGGER tr_applications_updated_at BEFORE UPDATE ON public.applications FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ------------------------------------------------------------------------------
-- 5.2 RLS Helper Functions (SECURITY DEFINER to avoid infinite recursion)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS public.user_role
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.is_institution_for_student(p_student_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.student_profiles
        WHERE id = p_student_id AND institution_id = auth.uid()
    );
$$;

CREATE OR REPLACE FUNCTION public.is_job_owner(p_job_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.jobs
        WHERE id = p_job_id AND recruiter_id = auth.uid()
    );
$$;

CREATE OR REPLACE FUNCTION public.is_opportunity_owner(p_opp_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.academician_opportunities
        WHERE id = p_opp_id AND creator_id = auth.uid()
    );
$$;

-- ------------------------------------------------------------------------------
-- 5.3 Automated Profile Initialization on Supabase Auth Signup
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_role public.user_role;
    v_full_name TEXT;
BEGIN
    -- Extract role from metadata, default to 'student'
    v_role := COALESCE(
        (NEW.raw_user_meta_data->>'role')::public.user_role,
        'student'::public.user_role
    );
    v_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1));

    INSERT INTO public.profiles (id, role, full_name, email, avatar_url)
    VALUES (NEW.id, v_role, v_full_name, NEW.email, NEW.raw_user_meta_data->>'avatar_url');

    -- Auto-initialize child role table
    IF v_role = 'student' THEN
        INSERT INTO public.student_profiles (id, department, degree, graduation_year)
        VALUES (
            NEW.id,
            COALESCE(NEW.raw_user_meta_data->>'department', 'Undeclared'),
            COALESCE(NEW.raw_user_meta_data->>'degree', 'Undergraduate'),
            COALESCE((NEW.raw_user_meta_data->>'graduation_year')::INTEGER, EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER + 4)
        );
    ELSIF v_role = 'institution' THEN
        INSERT INTO public.institution_profiles (id, institution_name, state, city)
        VALUES (
            NEW.id,
            COALESCE(NEW.raw_user_meta_data->>'institution_name', v_full_name),
            COALESCE(NEW.raw_user_meta_data->>'state', 'State'),
            COALESCE(NEW.raw_user_meta_data->>'city', 'City')
        );
    ELSIF v_role = 'industry' THEN
        INSERT INTO public.industry_profiles (id, company_name, industry_sector)
        VALUES (
            NEW.id,
            COALESCE(NEW.raw_user_meta_data->>'company_name', v_full_name),
            COALESCE(NEW.raw_user_meta_data->>'industry_sector', 'Technology')
        );
    ELSIF v_role = 'academician' THEN
        INSERT INTO public.academician_profiles (id, department, designation)
        VALUES (
            NEW.id,
            COALESCE(NEW.raw_user_meta_data->>'department', 'General Academics'),
            COALESCE(NEW.raw_user_meta_data->>'designation', 'Faculty')
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Attach trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ------------------------------------------------------------------------------
-- 5.4 Skill Match Score Calculation Engine
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.calculate_job_match_score(
    p_student_id UUID,
    p_job_id UUID
)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
    v_mandatory_weight NUMERIC := 0.70;
    v_optional_weight NUMERIC := 0.30;
    v_mandatory_total INTEGER := 0;
    v_optional_total INTEGER := 0;
    v_mandatory_score NUMERIC := 0.0;
    v_optional_score NUMERIC := 0.0;
    v_final_score NUMERIC := 0.0;
    r RECORD;
BEGIN
    FOR r IN (
        SELECT 
            js.skill_id,
            js.is_mandatory,
            js.min_proficiency_score,
            COALESCE(ss.proficiency_score, 0) AS student_score
        FROM public.job_skills js
        LEFT JOIN public.student_skills ss 
            ON js.skill_id = ss.skill_id AND ss.student_id = p_student_id
        WHERE js.job_id = p_job_id
    ) LOOP
        IF r.is_mandatory THEN
            v_mandatory_total := v_mandatory_total + 1;
            v_mandatory_score := v_mandatory_score + LEAST(1.0, r.student_score::NUMERIC / GREATEST(1, r.min_proficiency_score));
        ELSE
            v_optional_total := v_optional_total + 1;
            v_optional_score := v_optional_score + LEAST(1.0, r.student_score::NUMERIC / GREATEST(1, r.min_proficiency_score));
        END IF;
    END LOOP;

    -- If no skills specified, return 100
    IF v_mandatory_total = 0 AND v_optional_total = 0 THEN
        RETURN 100.00;
    END IF;

    -- Weight calculation
    IF v_mandatory_total > 0 AND v_optional_total > 0 THEN
        v_final_score := ((v_mandatory_score / v_mandatory_total) * v_mandatory_weight + 
                          (v_optional_score / v_optional_total) * v_optional_weight) * 100;
    ELSIF v_mandatory_total > 0 THEN
        v_final_score := (v_mandatory_score / v_mandatory_total) * 100;
    ELSE
        v_final_score := (v_optional_score / v_optional_total) * 100;
    END IF;

    RETURN ROUND(v_final_score, 2);
END;
$$;

-- ==============================================================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institution_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.industry_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academician_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academician_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- 6.1 PROFILES POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Profiles viewable by authenticated users" ON public.profiles;
CREATE POLICY "Profiles viewable by authenticated users"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- ------------------------------------------------------------------------------
-- 6.2 INSTITUTION PROFILES POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Institution profiles viewable by all authenticated" ON public.institution_profiles;
CREATE POLICY "Institution profiles viewable by all authenticated"
    ON public.institution_profiles FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Institutions can insert own profile" ON public.institution_profiles;
CREATE POLICY "Institutions can insert own profile"
    ON public.institution_profiles FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id AND public.get_current_user_role() = 'institution');

DROP POLICY IF EXISTS "Institutions can update own profile" ON public.institution_profiles;
CREATE POLICY "Institutions can update own profile"
    ON public.institution_profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- ------------------------------------------------------------------------------
-- 6.3 INDUSTRY PROFILES POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Industry profiles viewable by all authenticated" ON public.industry_profiles;
CREATE POLICY "Industry profiles viewable by all authenticated"
    ON public.industry_profiles FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Industry can insert own profile" ON public.industry_profiles;
CREATE POLICY "Industry can insert own profile"
    ON public.industry_profiles FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id AND public.get_current_user_role() = 'industry');

DROP POLICY IF EXISTS "Industry can update own profile" ON public.industry_profiles;
CREATE POLICY "Industry can update own profile"
    ON public.industry_profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- ------------------------------------------------------------------------------
-- 6.4 ACADEMICIAN PROFILES POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Academician profiles viewable by all authenticated" ON public.academician_profiles;
CREATE POLICY "Academician profiles viewable by all authenticated"
    ON public.academician_profiles FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Academicians can insert own profile" ON public.academician_profiles;
CREATE POLICY "Academicians can insert own profile"
    ON public.academician_profiles FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id AND public.get_current_user_role() = 'academician');

DROP POLICY IF EXISTS "Academicians can update own profile" ON public.academician_profiles;
CREATE POLICY "Academicians can update own profile"
    ON public.academician_profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- ------------------------------------------------------------------------------
-- 6.5 STUDENT PROFILES POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Student profiles visibility" ON public.student_profiles;
CREATE POLICY "Student profiles visibility"
    ON public.student_profiles FOR SELECT
    TO authenticated
    USING (
        -- Student can view self
        auth.uid() = id
        -- Linked institution can view its students
        OR institution_id = auth.uid()
        -- Verified students are visible to industry recruiters
        OR (public.get_current_user_role() = 'industry' AND verified_status = 'verified')
        -- Academicians / institutions have visibility for academic mentoring & research
        OR public.get_current_user_role() IN ('academician', 'institution')
    );

DROP POLICY IF EXISTS "Students can insert own student profile" ON public.student_profiles;
CREATE POLICY "Students can insert own student profile"
    ON public.student_profiles FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id AND public.get_current_user_role() = 'student');

DROP POLICY IF EXISTS "Student profile update permissions" ON public.student_profiles;
CREATE POLICY "Student profile update permissions"
    ON public.student_profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id OR institution_id = auth.uid())
    WITH CHECK (auth.uid() = id OR institution_id = auth.uid());

-- ------------------------------------------------------------------------------
-- 6.6 SKILLS MASTER POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Skills catalog readable by authenticated users" ON public.skills;
CREATE POLICY "Skills catalog readable by authenticated users"
    ON public.skills FOR SELECT
    TO authenticated
    USING (true);

-- ------------------------------------------------------------------------------
-- 6.7 STUDENT SKILLS POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Student skills visibility" ON public.student_skills;
CREATE POLICY "Student skills visibility"
    ON public.student_skills FOR SELECT
    TO authenticated
    USING (
        student_id = auth.uid()
        OR public.is_institution_for_student(student_id)
        OR public.get_current_user_role() IN ('industry', 'academician')
    );

DROP POLICY IF EXISTS "Students can insert own skills" ON public.student_skills;
CREATE POLICY "Students can insert own skills"
    ON public.student_skills FOR INSERT
    TO authenticated
    WITH CHECK (student_id = auth.uid());

DROP POLICY IF EXISTS "Students and institutions can update student skills" ON public.student_skills;
CREATE POLICY "Students and institutions can update student skills"
    ON public.student_skills FOR UPDATE
    TO authenticated
    USING (student_id = auth.uid() OR public.is_institution_for_student(student_id))
    WITH CHECK (student_id = auth.uid() OR public.is_institution_for_student(student_id));

DROP POLICY IF EXISTS "Students can delete own skills" ON public.student_skills;
CREATE POLICY "Students can delete own skills"
    ON public.student_skills FOR DELETE
    TO authenticated
    USING (student_id = auth.uid());

-- ------------------------------------------------------------------------------
-- 6.8 JOBS POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Jobs readable by authenticated users" ON public.jobs;
CREATE POLICY "Jobs readable by authenticated users"
    ON public.jobs FOR SELECT
    TO authenticated
    USING (status = 'active' OR recruiter_id = auth.uid());

DROP POLICY IF EXISTS "Industry recruiters can create jobs" ON public.jobs;
CREATE POLICY "Industry recruiters can create jobs"
    ON public.jobs FOR INSERT
    TO authenticated
    WITH CHECK (recruiter_id = auth.uid() AND public.get_current_user_role() = 'industry');

DROP POLICY IF EXISTS "Recruiters can update own jobs" ON public.jobs;
CREATE POLICY "Recruiters can update own jobs"
    ON public.jobs FOR UPDATE
    TO authenticated
    USING (recruiter_id = auth.uid())
    WITH CHECK (recruiter_id = auth.uid());

DROP POLICY IF EXISTS "Recruiters can delete own jobs" ON public.jobs;
CREATE POLICY "Recruiters can delete own jobs"
    ON public.jobs FOR DELETE
    TO authenticated
    USING (recruiter_id = auth.uid());

-- ------------------------------------------------------------------------------
-- 6.9 JOB SKILLS POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Job skills readable by authenticated users" ON public.job_skills;
CREATE POLICY "Job skills readable by authenticated users"
    ON public.job_skills FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Recruiters can manage job skills" ON public.job_skills;
CREATE POLICY "Recruiters can manage job skills"
    ON public.job_skills FOR ALL
    TO authenticated
    USING (public.is_job_owner(job_id))
    WITH CHECK (public.is_job_owner(job_id));

-- ------------------------------------------------------------------------------
-- 6.10 ACADEMICIAN OPPORTUNITIES POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Opportunities viewable by authenticated users" ON public.academician_opportunities;
CREATE POLICY "Opportunities viewable by authenticated users"
    ON public.academician_opportunities FOR SELECT
    TO authenticated
    USING (status = 'open' OR creator_id = auth.uid());

DROP POLICY IF EXISTS "Industry and Institutions can create opportunities" ON public.academician_opportunities;
CREATE POLICY "Industry and Institutions can create opportunities"
    ON public.academician_opportunities FOR INSERT
    TO authenticated
    WITH CHECK (creator_id = auth.uid() AND public.get_current_user_role() IN ('industry', 'institution'));

DROP POLICY IF EXISTS "Creators can update own opportunities" ON public.academician_opportunities;
CREATE POLICY "Creators can update own opportunities"
    ON public.academician_opportunities FOR UPDATE
    TO authenticated
    USING (creator_id = auth.uid())
    WITH CHECK (creator_id = auth.uid());

DROP POLICY IF EXISTS "Creators can delete own opportunities" ON public.academician_opportunities;
CREATE POLICY "Creators can delete own opportunities"
    ON public.academician_opportunities FOR DELETE
    TO authenticated
    USING (creator_id = auth.uid());

-- ------------------------------------------------------------------------------
-- 6.11 APPLICATIONS POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Applications viewable by relevant stakeholders" ON public.applications;
CREATE POLICY "Applications viewable by relevant stakeholders"
    ON public.applications FOR SELECT
    TO authenticated
    USING (
        -- Applicant can view own application
        applicant_id = auth.uid()
        -- Job recruiter can view applications for their jobs
        OR (job_id IS NOT NULL AND public.is_job_owner(job_id))
        -- Opportunity creator can view faculty proposals
        OR (academician_opportunity_id IS NOT NULL AND public.is_opportunity_owner(academician_opportunity_id))
        -- Enrolled institution can view student placement tracking
        OR public.is_institution_for_student(applicant_id)
    );

DROP POLICY IF EXISTS "Applicants can submit applications" ON public.applications;
CREATE POLICY "Applicants can submit applications"
    ON public.applications FOR INSERT
    TO authenticated
    WITH CHECK (applicant_id = auth.uid());

DROP POLICY IF EXISTS "Applications can be updated by applicant or reviewer" ON public.applications;
CREATE POLICY "Applications can be updated by applicant or reviewer"
    ON public.applications FOR UPDATE
    TO authenticated
    USING (
        applicant_id = auth.uid()
        OR (job_id IS NOT NULL AND public.is_job_owner(job_id))
        OR (academician_opportunity_id IS NOT NULL AND public.is_opportunity_owner(academician_opportunity_id))
    )
    WITH CHECK (
        applicant_id = auth.uid()
        OR (job_id IS NOT NULL AND public.is_job_owner(job_id))
        OR (academician_opportunity_id IS NOT NULL AND public.is_opportunity_owner(academician_opportunity_id))
    );

DROP POLICY IF EXISTS "Applicants can withdraw applications" ON public.applications;
CREATE POLICY "Applicants can withdraw applications"
    ON public.applications FOR DELETE
    TO authenticated
    USING (applicant_id = auth.uid());

-- ==============================================================================
-- 7. INITIAL MASTER SEED DATA (Skills taxonomy)
-- ==============================================================================

INSERT INTO public.skills (name, category, description) VALUES
    -- Programming Languages
    ('Python', 'programming_languages', 'Core Python, OOP, data structures, and script automation'),
    ('TypeScript', 'programming_languages', 'Typed superset of JavaScript for scalable application development'),
    ('JavaScript', 'programming_languages', 'Modern ES6+ syntax, asynchronous programming, DOM APIs'),
    ('Java', 'programming_languages', 'Enterprise Java, Spring Boot, OOP design patterns'),
    ('C++', 'programming_languages', 'High-performance computing, memory management, STL'),
    ('Go (Golang)', 'programming_languages', 'Concurrent microservices, goroutines, backend systems'),
    ('Rust', 'programming_languages', 'Memory-safe systems programming and high-throughput networking'),
    ('SQL', 'programming_languages', 'Relational querying, indexing, query optimization, analytics'),

    -- Frameworks & Libraries
    ('React', 'frameworks_libraries', 'Declarative UI library, hooks, state management, SPA architecture'),
    ('Next.js', 'frameworks_libraries', 'Full-stack React framework with SSR, SSG, Server Actions, App Router'),
    ('Node.js', 'frameworks_libraries', 'Event-driven runtime for backend RESTful and WebSocket servers'),
    ('Express.js', 'frameworks_libraries', 'Minimalist web framework for Node.js API development'),
    ('FastAPI', 'frameworks_libraries', 'Modern high-performance Python web framework with OpenAPI schemas'),
    ('Django', 'frameworks_libraries', 'Batteries-included Python web framework with ORM and security'),
    ('Tailwind CSS', 'frameworks_libraries', 'Utility-first modern CSS design framework'),

    -- Databases
    ('PostgreSQL', 'databases', 'Advanced open-source relational database with ACID, RLS, and JSONB'),
    ('MongoDB', 'databases', 'Document-oriented NoSQL database for flexible data modeling'),
    ('Redis', 'databases', 'In-memory key-value cache, pub/sub message broker, session storage'),
    ('Supabase', 'databases', 'Open-source Firebase alternative with PostgreSQL, RLS, Edge Functions'),

    -- Cloud & DevOps
    ('Docker', 'cloud_devops', 'Containerization of applications and microservices'),
    ('Kubernetes', 'cloud_devops', 'Container orchestration, scaling, service discovery'),
    ('Amazon Web Services (AWS)', 'cloud_devops', 'Cloud architecture covering EC2, S3, RDS, Lambda'),
    ('Google Cloud Platform (GCP)', 'cloud_devops', 'Cloud infrastructure, BigQuery, Cloud Run, GCS'),
    ('CI/CD Pipelines', 'cloud_devops', 'Automated testing and deployment via GitHub Actions / GitLab CI'),
    ('Terraform', 'cloud_devops', 'Infrastructure as Code (IaC) provisioning'),

    -- AI / ML & Data Science
    ('PyTorch', 'ai_ml_datascience', 'Deep learning framework for computer vision, NLP, and neural networks'),
    ('TensorFlow', 'ai_ml_datascience', 'End-to-end machine learning platform and model deployment'),
    ('Scikit-Learn', 'ai_ml_datascience', 'Classical machine learning algorithms, clustering, classification'),
    ('Pandas & NumPy', 'ai_ml_datascience', 'High-performance data manipulation, cleaning, and numerical analysis'),
    ('Natural Language Processing (NLP)', 'ai_ml_datascience', 'Text tokenization, sentiment analysis, LLMs, embeddings'),
    ('Computer Vision (OpenCV)', 'ai_ml_datascience', 'Image processing, object detection (YOLO), image segmentation'),
    ('Generative AI & LLMs', 'ai_ml_datascience', 'RAG architectures, prompt engineering, fine-tuning, LangChain'),

    -- Cybersecurity
    ('Network Security', 'cybersecurity', 'Firewalls, TCP/IP analysis, IDS/IPS, network packet dissection'),
    ('Ethical Hacking & Penetration Testing', 'cybersecurity', 'Vulnerability assessment, OWASP Top 10, exploitation techniques'),
    ('Cryptography', 'cybersecurity', 'Symmetric/asymmetric encryption, hashing, TLS/SSL certificates, PKI'),

    -- Core Engineering & Architecture
    ('System Design', 'core_engineering', 'High-level architectural design, microservices, load balancing, caching'),
    ('Data Structures & Algorithms', 'core_engineering', 'Algorithmic complexity, tree/graph traversal, dynamic programming'),
    ('Embedded Systems & IoT', 'core_engineering', 'Microcontroller programming (ESP32, Arduino), MQTT, sensor integration'),
    ('REST & GraphQL API Design', 'core_engineering', 'Contract-first API architecture, pagination, rate limiting'),

    -- Soft Skills
    ('Technical Communication', 'soft_skills', 'Verbal/written documentation, stakeholder presentations, tech talks'),
    ('Agile & Scrum Methodologies', 'soft_skills', 'Sprint planning, backlog grooming, retrospective facilitation'),
    ('Problem Solving & Critical Thinking', 'soft_skills', 'Root cause analysis, debugging heuristics, creative troubleshooting')
ON CONFLICT (name) DO NOTHING;

-- ==============================================================================
-- 8. PHASE 2: PGVECTOR EXTENSION & VECTOR EMBEDDINGS
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS vector;

-- Alter tables to store 1536-dimensional embeddings
ALTER TABLE public.student_profiles 
    ADD COLUMN IF NOT EXISTS embedding vector(1536),
    ADD COLUMN IF NOT EXISTS embedding_updated_at TIMESTAMPTZ;

ALTER TABLE public.jobs 
    ADD COLUMN IF NOT EXISTS embedding vector(1536),
    ADD COLUMN IF NOT EXISTS embedding_updated_at TIMESTAMPTZ;

ALTER TABLE public.academician_opportunities 
    ADD COLUMN IF NOT EXISTS embedding vector(1536),
    ADD COLUMN IF NOT EXISTS embedding_updated_at TIMESTAMPTZ;

-- HNSW Cosine Distance Indexes
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

-- ------------------------------------------------------------------------------
-- 8.1 RPC: match_jobs_to_student
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
        (CASE WHEN jm.v_sim > 0 THEN ((jm.v_sim * 0.50) + (jm.d_score * 0.50)) ELSE jm.d_score END) DESC,
        jm.d_score DESC
    LIMIT p_match_count;
END;
$$;

-- ------------------------------------------------------------------------------
-- 8.2 RPC: match_students_to_job
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

-- ------------------------------------------------------------------------------
-- 8.3 RPC: analyze_student_job_skill_gap
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

    v_readiness_score := public.calculate_job_match_score(p_student_id, p_job_id);

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
