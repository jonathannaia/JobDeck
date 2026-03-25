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

// Statuses that mean the project is dead — skip these
const DEAD_STATUSES = [
  'final', 'completed', 'closed', 'abandoned', 'withdrawn',
  'refusal', 'cancellation', 'cancelled',
]

function isActivePermit(status) {
  const s = (status || '').toLowerCase()
  return !DEAD_STATUSES.some(d => s.includes(d))
}

// Exclude commercial/institutional projects — over $500K is almost never a homeowner
function isResidentialScale(cost) {
  if (!cost) return true  // no cost = keep it, can't tell
  const n = parseFloat(String(cost).replace(/[^0-9.]/g, ''))
  if (isNaN(n)) return true
  return n <= 500000
}

// Velocity — how quickly a contractor can act on this lead
// Fast = job starts within weeks (fill-in work)
// Slow = months away (addition, new construction)
const FAST_SIGNALS = [
  'repair', 'replace', 'replacement', 'leak', 'drain', 'sewer', 'water service',
  'shingle', 'roofing', 'roof repair', 'eavestrough', 'gutter',
  'panel upgrade', 'electrical repair', 'furnace', 'boiler', 'heat pump',
  'deck', 'decking', 'fence', 'fencing', 'gate',
  'basement finish', 'bathroom', 'kitchen', 'window', 'door',
  'drywall', 'flooring', 'painting', 'insulation',
  'small residential', 'minor', 'alteration',
]
const SLOW_SIGNALS = [
  'new construction', 'new house', 'new home', 'addition', 'detached',
  'semi-detached', 'townhouse', 'multi-unit', 'mixed use',
  'commercial', 'industrial', 'institutional',
]

function classifyVelocity(permit) {
  const text = `${permit.type} ${permit.description}`.toLowerCase()
  if (SLOW_SIGNALS.some(s => text.includes(s))) return 'Slow'
  if (FAST_SIGNALS.some(s => text.includes(s))) return 'Fast'
  return 'Fast'  // default to fast — better to over-notify than under-notify
}

// JobDeck trade mapping — each entry: [trade name, keywords to match]
const TRADE_MAP = [
  ['Plumber',            ['plumbing', 'plumber', 'drain', 'sewer', 'water service', 'backflow', 'hot water', 'water heater']],
  ['HVAC',               ['hvac', 'mechanical', 'heating', 'cooling', 'furnace', 'air conditioning', 'heat pump', 'boiler', 'ventilation', 'ductwork', 'fireplace']],
  ['Electrician',        ['electrical', 'electrician', 'wiring', 'panel upgrade', 'generator', 'ev charger']],
  ['Roofer',             ['roofing', 'roof', 'shingle', 'eavestroughing', 'eavestrough', 'gutter', 'skylight', 'soffit', 'fascia']],
  ['Carpenter',          ['carpentry', 'framing', 'structural', 'interior alteration', 'addition', 'garage', 'kitchen', 'bathroom', 'basement', 'window', 'door', 'drywall', 'flooring']],
  ['General Contractor', ['renovation', 'reno', 'alteration', 'new construction', 'demolition', 'accessory', 'detached', 'semi-detached']],
  ['Painter',            ['painting', 'paint']],
  ['Landscaper',         ['landscaping', 'landscape', 'grading', 'retaining wall', 'pool']],
  ['Lawn Service',       ['lawn', 'sod', 'irrigation', 'sprinkler']],
  ['Decking',            ['deck', 'decking', 'porch', 'balcony']],
  ['Fencing',            ['fence', 'fencing', 'gate']],
]

function classifyTrade(permit) {
  const text = `${permit.type} ${permit.description}`.toLowerCase()
  for (const [trade, keywords] of TRADE_MAP) {
    if (keywords.some(k => text.includes(k))) return trade
  }
  return null
}

function isRelevant(permit) {
  return classifyTrade(permit) !== null
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
      const trade = classifyTrade(permit)
      if (trade && isActivePermit(permit.status) && isResidentialScale(permit.cost)) {
        results.push({ ...permit, trade, velocity: classifyVelocity(permit) })
      }
    }
    console.log(`   Toronto: ${results.length} relevant permits`)
  } catch (e) {
    console.log(`   Toronto: failed — ${e.message}`)
  }

  return results
}

// --- Mississauga ---
// services6.arcgis.com — MississaugaData (verified working)

