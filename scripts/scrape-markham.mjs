/**
 * Markham Building Permit Scraper
 *
 * Scrapes the City of Markham ePLAN Public Search for issued permits (last 30 days)
 * and upserts them into Supabase building_permits with a MRK- permit_num prefix.
 *
 * WHY this is a standalone script (not in the Vercel cron):
 *   Markham's ePLAN portal (Projectdox) has no public REST API. It requires a
 *   real browser session — not possible in a Vercel serverless function.
 *
 * Run locally:
 *   node scripts/scrape-markham.mjs
 *
 * Debug mode (saves screenshots so you can see what Puppeteer sees):
 *   node scripts/scrape-markham.mjs --debug
 *
 * Automate via GitHub Actions — see .github/workflows/scrape-markham.yml
 */

import puppeteer from 'puppeteer'
import fs from 'fs'
import path from 'path'
import https from 'https'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DEBUG = process.argv.includes('--debug')
const DRY_RUN = process.argv.includes('--dry-run') // print results, don't upsert

// ── Env ──────────────────────────────────────────────────────────────────────
const envPath = path.join(__dirname, '..', '.env.local')
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const eq = line.indexOf('=')
    if (eq > 0) process.env[line.slice(0, eq).trim()] = line.slice(eq + 1).trim()
  })
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

// ── Config ───────────────────────────────────────────────────────────────────
const PORTAL_URL = 'https://eplanportal.markham.ca'
const MAX_AGE_DAYS = 30

// ── Trade classification (mirrors lib/trade-filters.ts) ──────────────────────
const TRADE_MAP = [
  ['Plumber',                   ['plumbing', 'plumber', 'drain', 'backwater valve', 'sewer', 'water service', 'rough-in', 'hot water', 'water heater'],                         ['roofing', 'deck', 'fence', 'hvac', 'mechanical', 'furnace']],
  ['HVAC',                      ['hvac', 'mechanical', 'heating', 'cooling', 'furnace', 'air conditioning', 'heat pump', 'boiler', 'ventilation', 'ductwork', 'gas piping', 'fireplace'], ['plumbing', 'shingle', 'deck', 'fence']],
  ['Electrical / EV Charging',  ['ev charger', 'tesla wall', 'panel upgrade', '200 amp', 'service upgrade', 'sub-panel'],                                                         ['roofing', 'siding', 'deck', 'hvac', 'mechanical']],
  ['Electrician',               ['electrical', 'electrician', 'solar', 'panel change', 'wiring', 'generator', 'new building', 'second unit', 'basement apartment', 'addition'],  ['roofing', 'siding', 'deck', 'hvac', 'mechanical']],
  ['Roofer',                    ['roofing', 're-roof', 'shingle', 'flat roof', 'metal roof', 'eavestrough', 'gutter', 'skylight', 'soffit', 'fascia'],                           ['plumbing', 'hvac', 'mechanical', 'basement', 'interior alteration']],
  ['Carpenter',                 ['interior alteration', 'basement finish', 'kitchen', 'bathroom', 'window', 'door', 'drywall', 'flooring', 'renovation'],                        ['hvac', 'mechanical', 'plumbing', 'electrical', 'sewer', 'roofing', 'demolition']],
  ['General Contractor',        ['addition', 'second unit', 'new building', 'secondary suite', 'structural alteration', 'new construction', 'renovation', 'reno', 'detached', 'semi-detached'], ['demolition']],
  ['Painter',                   ['painting', 'paint'],                                                                                                                            []],
  ['Decking',                   ['deck', 'decking', 'porch', 'balcony', 'pergola', 'gazebo'],                                                                                    ['hvac', 'plumbing', 'electrical']],
  ['Fencing',                   ['fence', 'fencing', 'gate'],                                                                                                                    []],
]

const GLOBAL_EXCLUDE = ['sign ', 'signage', ' sign', 'antenna', 'cell tower', 'billboard', 'pylon']

