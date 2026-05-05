import { getLocale } from 'next-intl/server'
import { getPrisma } from '@/lib/db'
import ArticlesClientPage, { type ArticleCardData } from './ArticlesClientPage'
import { getLocalizedContent, getLocaleDate } from '@/lib/utils/locale-content'

export const dynamic = 'force-dynamic'

const COUNTRY_CODE: Record<string, string> = {
  Slovakia: 'SK', Poland: 'PL', Germany: 'DE',
  'Czech Republic': 'CZ', 'European Union': 'EU',
  Spain: 'ES', Italy: 'IT', Romania: 'RO',
  Bulgaria: 'BG', Portugal: 'PT', Turkey: 'TR',
}

const COUNTRY_FLAG: Record<string, string> = {
  Slovakia: '🇸🇰', Poland: '🇵🇱', Germany: '🇩🇪',
  'Czech Republic': '🇨🇿', 'European Union': '🇪🇺',
  Spain: '🇪🇸', Italy: '🇮🇹', Romania: '🇷🇴',
  Bulgaria: '🇧🇬', Portugal: '🇵🇹', Turkey: '🇹🇷',
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

  const articles: ArticleCardData[] = dbArticles.map(a => {
    const { title, summary } = getLocalizedContent(a, locale)
    return {
      id: a.id,
      countryCode: COUNTRY_CODE[a.country] ?? 'EU',
      flag: COUNTRY_FLAG[a.country] ?? '🌍',
      tag: a.tags[0] ?? '',
      title,
      summary,
      date: getLocaleDate(a.publishedAt, locale),
      source: a.sourceId,
    }
  })

  return <ArticlesClientPage articles={articles} />
}
