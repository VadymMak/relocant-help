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

const NEWSDATA_BASE = 'https://newsdata.io/api/1/latest'
const NEWSDATA_COUNTRIES = 'pl,sk,de,cz,es,it,ro,bg'
const NEWSDATA_LANGUAGES = 'en,uk,ru,pl,sk,de,cs'

const SEARCH_QUERIES = [
  '"temporary protection" Ukrainian Poland',
  '"dočasné útočisko" Slovensko',
  '"Ukrainians in Germany" visa OR work',
  '"residence permit" Ukrainians Slovakia',
  '"Ukrainian migrants" Czech Republic',
  '"temporary protection" Ukraine EU 2026',
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
      const params = new URLSearchParams({
        apikey: apiKey,
        q: query,
        country: NEWSDATA_COUNTRIES,
        language: NEWSDATA_LANGUAGES,
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

// ── GNews ────────────────────────────────────────────────────────────────────

interface GNewsRawArticle {
  title: string
  description: string
  content: string
  url: string
  image: string | null
  publishedAt: string
  source: { name: string; url: string }
}

const GNEWS_QUERIES = [
  'Ukrainian temporary protection Slovakia',
  'Ukrainians Poland residence permit 2026',
  'Ukrainian refugees Germany work permit',
]

export async function fetchFromGNews(): Promise<NewsDataArticle[]> {
  const apiKey = process.env.GNEWS_API_KEY
  if (!apiKey) {
    console.warn('[GNews] GNEWS_API_KEY not set — skipping')
    return []
  }

  console.log('[GNews] Starting fetch...')

  const allArticles: NewsDataArticle[] = []
  const seenUrls = new Set<string>()

  for (const query of GNEWS_QUERIES) {
    try {
      const params = new URLSearchParams({
        q: query,
        lang: 'en',
        max: '10',
        token: apiKey,
      })

      console.log(`[GNews] Querying: "${query}"`)

      const res = await fetch(`https://gnews.io/api/v4/search?${params}`, {
        next: { revalidate: 0 },
        signal: AbortSignal.timeout(15000),
      })

      if (!res.ok) {
        console.error(`[GNews] HTTP ${res.status} for query: "${query}"`)
        continue
      }

      const data = await res.json() as {
        totalArticles?: number
        articles?: GNewsRawArticle[]
        errors?: string[]
      }

      if (!data.articles) {
        console.error(`[GNews] No articles in response for query: "${query}"`)
        continue
      }

      console.log(`[GNews] Query "${query}" → ${data.articles.length} results`)

      for (const article of data.articles) {
        if (!article.url || seenUrls.has(article.url)) continue
        seenUrls.add(article.url)

        const sourceSlug = article.source.name.toLowerCase().replace(/\s+/g, '-')
        allArticles.push({
          article_id: `gnews-${article.url.replace(/[^a-zA-Z0-9]/g, '').slice(-24)}`,
          title: article.title,
          description: article.description,
          content: article.content,
          link: article.url,
          pubDate: article.publishedAt,
          source_id: sourceSlug,
          source_name: article.source.name,
          country: [],
          language: 'en',
          keywords: null,
        })
      }

      await new Promise(r => setTimeout(r, 1000))
    } catch (err) {
      console.error(`[GNews] Query failed: "${query}"`, err)
    }
  }

  console.log(`[GNews] Total unique articles fetched: ${allArticles.length}`)
  return allArticles
}

// ── Merged fetch ─────────────────────────────────────────────────────────────

export async function fetchAllNewsArticles(): Promise<NewsDataArticle[]> {
  const [newsDataArticles, gNewsArticles] = await Promise.all([
    fetchFromNewsData(),
    fetchFromGNews(),
  ])

  const seenLinks = new Set(newsDataArticles.map(a => a.link))
  const merged = [...newsDataArticles]

  for (const article of gNewsArticles) {
    if (!seenLinks.has(article.link)) {
      seenLinks.add(article.link)
      merged.push(article)
    }
  }

  console.log(
    `[NewsAPIs] Merged: ${merged.length} articles (NewsData: ${newsDataArticles.length}, GNews: ${gNewsArticles.length})`
  )
  return merged
}

// ── Country mapping ──────────────────────────────────────────────────────────

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
