import { getLocale, getTranslations } from 'next-intl/server'
import { getPrisma } from '@/lib/db'
import ArchiveClient, { type ArchiveArticle } from './ArchiveClient'
import { getCountryMeta } from '@/lib/utils/countries'

export const dynamic = 'force-dynamic'

export default async function ArchivePage() {
  const [locale, t] = await Promise.all([getLocale(), getTranslations('admin')])

  const dbArticles = await getPrisma().crawledArticle.findMany({
    where: { status: 'approved' },
    orderBy: { publishedAt: 'desc' },
    select: {
      id: true,
      titleUk: true,
      titleRu: true,
      country: true,
      publishedAt: true,
      sourceId: true,
      relevanceScore: true,
      tags: true,
    },
  })

  const countries = [...new Set(dbArticles.map(a => a.country))].sort()

  const articles: ArchiveArticle[] = dbArticles.map(a => {
    const { flag, label: countryCode } = getCountryMeta(a.country)
    return {
      id: a.id,
      titleUk: a.titleUk,
      titleRu: a.titleRu,
      country: a.country,
      flag,
      countryCode,
      publishedAt: a.publishedAt?.toISOString() ?? null,
      sourceId: a.sourceId,
      relevanceScore: a.relevanceScore ?? 0,
      tags: a.tags,
    }
  })

  return (
    <main style={{ padding: 32 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 4px', color: 'var(--rh-fg)' }}>
          {t('archiveTitle')}
        </h1>
        <p style={{ fontSize: 14, color: 'var(--rh-fg-2)', margin: 0 }}>
          {articles.length} опублікованих статей
        </p>
      </div>
      <ArchiveClient articles={articles} locale={locale} countries={countries} />
    </main>
  )
}
