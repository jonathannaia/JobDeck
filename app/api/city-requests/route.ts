import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const { email, city } = await req.json()
  if (!email || !city) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  const supabase = createServiceClient()
  const { error } = await supabase
    .from('city_requests')
    .insert({ email: email.toLowerCase().trim(), city })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
