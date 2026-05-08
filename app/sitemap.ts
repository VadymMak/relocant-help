import type { MetadataRoute } from 'next'
import { getPrisma } from '@/lib/db'

const BASE = process.env.NEXT_PUBLIC_APP_URL || 'https://relocan.eu'
const LOCALES = ['uk', 'ru', 'en']
const STATIC_PATHS = ['', '/articles', '/about', '/contact', '/catalog']

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = []

  for (const locale of LOCALES) {
    for (const path of STATIC_PATHS) {
      entries.push({
        url: `${BASE}/${locale}${path}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: path === '' ? 1.0 : 0.8,
      })
    }
  }

  try {
    const articles = await getPrisma().crawledArticle.findMany({
      where: { status: 'approved' },
      select: { id: true, publishedAt: true },
      orderBy: { publishedAt: 'desc' },
    })

    for (const article of articles) {
      for (const locale of LOCALES) {
        entries.push({
          url: `${BASE}/${locale}/articles/${article.id}`,
          lastModified: article.publishedAt ?? new Date(),
          changeFrequency: 'daily',
          priority: 0.7,
        })
      }
    }
  } catch {
    // DB unavailable at build time — skip article entries
  }

  return entries
}
