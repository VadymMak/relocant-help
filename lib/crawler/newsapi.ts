import { RawArticle } from './crawl'

interface NewsDataItem {
  title: string | null
  description: string | null
  link: string
  pubDate: string | null
  source_id: string
  country: string[]
  language: string
  content: string | null
}

interface NewsDataResponse {
  status: string
  totalResults: number
  results: NewsDataItem[]
  nextPage?: string
}

export async function fetchNewsData(
  query: string,
  countries: string[],
  language = 'en'
): Promise<RawArticle[]> {
  const apiKey = process.env.NEWSDATA_API_KEY
  if (!apiKey) {
    console.warn('[newsapi] NEWSDATA_API_KEY not set — skipping')
    return []
  }

  const url = new URL('https://newsdata.io/api/1/news')
  url.searchParams.set('apikey', apiKey)
  url.searchParams.set('q', query)
  url.searchParams.set('country', countries.join(','))
  url.searchParams.set('language', language)
  url.searchParams.set('category', 'politics,world,top')

  try {
    const res = await fetch(url.toString(), {
      headers: { 'User-Agent': 'relocant.help/1.0' },
      next: { revalidate: 0 },
      signal: AbortSignal.timeout(15000),
    })

    if (!res.ok) {
      console.error(`[newsapi] HTTP error: ${res.status}`)
      return []
    }

    const data = await res.json() as NewsDataResponse

    if (data.status !== 'success') {
      console.error(`[newsapi] API error: ${data.status}`)
      return []
    }

    return data.results
      .filter(item => item.link && item.title)
      .map(item => ({
        sourceId: 'newsdata-api',
        url: item.link,
        title: item.title ?? '',
        content: item.content ?? item.description ?? '',
        publishedAt: item.pubDate ?? undefined,
        language: item.language ?? 'en',
      }))
  } catch (err) {
    console.error('[newsapi] Fetch failed:', err)
    return []
  }
}