async function scrapeMississaugaPermits() {
  const results = []
  try {
    const cutoffStr = new Date(Date.now() - MAX_AGE_DAYS * 86400000).toISOString().slice(0, 10)
    const url = `https://services6.arcgis.com/hM5ymMLbxIyWTjn2/arcgis/rest/services/Issued_Building_Permits/FeatureServer/0/query?where=ISSUE_DATE+%3E+date+%27${cutoffStr}%27&outFields=*&f=json&resultRecordCount=500&orderByFields=ISSUE_DATE+DESC`
    const data = await fetchJson(url)
    const features = data.features || []

    for (const f of features) {
      const a = f.attributes || {}
      const issued = a.ISSUE_DATE ? new Date(a.ISSUE_DATE) : null

      const permit = {
        city: 'Mississauga',
        address: a.ADDRESS || '',
        postal: a.POSTAL_CODE || '',
        type: a.SCOPE || a.FILE_TYPE || '',
        description: a.DESCRIPTION || '',
        status: a.STATUS || '',
        issued: issued ? issued.toISOString().slice(0, 10) : '',
        cost: a.EST_CON_VALUE || '',
        builder: '',
        permit_num: a.BP_NO || '',
      }
      const trade = classifyTrade(permit)
      if (trade && isActivePermit(permit.status) && isResidentialScale(permit.cost)) {
        results.push({ ...permit, trade, velocity: classifyVelocity(permit) })
      }
    }
    console.log(`   Mississauga: ${results.length} relevant permits`)
  } catch (e) {
    console.log(`   Mississauga: skipped — ${e.message}`)
  }
  return results
}

// --- Burlington ---
// mapping.burlington.ca (verified working)

async function scrapeBurlingtonPermits() {
  const results = []
  try {
    const cutoffStr = new Date(Date.now() - MAX_AGE_DAYS * 86400000).toISOString().slice(0, 10)
    const url = `https://mapping.burlington.ca/arcgisweb/rest/services/COB/Permits/MapServer/1/query?where=ISSUEDATE+%3E+date+%27${cutoffStr}%27&outFields=*&f=json&resultRecordCount=500&orderByFields=ISSUEDATE+DESC`
    const data = await fetchJson(url)
    const features = data.features || []

    for (const f of features) {
      const a = f.attributes || {}
      const issued = a.ISSUEDATE ? new Date(a.ISSUEDATE) : null

      const permit = {
        city: 'Burlington',
        address: (a.ADDRESS || '').trim(),
        postal: '',
        type: a.FOLDERTYPE || '',
        description: `${a.WORKDESC || ''} ${a.SUBDESC || ''}`.trim(),
        status: a.FOLDERSTATUSDESC || '',
        issued: issued ? issued.toISOString().slice(0, 10) : '',
        cost: a.CONSTRUCTVALUE || '',
        builder: '',
        permit_num: a.FILENO || '',
      }
      const trade = classifyTrade(permit)
      if (trade && isActivePermit(permit.status) && isResidentialScale(permit.cost)) {
        results.push({ ...permit, trade, velocity: classifyVelocity(permit) })
      }
    }
    console.log(`   Burlington: ${results.length} relevant permits`)
  } catch (e) {
    console.log(`   Burlington: skipped — ${e.message}`)
  }
  return results
}

// --- Brampton ---
// maps1.brampton.ca (verified working)

async function scrapeBramptonPermits() {
  const results = []
  try {
    const cutoffStr = new Date(Date.now() - MAX_AGE_DAYS * 86400000).toISOString().slice(0, 10)
    const url = `https://maps1.brampton.ca/arcgis/rest/services/BuildingPermit/Building_Permits/MapServer/0/query?where=ISSUEDATE+%3E+date+%27${cutoffStr}%27&outFields=*&f=json&resultRecordCount=500&orderByFields=ISSUEDATE+DESC`
    const data = await fetchJson(url)
    const features = data.features || []

    for (const f of features) {
      const a = f.attributes || {}
      const issued = a.ISSUEDATE ? new Date(a.ISSUEDATE) : null

      const permit = {
        city: 'Brampton',
        address: (a.ADDRESS || '').trim(),
        postal: '',
        type: a.SUBDESC || '',
        description: `${a.WORKDESC || ''} ${a.SUBDESC || ''}`.trim(),
        status: a.STATUSDESC || '',
        issued: issued ? issued.toISOString().slice(0, 10) : '',
        cost: a.CONSTRUCTVALUE || '',
        builder: a.BUILDER || a.CONTRACTOR || '',
        permit_num: a.PERMITNUMBER || a.GIS_ID || '',
      }
      const trade = classifyTrade(permit)
      if (trade && isActivePermit(permit.status) && isResidentialScale(permit.cost)) {
        results.push({ ...permit, trade, velocity: classifyVelocity(permit) })
      }
    }
    console.log(`   Brampton: ${results.length} relevant permits`)
  } catch (e) {
    console.log(`   Brampton: skipped — ${e.message}`)
  }
  return results
}

// --- Sudbury ---
// services.arcgis.com — Development Tracking Dashboard (verified, current data)

