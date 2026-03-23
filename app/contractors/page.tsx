import Link from 'next/link'

const STARTER_FEATURES = [
  '15 matched leads per month',
  'SMS delivery — 30 min after Pro',
  'Leads matched by trade & service area',
  'Monthly lead credit reset',
  'Access to contractor dashboard',
]

const PRO_FEATURES = [
  'Unlimited matched leads',
  'Instant SMS delivery — first to know',
  'Priority lead access before Starter',
  'Leads matched by trade & service area',
  'Access to contractor dashboard',
  'Cancel anytime',
]

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
          <p className="text-[#6b7280] text-lg max-w-xl mx-auto">
            Get matched with homeowners in your area the moment they post a job.
            Choose a plan and start receiving leads today.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4 bg-[#f8fafc] border-y border-[#e2e8f0]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-[#0f172a] text-center mb-10">How It Works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { step: '1', title: 'Choose a Plan', desc: 'Pick Starter or Pro based on how many leads you want per month.' },
              { step: '2', title: 'Set Your Trade & Area', desc: 'Tell us what you do and which Ontario postal codes you serve.' },
              { step: '3', title: 'Get Leads via SMS', desc: 'When a homeowner submits a matching job, you get a text immediately.' },
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

      {/* Pricing */}
      <section id="pricing" className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-[#0f172a] text-center mb-2">Simple, Transparent Pricing</h2>
          <p className="text-[#6b7280] text-center mb-2">No setup fees. No contracts. Cancel anytime.</p>
          <div className="flex justify-center mb-12">
            <span className="inline-flex items-center gap-1.5 bg-[#dcfce7] text-[#16a34a] text-sm font-medium px-4 py-1.5 rounded-full">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              7-day free trial — no charge until day 8
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Starter */}
            <div className="bg-white border border-[#e2e8f0] rounded-xl p-8 flex flex-col">
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[#374151] text-sm font-medium uppercase tracking-wide">Starter</span>
                  <span className="bg-[#EFF6FF] text-[#1d4ed8] text-xs font-medium px-2 py-0.5 rounded-full">
                    Founding Member Rate
                  </span>
                </div>
                <div className="flex items-end gap-2 mb-1">
                  <span className="text-4xl font-bold text-[#0f172a]">$99</span>
                  <span className="text-[#6b7280] pb-1">/month</span>
                  <span className="text-[#9ca3af] line-through text-lg pb-1">$149</span>
                </div>
                <p className="text-[#6b7280] text-sm">Great for contractors just getting started</p>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {STARTER_FEATURES.map(f => (
                  <li key={f} className="flex items-start gap-3 text-sm text-[#374151]">
                    <CheckIcon />
                    {f}
                  </li>
                ))}
              </ul>

              <Link href="/contractors/signup?plan=starter" className="w-full bg-white border border-[#e2e8f0] hover:border-[#94a3b8] text-[#374151] font-medium py-3 rounded-lg transition-colors text-center text-sm block">
                Start Free Trial — then $99/mo
              </Link>
            </div>

            {/* Pro */}
            <div className="bg-white border-2 border-[#2563eb] rounded-xl p-8 flex flex-col relative">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <span className="bg-[#2563eb] text-white text-xs font-medium px-3 py-1 rounded-full">
                  Most Popular
                </span>
              </div>

              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[#2563eb] text-sm font-medium uppercase tracking-wide">Pro</span>
                  <span className="bg-[#EFF6FF] text-[#1d4ed8] text-xs font-medium px-2 py-0.5 rounded-full">
                    Founding Member Rate
                  </span>
                </div>
                <div className="flex items-end gap-2 mb-1">
                  <span className="text-4xl font-bold text-[#0f172a]">$199</span>
                  <span className="text-[#6b7280] pb-1">/month</span>
                  <span className="text-[#9ca3af] line-through text-lg pb-1">$299</span>
                </div>
                <p className="text-[#6b7280] text-sm">For serious contractors who want every lead</p>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {PRO_FEATURES.map(f => (
                  <li key={f} className="flex items-start gap-3 text-sm text-[#374151]">
                    <CheckIcon />
                    {f}
                  </li>
                ))}
              </ul>

              <Link href="/contractors/signup?plan=pro" className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-medium py-3 rounded-lg transition-colors text-center text-sm block">
                Start Free Trial — then $199/mo
              </Link>
            </div>

            {/* Pay Per Lead */}
            <div className="bg-white border border-[#e2e8f0] rounded-xl p-8 flex flex-col">
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[#374151] text-sm font-medium uppercase tracking-wide">Pay Per Lead</span>
                </div>
                <div className="flex items-end gap-2 mb-1">
                  <span className="text-4xl font-bold text-[#0f172a]">$40</span>
                  <span className="text-[#6b7280] pb-1">/lead</span>
                </div>
                <p className="text-[#6b7280] text-sm">No subscription — pay only for leads you want</p>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {['Browse live homeowner leads', 'Unlock any lead for $40', 'Card saved securely via Stripe', 'No monthly commitment', 'Access to contractor dashboard'].map(f => (
                  <li key={f} className="flex items-start gap-3 text-sm text-[#374151]">
                    <CheckIcon />
                    {f}
                  </li>
                ))}
              </ul>

              <Link href="/contractors/signup?plan=pay_per_lead" className="w-full bg-white border border-[#e2e8f0] hover:border-[#94a3b8] text-[#374151] font-medium py-3 rounded-lg transition-colors text-center text-sm block">
                Get Started — $40/lead
              </Link>
            </div>
          </div>

          <p className="text-center text-[#6b7280] text-sm mt-6">
            🔒 7-day free trial on monthly plans. Lock in this rate forever. First 25 contractors only.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-4 bg-[#f8fafc] border-t border-[#e2e8f0]">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-[#0f172a] text-center mb-10">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              { q: 'How are leads matched to me?', a: 'We match leads based on your trade type and the Ontario postal codes you serve. You only receive leads that are relevant to your business.' },
              { q: "What's the difference between Starter and Pro?", a: 'Pro contractors receive leads instantly and are notified first. Starter contractors receive the same leads 30 minutes later. Pro also has no monthly cap, while Starter is limited to 15 leads per month.' },
              { q: 'Can I upgrade from Starter to Pro?', a: 'Yes — you can upgrade at any time from your dashboard. The change takes effect immediately.' },
              { q: 'What happens if I hit my Starter lead limit?', a: "Once you've received 15 leads in a calendar month, you won't receive additional leads until the 1st of the next month when credits reset." },
              { q: 'How do I receive leads?', a: 'Leads are delivered via SMS to the phone number on your account. Each message includes the job type, postal code, description snippet, and a link to your dashboard.' },
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
          <p className="text-[#6b7280] mb-8">Join contractors across Ontario getting leads delivered straight to their phone.</p>
          <Link href="#pricing" className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-medium px-8 py-3.5 rounded-lg transition-colors inline-block">
            View Plans
          </Link>
        </div>
      </section>
    </div>
  )
}
