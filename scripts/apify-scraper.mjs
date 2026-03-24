/**
 * JobDeck Apify Facebook Lead Scraper
 * Run: node scripts/apify-scraper.mjs
 * Output: scripts/leads.csv
 */

import https from 'https'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const CSV_PATH = path.join(__dirname, 'leads.csv')

// Load .env
const envPath = path.join(__dirname, '.env')
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const idx = line.indexOf('=')
    if (idx > 0) process.env[line.slice(0, idx).trim()] = line.slice(idx + 1).trim()
  })
}

const APIFY_TOKEN = process.env.APIFY_API_KEY
const FB_COOKIES = JSON.parse(process.env.FB_COOKIES || '[]')
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY

if (!APIFY_TOKEN) { console.error('Missing APIFY_API_KEY in scripts/.env'); process.exit(1) }
if (!FB_COOKIES.length) { console.error('Missing FB_COOKIES in scripts/.env'); process.exit(1) }

const MAX_AGE_DAYS = 5

const FB_GROUPS = [
  'https://www.facebook.com/groups/1201201981324182',
  'https://www.facebook.com/groups/703906605256830',
  'https://www.facebook.com/groups/912371960774043',
  'https://www.facebook.com/groups/4929882970405403',
  'https://www.facebook.com/groups/509993977484259',
  'https://www.facebook.com/groups/hamiltonsocial',
  'https://www.facebook.com/groups/1828854080678781',
  'https://www.facebook.com/groups/802973733152534',
  'https://www.facebook.com/groups/336846846739970',
  'https://www.facebook.com/groups/512473512102954',
  'https://www.facebook.com/groups/362103189553780',
  'https://www.facebook.com/groups/352984265854190',
  'https://www.facebook.com/groups/553167318032470',
  'https://www.facebook.com/groups/624577461302217',
  'https://www.facebook.com/groups/3537416792945450',
]

// Problem language homeowners use (vs contractor ad language)
const PROBLEM_SIGNALS = [
  'does anyone know a', 'does anyone know of a', 'can anyone recommend',
  'anyone recommend', 'looking for a good', 'looking for a reliable',
  'need a good', 'need a reliable', 'anyone used', 'has anyone used',
  'anyone have a good', 'recommendation for a', 'recommendations for a',
  'who do i call', 'who should i call', 'any suggestions for a',
  'help finding a', 'leaking', 'water damage', 'pipe burst', 'no heat',
  'furnace not working', 'roof leaking', 'electrical issue', 'circuit breaker',
  'drain clogged', 'toilet overflowing', 'basement flooding',
]

const TRADES = [
  'plumber', 'plumbing', 'roofer', 'roofing', 'electrician', 'electrical',
  'hvac', 'furnace', 'handyman', 'carpenter', 'painter', 'painting',
  'landscaper', 'lawn', 'deck', 'decking', 'fence', 'fencing', 'contractor',
  'renovation', 'reno', 'drywall', 'flooring', 'tile', 'window', 'siding',
  'insulation', 'gutter', 'downspout', 'basement', 'bathroom', 'kitchen reno',
]

// Quick pre-filter before calling Claude — must mention a trade
function mightBeHomeowner(text) {
  const lower = text.toLowerCase()
  const hasTrade = TRADES.some(t => lower.includes(t)) ||
    PROBLEM_SIGNALS.some(s => lower.includes(s))
  // Skip obvious contractor ads immediately
  const isObviousAd = ['for hire', 'free estimate', 'free quotes', 'call us',
    'our team', 'we specialize', 'my company', 'years of experience',
    'fully licensed', 'fully insured', 'quality workmanship'].some(s => lower.includes(s))
  return hasTrade && !isObviousAd
}

