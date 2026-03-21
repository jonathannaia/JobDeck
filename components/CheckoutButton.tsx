'use client'

import { useState } from 'react'
import type { PlanType } from '@/lib/types'

interface Props {
  plan: PlanType
  className?: string
  children: React.ReactNode
}

export default function CheckoutButton({ plan, className, children }: Props) {
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    setLoading(true)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      }
    } catch {
      alert('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`${className} disabled:opacity-60 disabled:cursor-not-allowed`}
    >
      {loading ? 'Redirecting...' : children}
    </button>
  )
}
