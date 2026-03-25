import Link from 'next/link'
import { CheckCircle, ArrowRight, Zap, MapPin, DollarSign, Star } from 'lucide-react'

export default function ContractorsPage() {
  return (
    <div className="min-h-screen bg-white">

      {/* Hero */}
      <section className="py-20 px-4 bg-[#0f172a]">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 text-blue-300 text-sm font-semibold mb-6">
            <Zap size={14} strokeWidth={2.5} />
            For Ontario Contractors
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold text-white leading-[1.1] mb-6">
            Stop chasing jobs.
            <br />
            <span className="text-[#60a5fa]">Let them come to you.</span>
          </h1>
          <p className="text-slate-400 text-xl max-w-xl mx-auto mb-10 leading-relaxed">
            Browse real homeowner leads and active building permits across Ontario. Pay only for what you claim.
          </p>
          <Link
            href="/leads"
            className="inline-flex items-center justify-center gap-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold px-8 py-4 rounded-xl text-base shadow-md hover:shadow-lg"
          >
            Browse Live Leads
            <ArrowRight size={18} strokeWidth={2} />
          </Link>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-[#f8fafc] border-b border-[#e2e8f0] py-6 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-6 text-center">
          {[
            { value: '1,100+', label: 'Active leads' },
            { value: '12', label: 'Cities covered' },
            { value: '$25–$85', label: 'Per permit claim' },
          ].map(({ value, label }) => (
            <div key={label}>
              <p className="text-2xl font-bold text-[#0f172a]">{value}</p>
              <p className="text-sm text-[#6b7280] font-medium">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#0f172a] mb-3">How It Works</h2>
            <p className="text-[#6b7280] max-w-lg mx-auto">Simple, transparent, and built for busy contractors.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { step: '1', title: 'Set Up Your Account', desc: 'Enter your trade and service area. Takes 2 minutes.', color: '#EFF6FF', text: '#1d4ed8' },
              { step: '2', title: 'Browse Live Leads', desc: 'See homeowner jobs and building permits in your area, sorted by your trade.', color: '#f0fdf4', text: '#16a34a' },
              { step: '3', title: 'Claim & Get Paid', desc: "Pay only for leads you want. Get full contact info instantly.", color: '#fef9c3', text: '#92400e' },
            ].map(({ step, title, desc, color, text }) => (
              <div key={step} className="bg-white border border-[#e2e8f0] rounded-2xl p-7 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-5" style={{ backgroundColor: color }}>
                  <span className="font-bold text-sm" style={{ color: text }}>{step}</span>
                </div>
                <h3 className="text-[#0f172a] font-semibold text-base mb-2">{title}</h3>
                <p className="text-[#6b7280] text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sample lead card preview */}
      <section className="py-20 px-4 bg-[#f8fafc] border-y border-[#e2e8f0]">
        <div className="max-w-2xl mx-auto text-center mb-10">
          <h2 className="text-3xl font-bold text-[#0f172a] mb-3">What a lead looks like</h2>
          <p className="text-[#6b7280]">Real permit data. Real homeowners. Real jobs.</p>
        </div>
        <div className="max-w-lg mx-auto bg-white border border-[#2563eb] rounded-2xl p-6 shadow-md">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="bg-[#EFF6FF] text-[#1d4ed8] text-xs font-semibold px-2.5 py-1 rounded-full">Carpentry</span>
            <span className="bg-[#fef9c3] text-[#854d0e] text-xs font-semibold px-2.5 py-1 rounded-full">⚡ Fill-In Ready</span>
            <span className="bg-[#f0fdf4] text-[#16a34a] text-xs font-medium px-2.5 py-1 rounded-full">📋 Building Permit</span>
            <span className="text-[#6b7280] text-xs">Burlington</span>
          </div>
          <p className="text-[#374151] text-sm mb-2">New Attached Deck — residential property</p>
          <p className="text-[#9ca3af] text-xs mb-4">Est. value: $100,000 · Issued 2026-03-18</p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#9ca3af]">Address hidden until claimed</span>
            <button className="bg-[#d97706] text-white text-sm font-semibold px-4 py-2 rounded-lg">
              Claim — $85
            </button>
          </div>
        </div>
      </section>

      {/* Why JobDeck */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#0f172a] mb-3">Why contractors choose JobDeck</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {[
              'Only pay for leads you want — no wasted spend',
              'Leads matched to your trade and service area',
              'Real homeowners actively looking for help',
              'Building permits = jobs before anyone else knows',
              'No subscription, no monthly fees',
              'Cancel or pause anytime',
            ].map(f => (
              <div key={f} className="flex items-start gap-3 bg-[#f8fafc] rounded-xl p-4 border border-[#e2e8f0]">
                <CheckCircle size={18} strokeWidth={2} className="text-[#22c55e] shrink-0 mt-0.5" />
                <span className="text-sm text-[#374151] font-medium">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4 bg-[#f8fafc] border-t border-[#e2e8f0]">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-[#0f172a] text-center mb-10">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              { q: 'How are leads matched to me?', a: 'We match leads based on your trade type and the Ontario postal codes you serve. You only see leads that are relevant to your business.' },
              { q: 'How do I claim a lead?', a: "Browse the Live Leads page, find a job you want, and click Claim. You'll get the homeowner's full contact info — or the permit address — right away." },
              { q: 'What do I need to get started?', a: 'Just your name, email, trade, and service area. You can browse live leads immediately after signing up.' },
              { q: 'How is this different from HomeStars?', a: "HomeStars charges monthly. We're pay-per-lead — you only pay when you see something you want. No wasted budget." },
            ].map(({ q, a }) => (
              <div key={q} className="bg-white border border-[#e2e8f0] rounded-2xl p-6 shadow-sm">
                <h3 className="text-[#0f172a] font-semibold mb-2">{q}</h3>
                <p className="text-[#6b7280] text-sm leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-[#0f172a]">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to grow your business?</h2>
          <p className="text-slate-400 mb-8">Join contractors across Ontario already using JobDeck.</p>
          <Link
            href="/leads"
            className="inline-flex items-center gap-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold px-8 py-4 rounded-xl text-base shadow-md hover:shadow-lg"
          >
            Browse Live Leads
            <ArrowRight size={18} strokeWidth={2} />
          </Link>
        </div>
      </section>
    </div>
  )
}