function classifyTrade(type, desc, cost) {
  const text = `${type} ${desc}`.toLowerCase()
  if (GLOBAL_EXCLUDE.some(k => text.includes(k))) return []
  const trades = []
  const costVal = parseFloat(String(cost || '').replace(/[^0-9.]/g, ''))
  if (!isNaN(costVal) && costVal > 40000 && ['addition', 'new building', 'second storey'].some(k => text.includes(k))) {
    trades.push('General Contractor')
  }
  if (!isNaN(costVal) && costVal > 15000 && ['interior alteration', 'basement finishing', 'secondary suite'].some(k => text.includes(k))) {
    trades.push('Painter')
  }
  for (const [trade, includes, excludes] of TRADE_MAP) {
    if (!includes.some(k => text.includes(k))) continue
    if (excludes.some(k => text.includes(k))) continue
    if (!trades.includes(trade)) trades.push(trade)
  }
  if (trades.length === 0 && !isNaN(costVal) && costVal > 25000) trades.push('General Contractor')
  return trades
}

function classifyVelocity(type, desc) {
  const text = `${type} ${desc}`.toLowerCase()
  const slow = ['new construction', 'new house', 'addition', 'detached', 'semi-detached', 'townhouse']
  const fast = ['repair', 'replace', 'shingle', 'roofing', 'panel upgrade', 'furnace', 'deck', 'fence', 'basement finish', 'bathroom', 'kitchen']
  if (slow.some(s => text.includes(s))) return 'Slow'
  if (fast.some(s => text.includes(s))) return 'Fast'
  return 'Fast'
}

function mapsUrl(address) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${address}, Markham, ON`)}`
}

function isHot(dateStr) {
  if (!dateStr) return false
  return Date.now() - new Date(dateStr).getTime() < 7 * 24 * 60 * 60 * 1000
}

// ── Supabase upsert ───────────────────────────────────────────────────────────
async function upsertPermits(permits) {
  const host = new URL(SUPABASE_URL).hostname
  const body = JSON.stringify(permits)
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: host,
      path: '/rest/v1/building_permits?on_conflict=permit_num',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Prefer': 'resolution=merge-duplicates',
      },
    }, res => {
      let data = ''
      res.on('data', d => data += d)
      res.on('end', () => {
        if (res.statusCode >= 400) reject(new Error(`Supabase ${res.statusCode}: ${data}`))
        else resolve(JSON.parse(data || '[]'))
      })
    })
    req.on('error', reject)
    req.write(body)
    req.end()
  })
}

