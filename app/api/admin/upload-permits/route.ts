import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { TRADE_FILTERS } from '@/lib/trade-filters'

const ADMIN_EMAIL = 'jonathan@naiadigital.org'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const city = (formData.get('city') as string) || 'Pickering'
  const prefix = city.slice(0, 3).toUpperCase()

  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  const text = await file.text()
  const rows = parseCSV(text)
  if (!rows.length) return NextResponse.json({ error: 'No data rows found in CSV' }, { status: 400 })

  const permits: Record<string, unknown>[] = []

  for (const row of rows) {
    const address = findCol(row, 'address', 'location', 'property', 'street', 'civic')
    const rawNum = findCol(row, 'permit_num', 'permit_number', 'permit #', 'permit#', 'number', 'id', 'permit')
    const permitType = findCol(row, 'permit_type', 'type', 'work_type', 'work type', 'category', 'class')
    const description = findCol(row, 'description', 'desc', 'notes', 'work_description', 'details')
    const estCost = findCol(row, 'est_cost', 'estimated_cost', 'value', 'construction_value', 'building_value', 'cost')
    const issuedDate = findCol(row, 'issued_date', 'issue_date', 'date_issued', 'date', 'permit_date')

    if (!address && !rawNum) continue // skip empty rows

    const trades = classifyTrades(permitType, description)

    for (const trade of trades) {
      permits.push({
        permit_num: `${prefix}-${rawNum || address.replace(/\s+/g, '-')}|${trade}`,
        city,
        trade,
        address: address || '',
        permit_type: permitType || 'Residential',
        description: description || '',
        est_cost: estCost ? parseFloat(estCost.replace(/[^0-9.]/g, '')) || null : null,
        issued_date: parseDate(issuedDate) || null,
        status: 'Active',
      })
    }
  }

  if (!permits.length) {
    return NextResponse.json({ error: 'No valid permit rows could be parsed' }, { status: 400 })
  }

  const service = createServiceClient()
  const { error } = await service
    .from('building_permits')
    .upsert(permits, { onConflict: 'permit_num' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ imported: permits.length, rows: rows.length })
}

// ── CSV parser ──────────────────────────────────────────────────────────────

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.trim().split(/\r?\n/)
  if (lines.length < 2) return []
  const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase().trim().replace(/[^a-z0-9_]/g, '_'))
  return lines.slice(1).filter(l => l.trim()).map(line => {
    const values = parseCSVLine(line)
    return Object.fromEntries(headers.map((h, i) => [h, (values[i] ?? '').trim()]))
  })
}

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  for (const char of line) {
    if (char === '"') { inQuotes = !inQuotes }
    else if (char === ',' && !inQuotes) { result.push(current); current = '' }
    else { current += char }
  }
  result.push(current)
  return result
}

function findCol(row: Record<string, string>, ...keys: string[]): string {
  for (const key of keys) {
    const k = key.replace(/[^a-z0-9]/g, '_')
    const match = Object.keys(row).find(col => col === k || col.includes(k))
    if (match && row[match]) return row[match]
  }
  return ''
}

function parseDate(raw: string): string | null {
  if (!raw) return null
  const d = new Date(raw)
  if (isNaN(d.getTime())) return null
  return d.toISOString().split('T')[0]
}

// ── Trade classifier ────────────────────────────────────────────────────────

function classifyTrades(permitType: string, description: string): string[] {
  const text = `${permitType} ${description}`.toLowerCase()
  const matched: string[] = []

  for (const [trade, filter] of Object.entries(TRADE_FILTERS)) {
    if (filter.dbTrades) continue // skip fallback-only trades
    const hits = filter.include.some(k => text.includes(k))
    const blocked = filter.exclude.some(k => text.includes(k))
    if (hits && !blocked) matched.push(trade)
  }

  return matched.length ? matched : ['General Contractor']
}
