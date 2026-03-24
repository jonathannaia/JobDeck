/**
 * JobDeck Homeowner Lead Scraper — Kijiji
 * Run: node scripts/scraper.mjs
 */

import puppeteer from 'puppeteer'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const CSV_PATH = path.join(__dirname, 'leads.csv')

const MAX_AGE_DAYS = 5

const HOMEOWNER_SIGNALS = [
  'need', 'looking for', 'anyone know', 'recommend', 'help me find',
  'quote', 'hire', 'seeking', 'wanted', 'required', 'who do i call',
  'any suggestions', 'any recommendations', 'does anyone', 'can someone',
  'how do i find', 'where can i find', 'can anyone', 'i need', 'wanted:',
]

const CONTRACTOR_SIGNALS = [
  'available for', 'offering', 'we provide', 'free estimate', 'free quotes',
  'years of experience', 'licensed and insured', 'serving the', 'i am a',
  "i'm a", 'call us', 'contact us', 'our team', 'we specialize', 'we offer',
  'my company', 'my business', 'affordable rates', 'competitive rates',
  'fully insured', 'fully licensed', 'we are hiring', 'hiring now',
  'looking for work', 'looking for jobs', 'seeking work', 'seeking employment',
  'my services', 'quality workmanship', 'no job too small',
  'for hire', 'plumber for hire', 'electrician for hire', 'roofer for hire',
  'painter for hire', 'handyman for hire', 'contractor for hire',
  'call paul', 'call us at', 'give us a call', 'text us', 'experienced &',
  'affordable &', '& affordable', '& experienced', 'here to help with all your',
  'all your plumbing', 'all your electrical', 'all your roofing',
]

const TRADES = [
  'plumber', 'plumbing', 'roofer', 'roofing', 'electrician', 'electrical',
  'hvac', 'furnace', 'handyman', 'carpenter', 'painter', 'landscaper',
  'lawn', 'deck', 'decking', 'fence', 'fencing', 'contractor', 'renovation',
  'drywall', 'flooring', 'tile', 'window', 'siding', 'insulation', 'gutter',
]

// Kijiji city slugs + their region codes
const CITIES = [
  { name: 'Hamilton',     slug: 'hamilton',     code: 'l80014' },
  { name: 'Burlington',   slug: 'burlington',   code: 'l80026' },
  { name: 'Kitchener',    slug: 'kitchener-waterloo', code: 'l1700212' },
  { name: 'Toronto',      slug: 'city-of-toronto', code: 'l1700273' },
  { name: 'Mississauga',  slug: 'mississauga',  code: 'l1700276' },
  { name: 'Brampton',     slug: 'brampton',     code: 'l1700274' },
  { name: 'Oshawa',       slug: 'oshawa',       code: 'l1700275' },
  { name: 'Barrie',       slug: 'barrie',       code: 'l1700208' },
  { name: 'London',       slug: 'london',       code: 'l1700214' },
]

const SEARCH_TERMS = [
  'need plumber',
  'need roofer',
  'need electrician',
  'need handyman',
  'looking for contractor',
  'renovation help',
]

function isHomeownerPost(text) {
  const lower = text.toLowerCase()
  const hasHomeowner = HOMEOWNER_SIGNALS.some(s => lower.includes(s))
  const hasContractor = CONTRACTOR_SIGNALS.some(s => lower.includes(s))
  const hasTrade = TRADES.some(t => lower.includes(t))
  return hasTrade && hasHomeowner && !hasContractor
}

function extractContacts(text) {
  const phones = [...new Set(
    (text.match(/(\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g) || [])
      .filter(p => p.replace(/\D/g, '').length >= 10)
  )]
  const emails = [...new Set(
    text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || []
  )]
  return { phones, emails }
}

function isUrgent(text) {
  const urgent = ['plumber', 'plumbing', 'electrician', 'electrical', 'hvac', 'furnace', 'leak', 'flood', 'pipe']
  return urgent.some(t => text.toLowerCase().includes(t))
}

function ageLabel(ms) {
  const h = Math.floor(ms / 3600000)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

function parseKijijiDate(str) {
  if (!str) return null
  const s = str.trim().toLowerCase()
  const now = Date.now()
  if (s.includes('minute') || s.includes('just now') || s.includes('second')) return now
  if (s.includes('hour')) {
    const h = parseInt(s) || 1
    return now - h * 3600000
  }
  if (s.includes('yesterday')) return now - 86400000
  if (s.includes('day')) {
    const d = parseInt(s) || 1
    return now - d * 86400000
  }
  // Try parsing as a date string
  const parsed = new Date(str).getTime()
  return isNaN(parsed) ? null : parsed
}

async function scrapeKijiji() {
  const results = []
  const seen = new Set()
  const cutoff = Date.now() - MAX_AGE_DAYS * 86400000

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  const page = await browser.newPage()
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
  await page.setViewport({ width: 1280, height: 800 })

  for (const city of CITIES) {
    for (const term of SEARCH_TERMS) {
      try {
        const encoded = encodeURIComponent(term)
        // Search in Services category (c72) for the city
        const url = `https://www.kijiji.ca/b-services/${city.slug}/${encoded}/k0c72${city.code}?sortingExpression=dateDesc`

        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 })
        await new Promise(r => setTimeout(r, 1500))

        // Extract listings
        const listings = await page.evaluate(() => {
          const items = []
          const cards = document.querySelectorAll('[data-testid="rich-card"]')

          cards.forEach(card => {
            const titleEl = card.querySelector('[data-testid="listing-title"] a')
            const title = titleEl?.textContent?.trim() || ''
            const href = titleEl?.getAttribute('href') || ''
            const dateEl = card.querySelector('[data-testid="listing-date"]')
            const dateStr = dateEl?.textContent?.trim() || ''
            const descEl = card.querySelector('[data-testid="listing-description"], [data-testid="listing-details"]')
            const desc = descEl?.textContent?.trim() || ''

            if (title && href) {
              items.push({ id: href, title, desc, dateStr, href })
            }
          })
          return items
        })

        for (const item of listings) {
          if (seen.has(item.id)) continue

          const created = parseKijijiDate(item.dateStr)
          if (created && created < cutoff) continue

          const text = `${item.title} ${item.desc}`
          if (!isHomeownerPost(text)) continue

          seen.add(item.id)
          const contacts = extractContacts(text)
          const age = created ? Date.now() - created : null

          results.push({
            source: `Kijiji ${city.name}`,
            title: item.title,
            snippet: item.desc.slice(0, 250),
            url: item.href.startsWith('http') ? item.href : `https://www.kijiji.ca${item.href}`,
            ageLabel: age ? ageLabel(age) : 'Unknown age',
            ageMs: age || 0,
            urgent: isUrgent(text),
            contacts,
          })
        }

        await new Promise(r => setTimeout(r, 1000))
      } catch (e) {
        // skip failed pages
      }
    }
  }

  await browser.close()
  return results
}

