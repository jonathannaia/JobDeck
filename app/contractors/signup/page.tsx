'use client'

import { useState } from 'react'
import { TRADE_LABELS, type TradeType } from '@/lib/types'

const POSTAL_PREFIXES = [
  { value: 'K', label: 'K — Ottawa / Eastern Ontario' },
  { value: 'L', label: 'L — Hamilton / Niagara / Barrie' },
  { value: 'M', label: 'M — Toronto / GTA' },
  { value: 'N', label: 'N — London / Windsor / Kitchener' },
  { value: 'P', label: 'P — Northern Ontario / Sudbury' },
]

const inputClass = 'w-full bg-white border border-[#e2e8f0] rounded-lg px-4 py-3 text-[#0f172a] placeholder-[#9ca3af] focus:outline-none focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb] transition-colors text-sm'
const labelClass = 'block text-sm font-medium text-[#374151] mb-1.5'

export default function ContractorSignupPage() {
  const [plan] = useState(() => {
    if (typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search).get('plan') || 'starter'
    }
    return 'starter'
  })

  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    trade_type: '' as TradeType | '',
    service_area: [] as string[],
  })
  const [errors, setErrors] = useState<Partial<Record<keyof typeof form, string>>>({})
  const [loading, setLoading] = useState(false)

  function togglePrefix(prefix: string) {
    setForm(prev => ({
      ...prev,
      service_area: prev.service_area.includes(prefix)
        ? prev.service_area.filter(p => p !== prefix)
        : [...prev.service_area, prefix],
    }))
    if (errors.service_area) setErrors(prev => ({ ...prev, service_area: undefined }))
  }

  function validate() {
    const errs: Partial<Record<keyof typeof form, string>> = {}
    if (!form.name.trim()) errs.name = 'Name is required'
    if (!form.phone.trim()) errs.phone = 'Phone number is required'
    if (!form.email.trim()) errs.email = 'Email is required'
    if (!form.trade_type) errs.trade_type = 'Please select your trade'
    if (form.service_area.length === 0) errs.service_area = 'Select at least one service area'
    return errs
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setErrors({})
    setLoading(true)

    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan,
          name: form.name.trim(),
          phone: form.phone.trim(),
          email: form.email.trim(),
          trade_type: form.trade_type,
          service_area: form.service_area.join(','),
        }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error(data.error || 'Something went wrong')
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  const planLabel = plan === 'pro' ? 'Pro — $199/mo' : 'Starter — $99/mo'

  return (
    <div className="min-h-screen bg-[#f8fafc] py-16 px-4">
      <div className="max-w-lg mx-auto">
        <div className="mb-8">
          <div className="inline-flex items-center bg-[#EFF6FF] rounded-full px-3 py-1 text-[#1d4ed8] text-xs font-medium mb-4">
            {planLabel}
          </div>
          <h1 className="text-2xl font-bold text-[#0f172a] mb-2">Set Up Your Account</h1>
          <p className="text-[#6b7280] text-sm">Tell us about your business so we can match you with the right leads.</p>
        </div>

        <div className="bg-white border border-[#e2e8f0] rounded-xl p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>Full Name <span className="text-[#2563eb]">*</span></label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => { setForm(p => ({ ...p, name: e.target.value })); if (errors.name) setErrors(p => ({ ...p, name: undefined })) }}
                  placeholder="John Smith"
                  className={inputClass}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className={labelClass}>Phone Number <span className="text-[#2563eb]">*</span></label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={e => { setForm(p => ({ ...p, phone: e.target.value })); if (errors.phone) setErrors(p => ({ ...p, phone: undefined })) }}
                  placeholder="416-555-0123"
                  className={inputClass}
                />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>
            </div>

            <div>
              <label className={labelClass}>Email Address <span className="text-[#2563eb]">*</span></label>
              <input
                type="email"
                value={form.email}
                onChange={e => { setForm(p => ({ ...p, email: e.target.value })); if (errors.email) setErrors(p => ({ ...p, email: undefined })) }}
                placeholder="john@smithplumbing.ca"
                className={inputClass}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              <p className="text-[#9ca3af] text-xs mt-1">This is the email you'll use to log in to your dashboard.</p>
            </div>

            <div>
              <label className={labelClass}>Your Trade <span className="text-[#2563eb]">*</span></label>
              <select
                value={form.trade_type}
                onChange={e => { setForm(p => ({ ...p, trade_type: e.target.value as TradeType })); if (errors.trade_type) setErrors(p => ({ ...p, trade_type: undefined })) }}
                className={`${inputClass} appearance-none`}
              >
                <option value="" disabled>Select your trade...</option>
                {(Object.entries(TRADE_LABELS) as [TradeType, string][]).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              {errors.trade_type && <p className="text-red-500 text-xs mt-1">{errors.trade_type}</p>}
            </div>

            <div>
              <label className={labelClass}>Service Area <span className="text-[#2563eb]">*</span></label>
              <p className="text-[#9ca3af] text-xs mb-3">Select all Ontario regions where you take jobs.</p>
              <div className="space-y-2">
                {POSTAL_PREFIXES.map(({ value, label }) => (
                  <label key={value} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={form.service_area.includes(value)}
                      onChange={() => togglePrefix(value)}
                      className="w-4 h-4 rounded border-[#e2e8f0] text-[#2563eb] focus:ring-[#2563eb]"
                    />
                    <span className="text-sm text-[#374151] group-hover:text-[#0f172a]">{label}</span>
                  </label>
                ))}
              </div>
              {errors.service_area && <p className="text-red-500 text-xs mt-2">{errors.service_area}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium py-3.5 rounded-lg transition-colors text-sm mt-2"
            >
              {loading ? 'Redirecting to payment...' : `Continue to Payment — ${planLabel}`}
            </button>

            <p className="text-[#9ca3af] text-xs text-center">
              Secured by Stripe. Cancel anytime. No setup fees.
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
