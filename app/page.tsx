import JobRequestForm from '@/components/JobRequestForm'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="py-20 px-4 text-center bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-[#EFF6FF] rounded-full px-4 py-1.5 text-[#1d4ed8] text-sm font-medium mb-6">
            Ontario&apos;s Contractor Marketplace
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-[#0f172a] leading-tight mb-4">
            Find Trusted Local Contractors{' '}
            <span className="text-[#2563eb]">Fast</span>
          </h1>
          <p className="text-[#6b7280] text-lg mb-10 max-w-xl mx-auto">
            Describe your project and we&apos;ll connect you with local, vetted contractors ready to quote.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <a
              href="#request"
              className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-medium px-6 py-3 rounded-lg transition-colors"
            >
              Post a Job — Free
            </a>
            <a
              href="/contractors"
              className="bg-white border border-[#e2e8f0] hover:border-[#94a3b8] text-[#374151] font-medium px-6 py-3 rounded-lg transition-colors"
            >
              For Contractors
            </a>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section className="bg-[#f8fafc] border-y border-[#e2e8f0] py-4 px-4">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-6 sm:gap-10">
          {[
            'Free for homeowners',
            'Ontario contractors only',
            'No account needed',
            'Leads sent by SMS instantly',
          ].map(item => (
            <div key={item} className="flex items-center gap-2">
              <span className="w-2 h-2 bg-[#22c55e] rounded-full shrink-0" />
              <span className="text-[#374151] text-sm font-medium">{item}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Form */}
      <section id="request" className="py-16 px-4 bg-white">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white border border-[#e2e8f0] rounded-xl p-8 shadow-sm">
            <h2 className="text-xl font-medium text-[#0f172a] mb-6">Tell us about your project</h2>
            <JobRequestForm />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4 bg-[#f8fafc] border-t border-[#e2e8f0]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-[#0f172a] text-center mb-10">How It Works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { n: '1', title: 'Describe Your Job', desc: 'Fill out the quick form above — takes under 2 minutes. No account needed.' },
              { n: '2', title: 'Get Matched', desc: 'We instantly notify local contractors who do exactly what you need.' },
              { n: '3', title: 'Contractors Reach Out', desc: 'Qualified contractors contact you directly to discuss and provide quotes.' },
            ].map(({ n, title, desc }) => (
              <div key={n} className="bg-white border border-[#e2e8f0] rounded-xl p-6">
                <div className="w-9 h-9 bg-[#EFF6FF] rounded-full flex items-center justify-center mb-4">
                  <span className="text-[#2563eb] font-bold text-sm">{n}</span>
                </div>
                <h3 className="text-[#0f172a] font-medium mb-2">{title}</h3>
                <p className="text-[#6b7280] text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
