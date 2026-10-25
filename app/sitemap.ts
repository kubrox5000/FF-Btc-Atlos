import type { MetadataRoute } from 'next'

export const dynamic = 'force-static'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://diamondboost.gg'
  const now = new Date()
  return [
    { url: `${base}/`, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${base}/top-up`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${base}/track`, lastModified: now, changeFrequency: 'weekly', priority: 0.6 },
  ]
}
