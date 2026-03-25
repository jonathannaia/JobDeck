import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const { city, trade, email, name } = await req.json()

  if (!city || !email) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const supabase = createServiceClient()

  // Count available permits for this city/trade
  let query = supabase
    .from('building_permits')
    .select('id', { count: 'exact', head: true })
    .eq('city', city)

  if (trade && trade !== 'all') {
    query = query.eq('trade', trade)
  }

  const { count } = await query
  const available = Math.min(count || 0, 25)

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
