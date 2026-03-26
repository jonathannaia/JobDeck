import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <p className="text-[#143A75] font-bold text-6xl mb-4">404</p>
        <h1 className="text-2xl font-bold text-[#0f172a] mb-3">Page not found</h1>
        <p className="text-[#6b7280] mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/contractors/batch"
            className="inline-flex items-center justify-center gap-2 bg-[#143A75] hover:bg-[#0e2d5c] text-white font-semibold px-6 py-3 rounded-xl text-sm"
          >
            Browse Permit Data
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-white border border-[#e2e8f0] hover:border-[#143A75] text-[#374151] hover:text-[#143A75] font-semibold px-6 py-3 rounded-xl text-sm"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  )
}
