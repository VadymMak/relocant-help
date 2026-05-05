export function getLocalizedContent(
  article: {
    titleUk?: string | null
    titleRu?: string | null
    summaryUk?: string | null
    summaryRu?: string | null
    fullTextUk?: string | null
    fullTextRu?: string | null
  },
  locale: string
) {
  const isRu = locale === 'ru'
  return {
    title: (isRu ? article.titleRu : article.titleUk) ?? article.titleUk ?? article.titleRu ?? '',
    summary: (isRu ? article.summaryRu : article.summaryUk) ?? article.summaryUk ?? article.summaryRu ?? '',
    fullText: (isRu ? article.fullTextRu : article.fullTextUk) ?? article.fullTextUk ?? article.fullTextRu ?? '',
  }
}

export function getLocaleDate(date: Date | string | null | undefined, locale: string): string {
  if (!date) return ''
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString(locale === 'ru' ? 'ru-RU' : 'uk-UA', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}
