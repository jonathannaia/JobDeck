'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'

export default function Navbar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const links = [
    { href: '/', label: 'Post a Job' },
    { href: '/contractors', label: 'For Contractors' },
    { href: '/dashboard', label: 'Dashboard' },
  ]

  return (
    <nav className="bg-white border-b border-[#e2e8f0] sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center shrink-0">
            <img src="/logo.svg" alt="JobDeck" className="h-9 w-auto" />
          </Link>

          {/* Desktop nav */}
          <div className="hidden sm:flex items-center gap-6">
            {links.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`text-sm font-medium transition-colors whitespace-nowrap ${
                  pathname === href || (href !== '/' && pathname.startsWith(href))
                    ? 'text-[#0f172a]'
                    : 'text-[#6b7280] hover:text-[#0f172a]'
                }`}
              >
                {label}
              </Link>
            ))}
            <Link
              href="/leads"
              className="bg-[#143A75] hover:bg-[#0e2d5c] text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-sm whitespace-nowrap"
            >
              Browse Leads
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="sm:hidden p-2 text-[#6b7280] hover:text-[#0f172a]"
            onClick={() => setMobileOpen(o => !o)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={22} strokeWidth={2} /> : <Menu size={22} strokeWidth={2} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="sm:hidden border-t border-[#e2e8f0] bg-white px-4 py-4 space-y-1">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                pathname === href || (href !== '/' && pathname.startsWith(href))
                  ? 'bg-[#EFF6FF] text-[#0e2d5c]'
                  : 'text-[#374151] hover:bg-[#f8fafc]'
              }`}
            >
              {label}
            </Link>
          ))}
          <div className="pt-2">
            <Link
              href="/leads"
              onClick={() => setMobileOpen(false)}
              className="block text-center bg-[#143A75] hover:bg-[#0e2d5c] text-white text-sm font-semibold px-5 py-3 rounded-xl"
            >
              Browse Leads
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
