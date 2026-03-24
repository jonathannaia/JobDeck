/**
 * JobDeck Building Permits Scraper
 * Pulls recent building permits from Ontario municipalities
 * These are homeowners who have COMMITTED to a project — very high intent
 *
 * Run: node scripts/permits.mjs
 * Output: Desktop/permits.csv
 */

import https from 'https'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const CSV_PATH = path.join(process.env.HOME, 'Desktop', 'permits.csv')

// Only show permits from last N days
const MAX_AGE_DAYS = 90

// Trades we care about
const RELEVANT_TYPES = [
  'plumbing', 'electrical', 'hvac', 'heating', 'roofing', 'renovation',
  'addition', 'alteration', 'interior', 'basement', 'deck', 'fence',
  'garage', 'kitchen', 'bathroom', 'window', 'door', 'siding',
  'demolition', 'new construction', 'accessory',
]

function isRelevant(permit) {
  const text = `${permit.type} ${permit.description}`.toLowerCase()
  return RELEVANT_TYPES.some(t => text.includes(t))
}

function daysAgo(dateStr) {
  if (!dateStr) return 999
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000)
}

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: { 'User-Agent': 'JobDeck/1.0', 'Accept': 'application/json' },
      timeout: 15000,
    }, res => {
      let d = ''
      res.on('data', c => d += c)
      res.on('end', () => {
        try { resolve(JSON.parse(d)) }
        catch { reject(new Error(`Bad JSON from ${url.slice(0, 80)}`)) }
      })
    })
    req.on('error', reject)
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')) })
  })
}

// --- Toronto ---
// API: https://ckan0.cf.opendata.inter.prod-toronto.ca
// Dataset: Active Permits + Cleared Permits

async function scrapeTorontoPermits() {
  const results = []
  const cutoff = new Date(Date.now() - MAX_AGE_DAYS * 86400000).toISOString().slice(0, 10)

  try {
    // Active permits issued recently
    const url = `https://ckan0.cf.opendata.inter.prod-toronto.ca/api/3/action/datastore_search?resource_id=6d0229af-bc54-46de-9c2b-26759b01dd05&limit=1000&sort=ISSUED_DATE+desc`
    const data = await fetchJson(url)
    const records = data.result?.records || []

    for (const r of records) {
      if (r.ISSUED_DATE && r.ISSUED_DATE < cutoff) continue
      const permit = {
        city: 'Toronto',
        address: `${r.STREET_NUM} ${r.STREET_NAME} ${r.STREET_TYPE || ''}`.trim(),
        postal: r.POSTAL || '',
        type: r.PERMIT_TYPE || '',
        description: r.DESCRIPTION || '',
        status: r.STATUS || '',
        issued: r.ISSUED_DATE || r.APPLICATION_DATE || '',
        cost: r.EST_CONST_COST || '',
        builder: r.BUILDER_NAME || '',
        permit_num: r.PERMIT_NUM || '',
      }
      if (isRelevant(permit)) results.push(permit)
    }
    console.log(`   Toronto: ${results.length} relevant permits`)
  } catch (e) {
    console.log(`   Toronto: failed — ${e.message}`)
  }

  return results
}

// --- Mississauga ---
// Uses ArcGIS REST API

async function scrapeMississaugaPermits() {
  const results = []
  try {
    const cutoff = new Date(Date.now() - MAX_AGE_DAYS * 86400000).getTime()
    const url = `https://services1.arcgis.com/7VEw9B7vMbGa4L4Y/arcgis/rest/services/Building_Permits/FeatureServer/0/query?where=1%3D1&outFields=*&f=json&resultRecordCount=200&orderByFields=IssueDate+DESC`
    const data = await fetchJson(url)
    const features = data.features || []

    for (const f of features) {
      const a = f.attributes || {}
      const issued = a.IssueDate ? new Date(a.IssueDate) : null
      if (issued && issued.getTime() < cutoff) continue

      const permit = {
        city: 'Mississauga',
        address: `${a.StreetNumber || ''} ${a.StreetName || ''}`.trim(),
        postal: a.PostalCode || '',
        type: a.PermitType || a.WorkType || '',
        description: a.Description || a.WorkDescription || '',
        status: a.Status || '',
        issued: issued ? issued.toISOString().slice(0, 10) : '',
        cost: a.ConstructionValue || a.EstimatedCost || '',
        builder: a.ContractorName || '',
        permit_num: a.PermitNumber || a.PermitNo || '',
      }
      if (isRelevant(permit)) results.push(permit)
    }
    console.log(`   Mississauga: ${results.length} relevant permits`)
  } catch (e) {
    console.log(`   Mississauga: skipped — ${e.message}`)
  }
  return results
}

