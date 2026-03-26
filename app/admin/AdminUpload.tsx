'use client'

import { useState, useRef } from 'react'
import { Upload, CheckCircle, AlertCircle } from 'lucide-react'

const UPLOAD_CITIES = ['Pickering', 'Markham', 'Hamilton', 'St. Catharines']

export default function AdminUpload() {
  const [city, setCity] = useState('Pickering')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ imported?: number; rows?: number; error?: string } | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleUpload() {
    if (!file) return
    setLoading(true)
    setResult(null)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('city', city)

    try {
      const res = await fetch('/api/admin/upload-permits', { method: 'POST', body: formData })
      const data = await res.json()
      setResult(data)
      if (!data.error) setFile(null)
    } catch {
      setResult({ error: 'Upload failed. Check your connection and try again.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white border border-[#e2e8f0] rounded-xl overflow-hidden mb-8">
      <div className="px-6 py-4 border-b border-[#e2e8f0] flex items-center justify-between">
        <div>
          <h2 className="text-[#0f172a] font-medium">Manual Permit Import</h2>
          <p className="text-[#6b7280] text-xs mt-0.5">Upload a CSV from a city with no public API (e.g. Pickering). Each row is parsed, trade-classified, and upserted.</p>
        </div>
      </div>

      <div className="px-6 py-6 space-y-4">
        <div className="flex gap-3 items-start flex-wrap">
          <div>
            <label className="block text-xs font-medium text-[#374151] mb-1">City</label>
            <select
              value={city}
              onChange={e => setCity(e.target.value)}
              className="border border-[#e2e8f0] rounded-lg px-3 py-2 text-sm text-[#0f172a] focus:outline-none focus:border-[#2563eb]"
            >
              {UPLOAD_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="flex-1 min-w-[240px]">
            <label className="block text-xs font-medium text-[#374151] mb-1">CSV File</label>
            <div
              onClick={() => inputRef.current?.click()}
              className="border-2 border-dashed border-[#e2e8f0] hover:border-[#2563eb] rounded-xl px-4 py-4 text-center cursor-pointer transition-colors"
            >
              {file ? (
                <p className="text-sm text-[#0f172a] font-medium">{file.name}</p>
              ) : (
                <div className="flex flex-col items-center gap-1">
                  <Upload size={20} className="text-[#9ca3af]" />
                  <p className="text-xs text-[#6b7280]">Click to select a CSV file</p>
                </div>
              )}
            </div>
            <input
              ref={inputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={e => { setFile(e.target.files?.[0] ?? null); setResult(null) }}
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={handleUpload}
              disabled={!file || loading}
              className="bg-[#0f172a] hover:bg-[#1e293b] disabled:opacity-50 text-white text-sm font-semibold px-5 py-2 rounded-xl transition-colors"
            >
              {loading ? 'Importing...' : 'Import'}
            </button>
          </div>
        </div>

        {result && (
          <div className={`flex items-start gap-2 rounded-xl px-4 py-3 text-sm ${result.error ? 'bg-red-50 text-red-700' : 'bg-[#f0fdf4] text-[#15803d]'}`}>
            {result.error
              ? <><AlertCircle size={16} className="shrink-0 mt-0.5" /><span>{result.error}</span></>
              : <><CheckCircle size={16} className="shrink-0 mt-0.5" /><span>Imported <strong>{result.imported}</strong> permit rows from {result.rows} CSV rows into {city}.</span></>
            }
          </div>
        )}

        <p className="text-xs text-[#9ca3af]">
          Expected columns (flexible): <code className="bg-[#f1f5f9] px-1 rounded">address</code>, <code className="bg-[#f1f5f9] px-1 rounded">permit_number</code>, <code className="bg-[#f1f5f9] px-1 rounded">type</code>, <code className="bg-[#f1f5f9] px-1 rounded">description</code>, <code className="bg-[#f1f5f9] px-1 rounded">value</code>, <code className="bg-[#f1f5f9] px-1 rounded">date_issued</code>. Column names are matched loosely.
        </p>
      </div>
    </div>
  )
}
