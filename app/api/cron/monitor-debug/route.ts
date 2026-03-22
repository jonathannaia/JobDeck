import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const results: Record<string, any> = {}

  // Test Reddit
  try {
    const res = await fetch('https://www.reddit.com/r/ontario/new.json?limit=5', {
      headers: { 'User-Agent': 'Mozilla/5.0 JobDeck-Monitor/1.0' },
    })
    results.reddit_status = res.status
    if (res.ok) {
      const json = await res.json()
      results.reddit_count = json?.data?.children?.length ?? 0
      results.reddit_sample = json?.data?.children?.[0]?.data?.title ?? null
    } else {
      results.reddit_body = await res.text().then(t => t.slice(0, 200))
    }
  } catch (e: any) {
    results.reddit_error = e.message
  }

  // Test Craigslist
  try {
    const res = await fetch('https://toronto.craigslist.org/search/ggg?format=rss', {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; JobDeck-Monitor/1.0)' },
    })
    results.craigslist_status = res.status
    if (res.ok) {
      const text = await res.text()
      results.craigslist_length = text.length
      results.craigslist_sample = text.slice(0, 300)
    } else {
      results.craigslist_body = await res.text().then(t => t.slice(0, 200))
    }
  } catch (e: any) {
    results.craigslist_error = e.message
  }

  return NextResponse.json(results)
}
