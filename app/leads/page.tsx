import { createServiceClient } from '@/lib/supabase/server'
import { TRADE_LABELS, type TradeType } from '@/lib/types'
import LeadsClient from './LeadsClient'

export const dynamic = 'force-dynamic'

export type LeadPost = {
  id: string
  trade_key: string
  trade_label: string
  city: string
  description: string
  photo_url: string | null
  budget_range: string | null
  timeline: string | null
  created_at: string
}

function parseDescription(raw: string): { text: string; photo_url: string | null } {
  const match = raw.match(/\n\n\[Photo:\s*(https?:\/\/[^\]]+)\]/)
  if (!match) return { text: raw.trim(), photo_url: null }
  return {
    text: raw.slice(0, match.index).trim(),
    photo_url: match[1].trim(),
  }
}

export default async function LeadsPage() {
  const supabase = createServiceClient()

  const { data: leads } = await supabase
    .from('homeowner_leads')
    .select('id, trade_type, city, postal_code, job_description, timeline, budget_range, created_at')
    .order('created_at', { ascending: false })
    .limit(100)

  const posts: LeadPost[] = (leads || []).map(lead => {
    const { text, photo_url } = parseDescription(lead.job_description)
    return {
      id: lead.id,
      trade_key: lead.trade_type,
      trade_label: TRADE_LABELS[lead.trade_type as TradeType] || lead.trade_type,
      city: lead.city || `Ontario (${lead.postal_code.slice(0, 3).toUpperCase()})`,
      description: text,
      photo_url,
      budget_range: lead.budget_range || null,
      timeline: lead.timeline || null,
      created_at: lead.created_at,
    }
  })

  return <LeadsClient posts={posts} />
}
