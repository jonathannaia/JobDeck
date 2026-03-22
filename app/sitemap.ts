import { MetadataRoute } from 'next'
import { TRADES, CITIES } from '@/lib/seo-pages'

const BASE_URL = 'https://jobdeck.ca'

export default function sitemap(): MetadataRoute.Sitemap {
  const static_pages = [
    { url: BASE_URL, priority: 1.0 },
    { url: `${BASE_URL}/contractors`, priority: 0.9 },
    { url: `${BASE_URL}/login`, priority: 0.5 },
    { url: `${BASE_URL}/privacy`, priority: 0.3 },
    { url: `${BASE_URL}/terms`, priority: 0.3 },
  ].map(page => ({
    ...page,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
  }))

  const seo_pages = []
  for (const trade of TRADES) {
    for (const city of CITIES) {
      seo_pages.push({
        url: `${BASE_URL}/${trade.slug}/${city.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      })
    }
  }

  return [...static_pages, ...seo_pages]
}
