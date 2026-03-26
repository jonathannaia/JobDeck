export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import UploadClient from './UploadClient'

const ADMIN_EMAIL = 'jonathan@naiadigital.org'

export default async function UploadPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== ADMIN_EMAIL) redirect('/login')

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="mb-8">
          <a href="/admin" className="text-[#6b7280] text-sm hover:text-[#374151] transition-colors">← Admin Dashboard</a>
          <h1 className="text-2xl font-bold text-[#0f172a] mt-3">Manual Permit Upload</h1>
          <p className="text-[#6b7280] text-sm mt-1">
            Import permit data from cities with no public API (e.g. Pickering). Drop a CSV export here — rows are parsed, trade-classified, and upserted instantly.
          </p>
        </div>
        <UploadClient />
      </div>
    </div>
  )
}
