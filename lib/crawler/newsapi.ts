export interface NewsDataArticle {
  article_id: string
  title: string
  description: string | null
  content: string | null
  link: string
  pubDate: string
  source_id: string
  source_name: string
  country: string[]
  language: string
  keywords: string[] | null
}

const NEWSDATA_BASE = 'https://newsdata.io/api/1/news'

const SEARCH_QUERIES = [
  'Ukrainian refugees Europe residence',
  'temporary protection Ukraine EU 2026',
  'Ukrainian migrants Spain Italy Romania',
]

export async function fetchFromNewsData(): Promise<NewsDataArticle[]> {
  const apiKey = process.env.NEWSDATA_API_KEY
  if (!apiKey) {
    console.warn('[NewsData] NEWSDATA_API_KEY not set — skipping')
    return []
  }

  console.log('[NewsData] Starting fetch...')

  const allArticles: NewsDataArticle[] = []
  const seenIds = new Set<string>()

  for (const query of SEARCH_QUERIES) {
    try {
      // Note: timeframe is a paid-plan-only param — omit for free plan
      const params = new URLSearchParams({
        apikey: apiKey,
        q: query,
        language: 'en',
        size: '10',
      })

      console.log(`[NewsData] Querying: "${query}"`)

      const res = await fetch(`${NEWSDATA_BASE}?${params}`, {
        next: { revalidate: 0 },
        signal: AbortSignal.timeout(15000),
      })

      if (!res.ok) {
        console.error(`[NewsData] HTTP ${res.status} for query: "${query}"`)
        continue
      }

      const data = await res.json() as {
        status: string
        totalResults?: number
        results?: NewsDataArticle[]
        message?: string
      }

      if (data.status !== 'success' || !data.results) {
        console.error(`[NewsData] API error: status="${data.status}" message="${data.message ?? ''}"`)
        continue
      }

      console.log(`[NewsData] Query "${query}" → ${data.results.length} results (total: ${data.totalResults ?? '?'})`)

      for (const article of data.results) {
        if (article.article_id && !seenIds.has(article.article_id)) {
          seenIds.add(article.article_id)
          allArticles.push(article)
        }
      }

      await new Promise(r => setTimeout(r, 1000))
    } catch (err) {
      console.error(`[NewsData] Query failed: "${query}"`, err)
    }
  }

  console.log(`[NewsData] Total unique articles fetched: ${allArticles.length}`)
  return allArticles
}

const COUNTRY_MAP: Record<string, string> = {
  sk: 'Slovakia',
  pl: 'Poland',
  de: 'Germany',
  cz: 'Czech Republic',
  es: 'Spain',
  it: 'Italy',
  ro: 'Romania',
  bg: 'Bulgaria',
  pt: 'Portugal',
  tr: 'Turkey',
  at: 'Austria',
  nl: 'Netherlands',
  fr: 'France',
  gb: 'United Kingdom',
  ua: 'Ukraine',
}

export function mapNewsDataCountry(countries: string[]): string {
  for (const code of countries) {
    if (COUNTRY_MAP[code]) return COUNTRY_MAP[code]
  }
  return 'European Union'
}