function printResult(r) {
  const urgentTag = r.urgent ? '  ⚡ URGENT — act within 24h' : ''
  const hasContact = r.contacts.phones.length > 0 || r.contacts.emails.length > 0

  console.log(`\n${'─'.repeat(65)}`)
  console.log(`📍 ${r.source}  ·  ${r.ageLabel}${urgentTag}`)
  console.log(`📌 ${r.title}`)
  if (r.snippet) console.log(`   ${r.snippet}${r.snippet.length >= 250 ? '...' : ''}`)
  console.log(`🔗 ${r.url}`)

  if (hasContact) {
    console.log('📞 CONTACT INFO FOUND:')
    r.contacts.phones.forEach(p => console.log(`   ☎  ${p}`))
    r.contacts.emails.forEach(e => console.log(`   ✉  ${e}`))
  } else {
    console.log('💬 No contact info — reply and ask them to post on jobdeck.ca')
  }
}

async function main() {
  console.log('🔍 JobDeck Lead Scraper — Kijiji')
  console.log(`   Scanning ${CITIES.length} Ontario cities, last ${MAX_AGE_DAYS} days...\n`)

  const results = await scrapeKijiji()
  results.sort((a, b) => a.ageMs - b.ageMs)

  if (results.length === 0) {
    console.log('No homeowner leads found. Try again later.')
    return
  }

  const withContact = results.filter(r => r.contacts.phones.length || r.contacts.emails.length)
  const withoutContact = results.filter(r => !r.contacts.phones.length && !r.contacts.emails.length)
  const urgent = results.filter(r => r.urgent)

  console.log(`✅ Found ${results.length} homeowner leads`)
  console.log(`   📞 ${withContact.length} with contact info`)
  console.log(`   💬 ${withoutContact.length} without contact info`)
  if (urgent.length) console.log(`   ⚡ ${urgent.length} urgent — act within 24h`)

  if (withContact.length > 0) {
    console.log('\n\n══════════════════════════════════════════════════════════')
    console.log('  LEADS WITH CONTACT INFO')
    console.log('══════════════════════════════════════════════════════════')
    withContact.forEach(printResult)
  }

  if (withoutContact.length > 0) {
    console.log('\n\n══════════════════════════════════════════════════════════')
    console.log('  LEADS — REPLY & DIRECT TO JOBDECK.CA')
    console.log('══════════════════════════════════════════════════════════')
    withoutContact.forEach(printResult)
  }

  console.log(`\n${'─'.repeat(65)}`)
  console.log(`Done. ${results.length} leads found.\n`)

  // Write to CSV
  writeCSV(results)
}

function writeCSV(results) {
  const headers = ['Source', 'Title', 'Description', 'URL', 'Age', 'Phone', 'Email', 'Has Contact', 'Urgent']
  const escape = v => `"${String(v || '').replace(/"/g, '""')}"`

  const exists = fs.existsSync(CSV_PATH)
  const existingUrls = new Set()

  if (exists) {
    const lines = fs.readFileSync(CSV_PATH, 'utf8').split('\n').slice(1)
    lines.forEach(line => {
      const cols = line.match(/"[^"]*"/g) || []
      if (cols[2]) existingUrls.add(cols[2].replace(/"/g, ''))
    })
  }

  const newRows = results.filter(r => !existingUrls.has(r.url))
  if (newRows.length === 0) {
    console.log('📄 No new leads to add to CSV (all duplicates).')
    return
  }

  const rows = newRows.map(r => [
    escape(r.source),
    escape(r.title),
    escape(r.snippet),
    escape(r.url),
    escape(r.ageLabel),
    escape(r.contacts.phones.join(', ')),
    escape(r.contacts.emails.join(', ')),
    escape(r.contacts.phones.length || r.contacts.emails.length ? 'YES' : 'no'),
    escape(r.urgent ? 'YES' : 'no'),
  ].join(','))

  if (!exists) {
    fs.writeFileSync(CSV_PATH, [headers.join(','), ...rows].join('\n') + '\n')
  } else {
    fs.appendFileSync(CSV_PATH, rows.join('\n') + '\n')
  }

  console.log(`📄 ${newRows.length} new leads saved to scripts/leads.csv`)
  console.log('   Drag the file into Google Sheets or File → Import to view.')
}

main().catch(console.error)
