import { getLocale } from 'next-intl/server'
import { getPrisma } from '@/lib/db'
import ArticlesClientPage, { type ArticleCardData } from './ArticlesClientPage'

export const dynamic = 'force-dynamic'

const COUNTRY_CODE: Record<string, string> = {
  Slovakia: 'SK',
  Poland: 'PL',
  Germany: 'DE',
  'Czech Republic': 'CZ',
  'European Union': 'EU',
}

const COUNTRY_FLAG: Record<string, string> = {
  Slovakia: '🇸🇰',
  Poland: '🇵🇱',
  Germany: '🇩🇪',
  'Czech Republic': '🇨🇿',
  'European Union': '🇪🇺',
}

export default async function ArticlesPage() {
  const locale = await getLocale()

  const dbArticles = await getPrisma().crawledArticle.findMany({
    where: { status: 'approved' },
    orderBy: { publishedAt: 'desc' },
    select: {
      id: true,
      country: true,
      tags: true,
      titleUk: true,
      titleRu: true,
      summaryUk: true,
      summaryRu: true,
      publishedAt: true,
      sourceId: true,
    },
  })

  const articles: ArticleCardData[] = dbArticles.map(a => ({
    id: a.id,
    countryCode: COUNTRY_CODE[a.country] ?? 'EU',
    flag: COUNTRY_FLAG[a.country] ?? '🌍',
    tag: a.tags[0] ?? '',
    title: (locale === 'ru' ? a.titleRu : a.titleUk) ?? '',
    summary: (locale === 'ru' ? a.summaryRu : a.summaryUk) ?? '',
    date: a.publishedAt?.toLocaleDateString(locale === 'ru' ? 'ru-RU' : 'uk-UA', {
      day: 'numeric', month: 'short', year: 'numeric',
    }) ?? '',
    source: a.sourceId,
  }))

  return <ArticlesClientPage articles={articles} />
}
