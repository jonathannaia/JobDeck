import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServiceClient } from '@/lib/supabase/server'
import { getDbTrades, applyTradeFilter } from '@/lib/trade-filters'

export async function POST(req: NextRequest) {
  const { city, trade, email, name, plan } = await req.json()

  if (!email) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-02-25.clover' })
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  // Weekly Partner subscription — no permit count needed, just create the subscription session
  if (plan === 'weekly_partner') {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: process.env.STRIPE_WEEKLY_PARTNER_PRICE_ID!, quantity: 1 }],
      customer_email: email,
      success_url: `${appUrl}/contractors/batch/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/contractors/batch`,
      metadata: {
        plan: 'weekly_partner',
        city: city || '',
        trade: trade || 'all',
        email,
        name: name || '',
      },
    })
    return NextResponse.json({ url: session.url })
  }

  // One-time $40 batch — count available permits first
  if (!city) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const supabase = createServiceClient()
  const dbTrades = getDbTrades(trade)

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
  const available = filtered.length

  if (available === 0) {
    return NextResponse.json({ error: 'No permits available for this selection' }, { status: 400 })
  }

  const tradeLabel = trade && trade !== 'all' ? trade : 'All Trades'

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [{
      price_data: {
        currency: 'cad',
        product_data: {
          name: `Complete Monthly City Batch — ${city} (${tradeLabel})`,
          description: `${available} active residential permits from the last 30 days. Includes full civic address, permit type, estimated project value, and issued date.`,
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
