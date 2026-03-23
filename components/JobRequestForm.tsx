'use client'

import { useState } from 'react'
import { ONTARIO_POSTAL_PREFIXES, TRADE_LABELS, type TradeType } from '@/lib/types'

const TIMELINE_OPTIONS = [
  'As soon as possible',
  'Within 1 week',
  'Within 1 month',
  'Within 3 months',
  'Flexible / planning ahead',
]

const inputClass = 'w-full bg-white border border-[#e2e8f0] rounded-lg px-4 py-3 text-[#0f172a] placeholder-[#9ca3af] focus:outline-none focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb] transition-colors text-sm'
const labelClass = 'block text-sm font-medium text-[#374151] mb-1.5'

export default function JobRequestForm({ defaultTrade }: { defaultTrade?: string }) {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    trade_type: (defaultTrade || '') as TradeType | '',
    job_description: '',
    city: '',
    postal_code: '',
    timeline: '',
  })
  type FormErrors = Partial<Record<keyof typeof form, string>>
  const [errors, setErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [serverError, setServerError] = useState('')

  function validate() {
    const errs: FormErrors = {}
    if (!form.name.trim()) errs.name = 'Name is required'
    if (!form.phone.trim()) errs.phone = 'Phone number is required'
    if (!form.trade_type) errs.trade_type = 'Please select a trade type'
    if (!form.job_description.trim()) errs.job_description = 'Please describe your job'
    if (form.job_description.trim().length < 20)
      errs.job_description = 'Please provide at least 20 characters'
    if (!form.postal_code.trim()) {
      errs.postal_code = 'Postal code is required'
    } else {
      const prefix = form.postal_code.trim().toUpperCase().charAt(0)
      if (!ONTARIO_POSTAL_PREFIXES.includes(prefix)) {
        errs.postal_code = 'Please enter a valid Ontario postal code (starts with K, L, M, N, or P)'
      }
    }
    return errs
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
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Something went wrong')
      }
      setSubmitted(true)
      if (typeof window !== 'undefined' && typeof (window as any).gtag === 'function') {
        (window as any).gtag('event', 'lead_submitted', { trade_type: form.trade_type })
      }
    } catch (err: unknown) {
      setServerError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-8">
        <div className="w-14 h-14 bg-[#dcfce7] rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-[#16a34a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-medium text-[#0f172a] mb-2">Request Submitted!</h3>
        <p className="text-[#6b7280] text-sm max-w-sm mx-auto">
          Local contractors in your area have been notified. Expect to hear from them shortly.
        </p>
        <button
          onClick={() => {
            setSubmitted(false)
            setForm({ name: '', phone: '', email: '', trade_type: '', job_description: '', city: '', postal_code: '', timeline: '' })
          }}
          className="mt-6 text-[#2563eb] hover:text-[#1d4ed8] text-sm underline"
        >
          Submit another request
        </button>
      </div>
    )
  }

  const set = (field: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className={labelClass}>Full Name <span className="text-[#2563eb]">*</span></label>
          <input type="text" value={form.name} onChange={set('name')} placeholder="Jane Smith" className={inputClass} />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
        </div>
        <div>
          <label className={labelClass}>Phone Number <span className="text-[#2563eb]">*</span></label>
          <input type="tel" value={form.phone} onChange={set('phone')} placeholder="416-555-0123" className={inputClass} />
          {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
        </div>
      </div>

      <div>
        <label className={labelClass}>Email Address <span className="text-[#9ca3af] text-xs font-normal">(optional)</span></label>
        <input type="email" value={form.email} onChange={set('email')} placeholder="jane@example.com" className={inputClass} />
      </div>

      <div>
        <label className={labelClass}>Type of Work Needed <span className="text-[#2563eb]">*</span></label>
        <select value={form.trade_type} onChange={set('trade_type')} className={`${inputClass} appearance-none`}>
          <option value="" disabled>Select a trade...</option>
          {(Object.entries(TRADE_LABELS) as [TradeType, string][]).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        {errors.trade_type && <p className="text-red-500 text-xs mt-1">{errors.trade_type}</p>}
      </div>

      <div>
        <label className={labelClass}>Job Description <span className="text-[#2563eb]">*</span></label>
        <textarea
          value={form.job_description}
          onChange={set('job_description')}
          rows={4}
          placeholder="Describe the work you need done, including any relevant details about the scope, materials, or challenges..."
          className={`${inputClass} resize-none`}
        />
        {errors.job_description && <p className="text-red-500 text-xs mt-1">{errors.job_description}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className={labelClass}>City <span className="text-[#2563eb]">*</span></label>
          <input type="text" value={form.city} onChange={set('city')} placeholder="Cambridge" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Postal Code <span className="text-[#2563eb]">*</span></label>
          <input
            type="text"
            value={form.postal_code}
            onChange={set('postal_code')}
            placeholder="M5V 3A8"
            maxLength={7}
            className={`${inputClass} uppercase`}
          />
          {errors.postal_code && <p className="text-red-500 text-xs mt-1">{errors.postal_code}</p>}
        </div>
        <div>
          <label className={labelClass}>Timeline</label>
          <select value={form.timeline} onChange={set('timeline')} className={`${inputClass} appearance-none`}>
            <option value="">Select...</option>
            {TIMELINE_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      {serverError && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-red-600 text-sm">
          {serverError}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium py-3.5 rounded-lg transition-colors text-sm"
      >
        {loading ? 'Submitting...' : 'Get Matched with Contractors'}
      </button>

      <p className="text-[#9ca3af] text-xs text-center">
        By submitting, you consent to being contacted by matched contractors about your project.
        View our <a href="/privacy" className="underline hover:text-[#6b7280]">Privacy Policy</a> and <a href="/terms" className="underline hover:text-[#6b7280]">Terms of Service</a>.
      </p>
    </form>
  )
}
