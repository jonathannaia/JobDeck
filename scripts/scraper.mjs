/**
 * JobDeck Homeowner Lead Scraper
 *
 * SETUP (one time):
 *   1. Go to https://www.reddit.com/prefs/apps
 *   2. Click "create another app" → choose "script"
 *   3. Name: JobDeck Scraper | Redirect URI: http://localhost:8080
 *   4. Copy the client ID (under app name) and secret
 *   5. Create scripts/.env with:
 *        REDDIT_CLIENT_ID=your_client_id
 *        REDDIT_SECRET=your_secret
 *
 * Run: node scripts/scraper.mjs
 */

import https from 'https'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Load .env from scripts/.env
const envPath = path.join(__dirname, '.env')
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const [k, v] = line.split('=')
    if (k && v) process.env[k.trim()] = v.trim()
  })
}

const REDDIT_CLIENT_ID = process.env.REDDIT_CLIENT_ID
const REDDIT_SECRET = process.env.REDDIT_SECRET

if (!REDDIT_CLIENT_ID || !REDDIT_SECRET) {
  console.error('❌ Missing Reddit credentials.')
  console.error('   See setup instructions at the top of scripts/scraper.mjs')
  process.exit(1)
}

const MAX_AGE_DAYS = 5
const URGENT_TRADES = ['plumber', 'plumbing', 'electrician', 'electrical', 'hvac', 'furnace', 'leak', 'flood', 'pipe']

const TRADES = [
  'plumber', 'plumbing', 'roofer', 'roofing', 'electrician', 'electrical',
  'hvac', 'furnace', 'handyman', 'carpenter', 'painter', 'landscaper',
  'lawn', 'deck', 'decking', 'fence', 'fencing', 'contractor', 'renovation',
  'drywall', 'flooring', 'tile', 'window', 'siding', 'insulation', 'gutter',
]

const HOMEOWNER_SIGNALS = [
  'need', 'looking for', 'anyone know', 'recommend', 'help me find',
  'quote', 'hire', 'seeking', 'wanted', 'required', 'who do i call',
  'any suggestions', 'any recommendations', 'does anyone', 'can someone',
  'how do i find', 'where can i find', 'can anyone', 'i need',
]

const CONTRACTOR_SIGNALS = [
  'available for', 'offering', 'we provide', 'free estimate', 'free quotes',
  'years of experience', 'licensed and insured', 'serving the', 'i am a',
  "i'm a", 'call us', 'contact us', 'our team', 'we specialize', 'we offer',
  'my company', 'my business', 'affordable rates', 'competitive rates',
  'fully insured', 'fully licensed', 'we are hiring', 'hiring now',
  'looking for work', 'looking for jobs', 'seeking work', 'seeking employment',
  'any leads', 'slow right now', 'slow season', 'my services',
]

const SUBREDDITS = [
  'hamilton', 'cambridge', 'kitchener', 'waterloo', 'burlington',
  'toronto', 'mississauga', 'ontario', 'GTA', 'oshawa', 'barrie',
  'londonontario', 'stcatharines',
]

const SEARCH_TERMS = [
  'need plumber', 'need roofer', 'need electrician',
  'looking for contractor', 'need handyman', 'recommend contractor',
  'need painter', 'need landscaper', 'renovation quote',
]

// --- Helpers ---

function isHomeownerPost(title, body) {
  const text = `${title} ${body}`.toLowerCase()
  const hasHomeownerSignal = HOMEOWNER_SIGNALS.some(s => text.includes(s))
  const hasContractorSignal = CONTRACTOR_SIGNALS.some(s => text.includes(s))
  const hasTrade = TRADES.some(t => text.includes(t))
  return hasTrade && hasHomeownerSignal && !hasContractorSignal
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
  return URGENT_TRADES.some(t => text.toLowerCase().includes(t))
}

function ageLabel(ms) {
  const h = Math.floor(ms / 3600000)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms))
}

