import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export const maxDuration = 300

// How many days back each trade's permits remain valid leads
const TRADE_MAX_AGE: Record<string, number> = {
  Painter:              90, // long renovations — lead stays active for months
  Carpenter:            90,
  'General Contractor': 90,
  Roofer:               30, // urgent repairs — filled quickly
  Plumber:              30,
  Electrician:          30,
  HVAC:                 30,
  Decking:              60,
  Fencing:              60,
  Landscaper:           60,
  'Lawn Service':       30,
}
const DEFAULT_MAX_AGE = 30

function cutoffForTrade(trade: string): string {
  const days = TRADE_MAX_AGE[trade] ?? DEFAULT_MAX_AGE
  return new Date(Date.now() - days * 86400000).toISOString().slice(0, 10)
}

// Outer fetch window — use the most permissive to avoid excluding anything prematurely
const MAX_AGE_DAYS = 90

const DEAD_STATUSES = ['final', 'completed', 'closed', 'abandoned', 'withdrawn', 'refusal', 'cancellation', 'cancelled']

function isActivePermit(status: string) {
  const s = (status || '').toLowerCase()
  return !DEAD_STATUSES.some(d => s.includes(d))
}

function isResidentialScale(cost: string | number) {
  if (!cost) return true
  const n = parseFloat(String(cost).replace(/[^0-9.]/g, ''))
  if (isNaN(n)) return true
  return n >= 2000 && n <= 500000
}

const FAST_SIGNALS = ['repair', 'replace', 'replacement', 'leak', 'drain', 'sewer', 'water service', 'shingle', 'roofing', 'roof repair', 'eavestrough', 'gutter', 'panel upgrade', 'electrical repair', 'furnace', 'boiler', 'heat pump', 'deck', 'decking', 'fence', 'fencing', 'gate', 'basement finish', 'bathroom', 'kitchen', 'window', 'door', 'drywall', 'flooring', 'painting', 'insulation', 'small residential', 'minor', 'alteration']
const SLOW_SIGNALS = ['new construction', 'new house', 'new home', 'addition', 'detached', 'semi-detached', 'townhouse', 'multi-unit', 'mixed use', 'commercial', 'industrial', 'institutional']

function classifyVelocity(type: string, description: string) {
  const text = `${type} ${description}`.toLowerCase()
  if (SLOW_SIGNALS.some(s => text.includes(s))) return 'Slow'
  if (FAST_SIGNALS.some(s => text.includes(s))) return 'Fast'
  return 'Fast'
}

// Permits matching any of these are discarded entirely — not residential trade work
const GLOBAL_EXCLUDE = ['sign ', 'signage', ' sign', 'antenna', 'cell tower', 'billboard', 'pylon', 'telecommunication']

// [trade, include_keywords, exclude_keywords]
// Municipality aliases: Mechanical = HVAC (Toronto), Heating = HVAC (Brampton), Small Residential = GC (Mississauga)
const TRADE_MAP: [string, string[], string[]][] = [
  ['Plumber',            ['plumbing', 'plumber', 'drain', 'backwater valve', 'sewer', 'water service', 'rough-in', 'hot water', 'water heater'], ['roofing', 'deck', 'fence', 'hvac', 'mechanical', 'furnace']],
  ['HVAC',               ['hvac', 'mechanical', 'heating', 'cooling', 'furnace', 'air conditioning', 'heat pump', 'boiler', 'ventilation', 'ductwork', 'gas piping', 'fireplace'], ['plumbing', 'shingle', 'deck', 'fence']],
  ['Electrician',        ['electrical', 'electrician', 'service upgrade', 'ev charger', 'solar', 'panel change', 'panel upgrade', 'wiring', 'generator'], ['roofing', 'siding', 'deck', 'hvac', 'mechanical']],
  ['Roofer',             ['roofing', 're-roof', 'shingle', 'flat roof', 'metal roof', 'roof structure', 'eavestroughing', 'eavestrough', 'gutter', 'skylight', 'soffit', 'fascia'], ['plumbing', 'hvac', 'mechanical', 'basement', 'interior alteration', 'sign', 'antenna']],
  ['Carpenter',          ['interior alteration', 'basement finish', 'kitchen', 'bathroom', 'window', 'door', 'drywall', 'flooring', 'framing', 'carpentry'], ['hvac', 'mechanical', 'plumbing', 'electrical', 'sewer', 'roofing', 'demolition', 'overhead door', 'garage door']],
  ['General Contractor', ['addition', 'second unit', 'new building', 'secondary suite', 'structural alteration', 'new construction', 'renovation', 'reno', 'alteration', 'small residential', 'detached', 'semi-detached'], ['demolition']],
  ['Painter',            ['painting', 'paint'], []],
  ['Decking',            ['deck', 'decking', 'porch', 'balcony', 'pergola', 'gazebo'], ['hvac', 'plumbing', 'electrical']],
  ['Fencing',            ['fence', 'fencing', 'gate'], []],
  ['Landscaper',         ['landscaping', 'landscape', 'grading', 'retaining wall', 'pool'], []],
  ['Lawn Service',       ['lawn', 'sod', 'irrigation', 'sprinkler'], []],
]

