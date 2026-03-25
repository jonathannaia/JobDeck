import { createServiceClient } from '@/lib/supabase/server'
import { TRADE_LABELS, type TradeType } from '@/lib/types'
import LeadsClient from './LeadsClient'

export const dynamic = 'force-dynamic'

export type AnonymizedLead = {
  id: string
  type: 'organic' | 'permit'
  trade_label: string
  trade_key: string
  location: string
  description: string
  timeline: string | null
  created_at: string
  // permit-only
  velocity?: 'Fast' | 'Slow'
  issued_date?: string
  permit_type?: string
  est_cost?: string
}

export default async function LeadsPage() {
  const supabase = createServiceClient()

  const [{ data: leads }, { data: permits }] = await Promise.all([
    supabase
      .from('homeowner_leads')
      .select('id, trade_type, city, postal_code, job_description, timeline, created_at')
      .order('created_at', { ascending: false })
      .limit(50),
    supabase
      .from('building_permits')
      .select('id, velocity, trade, city, postal, permit_type, description, status, issued_date, est_cost')
      .order('issued_date', { ascending: false })
      .limit(200),
  ])

  const organicLeads: AnonymizedLead[] = (leads || []).map(lead => ({
    id: lead.id,
    type: 'organic',
    trade_key: lead.trade_type,
    trade_label: TRADE_LABELS[lead.trade_type as TradeType] || lead.trade_type,
    location: lead.city || `Postal ${lead.postal_code.slice(0, 3).toUpperCase()}`,
    description: lead.job_description.slice(0, 120) + (lead.job_description.length > 120 ? '...' : ''),
    timeline: lead.timeline,
    created_at: lead.created_at,
  }))

  const permitLeads: AnonymizedLead[] = (permits || []).map(p => ({
    id: p.id,
    type: 'permit',
    trade_key: p.trade,
    trade_label: p.trade,
    location: p.city,
    description: p.description?.slice(0, 120) || p.permit_type || 'Building permit',
    timeline: null,
    created_at: p.issued_date || '',
    velocity: p.velocity as 'Fast' | 'Slow',
    issued_date: p.issued_date,
    permit_type: p.permit_type,
    est_cost: p.est_cost,
  }))

  return <LeadsClient leads={organicLeads} permits={permitLeads} />
}
