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
  source: 'form' | 'facebook'
  post_url: string | null
}

function parseDescription(raw: string): { text: string; photo_url: string | null } {
  const match = raw.match(/\n\n\[Photo:\s*(https?:\/\/[^\]]+)\]/)
  if (!match) return { text: raw.trim(), photo_url: null }
  return {
    text: raw.slice(0, match.index).trim(),
    photo_url: match[1].trim(),
  }
}

const ONTARIO_CITIES = [
  'toronto', 'mississauga', 'brampton', 'hamilton', 'london', 'markham',
  'vaughan', 'kitchener', 'windsor', 'richmond hill', 'oakville',
  'burlington', 'oshawa', 'barrie', 'st. catharines', 'cambridge',
  'guelph', 'whitby', 'ajax', 'thunder bay', 'waterloo', 'brantford',
  'sudbury', 'kingston', 'pickering', 'newmarket', 'clarington',
  'caledon', 'halton hills', 'orangeville', 'peterborough',
  'niagara falls', 'welland', 'belleville', 'north bay', 'sarnia',
  'woodstock', 'st. thomas', 'stratford', 'orillia', 'collingwood',
]

function extractCity(text: string): string {
  const t = text.toLowerCase()
  for (const city of ONTARIO_CITIES) {
    if (t.includes(city)) return city.replace(/\b\w/g, c => c.toUpperCase())
  }
  return 'Ontario'
}

export default async function LeadsPage() {
  const supabase = createServiceClient()

  const [{ data: formLeads }, { data: fbLeads }] = await Promise.all([
    supabase
      .from('homeowner_leads')
      .select('id, trade_type, city, postal_code, job_description, timeline, budget_range, created_at')
      .order('created_at', { ascending: false })
      .limit(100),
    supabase
      .from('leads')
      .select('id, post_url, post_preview, post_text, posted_at, scraped_at')
      .eq('status', 'new')
      .order('scraped_at', { ascending: false })
      .limit(100),
  ])

  const formPosts: LeadPost[] = (formLeads || []).map(lead => {
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
      source: 'form',
      post_url: null,
    }
  })

  const fbPosts: LeadPost[] = (fbLeads || []).map(lead => ({
    id: lead.id,
    trade_key: 'general',
    trade_label: 'Homeowner Request',
    city: extractCity(lead.post_text || lead.post_preview || ''),
    description: lead.post_preview || '',
    photo_url: null,
    budget_range: null,
    timeline: null,
    created_at: lead.posted_at || lead.scraped_at,
    source: 'facebook',
    post_url: lead.post_url,
  }))

  // Merge and sort by date, newest first
  const posts: LeadPost[] = [...formPosts, ...fbPosts].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  return <LeadsClient posts={posts} />
}
