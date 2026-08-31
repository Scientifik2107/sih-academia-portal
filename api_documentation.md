# Frontend Developer Handoff: API & Server Actions Documentation

**Platform**: Academia-Industry Collaboration Portal (SIH)  
**Phase**: 2 — Backend API, Vector Matching Engine & Skill Gap Analyzer  
**TypeScript Definitions**: `types/database.types.ts`  

---

## 1. Quick Integration Overview

The Phase 2 backend exposes two seamless consumption interfaces:
1. **Next.js Server Actions** (`actions/matching.ts`, `actions/skill-gaps.ts`): Ideal for React Server Components (RSC), server-side rendering, and React 19 / Next.js Forms.
2. **REST API Route Handlers** (`/api/matches/jobs`, `/api/matches/candidates`, `/api/skills/gap-analysis`): Ideal for Client Components, SWR / React Query, mobile apps, or external services.

---

## 2. Standard Response Wrapper

All Server Actions and REST API endpoints return a standardized `ActionResponse<T>` wrapper:

```typescript
export interface ActionResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: {
    count: number;
    threshold: number;
    timestamp: string;
  };
}
```

---

## 3. Server Actions & API Endpoints

### 3.1 `getStudentMatches` (Student Job Recommendations)

Matches a student against active industry jobs using a hybrid model: **50% pgvector Semantic Cosine Similarity** + **50% Discrete Verified Skill Match**.

#### Method Signature (Server Action)
```typescript
import { getStudentMatches } from '@/actions/matching';

const response = await getStudentMatches({
  studentId: 'uuid-string',
  matchThreshold: 0.20, // Optional: 0.0 to 1.0 (default 0.0)
  limit: 10,            // Optional: number of results (default 10)
  customEmbedding: null // Optional: override 1536-dim vector
});
```

#### REST API Endpoint
- **URL**: `/api/matches/jobs`
- **Methods**: `GET` | `POST`
- **Query Parameters (GET)**:
  - `studentId` (string, required)
  - `threshold` (float, optional, e.g. `0.20`)
  - `limit` (number, optional, e.g. `10`)
- **JSON Request Body (POST)**:
  ```json
  {
    "studentId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "matchThreshold": 0.20,
    "limit": 10
  }
  ```

#### Response Data Type (`JobMatchResult[]`)
```typescript
export interface JobMatchResult {
  job_id: string;
  recruiter_id: string;
  company_name: string | null;
  title: string;
  description: string;
  job_type: 'internship' | 'full_time' | 'part_time' | 'contract';
  workplace_type: 'remote' | 'on_site' | 'hybrid';
  location: string | null;
  stipend_range: string | null;
  status: 'active' | 'draft' | 'paused' | 'closed';
  deadline: string | null;
  vector_similarity: number;      // 0 to 100%
  discrete_match_score: number;   // 0 to 100%
  hybrid_score: number;           // 0 to 100% (Composite Ranking)
  has_applied: boolean;
  required_skills: {
    skill_id: string;
    skill_name: string;
    category: string;
    is_mandatory: boolean;
    min_proficiency_score: number;
  }[];
}
```

#### Example JSON Response
```json
{
  "success": true,
  "data": [
    {
      "job_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
      "recruiter_id": "11111111-1111-1111-1111-111111111111",
      "company_name": "Google Cloud India",
      "title": "Full Stack AI Engineer Intern",
      "description": "Develop modern Next.js frontends and FastAPI AI microservices with vector search.",
      "job_type": "internship",
      "workplace_type": "hybrid",
      "location": "Bengaluru, Karnataka",
      "stipend_range": "45000 - 60000 INR",
      "status": "active",
      "deadline": "2026-10-31T18:30:00.000Z",
      "vector_similarity": 92.45,
      "discrete_match_score": 85.00,
      "hybrid_score": 88.73,
      "has_applied": false,
      "required_skills": [
        {
          "skill_id": "22222222-2222-2222-2222-222222222222",
          "skill_name": "Next.js",
          "category": "frameworks_libraries",
          "is_mandatory": true,
          "min_proficiency_score": 70
        },
        {
          "skill_id": "33333333-3333-3333-3333-333333333333",
          "skill_name": "FastAPI",
          "category": "frameworks_libraries",
          "is_mandatory": true,
          "min_proficiency_score": 60
        },
        {
          "skill_id": "44444444-4444-4444-4444-444444444444",
          "skill_name": "Generative AI & LLMs",
          "category": "ai_ml_datascience",
          "is_mandatory": false,
          "min_proficiency_score": 50
        }
      ]
    }
  ],
  "meta": {
    "count": 1,
    "threshold": 0.2,
    "timestamp": "2026-09-01T00:53:00.000Z"
  }
}
```

