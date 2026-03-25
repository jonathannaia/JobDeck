import JobRequestForm from '@/components/JobRequestForm'
import { CheckCircle, Zap, Shield, Clock, Star, ArrowRight } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">

      {/* Hero — split screen */}
      <section className="bg-white px-4 pt-16 pb-20">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left */}
          <div>
            <div className="inline-flex items-center gap-2 bg-[#EFF6FF] rounded-full px-4 py-1.5 text-[#1d4ed8] text-sm font-semibold mb-6">
              <Zap size={14} strokeWidth={2.5} />
              Ontario&apos;s #1 Contractor Marketplace
            </div>
            <h1 className="text-5xl sm:text-6xl font-bold text-[#0f172a] leading-[1.1] mb-6">
              Get your home job done{' '}
              <span className="text-[#2563eb]">right.</span>
            </h1>
            <p className="text-[#6b7280] text-xl mb-8 leading-relaxed">
              Post your project and get matched with local contractors. Free for homeowners — always.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mb-10">
              <a
                href="#request"
                className="flex items-center justify-center gap-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold px-8 py-4 rounded-xl text-base shadow-md hover:shadow-lg"
              >
                Post a Job — Free
                <ArrowRight size={18} strokeWidth={2} />
              </a>
              <a
                href="/contractors"
                className="flex items-center justify-center gap-2 bg-white border-2 border-[#e2e8f0] hover:border-[#2563eb] hover:text-[#2563eb] text-[#374151] font-semibold px-8 py-4 rounded-xl text-base"
              >
                I&apos;m a Contractor
              </a>
            </div>
            <div className="flex flex-wrap gap-4">
              {[
                { icon: CheckCircle, label: 'Free for homeowners' },
                { icon: Shield, label: 'Ontario contractors only' },
                { icon: Clock, label: 'Replies within hours' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2">
                  <Icon size={16} strokeWidth={2} className="text-[#22c55e]" />
                  <span className="text-[#374151] text-sm font-medium">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right — stats card panel */}
          <div className="hidden lg:flex flex-col gap-4">
            <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl p-6">
              <p className="text-sm text-[#6b7280] font-medium mb-1">Active leads across Ontario</p>
              <p className="text-4xl font-bold text-[#0f172a]">1,100<span className="text-[#2563eb]">+</span></p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl p-5">
                <p className="text-sm text-[#6b7280] font-medium mb-1">Cities covered</p>
                <p className="text-3xl font-bold text-[#0f172a]">12</p>
              </div>
              <div className="bg-[#fef9c3] border border-[#fde68a] rounded-2xl p-5">
                <p className="text-sm text-[#92400e] font-medium mb-1">⚡ Fill-In Ready</p>
                <p className="text-3xl font-bold text-[#92400e]">Fast</p>
                <p className="text-xs text-[#a16207] mt-1">Jobs starting soon</p>
              </div>
            </div>
            <div className="bg-[#0f172a] rounded-2xl p-6 text-white">
              <div className="flex items-center gap-2 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} fill="#fbbf24" color="#fbbf24" />
                ))}
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                &ldquo;Got 3 quotes within a day of posting. Hired a great local roofer.&rdquo;
              </p>
              <p className="text-xs text-slate-400 mt-3 font-medium">— Sarah M., Brampton</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section className="bg-[#f8fafc] border-y border-[#e2e8f0] py-5 px-4">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-8">
          {[
            { icon: CheckCircle, label: 'Free for homeowners' },
            { icon: Shield, label: 'Ontario contractors only' },
            { icon: Zap, label: 'Leads sent by SMS instantly' },
            { icon: Clock, label: 'No account needed' },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2">
              <Icon size={16} strokeWidth={2} className="text-[#2563eb]" />
              <span className="text-[#374151] text-sm font-semibold">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Form */}
      <section id="request" className="py-20 px-4 bg-white">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-[#0f172a] mb-3">Tell us about your project</h2>
            <p className="text-[#6b7280]">Takes under 2 minutes. No account needed.</p>
          </div>
          <div className="bg-white border border-[#e2e8f0] rounded-2xl p-8 shadow-md">
            <JobRequestForm />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4 bg-[#f8fafc] border-t border-[#e2e8f0]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#0f172a] mb-3">How It Works</h2>
            <p className="text-[#6b7280] max-w-lg mx-auto">Three steps to get your job done. No hassle, no middlemen.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { n: '1', title: 'Describe Your Job', desc: 'Fill out the quick form above — takes under 2 minutes. No account needed.', color: '#EFF6FF', text: '#1d4ed8' },
              { n: '2', title: 'Get Matched Instantly', desc: 'We notify local contractors who specialize in exactly what you need.', color: '#f0fdf4', text: '#16a34a' },
              { n: '3', title: 'Get Quotes', desc: 'Qualified contractors contact you directly to discuss and provide quotes.', color: '#fef9c3', text: '#92400e' },
            ].map(({ n, title, desc, color, text }) => (
              <div key={n} className="bg-white border border-[#e2e8f0] rounded-2xl p-7 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-5" style={{ backgroundColor: color }}>
                  <span className="font-bold text-sm" style={{ color: text }}>{n}</span>
                </div>
                <h3 className="text-[#0f172a] font-semibold text-base mb-2">{title}</h3>
                <p className="text-[#6b7280] text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-6 px-4 bg-[#f8fafc] border-t border-[#e2e8f0]">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-[#9ca3af] text-xs leading-relaxed">
            JobDeck provides publicly available building permit data for informational and business prospecting purposes only.
            We do not issue permits or represent any municipal authority.{' '}
            <a href="/terms" className="text-[#2563eb] hover:underline">Terms of Service</a>
          </p>
        </div>
      </section>

      {/* Contractor CTA banner */}
      <section className="py-16 px-4 bg-[#0f172a]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-3">Are you a contractor?</h2>
          <p className="text-slate-400 mb-8 text-lg">Know which homes in your city are about to spend money — before anyone else does.</p>
          <a
            href="/contractors/batch"
            className="inline-flex items-center gap-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold px-8 py-4 rounded-xl text-base shadow-md hover:shadow-lg"
          >
            Get Renovation Opportunities
            <ArrowRight size={18} strokeWidth={2} />
          </a>
        </div>
      </section>

    </div>
  )
}