// High-rise keywords: these permits exclude Roofer and Decking (residential contractors can't service them)
const HIGH_RISE_SIGNALS = ['condominium', 'apartment', 'high-rise', 'highrise', 'tower', 'multi-unit', 'office building']

const HOT_WINDOW_MS = 7 * 24 * 60 * 60 * 1000

function parseCost(cost: string | number | undefined): number {
  if (!cost) return NaN
  const n = parseFloat(String(cost).replace(/[^0-9.]/g, ''))
  return isNaN(n) ? NaN : n
}

function mapsUrl(address: string, city: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${address} ${city}`)}`
}

function isHotPermit(issuedDate: string): boolean {
  if (!issuedDate) return false
  return Date.now() - new Date(issuedDate).getTime() < HOT_WINDOW_MS
}

// City-specific term normalization — translate municipal jargon to standard JobDeck keywords
// before trade classification so the same logic works across all cities
const CITY_ALIASES: { city: string; match: string; inject: string }[] = [
  { city: 'Mississauga', match: 'second unit',     inject: 'Basement Finish' },
  { city: 'Mississauga', match: 'accessory unit',  inject: 'Basement Finish' },
  { city: 'Toronto',     match: 'small residential', inject: 'Renovation' },
  { city: 'Toronto',     match: 'house',            inject: 'Renovation' },
  { city: 'Brampton',    match: 'accessory loft',   inject: 'Secondary Suite' },
  { city: 'Brampton',    match: 'accessory apt',    inject: 'Secondary Suite' },
  { city: 'Hamilton',    match: 'residential alteration', inject: 'Interior Alteration' },
  { city: 'Hamilton',    match: 'accessory building',    inject: 'Renovation' },
  { city: 'Ottawa',      match: 'interior renovation',   inject: 'Interior Alteration' },
  { city: 'Ottawa',      match: 'internal alteration',   inject: 'Interior Alteration' },
  { city: 'Ottawa',      match: 'tenant improvement',    inject: 'Renovation' },
  { city: 'Ottawa',      match: 'dwelling unit',         inject: 'Renovation' },
]

function normalizePermit(city: string, type: string, desc: string): string {
  const combined = `${type} ${desc}`.toLowerCase()
  const injections: string[] = []
  for (const alias of CITY_ALIASES) {
    if (alias.city === city && combined.includes(alias.match)) {
      injections.push(alias.inject)
    }
  }
  return injections.length ? `${type} ${desc} ${injections.join(' ')}` : `${type} ${desc}`
}

