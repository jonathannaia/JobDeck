export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Stripe from 'stripe'
import SignOutButton from '@/components/SignOutButton'

type BatchPurchase = {
  id: string
  city: string
  trade: string
  count: string
  created: number
  session_id: string
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch batch purchases from Stripe by email
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-02-25.clover' })
  let batchPurchases: BatchPurchase[] = []
  try {
    const sessions = await stripe.checkout.sessions.list({ limit: 50 })
    batchPurchases = sessions.data
      .filter(s =>
        s.metadata?.type === 'batch_purchase' &&
        s.payment_status === 'paid' &&
        (s.customer_email === user.email || s.customer_details?.email === user.email)
      )
      .map(s => ({
        id: s.id,
        city: s.metadata?.city || '',
        trade: s.metadata?.trade === 'all' ? 'All Trades' : (s.metadata?.trade || ''),
        count: s.metadata?.count || '25',
        created: s.created,
        session_id: s.id,
      }))
  } catch {
    // Stripe unavailable — show empty state
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#0f172a] mb-1">Your Purchases</h1>
            <p className="text-[#6b7280] text-sm">{user.email}</p>
          </div>
          <SignOutButton />
        </div>

        {/* Batch purchases */}
        <div className="bg-white border border-[#e2e8f0] rounded-xl overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-[#e2e8f0] flex items-center justify-between">
            <h2 className="text-[#0f172a] font-semibold">Batch Permit Data</h2>
            <a
              href="/contractors/batch"
              className="text-xs text-[#2563eb] hover:underline font-medium"
            >
              + Get another batch
            </a>
          </div>

          {batchPurchases.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-[#9ca3af] text-sm mb-4">No batch purchases yet.</p>
              <a
                href="/contractors/batch"
                className="inline-block bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-medium px-5 py-2.5 rounded-lg text-sm transition-colors"
              >
                Get 25 Permits — $40
              </a>
            </div>
          ) : (
            <div className="divide-y divide-[#f1f5f9]">
              {batchPurchases.map(p => (
                <div key={p.id} className="px-6 py-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-[#0f172a]">
                      {p.city} — {p.trade}
                    </p>
                    <p className="text-xs text-[#6b7280] mt-0.5">
                      {p.count} permits · {new Date(p.created * 1000).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  <a
                    href={`/api/permits/batch-download?session_id=${p.session_id}`}
                    className="shrink-0 inline-flex items-center gap-1.5 bg-[#f8fafc] hover:bg-[#EFF6FF] border border-[#e2e8f0] text-[#2563eb] font-semibold text-xs px-4 py-2 rounded-lg transition-colors"
                  >
                    ↓ Re-download CSV
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Browse individual permits */}
        <div className="bg-white border border-[#e2e8f0] rounded-xl p-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-[#0f172a]">Browse individual permits</p>
            <p className="text-xs text-[#6b7280] mt-0.5">Claim specific addresses one at a time. $25–$85 each.</p>
          </div>
          <a
            href="/leads"
            className="shrink-0 inline-flex items-center gap-1.5 bg-[#f8fafc] hover:bg-[#EFF6FF] border border-[#e2e8f0] text-[#2563eb] font-semibold text-xs px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
          >
            Browse permits →
          </a>
        </div>

      </div>
    </div>
  )
}
