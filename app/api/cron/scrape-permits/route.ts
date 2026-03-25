import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export const maxDuration = 300

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
  return n <= 500000
}

const FAST_SIGNALS = ['repair', 'replace', 'replacement', 'leak', 'drain', 'sewer', 'water service', 'shingle', 'roofing', 'roof repair', 'eavestrough', 'gutter', 'panel upgrade', 'electrical repair', 'furnace', 'boiler', 'heat pump', 'deck', 'decking', 'fence', 'fencing', 'gate', 'basement finish', 'bathroom', 'kitchen', 'window', 'door', 'drywall', 'flooring', 'painting', 'insulation', 'small residential', 'minor', 'alteration']
const SLOW_SIGNALS = ['new construction', 'new house', 'new home', 'addition', 'detached', 'semi-detached', 'townhouse', 'multi-unit', 'mixed use', 'commercial', 'industrial', 'institutional']

function classifyVelocity(type: string, description: string) {
  const text = `${type} ${description}`.toLowerCase()
  if (SLOW_SIGNALS.some(s => text.includes(s))) return 'Slow'
  if (FAST_SIGNALS.some(s => text.includes(s))) return 'Fast'
  return 'Fast'
}

const TRADE_MAP: [string, string[]][] = [
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

function classifyTrade(type: string, description: string): string | null {
  const text = `${type} ${description}`.toLowerCase()
  for (const [trade, keywords] of TRADE_MAP) {
    if (keywords.some(k => text.includes(k))) return trade
  }
  return null
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
    const trade = classifyTrade(type, desc)
    if (!trade || !isActivePermit(r.STATUS) || !isResidentialScale(r.EST_CONST_COST)) continue
    results.push({
      city: 'Toronto', address: `${r.STREET_NUM} ${r.STREET_NAME} ${r.STREET_TYPE || ''}`.trim(),
      postal: r.POSTAL || '', permit_type: type, description: desc, status: r.STATUS || '',
      issued_date: r.ISSUED_DATE || r.APPLICATION_DATE || '', est_cost: r.EST_CONST_COST || '',
      builder: r.BUILDER_NAME || '', permit_num: r.PERMIT_NUM || '', trade, velocity: classifyVelocity(type, desc),
    })
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
    const trade = classifyTrade(type, desc)
    const issued = a.ISSUE_DATE ? new Date(a.ISSUE_DATE).toISOString().slice(0, 10) : ''
    if (!trade || !isActivePermit(a.STATUS) || !isResidentialScale(a.EST_CON_VALUE)) continue
    results.push({
      city: 'Mississauga', address: a.ADDRESS || '', postal: a.POSTAL_CODE || '',
      permit_type: type, description: desc, status: a.STATUS || '', issued_date: issued,
      est_cost: a.EST_CON_VALUE || '', builder: '', permit_num: a.BP_NO || '', trade, velocity: classifyVelocity(type, desc),
    })
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
    const trade = classifyTrade(type, desc)
    const issued = a.ISSUEDATE ? new Date(a.ISSUEDATE).toISOString().slice(0, 10) : ''
    if (!trade || !isActivePermit(a.FOLDERSTATUSDESC) || !isResidentialScale(a.CONSTRUCTVALUE)) continue
    results.push({
      city: 'Burlington', address: (a.ADDRESS || '').trim(), postal: '',
      permit_type: type, description: desc, status: a.FOLDERSTATUSDESC || '', issued_date: issued,
      est_cost: a.CONSTRUCTVALUE || '', builder: '', permit_num: a.FILENO || '', trade, velocity: classifyVelocity(type, desc),
    })
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
    const trade = classifyTrade(type, desc)
    const issued = a.ISSUEDATE ? new Date(a.ISSUEDATE).toISOString().slice(0, 10) : ''
    if (!trade || !isActivePermit(a.STATUSDESC) || !isResidentialScale(a.CONSTRUCTVALUE)) continue
    results.push({
      city: 'Brampton', address: (a.ADDRESS || '').trim(), postal: '',
      permit_type: type, description: desc, status: a.STATUSDESC || '', issued_date: issued,
      est_cost: a.CONSTRUCTVALUE || '', builder: a.BUILDER || a.CONTRACTOR || '', permit_num: a.PERMITNUMBER || a.GIS_ID || '',
      trade, velocity: classifyVelocity(type, desc),
    })
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
    const trade = classifyTrade(type, desc)
    const issued = (a.Date_Status || '').replace(/\./g, '-')
    if (!trade || !isActivePermit(a.RECORD_STATUS)) continue
    results.push({
      city: 'Barrie', address: (a.Full_Address || '').trim(), postal: '',
      permit_type: type, description: desc, status: a.RECORD_STATUS || '', issued_date: issued,
      est_cost: '', builder: '', permit_num: a.RECORD_ID || '', trade, velocity: classifyVelocity(type, desc),
    })
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
      .upsert(batch, { onConflict: 'permit_num' })
    if (!error) imported += batch.length
  }

  return NextResponse.json({
    scraped: summary,
    total_scraped: allPermits.length,
    imported,
  })
}