// ── Screenshot helper ─────────────────────────────────────────────────────────
async function shot(page, name) {
  if (!DEBUG) return
  const file = path.join(__dirname, `debug-markham-${name}.png`)
  await page.screenshot({ path: file, fullPage: true })
  console.log(`  📸 Screenshot: ${file}`)
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function scrapeMarkham() {
  const cutoff = new Date(Date.now() - MAX_AGE_DAYS * 86400000)
  const cutoffStr = cutoff.toISOString().slice(0, 10)

  console.log(`Scraping Markham ePLAN — permits issued since ${cutoffStr}`)

  const browser = await puppeteer.launch({
    headless: !DEBUG,  // open visible window in --debug mode so you can watch
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: { width: 1280, height: 900 },
  })

  const page = await browser.newPage()
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')

  try {
    // ── Step 1: Navigate to portal ──────────────────────────────────────────
    console.log('Opening portal...')
    await page.goto(PORTAL_URL, { waitUntil: 'networkidle2', timeout: 30000 })
    await shot(page, '1-portal-home')

    // The portal home may be a shopcart/fee page.
    // Look for a "Public" search link — Projectdox puts it front-and-centre.
    const currentUrl = page.url()
    console.log(`  Landed at: ${currentUrl}`)

    // Try the direct Projectdox public search path first
    const publicSearchPaths = [
      '/ePlan/Public/PublicSearch.aspx',
      '/ePlan/PublicSearch',
      '/PublicSearch',
    ]

    let onSearchPage = false
    for (const p of publicSearchPaths) {
      try {
        await page.goto(`${PORTAL_URL}${p}`, { waitUntil: 'networkidle2', timeout: 15000 })
        await shot(page, `2-public-search-attempt-${p.replace(/\//g, '-')}`)
        const title = await page.title()
        console.log(`  Tried ${p} → "${title}"`)
        // If we get a real search form (not an error/redirect), stop here
        const hasForm = await page.$('input, select, form') !== null
        if (hasForm && !title.toLowerCase().includes('error') && !title.toLowerCase().includes('not found')) {
          console.log('  Found search form.')
          onSearchPage = true
          break
        }
      } catch {
        // path didn't work, try next
      }
    }

    if (!onSearchPage) {
      // Fallback: look for a "Public Search" or "Search" link on whatever page we're on
      await page.goto(PORTAL_URL, { waitUntil: 'networkidle2', timeout: 20000 })
      const link = await page.evaluateHandle(() => {
        const anchors = Array.from(document.querySelectorAll('a'))
        return anchors.find(a =>
          /public.*(search|record)/i.test(a.textContent) ||
          /search.*(public|permit)/i.test(a.textContent) ||
          /permit.*search/i.test(a.textContent)
        )
      })
      if (link.asElement()) {
        console.log('  Clicking public search link...')
        await Promise.all([
          page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 20000 }),
          link.asElement().click(),
        ])
        await shot(page, '3-after-link-click')
      } else {
        throw new Error(
          'Could not find the Public Search page. Run with --debug to see screenshots.\n' +
          'Check eplanportal.markham.ca manually and update publicSearchPaths in this script.'
        )
      }
    }

    await shot(page, '4-search-page')

    // ── Step 2: Set date range filter ───────────────────────────────────────
    // Projectdox public search typically has "From Date" / "To Date" fields.
    // Try common input names/labels.
    const today = new Date().toLocaleDateString('en-CA') // YYYY-MM-DD
    const fromDate = cutoff.toLocaleDateString('en-CA')

    const dateInputSelectors = [
      // Common Projectdox field names
      ['input[name*="StartDate"], input[id*="StartDate"], input[placeholder*="From"]', fromDate],
      ['input[name*="EndDate"],   input[id*="EndDate"],   input[placeholder*="To"]',   today],
    ]

    for (const [sel, val] of dateInputSelectors) {
      const el = await page.$(sel)
      if (el) {
        await el.click({ clickCount: 3 })
        await el.type(val)
        console.log(`  Set "${sel}" → ${val}`)
      }
    }

    // Set Status = Issued if there's a status dropdown
    const statusSel = await page.$('select[name*="Status"], select[id*="Status"]')
    if (statusSel) {
      const options = await page.$$eval(`${statusSel} option`, opts =>
        opts.map(o => ({ value: o.value, text: o.textContent.trim() }))
      )
      const issuedOpt = options.find(o => /issued/i.test(o.text) || /issued/i.test(o.value))
      if (issuedOpt) {
        await page.select('select[name*="Status"], select[id*="Status"]', issuedOpt.value)
        console.log(`  Set Status → ${issuedOpt.text}`)
      }
    }

    await shot(page, '5-filters-set')

    // ── Step 3: Submit search ───────────────────────────────────────────────
    const submitSel = 'button[type="submit"], input[type="submit"], button:has-text("Search"), a:has-text("Search")'
    const submitBtn = await page.$(submitSel)
    if (submitBtn) {
      console.log('  Submitting search...')
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 }).catch(() => {}),
        submitBtn.click(),
      ])
    } else {
      // Try pressing Enter on the last filled input
      await page.keyboard.press('Enter')
      await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 }).catch(() => {})
    }

    await shot(page, '6-results')

    // ── Step 4: Scrape results ──────────────────────────────────────────────
    // Projectdox renders results in an HTML table. Each row = one permit.
    // We'll try to find any table with address/description/cost columns.
    const rawRows = await page.evaluate(() => {
      const rows = []
      const tables = document.querySelectorAll('table')
      for (const table of tables) {
        const headers = Array.from(table.querySelectorAll('th, thead td')).map(th => th.textContent.trim().toLowerCase())
        if (!headers.some(h => /address|permit|number/i.test(h))) continue
        const dataRows = table.querySelectorAll('tbody tr, tr:not(:first-child)')
        for (const tr of dataRows) {
          const cells = Array.from(tr.querySelectorAll('td')).map(td => td.textContent.trim())
          if (cells.length < 2) continue
          // Build a loose object — we'll map it by header position
          const obj = {}
          headers.forEach((h, i) => { obj[h] = cells[i] || '' })
          rows.push({ cells, headers: headers.slice(), raw: tr.textContent.trim() })
        }
      }
      return rows
    })

    console.log(`  Found ${rawRows.length} result rows`)
    if (rawRows.length === 0 && DEBUG) {
      console.log('  No rows found. Check debug screenshots to see what the page looks like.')
    }

    // ── Step 5: Parse rows into permit records ──────────────────────────────
    const permits = []

    for (const row of rawRows) {
      const { cells, headers } = row

      const idx = name => {
        const i = headers.findIndex(h => h.includes(name))
        return i >= 0 ? cells[i] || '' : ''
      }

      // Map columns by best-guess header names
      const permitNum = idx('number') || idx('permit') || idx('file') || idx('application')
      const address   = idx('address') || idx('location') || idx('street')
      const type      = idx('type') || idx('work') || idx('description') || idx('scope')
      const desc      = idx('description') || idx('work') || ''
      const status    = idx('status') || ''
      const issuedRaw = idx('issued') || idx('date') || idx('issue') || ''
      const costRaw   = idx('cost') || idx('value') || idx('est') || ''

      if (!address && !permitNum) continue

      // Normalise date (common formats: MM/DD/YYYY, YYYY-MM-DD, DD-Mon-YYYY)
      let issued_date = ''
      if (issuedRaw) {
        const d = new Date(issuedRaw)
        if (!isNaN(d.getTime())) issued_date = d.toISOString().slice(0, 10)
      }

      // Skip permits outside date window
      if (issued_date && issued_date < cutoffStr) continue

      // Only active permits
      if (status && /completed|final|closed|abandoned|withdrawn|cancelled/i.test(status)) continue

      const trades = classifyTrade(type, desc, costRaw)
      if (!trades.length) continue

      const tags = isHot(issued_date) ? ['HOT'] : []
      const num = (permitNum || `MRK-${Date.now()}-${permits.length}`).replace(/\s+/g, '')

      for (const trade of trades) {
        permits.push({
          city: 'Markham',
          address,
          postal: '',
          permit_type: type,
          description: desc,
          status: status || 'Issued',
          issued_date,
          est_cost: costRaw,
          builder: '',
          permit_num: `MRK-${num}|${trade}`,
          trade,
          velocity: classifyVelocity(type, desc),
          maps_url: mapsUrl(address),
          tags,
        })
      }
    }

    console.log(`  Classified ${permits.length} tradeable permits`)
    if (DEBUG || DRY_RUN) {
      console.log('\nSample permits:')
      permits.slice(0, 5).forEach(p => console.log(`  [${p.trade}] ${p.address} — ${p.description}`))
    }

    // ── Step 6: Upsert ──────────────────────────────────────────────────────
    if (!DRY_RUN && permits.length > 0) {
      const BATCH = 100
      let imported = 0
      for (let i = 0; i < permits.length; i += BATCH) {
        await upsertPermits(permits.slice(i, i + BATCH))
        imported += Math.min(BATCH, permits.length - i)
      }
      console.log(`\n✅ Upserted ${imported} Markham permits to Supabase`)
    } else if (DRY_RUN) {
      console.log('\n⚠️  Dry run — not writing to Supabase')
    } else {
      console.log('\n⚠️  0 permits scraped — nothing upserted')
    }

  } finally {
    await browser.close()
  }
}

scrapeMarkham().catch(err => {
  console.error('\n❌ Error:', err.message)
  process.exit(1)
})
