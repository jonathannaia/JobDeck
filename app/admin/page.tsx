export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { TRADE_LABELS, type TradeType } from '@/lib/types'

const ADMIN_EMAIL = 'jonathan@naiadigital.org'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== ADMIN_EMAIL) redirect('/login')

  const service = createServiceClient()

  const [{ data: leads }, { data: contractors }] = await Promise.all([
    service.from('homeowner_leads').select('*').order('created_at', { ascending: false }).limit(100),
    service.from('contractors').select('*').order('created_at', { ascending: false }),
  ])

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-2xl font-bold text-[#0f172a] mb-8">Admin Dashboard</h1>

        {/* Contractors */}
        <div className="bg-white border border-[#e2e8f0] rounded-xl overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-[#e2e8f0] flex items-center justify-between">
            <h2 className="text-[#0f172a] font-medium">Contractors</h2>
            <span className="text-[#6b7280] text-sm">{contractors?.length ?? 0} total</span>
          </div>
          {!contractors?.length ? (
            <div className="px-6 py-10 text-center text-[#9ca3af] text-sm">No contractors yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[#6b7280] text-xs font-medium uppercase tracking-wide border-b border-[#e2e8f0] bg-[#f8fafc]">
                    <th className="px-6 py-3 text-left">Name</th>
                    <th className="px-6 py-3 text-left">Email</th>
                    <th className="px-6 py-3 text-left">Phone</th>
                    <th className="px-6 py-3 text-left">Trade</th>
                    <th className="px-6 py-3 text-left">Area</th>
                    <th className="px-6 py-3 text-left">Plan</th>
                    <th className="px-6 py-3 text-left">Leads Used</th>
                    <th className="px-6 py-3 text-left">Status</th>
                    <th className="px-6 py-3 text-left">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f1f5f9]">
                  {contractors.map((c: any) => (
                    <tr key={c.id} className="hover:bg-[#f8fafc] transition-colors">
                      <td className="px-6 py-4 text-[#0f172a] font-medium">{c.name}</td>
                      <td className="px-6 py-4 text-[#374151]">{c.email}</td>
                      <td className="px-6 py-4 text-[#374151]">{c.phone}</td>
                      <td className="px-6 py-4 text-[#374151]">{TRADE_LABELS[c.trade_type as TradeType] || c.trade_type}</td>
                      <td className="px-6 py-4 text-[#374151]">{c.service_area}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          c.plan_type === 'pro'
                            ? 'bg-[#EFF6FF] text-[#1d4ed8]'
                            : 'bg-[#f1f5f9] text-[#374151]'
                        }`}>
                          {c.plan_type === 'pro' ? 'Pro' : 'Starter'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[#374151]">
                        {c.plan_type === 'pro' ? `${c.lead_credits_used} / ∞` : `${c.lead_credits_used} / ${c.lead_credits_limit}`}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          c.is_active ? 'bg-[#dcfce7] text-[#16a34a]' : 'bg-red-50 text-red-600'
                        }`}>
                          {c.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[#6b7280] whitespace-nowrap">
                        {new Date(c.created_at).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Homeowner Leads */}
        <div className="bg-white border border-[#e2e8f0] rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#e2e8f0] flex items-center justify-between">
            <h2 className="text-[#0f172a] font-medium">Homeowner Leads</h2>
            <span className="text-[#6b7280] text-sm">{leads?.length ?? 0} total</span>
          </div>
          {!leads?.length ? (
            <div className="px-6 py-10 text-center text-[#9ca3af] text-sm">No leads yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[#6b7280] text-xs font-medium uppercase tracking-wide border-b border-[#e2e8f0] bg-[#f8fafc]">
                    <th className="px-6 py-3 text-left">Name</th>
                    <th className="px-6 py-3 text-left">Phone</th>
                    <th className="px-6 py-3 text-left">Email</th>
                    <th className="px-6 py-3 text-left">Trade</th>
                    <th className="px-6 py-3 text-left">Postal Code</th>
                    <th className="px-6 py-3 text-left">Description</th>
                    <th className="px-6 py-3 text-left">Timeline</th>
                    <th className="px-6 py-3 text-left">Status</th>
                    <th className="px-6 py-3 text-left">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f1f5f9]">
                  {leads.map((lead: any) => (
                    <tr key={lead.id} className="hover:bg-[#f8fafc] transition-colors">
                      <td className="px-6 py-4 text-[#0f172a] font-medium">{lead.name}</td>
                      <td className="px-6 py-4 text-[#2563eb]">{lead.phone}</td>
                      <td className="px-6 py-4 text-[#374151]">{lead.email || '—'}</td>
                      <td className="px-6 py-4 text-[#374151]">{TRADE_LABELS[lead.trade_type as TradeType] || lead.trade_type}</td>
                      <td className="px-6 py-4 text-[#374151]">{lead.postal_code}</td>
                      <td className="px-6 py-4 text-[#374151] max-w-xs">
                        <span className="truncate block" title={lead.job_description}>
                          {lead.job_description.slice(0, 60)}{lead.job_description.length > 60 ? '…' : ''}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[#374151] whitespace-nowrap">{lead.timeline || '—'}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          lead.status === 'matched' ? 'bg-[#dcfce7] text-[#16a34a]' : 'bg-yellow-50 text-yellow-600'
                        }`}>
                          {lead.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[#6b7280] whitespace-nowrap">
                        {new Date(lead.created_at).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
