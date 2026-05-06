import { getSources } from '@/lib/db/sources-config'
import { getPrisma } from '@/lib/db'
import SourcesClient, { type SourceRow } from './SourcesClient'

export const dynamic = 'force-dynamic'

export default async function AdminSourcesPage() {
  const [sources, overrides] = await Promise.all([
    getSources(),
    getPrisma().sourceConfig.findMany(),
  ])

  const allSourceIds = sources.map(s => s.id)

  const [articleCounts, lastRuns] = await Promise.all([
    getPrisma().crawledArticle.groupBy({
      by: ['sourceId'],
      where: { sourceId: { in: allSourceIds } },
      _count: { id: true },
    }),
    getPrisma().crawlerLog.findMany({
      where: { sourceId: { in: allSourceIds } },
      orderBy: { runAt: 'desc' },
      distinct: ['sourceId'],
      select: { sourceId: true, status: true, error: true, runAt: true },
    }),
  ])

  const rows: SourceRow[] = sources.map(source => {
    const count = articleCounts.find(a => a.sourceId === source.id)?._count.id ?? 0
    const run = lastRuns.find(r => r.sourceId === source.id)
    const override = overrides.find(o => o.sourceId === source.id)
    const isCustom = override?.isCustom ?? false

    return {
      id: source.id,
      name: source.name,
      country: source.country,
      flag: source.countryFlag,
      url: source.url,
      rssUrl: source.rssUrl ?? null,
      active: source.active,
      isOverridden: !isCustom && !!override,
      isCustom,
      articleCount: count,
      lastRun: run
        ? { runAt: run.runAt?.toISOString() ?? null, status: run.status, error: run.error ?? null }
        : null,
    }
  })

  return <SourcesClient sources={rows} />
}
