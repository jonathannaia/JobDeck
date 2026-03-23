import { createServiceClient } from '@/lib/supabase/server'
import { TRADE_LABELS, type TradeType, type Contractor } from '@/lib/types'
import twilio from 'twilio'
import Stripe from 'stripe'

const MAX_RECIPIENTS_PER_LEAD = 5
const STARTER_DELAY_MS = 30 * 60 * 1000
const PAY_PER_LEAD_AMOUNT = 4000 // $40 CAD in cents

async function sendSms(to: string, body: string) {
  const client = twilio(process.env.TWILIO_ACCOUNT_SID!, process.env.TWILIO_AUTH_TOKEN!)
  await client.messages.create({
    body,
    from: process.env.TWILIO_PHONE_NUMBER!,
    to,
  })
}

async function chargePayPerLead(stripeCustomerId: string): Promise<boolean> {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-02-25.clover' })
    const customer = await stripe.customers.retrieve(stripeCustomerId) as Stripe.Customer
    const paymentMethodId = customer.invoice_settings?.default_payment_method as string | null
    if (!paymentMethodId) return false
    await stripe.paymentIntents.create({
      amount: PAY_PER_LEAD_AMOUNT,
      currency: 'cad',
      customer: stripeCustomerId,
      payment_method: paymentMethodId,
      confirm: true,
      off_session: true,
    })
    return true
  } catch (err) {
    console.error('Pay-per-lead charge failed:', err)
    return false
  }
}

function buildSmsMessage(lead: {
  trade_type: TradeType
  postal_code: string
  job_description: string
  budget_range: string | null
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const tradeLabel = TRADE_LABELS[lead.trade_type] || lead.trade_type
  const desc = lead.job_description.slice(0, 100)
  const budget = lead.budget_range || 'Not specified'
  return `New ${tradeLabel} lead in ${lead.postal_code}. Job: ${desc}. Budget: ${budget}. View full details at ${appUrl}/dashboard`
}

export async function matchLead(lead_id: string) {
  const supabase = createServiceClient()

  const { data: lead, error: leadError } = await supabase
    .from('homeowner_leads')
    .select('*')
    .eq('id', lead_id)
    .single()

  if (leadError || !lead) {
    console.error('matchLead: lead not found', leadError)
    return
  }

  const postalPrefix = lead.postal_code.charAt(0).toUpperCase()

  const { data: allContractors, error: contractorError } = await supabase
    .from('contractors')
    .select('*')
    .eq('trade_type', lead.trade_type)
    .eq('is_active', true)

  if (contractorError) {
    console.error('matchLead: error fetching contractors', contractorError)
    return
  }

  const matching = (allContractors as Contractor[] || []).filter((c: Contractor) => {
    const areas = c.service_area.split(',').map((s: string) => s.trim().toUpperCase())
    return areas.includes(postalPrefix)
  })

  const proContractors = matching.filter(c => c.plan_type === 'pro')
  const starterContractors = matching.filter(
    c => c.plan_type === 'starter' && c.lead_credits_used < c.lead_credits_limit
  )
  const payPerLeadContractors = matching.filter(
    c => c.plan_type === 'pay_per_lead' && c.stripe_customer_id
  )

  const selectedPro = proContractors.slice(0, MAX_RECIPIENTS_PER_LEAD)
  const remainingSlots = MAX_RECIPIENTS_PER_LEAD - selectedPro.length
  const selectedStarter = starterContractors.slice(0, remainingSlots)
  const selectedPpl = payPerLeadContractors.slice(0, MAX_RECIPIENTS_PER_LEAD)

  const smsBody = buildSmsMessage(lead)

  // Send to Pro contractors immediately
  await Promise.all(selectedPro.map(async (contractor) => {
    const { data: delivery } = await supabase
      .from('lead_deliveries')
      .insert({ lead_id, contractor_id: contractor.id, delivery_status: 'pending', plan_type: 'pro' })
      .select().single()

    try {
      await sendSms(contractor.phone, smsBody)
      await supabase.from('lead_deliveries')
        .update({ delivery_status: 'sent', delivered_at: new Date().toISOString() })
        .eq('id', delivery.id)
    } catch (err) {
      console.error(`SMS failed for pro contractor ${contractor.id}:`, err)
      await supabase.from('lead_deliveries').update({ delivery_status: 'failed' }).eq('id', delivery.id)
    }
  }))

  // Charge and send to Pay Per Lead contractors immediately
  await Promise.all(selectedPpl.map(async (contractor) => {
    const { data: delivery } = await supabase
      .from('lead_deliveries')
      .insert({ lead_id, contractor_id: contractor.id, delivery_status: 'pending', plan_type: 'pay_per_lead' })
      .select().single()

    try {
      const charged = await chargePayPerLead(contractor.stripe_customer_id!)
      if (!charged) {
        await supabase.from('lead_deliveries').update({ delivery_status: 'failed' }).eq('id', delivery.id)
        return
      }
      await sendSms(contractor.phone, smsBody)
      await supabase.from('lead_deliveries')
        .update({ delivery_status: 'sent', delivered_at: new Date().toISOString() })
        .eq('id', delivery.id)
    } catch (err) {
      console.error(`SMS failed for pay-per-lead contractor ${contractor.id}:`, err)
      await supabase.from('lead_deliveries').update({ delivery_status: 'failed' }).eq('id', delivery.id)
    }
  }))

  // Send to Starter contractors after 30 min delay
  if (selectedStarter.length > 0) {
    setTimeout(async () => {
      await Promise.all(selectedStarter.map(async (contractor) => {
        const { data: fresh } = await supabase
          .from('contractors')
          .select('is_active, lead_credits_used, lead_credits_limit')
          .eq('id', contractor.id)
          .single()

        if (!fresh || !fresh.is_active || fresh.lead_credits_used >= fresh.lead_credits_limit) return

        const { data: delivery } = await supabase
          .from('lead_deliveries')
          .insert({ lead_id, contractor_id: contractor.id, delivery_status: 'pending', plan_type: 'starter' })
          .select().single()

        try {
          await sendSms(contractor.phone, smsBody)
          await supabase.from('lead_deliveries')
            .update({ delivery_status: 'sent', delivered_at: new Date().toISOString() })
            .eq('id', delivery.id)
          await supabase.from('contractors')
            .update({ lead_credits_used: fresh.lead_credits_used + 1 })
            .eq('id', contractor.id)
        } catch (err) {
          console.error(`SMS failed for starter contractor ${contractor.id}:`, err)
          await supabase.from('lead_deliveries').update({ delivery_status: 'failed' }).eq('id', delivery.id)
        }
      }))
    }, STARTER_DELAY_MS)
  }

  await supabase.from('homeowner_leads').update({ status: 'matched' }).eq('id', lead_id)

  // Always notify admin of every lead
  const adminPhone = process.env.ADMIN_PHONE
  if (adminPhone) {
    const tradeLabel = TRADE_LABELS[lead.trade_type as TradeType] || lead.trade_type
    const adminMsg = `[Admin] New ${tradeLabel} lead from ${lead.name} (${lead.phone}) in ${lead.postal_code}. Job: ${lead.job_description.slice(0, 80)}`
    await sendSms(adminPhone, adminMsg).catch(err => console.error('Admin SMS failed:', err))
  }

  console.log(`matchLead: pro_notified=${selectedPro.length} starter_scheduled=${selectedStarter.length} ppl_notified=${selectedPpl.length}`)
}
