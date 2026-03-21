import { NextRequest, NextResponse } from 'next/server'
import { matchLead } from '@/lib/matchLead'

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-internal-secret')
  if (secret !== process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { lead_id } = await req.json()
    if (!lead_id) {
      return NextResponse.json({ error: 'Missing lead_id' }, { status: 400 })
    }

    await matchLead(lead_id)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Match route error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