// Returns all matching trades for a permit (multi-trade tagging)
function classifyTrade(city: string, type: string, description: string, cost?: string | number): string[] {
  // Step 1: normalize city-specific terms before matching
  const normalized = normalizePermit(city, type, description)
  const text = normalized.toLowerCase()

  // Step 2: global exclusions — discard non-trade permits entirely
  if (GLOBAL_EXCLUDE.some(k => text.includes(k))) return []

  const costVal = parseCost(cost)
  const trades: string[] = []
  const isHighRise = HIGH_RISE_SIGNALS.some(k => text.includes(k))

  // Step 3: high-value structural work → General Contractor
  if (!isNaN(costVal) && costVal > 40000) {
    if (['addition', 'new building', 'second storey', 'second story'].some(k => text.includes(k))) {
      trades.push('General Contractor')
    }
  }

  // Step 4: high-value interior work → Painter (renovation intent signal)
  if (!isNaN(costVal) && costVal > 15000) {
    if (['interior alteration', 'basement finishing', 'secondary suite'].some(k => text.includes(k))) {
      trades.push('Painter')
    }
  }

  // Step 5: keyword matching with negative constraints + high-rise exclusions
  for (const [trade, includes, excludes] of TRADE_MAP) {
    if (!includes.some(k => text.includes(k))) continue
    if (excludes.some(k => text.includes(k))) continue
    if (isHighRise && (trade === 'Roofer' || trade === 'Decking')) continue
    if (!trades.includes(trade)) trades.push(trade)
  }

  // Step 6: unmapped city fallback — high-value unclassified permit → General Contractor
  if (trades.length === 0 && !isNaN(costVal) && costVal > 25000) {
    trades.push('General Contractor')
  }

  return trades
}

async function fetchJson(url: string) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'JobDeck/1.0', 'Accept': 'application/json' },
    signal: AbortSignal.timeout(15000),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

type Permit = {
  city: string
  address: string
  postal: string
  permit_type: string
  description: string
  status: string
  issued_date: string
  est_cost: string
  builder: string
  permit_num: string
  trade: string
  velocity: string
  maps_url: string
  tags: string[]
}

async function scrapeCity(name: string, fetcher: () => Promise<Permit[]>): Promise<{ city: string; count: number; permits: Permit[] }> {
  try {
    const permits = await fetcher()
    return { city: name, count: permits.length, permits }
  } catch (e: any) {
    console.error(`${name} failed: ${e.message}`)
    return { city: name, count: 0, permits: [] }
  }
}

async function fetchToronto(): Promise<Permit[]> {
  const cutoff = new Date(Date.now() - MAX_AGE_DAYS * 86400000).toISOString().slice(0, 10)
  const data = await fetchJson(`https://ckan0.cf.opendata.inter.prod-toronto.ca/api/3/action/datastore_search?resource_id=6d0229af-bc54-46de-9c2b-26759b01dd05&limit=1000&sort=ISSUED_DATE+desc`)
  const results: Permit[] = []
  for (const r of data.result?.records || []) {
    if (r.ISSUED_DATE && r.ISSUED_DATE < cutoff) continue
    const type = r.PERMIT_TYPE || ''
    const desc = r.DESCRIPTION || ''
    const trades = classifyTrade('Toronto', type, desc, r.EST_CONST_COST)
    if (!trades.length || !isActivePermit(r.STATUS) || !isResidentialScale(r.EST_CONST_COST)) continue
    const address = `${r.STREET_NUM} ${r.STREET_NAME} ${r.STREET_TYPE || ''}`.trim()
    const issued_date = r.ISSUED_DATE || r.APPLICATION_DATE || ''
    const tags = isHotPermit(issued_date) ? ['HOT'] : []
    for (const trade of trades) {
      if (issued_date && issued_date < cutoffForTrade(trade)) continue
      results.push({
        city: 'Toronto', address, postal: r.POSTAL || '', permit_type: type, description: desc,
        status: r.STATUS || '', issued_date, est_cost: r.EST_CONST_COST || '',
        builder: r.BUILDER_NAME || '', permit_num: `${r.PERMIT_NUM || ''}|${trade}`,
        trade, velocity: classifyVelocity(type, desc), maps_url: mapsUrl(address, 'Toronto'), tags,
      })
    }
  }
  return results
}

