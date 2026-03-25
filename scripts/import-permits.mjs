/**
 * JobDeck Permit Importer
 * Reads Desktop/permits.csv and upserts into Supabase building_permits table
 *
 * Run AFTER permits.mjs:
 *   node scripts/permits.mjs && node scripts/import-permits.mjs
 */

import fs from 'fs'
import path from 'path'
import https from 'https'

const CSV_PATH = path.join(process.env.HOME, 'Desktop', 'permits.csv')

// Load .env.local
const envPath = path.join(path.dirname(new URL(import.meta.url).pathname), '..', '.env.local')
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const idx = line.indexOf('=')
    if (idx > 0) process.env[line.slice(0, idx).trim()] = line.slice(idx + 1).trim()
  })
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

function parseLine(line) {
  const cols = []
  let i = 0
  while (i <= line.length) {
    if (i === line.length) { cols.push(''); break }
    if (line[i] === '"') {
      let j = i + 1, val = ''
      while (j < line.length) {
        if (line[j] === '"' && line[j + 1] === '"') { val += '"'; j += 2 }
        else if (line[j] === '"') { j++; break }
        else val += line[j++]
      }
      cols.push(val)
      i = line[j] === ',' ? j + 1 : j + 1
    } else {
      const j = line.indexOf(',', i)
      if (j === -1) { cols.push(line.slice(i)); break }
      cols.push(line.slice(i, j))
      i = j + 1
    }
  }
  return cols
}

function parseCSV(content) {
  const lines = content.trim().split('\n')
  const headers = parseLine(lines[0])
  return lines.slice(1).filter(l => l.trim()).map(line => {
    const cols = parseLine(line)
    const row = {}
    headers.forEach((h, i) => { row[h] = cols[i] ?? '' })
    return row
  })
}

function supabaseRequest(method, path, body) {
  return new Promise((resolve, reject) => {
    const bodyStr = body ? JSON.stringify(body) : null
    const url = new URL(SUPABASE_URL)
    const options = {
      hostname: url.hostname,
      path: `/rest/v1${path}`,
      method,
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates,return=minimal',
        ...(bodyStr ? { 'Content-Length': Buffer.byteLength(bodyStr) } : {}),
      },
    }
    const req = https.request(options, res => {
      let d = ''
      res.on('data', c => d += c)
      res.on('end', () => {
        if (res.statusCode >= 400) reject(new Error(`${res.statusCode}: ${d.slice(0, 200)}`))
        else resolve(d ? JSON.parse(d) : null)
      })
    })
    req.on('error', reject)
    if (bodyStr) req.write(bodyStr)
    req.end()
  })
}

async function main() {
  if (!fs.existsSync(CSV_PATH)) {
    console.error(`Not found: ${CSV_PATH}`)
    console.error('Run node scripts/permits.mjs first')
    process.exit(1)
  }

  const rows = parseCSV(fs.readFileSync(CSV_PATH, 'utf8'))
  console.log(`\n📋 ${rows.length} permits to import\n`)

  // Map CSV columns to Supabase columns
  const records = rows.map(r => ({
    velocity:    r['Velocity'] || 'Fast',
    trade:       r['Trade'],
    city:        r['City'],
    address:     r['Address'],
    postal:      r['Postal'] || null,
    permit_type: r['Permit Type'] || null,
    description: r['Description'] || null,
    status:      r['Status'] || null,
    issued_date: r['Issued Date'] || null,
    est_cost:    r['Est. Cost'] || null,
    builder:     r['Builder/Contractor'] || null,
    permit_num:  r['Permit #'] || null,
  })).filter(r => r.trade && r.address && r.permit_num)

  console.log(`   ${records.length} valid records (filtered ${rows.length - records.length} missing key fields)`)

  // Upsert in batches of 100
  const BATCH = 100
  let imported = 0
  for (let i = 0; i < records.length; i += BATCH) {
    const batch = records.slice(i, i + BATCH)
    await supabaseRequest('POST', '/building_permits?on_conflict=permit_num', batch)
    imported += batch.length
    process.stdout.write(`\r   Imported ${imported}/${records.length}...`)
  }

  console.log(`\n\n✅ Done — ${imported} permits in Supabase`)
  console.log('   Contractors will now see permit leads on the /leads page.')
}

main().catch(console.error)
