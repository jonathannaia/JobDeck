import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServiceClient } from '@/lib/supabase/server'
import { getDbTrades, applyTradeFilter } from '@/lib/trade-filters'

export async function POST(req: NextRequest) {
  const { city, trade, email, name } = await req.json()

  if (!city || !email) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const supabase = createServiceClient()
  const dbTrades = getDbTrades(trade)

  // Fetch permits to count accurately after trade-specific filtering
  let query = supabase
    .from('building_permits')
    .select('permit_type, description, est_cost')
    .eq('city', city)
    .limit(200)

  if (dbTrades) {
    query = dbTrades.length === 1
      ? query.eq('trade', dbTrades[0])
      : query.in('trade', dbTrades)
  }

  const { data: rawPermits } = await query
  const filtered = applyTradeFilter(rawPermits ?? [], trade)
  const available = Math.min(filtered.length, 25)

  if (available === 0) {
    return NextResponse.json({ error: 'No permits available for this selection' }, { status: 400 })
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-02-25.clover' })
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  const tradeLabel = trade && trade !== 'all' ? trade : 'All Trades'

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [{
      price_data: {
        currency: 'cad',
        product_data: {
          name: `${available} Renovation Opportunities — ${city} (${tradeLabel})`,
          description: `${tradeLabel} · Active building permits with addresses. Includes permit type, estimated project value, and issued date.`,
        },
        unit_amount: 4000, // $40 CAD
      },
      quantity: 1,
    }],
    customer_email: email,
    success_url: `${appUrl}/contractors/batch/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/contractors/batch`,
    metadata: {
      type: 'batch_purchase',
      city,
      trade: trade || 'all',
      email,
      name: name || '',
      count: String(available),
    },
  })

  return NextResponse.json({ url: session.url })
}
