import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServiceClient } from '@/lib/supabase/server'
import { Resend } from 'resend'

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

      // Handle batch permit purchase — send confirmation email with download link
      if (session.metadata?.type === 'batch_purchase') {
        const { city, trade, name, count } = session.metadata
        const email = session.customer_email || session.customer_details?.email
        const firstName = (name || email || 'there').split(' ')[0]
        const tradeLabel = trade === 'all' ? 'All Trades' : trade
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://jobdeck.ca'
        const downloadUrl = `${appUrl}/api/permits/batch-download?session_id=${session.id}`

        if (email) {
          const resend = new Resend(process.env.RESEND_API_KEY)
          await resend.emails.send({
            from: 'JobDeck <noreply@jobdeck.ca>',
            to: email,
            subject: `Your JobDeck Project Addresses for ${city} are ready!`,
            html: `
              <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#0f172a">
                <h2 style="margin-bottom:8px">Your Project Addresses are ready</h2>
                <p>Hi ${firstName},</p>
                <p>Thank you for your purchase. Your batch of <strong>${count} residential project addresses</strong> for <strong>${tradeLabel}</strong> in <strong>${city}</strong> is ready to download.</p>
                <p style="margin:24px 0">
                  <a href="${downloadUrl}" style="background:#2563eb;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold">
                    Download Your Project Addresses
                  </a>
                </p>
                <p style="color:#374151">These are fresh building permits pulled directly from the city. We recommend dropping a flyer or knocking on the door this week to be the first contractor they speak with!</p>
                <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0"/>
                <p style="font-size:12px;color:#9ca3af">
                  JobDeck · ${city}, Ontario · <a href="${appUrl}/terms" style="color:#9ca3af">Terms of Service</a><br/>
                  Data sourced from public municipal building permit records.
                </p>
              </div>
            `,
          }).catch(err => console.error('Resend error:', err))
        }
        break
      }

      // Handle lead unlock payments
      if (session.metadata?.type === 'lead_unlock') {
        const { lead_id, contractor_email } = session.metadata
        if (lead_id && contractor_email) {
          await supabase.from('lead_unlocks').upsert({
            lead_id,
            contractor_email,
            payment_type: 'pay_per_lead',
            stripe_session_id: session.id,
          }, { onConflict: 'lead_id,contractor_email' })
        }
        break
      }

      // Handle permit claim payments
      if (session.metadata?.type === 'permit_claim') {
        const { permit_id, contractor_id } = session.metadata
        if (permit_id && contractor_id) {
          await supabase.from('permit_claims').upsert({
            permit_id,
            contractor_id,
            stripe_payment_intent_id: session.payment_intent as string || null,
          }, { onConflict: 'permit_id,contractor_id' })
        }
        break
      }

      const email = session.customer_email || session.customer_details?.email

      if (!email) {
        console.error('No email in checkout session')
        break
      }

      const plan = session.metadata?.plan as 'starter' | 'pro' | 'pay_per_lead' | 'weekly_partner' | undefined
      const planType = plan || 'starter'
      const name = session.metadata?.name || session.customer_details?.name || email.split('@')[0]
      const phone = session.metadata?.phone || session.customer_details?.phone || ''
      const trade_type = session.metadata?.trade_type || 'general_contractor'
      const service_area = session.metadata?.service_area || 'M,L,K,N,P'

      // For pay_per_lead: setup session — save payment method as customer default
      if (planType === 'pay_per_lead' && session.mode === 'setup') {
        const setupIntentId = session.setup_intent as string
        const setupIntent = await stripe.setupIntents.retrieve(setupIntentId)
        const paymentMethodId = setupIntent.payment_method as string
        if (paymentMethodId) {
          await stripe.customers.update(customerId, {
            invoice_settings: { default_payment_method: paymentMethodId },
          })
        }
      }

      const subscriptionId = session.subscription as string | null
      // weekly_partner: 4 batches × 25 = 100 leads/month
      const creditLimit = planType === 'pro' ? 999999 : planType === 'pay_per_lead' ? 999999 : planType === 'weekly_partner' ? 100 : 15

      // Check if contractor already exists
      const { data: existing } = await supabase
        .from('contractors')
        .select('id')
        .eq('email', email)
        .single()

      if (existing) {
        await supabase
          .from('contractors')
          .update({
            plan_type: planType,
            lead_credits_limit: creditLimit,
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId || null,
            is_active: true,
          })
          .eq('email', email)
      } else {
        await supabase
          .from('contractors')
          .insert({
            name,
            email,
            phone,
            trade_type,
            service_area,
            plan_type: planType,
            lead_credits_limit: creditLimit,
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId || null,
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