// --- Hamilton ---
async function scrapeHamiltonPermits() {
  const results = []
  try {
    // Hamilton uses ArcGIS
    const url = `https://gis.hamilton.ca/arcgis/rest/services/OpenData/OpenData_Development/MapServer/4/query?where=1%3D1&outFields=*&f=json&resultRecordCount=200&orderByFields=ISSUE_DATE+DESC`
    const data = await fetchJson(url)
    const features = data.features || []
    const cutoff = Date.now() - MAX_AGE_DAYS * 86400000

    for (const f of features) {
      const a = f.attributes || {}
      const issued = a.ISSUE_DATE ? new Date(a.ISSUE_DATE) : null
      if (issued && issued.getTime() < cutoff) continue

      const permit = {
        city: 'Hamilton',
        address: `${a.STREET_NO || ''} ${a.STREET_NAME || ''}`.trim(),
        postal: a.POSTAL_CODE || '',
        type: a.PERMIT_TYPE || a.WORK_TYPE || '',
        description: a.DESCRIPTION || a.WORK_DESC || '',
        status: a.STATUS || '',
        issued: issued ? issued.toISOString().slice(0, 10) : '',
        cost: a.CONST_VALUE || a.EST_COST || '',
        builder: a.CONTRACTOR || '',
        permit_num: a.PERMIT_NO || a.PERMIT_NUM || '',
      }
      if (isRelevant(permit)) results.push(permit)
    }
    console.log(`   Hamilton: ${results.length} relevant permits`)
  } catch (e) {
    console.log(`   Hamilton: skipped — ${e.message}`)
  }
  return results
}

// --- CSV Output ---

function writeCSV(rows) {
  if (!rows.length) return 0

  const headers = ['City', 'Address', 'Postal', 'Permit Type', 'Description', 'Status', 'Issued Date', 'Est. Cost', 'Builder/Contractor', 'Permit #']
  const escape = v => `"${String(v || '').replace(/"/g, '""')}"`

  const exists = fs.existsSync(CSV_PATH)
  const existingNums = new Set()
  if (exists) {
    fs.readFileSync(CSV_PATH, 'utf8').split('\n').slice(1).forEach(line => {
      const cols = line.match(/"(?:[^"]|"")*"/g) || []
      if (cols[9]) existingNums.add(cols[9].replace(/^"|"$/g, ''))
    })
  }

  const newRows = rows.filter(r => !existingNums.has(r.permit_num))
  if (!newRows.length) return 0

  const lines = newRows.map(r => [
    escape(r.city), escape(r.address), escape(r.postal),
    escape(r.type), escape(r.description), escape(r.status),
    escape(r.issued), escape(r.cost), escape(r.builder), escape(r.permit_num),
  ].join(','))

  if (!exists) {
    fs.writeFileSync(CSV_PATH, [headers.join(','), ...lines].join('\n') + '\n')
  } else {
    fs.appendFileSync(CSV_PATH, lines.join('\n') + '\n')
  }

  return newRows.length
}

// --- Main ---

async function main() {
  console.log('🏗️  JobDeck Building Permits Scraper')
  console.log(`   Last ${MAX_AGE_DAYS} days | Toronto, Hamilton, Mississauga\n`)

  const [toronto, hamilton, mississauga] = await Promise.all([
    scrapeTorontoPermits(),
    scrapeHamiltonPermits(),
    scrapeMississaugaPermits(),
  ])

  const all = [...toronto, ...hamilton, ...mississauga]
    .sort((a, b) => (b.issued || '').localeCompare(a.issued || ''))

  if (!all.length) {
    console.log('\nNo permits found.')
    return
  }

  const added = writeCSV(all)
  console.log(`\n✅ ${all.length} relevant permits found — ${added} new`)
  console.log(`   📄 Saved to Desktop/permits.csv`)
  console.log('\n💡 These are homeowners who have ALREADY committed to a project.')
  console.log('   Use the address to find them on Facebook/Google and pitch JobDeck.')

  // Preview
  console.log('\nSample permits:')
  all.slice(0, 5).forEach(p => {
    console.log(`  📍 ${p.city} — ${p.address} ${p.postal}`)
    console.log(`     ${p.type} | ${p.description.slice(0, 80)}`)
    console.log(`     Issued: ${p.issued} | Cost: ${p.cost}`)
  })
}

main().catch(console.error)