async function claudeClassify(posts) {
  if (!ANTHROPIC_KEY || !posts.length) return posts.map(() => false)

  const texts = posts.map((p, i) => `[${i}] ${p.slice(0, 300)}`).join('\n\n')
  const prompt = `You are classifying Facebook posts for a contractor lead generation platform in Ontario, Canada.

For each numbered post below, answer ONLY with the post number and either "homeowner" or "contractor".
- "homeowner" = a homeowner looking for help, asking for recommendations, or describing a problem
- "contractor" = a contractor advertising services, showing off work, or promoting their business

Posts:
${texts}

Reply in this exact format, one per line:
0: homeowner
1: contractor
etc.`

  return new Promise((resolve) => {
    const body = JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 200,
      messages: [{ role: 'user', content: prompt }],
    })

    const req = https.request({
      hostname: 'api.anthropic.com',
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Length': Buffer.byteLength(body),
      },
      timeout: 20000,
    }, res => {
      let d = ''
      res.on('data', c => d += c)
      res.on('end', () => {
        try {
          const j = JSON.parse(d)
          const text = j.content?.[0]?.text || ''
          const results = posts.map((_, i) => {
            const line = text.split('\n').find(l => l.startsWith(`${i}:`))
            return line?.includes('homeowner') || false
          })
          resolve(results)
        } catch { resolve(posts.map(() => false)) }
      })
    })
    req.on('error', () => resolve(posts.map(() => false)))
    req.on('timeout', () => { req.destroy(); resolve(posts.map(() => false)) })
    req.write(body)
    req.end()
  })
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

function apifyRequest(method, urlPath, body) {
  return new Promise((resolve, reject) => {
    const bodyStr = body ? JSON.stringify(body) : null
    const options = {
      hostname: 'api.apify.com',
      path: `${urlPath}?token=${APIFY_TOKEN}`,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(bodyStr ? { 'Content-Length': Buffer.byteLength(bodyStr) } : {}),
      },
      timeout: 30000,
    }
    const req = https.request(options, res => {
      let d = ''
      res.on('data', c => d += c)
      res.on('end', () => {
        try { resolve(JSON.parse(d)) }
        catch { reject(new Error(`Bad JSON: ${d.slice(0, 200)}`)) }
      })
    })
    req.on('error', reject)
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')) })
    if (bodyStr) req.write(bodyStr)
    req.end()
  })
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

async function runActor(actorId, input) {
  const run = await apifyRequest('POST', `/v2/acts/${actorId}/runs`, input)
  if (!run.data?.id) throw new Error(`Failed to start: ${JSON.stringify(run).slice(0, 200)}`)

  const runId = run.data.id
  process.stdout.write(`   Run ${runId} `)

  for (let i = 0; i < 120; i++) {
    await sleep(5000)
    const status = await apifyRequest('GET', `/v2/actor-runs/${runId}`)
    const state = status.data?.status
    if (state === 'SUCCEEDED') { console.log('✓'); break }
    if (['FAILED', 'ABORTED', 'TIMED-OUT'].includes(state)) throw new Error(`Run ${state}`)
    process.stdout.write('.')
  }

  const dataset = await apifyRequest('GET', `/v2/actor-runs/${runId}/dataset/items?limit=500`)
  return Array.isArray(dataset) ? dataset : (dataset.items || [])
}

function appendToCSV(rows) {
  const headers = ['Source', 'Group', 'Author', 'Post', 'URL', 'Date', 'Phone', 'Email', 'Has Contact']
  const escape = v => `"${String(v || '').replace(/"/g, '""')}"`

  const exists = fs.existsSync(CSV_PATH)
  const existingUrls = new Set()

  if (exists) {
    fs.readFileSync(CSV_PATH, 'utf8').split('\n').slice(1).forEach(line => {
      const cols = line.match(/"(?:[^"]|"")*"/g) || []
      if (cols[4]) existingUrls.add(cols[4].replace(/^"|"$/g, '').replace(/""/g, '"'))
    })
  }

  const newRows = rows.filter(r => !existingUrls.has(r.url))
  if (!newRows.length) return 0

  const lines = newRows.map(r => [
    escape(r.source),
    escape(r.group),
    escape(r.author),
    escape(r.post),
    escape(r.url),
    escape(r.date),
    escape(r.phone),
    escape(r.email),
    escape(r.hasContact),
  ].join(','))

  if (!exists) {
    fs.writeFileSync(CSV_PATH, [headers.join(','), ...lines].join('\n') + '\n')
  } else {
    fs.appendFileSync(CSV_PATH, lines.join('\n') + '\n')
  }

  // Also copy to Desktop
  const desktop = path.join(process.env.HOME, 'Desktop', 'leads.csv')
  fs.copyFileSync(CSV_PATH, desktop)

  return newRows.length
}