async function scrapeSudburyPermits() {
  const results = []
  try {
    const cutoffMs = Date.now() - MAX_AGE_DAYS * 86400000
    const url = `https://services.arcgis.com/q3mIlR87lZlZsds3/arcgis/rest/services/Development_Tracking_Dashboard_Map/FeatureServer/0/query?where=Issuance_Date+%3E+${cutoffMs}&outFields=*&f=json&resultRecordCount=500&orderByFields=Issuance_Date+DESC`
    const data = await fetchJson(url)
    const features = data.features || []

    for (const f of features) {
      const a = f.attributes || {}
      const issued = a.Issuance_Date ? new Date(a.Issuance_Date) : null

      const permit = {
        city: 'Sudbury',
        address: (a.Address || '').trim(),
        postal: '',
        type: a.Work_Type || a.Type || '',
        description: a.Description || '',
        status: a.Status || '',
        issued: issued ? issued.toISOString().slice(0, 10) : '',
        cost: a.Value || '',
        builder: '',
        permit_num: a.Permit || '',
      }
      const trade = classifyTrade(permit)
      if (trade && isActivePermit(permit.status) && isResidentialScale(permit.cost)) {
        results.push({ ...permit, trade, velocity: classifyVelocity(permit) })
      }
    }
    console.log(`   Sudbury: ${results.length} relevant permits`)
  } catch (e) {
    console.log(`   Sudbury: skipped — ${e.message}`)
  }
  return results
}

// --- Barrie ---
// gispublic.barrie.ca — Issued Building Permits 2018–present (verified, current data)

async function scrapeBarriePermits() {
  const results = []
  try {
    // Date_Status is a plain string "YYYY.MM.DD" — use string comparison
    const cutoffStr = new Date(Date.now() - MAX_AGE_DAYS * 86400000).toISOString().slice(0, 10).replace(/-/g, '.')
    const url = `https://gispublic.barrie.ca/arcgis/rest/services/Open_Data/APLI/MapServer/1/query?where=Date_Status+%3E%3D+%27${cutoffStr}%27&outFields=*&f=json&resultRecordCount=500&orderByFields=Date_Status+DESC`
    const data = await fetchJson(url)
    const features = data.features || []

    for (const f of features) {
      const a = f.attributes || {}
      // Date_Status is "YYYY.MM.DD" string
      const dateStr = (a.Date_Status || '').replace(/\./g, '-')
      const issued = dateStr ? new Date(dateStr) : null

      const permit = {
        city: 'Barrie',
        address: (a.Full_Address || '').trim(),
        postal: '',
        type: a.Sub_Type || '',
        description: a.Description || '',
        status: a.RECORD_STATUS || '',
        issued: dateStr || '',
        cost: '',
        builder: '',
        permit_num: a.RECORD_ID || '',
      }
      const trade = classifyTrade(permit)
      if (trade && isActivePermit(permit.status) && isResidentialScale(permit.cost)) {
        results.push({ ...permit, trade, velocity: classifyVelocity(permit) })
      }
    }
    console.log(`   Barrie: ${results.length} relevant permits`)
  } catch (e) {
    console.log(`   Barrie: skipped — ${e.message}`)
  }
  return results
}

// --- CSV Output ---

function writeCSV(rows) {
  if (!rows.length) return 0

  const headers = ['Velocity', 'Trade', 'City', 'Address', 'Postal', 'Permit Type', 'Description', 'Status', 'Issued Date', 'Est. Cost', 'Builder/Contractor', 'Permit #']
  const escape = v => `"${String(v || '').replace(/"/g, '""')}"`

  const exists = fs.existsSync(CSV_PATH)
  const existingNums = new Set()
  if (exists) {
    fs.readFileSync(CSV_PATH, 'utf8').split('\n').slice(1).forEach(line => {
      const cols = line.match(/"(?:[^"]|"")*"/g) || []
      if (cols[11]) existingNums.add(cols[11].replace(/^"|"$/g, ''))
    })
  }

  const newRows = rows.filter(r => !existingNums.has(r.permit_num))
  if (!newRows.length) return 0

  const lines = newRows.map(r => [
    escape(r.velocity), escape(r.trade), escape(r.city), escape(r.address), escape(r.postal),
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
  console.log(`   Last ${MAX_AGE_DAYS} days | Toronto, Mississauga, Burlington, Brampton, Barrie\n`)

  const [toronto, mississauga, burlington, brampton, barrie] = await Promise.all([
    scrapeTorontoPermits(),
    scrapeMississaugaPermits(),
    scrapeBurlingtonPermits(),
    scrapeBramptonPermits(),
    scrapeBarriePermits(),
  ])

  const cutoffDate = new Date(Date.now() - MAX_AGE_DAYS * 86400000).toISOString().slice(0, 10)

  const all = [...toronto, ...mississauga, ...burlington, ...brampton, ...barrie]
    .filter(p => p.issued && p.issued >= cutoffDate)
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
    console.log(`     [${p.trade}] ${p.type} | ${p.description.slice(0, 80)}`)
    console.log(`     Issued: ${p.issued} | Cost: ${p.cost}`)
  })
}

main().catch(console.error)
