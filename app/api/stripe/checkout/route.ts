import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const PRICE_IDS: Record<string, string> = {
  starter: 'price_1TDXKm2SGlDcAe75aefM1Fre',
  pro: 'price_1TDXNn2SGlDcAe75Dch3F9VP',
}

export async function POST(req: NextRequest) {
  try {
    const { plan, name, phone, email, trade_type, service_area } = await req.json()

    if (!plan || !['starter', 'pro'].includes(plan)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    const secretKey = process.env.STRIPE_SECRET_KEY
    if (!secretKey) {
      return NextResponse.json({ error: 'Stripe is not configured' }, { status: 500 })
    }

    const stripe = new Stripe(secretKey, { apiVersion: '2026-02-25.clover' })
    const priceId = PRICE_IDS[plan]
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: {
        trial_period_days: 7,
      },
      success_url: `${appUrl}/dashboard?success=1`,
      cancel_url: `${appUrl}/contractors#pricing`,
      customer_email: email || undefined,
      metadata: {
        plan,
        name: name || '',
        phone: phone || '',
        trade_type: trade_type || '',
        service_area: service_area || '',
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('Stripe checkout error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
