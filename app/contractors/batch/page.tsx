'use client'

import { useState } from 'react'
import { MapPin, ArrowRight, CheckCircle } from 'lucide-react'

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
        <div className="max-w-2xl mx-auto">
          <p className="text-blue-300 text-sm font-semibold uppercase tracking-widest mb-5">For Ontario Contractors</p>
          <h1 className="text-4xl sm:text-5xl font-bold text-white leading-[1.1] mb-5">
            Get 20–25 homes starting renovations in your area
          </h1>
          <p className="text-slate-400 text-lg mb-3">
            Active building permits — filtered by city and trade. Perfect for door knocking, flyers, or direct mail.
          </p>
          <p className="text-2xl font-bold text-white">$40 <span className="text-slate-400 text-base font-normal">· one-time · instant CSV</span></p>
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
          <div className="bg-white border border-[#e2e8f0] rounded-2xl p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-[#0f172a] mb-1">Get my batch</h2>
            <p className="text-[#6b7280] text-sm mb-1">Pick your city and trade. We'll pull up to 25 active renovation permits and deliver them as a CSV right after checkout.</p>
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
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-[#2563eb] hover:bg-[#1d4ed8] disabled:opacity-60 text-white font-bold py-4 rounded-xl text-base shadow-md mt-2"
              >
                {loading ? 'Redirecting...' : 'Get My Batch — $40'}
                {!loading && <ArrowRight size={18} strokeWidth={2.5} />}
              </button>

              <p className="text-center text-xs text-[#6b7280]">
                One-time payment. No subscription. Instant download.
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

          <p className="text-center text-xs text-[#9ca3af] mt-6">
            Prefer to choose permits one by one?{' '}
            <a href="/leads" className="text-[#2563eb] hover:underline">Browse individual permits →</a>
          </p>
        </div>
      </section>
    </div>
  )
}
