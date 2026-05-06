import { CRAWLER_SOURCES, CrawlerSource } from '@/lib/crawler/sources'
import { getPrisma } from '@/lib/db'
import { getCountryMeta } from '@/lib/utils/countries'

export async function getSources(): Promise<CrawlerSource[]> {
  const overrides = await getPrisma().sourceConfig.findMany()

  // Hardcoded sources with DB overrides applied
  const hardcoded = CRAWLER_SOURCES.map(source => {
    const override = overrides.find(o => o.sourceId === source.id)
    if (!override) return source
    return {
      ...source,
      url: override.url ?? source.url,
      rssUrl: (override.rssUrl ?? source.rssUrl) as string | undefined,
      active: override.active,
    }
  })

  // Custom user-added sources (stored entirely in DB)
  const custom: CrawlerSource[] = overrides
    .filter(o => o.isCustom && o.url)
    .map(o => ({
      id: o.sourceId,
      country: o.country ?? 'European Union',
      countryFlag: getCountryMeta(o.country ?? 'European Union').flag,
      name: o.name ?? o.sourceId,
      url: o.url!,
      rssUrl: o.rssUrl ?? undefined,
      language: o.language ?? 'en',
      targetLanguages: ['uk', 'ru'] as ('uk' | 'ru' | 'en')[],
      tags: ['custom', 'migration'],
      checkIntervalHours: o.checkIntervalHours ?? 24,
      active: o.active,
      type: (o.sourceType === 'rss' ? 'rss' : 'scrape') as 'rss' | 'scrape' | 'newsapi',
    }))

  return [...hardcoded, ...custom]
}

export async function upsertSourceUrl(
  sourceId: string,
  url: string,
  rssUrl?: string
): Promise<void> {
  await getPrisma().sourceConfig.upsert({
    where: { sourceId },
    create: {
      sourceId,
      url,
      rssUrl: rssUrl ?? null,
      fixedAt: new Date(),
    },
    update: {
      url,
      rssUrl: rssUrl ?? null,
      fixedAt: new Date(),
    },
  })
}
