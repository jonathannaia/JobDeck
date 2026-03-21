import Link from 'next/link'
import CheckoutButton from '@/components/CheckoutButton'

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

export default function ContractorsPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="py-20 px-4 text-center bg-gradient-to-b from-[#0a1628] to-[#0f1f3d]">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 rounded-full px-4 py-1.5 text-orange-400 text-sm font-medium mb-6">
            For Contractors
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight mb-4">
            Stop Chasing Jobs.
            <br />
            <span className="text-orange-500">Let Them Come to You.</span>
          </h1>
          <p className="text-white/60 text-lg max-w-xl mx-auto">
            Get matched with homeowners in your area the moment they post a job.
            Choose a plan and start receiving leads today.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4 border-b border-white/10">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-white text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Choose a Plan',
                desc: 'Pick Starter or Pro based on how many jobs you want.',
              },
              {
                step: '02',
                title: 'Set Your Trade & Area',
                desc: "Tell us what you do and which Ontario postal codes you serve.",
              },
              {
                step: '03',
                title: 'Get Leads via SMS',
                desc: 'When a homeowner submits a matching job, you get a text immediately.',
              },
            ].map(({ step, title, desc }) => (
              <div key={step} className="text-center">
                <div className="text-4xl font-black text-orange-500/30 mb-3">{step}</div>
                <h3 className="text-white font-semibold mb-2">{title}</h3>
                <p className="text-white/50 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-white text-center mb-4">Simple, Transparent Pricing</h2>
          <p className="text-white/50 text-center mb-12">No setup fees. No contracts. Cancel anytime.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Starter */}
            <div className="bg-[#162847] border border-white/10 rounded-2xl p-8 flex flex-col">
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <div className="text-white/60 text-sm font-medium uppercase tracking-wide">Starter</div>
                  <span className="bg-orange-500/20 text-orange-400 text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                    Founding Member Rate
                  </span>
                </div>
                <div className="flex items-end gap-2 mb-1">
                  <span className="text-4xl font-black text-white">$99</span>
                  <span className="text-white/50 pb-1">/month</span>
                  <span className="text-white/40 line-through text-lg pb-1">$149</span>
                </div>
                <p className="text-white/50 text-sm">Great for contractors just getting started</p>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {STARTER_FEATURES.map(f => (
                  <li key={f} className="flex items-start gap-3 text-sm text-white/70">
                    <svg className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>

              <CheckoutButton plan="starter" className="w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-3 rounded-lg transition-colors text-center">
                Get Started — $99/mo
              </CheckoutButton>
            </div>

            {/* Pro */}
            <div className="bg-[#162847] border-2 border-orange-500 rounded-2xl p-8 flex flex-col relative">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                  Most Popular
                </span>
              </div>

              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <div className="text-orange-400 text-sm font-medium uppercase tracking-wide">Pro</div>
                  <span className="bg-orange-500/20 text-orange-400 text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                    Founding Member Rate
                  </span>
                </div>
                <div className="flex items-end gap-2 mb-1">
                  <span className="text-4xl font-black text-white">$199</span>
                  <span className="text-white/50 pb-1">/month</span>
                  <span className="text-white/40 line-through text-lg pb-1">$299</span>
                </div>
                <p className="text-white/50 text-sm">For serious contractors who want every lead</p>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {PRO_FEATURES.map(f => (
                  <li key={f} className="flex items-start gap-3 text-sm text-white/70">
                    <svg className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>

              <CheckoutButton plan="pro" className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg transition-colors text-center">
                Get Started — $199/mo
              </CheckoutButton>
            </div>
          </div>

          <p className="text-center text-white/50 text-sm mt-6">
            🔒 Lock in this rate forever. First 25 contractors only.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-4 border-t border-white/10">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-white text-center mb-10">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {[
              {
                q: 'How are leads matched to me?',
                a: 'We match leads based on your trade type and the Ontario postal codes you serve. You only receive leads that are relevant to your business.',
              },
              {
                q: 'What\'s the difference between Starter and Pro?',
                a: 'Pro contractors receive leads instantly and are notified first. Starter contractors receive the same leads 30 minutes later. Pro also has no monthly cap, while Starter is limited to 15 leads per month.',
              },
              {
                q: 'Can I upgrade from Starter to Pro?',
                a: 'Yes — you can upgrade at any time from your dashboard. The change takes effect immediately.',
              },
              {
                q: 'What happens if I hit my Starter lead limit?',
                a: 'Once you\'ve received 15 leads in a calendar month, you won\'t receive additional leads until the 1st of the next month when credits reset.',
              },
              {
                q: 'How do I receive leads?',
                a: 'Leads are delivered via SMS to the phone number on your account. Each message includes the job type, postal code, description snippet, and a link to your dashboard.',
              },
            ].map(({ q, a }) => (
              <div key={q} className="bg-[#162847] border border-white/10 rounded-xl p-6">
                <h3 className="text-white font-semibold mb-2">{q}</h3>
                <p className="text-white/50 text-sm">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-gradient-to-b from-[#0f1f3d] to-[#0a1628]">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Grow Your Business?</h2>
          <p className="text-white/50 mb-8">Join contractors across Ontario getting leads delivered straight to their phone.</p>
          <Link href="#pricing" className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-3.5 rounded-lg transition-colors inline-block">
            View Plans
          </Link>
        </div>
      </section>
    </div>
  )
}
