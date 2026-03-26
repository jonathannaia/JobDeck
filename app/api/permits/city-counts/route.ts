import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export const revalidate = 3600 // cache for 1 hour

export async function GET() {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('building_permits')
    .select('city')
    .not('city', 'is', null)
    .limit(5000)

  if (!data) return NextResponse.json([])

  const counts: Record<string, number> = {}
  for (const row of data) {
    if (row.city) counts[row.city] = (counts[row.city] ?? 0) + 1
  }

  const result = Object.entries(counts)
    .map(([city, count]) => ({ city, count }))
    .sort((a, b) => b.count - a.count)

  return NextResponse.json(result)
}
