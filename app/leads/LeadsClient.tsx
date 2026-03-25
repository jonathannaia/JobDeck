'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { AnonymizedLead } from './page'

function timeAgo(dateStr: string) {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  const hours = Math.floor(diff / 3600000)
  if (days > 0) return `${days}d ago`
  if (hours > 0) return `${hours}h ago`
  return 'Just now'
}

function permitPrice(estCost: string | null | undefined): number {
  const n = estCost ? parseFloat(estCost.replace(/[^0-9.]/g, '')) : 0
  if (n >= 200000) return 85
  if (n >= 30000)  return 50
  return 25
}

function LeadCard({
  lead,
  contractorTrade,
  onUnlock,
  unlocking,
  unlockedData,
}: {
  lead: AnonymizedLead
  contractorTrade: string | null
  onUnlock: (id: string, type: 'organic' | 'permit') => void
  unlocking: string | null
  unlockedData: any
}) {
  const isPermit = lead.type === 'permit'
  const isFast = lead.velocity === 'Fast'
  const isMyTrade = contractorTrade && lead.trade_key === contractorTrade

  return (
    <div className={`bg-white border rounded-xl p-6 transition-all ${
      isMyTrade ? 'border-[#2563eb] shadow-sm' : 'border-[#e2e8f0]'
    }`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Badges row */}
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="bg-[#EFF6FF] text-[#1d4ed8] text-xs font-medium px-2.5 py-1 rounded-full">
              {lead.trade_label}
            </span>
            {isPermit && isFast && (
              <span className="bg-[#fef9c3] text-[#854d0e] text-xs font-semibold px-2.5 py-1 rounded-full">
                ⚡ Fill-In Ready
              </span>
            )}
            {isPermit && !isFast && (
              <span className="bg-[#f3f4f6] text-[#6b7280] text-xs font-medium px-2.5 py-1 rounded-full">
                Long-Term Project
              </span>
            )}
            {isPermit && (
              <span className="bg-[#f0fdf4] text-[#16a34a] text-xs font-medium px-2.5 py-1 rounded-full">
                📋 Building Permit
              </span>
            )}
            <span className="text-[#6b7280] text-xs">{lead.location}</span>
            <span className="text-[#9ca3af] text-xs">·{' '}
              {isPermit && lead.issued_date
                ? `Issued ${lead.issued_date}`
                : timeAgo(lead.created_at)}
            </span>
          </div>

          {/* Description */}
          <p className="text-[#374151] text-sm mb-1">{lead.description}</p>

          {/* Permit extras */}
          {isPermit && lead.permit_type && (
            <p className="text-[#9ca3af] text-xs">Permit type: {lead.permit_type}</p>
          )}
          {isPermit && lead.est_cost && (
            <p className="text-[#9ca3af] text-xs">
              Est. value: ${Number(lead.est_cost).toLocaleString()}
            </p>
          )}

          {/* Timeline for organic */}
          {!isPermit && lead.timeline && (
            <p className="text-[#9ca3af] text-xs">Timeline: {lead.timeline}</p>
          )}

          {/* Unlocked organic lead */}
          {!isPermit && unlockedData && (
            <div className="mt-4 bg-[#f0fdf4] border border-[#bbf7d0] rounded-lg p-4">
              <p className="text-[#16a34a] text-sm font-semibold mb-2">Lead Unlocked</p>
              <div className="space-y-1 text-sm text-[#374151]">
                <p><span className="font-medium">Name:</span> {unlockedData.name}</p>
                <p><span className="font-medium">Phone:</span>{' '}
                  <a href={`tel:${unlockedData.phone}`} className="text-[#2563eb] underline">{unlockedData.phone}</a>
                </p>
                {unlockedData.email && <p><span className="font-medium">Email:</span> {unlockedData.email}</p>}
                <p><span className="font-medium">Postal Code:</span> {unlockedData.postal_code}</p>
                <p><span className="font-medium">Full Description:</span> {unlockedData.job_description}</p>
              </div>
            </div>
          )}

          {/* Unlocked permit — show address */}
          {isPermit && unlockedData && (
            <div className="mt-4 bg-[#f0fdf4] border border-[#bbf7d0] rounded-lg p-4">
              <p className="text-[#16a34a] text-sm font-semibold mb-2">Permit Claimed</p>
              <div className="space-y-1 text-sm text-[#374151]">
                <p><span className="font-medium">Address:</span> {unlockedData.address}</p>
                {unlockedData.postal && <p><span className="font-medium">Postal:</span> {unlockedData.postal}</p>}
                {unlockedData.builder && <p><span className="font-medium">Builder on file:</span> {unlockedData.builder}</p>}
                <p className="text-[#6b7280] text-xs mt-2">
                  💡 Door knock or search this address on Facebook to reach the homeowner.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Claim button */}
        {!unlockedData && (
          <div className="shrink-0 flex flex-col items-end gap-1">
            <button
              onClick={() => onUnlock(lead.id, lead.type)}
              disabled={unlocking === lead.id}
              className={`disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
                isFast && isPermit
                  ? 'bg-[#d97706] hover:bg-[#b45309]'
                  : 'bg-[#2563eb] hover:bg-[#1d4ed8]'
              }`}
            >
              {unlocking === lead.id
                ? 'Loading...'
                : isPermit
                  ? `Claim — $${permitPrice(lead.est_cost)}`
                  : 'Claim Lead — $40'}
            </button>
            {isPermit && (
              <span className="text-[#9ca3af] text-xs">Address only</span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function LeadsClient({
  leads,
  permits,
}: {
  leads: AnonymizedLead[]
  permits: AnonymizedLead[]
}) {
  const [contractor, setContractor] = useState<any>(null)
  const [authChecked, setAuthChecked] = useState(false)
  const [unlocking, setUnlocking] = useState<string | null>(null)
  const [unlockedLeads, setUnlockedLeads] = useState<Record<string, any>>({})

  useEffect(() => {
    async function checkAuth() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setAuthChecked(true)
        return
      }
      const res = await fetch('/api/contractors/me')
      if (res.ok) {
        const data = await res.json()
        setContractor(data.contractor)
      }
      setAuthChecked(true)
    }
    checkAuth()

    const params = new URLSearchParams(window.location.search)
    const unlockedId = params.get('unlocked')
    if (unlockedId) {
      fetch('/api/leads/reveal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lead_id: unlockedId }),
      }).then(r => r.json()).then(data => {
        if (data.lead) setUnlockedLeads(prev => ({ ...prev, [unlockedId]: data.lead }))
      })
      window.history.replaceState({}, '', '/leads')
    }

    const permitClaimedId = params.get('permit_claimed')
    if (permitClaimedId) {
      fetch('/api/permits/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permit_id: permitClaimedId }),
      }).then(r => r.json()).then(data => {
        if (data.permit) setUnlockedLeads(prev => ({ ...prev, [permitClaimedId]: data.permit }))
      })
      window.history.replaceState({}, '', '/leads')
    }
  }, [])

  // Sort: contractor's trade first, then Fast permits, then everything else
  const sortedAll = useMemo(() => {
    const trade = contractor?.trade_type
    const all = [...leads, ...permits]
    return all.sort((a, b) => {
      const aMatch = trade && a.trade_key === trade ? 0 : 1
      const bMatch = trade && b.trade_key === trade ? 0 : 1
      if (aMatch !== bMatch) return aMatch - bMatch
      // Within same trade group: Fast permits first, then organic, then slow permits
      const aScore = a.type === 'permit' && a.velocity === 'Fast' ? 0
        : a.type === 'organic' ? 1 : 2
      const bScore = b.type === 'permit' && b.velocity === 'Fast' ? 0
        : b.type === 'organic' ? 1 : 2
      if (aScore !== bScore) return aScore - bScore
      // Finally by date desc
      return (b.created_at || '').localeCompare(a.created_at || '')
    })
  }, [leads, permits, contractor])

  async function handleUnlock(leadId: string, type: 'organic' | 'permit') {
    if (!contractor) {
      window.location.href = '/contractors/signup'
      return
    }

    setUnlocking(leadId)

    if (type === 'permit') {
      // Permit claim — fetch address details directly (permit data is public once paid)
      const res = await fetch('/api/permits/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permit_id: leadId }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else if (data.permit) setUnlockedLeads(prev => ({ ...prev, [leadId]: data.permit }))
      else alert(data.error || 'Something went wrong')
      setUnlocking(null)
      return
    }

    // Organic lead
    const res = await fetch('/api/stripe/unlock-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lead_id: leadId }),
    })
    const data = await res.json()
    if (data.url) window.location.href = data.url
    else alert(data.error || 'Something went wrong')
    setUnlocking(null)
  }

  // Group leads by city, preserving sort order within each city
  const citySections = useMemo(() => {
    const map = new Map<string, AnonymizedLead[]>()
    for (const lead of sortedAll) {
      const city = lead.location || 'Other'
      if (!map.has(city)) map.set(city, [])
      map.get(city)!.push(lead)
    }
    return Array.from(map.entries()) // [city, leads[]]
  }, [sortedAll])

  const [expandedCities, setExpandedCities] = useState<Set<string>>(new Set())
  const [cityTradeFilters, setCityTradeFilters] = useState<Record<string, string>>({})

  const toggleCity = useCallback((city: string) => {
    setExpandedCities(prev => {
      const next = new Set(prev)
      if (next.has(city)) next.delete(city)
      else next.add(city)
      return next
    })
  }, [])

  const setCityTrade = useCallback((city: string, trade: string) => {
    setCityTradeFilters(prev => ({ ...prev, [city]: trade }))
  }, [])

  const myTradeCount = contractor
    ? sortedAll.filter(l => l.trade_key === contractor.trade_type).length
    : 0

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <section className="bg-white border-b border-[#e2e8f0] py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-[#0f172a] mb-3">Live Homeowner Leads</h1>
          <p className="text-[#6b7280] max-w-xl mx-auto">
            Organic leads posted by Ontario homeowners, plus active building permits — sorted by your trade.
          </p>
          {contractor && myTradeCount > 0 && (
            <p className="mt-3 text-[#2563eb] text-sm font-medium">
              {myTradeCount} leads matching your trade ({contractor.trade_type}) shown first
            </p>
          )}
          {authChecked && !contractor && (
            <a href="/contractors/signup" className="mt-6 inline-block bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-medium px-6 py-2.5 rounded-lg text-sm transition-colors">
              Sign Up to Access Leads
            </a>
          )}
        </div>
      </section>

      <section className="py-10 px-4">
        <div className="max-w-3xl mx-auto space-y-6">
          {sortedAll.length === 0 && (
            <p className="text-center text-[#6b7280] py-12">No leads yet — check back soon.</p>
          )}
          {citySections.map(([city, cityLeads]) => {
            const isExpanded = expandedCities.has(city)
            const selectedTrade = cityTradeFilters[city] || ''
            const trades = Array.from(new Set(cityLeads.map(l => l.trade_label))).sort()
            const visibleLeads = selectedTrade
              ? cityLeads.filter(l => l.trade_label === selectedTrade)
              : cityLeads
            return (
              <div key={city}>
                <button
                  onClick={() => toggleCity(city)}
                  className="w-full flex items-center justify-between mb-3 group"
                >
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-semibold text-[#0f172a]">{city}</h2>
                    <span className="text-xs text-[#6b7280] bg-[#f1f5f9] px-2 py-0.5 rounded-full">
                      {cityLeads.length} lead{cityLeads.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <span className="text-[#9ca3af] text-sm">{isExpanded ? '▾ Hide' : '▸ Show'}</span>
                </button>
                {isExpanded && (
                  <>
                    {/* Trade filter pills */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      <button
                        onClick={() => setCityTrade(city, '')}
                        className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                          !selectedTrade
                            ? 'bg-[#2563eb] text-white border-[#2563eb]'
                            : 'bg-white text-[#6b7280] border-[#e2e8f0] hover:border-[#2563eb] hover:text-[#2563eb]'
                        }`}
                      >
                        All
                      </button>
                      {trades.map(trade => (
                        <button
                          key={trade}
                          onClick={() => setCityTrade(city, trade)}
                          className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                            selectedTrade === trade
                              ? 'bg-[#2563eb] text-white border-[#2563eb]'
                              : 'bg-white text-[#6b7280] border-[#e2e8f0] hover:border-[#2563eb] hover:text-[#2563eb]'
                          }`}
                        >
                          {trade}
                        </button>
                      ))}
                    </div>
                    <div className="space-y-4">
                      {visibleLeads.map(lead => (
                        <LeadCard
                          key={lead.id}
                          lead={lead}
                          contractorTrade={contractor?.trade_type ?? null}
                          onUnlock={handleUnlock}
                          unlocking={unlocking}
                          unlockedData={unlockedLeads[lead.id]}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