async function fetchMississauga(): Promise<Permit[]> {
  const cutoff = new Date(Date.now() - MAX_AGE_DAYS * 86400000).toISOString().slice(0, 10)
  const data = await fetchJson(`https://services6.arcgis.com/hM5ymMLbxIyWTjn2/arcgis/rest/services/Issued_Building_Permits/FeatureServer/0/query?where=ISSUE_DATE+%3E+date+%27${cutoff}%27&outFields=*&f=json&resultRecordCount=500&orderByFields=ISSUE_DATE+DESC`)
  const results: Permit[] = []
  for (const f of data.features || []) {
    const a = f.attributes || {}
    const type = a.SCOPE || a.FILE_TYPE || ''
    const desc = a.DESCRIPTION || ''
    const trades = classifyTrade('Mississauga', type, desc, a.EST_CON_VALUE)
    const issued_date = a.ISSUE_DATE ? new Date(a.ISSUE_DATE).toISOString().slice(0, 10) : ''
    if (!trades.length || !isActivePermit(a.STATUS) || !isResidentialScale(a.EST_CON_VALUE)) continue
    const address = a.ADDRESS || ''
    const tags = isHotPermit(issued_date) ? ['HOT'] : []
    for (const trade of trades) {
      if (issued_date && issued_date < cutoffForTrade(trade)) continue
      results.push({
        city: 'Mississauga', address, postal: a.POSTAL_CODE || '', permit_type: type, description: desc,
        status: a.STATUS || '', issued_date, est_cost: a.EST_CON_VALUE || '',
        builder: '', permit_num: `${a.BP_NO || ''}|${trade}`,
        trade, velocity: classifyVelocity(type, desc), maps_url: mapsUrl(address, 'Mississauga'), tags,
      })
    }
  }
  return results
}

async function fetchBurlington(): Promise<Permit[]> {
  const cutoff = new Date(Date.now() - MAX_AGE_DAYS * 86400000).toISOString().slice(0, 10)
  const data = await fetchJson(`https://mapping.burlington.ca/arcgisweb/rest/services/COB/Permits/MapServer/1/query?where=ISSUEDATE+%3E+date+%27${cutoff}%27&outFields=*&f=json&resultRecordCount=500&orderByFields=ISSUEDATE+DESC`)
  const results: Permit[] = []
  for (const f of data.features || []) {
    const a = f.attributes || {}
    const type = a.FOLDERTYPE || ''
    const desc = `${a.WORKDESC || ''} ${a.SUBDESC || ''}`.trim()
    const trades = classifyTrade('Burlington', type, desc, a.CONSTRUCTVALUE)
    const issued_date = a.ISSUEDATE ? new Date(a.ISSUEDATE).toISOString().slice(0, 10) : ''
    if (!trades.length || !isActivePermit(a.FOLDERSTATUSDESC) || !isResidentialScale(a.CONSTRUCTVALUE)) continue
    const address = (a.ADDRESS || '').trim()
    const tags = isHotPermit(issued_date) ? ['HOT'] : []
    for (const trade of trades) {
      if (issued_date && issued_date < cutoffForTrade(trade)) continue
      results.push({
        city: 'Burlington', address, postal: '', permit_type: type, description: desc,
        status: a.FOLDERSTATUSDESC || '', issued_date, est_cost: a.CONSTRUCTVALUE || '',
        builder: '', permit_num: `${a.FILENO || ''}|${trade}`,
        trade, velocity: classifyVelocity(type, desc), maps_url: mapsUrl(address, 'Burlington'), tags,
      })
    }
  }
  return results
}

async function fetchBrampton(): Promise<Permit[]> {
  const cutoff = new Date(Date.now() - MAX_AGE_DAYS * 86400000).toISOString().slice(0, 10)
  const data = await fetchJson(`https://maps1.brampton.ca/arcgis/rest/services/BuildingPermit/Building_Permits/MapServer/0/query?where=ISSUEDATE+%3E+date+%27${cutoff}%27&outFields=*&f=json&resultRecordCount=500&orderByFields=ISSUEDATE+DESC`)
  const results: Permit[] = []
  for (const f of data.features || []) {
    const a = f.attributes || {}
    const type = a.SUBDESC || ''
    const desc = `${a.WORKDESC || ''} ${a.SUBDESC || ''}`.trim()
    const trades = classifyTrade('Brampton', type, desc, a.CONSTRUCTVALUE)
    const issued_date = a.ISSUEDATE ? new Date(a.ISSUEDATE).toISOString().slice(0, 10) : ''
    if (!trades.length || !isActivePermit(a.STATUSDESC) || !isResidentialScale(a.CONSTRUCTVALUE)) continue
    const address = (a.ADDRESS || '').trim()
    const tags = isHotPermit(issued_date) ? ['HOT'] : []
    for (const trade of trades) {
      if (issued_date && issued_date < cutoffForTrade(trade)) continue
      results.push({
        city: 'Brampton', address, postal: '', permit_type: type, description: desc,
        status: a.STATUSDESC || '', issued_date, est_cost: a.CONSTRUCTVALUE || '',
        builder: a.BUILDER || a.CONTRACTOR || '', permit_num: `${a.PERMITNUMBER || a.GIS_ID || ''}|${trade}`,
        trade, velocity: classifyVelocity(type, desc), maps_url: mapsUrl(address, 'Brampton'), tags,
      })
    }
  }
  return results
}

