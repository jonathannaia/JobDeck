import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getTrade, getCity, generateParams } from '@/lib/seo-pages'
import JobRequestForm from '@/components/JobRequestForm'

export async function generateStaticParams() {
  return generateParams()
}

export async function generateMetadata({ params }: { params: Promise<{ trade: string; city: string }> }): Promise<Metadata> {
  const { trade: tradeSlug, city: citySlug } = await params
  const trade = getTrade(tradeSlug)
  const city = getCity(citySlug)
  if (!trade || !city) return {}

  return {
    title: `${trade.plural} in ${city.label}, Ontario — Free Quotes | JobDeck`,
    description: `Need a ${trade.label.toLowerCase()} in ${city.label}? Post your job for free on JobDeck and get matched with trusted local ${trade.plural.toLowerCase()} in ${city.label}, Ontario. No account needed.`,
  }
}

export default async function TradecityPage({ params }: { params: Promise<{ trade: string; city: string }> }) {
  const { trade: tradeSlug, city: citySlug } = await params
  const trade = getTrade(tradeSlug)
  const city = getCity(citySlug)

  if (!trade || !city) notFound()

  const faqs = [
    {
      q: `How do I find a reliable ${trade.label.toLowerCase()} in ${city.label}?`,
      a: `Post your job on JobDeck for free. We match you with local, vetted ${trade.plural.toLowerCase()} in ${city.label} who are actively looking for work in your area.`,
    },
    {
      q: `How much does ${trade.verb} cost in ${city.label}?`,
      a: `Costs vary depending on the scope of work. Submit your job on JobDeck and get quotes from multiple ${trade.plural.toLowerCase()} in ${city.label} so you can compare.`,
    },
    {
      q: `How fast will I hear from a ${trade.label.toLowerCase()}?`,
      a: `Most homeowners hear back within hours. Contractors on JobDeck are notified immediately when a matching job is posted in their area.`,
    },
    {
      q: `Is it free to post a job on JobDeck?`,
      a: `Yes — 100% free for homeowners. No account needed, no obligation to hire.`,
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-[#f8fafc] border-b border-[#e2e8f0] py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center bg-[#EFF6FF] rounded-full px-4 py-1.5 text-[#1d4ed8] text-sm font-medium mb-6">
            {city.label}, Ontario
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-[#0f172a] leading-tight mb-4">
            Find a Trusted {trade.label}<br className="hidden sm:block" /> in {city.label}
          </h1>
          <p className="text-[#6b7280] text-lg max-w-xl mx-auto mb-8">
            Post your {trade.verb} job for free and get matched with local {trade.plural.toLowerCase()} in {city.label}. No account needed — results in hours.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-[#374151]">
            {['Free for homeowners', 'No account needed', 'Local contractors only', 'Hear back within hours'].map(item => (
              <div key={item} className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-[#22c55e] rounded-full" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="py-16 px-4">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-[#0f172a] text-center mb-2">
            Post Your {trade.label} Job — Free
          </h2>
          <p className="text-[#6b7280] text-center mb-8">
            Describe your project and we'll connect you with {trade.plural.toLowerCase()} near {city.label}.
          </p>
          <JobRequestForm defaultTrade={trade.trade_type} />
        </div>
      </section>

      {/* Why JobDeck */}
      <section className="py-16 px-4 bg-[#f8fafc] border-y border-[#e2e8f0]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-[#0f172a] text-center mb-10">
            Why Homeowners in {city.label} Use JobDeck
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { title: 'Local Contractors Only', desc: `Every contractor on JobDeck serves ${city.label} and surrounding areas. No out-of-town quotes.` },
              { title: 'Fast Response', desc: `Contractors are notified the moment you post. Most homeowners hear back within a few hours.` },
              { title: 'No Obligation', desc: `Getting matched is free. You choose who to hire — no pressure, no commitment.` },
            ].map(({ title, desc }) => (
              <div key={title} className="bg-white border border-[#e2e8f0] rounded-xl p-6">
                <div className="w-8 h-8 bg-[#EFF6FF] rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-4 h-4 text-[#2563eb]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-[#0f172a] font-medium mb-2">{title}</h3>
                <p className="text-[#6b7280] text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-4">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-[#0f172a] text-center mb-10">
            Common Questions
          </h2>
          <div className="space-y-4">
            {faqs.map(({ q, a }) => (
              <div key={q} className="border border-[#e2e8f0] rounded-xl p-6">
                <h3 className="text-[#0f172a] font-medium mb-2">{q}</h3>
                <p className="text-[#6b7280] text-sm">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-[#f8fafc] border-t border-[#e2e8f0]">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-[#0f172a] mb-3">
            Are you a {trade.label} in {city.label}?
          </h2>
          <p className="text-[#6b7280] mb-6">
            Browse real jobs from homeowners in {city.label} looking for {trade.verb}. Only pay for the leads you want.
          </p>
          <a
            href="/leads"
            className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-medium px-6 py-3 rounded-lg transition-colors inline-block"
          >
            Browse Live Leads
          </a>
        </div>
      </section>
    </div>
  )
}
