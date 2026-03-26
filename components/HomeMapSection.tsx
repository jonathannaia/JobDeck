'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

const PermitMap = dynamic(() => import('@/app/leads/PermitMap'), { ssr: false })

type CityCount = { city: string; count: number }

export default function HomeMapSection() {
  const [cityCounts, setCityCounts] = useState<CityCount[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    fetch('/api/permits/city-counts')
      .then(r => r.json())
      .then(data => { setCityCounts(data); setLoaded(true) })
      .catch(() => setLoaded(true))
  }, [])

  const total = cityCounts.reduce((s, c) => s + c.count, 0)

  return (
    <section className="py-20 px-4 bg-[#F4F5F7] border-t border-[#e2e8f0]">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-[#0A1A3C] mb-3">Where renovations are happening right now</h2>
          <p className="text-[#6b7280] max-w-lg mx-auto">
            Live building permits across Ontario — updated weekly. Circle size shows permit density.
          </p>
          {loaded && total > 0 && (
            <p className="mt-2 text-sm font-semibold text-[#143A75]">
              {total.toLocaleString()} active permits tracked across {cityCounts.length} cities
            </p>
          )}
        </div>

        <div className="bg-white border border-[#e2e8f0] rounded-2xl overflow-hidden shadow-[var(--shadow-glass)]">
          {/* City badges */}
          {loaded && cityCounts.length > 0 && (
            <div className="px-6 py-4 border-b border-[#e2e8f0] flex flex-wrap gap-2">
              {cityCounts.slice(0, 8).map(({ city, count }) => (
                <span key={city} className="text-xs bg-[#EFF6FF] text-[#143A75] font-semibold px-3 py-1 rounded-full">
                  {city} · {count}
                </span>
              ))}
            </div>
          )}

          {/* Map */}
          <div style={{ height: 420 }}>
            {loaded ? (
              cityCounts.length > 0
                ? <PermitMap cityCounts={cityCounts} />
                : <div className="h-full flex items-center justify-center text-[#9ca3af] text-sm">Loading map…</div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="skeleton w-full h-full rounded-none" />
              </div>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-[#9ca3af] mt-4">
          Based on publicly issued residential building permits. Data updated weekly from municipal sources.
        </p>
      </div>
    </section>
  )
}
