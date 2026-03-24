import Link from 'next/link'

function CheckIcon() {
  return (
    <div className="w-5 h-5 bg-[#dcfce7] rounded-full flex items-center justify-center shrink-0 mt-0.5">
      <svg className="w-3 h-3 text-[#16a34a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
      </svg>
    </div>
  )
}

export default function ContractorsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="py-20 px-4 text-center bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center bg-[#EFF6FF] rounded-full px-4 py-1.5 text-[#1d4ed8] text-sm font-medium mb-6">
            For Contractors
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-[#0f172a] leading-tight mb-4">
            Stop Chasing Jobs.
            <br />
            <span className="text-[#2563eb]">Let Them Come to You.</span>
          </h1>
          <p className="text-[#6b7280] text-lg max-w-xl mx-auto mb-8">
            Browse real jobs posted by Ontario homeowners. Claim the leads you want — only pay for what you use.
          </p>
          <Link
            href="/leads"
            className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-medium px-8 py-3.5 rounded-lg transition-colors inline-block"
          >
            Browse Live Leads
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4 bg-[#f8fafc] border-y border-[#e2e8f0]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-[#0f172a] text-center mb-10">How It Works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { step: '1', title: 'Set Up Your Account', desc: 'Enter your trade and service area so we know which leads to show you.' },
              { step: '2', title: 'Browse Live Leads', desc: 'See anonymized homeowner jobs posted in your area — trade type, location, and job details.' },
              { step: '3', title: 'Claim the Ones You Want', desc: "Only pay for leads you actually want. Claim a lead and get the homeowner's full contact info instantly." },
            ].map(({ step, title, desc }) => (
              <div key={step} className="bg-white border border-[#e2e8f0] rounded-xl p-6">
                <div className="w-9 h-9 bg-[#EFF6FF] rounded-full flex items-center justify-center mb-4">
                  <span className="text-[#2563eb] font-bold text-sm">{step}</span>
                </div>
                <h3 className="text-[#0f172a] font-medium mb-2">{title}</h3>
                <p className="text-[#6b7280] text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why JobDeck */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-[#0f172a] text-center mb-10">Why Contractors Choose JobDeck</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {[
              'Only pay for leads you want — no wasted spend',
              'Leads matched to your trade and service area',
              'Real homeowners actively looking for help',
              'Get the homeowner\'s name, phone, and full details',
              'No subscription, no monthly fees',
              'Cancel or pause anytime',
            ].map(f => (
              <div key={f} className="flex items-start gap-3">
                <CheckIcon />
                <span className="text-sm text-[#374151]">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-4 bg-[#f8fafc] border-t border-[#e2e8f0]">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-[#0f172a] text-center mb-10">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              { q: 'How are leads matched to me?', a: 'We match leads based on your trade type and the Ontario postal codes you serve. You only see leads that are relevant to your business.' },
              { q: 'How do I claim a lead?', a: 'Browse the Live Leads page, find a job you want, and click "Claim Lead". You\'ll get the homeowner\'s full contact info — name, phone number, and job details — right away.' },
              { q: 'What do I need to get started?', a: 'Just create an account with your name, email, trade, and service area. You\'ll be able to browse live leads immediately.' },
              { q: 'How do I receive leads?', a: 'You browse leads on the Live Leads page and choose which ones to claim. No automatic notifications — you\'re in full control.' },
            ].map(({ q, a }) => (
              <div key={q} className="bg-white border border-[#e2e8f0] rounded-xl p-6">
                <h3 className="text-[#0f172a] font-medium mb-2">{q}</h3>
                <p className="text-[#6b7280] text-sm">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-white border-t border-[#e2e8f0]">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-[#0f172a] mb-4">Ready to Grow Your Business?</h2>
          <p className="text-[#6b7280] mb-8">Join contractors across Ontario getting jobs from real homeowners.</p>
          <Link href="/leads" className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-medium px-8 py-3.5 rounded-lg transition-colors inline-block">
            Browse Live Leads
          </Link>
        </div>
      </section>
    </div>
  )
}
