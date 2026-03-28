import Link from 'next/link'
import { CheckCircle, ArrowRight, Phone, Mail, Star } from 'lucide-react'

export default function ContractorsPage() {
  return (
    <div className="min-h-screen bg-white">

      {/* Hero */}
      <section className="py-20 px-4 bg-[#0f172a] text-center">
        <div className="max-w-3xl mx-auto">
          <p className="text-blue-300 text-sm font-semibold uppercase tracking-widest mb-5">For Ontario Contractors</p>
          <h1 className="text-5xl sm:text-6xl font-bold text-white leading-[1.1] mb-6">
            Get homeowner leads<br />
            <span className="text-[#60a5fa]">ready to hire right now.</span>
          </h1>
          <p className="text-slate-400 text-xl max-w-xl mx-auto mb-10">
            Homeowners in your city post jobs directly on JobDeck. You see the job, claim the lead, and contact them first — no bidding wars, no middlemen.
          </p>
          <Link
            href="/leads"
            className="inline-flex items-center gap-2 bg-[#143A75] hover:bg-[#0e2d5c] text-white font-bold px-10 py-5 rounded-xl text-lg shadow-lg hover:shadow-xl"
          >
            Browse Open Leads
            <ArrowRight size={20} strokeWidth={2.5} />
          </Link>
          <p className="text-slate-500 text-sm mt-4">Contact info revealed instantly when you claim a lead</p>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#0f172a] mb-3">How it works</h2>
            <p className="text-[#6b7280]">A homeowner needs work done. You show up first.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
            {[
              { n: '1', title: 'Homeowner posts a job', desc: 'They describe the work, upload a photo, and set a budget — all in under 2 minutes.' },
              { n: '2', title: 'We match by trade & city', desc: 'You only see leads that match your trade and service area.' },
              { n: '3', title: 'You claim the lead', desc: 'Pay once to unlock their name, phone, and email. No one else gets that lead.' },
              { n: '4', title: 'You reach out directly', desc: 'Call or text them right away. First contractor to respond wins the job.' },
            ].map(({ n, title, desc }) => (
              <div key={n} className="text-center">
                <div className="w-10 h-10 bg-[#EFF6FF] rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-[#143A75] font-bold">{n}</span>
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
            <p className="text-[#6b7280]">Works for any trade that does residential work in Ontario.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
            {[
              'Roofers & exterior contractors',
              'Plumbers & HVAC technicians',
              'Electricians',
              'General contractors & renovators',
              'Painters, flooring & drywall',
              'Landscapers & deck builders',
            ].map(item => (
              <div key={item} className="flex items-center gap-3 bg-white rounded-xl p-4 border border-[#e2e8f0]">
                <CheckCircle size={16} strokeWidth={2} className="text-[#22c55e] shrink-0" />
                <span className="text-sm font-medium text-[#374151]">{item}</span>
              </div>
            ))}
          </div>
          <div className="bg-white border border-[#e2e8f0] rounded-xl p-5 text-sm text-[#6b7280]">
            <span className="font-semibold text-[#374151]">Not the right fit: </span>
            If you only work from referrals and don't want to be the one reaching out first, these leads may not suit your style.
          </div>
        </div>
      </section>

      {/* What you get when you claim */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#0f172a] mb-3">What you get when you claim a lead</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                icon: Phone,
                title: 'Phone number',
                desc: 'Call or text them directly. No waiting, no scheduler, no form to fill out on their end.',
              },
              {
                icon: Mail,
                title: 'Email address',
                desc: 'Send a quote by email. Give them something to reference and follow up on.',
              },
              {
                icon: Star,
                title: 'Full job details',
                desc: 'Their budget, timeline, full description, and any photos they uploaded — so you show up prepared.',
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl p-7">
                <div className="w-10 h-10 bg-[#EFF6FF] rounded-xl flex items-center justify-center mb-4">
                  <Icon size={18} className="text-[#143A75]" strokeWidth={2} />
                </div>
                <h3 className="font-bold text-[#0f172a] mb-2">{title}</h3>
                <p className="text-[#6b7280] text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-[#0f172a]">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Start claiming leads today.</h2>
          <p className="text-slate-400 mb-3 text-lg">
            Browse open homeowner jobs in your city. Claim the ones that fit. Pay only for what you take.
          </p>
          <p className="text-slate-500 text-sm mb-8">Pay only for the leads you claim.</p>
          <Link
            href="/leads"
            className="inline-flex items-center gap-2 bg-[#143A75] hover:bg-[#0e2d5c] text-white font-bold px-10 py-5 rounded-xl text-lg shadow-lg hover:shadow-xl"
          >
            Browse Open Leads
            <ArrowRight size={20} strokeWidth={2.5} />
          </Link>
        </div>
      </section>

    </div>
  )
}
