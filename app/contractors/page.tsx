import Link from 'next/link'
import { CheckCircle, ArrowRight } from 'lucide-react'

export default function ContractorsPage() {
  return (
    <div className="min-h-screen bg-white">

      {/* Hero */}
      <section className="py-20 px-4 bg-[#0f172a] text-center">
        <div className="max-w-3xl mx-auto">
          <p className="text-blue-300 text-sm font-semibold uppercase tracking-widest mb-5">For Ontario Contractors</p>
          <h1 className="text-5xl sm:text-6xl font-bold text-white leading-[1.1] mb-6">
            Find homeowners starting renovations<br />
            <span className="text-[#60a5fa]">before anyone else calls them.</span>
          </h1>
          <p className="text-slate-400 text-xl max-w-xl mx-auto mb-10">
            We pull active building permit data across Ontario. Every record is a real renovation project — with the address and project details from public city records.
          </p>
          <Link
            href="/contractors/batch"
            className="inline-flex items-center gap-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold px-10 py-5 rounded-xl text-lg shadow-lg hover:shadow-xl"
          >
            Get 20–25 Renovation Opportunities
            <ArrowRight size={20} strokeWidth={2.5} />
          </Link>
          <p className="text-slate-500 text-sm mt-4">$40 one-time · Instant CSV download · No subscription</p>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#0f172a] mb-3">How it works</h2>
            <p className="text-[#6b7280]">Simple. You pick your city, we hand you the addresses.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
            {[
              { n: '1', title: 'Pick your city & trade', desc: 'Select the area and trade type you work in.' },
              { n: '2', title: 'We find the permits', desc: 'We pull the latest issued renovation permits from city records.' },
              { n: '3', title: 'You get the addresses', desc: 'Download a CSV with addresses, permit type, and project value.' },
              { n: '4', title: 'You reach out first', desc: 'Show up before any other contractor has called.' },
            ].map(({ n, title, desc }) => (
              <div key={n} className="text-center">
                <div className="w-10 h-10 bg-[#EFF6FF] rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-[#2563eb] font-bold">{n}</span>
                </div>
                <h3 className="font-semibold text-[#0f172a] text-sm mb-2">{title}</h3>
                <p className="text-[#6b7280] text-xs leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who this is for */}
      <section className="py-20 px-4 bg-[#f8fafc] border-y border-[#e2e8f0]">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-[#0f172a] mb-3">Who this is for</h2>
            <p className="text-[#6b7280]">This works best for contractors who are willing to make first contact.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
            {[
              'Roofing & exterior contractors',
              'Window & door companies',
              'General contractors & renovators',
              'Painters, flooring & drywall',
              'HVAC & mechanical',
              'Anyone doing door knocking or direct mail',
            ].map(item => (
              <div key={item} className="flex items-center gap-3 bg-white rounded-xl p-4 border border-[#e2e8f0]">
                <CheckCircle size={16} strokeWidth={2} className="text-[#22c55e] shrink-0" />
                <span className="text-sm font-medium text-[#374151]">{item}</span>
              </div>
            ))}
          </div>
          <div className="bg-white border border-[#e2e8f0] rounded-xl p-5 text-sm text-[#6b7280]">
            <span className="font-semibold text-[#374151]">Not the right fit: </span>
            If you only work from referrals and aren't open to reaching out first, this won't work for you. Permit data requires you to make first contact.
          </div>
        </div>
      </section>

      {/* How contractors use this */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#0f172a] mb-3">How contractors use this data</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                emoji: '🚪',
                title: 'Door knock',
                desc: 'Show up at the address and introduce yourself. You\'re the first contractor they\'ve talked to about this job — no competition yet.',
              },
              {
                emoji: '📬',
                title: 'Drop a flyer',
                desc: 'Leave something in the mailbox. Hit the surrounding homes too — permits tend to cluster in active renovation neighbourhoods.',
              },
              {
                emoji: '✉️',
                title: 'Send direct mail',
                desc: 'Mail a letter directly to the address. Physical mail isn\'t covered by spam laws and gets read. A professional letter stands out.',
              },
            ].map(({ emoji, title, desc }) => (
              <div key={title} className="bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl p-7">
                <div className="text-3xl mb-4">{emoji}</div>
                <h3 className="font-bold text-[#0f172a] mb-2">{title}</h3>
                <p className="text-[#6b7280] text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Offer + risk reversal */}
      <section className="py-20 px-4 bg-[#0f172a]">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Try a small batch. See for yourself.</h2>
          <p className="text-slate-400 mb-3 text-lg">
            Get 20–25 active renovation permits in your city for $40. If you reach out and don't get any traction, we'll refund you.
          </p>
          <p className="text-slate-500 text-sm mb-8">No subscription. No monthly fees. Just one simple test.</p>
          <Link
            href="/contractors/batch"
            className="inline-flex items-center gap-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold px-10 py-5 rounded-xl text-lg shadow-lg hover:shadow-xl"
          >
            Get 20–25 Opportunities — $40
            <ArrowRight size={20} strokeWidth={2.5} />
          </Link>
        </div>
      </section>

      {/* Secondary — browse & claim */}
      <section className="py-12 px-4 bg-white border-t border-[#e2e8f0]">
        <div className="max-w-xl mx-auto text-center">
          <p className="text-[#6b7280] text-sm mb-3">Prefer to browse permits one by one?</p>
          <Link
            href="/leads"
            className="inline-flex items-center gap-2 text-[#2563eb] font-semibold text-sm hover:underline"
          >
            Browse individual permits ($25–$85 each)
            <ArrowRight size={14} strokeWidth={2} />
          </Link>
        </div>
      </section>

    </div>
  )
}
