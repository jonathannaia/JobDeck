'use client'

import { useState } from 'react'
import { TRADE_LABELS, type TradeType } from '@/lib/types'
import { CheckCircle } from 'lucide-react'

const inputClass = 'w-full bg-white border border-[#d1d5db] rounded-xl px-4 py-4 text-[#0f172a] placeholder-[#9ca3af] focus:outline-none focus:border-[#143A75] focus:ring-2 focus:ring-[#143A75]/20 transition-colors text-base'
const labelClass = 'block text-sm font-semibold text-[#374151] mb-2'

export default function GetQuotesPage() {
  const [form, setForm] = useState({ name: '', phone: '', trade_type: '' as TradeType | '', city: '' })
  const [errors, setErrors] = useState<Partial<Record<keyof typeof form, string>>>({})
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [serverError, setServerError] = useState('')

  function validate() {
    const errs: Partial<Record<keyof typeof form, string>> = {}
    if (!form.name.trim()) errs.name = 'Required'
    if (!form.phone.trim()) errs.phone = 'Required'
    if (!form.trade_type) errs.trade_type = 'Required'
    if (!form.city.trim()) errs.city = 'Required'
    return errs
  }

  const set = (field: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setErrors({})
    setLoading(true)
    setServerError('')
    try {
      const res = await fetch('/api/leads/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          phone: form.phone.trim(),
          trade_type: form.trade_type,
          city: form.city.trim(),
          job_description: `Quick quote request via postcard landing page. Trade: ${TRADE_LABELS[form.trade_type as TradeType] || form.trade_type}. City: ${form.city.trim()}.`,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Something went wrong')
      }
      setSubmitted(true)
      if (typeof window !== 'undefined' && typeof (window as any).gtag === 'function') {
        (window as any).gtag('event', 'lead_submitted', { trade_type: form.trade_type, source: 'get-quotes' })
      }
    } catch (err: unknown) {
      setServerError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 bg-[#dcfce7] rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle size={32} className="text-[#16a34a]" strokeWidth={2} />
          </div>
          <h1 className="text-2xl font-bold text-[#0f172a] mb-3">You&apos;re all set!</h1>
          <p className="text-[#6b7280] leading-relaxed">
            Local contractors in {form.city} have been notified. Expect a call or text shortly.
          </p>
          <p className="text-xs text-[#9ca3af] mt-6">Free for homeowners · No account needed</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center px-4 py-12">
      <div className="max-w-sm mx-auto w-full">

        {/* Header */}
        <div className="mb-8 text-center">
          <p className="text-[#143A75] text-sm font-semibold uppercase tracking-wide mb-2">JobDeck</p>
          <h1 className="text-3xl font-bold text-[#0f172a] leading-tight mb-2">Get free quotes from local contractors</h1>
          <p className="text-[#6b7280] text-sm">Takes 30 seconds. No account needed.</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelClass}>Your Name</label>
            <input
              type="text"
              value={form.name}
              onChange={set('name')}
              placeholder="Jane Smith"
              autoComplete="name"
              className={inputClass}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className={labelClass}>Phone Number</label>
            <input
              type="tel"
              value={form.phone}
              onChange={set('phone')}
              placeholder="416-555-0123"
              autoComplete="tel"
              className={inputClass}
            />
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
          </div>

          <div>
            <label className={labelClass}>Trade Needed</label>
            <select
              value={form.trade_type}
              onChange={set('trade_type')}
              className={`${inputClass} appearance-none bg-[url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")] bg-no-repeat bg-[right_1rem_center]`}
            >
              <option value="" disabled>Select a trade...</option>
              {(Object.entries(TRADE_LABELS) as [TradeType, string][]).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            {errors.trade_type && <p className="text-red-500 text-xs mt-1">{errors.trade_type}</p>}
          </div>

          <div>
            <label className={labelClass}>Your City</label>
            <input
              type="text"
              value={form.city}
              onChange={set('city')}
              placeholder="Brampton"
              autoComplete="address-level2"
              className={inputClass}
            />
            {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
          </div>

          {serverError && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm">
              {serverError}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#143A75] hover:bg-[#0e2d5c] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl transition-colors text-base mt-2"
          >
            {loading ? 'Sending...' : 'Get My Free Quotes'}
          </button>
        </form>

        <p className="text-[#9ca3af] text-xs text-center mt-5 leading-relaxed">
          Free for homeowners. By submitting, you consent to being contacted by matched contractors.
        </p>
      </div>
    </div>
  )
}
