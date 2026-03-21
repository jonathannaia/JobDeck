export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { TRADE_LABELS, type TradeType } from '@/lib/types'
import type { Contractor, LeadDelivery, HomeownerLead } from '@/lib/types'
import SignOutButton from '@/components/SignOutButton'

type LeadWithDetails = LeadDelivery & {
  homeowner_leads: HomeownerLead
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const service = createServiceClient()
  const { data: contractorRaw } = await service.from('contractors').select('*').eq('email', user.email).single()
  const contractor = contractorRaw as Contractor | null

  let leads: LeadWithDetails[] = []
  if (contractor) {
    const { data } = await service
      .from('lead_deliveries')
      .select('*, homeowner_leads (*)')
      .eq('contractor_id', contractor.id)
      .order('created_at', { ascending: false })
      .limit(50)
    leads = (data as LeadWithDetails[]) || []
  }

  const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' })

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#0f172a] mb-1">
              {contractor ? `Welcome back, ${contractor.name.split(' ')[0]}` : 'Contractor Dashboard'}
            </h1>
            <p className="text-[#6b7280] text-sm">{user.email}</p>
          </div>
          <SignOutButton />
        </div>

        {!contractor ? (
          <div className="bg-white border border-[#e2e8f0] rounded-xl p-8 text-center">
            <h2 className="text-xl font-medium text-[#0f172a] mb-2">Account Not Found</h2>
            <p className="text-[#6b7280] text-sm mb-6">
              We couldn&apos;t find a contractor account linked to this email. Please subscribe to a plan to get started.
            </p>
            <a href="/contractors#pricing" className="inline-block bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-medium px-6 py-3 rounded-lg transition-colors text-sm">
              View Plans
            </a>
          </div>
        ) : (
          <>
            {/* Stats cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              {/* Plan */}
              <div className="bg-white border border-[#e2e8f0] rounded-xl p-6">
                <div className="text-[#6b7280] text-xs font-medium uppercase tracking-wide mb-2">Current Plan</div>
                <div className="flex items-center gap-2">
                  <span className={`text-2xl font-bold ${contractor.plan_type === 'pro' ? 'text-[#2563eb]' : 'text-[#0f172a]'}`}>
                    {contractor.plan_type === 'pro' ? 'Pro' : 'Starter'}
                  </span>
                  {contractor.plan_type === 'pro' && (
                    <span className="bg-[#EFF6FF] text-[#1d4ed8] text-xs font-medium px-2 py-0.5 rounded-full">INSTANT</span>
                  )}
                </div>
                {!contractor.is_active && (
                  <p className="text-red-500 text-xs mt-1">Subscription inactive</p>
                )}
              </div>

              {/* Leads used */}
              <div className="bg-white border border-[#e2e8f0] rounded-xl p-6">
                <div className="text-[#6b7280] text-xs font-medium uppercase tracking-wide mb-2">Leads This Month</div>
                {contractor.plan_type === 'pro' ? (
                  <div className="text-2xl font-bold text-[#0f172a]">
                    {contractor.lead_credits_used} <span className="text-[#9ca3af] text-base font-normal">/ unlimited</span>
                  </div>
                ) : (
                  <>
                    <div className="text-2xl font-bold text-[#0f172a]">
                      {contractor.lead_credits_used}
                      <span className="text-[#9ca3af] text-base font-normal"> / {contractor.lead_credits_limit}</span>
                    </div>
                    <div className="mt-2 bg-[#e2e8f0] rounded-full h-1.5">
                      <div
                        className="bg-[#2563eb] h-1.5 rounded-full transition-all"
                        style={{ width: `${Math.min(100, (contractor.lead_credits_used / contractor.lead_credits_limit) * 100)}%` }}
                      />
                    </div>
                    <p className="text-[#9ca3af] text-xs mt-1">{currentMonth}</p>
                  </>
                )}
              </div>

              {/* Trade & Area */}
              <div className="bg-white border border-[#e2e8f0] rounded-xl p-6">
                <div className="text-[#6b7280] text-xs font-medium uppercase tracking-wide mb-2">Trade & Service Area</div>
                <div className="text-xl font-bold text-[#0f172a] mb-1">
                  {TRADE_LABELS[contractor.trade_type as TradeType] || contractor.trade_type}
                </div>
                <div className="text-[#6b7280] text-sm">Postal prefixes: {contractor.service_area}</div>
              </div>
            </div>

            {/* Upgrade banner for Starter */}
            {contractor.plan_type === 'starter' && (
              <div className="bg-[#EFF6FF] border border-[#bfdbfe] rounded-xl p-5 mb-6 flex items-center justify-between">
                <div>
                  <p className="text-[#0f172a] font-medium text-sm">Upgrade to Pro for instant lead delivery</p>
                  <p className="text-[#6b7280] text-sm mt-0.5">Get every lead before Starter users — unlimited per month</p>
                </div>
                <a href="/contractors#pricing" className="shrink-0 ml-4 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
                  Upgrade to Pro
                </a>
              </div>
            )}

            {/* Leads table */}
            <div className="bg-white border border-[#e2e8f0] rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-[#e2e8f0] flex items-center justify-between">
                <h2 className="text-[#0f172a] font-medium">Your Leads</h2>
                <span className="text-[#6b7280] text-sm">{leads.length} total</span>
              </div>

              {leads.length === 0 ? (
                <div className="px-6 py-16 text-center">
                  <p className="text-[#9ca3af] text-sm">No leads yet. They&apos;ll show up here when homeowners in your area post jobs.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-[#6b7280] text-xs font-medium uppercase tracking-wide border-b border-[#e2e8f0] bg-[#f8fafc]">
                        <th className="px-6 py-3 text-left">Trade</th>
                        <th className="px-6 py-3 text-left">Location</th>
                        <th className="px-6 py-3 text-left">Job Description</th>
                        <th className="px-6 py-3 text-left">Homeowner Contact</th>
                        <th className="px-6 py-3 text-left">Date</th>
                        <th className="px-6 py-3 text-left">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f1f5f9]">
                      {leads.map(lead => (
                        <tr key={lead.id} className="hover:bg-[#f8fafc] transition-colors">
                          <td className="px-6 py-4 text-[#0f172a] font-medium">
                            {TRADE_LABELS[lead.homeowner_leads.trade_type] || lead.homeowner_leads.trade_type}
                          </td>
                          <td className="px-6 py-4 text-[#374151]">
                            {lead.homeowner_leads.postal_code}
                          </td>
                          <td className="px-6 py-4 text-[#374151] max-w-xs truncate">
                            {lead.homeowner_leads.job_description.slice(0, 80)}
                            {lead.homeowner_leads.job_description.length > 80 ? '…' : ''}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-[#0f172a] font-medium">{lead.homeowner_leads.name}</div>
                            <div className="text-[#2563eb]">{lead.homeowner_leads.phone}</div>
                            {lead.homeowner_leads.email && (
                              <div className="text-[#6b7280] text-xs">{lead.homeowner_leads.email}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 text-[#6b7280] whitespace-nowrap">
                            {new Date(lead.created_at).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              lead.delivery_status === 'sent'
                                ? 'bg-[#dcfce7] text-[#16a34a]'
                                : lead.delivery_status === 'failed'
                                ? 'bg-red-50 text-red-600'
                                : 'bg-yellow-50 text-yellow-600'
                            }`}>
                              {lead.delivery_status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
