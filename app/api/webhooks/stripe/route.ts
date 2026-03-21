import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServiceClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-02-25.clover',
})

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = createServiceClient()

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const customerId = session.customer as string
      const subscriptionId = session.subscription as string
      const email = session.customer_email || session.customer_details?.email

      if (!email) {
        console.error('No email in checkout session')
        break
      }

      // Determine plan from metadata
      const plan = session.metadata?.plan as 'starter' | 'pro' | undefined
      const planType = plan || 'starter'
      const creditLimit = planType === 'pro' ? 999999 : 15

      // Check if contractor already exists
      const { data: existing } = await supabase
        .from('contractors')
        .select('id')
        .eq('email', email)
        .single()

      if (existing) {
        // Update existing contractor
        await supabase
          .from('contractors')
          .update({
            plan_type: planType,
            lead_credits_limit: creditLimit,
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            is_active: true,
          })
          .eq('email', email)
      } else {
        // Create new contractor (minimal record — they can fill details from dashboard later)
        const name = session.customer_details?.name || email.split('@')[0]
        await supabase
          .from('contractors')
          .insert({
            name,
            email,
            phone: session.customer_details?.phone || '',
            trade_type: session.metadata?.trade_type || 'general_contractor',
            service_area: session.metadata?.service_area || 'M,L,K,N,P',
            plan_type: planType,
            lead_credits_limit: creditLimit,
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            is_active: true,
          })
      }

      // Create Supabase auth user if not exists
      await supabase.auth.admin.inviteUserByEmail(email).catch(() => {
        // User may already exist — that's fine
      })

      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription
      const customerId = subscription.customer as string

      await supabase
        .from('contractors')
        .update({ is_active: false })
        .eq('stripe_customer_id', customerId)

      break
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription
      const customerId = subscription.customer as string

      // Handle plan upgrades/downgrades via Stripe's price metadata
      // You'd check price ID against your configured price IDs here
      const isActive = subscription.status === 'active'
      await supabase
        .from('contractors')
        .update({ is_active: isActive })
        .eq('stripe_customer_id', customerId)

      break
    }

    default:
      console.log(`Unhandled event type: ${event.type}`)
  }

  return NextResponse.json({ received: true })
}
