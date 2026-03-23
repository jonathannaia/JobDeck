'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navbar() {
  const pathname = usePathname()

  return (
    <nav className="bg-white border-b border-[#e2e8f0] sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center">
            <span className="font-bold text-xl tracking-tight text-[#0f172a]">
              Job<span className="text-[#2563eb]">Deck</span>
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-4">
              <Link
                href="/"
                className={`text-sm font-medium transition-colors whitespace-nowrap ${
                  pathname === '/' ? 'text-[#0f172a]' : 'text-[#6b7280] hover:text-[#0f172a]'
                }`}
              >
                Post a Job
              </Link>
              <Link
                href="/contractors"
                className={`text-sm font-medium transition-colors whitespace-nowrap ${
                  pathname === '/contractors' ? 'text-[#0f172a]' : 'text-[#6b7280] hover:text-[#0f172a]'
                }`}
              >
                For Contractors
              </Link>
              <Link
                href="/leads"
                className={`text-sm font-medium transition-colors whitespace-nowrap ${
                  pathname.startsWith('/leads') ? 'text-[#0f172a]' : 'text-[#6b7280] hover:text-[#0f172a]'
                }`}
              >
                Live Leads
              </Link>
              <Link
                href="/dashboard"
                className={`text-sm font-medium transition-colors whitespace-nowrap ${
                  pathname.startsWith('/dashboard') ? 'text-[#0f172a]' : 'text-[#6b7280] hover:text-[#0f172a]'
                }`}
              >
                Dashboard
              </Link>
            </div>
            <Link
              href="/contractors#pricing"
              className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
            >
              Get Leads
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
