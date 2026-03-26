import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createServiceClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import Stripe from 'stripe'

export async function POST(req: NextRequest) {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll() {},
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const { permit_id } = await req.json()
  if (!permit_id) return NextResponse.json({ error: 'Missing permit_id' }, { status: 400 })

  const service = createServiceClient()

  const { data: contractor } = await service
    .from('contractors')
    .select('id, stripe_customer_id')
    .eq('email', user.email!)
    .single()

  if (!contractor) return NextResponse.json({ error: 'No contractor account found' }, { status: 403 })

  // Check if already claimed — return address directly
  const { data: existing } = await service
    .from('permit_claims')
    .select('id')
    .eq('permit_id', permit_id)
    .eq('contractor_id', contractor.id)
    .single()

  if (existing) {
    const { data: permit } = await service
      .from('building_permits')
      .select('address, postal, builder')
      .eq('id', permit_id)
      .single()

    return NextResponse.json({ permit })
  }

  // Not yet claimed — create Stripe checkout
  const { data: permit } = await service
    .from('building_permits')
    .select('trade, city, permit_type, description, velocity, est_cost')
    .eq('id', permit_id)
    .single()

  if (!permit) return NextResponse.json({ error: 'Permit not found' }, { status: 404 })

  const SMALL_TYPES = ['plumbing only', 'decking', 'secondary buildings']
  const LARGE_DESC_KEYWORDS = ['addition', 'accessory dwelling unit', 'basement apartment', 'new dwelling']

  function permitPriceCents(permitType: string | null, description: string | null): number {
    const type = (permitType || '').toLowerCase()
    const desc = (description || '').toLowerCase()
    if (SMALL_TYPES.some(t => type.includes(t))) return 1000  // $10
    if (type.includes('residential') || LARGE_DESC_KEYWORDS.some(k => desc.includes(k))) return 1500  // $15
    return 1200  // $12
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-02-25.clover' })
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  const label = permit.permit_type || `${permit.trade} Permit`
  const priceCents = permitPriceCents(permit.permit_type, permit.description)

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [{
      price_data: {
        currency: 'cad',
        product_data: {
          name: `${label} — ${permit.city}`,
          description: 'Includes the full civic address only. Use it to door knock or find the homeowner on Facebook.',
        },
        unit_amount: priceCents,
      },
      quantity: 1,
    }],
    customer: contractor.stripe_customer_id || undefined,
    customer_email: contractor.stripe_customer_id ? undefined : user.email!,
    payment_intent_data: {
      setup_future_usage: 'off_session',
    },
    success_url: `${appUrl}/leads?permit_claimed=${permit_id}`,
    cancel_url: `${appUrl}/leads`,
    metadata: {
      type: 'permit_claim',
      permit_id,
      contractor_id: contractor.id,
      contractor_email: user.email!,
    },
  })

  return NextResponse.json({ url: session.url })
}
