// Keywords that suggest a homeowner is SEEKING help
const INCLUDE_KEYWORDS = [
  'looking for', 'need a', 'need an', 'need someone', 'anyone know',
  'can anyone', 'recommend', 'seeking', 'wanted', 'help with', 'who can',
  'does anyone', 'can someone', 'i need', 'need help', 'hiring',
  'find a contractor', 'find a plumber', 'find a roofer', 'find an electrician',
  'anyone have', 'anyone use', 'suggestions', 'referral', 'repair my',
  'fix my', 'replace my', 'install a', 'install an',
]

// Keywords that suggest a contractor is ADVERTISING
const EXCLUDE_KEYWORDS = [
  'we offer', 'call us', 'our services', 'free estimate', 'free quote',
  'we provide', 'years of experience', 'contact us', 'we specialize',
  'available for hire', 'i offer', 'professional services', 'serving ontario',
  'dm for quote', 'message me for', 'my company', 'our team', 'we are a',
  'i am a contractor', "i'm a contractor", 'licensed and insured',
  'affordable rates', 'competitive pricing', 'no job too small',
  'fully insured', 'free estimates', 'call today', 'text today',
  'visit our', 'check out our', 'follow us',
]

// Trade-related keywords to filter relevant posts
const TRADE_KEYWORDS = [
  'plumber', 'plumbing', 'electrician', 'electrical', 'roofer', 'roofing',
  'shingles', 'hvac', 'furnace', 'air conditioning', 'ac unit', 'carpenter',
  'carpentry', 'drywall', 'painter', 'painting', 'landscaper', 'landscaping',
  'contractor', 'renovation', 'reno', 'handyman', 'basement', 'bathroom',
  'kitchen', 'flooring', 'tile', 'deck', 'fence', 'eavestroughs', 'gutters',
  'windows', 'doors', 'insulation', 'waterproofing', 'foundation',
]

export function isRelevantPost(title: string, body = ''): boolean {
  const text = `${title} ${body}`.toLowerCase()

  // Must contain at least one trade keyword
  const hasTrade = TRADE_KEYWORDS.some(kw => text.includes(kw))
  if (!hasTrade) return false

  // Must contain at least one "seeking help" signal
  const hasInclude = INCLUDE_KEYWORDS.some(kw => text.includes(kw))
  if (!hasInclude) return false

  // Must NOT contain contractor ad signals
  const hasExclude = EXCLUDE_KEYWORDS.some(kw => text.includes(kw))
  if (hasExclude) return false

  return true
}

export interface MonitoredPost {
  platform: string
  post_id: string
  title: string
  url: string
  snippet: string | null
  subreddit: string | null
}

// ─── Reddit ───────────────────────────────────────────────────────────────────

const SUBREDDITS = [
  'ontario', 'toronto', 'hamilton', 'mississauga', 'ottawa',
  'brampton', 'markham', 'Burlington', 'Kitchener', 'London',
]

const REDDIT_QUERIES = [
  'looking for contractor', 'need plumber', 'need electrician',
  'need roofer', 'need handyman', 'renovation help', 'recommend contractor',
]

export async function fetchRedditPosts(): Promise<MonitoredPost[]> {
  const posts: MonitoredPost[] = []

  for (const sub of SUBREDDITS) {
    for (const query of REDDIT_QUERIES) {
      try {
        const url = `https://www.reddit.com/r/${sub}/search.json?q=${encodeURIComponent(query)}&sort=new&restrict_sr=1&limit=10&t=day`
        const res = await fetch(url, {
          headers: { 'User-Agent': 'JobDeck-Monitor/1.0' },
        })
        if (!res.ok) continue
        const json = await res.json()
        const items = json?.data?.children ?? []

        for (const item of items) {
          const d = item.data
          if (!d?.id || !d?.title) continue
          if (!isRelevantPost(d.title, d.selftext)) continue

          posts.push({
            platform: 'reddit',
            post_id: d.id,
            title: d.title,
            url: `https://reddit.com${d.permalink}`,
            snippet: d.selftext?.slice(0, 200) || null,
            subreddit: sub,
          })
        }
      } catch {
        // skip on error
      }
    }
  }

  // Deduplicate by post_id
  return [...new Map(posts.map(p => [p.post_id, p])).values()]
}

// ─── Craigslist ───────────────────────────────────────────────────────────────

const CRAIGSLIST_FEEDS = [
  'https://toronto.craigslist.org/search/hss?format=rss',   // household services
  'https://toronto.craigslist.org/search/lbg?format=rss',   // labour gigs
]

export async function fetchCraigslistPosts(): Promise<MonitoredPost[]> {
  const posts: MonitoredPost[] = []

  for (const feedUrl of CRAIGSLIST_FEEDS) {
    try {
      const res = await fetch(feedUrl, {
        headers: { 'User-Agent': 'JobDeck-Monitor/1.0' },
      })
      if (!res.ok) continue
      const xml = await res.text()

      // Simple XML parsing — extract <item> blocks
      const items = xml.match(/<item>[\s\S]*?<\/item>/g) ?? []
      for (const item of items) {
        const title = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1]
          || item.match(/<title>(.*?)<\/title>/)?.[1]
          || ''
        const link = item.match(/<link>(.*?)<\/link>/)?.[1]
          || item.match(/<guid>(.*?)<\/guid>/)?.[1]
          || ''
        const desc = item.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/)?.[1]
          || item.match(/<description>(.*?)<\/description>/)?.[1]
          || ''

        if (!title || !link) continue
        if (!isRelevantPost(title, desc)) continue

        // Use URL path as post_id
        const post_id = link.split('/').filter(Boolean).pop() || link

        posts.push({
          platform: 'craigslist',
          post_id,
          title: title.trim(),
          url: link,
          snippet: desc.replace(/<[^>]+>/g, '').slice(0, 200) || null,
          subreddit: null,
        })
      }
    } catch {
      // skip on error
    }
  }

  return [...new Map(posts.map(p => [p.post_id, p])).values()]
}

// ─── Kijiji ───────────────────────────────────────────────────────────────────

export async function fetchKijijiPosts(): Promise<MonitoredPost[]> {
  const posts: MonitoredPost[] = []

  const searches = [
    'https://www.kijiji.ca/b-contractors-renovation/ontario/contractor+needed/k0c202l9004?ad=offering&sortBy=dateDesc',
    'https://www.kijiji.ca/b-contractors-renovation/ontario/renovation+help/k0c202l9004?ad=offering&sortBy=dateDesc',
  ]

  for (const searchUrl of searches) {
    try {
      const res = await fetch(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html',
        },
      })
      if (!res.ok) continue
      const html = await res.text()

      // Extract listing titles and links from Kijiji HTML
      const listingRegex = /<a[^>]+href="(\/v-[^"]+)"[^>]*>\s*<div[^>]*data-testid="listing-title"[^>]*>([^<]+)<\/div>/g
      let match
      while ((match = listingRegex.exec(html)) !== null) {
        const path = match[1]
        const title = match[2].trim()
        if (!title || !path) continue
        if (!isRelevantPost(title)) continue

        const post_id = path.split('/').filter(Boolean).pop() || path
        posts.push({
          platform: 'kijiji',
          post_id,
          title,
          url: `https://www.kijiji.ca${path}`,
          snippet: null,
          subreddit: null,
        })
      }
    } catch {
      // skip on error
    }
  }

  return [...new Map(posts.map(p => [p.post_id, p])).values()]
}