async function fetchBarrie(): Promise<Permit[]> {
  const cutoff = new Date(Date.now() - MAX_AGE_DAYS * 86400000).toISOString().slice(0, 10).replace(/-/g, '.')
  const data = await fetchJson(`https://gispublic.barrie.ca/arcgis/rest/services/Open_Data/APLI/MapServer/1/query?where=Date_Status+%3E%3D+%27${cutoff}%27&outFields=*&f=json&resultRecordCount=500&orderByFields=Date_Status+DESC`)
  const results: Permit[] = []
  for (const f of data.features || []) {
    const a = f.attributes || {}
    const type = a.Sub_Type || ''
    const desc = a.Description || ''
    const trades = classifyTrade('Barrie', type, desc)
    const issued_date = (a.Date_Status || '').replace(/\./g, '-')
    if (!trades.length || !isActivePermit(a.RECORD_STATUS)) continue
    const address = (a.Full_Address || '').trim()
    const tags = isHotPermit(issued_date) ? ['HOT'] : []
    for (const trade of trades) {
      if (issued_date && issued_date < cutoffForTrade(trade)) continue
      results.push({
        city: 'Barrie', address, postal: '', permit_type: type, description: desc,
        status: a.RECORD_STATUS || '', issued_date, est_cost: '',
        builder: '', permit_num: `${a.RECORD_ID || ''}|${trade}`,
        trade, velocity: classifyVelocity(type, desc), maps_url: mapsUrl(address, 'Barrie'), tags,
      })
    }
  }
  return results
}

async function fetchHamilton(): Promise<Permit[]> {
  const cutoff = new Date(Date.now() - MAX_AGE_DAYS * 86400000).toISOString().slice(0, 10)
  // TODO: paste the real Hamilton ArcGIS URL here once confirmed from open.hamilton.ca
  const data = await fetchJson(`https://maps.hamilton.ca/arcgis/rest/services/PublicMaps/Building_Permits/MapServer/0/query?where=ISSUEDATE+%3E+date+%27${cutoff}%27&outFields=*&f=json&resultRecordCount=500&orderByFields=ISSUEDATE+DESC`)
  const results: Permit[] = []
  for (const f of data.features || []) {
    const a = f.attributes || {}
    const type = a.PERMIT_TYPE || a.WORKTYPE || ''
    // Hamilton uses DESCRIPTIO (truncated) and WORK_VALUE for cost
    const desc = (a.DESCRIPTIO || a.DESCRIPTION || '').trim()
    const cost = a.WORK_VALUE || a.CONST_VALUE || ''
    // Hamilton-specific exclusions (Sign and Pool Heater are common false positives)
    const descLower = `${type} ${desc}`.toLowerCase()
    if (descLower.includes('sign') || descLower.includes('pool heater')) continue
    const trades = classifyTrade('Hamilton', type, desc, cost)
    const issued_date = a.ISSUEDATE ? new Date(a.ISSUEDATE).toISOString().slice(0, 10) : ''
    if (!trades.length || !isActivePermit(a.STATUS || a.PERMIT_STATUS) || !isResidentialScale(cost)) continue
    const address = (a.ADDRESS || a.CIVIC_ADDRESS || '').trim()
    const tags = isHotPermit(issued_date) ? ['HOT'] : []
    for (const trade of trades) {
      if (issued_date && issued_date < cutoffForTrade(trade)) continue
      results.push({
        city: 'Hamilton', address, postal: a.POSTAL_CODE || '', permit_type: type, description: desc,
        status: a.STATUS || a.PERMIT_STATUS || '', issued_date, est_cost: cost,
        builder: a.CONTRACTOR || '', permit_num: `${a.PERMIT_NO || a.PERMIT_NUM || ''}|${trade}`,
        trade, velocity: classifyVelocity(type, desc),
        maps_url: mapsUrl(`${address}, Hamilton, ON`, ''), tags,
      })
    }
  }
  return results
}

