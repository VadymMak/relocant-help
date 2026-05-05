import { CRAWLER_SOURCES, CrawlerSource } from '@/lib/crawler/sources'
import { getPrisma } from '@/lib/db'

export async function getSources(): Promise<CrawlerSource[]> {
  const overrides = await getPrisma().sourceConfig.findMany()

  return CRAWLER_SOURCES.map(source => {
    const override = overrides.find(o => o.sourceId === source.id)
    if (!override) return source
    return {
      ...source,
      url: override.url ?? source.url,
      rssUrl: (override.rssUrl ?? source.rssUrl) as string | undefined,
      active: override.active,
    }
  })
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