---

### 3.2 `getCandidateMatches` (Reverse Talent Search for Recruiters)

Enables industry recruiters to discover and rank top student talent for a given job posting based on semantic profile similarity and verified assessment scores.

#### Method Signature (Server Action)
```typescript
import { getCandidateMatches } from '@/actions/matching';

const response = await getCandidateMatches({
  jobId: 'uuid-string',
  matchThreshold: 0.25, // Optional
  limit: 20,            // Optional
  verifiedOnly: true    // Optional: filter only institution-verified students
});
```

#### REST API Endpoint
- **URL**: `/api/matches/candidates`
- **Methods**: `GET` | `POST`
- **Query Parameters (GET)**:
  - `jobId` (string, required)
  - `threshold` (float, optional)
  - `limit` (number, optional)
  - `verifiedOnly` (boolean, optional, e.g. `true`)
- **JSON Request Body (POST)**:
  ```json
  {
    "jobId": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
    "matchThreshold": 0.25,
    "limit": 20,
    "verifiedOnly": true
  }
  ```

#### Response Data Type (`CandidateMatchResult[]`)
```typescript
export interface CandidateMatchResult {
  student_id: string;
  full_name: string;
  avatar_url: string | null;
  email: string;
  institution_name: string;
  degree: string;
  department: string;
  graduation_year: number;
  cgpa: number | null;
  verified_status: 'unverified' | 'pending' | 'verified' | 'rejected';
  summary: string | null;
  resume_url: string | null;
  vector_similarity: number;
  discrete_match_score: number;
  hybrid_score: number;
  student_skills: {
    skill_id: string;
    skill_name: string;
    category: string;
    proficiency_score: number;
    is_verified: boolean;
    verification_source: string;
  }[];
}
```

---

### 3.3 `analyzeSkillGaps` (Granular Gap & Roadmap Analyzer)

Performs a deep diagnostic comparison between a student's demonstrated competencies and a target job's requirements.

#### Method Signature (Server Action)
```typescript
import { analyzeSkillGaps } from '@/actions/skill-gaps';

const response = await analyzeSkillGaps({
  studentId: 'student-uuid',
  jobId: 'job-uuid'
});
```

#### REST API Endpoint
- **URL**: `/api/skills/gap-analysis`
- **Methods**: `GET` | `POST`
- **Query Parameters (GET)**:
  - `studentId` (string, required)
  - `jobId` (string, required)
- **JSON Request Body (POST)**:
  ```json
  {
    "studentId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "jobId": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d"
  }
  ```

#### Response Data Type (`SkillGapAnalysisResult`)
```typescript
export interface SkillGapAnalysisResult {
  student_id: string;
  job_id: string;
  readiness_score: number; // 0 to 100%
  matching_skills: SkillGapItem[];
  deficient_skills: SkillGapItem[];
  missing_mandatory_skills: SkillGapItem[];
  missing_optional_skills: SkillGapItem[];
  summary: {
    total_matching: number;
    total_deficient: number;
    total_missing_mandatory: number;
    total_missing_optional: number;
  };
  learning_recommendations: {
    skill_name: string;
    category: string;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    target_proficiency: number;
    suggested_focus: string;
  }[];
}
```

