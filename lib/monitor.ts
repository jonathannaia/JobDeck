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
  'brampton', 'Kitchener', 'londonontario', 'windsorontario',
]

export async function fetchRedditPosts(): Promise<MonitoredPost[]> {
  const posts: MonitoredPost[] = []

  // Fetch latest 100 posts from each subreddit and filter locally
  for (const sub of SUBREDDITS) {
    try {
      const url = `https://www.reddit.com/r/${sub}/new.json?limit=100`
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 JobDeck-Monitor/1.0',
          'Accept': 'application/json',
        },
      })
      if (!res.ok) continue
      const json = await res.json()
      const items = json?.data?.children ?? []

      for (const item of items) {
        const d = item.data
        if (!d?.id || !d?.title) continue
        // Skip if older than 48 hours
        if (Date.now() / 1000 - d.created_utc > 48 * 3600) continue
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

  return [...new Map(posts.map(p => [p.post_id, p])).values()]
}

// ─── Craigslist ───────────────────────────────────────────────────────────────

const CRAIGSLIST_FEEDS = [
  // "gigs" section — people hiring for tasks
  'https://toronto.craigslist.org/search/ggg?format=rss',
  // "household services wanted"
  'https://toronto.craigslist.org/search/hsa?format=rss',
]

export async function fetchCraigslistPosts(): Promise<MonitoredPost[]> {
  const posts: MonitoredPost[] = []

  for (const feedUrl of CRAIGSLIST_FEEDS) {
    try {
      const res = await fetch(feedUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; JobDeck-Monitor/1.0)',
          'Accept': 'application/rss+xml, application/xml, text/xml',
        },
      })
      if (!res.ok) continue
      const xml = await res.text()

      // Extract <item> blocks
      const items = xml.match(/<item[\s\S]*?<\/item>/g) ?? []
      for (const item of items) {
        const title = (
          item.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/)?.[1] ||
          item.match(/<title>([\s\S]*?)<\/title>/)?.[1] ||
          ''
        ).trim()

        const link = (
          item.match(/<link>([\s\S]*?)<\/link>/)?.[1] ||
          item.match(/<guid[^>]*>([\s\S]*?)<\/guid>/)?.[1] ||
          ''
        ).trim()

        const desc = (
          item.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/)?.[1] ||
          item.match(/<description>([\s\S]*?)<\/description>/)?.[1] ||
          ''
        ).replace(/<[^>]+>/g, '').trim()

        if (!title || !link) continue
        if (!isRelevantPost(title, desc)) continue

        const post_id = link.split('/').filter(Boolean).pop()?.split('?')[0] || link

        posts.push({
          platform: 'craigslist',
          post_id,
          title,
          url: link,
          snippet: desc.slice(0, 200) || null,
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
