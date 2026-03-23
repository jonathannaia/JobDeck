#!/usr/bin/env node
// JobDeck Lead Monitor
// Scans Reddit and Craigslist for homeowners seeking contractors in Ontario
// Run: node scripts/monitor.mjs

import https from 'https'
import http from 'http'

// ─── Config ───────────────────────────────────────────────────────────────────

const TWILIO_SID = process.env.TWILIO_ACCOUNT_SID
const TWILIO_TOKEN = process.env.TWILIO_AUTH_TOKEN
const TWILIO_FROM = process.env.TWILIO_PHONE_NUMBER
const TWILIO_TO = process.env.ADMIN_PHONE
const ADMIN_URL = 'https://jobdeck.ca/admin/monitor'

// ─── Keywords ─────────────────────────────────────────────────────────────────

const INCLUDE = [
  'looking for', 'need a', 'need an', 'need someone', 'anyone know',
  'can anyone', 'recommend', 'seeking', 'help with', 'who can',
  'does anyone', 'can someone', 'i need', 'need help', 'hiring',
  'anyone have', 'suggestions', 'referral', 'repair my', 'fix my',
  'replace my', 'install a', 'install an', 'anyone use',
  'how do', 'how can', 'how much', 'what should', 'where can',
  'should i', 'can i', 'is it worth', 'any advice', 'any recommendations',
  'best way', 'help me', 'help needed', 'thoughts on', 'advice on',
  'worth it', 'how to', 'question about', 'wondering if', 'who does',
]

const EXCLUDE = [
  'we offer', 'call us', 'our services', 'free estimate', 'free quote',
  'we provide', 'years of experience', 'contact us', 'we specialize',
  'available for hire', 'i offer', 'professional services', 'serving ontario',
  'dm for quote', 'my company', 'our team', 'we are a', 'licensed and insured',
  'affordable rates', 'competitive pricing', 'no job too small', 'call today',
  'text today', 'visit our', 'check out our', 'follow us', 'free estimates',
  'i am a contractor', "i'm a contractor", 'i do roofing', 'i do plumbing',
]

const TRADES = [
  'plumber', 'plumbing', 'electrician', 'electrical', 'roofer', 'roofing',
  'shingles', 'hvac', 'furnace', 'air conditioning', 'carpenter', 'carpentry',
  'drywall', 'painter', 'painting', 'landscaper', 'landscaping', 'contractor',
  'renovation', 'reno', 'handyman', 'basement', 'bathroom', 'kitchen',
  'flooring', 'tile', 'deck', 'fence', 'eavestroughs', 'gutters', 'windows',
  'doors', 'insulation', 'waterproofing', 'foundation', 'water heater',
  'hot water', 'sump pump', 'septic', 'driveway', 'concrete', 'interlock',
  'soffit', 'fascia', 'attic', 'mold', 'leak', 'pipe', 'wiring', 'panel',
  'breaker', 'outlet', 'permit', 'inspection',
]

function isRelevant(title, body = '') {
  const text = `${title} ${body}`.toLowerCase()
  if (!TRADES.some(kw => text.includes(kw))) return false
  if (!INCLUDE.some(kw => text.includes(kw))) return false
  if (EXCLUDE.some(kw => text.includes(kw))) return false
  return true
}

// ─── HTTP helper ──────────────────────────────────────────────────────────────

