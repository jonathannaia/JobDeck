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
      className="text-white/50 hover:text-white text-sm border border-white/20 hover:border-white/40 px-4 py-2 rounded-lg transition-colors"
    >
      Sign Out
    </button>
  )
}
