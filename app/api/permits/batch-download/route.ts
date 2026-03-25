import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServiceClient } from '@/lib/supabase/server'
import { getDbTrades, applyTradeFilter } from '@/lib/trade-filters'

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
  const requested = parseInt(count) || 25
  const supabase = createServiceClient()

  const dbTrades = getDbTrades(trade)

  // Fetch a larger pool so post-filter still yields enough results
  let query = supabase
    .from('building_permits')
    .select('address, city, postal, trade, permit_type, description, issued_date, est_cost, velocity')
    .eq('city', city)
    .order('issued_date', { ascending: false })
    .limit(200)

  if (dbTrades) {
    query = dbTrades.length === 1
      ? query.eq('trade', dbTrades[0])
      : query.in('trade', dbTrades)
  }

  const { data: rawPermits, error } = await query

  if (error || !rawPermits?.length) {
    return NextResponse.json({ error: 'No permits found' }, { status: 404 })
  }

  const permits = applyTradeFilter(rawPermits, trade).slice(0, requested)

  if (!permits.length) {
    return NextResponse.json({ error: 'No permits found' }, { status: 404 })
  }

  // Build CSV — label virtual trades (Painter) with the display name, not the DB trade value
  const displayTrade = trade === 'all' ? null : trade
  const headers = ['Address', 'City', 'Postal', 'Trade', 'Permit Type', 'Description', 'Issued Date', 'Est. Value', 'Velocity']
  const escape = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`

  const rows = [
    headers.join(','),
    ...permits.map(p => [
      escape(p.address),
      escape(p.city),
      escape(p.postal),
      escape(displayTrade ?? p.trade),
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
