import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { ONTARIO_POSTAL_PREFIXES, type TradeType } from '@/lib/types'
import { matchLead } from '@/lib/matchLead'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, phone, email, trade_type, job_description, city, postal_code, timeline, budget_range } = body

    if (!name || !phone || !email || !trade_type || !job_description || !postal_code) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const prefix = postal_code.trim().toUpperCase().charAt(0)
    if (!ONTARIO_POSTAL_PREFIXES.includes(prefix)) {
      return NextResponse.json(
        { error: 'Postal code must be an Ontario postal code (starts with K, L, M, N, or P)' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    const { data: lead, error } = await supabase
      .from('homeowner_leads')
      .insert({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        trade_type: trade_type as TradeType,
        job_description: job_description.trim(),
        city: city?.trim() || null,
        postal_code: postal_code.trim().toUpperCase(),
        timeline: timeline || null,
        budget_range: budget_range || null,
        status: 'new',
      })
      .select()
      .single()

    if (error) {
      console.error('Error inserting lead:', error)
      return NextResponse.json({ error: 'Failed to save your request' }, { status: 500 })
    }

    // Run matching directly — awaited so Vercel doesn't kill it early
    await matchLead(lead.id).catch(err => console.error('matchLead error:', err))

    return NextResponse.json({ success: true, lead_id: lead.id })
  } catch (err) {
    console.error('Submit error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