function httpsPost(url, body, headers) {
  return new Promise((resolve, reject) => {
    const u = new URL(url)
    const req = https.request({
      hostname: u.hostname,
      path: u.pathname,
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(body), ...headers },
      timeout: 10000,
    }, res => {
      let d = ''
      res.on('data', c => d += c)
      res.on('end', () => { try { resolve(JSON.parse(d)) } catch { reject(new Error('Bad JSON')) } })
    })
    req.on('error', reject)
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')) })
    req.write(body)
    req.end()
  })
}

function httpsGet(url, headers) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers, timeout: 10000 }, res => {
      let d = ''
      res.on('data', c => d += c)
      res.on('end', () => { try { resolve(JSON.parse(d)) } catch { reject(new Error('Bad JSON')) } })
    })
    req.on('error', reject)
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')) })
  })
}

// --- Reddit OAuth ---

async function getRedditToken() {
  const creds = Buffer.from(`${REDDIT_CLIENT_ID}:${REDDIT_SECRET}`).toString('base64')
  const data = await httpsPost(
    'https://www.reddit.com/api/v1/access_token',
    'grant_type=client_credentials',
    {
      'Authorization': `Basic ${creds}`,
      'User-Agent': 'JobDeck/1.0 (by /u/jobdeck_ca)',
    }
  )
  return data.access_token
}

async function scrapeReddit(token) {
  const results = []
  const cutoff = Date.now() - MAX_AGE_DAYS * 86400000
  const seen = new Set()
  const headers = {
    'Authorization': `Bearer ${token}`,
    'User-Agent': 'JobDeck/1.0 (by /u/jobdeck_ca)',
  }

  for (const sub of SUBREDDITS) {
    for (const term of SEARCH_TERMS) {
      try {
        const url = `https://oauth.reddit.com/r/${sub}/search.json?q=${encodeURIComponent(term)}&sort=new&t=week&restrict_sr=1&limit=25`
        const data = await httpsGet(url, headers)
        const posts = data?.data?.children || []

        for (const { data: post } of posts) {
          if (seen.has(post.id)) continue
          const created = post.created_utc * 1000
          if (created < cutoff) continue

          const title = post.title || ''
          const body = post.selftext || ''
          if (!isHomeownerPost(title, body)) continue

          seen.add(post.id)
          const contacts = extractContacts(`${title} ${body}`)
          const age = Date.now() - created

          results.push({
            source: `Reddit r/${sub}`,
            title,
            snippet: body.slice(0, 250).trim(),
            url: `https://reddit.com${post.permalink}`,
            ageLabel: ageLabel(age),
            ageMs: age,
            urgent: isUrgent(`${title} ${body}`),
            contacts,
          })
        }

        await sleep(300)
      } catch {
        // skip failed subreddits silently
      }
    }
  }

  return results
}

// --- Output ---

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

// --- Main ---

async function main() {
  console.log('🔍 JobDeck Lead Scraper')
  console.log(`   Scanning Reddit — last ${MAX_AGE_DAYS} days...\n`)

  let token
  try {
    token = await getRedditToken()
  } catch (e) {
    console.error('❌ Failed to authenticate with Reddit:', e.message)
    console.error('   Check your REDDIT_CLIENT_ID and REDDIT_SECRET in scripts/.env')
    process.exit(1)
  }

  console.log('✅ Reddit authenticated\n')

  const results = await scrapeReddit(token)
  results.sort((a, b) => a.ageMs - b.ageMs)

  if (results.length === 0) {
    console.log('No homeowner leads found in the last', MAX_AGE_DAYS, 'days.')
    console.log('Try again tomorrow — Reddit posts are time-sensitive.')
    return
  }

  const withContact = results.filter(r => r.contacts.phones.length || r.contacts.emails.length)
  const withoutContact = results.filter(r => !r.contacts.phones.length && !r.contacts.emails.length)
  const urgent = results.filter(r => r.urgent)

  console.log(`✅ Found ${results.length} homeowner leads`)
  console.log(`   📞 ${withContact.length} with contact info — add directly to JobDeck`)
  console.log(`   💬 ${withoutContact.length} without contact info — reply and direct to jobdeck.ca`)
  if (urgent.length) console.log(`   ⚡ ${urgent.length} urgent trades — act within 24h or they've already hired`)

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
}

main().catch(console.error)