#### Example JSON Response
```json
{
  "success": true,
  "data": {
    "student_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "job_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
    "readiness_score": 68.50,
    "matching_skills": [
      {
        "skill_id": "111",
        "skill_name": "Next.js",
        "category": "frameworks_libraries",
        "is_mandatory": true,
        "required_proficiency": 70,
        "student_proficiency": 85,
        "is_verified": true,
        "surplus": 15
      }
    ],
    "deficient_skills": [
      {
        "skill_id": "222",
        "skill_name": "FastAPI",
        "category": "frameworks_libraries",
        "is_mandatory": true,
        "required_proficiency": 70,
        "student_proficiency": 50,
        "is_verified": false,
        "gap": 20
      }
    ],
    "missing_mandatory_skills": [
      {
        "skill_id": "333",
        "skill_name": "PostgreSQL",
        "category": "databases",
        "is_mandatory": true,
        "required_proficiency": 65,
        "student_proficiency": 0,
        "gap": 65
      }
    ],
    "missing_optional_skills": [
      {
        "skill_id": "444",
        "skill_name": "Docker",
        "category": "cloud_devops",
        "is_mandatory": false,
        "required_proficiency": 50,
        "student_proficiency": 0,
        "gap": 50
      }
    ],
    "summary": {
      "total_matching": 1,
      "total_deficient": 1,
      "total_missing_mandatory": 1,
      "total_missing_optional": 1
    },
    "learning_recommendations": [
      {
        "skill_name": "PostgreSQL",
        "category": "databases",
        "priority": "HIGH",
        "target_proficiency": 65,
        "suggested_focus": "Mandatory requirement: Complete foundational curriculum and benchmark assessment to reach 65/100."
      },
      {
        "skill_name": "FastAPI",
        "category": "frameworks_libraries",
        "priority": "MEDIUM",
        "target_proficiency": 70,
        "suggested_focus": "Competency gap (50/100 vs required 70/100): Upgrade proficiency by +20 points."
      },
      {
        "skill_name": "Docker",
        "category": "cloud_devops",
        "priority": "LOW",
        "target_proficiency": 50,
        "suggested_focus": "Preferred bonus skill: Explore introductory modules to gain a competitive advantage in interviews."
      }
    ]
  }
}
```

---

## 4. Frontend Component Recipes

### Using in a React Server Component (RSC):
```tsx
import { getStudentMatches } from '@/actions/matching';

export default async function StudentDashboardPage({ params }: { params: { studentId: string } }) {
  const result = await getStudentMatches({ studentId: params.studentId, limit: 6 });

  if (!result.success || !result.data) {
    return <div className="text-red-500">Error loading recommendations: {result.error}</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {result.data.map((job) => (
        <div key={job.job_id} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-white">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-cyan-400 font-semibold">{job.company_name}</span>
            <span className="px-3 py-1 text-xs rounded-full bg-emerald-500/20 text-emerald-300">
              {job.hybrid_score}% Match
            </span>
          </div>
          <h3 className="text-xl font-bold">{job.title}</h3>
          <p className="text-sm text-slate-400 mt-2 line-clamp-2">{job.description}</p>
          <div className="mt-4 text-xs text-slate-500">Stipend: {job.stipend_range}</div>
        </div>
      ))}
    </div>
  );
}
```

### Using in a Client Component with SWR / React Hook Form:
```tsx
'use client';

import { useState } from 'react';
import { analyzeSkillGaps } from '@/actions/skill-gaps';
import type { SkillGapAnalysisResult } from '@/types/database.types';

export function SkillGapViewer({ studentId, jobId }: { studentId: string; jobId: string }) {
  const [loading, setLoading] = useState(false);
  const [gapData, setGapData] = useState<SkillGapAnalysisResult | null>(null);

  const handleRunAnalysis = async () => {
    setLoading(true);
    const res = await analyzeSkillGaps({ studentId, jobId });
    if (res.success && res.data) {
      setGapData(res.data);
    }
    setLoading(false);
  };

  return (
    <div>
      <button onClick={handleRunAnalysis} disabled={loading} className="btn-primary">
        {loading ? 'Analyzing AI Skill Gaps...' : 'View Diagnostic Skill Gap'}
      </button>

      {gapData && (
        <div className="mt-6">
          <h4>Readiness Score: {gapData.readiness_score}%</h4>
          <div className="space-y-3 mt-4">
            {gapData.learning_recommendations?.map((rec, i) => (
              <div key={i} className="p-4 rounded-xl bg-slate-800/80 border border-slate-700">
                <span className={`badge ${rec.priority === 'HIGH' ? 'bg-rose-500' : 'bg-amber-500'}`}>
                  {rec.priority} PRIORITY
                </span>
                <p className="font-semibold mt-1">{rec.skill_name}</p>
                <p className="text-sm text-slate-400">{rec.suggested_focus}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```
