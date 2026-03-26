'use client'

import { useState, useEffect } from 'react'
import { MapPin, ArrowRight, CheckCircle, Zap } from 'lucide-react'

const CITIES = ['Toronto', 'Mississauga', 'Brampton', 'Burlington', 'Hamilton', 'Oakville', 'St. Catharines', 'Sudbury']

const TRADES = [
  { value: 'all', label: 'All Trades' },
  { value: 'General Contractor', label: 'General Contractor' },
  { value: 'Carpenter', label: 'Carpentry / Renovation' },
  { value: 'Flooring & Tiling', label: 'Flooring & Tiling' },
  { value: 'Drywall & Taping', label: 'Drywall & Taping' },
  { value: 'Kitchen & Bath Renovation', label: 'Kitchen & Bath Renovation' },
  { value: 'Painter', label: 'Painting / Decorating' },
  { value: 'Roofer', label: 'Roofing' },
  { value: 'HVAC', label: 'HVAC' },
  { value: 'Plumber', label: 'Plumbing' },
  { value: 'Electrician', label: 'Electrical' },
  { value: 'Landscaping & Interlock', label: 'Landscaping & Interlock' },
]

const inputClass = 'w-full bg-white border border-[#e2e8f0] rounded-xl px-4 py-3 text-[#0f172a] placeholder-[#9ca3af] focus:outline-none focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb] transition-colors text-sm'

