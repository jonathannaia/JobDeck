import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { fetchRedditPosts, fetchCraigslistPosts, fetchKijijiPosts } from '@/lib/monitor'
import twilio from 'twilio'

const ADMIN_PHONE = '+19054470705'

export async function GET(req: NextRequest) {
  // Verify cron secret to prevent unauthorized triggers
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()

  // Fetch from all platforms in parallel
  const [reddit, craigslist, kijiji] = await Promise.all([
    fetchRedditPosts(),
    fetchCraigslistPosts(),
    fetchKijijiPosts(),
  ])

  const allPosts = [...reddit, ...craigslist, ...kijiji]
  let newCount = 0

  for (const post of allPosts) {
    const { error } = await supabase
      .from('monitored_posts')
      .insert({
        platform: post.platform,
        post_id: post.post_id,
        title: post.title,
        url: post.url,
        snippet: post.snippet,
        subreddit: post.subreddit,
      })
      .select()
      .single()

    // error.code 23505 = duplicate (already seen this post) — skip silently
    if (!error) newCount++
  }

  // Send SMS digest if there are new posts
  if (newCount > 0) {
    try {
      const client = twilio(process.env.TWILIO_ACCOUNT_SID!, process.env.TWILIO_AUTH_TOKEN!)
      await client.messages.create({
        body: `JobDeck Monitor: ${newCount} new homeowner post${newCount > 1 ? 's' : ''} found today. Check jobdeck.ca/admin/monitor to review and reply.`,
        from: process.env.TWILIO_PHONE_NUMBER!,
        to: ADMIN_PHONE,
      })
    } catch (err) {
      console.error('SMS digest failed:', err)
    }
  }

  return NextResponse.json({
    reddit: reddit.length,
    craigslist: craigslist.length,
    kijiji: kijiji.length,
    new_saved: newCount,
  })
}
