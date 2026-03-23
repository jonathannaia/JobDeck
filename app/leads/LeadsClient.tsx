'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { AnonymizedLead } from './page'

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(hours / 24)
  if (days > 0) return `${days}d ago`
  if (hours > 0) return `${hours}h ago`
  return 'Just now'
}

export default function LeadsClient({ leads }: { leads: AnonymizedLead[] }) {
  const [contractor, setContractor] = useState<any>(null)
  const [unlocking, setUnlocking] = useState<string | null>(null)
  const [unlockedLeads, setUnlockedLeads] = useState<Record<string, any>>({})

  useEffect(() => {
    async function checkAuth() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const res = await fetch('/api/contractors/me')
      if (res.ok) {
        const data = await res.json()
        setContractor(data.contractor)
      }
    }
    checkAuth()
  }, [])

  async function handleUnlock(leadId: string) {
    if (!contractor) {
      window.location.href = '/contractors'
      return
    }

    setUnlocking(leadId)

    if (contractor.plan_type === 'pay_per_lead') {
      const res = await fetch('/api/stripe/unlock-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lead_id: leadId }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else alert(data.error || 'Something went wrong')
      setUnlocking(null)
    } else {
      const res = await fetch('/api/leads/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lead_id: leadId }),
      })
      const data = await res.json()
      if (data.lead) {
        setUnlockedLeads(prev => ({ ...prev, [leadId]: data.lead }))
      } else {
        alert(data.error || 'Something went wrong')
      }
      setUnlocking(null)
    }
  }

  function getButtonLabel() {
    if (!contractor) return 'Get Access'
    if (contractor.plan_type === 'pay_per_lead') return 'Unlock — $40'
    return 'Reveal Lead'
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <section className="bg-white border-b border-[#e2e8f0] py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-[#0f172a] mb-3">Live Homeowner Leads</h1>
          <p className="text-[#6b7280] max-w-xl mx-auto">
            Real jobs posted by Ontario homeowners. Unlock a lead to get their name, phone number, and full job details.
          </p>
          {!contractor && (
            <a href="/contractors" className="mt-6 inline-block bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-medium px-6 py-2.5 rounded-lg text-sm transition-colors">
              Sign Up to Access Leads
            </a>
          )}
        </div>
      </section>

      <section className="py-10 px-4">
        <div className="max-w-3xl mx-auto space-y-4">
          {leads.length === 0 && (
            <p className="text-center text-[#6b7280] py-12">No leads yet — check back soon.</p>
          )}
          {leads.map(lead => {
            const unlocked = unlockedLeads[lead.id]
            return (
              <div key={lead.id} className="bg-white border border-[#e2e8f0] rounded-xl p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="bg-[#EFF6FF] text-[#1d4ed8] text-xs font-medium px-2.5 py-1 rounded-full">{lead.trade_label}</span>
                      <span className="text-[#6b7280] text-xs">{lead.region}</span>
                      <span className="text-[#9ca3af] text-xs">· {timeAgo(lead.created_at)}</span>
                    </div>
                    <p className="text-[#374151] text-sm mb-1">{lead.description}</p>
                    {lead.timeline && (
                      <p className="text-[#9ca3af] text-xs">Timeline: {lead.timeline}</p>
                    )}
                    {unlocked && (
                      <div className="mt-4 bg-[#f0fdf4] border border-[#bbf7d0] rounded-lg p-4">
                        <p className="text-[#16a34a] text-sm font-semibold mb-2">Lead Unlocked</p>
                        <div className="space-y-1 text-sm text-[#374151]">
                          <p><span className="font-medium">Name:</span> {unlocked.name}</p>
                          <p><span className="font-medium">Phone:</span> <a href={`tel:${unlocked.phone}`} className="text-[#2563eb] underline">{unlocked.phone}</a></p>
                          {unlocked.email && <p><span className="font-medium">Email:</span> {unlocked.email}</p>}
                          <p><span className="font-medium">Postal Code:</span> {unlocked.postal_code}</p>
                          <p><span className="font-medium">Full Description:</span> {unlocked.job_description}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  {!unlocked && (
                    <button
                      onClick={() => handleUnlock(lead.id)}
                      disabled={unlocking === lead.id}
                      className="shrink-0 bg-[#2563eb] hover:bg-[#1d4ed8] disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
                    >
                      {unlocking === lead.id ? 'Loading...' : getButtonLabel()}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
