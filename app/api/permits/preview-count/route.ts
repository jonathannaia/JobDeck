import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getDbTrades, applyTradeFilter } from '@/lib/trade-filters'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const city  = searchParams.get('city')
  const trade = searchParams.get('trade') || 'all'

  if (!city) return NextResponse.json({ count: 0 })

  const supabase = createServiceClient()
  const dbTrades = getDbTrades(trade)

  let query = supabase
    .from('building_permits')
    .select('permit_type, description, est_cost')
    .eq('city', city)
    .limit(500)

  if (dbTrades) {
    query = dbTrades.length === 1
      ? query.eq('trade', dbTrades[0])
      : query.in('trade', dbTrades)
  }

  const { data } = await query
  const count = applyTradeFilter(data ?? [], trade).length

  return NextResponse.json({ count })
}
