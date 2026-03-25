/**
 * JobDeck Permit Enricher
 * Tries to find homeowner name + phone for each permit address.
 *
 * Sources tried in order:
 *   1. Canada411 (address search)
 *   2. 411.ca
 *
 * Run: node scripts/enrich-permits.mjs
 * Output: Desktop/permits-enriched.csv
 *
 * Hit rate realistically 5–20%. Anything found is a bonus.
 */

import puppeteer from 'puppeteer'
import fs from 'fs'
import path from 'path'

const CSV_IN        = path.join(process.env.HOME, 'Desktop', 'permits.csv')
const CSV_OUT       = path.join(process.env.HOME, 'Desktop', 'permits-enriched.csv')
const PROGRESS_FILE = path.join(process.env.HOME, 'Desktop', 'permits-progress.json')

const DELAY_MS = 3000  // polite delay between requests

// Skip units, suites, commercial multi-unit
function isResidential(address) {
  if (!address || !/^\d/.test(address.trim())) return false
  const lower = address.toLowerCase()
  const skip = ['unit ', 'suite ', ' fl ', '#', 'apt ', 'ste ', ' po box']
  return !skip.some(s => lower.includes(s))
}

// Extract just the street number from an address like "93 Middleton Way, Brampton..."
function streetNumber(address) {
  const m = address.trim().match(/^(\d+)/)
  return m ? m[1] : null
}

// Extract street name (first word(s) after the number)
function streetName(address) {
  // e.g. "93 Middleton Way, Brampton, ON, L6S 4B2" → "Middleton Way"
  const m = address.trim().match(/^\d+\s+([^,]+)/)
  return m ? m[1].trim() : ''
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

function writeCSV(rows, filePath) {
  if (!rows.length) return
  const headers = Object.keys(rows[0])
  const escape = v => `"${String(v || '').replace(/"/g, '""')}"`
  const lines = [
    headers.join(','),
    ...rows.map(r => headers.map(h => escape(r[h])).join(',')),
  ]
  fs.writeFileSync(filePath, lines.join('\n') + '\n')
}

function formatPhone(digits) {
  const d = digits.replace(/\D/g, '').slice(-10)
  if (d.length === 10) return `(${d.slice(0,3)}) ${d.slice(3,6)}-${d.slice(6)}`
  return digits
}

// ── Canada411 (address search) ──────────────────────────────────────────────
async function lookupCanada411(page, address, city, postal) {
  try {
    const num    = streetNumber(address)
    const street = streetName(address)
    if (!num || !street) return null

    // Use address-type search (stype=ad) — more reliable than people search
    const params = new URLSearchParams({
      stype: 'ad',
      st:    `${num} ${street}`,
      ci:    city,
      pv:    'ON',
      pc:    postal || '',
    })
    const url = `https://www.canada411.ca/search/?${params}`
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 25000 })
    await new Promise(r => setTimeout(r, 1200))

    const result = await page.evaluate((targetNum) => {
      const cards = document.querySelectorAll('.vcard, .result, [class*="listing"], [class*="result"]')
      for (const card of cards) {
        const text = card.textContent || ''
        // Check if this card's address starts with our street number
        const addrMatch = text.match(/\b(\d+)\s+\w/)
        if (addrMatch && addrMatch[1] === targetNum) {
          // Extract phone
          const phoneMatch = text.match(/\((\d{3})\)\s*(\d{3})-(\d{4})/)
          // Extract name (first line of card usually)
          const nameEl = card.querySelector('a, .fn, [class*="name"]')
          const name = nameEl ? nameEl.textContent.trim() : ''
          if (phoneMatch) {
            return {
              name,
              phone: `${phoneMatch[1]}${phoneMatch[2]}${phoneMatch[3]}`,
              source: 'Canada411',
            }
          }
        }
      }

      // Fallback: if only 1 result on page, trust it
      const allPhones = []
      const allCards  = document.querySelectorAll('.vcard, [class*="result-item"], [class*="listing-item"]')
      if (allCards.length === 1) {
        const text = allCards[0].textContent || ''
        const phoneMatch = text.match(/\((\d{3})\)\s*(\d{3})-(\d{4})/)
        const nameEl = allCards[0].querySelector('a, .fn, [class*="name"]')
        if (phoneMatch) {
          return {
            name: nameEl ? nameEl.textContent.trim() : '',
            phone: `${phoneMatch[1]}${phoneMatch[2]}${phoneMatch[3]}`,
            source: 'Canada411',
          }
        }
      }

      return null
    }, num)

    return result
  } catch (e) {
    return null
  }
}