function get(url) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http
    const req = lib.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/html, application/rss+xml, */*',
      },
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return get(res.headers.location).then(resolve).catch(reject)
      }
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => resolve({ status: res.statusCode, body: data }))
    })
    req.on('error', reject)
    req.setTimeout(10000, () => { req.destroy(); reject(new Error('timeout')) })
  })
}

// ─── Reddit ───────────────────────────────────────────────────────────────────

const SUBREDDITS = [
  'ontario', 'toronto', 'hamilton', 'mississauga', 'ottawa',
  'brampton', 'Kitchener', 'londonontario', 'windsorontario',
  'Barrie', 'Sudbury', 'ThunderBay',
]

const REDDIT_QUERY = 'plumber OR electrician OR roofer OR renovation OR contractor OR handyman OR hvac OR furnace OR basement OR drywall OR painter'

const sleep = ms => new Promise(r => setTimeout(r, ms))

async function fetchReddit() {
  const posts = []
  for (const sub of SUBREDDITS) {
    try {
      await sleep(1200) // stay under Reddit's rate limit
      const url = `https://www.reddit.com/r/${sub}/search.json?q=${encodeURIComponent(REDDIT_QUERY)}&sort=new&restrict_sr=1&limit=25&t=month`
      const { status, body } = await get(url)
      if (status !== 200) { console.log(`  r/${sub}: HTTP ${status}`); continue }
      const json = JSON.parse(body)
      const items = json?.data?.children ?? []
      console.log(`  r/${sub}: ${items.length} raw posts`)
      for (const item of items) {
        const d = item.data
        if (!d?.id || !d?.title) continue
        if (!isRelevant(d.title, d.selftext)) continue
        posts.push({
          platform: 'reddit',
          title: d.title,
          url: `https://reddit.com${d.permalink}`,
          sub,
        })
      }
    } catch (e) { console.log(`  r/${sub}: error`, e.message) }
  }
  return [...new Map(posts.map(p => [p.url, p])).values()]
}

// ─── Craigslist ───────────────────────────────────────────────────────────────

const CL_FEEDS = [
  'https://toronto.craigslist.org/search/ggg?format=rss',
  'https://toronto.craigslist.org/search/hsa?format=rss',
]

async function fetchCraigslist() {
  const posts = []
  for (const feedUrl of CL_FEEDS) {
    try {
      const { status, body } = await get(feedUrl)
      if (status !== 200) continue
      const items = body.match(/<item[\s\S]*?<\/item>/g) ?? []
      for (const item of items) {
        const title = (
          item.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/)?.[1] ||
          item.match(/<title>([\s\S]*?)<\/title>/)?.[1] || ''
        ).trim()
        const link = (
          item.match(/<link>([\s\S]*?)<\/link>/)?.[1] ||
          item.match(/<guid[^>]*>([\s\S]*?)<\/guid>/)?.[1] || ''
        ).trim()
        const desc = (
          item.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/)?.[1] ||
          item.match(/<description>([\s\S]*?)<\/description>/)?.[1] || ''
        ).replace(/<[^>]+>/g, '').trim()

        if (!title || !link) continue
        if (!isRelevant(title, desc)) continue
        posts.push({ platform: 'craigslist', title, url: link })
      }
    } catch { /* skip */ }
  }
  return [...new Map(posts.map(p => [p.url, p])).values()]
}

// ─── SMS ──────────────────────────────────────────────────────────────────────

function sendSms(body) {
  return new Promise((resolve, reject) => {
    const auth = Buffer.from(`${TWILIO_SID}:${TWILIO_TOKEN}`).toString('base64')
    const data = new URLSearchParams({ From: TWILIO_FROM, To: TWILIO_TO, Body: body }).toString()
    const req = https.request({
      hostname: 'api.twilio.com',
      path: `/2010-04-01/Accounts/${TWILIO_SID}/Messages.json`,
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(data),
      },
    }, res => {
      let body = ''
      res.on('data', c => body += c)
      res.on('end', () => resolve(res.statusCode))
    })
    req.on('error', reject)
    req.write(data)
    req.end()
  })
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('JobDeck Monitor starting...\n')

  const [reddit, craigslist] = await Promise.all([fetchReddit(), fetchCraigslist()])
  const all = [...reddit, ...craigslist]

  if (all.length === 0) {
    console.log('No relevant posts found today.')
    return
  }

  console.log(`Found ${all.length} post(s):\n`)
  for (const post of all) {
    console.log(`[${post.platform.toUpperCase()}] ${post.title}`)
    console.log(`  ${post.url}\n`)
  }

  // Send SMS summary
  const msg = `JobDeck Monitor: ${all.length} homeowner post${all.length > 1 ? 's' : ''} found (${reddit.length} Reddit, ${craigslist.length} Craigslist). Check jobdeck.ca/admin/monitor`
  await sendSms(msg)
  console.log('SMS sent.')
}

main().catch(console.error)
