export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

const ADMIN_EMAIL = 'jonathan@naiadigital.org'

const PLATFORM_COLORS: Record<string, string> = {
  reddit: 'bg-orange-50 text-orange-700',
  craigslist: 'bg-purple-50 text-purple-700',
  kijiji: 'bg-green-50 text-green-700',
}

export default async function MonitorPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== ADMIN_EMAIL) redirect('/login')

  const service = createServiceClient()
  const { data: posts } = await service
    .from('monitored_posts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200)

  const byPlatform = {
    reddit: posts?.filter(p => p.platform === 'reddit').length ?? 0,
    craigslist: posts?.filter(p => p.platform === 'craigslist').length ?? 0,
    kijiji: posts?.filter(p => p.platform === 'kijiji').length ?? 0,
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#0f172a]">Lead Monitor</h1>
            <p className="text-[#6b7280] text-sm mt-1">Homeowners seeking contractors across the web — updated daily</p>
          </div>
          <a
            href="/admin"
            className="text-sm text-[#143A75] hover:underline"
          >
            ← Back to Admin
          </a>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {Object.entries(byPlatform).map(([platform, count]) => (
            <div key={platform} className="bg-white border border-[#e2e8f0] rounded-xl p-5">
              <div className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium mb-3 ${PLATFORM_COLORS[platform]}`}>
                {platform.charAt(0).toUpperCase() + platform.slice(1)}
              </div>
              <div className="text-3xl font-bold text-[#0f172a]">{count}</div>
              <div className="text-[#6b7280] text-sm">posts found</div>
            </div>
          ))}
        </div>

        {/* Posts */}
        <div className="bg-white border border-[#e2e8f0] rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#e2e8f0]">
            <h2 className="text-[#0f172a] font-medium">{posts?.length ?? 0} total posts</h2>
          </div>

          {!posts?.length ? (
            <div className="px-6 py-16 text-center">
              <p className="text-[#9ca3af] text-sm">No posts yet — the monitor runs daily at 8am.</p>
              <p className="text-[#9ca3af] text-xs mt-2">You can also trigger it manually at /api/cron/lead-monitor</p>
            </div>
          ) : (
            <div className="divide-y divide-[#f1f5f9]">
              {posts.map((post: any) => (
                <div key={post.id} className="px-6 py-4 hover:bg-[#f8fafc] transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${PLATFORM_COLORS[post.platform]}`}>
                          {post.platform}
                        </span>
                        {post.subreddit && (
                          <span className="text-[#9ca3af] text-xs">r/{post.subreddit}</span>
                        )}
                        <span className="text-[#9ca3af] text-xs">
                          {new Date(post.created_at).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <a
                        href={post.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#0f172a] font-medium hover:text-[#143A75] transition-colors block truncate"
                      >
                        {post.title}
                      </a>
                      {post.snippet && (
                        <p className="text-[#6b7280] text-sm mt-1 line-clamp-2">{post.snippet}</p>
                      )}
                    </div>
                    <a
                      href={post.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-shrink-0 bg-[#143A75] hover:bg-[#0e2d5c] text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
                    >
                      Reply →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
