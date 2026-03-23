import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createServiceClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function GET() {
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
  if (!user) return NextResponse.json({ contractor: null })

  const service = createServiceClient()
  const { data: contractor } = await service
    .from('contractors')
    .select('id, name, email, trade_type, service_area, plan_type, lead_credits_used, lead_credits_limit, is_active, stripe_customer_id')
    .eq('email', user.email!)
    .single()

  return NextResponse.json({ contractor: contractor || null })
}
