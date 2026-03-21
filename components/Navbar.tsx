'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navbar() {
  const pathname = usePathname()

  return (
    <nav className="border-b border-white/10 bg-[#0a1628]/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-orange-500 font-bold text-xl tracking-tight">
              Job<span className="text-white">Deck</span>
            </span>
          </Link>

          <div className="flex items-center gap-6">
            <Link
              href="/"
              className={`text-sm font-medium transition-colors ${
                pathname === '/' ? 'text-orange-400' : 'text-white/70 hover:text-white'
              }`}
            >
              Post a Job
            </Link>
            <Link
              href="/contractors"
              className={`text-sm font-medium transition-colors ${
                pathname === '/contractors' ? 'text-orange-400' : 'text-white/70 hover:text-white'
              }`}
            >
              For Contractors
            </Link>
            <Link
              href="/dashboard"
              className={`text-sm font-medium transition-colors ${
                pathname.startsWith('/dashboard') ? 'text-orange-400' : 'text-white/70 hover:text-white'
              }`}
            >
              Dashboard
            </Link>
            <Link
              href="/contractors#pricing"
              className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              Get Leads
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
