import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get('session_id')
  if (!sessionId) return NextResponse.json({ error: 'Missing session_id' }, { status: 400 })

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-02-25.clover' })

  // Verify payment
  const session = await stripe.checkout.sessions.retrieve(sessionId)
  if (session.payment_status !== 'paid') {
    return NextResponse.json({ error: 'Payment not completed' }, { status: 402 })
  }

  if (session.metadata?.type !== 'batch_purchase') {
    return NextResponse.json({ error: 'Invalid session type' }, { status: 400 })
  }

  const { city, trade, count } = session.metadata
  const supabase = createServiceClient()

  // 'Painter' maps to renovation permits (Carpenter + General Contractor)
  let query = supabase
    .from('building_permits')
    .select('address, city, postal, trade, permit_type, description, issued_date, est_cost, velocity')
    .eq('city', city)
    .order('issued_date', { ascending: false })
    .limit(parseInt(count) || 25)

  if (trade === 'Painter') {
    query = query.in('trade', ['Carpenter', 'General Contractor'])
  } else if (trade && trade !== 'all') {
    query = query.eq('trade', trade)
  }

  const { data: permits, error } = await query

  if (error || !permits?.length) {
    return NextResponse.json({ error: 'No permits found' }, { status: 404 })
  }

  // Build CSV
  const headers = ['Address', 'City', 'Postal', 'Trade', 'Permit Type', 'Description', 'Issued Date', 'Est. Value', 'Velocity']
  const escape = (v: any) => `"${String(v || '').replace(/"/g, '""')}"`

  const rows = [
    headers.join(','),
    ...permits.map(p => [
      escape(p.address),
      escape(p.city),
      escape(p.postal),
      escape(p.trade),
      escape(p.permit_type),
      escape(p.description),
      escape(p.issued_date),
      escape(p.est_cost ? `$${Number(p.est_cost).toLocaleString()}` : ''),
      escape(p.velocity),
    ].join(',')),
  ]

  const csv = rows.join('\n')
  const filename = `jobdeck-${city.toLowerCase().replace(/\s/g, '-')}-permits.csv`

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
