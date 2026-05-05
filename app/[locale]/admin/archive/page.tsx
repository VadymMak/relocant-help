import { getLocale, getTranslations } from 'next-intl/server'
import { getPrisma } from '@/lib/db'
import ArchiveClient, { type ArchiveArticle } from './ArchiveClient'

export const dynamic = 'force-dynamic'

const COUNTRY_FLAG: Record<string, string> = {
  Slovakia: '🇸🇰', Poland: '🇵🇱', Germany: '🇩🇪',
  'Czech Republic': '🇨🇿', 'European Union': '🇪🇺',
}
const COUNTRY_CODE: Record<string, string> = {
  Slovakia: 'SK', Poland: 'PL', Germany: 'DE',
  'Czech Republic': 'CZ', 'European Union': 'EU',
}

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

  const articles: ArchiveArticle[] = dbArticles.map(a => ({
    id: a.id,
    titleUk: a.titleUk,
    titleRu: a.titleRu,
    country: a.country,
    flag: COUNTRY_FLAG[a.country] ?? '🌍',
    countryCode: COUNTRY_CODE[a.country] ?? 'EU',
    publishedAt: a.publishedAt?.toISOString() ?? null,
    sourceId: a.sourceId,
    relevanceScore: a.relevanceScore ?? 0,
    tags: a.tags,
  }))

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
      <ArchiveClient articles={articles} locale={locale} />
    </main>
  )
}
