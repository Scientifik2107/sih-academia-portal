/**
 * Vector Embedding Utility for pgvector Integration
 * Standard dimensionality: 1536 (Compatible with OpenAI text-embedding-3-small and text-embedding-ada-002)
 */

export interface StudentEmbeddingInput {
  fullName?: string
  degree: string
  department: string
  graduationYear?: number
  summary?: string | null
  skills: {
    skillName: string
    category?: string
    proficiencyScore: number
    isVerified: boolean
  }[]
}

export interface JobEmbeddingInput {
  title: string
  companyName?: string | null
  description: string
  jobType: string
  requiredSkills: {
    skillName: string
    isMandatory: boolean
    minProficiencyScore: number
  }[]
}

/**
 * Builds a structured text representation of a student profile for embedding generation.
 */
export function buildStudentEmbeddingText(input: StudentEmbeddingInput): string {
  const verifiedSkills = input.skills
    .filter((s) => s.isVerified)
    .map((s) => `${s.skillName} (Proficiency: ${s.proficiencyScore}/100, Verified)`)
    .join(', ')

  const unverifiedSkills = input.skills
    .filter((s) => !s.isVerified)
    .map((s) => `${s.skillName} (Proficiency: ${s.proficiencyScore}/100)`)
    .join(', ')

  return [
    `Degree: ${input.degree} in ${input.department}`,
    input.graduationYear ? `Graduation Year: ${input.graduationYear}` : '',
    input.summary ? `Summary: ${input.summary}` : '',
    verifiedSkills ? `Verified Competencies: ${verifiedSkills}` : '',
    unverifiedSkills ? `Additional Skills: ${unverifiedSkills}` : '',
  ]
    .filter(Boolean)
    .join('\n')
}

/**
 * Builds a structured text representation of a job posting for embedding generation.
 */
export function buildJobEmbeddingText(input: JobEmbeddingInput): string {
  const mandatorySkills = input.requiredSkills
    .filter((s) => s.isMandatory)
    .map((s) => `${s.skillName} (Min Cutoff: ${s.minProficiencyScore}/100)`)
    .join(', ')

  const optionalSkills = input.requiredSkills
    .filter((s) => !s.isMandatory)
    .map((s) => `${s.skillName} (Min Cutoff: ${s.minProficiencyScore}/100)`)
    .join(', ')

  return [
    `Job Title: ${input.title}`,
    input.companyName ? `Company: ${input.companyName}` : '',
    `Job Type: ${input.jobType}`,
    `Description: ${input.description}`,
    mandatorySkills ? `Mandatory Skills: ${mandatorySkills}` : '',
    optionalSkills ? `Preferred Skills: ${optionalSkills}` : '',
  ]
    .filter(Boolean)
    .join('\n')
}

/**
 * Generates a 1536-dimensional vector embedding for a given text.
 * Falls back to deterministic semantic hashing if no external AI API key is configured.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const apiKey = process.env.OPENAI_API_KEY || process.env.AI_EMBEDDING_API_KEY

  if (apiKey) {
    try {
      const response = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'text-embedding-3-small',
          input: text,
          dimensions: 1536,
        }),
      })

      if (response.ok) {
        const json = await response.json()
        return json.data[0].embedding
      }
    } catch (error) {
      console.warn('External embedding provider failed, using semantic fallback:', error)
    }
  }

  // Deterministic 1536-dimensional semantic projection fallback
  return generateDeterministicEmbedding(text, 1536)
}

/**
 * Deterministic semantic hash projection that ensures identical text produces
 * identical vectors and similar token distributions produce close cosine distances.
 */
function generateDeterministicEmbedding(text: string, dimensions = 1536): number[] {
  const vector = new Array(dimensions).fill(0)
  const normalized = text.toLowerCase().trim()
  const words = normalized.split(/\s+/)

  for (let i = 0; i < words.length; i++) {
    const word = words[i]
    let hash = 0
    for (let c = 0; c < word.length; c++) {
      hash = (hash << 5) - hash + word.charCodeAt(c)
      hash |= 0
    }

    // Distribute token influence across vector coordinates
    for (let d = 0; d < 8; d++) {
      const index = Math.abs((hash + d * 199) % dimensions)
      const weight = 1.0 / (d + 1)
      vector[index] += ((hash & (1 << d)) ? 1 : -1) * weight
    }
  }

  // L2 Normalize vector for accurate cosine similarity
  let norm = 0
  for (let i = 0; i < dimensions; i++) {
    norm += vector[i] * vector[i]
  }
  norm = Math.sqrt(norm)

  if (norm === 0) {
    vector[0] = 1.0
    return vector
  }

  return vector.map((v) => Number((v / norm).toFixed(6)))
}
