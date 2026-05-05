import { getLocale } from 'next-intl/server'
import { getPrisma } from '@/lib/db'
import ArticlesClientPage, { type ArticleCardData } from './ArticlesClientPage'
import { getLocalizedContent, getLocaleDate } from '@/lib/utils/locale-content'
import { getCountryMeta } from '@/lib/utils/countries'

export const dynamic = 'force-dynamic'

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

  const countries = [...new Set(dbArticles.map(a => a.country))].sort()

  const articles: ArticleCardData[] = dbArticles.map(a => {
    const { title, summary } = getLocalizedContent(a, locale)
    const { flag, label: countryCode } = getCountryMeta(a.country)
    return {
      id: a.id,
      countryCode,
      flag,
      tag: a.tags[0] ?? '',
      title,
      summary,
      date: getLocaleDate(a.publishedAt, locale),
      source: a.sourceId,
    }
  })

  return <ArticlesClientPage articles={articles} countries={countries} />
}
