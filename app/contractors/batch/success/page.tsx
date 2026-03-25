'use client'

import { useEffect, useState, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { CheckCircle, Download } from 'lucide-react'
import { Suspense } from 'react'

function SuccessContent() {
  const params = useSearchParams()
  const sessionId = params.get('session_id')
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const downloaded = useRef(false)

  useEffect(() => {
    if (!sessionId || downloaded.current) return
    downloaded.current = true

    // Trigger automatic download
    const link = document.createElement('a')
    link.href = `/api/permits/batch-download?session_id=${sessionId}`
    link.click()
    setStatus('ready')
  }, [sessionId])

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white border border-[#e2e8f0] rounded-2xl p-10 shadow-sm text-center">
        <div className="w-16 h-16 bg-[#f0fdf4] rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={32} strokeWidth={2} className="text-[#22c55e]" />
        </div>
        <h1 className="text-2xl font-bold text-[#0f172a] mb-3">Payment confirmed</h1>
        <p className="text-[#6b7280] mb-8">
          Your CSV is downloading now. If it didn't start automatically, click below.
        </p>

        <a
          href={`/api/permits/batch-download?session_id=${sessionId}`}
          className="inline-flex items-center gap-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold px-6 py-3 rounded-xl text-sm mb-6"
        >
          <Download size={16} strokeWidth={2} />
          Download CSV
        </a>

        <div className="bg-[#f8fafc] rounded-xl p-4 text-left space-y-2 mb-6">
          <p className="text-xs font-semibold text-[#374151] mb-2">What to do next:</p>
          {[
            'Open the CSV in Excel or Google Sheets',
            'Sort by Est. Value to find the highest-value jobs',
            'Focus on "Fast" velocity permits — these jobs are starting soon',
            'Visit the addresses or send a direct mail piece',
          ].map(tip => (
            <div key={tip} className="flex items-start gap-2">
              <span className="text-[#2563eb] font-bold text-xs mt-0.5">→</span>
              <span className="text-xs text-[#6b7280]">{tip}</span>
            </div>
          ))}
        </div>

        <a href="/contractors/batch" className="text-sm text-[#2563eb] hover:underline">
          Buy another batch
        </a>
      </div>
    </div>
  )
}

export default function BatchSuccessPage() {
  return (
    <Suspense>
      <SuccessContent />
    </Suspense>
  )
}
