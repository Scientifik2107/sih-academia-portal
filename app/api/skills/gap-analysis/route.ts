import { NextRequest, NextResponse } from 'next/server'
import { analyzeSkillGaps } from '@/actions/skill-gaps'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const studentId = searchParams.get('studentId')
  const jobId = searchParams.get('jobId')

  if (!studentId || !jobId) {
    return NextResponse.json(
      { success: false, error: 'Missing required query parameters: studentId and jobId' },
      { status: 400 }
    )
  }

  const result = await analyzeSkillGaps({ studentId, jobId })

  if (!result.success) {
    return NextResponse.json(result, { status: 500 })
  }

  return NextResponse.json(result, { status: 200 })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { studentId, jobId } = body

    if (!studentId || !jobId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields in body: studentId and jobId' },
        { status: 400 }
      )
    }

    const result = await analyzeSkillGaps({ studentId, jobId })

    if (!result.success) {
      return NextResponse.json(result, { status: 500 })
    }

    return NextResponse.json(result, { status: 200 })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Invalid JSON body' },
      { status: 400 }
    )
  }
}