export default function BatchPage() {
  const [plan, setPlan] = useState<'batch' | 'weekly_partner'>('batch')
  const [city, setCity] = useState('')
  const [trade, setTrade] = useState('all')
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [previewCount, setPreviewCount] = useState<number | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)

  // Live permit count preview whenever city or trade changes
  useEffect(() => {
    if (!city) { setPreviewCount(null); return }
    setPreviewLoading(true)
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/permits/preview-count?city=${encodeURIComponent(city)}&trade=${encodeURIComponent(trade)}`)
        const data = await res.json()
        setPreviewCount(data.count ?? 0)
      } catch {
        setPreviewCount(null)
      } finally {
        setPreviewLoading(false)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [city, trade])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !name) { setError('Please fill in all fields'); return }
    if (plan === 'batch' && !city) { setError('Please select a city'); return }
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/permits/batch-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ city, trade, email, name, plan }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else setError(data.error || 'Something went wrong')
    } catch {
      setError('Something went wrong. Please try again.')
    }
    setLoading(false)
  }

  const tradeLabel = TRADES.find(t => t.value === trade)?.label ?? 'All Trades'

  return (
    <div className="min-h-screen bg-[#f8fafc]">

      {/* Hero */}
      <section className="bg-[#0f172a] py-16 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <p className="text-blue-300 text-sm font-semibold uppercase tracking-widest mb-5">For Ontario Contractors</p>
          <h1 className="text-4xl sm:text-5xl font-bold text-white leading-[1.1] mb-5">
            Get homes starting renovations in your area
          </h1>
          <p className="text-slate-400 text-lg">
            Active building permits — filtered by city and trade. Perfect for door knocking, flyers, or direct mail.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white border-b border-[#e2e8f0] py-10 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {[
            { n: '1', label: 'We track new permits in your area' },
            { n: '2', label: 'We filter for real residential projects' },
            { n: '3', label: 'You get a list of homes starting work' },
            { n: '4', label: 'You reach them before competitors' },
          ].map(({ n, label }) => (
            <div key={n}>
              <div className="w-9 h-9 bg-[#EFF6FF] rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-[#2563eb] font-bold text-sm">{n}</span>
              </div>
              <p className="text-sm text-[#374151] font-medium leading-snug">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Form */}
      <section className="py-14 px-4">
        <div className="max-w-lg mx-auto">

          {/* Browse one-by-one CTA — visible before plan selection */}
          <div className="bg-white border-2 border-[#e2e8f0] hover:border-[#2563eb] rounded-2xl p-5 mb-4 transition-colors">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-[#0f172a] text-sm">Prefer to pick permits one by one?</p>
                <p className="text-[#6b7280] text-xs mt-0.5">Browse the full list and claim individual permits. $10–$15 each.</p>
              </div>
              <a
                href="/leads"
                className="shrink-0 inline-flex items-center gap-1.5 bg-[#f8fafc] hover:bg-[#EFF6FF] border border-[#e2e8f0] text-[#2563eb] font-semibold text-sm px-4 py-2.5 rounded-xl transition-colors whitespace-nowrap"
              >
                Browse permits →
              </a>
            </div>
          </div>

          {/* Plan selector */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              type="button"
              onClick={() => setPlan('batch')}
              className={`rounded-2xl border-2 p-4 text-left transition-colors ${plan === 'batch' ? 'border-[#2563eb] bg-[#EFF6FF]' : 'border-[#e2e8f0] bg-white hover:border-[#93c5fd]'}`}
            >
              <p className="font-bold text-[#0f172a] text-base">$40</p>
              <p className="text-xs text-[#6b7280] mt-0.5">One-time · Complete Monthly City Batch</p>
              <p className="text-xs text-[#374151] mt-2 font-medium">Get every active residential permit issued in your city over the last 30 days.</p>
            </button>
            <button
              type="button"
              onClick={() => setPlan('weekly_partner')}
              className={`rounded-2xl border-2 p-4 text-left transition-colors relative ${plan === 'weekly_partner' ? 'border-[#2563eb] bg-[#EFF6FF]' : 'border-[#e2e8f0] bg-white hover:border-[#93c5fd]'}`}
            >
              <span className="absolute top-3 right-3 bg-[#2563eb] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">BEST VALUE</span>
              <p className="font-bold text-[#0f172a] text-base">$99<span className="text-sm font-normal text-[#6b7280]">/mo</span></p>
              <p className="text-xs text-[#6b7280] mt-0.5">Weekly Market Feed</p>
              <p className="text-xs text-[#374151] mt-2 font-medium">Every new permit in your service area delivered to your inbox every Monday morning.</p>
            </button>
          </div>

          {plan === 'weekly_partner' && (
            <div className="bg-[#f0fdf4] border border-[#86efac] rounded-xl px-4 py-3 mb-5 flex gap-2 items-start">
              <Zap size={15} className="text-[#16a34a] shrink-0 mt-0.5" />
              <p className="text-sm text-[#15803d]">
                <strong>Weekly Market Feed:</strong> Fresh permits hit your inbox every Monday — always current, never stale. Includes every new residential project from the past 7 days.
              </p>
            </div>
          )}

          <div className="bg-white border border-[#e2e8f0] rounded-2xl p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-[#0f172a] mb-1">
              {plan === 'weekly_partner' ? 'Become a Weekly Partner' : 'Get my batch'}
            </h2>
            <p className="text-[#6b7280] text-sm mb-1">
              {plan === 'weekly_partner'
                ? 'Set your city and trade. Every new permit in your service area lands in your inbox every Monday morning.'
                : "Pick your city and trade. We'll pull every active renovation permit from the last 30 days and deliver them as a CSV right after checkout."}
            </p>
            <p className="text-[#9ca3af] text-xs mb-6">You receive addresses and project details based on public permit records. JobDeck is a data provider, not a municipal authority.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-1.5">Your Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Kevin Smith" className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-1.5">Email Address</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="kevin@smithroofing.ca" className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-1.5">
                  <MapPin size={13} className="inline mr-1" />City
                </label>
                <select value={city} onChange={e => setCity(e.target.value)} className={`${inputClass} appearance-none`}>
                  <option value="" disabled>Select a city...</option>
                  {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-1.5">Trade</label>
                <select value={trade} onChange={e => setTrade(e.target.value)} className={`${inputClass} appearance-none`}>
                  {TRADES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>

                {/* Live permit preview */}
                {city && (
                  <div className="mt-2 h-5">
                    {previewLoading ? (
                      <p className="text-xs text-[#9ca3af]">Checking availability...</p>
                    ) : previewCount !== null ? (
                      <p className={`text-xs font-medium ${previewCount === 0 ? 'text-red-500' : 'text-[#16a34a]'}`}>
                        {previewCount === 0
                          ? `No active permits found in ${city} for ${tradeLabel} right now.`
                          : `✓ Found ${previewCount} active permit${previewCount !== 1 ? 's' : ''} in ${city} for ${tradeLabel} in the last 30 days`}
                      </p>
                    ) : null}
                  </div>
                )}
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <button
                type="submit"
                disabled={loading || (plan === 'batch' && previewCount === 0)}
                className="w-full flex items-center justify-center gap-2 bg-[#2563eb] hover:bg-[#1d4ed8] disabled:opacity-60 text-white font-bold py-4 rounded-xl text-base shadow-md mt-2"
              >
                {loading ? 'Redirecting...' : plan === 'weekly_partner' ? 'Subscribe — $99/mo' : 'Get My Batch — $40'}
                {!loading && <ArrowRight size={18} strokeWidth={2.5} />}
              </button>

              <p className="text-center text-xs text-[#6b7280]">
                {plan === 'weekly_partner' ? 'Recurring monthly subscription. Cancel anytime.' : 'One-time payment. No subscription. Instant download.'}
              </p>
              <p className="text-center text-xs text-[#22c55e] font-medium">
                ✓ If you don't get any traction, we'll refund you.
              </p>
            </form>
          </div>

          {/* What's included */}
          <div className="mt-6 bg-white border border-[#e2e8f0] rounded-2xl p-6">
            <h3 className="font-bold text-[#0f172a] mb-4 text-sm">What's included in each record</h3>
            <div className="space-y-2">
              {[
                'Full civic address',
                'Permit type (deck, renovation, addition, roofing, etc.)',
                'Estimated project value',
                'Date permit was issued',
              ].map(item => (
                <div key={item} className="flex items-center gap-2">
                  <CheckCircle size={14} strokeWidth={2} className="text-[#22c55e] shrink-0" />
                  <span className="text-sm text-[#374151]">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* How to use */}
          <div className="mt-4 bg-white border border-[#e2e8f0] rounded-2xl p-6">
            <h3 className="font-bold text-[#0f172a] mb-4 text-sm">How contractors use this</h3>
            <div className="space-y-3">
              {[
                { icon: '🚪', text: 'Knock doors where renovations just started' },
                { icon: '📬', text: 'Drop flyers in high-intent neighbourhoods' },
                { icon: '✉️', text: 'Send direct mail to the address' },
              ].map(({ icon, text }) => (
                <div key={text} className="flex items-center gap-3">
                  <span className="text-lg">{icon}</span>
                  <span className="text-sm text-[#374151]">{text}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>
    </div>
  )
}
