'use client'

import { useState, useEffect } from 'react'
import { MapPin, Building2, ArrowRight, CheckCircle } from 'lucide-react'

const CITIES = ['Toronto', 'Mississauga', 'Brampton', 'Burlington']

const TRADES = [
  { value: 'all', label: 'All Trades' },
  { value: 'General Contractor', label: 'General Contractor' },
  { value: 'Carpentry', label: 'Carpentry / Decking' },
  { value: 'Roofer', label: 'Roofing' },
  { value: 'HVAC', label: 'HVAC' },
  { value: 'Plumber', label: 'Plumbing' },
  { value: 'Electrician', label: 'Electrical' },
]

const inputClass = 'w-full bg-white border border-[#e2e8f0] rounded-xl px-4 py-3 text-[#0f172a] placeholder-[#9ca3af] focus:outline-none focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb] transition-colors text-sm'

export default function BatchPage() {
  const [city, setCity] = useState('')
  const [trade, setTrade] = useState('all')
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!city || !email || !name) { setError('Please fill in all fields'); return }
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/permits/batch-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ city, trade, email, name }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else setError(data.error || 'Something went wrong')
    } catch {
      setError('Something went wrong. Please try again.')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Hero */}
      <section className="bg-[#0f172a] py-16 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 text-blue-300 text-sm font-semibold mb-6">
            <Building2 size={14} strokeWidth={2.5} />
            Permit-Based Prospecting Data
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white leading-[1.1] mb-5">
            Know which homes are about to spend money.<br />
            <span className="text-[#60a5fa]">Before your competitors do.</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Get 20–30 active renovation opportunities in your city. Addresses, permit details, and estimated project values — delivered instantly as a CSV.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="py-12 px-4 bg-white border-b border-[#e2e8f0]">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 text-center">
            {[
              { n: '1', title: 'We track permits', desc: 'New building permits filed with Ontario municipalities' },
              { n: '2', title: 'We filter residential', desc: 'Only active renovation and construction projects' },
              { n: '3', title: 'You get addresses', desc: 'Homes confirmed to be spending money on renovations' },
              { n: '4', title: 'You reach out first', desc: 'Door knock, drop a flyer, or send direct mail' },
            ].map(({ n, title, desc }) => (
              <div key={n} className="flex flex-col items-center">
                <div className="w-9 h-9 bg-[#EFF6FF] rounded-full flex items-center justify-center mb-3">
                  <span className="text-[#2563eb] font-bold text-sm">{n}</span>
                </div>
                <p className="font-semibold text-[#0f172a] text-sm mb-1">{title}</p>
                <p className="text-[#6b7280] text-xs leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main form + info */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">

          {/* Left — form */}
          <div className="bg-white border border-[#e2e8f0] rounded-2xl p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-[#0f172a] mb-2">Get your batch</h2>
            <p className="text-[#6b7280] text-sm mb-6">Select your city and trade. We'll send you up to 30 active permits instantly after checkout.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-1.5">Your Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Kevin Smith"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#374151] mb-1.5">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="kevin@smithroofing.ca"
                  className={inputClass}
                />
                <p className="text-[#9ca3af] text-xs mt-1">Your CSV download link will be on the confirmation page.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#374151] mb-1.5">
                  <MapPin size={13} className="inline mr-1" />
                  City
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
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-[#2563eb] hover:bg-[#1d4ed8] disabled:opacity-60 text-white font-semibold py-4 rounded-xl text-base shadow-md mt-2"
              >
                {loading ? 'Redirecting...' : 'Get 20–30 Opportunities — $99'}
                {!loading && <ArrowRight size={18} strokeWidth={2} />}
              </button>

              <p className="text-[#9ca3af] text-xs text-center">
                One-time payment. Instant CSV download. No subscription.
              </p>
            </form>
          </div>

          {/* Right — value props */}
          <div className="space-y-5">
            <div className="bg-white border border-[#e2e8f0] rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-[#0f172a] mb-4">What's included in each record</h3>
              <div className="space-y-2">
                {[
                  'Full civic address',
                  'Permit type (deck, renovation, addition, etc.)',
                  'Estimated project value',
                  'Date permit was issued',
                  'Fast vs. long-term project signal',
                ].map(item => (
                  <div key={item} className="flex items-center gap-2">
                    <CheckCircle size={15} strokeWidth={2} className="text-[#22c55e] shrink-0" />
                    <span className="text-sm text-[#374151]">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-[#e2e8f0] rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-[#0f172a] mb-4">Who this is for</h3>
              <div className="space-y-2">
                {[
                  'Roofing & exterior contractors',
                  'Window & door companies',
                  'Renovation & general contractors',
                  'Painters, flooring, drywall',
                  'Anyone doing door knocking or direct mail',
                ].map(item => (
                  <div key={item} className="flex items-center gap-2">
                    <CheckCircle size={15} strokeWidth={2} className="text-[#22c55e] shrink-0" />
                    <span className="text-sm text-[#374151]">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#0f172a] rounded-2xl p-6 text-white">
              <p className="text-sm font-semibold text-blue-300 mb-2">Not for you if...</p>
              <p className="text-slate-400 text-sm leading-relaxed">
                You rely purely on referrals or inbound calls and aren't interested in proactive outreach. This data requires you to make first contact — door knocking, flyers, or direct mail.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
