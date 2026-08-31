import { NextRequest, NextResponse } from 'next/server'
import { getCandidateMatches } from '@/actions/matching'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const jobId = searchParams.get('jobId')
  const matchThreshold = searchParams.get('threshold')
    ? parseFloat(searchParams.get('threshold')!)
    : 0.0
  const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 10
  const verifiedOnly = searchParams.get('verifiedOnly') === 'true'

  if (!jobId) {
    return NextResponse.json(
      { success: false, error: 'Missing required query parameter: jobId' },
      { status: 400 }
    )
  }

  const result = await getCandidateMatches({
    jobId,
    matchThreshold,
    limit,
    verifiedOnly,
  })

  if (!result.success) {
    return NextResponse.json(result, { status: 500 })
  }

  return NextResponse.json(result, { status: 200 })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      jobId,
      matchThreshold = 0.0,
      limit = 10,
      verifiedOnly = false,
      customEmbedding = null,
    } = body

    if (!jobId) {
      return NextResponse.json(
        { success: false, error: 'Missing required field in request body: jobId' },
        { status: 400 }
      )
    }

    const result = await getCandidateMatches({
      jobId,
      matchThreshold,
      limit,
      verifiedOnly,
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
