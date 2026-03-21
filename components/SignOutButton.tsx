'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function SignOutButton() {
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <button
      onClick={handleSignOut}
      className="text-[#6b7280] hover:text-[#0f172a] text-sm border border-[#e2e8f0] hover:border-[#94a3b8] px-4 py-2 rounded-lg transition-colors"
    >
      Sign Out
    </button>
  )
}
