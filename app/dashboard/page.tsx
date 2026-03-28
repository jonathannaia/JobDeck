export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Stripe from 'stripe'
import SignOutButton from '@/components/SignOutButton'
import { ArrowRight, Phone, Mail, MapPin, Clock } from 'lucide-react'
import { TRADE_LABELS, type TradeType } from '@/lib/types'

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  const hours = Math.floor(diff / 3600000)
  if (days > 0) return `${days}d ago`
  if (hours > 0) return `${hours}h ago`
  return 'Just now'
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-02-25.clover' })
  const service = createServiceClient()

  // Fetch all paid lead_unlock sessions for this user
  let claimedLeadIds: { lead_id: string; claimed_at: number }[] = []
  try {
    const sessions = await stripe.checkout.sessions.list({ limit: 100 })
    claimedLeadIds = sessions.data
      .filter(s =>
        s.metadata?.type === 'lead_unlock' &&
        s.payment_status === 'paid' &&
        (s.customer_email === user.email || s.customer_details?.email === user.email || s.metadata?.contractor_email === user.email) &&
        s.metadata?.lead_id
      )
      .map(s => ({ lead_id: s.metadata!.lead_id, claimed_at: s.created }))
  } catch {
    // Stripe unavailable — show empty state
  }

  // Fetch full lead details for each claimed lead
  type ClaimedLead = {
    id: string
    name: string
    phone: string
    email: string | null
    trade_type: string
    city: string | null
    postal_code: string
    job_description: string
    budget_range: string | null
    timeline: string | null
    claimed_at: number
  }

  let claimedLeads: ClaimedLead[] = []
  if (claimedLeadIds.length > 0) {
    const ids = claimedLeadIds.map(c => c.lead_id)
    const { data: leads } = await service
      .from('homeowner_leads')
      .select('id, name, phone, email, trade_type, city, postal_code, job_description, budget_range, timeline')
      .in('id', ids)

    if (leads) {
      const claimedAtMap = Object.fromEntries(claimedLeadIds.map(c => [c.lead_id, c.claimed_at]))
      claimedLeads = leads.map(l => ({
        ...l,
        claimed_at: claimedAtMap[l.id] ?? 0,
      })).sort((a, b) => b.claimed_at - a.claimed_at)
    }
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="max-w-3xl mx-auto px-4 py-10">

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#0f172a] mb-1">Your Claimed Leads</h1>
            <p className="text-[#6b7280] text-sm">{user.email}</p>
          </div>
          <SignOutButton />
        </div>

        {/* Claimed leads */}
        {claimedLeads.length === 0 ? (
          <div className="bg-white border border-[#e2e8f0] rounded-2xl px-6 py-16 text-center mb-6">
            <p className="text-[#9ca3af] text-sm mb-5">You haven't claimed any leads yet.</p>
            <a
              href="/leads"
              className="inline-flex items-center gap-2 bg-[#143A75] hover:bg-[#0e2d5c] text-white font-semibold px-6 py-3 rounded-xl text-sm transition-colors"
            >
              Browse Open Leads
              <ArrowRight size={15} strokeWidth={2.5} />
            </a>
          </div>
        ) : (
          <div className="space-y-4 mb-6">
            {claimedLeads.map(lead => {
              const tradeLabel = TRADE_LABELS[lead.trade_type as TradeType] || lead.trade_type
              const location = lead.city || `Ontario (${lead.postal_code.slice(0, 3).toUpperCase()})`
              const desc = lead.job_description.replace(/\n\n\[Photo:.*?\]/, '').trim()
              return (
                <div key={lead.id} className="bg-white border border-[#e2e8f0] rounded-2xl p-6">
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex flex-wrap gap-2">
                      <span className="bg-[#EFF6FF] text-[#143A75] text-xs font-semibold px-2.5 py-1 rounded-full">
                        {tradeLabel}
                      </span>
                      {lead.budget_range && lead.budget_range !== 'Not sure yet' && (
                        <span className="bg-[#f0fdf4] text-[#16a34a] text-xs font-semibold px-2.5 py-1 rounded-full">
                          {lead.budget_range}
                        </span>
                      )}
                    </div>
                    <span className="text-[#9ca3af] text-xs shrink-0 flex items-center gap-1">
                      <Clock size={11} />
                      Claimed {new Date(lead.claimed_at * 1000).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>

                  {/* Contact info */}
                  <div className="bg-[#f8fafc] rounded-xl p-4 mb-4 space-y-2">
                    <p className="text-sm font-semibold text-[#0f172a]">{lead.name}</p>
                    <div className="flex flex-wrap gap-4">
                      <a href={`tel:${lead.phone}`} className="flex items-center gap-1.5 text-[#143A75] text-sm font-medium hover:underline">
                        <Phone size={13} strokeWidth={2} />
                        {lead.phone}
                      </a>
                      {lead.email && (
                        <a href={`mailto:${lead.email}`} className="flex items-center gap-1.5 text-[#143A75] text-sm font-medium hover:underline">
                          <Mail size={13} strokeWidth={2} />
                          {lead.email}
                        </a>
                      )}
                      <span className="flex items-center gap-1.5 text-[#6b7280] text-sm">
                        <MapPin size={13} strokeWidth={2} />
                        {location}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-[#374151] text-sm leading-relaxed">{desc}</p>
                  {lead.timeline && (
                    <p className="text-[#9ca3af] text-xs mt-2">Timeline: {lead.timeline}</p>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Browse more CTA */}
        {claimedLeads.length > 0 && (
          <div className="bg-white border border-[#e2e8f0] rounded-2xl p-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-[#0f172a]">Find more leads</p>
              <p className="text-xs text-[#6b7280] mt-0.5">New homeowner jobs posted daily across Ontario.</p>
            </div>
            <a
              href="/leads"
              className="shrink-0 inline-flex items-center gap-1.5 bg-[#143A75] hover:bg-[#0e2d5c] text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-colors whitespace-nowrap"
            >
              Browse Leads →
            </a>
          </div>
        )}

      </div>
    </div>
  )
}
