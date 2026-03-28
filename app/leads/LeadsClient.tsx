'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { TRADE_LABELS, type TradeType } from '@/lib/types'
import type { LeadPost } from './page'
import { MapPin, Clock, ChevronDown, ChevronUp, Lock } from 'lucide-react'

function timeAgo(dateStr: string) {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (days > 0) return `${days}d ago`
  if (hours > 0) return `${hours}h ago`
  if (mins > 0) return `${mins}m ago`
  return 'Just now'
}

function leadPrice(budget: string | null): string {
  if (budget === 'Under $1,000') return '$12'
  if (budget === '$15,000+') return '$25'
  return '$15'
}

function BudgetBadge({ budget }: { budget: string | null }) {
  if (!budget || budget === 'Not sure yet') return null
  const color =
    budget === 'Under $1,000' ? 'bg-slate-100 text-slate-600' :
    budget === '$1,000 – $5,000' ? 'bg-green-100 text-green-700' :
    budget === '$5,000 – $15,000' ? 'bg-amber-100 text-amber-700' :
    'bg-red-100 text-red-700'
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${color}`}>
      {budget}
    </span>
  )
}

function LeadCard({
  post,
  onClaim,
  unlocking,
  unlockedData,
}: {
  post: LeadPost
  onClaim: (id: string) => void
  unlocking: string | null
  unlockedData: any
}) {
  const [expanded, setExpanded] = useState(false)
  const isLong = post.description.length > 160
  const displayText = expanded || !isLong ? post.description : post.description.slice(0, 160) + '…'

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#e8ecf0] overflow-hidden">

      {/* Photo */}
      {post.photo_url && (
        <div className="w-full aspect-[4/3] bg-[#f1f5f9] overflow-hidden">
          <img
            src={post.photo_url}
            alt="Job photo"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-[#EFF6FF] text-[#143A75] text-xs font-semibold px-2.5 py-1 rounded-full">
              {post.trade_label}
            </span>
            <BudgetBadge budget={post.budget_range} />
          </div>
          <div className="flex items-center gap-1 text-[#9ca3af] text-xs shrink-0">
            <Clock size={11} />
            <span>{timeAgo(post.created_at)}</span>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center gap-1 text-[#6b7280] text-xs mb-3">
          <MapPin size={11} />
          <span>{post.city}</span>
        </div>

        {/* Description */}
        <p className="text-[#374151] text-sm leading-relaxed mb-1">{displayText}</p>
        {isLong && (
          <button
            onClick={() => setExpanded(e => !e)}
            className="flex items-center gap-0.5 text-[#143A75] text-xs font-medium mb-3 hover:underline"
          >
            {expanded ? <><ChevronUp size={12} /> Show less</> : <><ChevronDown size={12} /> Read more</>}
          </button>
        )}

        {/* Timeline */}
        {post.timeline && (
          <p className="text-[#9ca3af] text-xs mb-4">Timeline: {post.timeline}</p>
        )}

        {/* Unlocked state */}
        {unlockedData ? (
          <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl p-4 mt-2">
            <p className="text-[#16a34a] text-xs font-semibold uppercase tracking-wide mb-3">Lead Unlocked</p>
            <div className="space-y-1.5 text-sm text-[#374151]">
              <p><span className="font-medium">Name:</span> {unlockedData.name}</p>
              <p>
                <span className="font-medium">Phone:</span>{' '}
                <a href={`tel:${unlockedData.phone}`} className="text-[#143A75] underline">{unlockedData.phone}</a>
              </p>
              {unlockedData.email && (
                <p>
                  <span className="font-medium">Email:</span>{' '}
                  <a href={`mailto:${unlockedData.email}`} className="text-[#143A75] underline">{unlockedData.email}</a>
                </p>
              )}
              {unlockedData.postal_code && (
                <p><span className="font-medium">Postal Code:</span> {unlockedData.postal_code}</p>
              )}
              <p className="text-[#6b7280] text-xs pt-1">{unlockedData.job_description}</p>
            </div>
          </div>
        ) : (
          /* Claim button */
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#f1f5f9]">
            <div className="flex items-center gap-1.5 text-[#9ca3af] text-xs">
              <Lock size={12} />
              <span>Name &amp; contact hidden</span>
            </div>
            <button
              onClick={() => onClaim(post.id)}
              disabled={unlocking === post.id}
              className="bg-[#143A75] hover:bg-[#0e2d5c] disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold px-5 py-2 rounded-xl transition-colors whitespace-nowrap"
            >
              {unlocking === post.id ? 'Loading…' : `Claim Lead — ${leadPrice(post.budget_range)}`}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

const BUDGET_OPTIONS = ['Under $1,000', '$1,000 – $5,000', '$5,000 – $15,000', '$15,000+']

const ALL_TRADES = [
  'Plumber', 'Electrician', 'Roofer', 'HVAC', 'Carpenter',
  'General Contractor', 'Painter', 'Landscaper', 'Lawn Service', 'Decking', 'Fencing', 'Concrete',
]

const ALL_CITIES = [
  'Toronto', 'Mississauga', 'Brampton', 'Burlington', 'Barrie',
  'Hamilton', 'Oakville', 'Pickering', 'St. Catharines', 'Sudbury',
]

export default function LeadsClient({ posts }: { posts: LeadPost[] }) {
  const [contractor, setContractor] = useState<any>(null)
  const [authChecked, setAuthChecked] = useState(false)
  const [unlocking, setUnlocking] = useState<string | null>(null)
  const [unlockedLeads, setUnlockedLeads] = useState<Record<string, any>>({})

  const [filterTrade, setFilterTrade] = useState('')
  const [filterBudget, setFilterBudget] = useState('')
  const [filterCity, setFilterCity] = useState('')

  useEffect(() => {
    async function checkAuth() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setAuthChecked(true); return }
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
  }, [])

  async function handleClaim(leadId: string) {
    if (!contractor) {
      window.location.href = '/contractors/batch'
      return
    }
    setUnlocking(leadId)
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

  const cities = useMemo(() => {
    const extra = posts.map(p => p.city).filter(c => !ALL_CITIES.includes(c))
    return [...ALL_CITIES, ...Array.from(new Set(extra))].sort()
  }, [posts])

  const trades = useMemo(() => {
    const extra = posts.map(p => p.trade_label).filter(t => !ALL_TRADES.includes(t))
    return [...ALL_TRADES, ...Array.from(new Set(extra))].sort()
  }, [posts])

  const filtered = useMemo(() => {
    return posts.filter(p => {
      if (filterTrade && p.trade_label !== filterTrade) return false
      if (filterBudget && p.budget_range !== filterBudget) return false
      if (filterCity && p.city !== filterCity) return false
      return true
    })
  }, [posts, filterTrade, filterBudget, filterCity])

  const activeFilters = [filterTrade, filterBudget, filterCity].filter(Boolean).length

  return (
    <div className="min-h-screen bg-[#f8fafc]">

      {/* Header */}
      <div className="bg-white border-b border-[#e2e8f0] px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-[#0f172a] mb-1">Homeowner Leads</h1>
          <p className="text-[#6b7280] text-sm">
            {posts.length} open job{posts.length !== 1 ? 's' : ''} across Ontario — newest first
          </p>
          {authChecked && !contractor && (
            <a
              href="/contractors/batch"
              className="mt-4 inline-block bg-[#143A75] hover:bg-[#0e2d5c] text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
            >
              Sign up to claim leads
            </a>
          )}
        </div>
      </div>

      {/* Sticky filter bar */}
      <div className="sticky top-0 z-10 bg-white border-b border-[#e2e8f0] shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-3 flex gap-2 overflow-x-auto scrollbar-hide">

          {/* Trade */}
          <select
            value={filterTrade}
            onChange={e => setFilterTrade(e.target.value)}
            className={`shrink-0 text-xs font-medium px-3 py-2 rounded-xl border transition-colors appearance-none cursor-pointer ${
              filterTrade
                ? 'bg-[#143A75] text-white border-[#143A75]'
                : 'bg-white text-[#374151] border-[#e2e8f0] hover:border-[#143A75]'
            }`}
          >
            <option value="">All Trades</option>
            {trades.map(t => <option key={t} value={t}>{t}</option>)}
          </select>

          {/* Budget */}
          <select
            value={filterBudget}
            onChange={e => setFilterBudget(e.target.value)}
            className={`shrink-0 text-xs font-medium px-3 py-2 rounded-xl border transition-colors appearance-none cursor-pointer ${
              filterBudget
                ? 'bg-[#143A75] text-white border-[#143A75]'
                : 'bg-white text-[#374151] border-[#e2e8f0] hover:border-[#143A75]'
            }`}
          >
            <option value="">All Budgets</option>
            {BUDGET_OPTIONS.map(b => <option key={b} value={b}>{b}</option>)}
          </select>

          {/* City/area */}
          <select
            value={filterCity}
            onChange={e => setFilterCity(e.target.value)}
            className={`shrink-0 text-xs font-medium px-3 py-2 rounded-xl border transition-colors appearance-none cursor-pointer ${
              filterCity
                ? 'bg-[#143A75] text-white border-[#143A75]'
                : 'bg-white text-[#374151] border-[#e2e8f0] hover:border-[#143A75]'
            }`}
          >
            <option value="">All Areas</option>
            {cities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          {/* Clear */}
          {activeFilters > 0 && (
            <button
              onClick={() => { setFilterTrade(''); setFilterBudget(''); setFilterCity('') }}
              className="shrink-0 text-xs font-medium px-3 py-2 rounded-xl border border-[#fca5a5] text-red-500 hover:bg-red-50 transition-colors"
            >
              Clear ({activeFilters})
            </button>
          )}
        </div>
      </div>

      {/* Feed */}
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {!authChecked && (
          <>
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-[#e8ecf0] overflow-hidden animate-pulse">
                <div className="bg-[#f1f5f9] aspect-[4/3] w-full" />
                <div className="p-5 space-y-3">
                  <div className="flex gap-2">
                    <div className="h-5 w-20 bg-[#f1f5f9] rounded-full" />
                    <div className="h-5 w-16 bg-[#f1f5f9] rounded-full" />
                  </div>
                  <div className="h-3 w-24 bg-[#f1f5f9] rounded" />
                  <div className="h-4 w-full bg-[#f1f5f9] rounded" />
                  <div className="h-4 w-3/4 bg-[#f1f5f9] rounded" />
                </div>
              </div>
            ))}
          </>
        )}

        {authChecked && filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="text-[#6b7280] text-sm">No leads match your filters.</p>
            <button
              onClick={() => { setFilterTrade(''); setFilterBudget(''); setFilterCity('') }}
              className="mt-3 text-[#143A75] text-sm underline"
            >
              Clear filters
            </button>
          </div>
        )}

        {authChecked && filtered.map(post => (
          <LeadCard
            key={post.id}
            post={post}
            onClaim={handleClaim}
            unlocking={unlocking}
            unlockedData={unlockedLeads[post.id]}
          />
        ))}
      </div>
    </div>
  )
}
