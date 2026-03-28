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

  const { lead_id } = await req.json()
  if (!lead_id) return NextResponse.json({ error: 'Missing lead_id' }, { status: 400 })

  const service = createServiceClient()
  const { data: contractor } = await service
    .from('contractors')
    .select('stripe_customer_id, plan_type')
    .eq('email', user.email!)
    .single()

  if (!contractor) return NextResponse.json({ error: 'No contractor account found' }, { status: 403 })

  const { data: lead } = await service
    .from('homeowner_leads')
    .select('trade_type, city, postal_code, budget_range')
    .eq('id', lead_id)
    .single()

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-02-25.clover' })
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  const location = lead?.city || lead?.postal_code?.slice(0, 3) || 'Ontario'
  const trade = lead?.trade_type
    ? lead.trade_type.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())
    : 'Homeowner Lead'

  const budget = lead?.budget_range || ''
  const unitAmount =
    budget === 'Under $1,000' ? 1200 :
    budget === '$15,000+' ? 2500 :
    1500 // $1K–$5K, $5K–$15K, unknown

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [{
      price_data: {
        currency: 'cad',
        product_data: {
          name: `${trade} Lead — ${location}`,
          description: 'One-time fee to unlock full contact info and job details for this homeowner lead.',
        },
        unit_amount: unitAmount,
      },
      quantity: 1,
    }],
    customer: contractor.stripe_customer_id || undefined,
    customer_email: contractor.stripe_customer_id ? undefined : user.email!,
    payment_intent_data: {
      setup_future_usage: 'off_session',
    },
    success_url: `${appUrl}/leads?unlocked=${lead_id}`,
    cancel_url: `${appUrl}/leads`,
    metadata: {
      type: 'lead_unlock',
      lead_id,
      contractor_email: user.email!,
    },
  })

  return NextResponse.json({ url: session.url })
}
