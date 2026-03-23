import { createServiceClient } from '@/lib/supabase/server'
import { TRADE_LABELS, type TradeType } from '@/lib/types'
import LeadsClient from './LeadsClient'

export const dynamic = 'force-dynamic'

const REGION_LABELS: Record<string, string> = {
  M: 'Toronto / GTA',
  L: 'Hamilton / Burlington / Niagara / Barrie',
  N: 'London / Windsor / Kitchener / Cambridge',
  K: 'Ottawa / Eastern Ontario',
  P: 'Northern Ontario / Sudbury',
}

export type AnonymizedLead = {
  id: string
  trade_label: string
  region: string
  description: string
  timeline: string | null
  created_at: string
}

export default async function LeadsPage() {
  const supabase = createServiceClient()

  const { data: leads } = await supabase
    .from('homeowner_leads')
    .select('id, trade_type, postal_code, job_description, timeline, created_at')
    .order('created_at', { ascending: false })
    .limit(50)

  const anonymized: AnonymizedLead[] = (leads || []).map(lead => ({
    id: lead.id,
    trade_label: TRADE_LABELS[lead.trade_type as TradeType] || lead.trade_type,
    region: REGION_LABELS[lead.postal_code.charAt(0).toUpperCase()] || 'Ontario',
    description: lead.job_description.slice(0, 100) + (lead.job_description.length > 100 ? '...' : ''),
    timeline: lead.timeline,
    created_at: lead.created_at,
  }))

  return <LeadsClient leads={anonymized} />
}
