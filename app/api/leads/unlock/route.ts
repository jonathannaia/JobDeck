import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createServiceClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

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
    .select('*')
    .eq('email', user.email!)
    .single()

  if (!contractor || !contractor.is_active) {
    return NextResponse.json({ error: 'No active contractor account' }, { status: 403 })
  }

  if (contractor.plan_type === 'pay_per_lead') {
    return NextResponse.json({ error: 'Use unlock-checkout for pay-per-lead' }, { status: 400 })
  }

  if (contractor.plan_type === 'starter' && contractor.lead_credits_used >= contractor.lead_credits_limit) {
    return NextResponse.json({ error: 'Monthly lead limit reached. Upgrade to Pro.' }, { status: 403 })
  }

  // Check if already unlocked
  const { data: existing } = await service
    .from('lead_unlocks')
    .select('id')
    .eq('lead_id', lead_id)
    .eq('contractor_email', user.email!)
    .single()

  if (!existing) {
    await service.from('lead_unlocks').insert({
      lead_id,
      contractor_email: user.email!,
      payment_type: `subscription_${contractor.plan_type}`,
    })

    if (contractor.plan_type === 'starter') {
      await service
        .from('contractors')
        .update({ lead_credits_used: contractor.lead_credits_used + 1 })
        .eq('id', contractor.id)
    }
  }

  const { data: lead } = await service
    .from('homeowner_leads')
    .select('name, phone, email, postal_code, job_description')
    .eq('id', lead_id)
    .single()

  return NextResponse.json({ lead })
}
