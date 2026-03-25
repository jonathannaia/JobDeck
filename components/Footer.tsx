import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-white border-t border-[#e2e8f0] py-8 px-4 mt-auto">
      <div className="max-w-6xl mx-auto flex flex-col gap-4">
        <p className="text-[#9ca3af] text-xs leading-relaxed max-w-3xl">
          JobDeck provides publicly available building permit data for informational and prospecting purposes only. We do not issue permits or represent any municipal authority. Permit records are sourced from public city databases and may not reflect current project status.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-[#9ca3af] text-sm">
          © {new Date().getFullYear()} JobDeck. Ontario&apos;s Contractor Marketplace.
        </p>
        <div className="flex items-center gap-6">
          <Link href="/privacy" className="text-[#9ca3af] hover:text-[#6b7280] text-sm transition-colors">
            Privacy Policy
          </Link>
          <Link href="/terms" className="text-[#9ca3af] hover:text-[#6b7280] text-sm transition-colors">
            Terms of Service
          </Link>
          <a href="mailto:jonathan@naiadigital.org" className="text-[#9ca3af] hover:text-[#6b7280] text-sm transition-colors">
            Contact
          </a>
        </div>
        </div>
      </div>
    </footer>
  )
}
