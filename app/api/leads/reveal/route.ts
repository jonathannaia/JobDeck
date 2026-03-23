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

  // Check that this lead has been unlocked/paid for by this contractor
  const { data: unlock } = await service
    .from('lead_unlocks')
    .select('id')
    .eq('lead_id', lead_id)
    .eq('contractor_email', user.email!)
    .single()

  if (!unlock) return NextResponse.json({ error: 'Lead not unlocked' }, { status: 403 })

  const { data: lead } = await service
    .from('homeowner_leads')
    .select('name, phone, email, postal_code, job_description')
    .eq('id', lead_id)
    .single()

  return NextResponse.json({ lead })
}
