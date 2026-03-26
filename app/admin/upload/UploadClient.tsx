'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, CheckCircle, AlertCircle, FileText } from 'lucide-react'

const UPLOAD_CITIES = ['Pickering', 'Markham']

export default function UploadClient() {
  const [city, setCity] = useState('Pickering')
  const [file, setFile] = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ imported?: number; rows?: number; error?: string } | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped && dropped.name.endsWith('.csv')) {
      setFile(dropped)
      setResult(null)
    }
  }, [])

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
    <div className="space-y-6">

      {/* City */}
      <div className="bg-white border border-[#e2e8f0] rounded-2xl p-6">
        <label className="block text-sm font-medium text-[#374151] mb-2">City</label>
        <select
          value={city}
          onChange={e => setCity(e.target.value)}
          className="w-full border border-[#e2e8f0] rounded-xl px-4 py-3 text-sm text-[#0f172a] focus:outline-none focus:border-[#2563eb] bg-white"
        >
          {UPLOAD_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <p className="text-xs text-[#9ca3af] mt-2">
          Rows will be prefixed with <code className="bg-[#f1f5f9] px-1 rounded">{city.slice(0, 3).toUpperCase()}-</code> and upserted on <code className="bg-[#f1f5f9] px-1 rounded">permit_num</code>.
        </p>
      </div>

      {/* Drop zone */}
      <div className="bg-white border border-[#e2e8f0] rounded-2xl p-6">
        <label className="block text-sm font-medium text-[#374151] mb-3">CSV File</label>
        <div
          onDrop={onDrop}
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl px-6 py-10 text-center cursor-pointer transition-colors ${
            dragging ? 'border-[#2563eb] bg-[#EFF6FF]' : 'border-[#e2e8f0] hover:border-[#93c5fd] hover:bg-[#f8fafc]'
          }`}
        >
          {file ? (
            <div className="flex flex-col items-center gap-2">
              <FileText size={28} className="text-[#2563eb]" />
              <p className="font-semibold text-[#0f172a] text-sm">{file.name}</p>
              <p className="text-xs text-[#6b7280]">{(file.size / 1024).toFixed(1)} KB — click to change</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload size={28} className="text-[#9ca3af]" />
              <p className="text-sm font-medium text-[#374151]">Drop CSV here or click to browse</p>
              <p className="text-xs text-[#9ca3af]">Only .csv files supported</p>
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

      {/* Column guide */}
      <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl p-5">
        <p className="text-xs font-semibold text-[#374151] mb-2 uppercase tracking-wide">Expected CSV columns</p>
        <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-[#6b7280]">
          {[
            ['address / location', 'Full civic address'],
            ['permit_number / id', 'Source permit ID'],
            ['type / work_type', 'Permit category'],
            ['description / notes', 'Work description'],
            ['value / cost', 'Estimated construction value'],
            ['date_issued / date', 'Issue date (any format)'],
          ].map(([col, desc]) => (
            <div key={col} className="flex gap-2">
              <code className="text-[#2563eb] shrink-0">{col}</code>
              <span>— {desc}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-[#9ca3af] mt-3">Column names are matched loosely. Trade is auto-classified from the description.</p>
      </div>

      {/* Result */}
      {result && (
        <div className={`flex items-start gap-3 rounded-2xl px-5 py-4 ${result.error ? 'bg-red-50 border border-red-100' : 'bg-[#f0fdf4] border border-[#86efac]'}`}>
          {result.error
            ? <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
            : <CheckCircle size={18} className="text-[#16a34a] shrink-0 mt-0.5" />
          }
          <p className={`text-sm ${result.error ? 'text-red-700' : 'text-[#15803d]'}`}>
            {result.error
              ? result.error
              : <>Imported <strong>{result.imported}</strong> permit rows from <strong>{result.rows}</strong> CSV rows into {city}. They're live in the database immediately.</>
            }
          </p>
        </div>
      )}

      {/* Upload button */}
      <button
        onClick={handleUpload}
        disabled={!file || loading}
        className="w-full bg-[#0f172a] hover:bg-[#1e293b] disabled:opacity-50 text-white font-bold py-4 rounded-xl text-base transition-colors"
      >
        {loading ? 'Importing…' : `Import into ${city}`}
      </button>

    </div>
  )
}
