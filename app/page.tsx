import JobRequestForm from '@/components/JobRequestForm'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative py-20 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a1628] to-[#0f1f3d] pointer-events-none" />
        <div className="relative max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 rounded-full px-4 py-1.5 text-orange-400 text-sm font-medium mb-6">
            <span className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
            Free for homeowners — no account needed
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight mb-4">
            Get Matched with Trusted
            <br />
            <span className="text-orange-500">Ontario Contractors</span>
          </h1>
          <p className="text-white/60 text-lg mb-10">
            Describe your project and we&apos;ll connect you with local, vetted contractors ready to quote.
          </p>
        </div>
      </section>

      {/* Form */}
      <section className="px-4 pb-24 -mt-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-[#162847] border border-white/10 rounded-2xl p-8 shadow-2xl">
            <h2 className="text-xl font-semibold text-white mb-6">Tell us about your project</h2>
            <JobRequestForm />
          </div>
        </div>
      </section>

      {/* Trust signals */}
      <section className="py-16 px-4 border-t border-white/10">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-orange-500 mb-2">100%</div>
            <div className="text-white/60 text-sm">Free for homeowners</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-orange-500 mb-2">Ontario</div>
            <div className="text-white/60 text-sm">Local contractors only</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-orange-500 mb-2">Fast</div>
            <div className="text-white/60 text-sm">Contractors notified instantly</div>
          </div>
        </div>
      </section>
    </div>
  )
}
