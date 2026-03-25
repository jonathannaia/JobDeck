import Link from 'next/link'
import { CheckCircle, ArrowRight, Zap, Building2, Star } from 'lucide-react'

export default function ContractorsPage() {
  return (
    <div className="min-h-screen bg-white">

      {/* Hero */}
      <section className="py-20 px-4 bg-[#0f172a]">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 text-blue-300 text-sm font-semibold mb-6">
            <Building2 size={14} strokeWidth={2.5} />
            For Ontario Contractors
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold text-white leading-[1.1] mb-6">
            Find homeowners starting renovations<br />
            <span className="text-[#60a5fa]">before your competitors do.</span>
          </h1>
          <p className="text-slate-400 text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            We track active building permits across Ontario. Every record is a confirmed renovation — with the address, permit type, and estimated project value.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contractors/batch"
              className="inline-flex items-center justify-center gap-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold px-8 py-4 rounded-xl text-base shadow-md hover:shadow-lg"
            >
              Get a Batch of Opportunities
              <ArrowRight size={18} strokeWidth={2} />
            </Link>
            <Link
              href="/leads"
              className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-8 py-4 rounded-xl text-base border border-white/20"
            >
              Browse Individual Permits
            </Link>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-[#f8fafc] border-b border-[#e2e8f0] py-6 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-6 text-center">
          {[
            { value: '1,100+', label: 'Active permits' },
            { value: '4', label: 'Cities covered' },
            { value: '$99', label: 'Per batch of 30' },
          ].map(({ value, label }) => (
            <div key={label}>
              <p className="text-2xl font-bold text-[#0f172a]">{value}</p>
              <p className="text-sm text-[#6b7280] font-medium">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Two options */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#0f172a] mb-3">Two ways to access permit data</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

            {/* Option 1 — Batch */}
            <div className="bg-[#0f172a] rounded-2xl p-8 text-white relative overflow-hidden">
              <div className="inline-flex items-center gap-1.5 bg-[#2563eb] rounded-full px-3 py-1 text-xs font-semibold mb-4">
                ⭐ Most Popular
              </div>
              <h3 className="text-xl font-bold mb-3">Batch Purchase</h3>
              <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                Pick a city and trade. Get 20–30 active renovation permits delivered as a CSV instantly. Best for contractors who want to hit the ground running.
              </p>
              <div className="text-3xl font-bold mb-6">$99 <span className="text-slate-400 text-base font-normal">/ batch</span></div>
              <Link
                href="/contractors/batch"
                className="flex items-center justify-center gap-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold px-6 py-3 rounded-xl text-sm"
              >
                Get a Batch
                <ArrowRight size={16} strokeWidth={2} />
              </Link>
            </div>

            {/* Option 2 — Browse */}
            <div className="bg-white border-2 border-[#e2e8f0] rounded-2xl p-8">
              <div className="inline-flex items-center gap-1.5 bg-[#f1f5f9] rounded-full px-3 py-1 text-xs font-semibold text-[#6b7280] mb-4">
                More Control
              </div>
              <h3 className="text-xl font-bold text-[#0f172a] mb-3">Browse & Claim</h3>
              <p className="text-[#6b7280] text-sm mb-6 leading-relaxed">
                Browse the full permit feed filtered by city and trade. Claim only the specific permits you want. Pay per permit ($25–$85 based on project value).
              </p>
              <div className="text-3xl font-bold text-[#0f172a] mb-6">$25–$85 <span className="text-[#6b7280] text-base font-normal">/ permit</span></div>
              <Link
                href="/leads"
                className="flex items-center justify-center gap-2 bg-white border-2 border-[#2563eb] text-[#2563eb] hover:bg-[#EFF6FF] font-semibold px-6 py-3 rounded-xl text-sm"
              >
                Browse Permits
                <ArrowRight size={16} strokeWidth={2} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Who this is for */}
      <section className="py-20 px-4 bg-[#f8fafc] border-y border-[#e2e8f0]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#0f172a] mb-3">Who this is for</h2>
            <p className="text-[#6b7280] max-w-lg mx-auto">This works best for contractors who already do proactive outreach.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {[
              'Roofing & exterior contractors',
              'Window & door companies',
              'General contractors & renovators',
              'Painters, flooring & drywall',
              'HVAC & mechanical contractors',
              'Anyone doing door knocking or direct mail',
            ].map(f => (
              <div key={f} className="flex items-center gap-3 bg-white rounded-xl p-4 border border-[#e2e8f0]">
                <CheckCircle size={16} strokeWidth={2} className="text-[#22c55e] shrink-0" />
                <span className="text-sm text-[#374151] font-medium">{f}</span>
              </div>
            ))}
          </div>
          <div className="max-w-2xl mx-auto mt-6 bg-white border border-[#e2e8f0] rounded-xl p-5">
            <p className="text-sm text-[#6b7280]">
              <span className="font-semibold text-[#374151]">Not the right fit:</span> If you rely purely on referrals or inbound calls and aren't open to proactive outreach, this data won't be useful. Permit data requires you to make first contact.
            </p>
          </div>
        </div>
      </section>

      {/* How contractors use this */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#0f172a] mb-3">How to turn permit data into jobs</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { title: 'Door knock', desc: 'Show up at the address and introduce yourself. You\'re the first contractor they\'ve spoken to about this specific job.', color: '#EFF6FF', text: '#1d4ed8' },
              { title: 'Drop a flyer', desc: 'Leave a professional flyer in the mailbox. Hit surrounding homes in the same neighbourhood too — permits cluster.', color: '#f0fdf4', text: '#16a34a' },
              { title: 'Send direct mail', desc: 'Mail a letter to the address. Physical mail isn\'t covered by spam laws and has high open rates.', color: '#fef9c3', text: '#92400e' },
            ].map(({ title, desc, color, text }) => (
              <div key={title} className="bg-white border border-[#e2e8f0] rounded-2xl p-7 shadow-sm">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: color }}>
                  <span className="text-lg" style={{ color: text }}>→</span>
                </div>
                <h3 className="font-semibold text-[#0f172a] mb-2">{title}</h3>
                <p className="text-[#6b7280] text-sm leading-relaxed">{desc}</p>
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
              { q: 'Does the data include homeowner contact info?', a: 'No. Building permits are public records but Ontario privacy laws protect personal contact information. What you get is the civic address, permit type, and estimated project value — enough to show up in person or send mail.' },
              { q: 'How current is the permit data?', a: 'Permits are pulled directly from municipal open data portals and updated regularly. Most records are issued within the last 30–60 days.' },
              { q: 'What cities are available?', a: 'Currently: Toronto, Mississauga, Brampton, and Burlington. More cities coming soon.' },
              { q: 'How is this different from HomeStars?', a: 'HomeStars sells inbound leads from homeowners actively searching. We sell permit-based opportunity data — homeowners who have committed to a renovation but haven\'t hired anyone yet. You reach them before they\'ve even posted anywhere.' },
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
          <h2 className="text-3xl font-bold text-white mb-4">Ready to find your next job?</h2>
          <p className="text-slate-400 mb-8">Get 20–30 active renovation opportunities in your city for $99.</p>
          <Link
            href="/contractors/batch"
            className="inline-flex items-center gap-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold px-8 py-4 rounded-xl text-base shadow-md hover:shadow-lg"
          >
            Get a Batch — $99
            <ArrowRight size={18} strokeWidth={2} />
          </Link>
        </div>
      </section>
    </div>
  )
}