// ── 411.ca ───────────────────────────────────────────────────────────────────
async function lookup411ca(page, address, city, postal) {
  try {
    const num    = streetNumber(address)
    const street = streetName(address)
    if (!num || !street) return null

    const params = new URLSearchParams({
      who:   '',
      where: `${num} ${street}, ${city}, ON`,
    })
    const url = `https://www.411.ca/search/combined?${params}`
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 25000 })
    await new Promise(r => setTimeout(r, 1200))

    const result = await page.evaluate((targetNum) => {
      const cards = document.querySelectorAll('.listing, .result, [class*="listing"], [class*="result"]')
      for (const card of cards) {
        const text = card.textContent || ''
        const addrMatch = text.match(/\b(\d+)\s+\w/)
        if (addrMatch && addrMatch[1] === targetNum) {
          const phoneMatch = text.match(/\((\d{3})\)\s*(\d{3})-(\d{4})/)
          const nameEl = card.querySelector('a, [class*="name"], strong')
          if (phoneMatch) {
            return {
              name: nameEl ? nameEl.textContent.trim() : '',
              phone: `${phoneMatch[1]}${phoneMatch[2]}${phoneMatch[3]}`,
              source: '411.ca',
            }
          }
        }
      }
      return null
    }, num)

    return result
  } catch (e) {
    return null
  }
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  if (!fs.existsSync(CSV_IN)) {
    console.error(`❌ Not found: ${CSV_IN}`)
    console.error('   Run node scripts/permits.mjs first')
    process.exit(1)
  }

  const rows = parseCSV(fs.readFileSync(CSV_IN, 'utf8'))
  console.log(`\n📋 Loaded ${rows.length} permits`)

  const progress = fs.existsSync(PROGRESS_FILE)
    ? JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'))
    : {}
  console.log(`   ${Object.keys(progress).length} already looked up`)

  const toEnrich = rows.filter(r => {
    if (!r['Address']) return false
    if (progress[r['Permit #']] !== undefined) return false
    if (!isResidential(r['Address'])) return false
    return true
  })

  console.log(`   ${toEnrich.length} addresses to look up`)
  console.log(`   Est. time: ~${Math.ceil(toEnrich.length * DELAY_MS / 60000)} min\n`)

  if (!toEnrich.length) {
    applyAndWrite(rows, progress)
    return
  }

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })
  const page = await browser.newPage()
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36')
  await page.setViewport({ width: 1280, height: 900 })

  let found = 0

  for (let i = 0; i < toEnrich.length; i++) {
    const permit  = toEnrich[i]
    const address = permit['Address']
    const city    = permit['City'] || ''
    const postal  = (permit['Postal'] || '').replace(/\s/g, '')
    const key     = permit['Permit #'] || address

    process.stdout.write(`[${i+1}/${toEnrich.length}] ${address.slice(0, 50).padEnd(50)} `)

    // Try Canada411 first
    let hit = await lookupCanada411(page, address, city, postal)
    await new Promise(r => setTimeout(r, DELAY_MS))

    // Fallback to 411.ca
    if (!hit) {
      hit = await lookup411ca(page, address, city, postal)
      await new Promise(r => setTimeout(r, DELAY_MS))
    }

    if (hit) {
      progress[key] = { name: hit.name, phone: hit.phone, source: hit.source }
      found++
      console.log(`✓ ${formatPhone(hit.phone)} ${hit.name ? `(${hit.name})` : ''} [${hit.source}]`)
    } else {
      progress[key] = ''
      console.log('—')
    }

    // Save progress every 10
    if ((i + 1) % 10 === 0) {
      fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2))
    }
  }

  await browser.close()
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2))

  console.log(`\n📞 Found contact info for ${found} / ${toEnrich.length} addresses\n`)
  applyAndWrite(rows, progress)
}

function applyAndWrite(rows, progress) {
  const enriched = rows.map(r => {
    const key  = r['Permit #'] || r['Address']
    const hit  = progress[key]
    const name  = (hit && hit.name)  ? hit.name  : (r['Owner Name']  || '')
    const phone = (hit && hit.phone) ? formatPhone(hit.phone) : (r['Phone'] || '')
    return { ...r, 'Owner Name': name, Phone: phone }
  })

  writeCSV(enriched, CSV_OUT)

  const withPhone = enriched.filter(r => r['Phone']).length
  console.log(`✅ ${withPhone} permits have a phone number`)
  console.log(`   📄 Saved to Desktop/permits-enriched.csv`)
}

main().catch(console.error)