async function fetchOttawa(): Promise<Permit[]> {
  const cutoff = new Date(Date.now() - MAX_AGE_DAYS * 86400000).toISOString().slice(0, 10)
  // TODO: paste the real Ottawa ArcGIS URL here once confirmed from open.ottawa.ca
  const data = await fetchJson(`https://maps.ottawa.ca/arcgis/rest/services/Building_Permits/MapServer/0/query?where=ISSUEDATE+%3E+date+%27${cutoff}%27&outFields=*&f=json&resultRecordCount=500&orderByFields=ISSUEDATE+DESC`)
  const results: Permit[] = []
  for (const f of data.features || []) {
    const a = f.attributes || {}
    // Ottawa uses PERMIT_TYPE_DESC for the type label and PROJECT_DESCRIPTION + ESTIMATED_VALUE
    const type = a.PERMIT_TYPE_DESC || a.PERMIT_TYPE || a.APPLICATION_TYPE || ''
    const desc = (a.PROJECT_DESCRIPTION || a.DESCRIPTION || '').trim()
    const cost = a.ESTIMATED_VALUE || a.CONSTRUCTION_VALUE || ''
    const trades = classifyTrade('Ottawa', type, desc, cost)
    const issued_date = a.ISSUEDATE ? new Date(a.ISSUEDATE).toISOString().slice(0, 10) : ''
    if (!trades.length || !isActivePermit(a.STATUS) || !isResidentialScale(cost)) continue
    const address = (a.ADDRESS || a.CIVIC_ADDRESS || '').trim()
    const tags = isHotPermit(issued_date) ? ['HOT'] : []
    for (const trade of trades) {
      if (issued_date && issued_date < cutoffForTrade(trade)) continue
      results.push({
        city: 'Ottawa', address, postal: a.POSTAL_CODE || '', permit_type: type, description: desc,
        status: a.STATUS || '', issued_date, est_cost: cost,
        builder: a.CONTRACTOR || '', permit_num: `${a.PERMIT_NUMBER || a.PERMIT_NO || ''}|${trade}`,
        trade, velocity: classifyVelocity(type, desc),
        maps_url: mapsUrl(`${address}, Ottawa, ON`, ''), tags,
      })
    }
  }
  return results
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const results = await Promise.allSettled([
    scrapeCity('Toronto', fetchToronto),
    scrapeCity('Mississauga', fetchMississauga),
    scrapeCity('Burlington', fetchBurlington),
    scrapeCity('Brampton', fetchBrampton),
    scrapeCity('Barrie', fetchBarrie),
    scrapeCity('Hamilton', fetchHamilton),
    scrapeCity('Ottawa', fetchOttawa),
  ])

  const allPermits: Permit[] = []
  const summary: Record<string, number> = {}
  for (const r of results) {
    if (r.status === 'fulfilled') {
      allPermits.push(...r.value.permits)
      summary[r.value.city] = r.value.count
    }
  }

  // Deduplicate by permit_num
  const seen = new Set<string>()
  const deduped = allPermits.filter(p => {
    if (!p.permit_num || seen.has(p.permit_num)) return false
    seen.add(p.permit_num)
    return true
  })

  // Upsert to Supabase in batches of 100
  const supabase = createServiceClient()
  const BATCH = 100
  let imported = 0
  for (let i = 0; i < deduped.length; i += BATCH) {
    const batch = deduped.slice(i, i + BATCH)
    const { error } = await supabase
      .from('building_permits')
      .upsert(batch, { onConflict: 'permit_num', ignoreDuplicates: false })
    if (!error) imported += batch.length
  }

  return NextResponse.json({
    scraped: summary,
    total_scraped: allPermits.length,
    imported,
  })
}
