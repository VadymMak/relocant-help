import { extract } from '@extractus/article-extractor'

interface RawArticle {
  sourceId: string
  url: string
  title: string
  content: string
  publishedAt?: string
  language: string
}

interface ScrapeSource {
  id: string
  url: string
  country: string
  baseUrl: string
}

const SCRAPEABLE_SOURCES: ScrapeSource[] = [
  {
    id: 'infomigrants-scrape',
    url: 'https://www.infomigrants.net/en/post/list',
    country: 'European Union',
    baseUrl: 'https://www.infomigrants.net',
  },
  {
    id: 'kyivindependent-scrape',
    url: 'https://kyivindependent.com/tag/refugees/',
    country: 'European Union',
    baseUrl: 'https://kyivindependent.com',
  },
  {
    id: 'euractiv-migration',
    url: 'https://www.euractiv.com/sections/migration/',
    country: 'European Union',
    baseUrl: 'https://www.euractiv.com',
  },
  {
    id: 'migrate-pl',
    url: 'https://www.gov.pl/web/udsc-en/news-OFF',
    country: 'Poland',
    baseUrl: 'https://www.gov.pl',
  },
]

export async function scrapeNewsPages(): Promise<RawArticle[]> {
  const articles: RawArticle[] = []

  console.log('[Scraper] Starting direct scrape...')

  for (const source of SCRAPEABLE_SOURCES) {
    try {
      console.log(`[Scraper] Fetching ${source.id}: ${source.url}`)

      const res = await fetch(source.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; relocant.help news aggregator)',
          'Accept': 'text/html',
        },
        signal: AbortSignal.timeout(10000),
        next: { revalidate: 0 },
      })

      if (!res.ok) {
        console.warn(`[Scraper] HTTP ${res.status} for ${source.id}`)
        continue
      }

      const html = await res.text()

      const linkMatches = html.matchAll(
        /href="([^"]*(?:\/news\/|\/article\/|\/post\/|\/en\/)[^"]*?)"/g
      )

      const links = new Set<string>()
      for (const match of linkMatches) {
        let href = match[1]
        if (href.startsWith('/')) href = source.baseUrl + href
        if (href.startsWith('http')) links.add(href)
      }

      let count = 0
      for (const link of links) {
        if (count >= 5) break

        try {
          const extracted = await extract(link, {}, { signal: AbortSignal.timeout(15000) })
          if (!extracted) continue

          const content = extracted.content
            ? extracted.content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 8000)
            : extracted.description ?? ''

          if (content.length < 100) continue

          const slug = link.split('/').filter(Boolean).pop() ?? ''
          const title = extracted.title || slug.replace(/-/g, ' ')
          if (!title || title.length < 5) continue

          articles.push({
            sourceId: source.id,
            url: link,
            title,
            content,
            publishedAt: extracted.published ?? undefined,
            language: 'en',
          })
          count++

          await new Promise(r => setTimeout(r, 1500))
        } catch (err) {
          console.error(`[Scraper] extract failed for ${link}:`, err)
        }
      }

      console.log(`[Scraper] ${source.id} → ${count} articles extracted`)

      await new Promise(r => setTimeout(r, 2000))
    } catch (err) {
      console.error(`[Scraper] Error for ${source.id}:`, err)
    }
  }

  console.log(`[Scraper] Total articles found: ${articles.length}`)
  return articles
}
