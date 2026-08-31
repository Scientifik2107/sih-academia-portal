import { NextRequest, NextResponse } from 'next/server'
import { getStudentMatches } from '@/actions/matching'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const studentId = searchParams.get('studentId')
  const matchThreshold = searchParams.get('threshold')
    ? parseFloat(searchParams.get('threshold')!)
    : 0.0
  const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 10

  if (!studentId) {
    return NextResponse.json(
      { success: false, error: 'Missing required query parameter: studentId' },
      { status: 400 }
    )
  }

  const result = await getStudentMatches({
    studentId,
    matchThreshold,
    limit,
  })

  if (!result.success) {
    return NextResponse.json(result, { status: 500 })
  }

  return NextResponse.json(result, { status: 200 })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { studentId, matchThreshold = 0.0, limit = 10, customEmbedding = null } = body

    if (!studentId) {
      return NextResponse.json(
        { success: false, error: 'Missing required field in request body: studentId' },
        { status: 400 }
      )
    }

    const result = await getStudentMatches({
      studentId,
      matchThreshold,
      limit,
      customEmbedding,
    })

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