async function scrapeFacebook() {
  console.log('\n📘 Running Facebook Groups scraper...')
  console.log(`   Scanning ${FB_GROUPS.length} groups, last ${MAX_AGE_DAYS} days\n`)

  const cutoff = Date.now() - MAX_AGE_DAYS * 86400000

  const items = await runActor('apify~facebook-groups-scraper', {
    startUrls: FB_GROUPS.map(url => ({ url })),
    maxPosts: 100,
    maxPostComments: 0,
    maxReviews: 0,
    scrapeAbout: false,
    scrapeMembers: false,
    proxy: { useApifyProxy: true, apifyProxyGroups: ['RESIDENTIAL'] },
    cookies: FB_COOKIES,
  })

  const cutoffDate = new Date(cutoff)

  // Pre-filter by date and obvious contractor signals
  const candidates = items.filter(item => {
    const text = item.text || ''
    if (!text || text.length < 20) return false
    const date = item.time || item.timestamp || ''
    if (date && new Date(date) < cutoffDate) return false
    return mightBeHomeowner(text)
  })

  console.log(`   Pre-filter: ${items.length} posts → ${candidates.length} candidates`)

  // Classify in batches of 10 using Claude
  const results = []
  const BATCH = 10
  for (let i = 0; i < candidates.length; i += BATCH) {
    const batch = candidates.slice(i, i + BATCH)
    const texts = batch.map(item => item.text || '')
    const classifications = await claudeClassify(texts)

    batch.forEach((item, idx) => {
      if (!classifications[idx]) return
      const text = item.text || ''
      const date = item.time || item.timestamp || ''
      const contacts = extractContacts(text)
      results.push({
        source: 'Facebook Group',
        group: item.facebookUrl || item.groupUrl || '',
        author: item.user?.name || '',
        post: text.slice(0, 400),
        url: item.url || '',
        date,
        phone: contacts.phones.join(', '),
        email: contacts.emails.join(', '),
        hasContact: contacts.phones.length || contacts.emails.length ? 'YES' : 'no',
      })
    })
    if (i + BATCH < candidates.length) await sleep(500)
  }

  return results
}

async function main() {
  console.log('🔍 JobDeck Facebook Lead Scraper\n')

  let results
  try {
    results = await scrapeFacebook()
  } catch (e) {
    console.error(`\n❌ Error: ${e.message}`)
    process.exit(1)
  }

  if (!results.length) {
    console.log('\nNo homeowner leads found in these groups right now.')
    return
  }

  const added = appendToCSV(results)
  const withContact = results.filter(r => r.hasContact === 'YES')

  console.log(`\n✅ ${results.length} homeowner leads found — ${added} new`)
  console.log(`   📞 ${withContact.length} with contact info`)
  console.log(`   📄 Saved to Desktop/leads.csv`)

  if (withContact.length) {
    console.log('\n⭐ LEADS WITH CONTACT INFO:')
    withContact.forEach(r => {
      console.log(`\n  📌 ${r.post.slice(0, 100)}`)
      console.log(`     ${r.group} · ${r.date}`)
      if (r.phone) console.log(`     ☎  ${r.phone}`)
      if (r.email) console.log(`     ✉  ${r.email}`)
      console.log(`     🔗 ${r.url}`)
    })
  }

  if (results.filter(r => r.hasContact === 'no').length) {
    console.log('\n💬 LEADS WITHOUT CONTACT — reply and direct to jobdeck.ca:')
    results.filter(r => r.hasContact === 'no').forEach(r => {
      console.log(`\n  📌 ${r.post.slice(0, 100)}`)
      console.log(`     ${r.group} · ${r.date}`)
      console.log(`     🔗 ${r.url}`)
    })
  }
}

main().catch(console.error)
