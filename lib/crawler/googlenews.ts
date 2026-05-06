// RawArticle shape — mirrors the type in crawl.ts (structurally compatible)
interface RawArticle {
  sourceId: string
  url: string
  title: string
  content: string
  publishedAt?: string
  language: string
}

const GOOGLE_NEWS_QUERIES = [
  // Spain
  'ukraianos España residencia 2026',
  'Ukrainian refugees Spain residence permit 2026',
  // Italy
  'ucraini Italia permesso soggiorno 2026',
  'Ukrainian refugees Italy 2026',
  // Romania
  'ucraineni Romania 2026 protectie',
  'Ukrainian refugees Romania 2026',
  // Germany
  'Ukrainer Deutschland Aufenthaltserlaubnis 2026',
  'Ukrainian refugees Germany work permit 2026',
  // Poland
  'Ukraińcy Polska zezwolenie pobyt 2026',
  'Ukrainian Poland PESEL residence 2026',
  // Bulgaria
  'украинци България 2026',
  'Ukrainian refugees Bulgaria 2026',
  // General EU
  'temporary protection Ukraine EU extension 2026',
  'Ukrainian migrants Europe rights 2026',
]

export async function fetchFromGoogleNews(): Promise<RawArticle[]> {
  const allArticles: RawArticle[] = []
  const seenUrls = new Set<string>()

  console.log('[GoogleNews] Starting fetch...')

  for (const query of GOOGLE_NEWS_QUERIES) {
    try {
      const encodedQuery = encodeURIComponent(query)
      const rssUrl = `https://news.google.com/rss/search?q=${encodedQuery}&hl=en&gl=EU&ceid=EU:en`

      console.log(`[GoogleNews] Querying: "${query}"`)

      const res = await fetch(rssUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; relocant.help/1.0)',
        },
        next: { revalidate: 0 },
        signal: AbortSignal.timeout(15000),
      })

      if (!res.ok) {
        console.error(`[GoogleNews] HTTP ${res.status} for: "${query}"`)
        continue
      }

      const xml = await res.text()
      const items = xml.matchAll(/<item>([\s\S]*?)<\/item>/g)
      let count = 0

      for (const match of items) {
        const item = match[1]

        const title = item
          .match(/<title[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/)?.[1]
          ?.trim() ?? ''

        const link = item
          .match(/<link[^>]*>([\s\S]*?)<\/link>/)?.[1]
          ?.trim() ?? ''

        const pubDate = item
          .match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/)?.[1]
          ?.trim() ?? ''

        if (!title || !link || seenUrls.has(link)) continue
        seenUrls.add(link)

        allArticles.push({
          sourceId: 'googlenews',
          url: link,
          title,
          content: title,
          publishedAt: pubDate,
          language: 'en',
        })
        count++
      }

      console.log(`[GoogleNews] Query "${query}" → ${count} articles`)

      await new Promise(r => setTimeout(r, 1500))
    } catch (err) {
      console.error(`[GoogleNews] Query failed: "${query}"`, err)
    }
  }

  console.log(`[GoogleNews] Total unique articles fetched: ${allArticles.length}`)
  return allArticles
}
