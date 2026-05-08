import Anthropic from '@anthropic-ai/sdk'
import { RELEVANCE_KEYWORDS, CrawlerSource } from './sources'
import { getSources } from '@/lib/db/sources-config'
import { getPrisma } from '@/lib/db'
import { fetchAllNewsArticles, mapNewsDataCountry } from './newsapi'
import { fetchFromGoogleNews } from './googlenews'
import { scrapeNewsPages } from './scraper'
import { verifyArticle } from '@/lib/vector/verify'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

// ── Types ─────────────────────────────────────────────────
export interface RawArticle {
  sourceId: string
  url: string
  title: string
  content: string
  publishedAt?: string
  language: string
}

export interface ProcessedArticle {
  sourceId: string
  url: string
  originalTitle: string
  originalContent: string
  originalLanguage: string
  titleUk?: string
  titleRu?: string
  summaryUk?: string
  summaryRu?: string
  fullTextUk?: string
  fullTextRu?: string
  tags: string[]
  relevanceScore: number
  isRelevant: boolean
  country: string
  publishedAt?: string
  status: 'pending_review' | 'approved' | 'rejected'
}

// ── Step 1: Fetch RSS feed ─────────────────────────────────
export async function fetchRSS(url: string): Promise<RawArticle[]> {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'relocant.help/1.0 (news aggregator for Ukrainian relocants)' },
    next: { revalidate: 0 },
  })
  if (!res.ok) throw new Error(`RSS fetch failed: ${res.status} ${url}`)

  const xml = await res.text()
  const items: RawArticle[] = []

  // Handle both <item> (RSS) and <entry> (Atom)
  const rssMatches = xml.matchAll(/<item[^>]*>([\s\S]*?)<\/item>/g)
  const atomMatches = xml.matchAll(/<entry[^>]*>([\s\S]*?)<\/entry>/g)

  for (const match of [...rssMatches, ...atomMatches]) {
    const item = match[1]

    const title =
      item.match(/<title[^>]*><!\[CDATA\[([\s\S]*?)\]\]><\/title>/)?.[1] ??
      item.match(/<title[^>]*>([^<]+)<\/title>/)?.[1] ?? ''

    // Atom uses <link href="..."/>, RSS uses <link>url</link>
    const link =
      item.match(/<link[^>]+href=["']([^"']+)["']/)?.[1] ??
      item.match(/<link[^>]*>([\s\S]*?)<\/link>/)?.[1]?.trim() ?? ''

    const desc =
      item.match(/<description[^>]*><!\[CDATA\[([\s\S]*?)\]\]><\/description>/)?.[1] ??
      item.match(/<description[^>]*>([^<]*)<\/description>/)?.[1] ??
      item.match(/<content[^>]*><!\[CDATA\[([\s\S]*?)\]\]><\/content>/)?.[1] ??
      item.match(/<summary[^>]*>([^<]*)<\/summary>/)?.[1] ?? ''

    const pubDate =
      item.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/)?.[1] ??
      item.match(/<published[^>]*>([\s\S]*?)<\/published>/)?.[1] ??
      item.match(/<updated[^>]*>([\s\S]*?)<\/updated>/)?.[1] ?? ''

    if (title && link) {
      items.push({
        sourceId: '',
        url: link,
        title: title.replace(/<[^>]+>/g, '').trim(),
        content: desc.replace(/<[^>]+>/g, '').trim(),
        publishedAt: pubDate,
        language: 'unknown',
      })
    }
  }
  return items
}

// ── Step 2: Fetch HTML page and extract text ───────────────
export async function fetchPage(url: string): Promise<RawArticle[]> {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'relocant.help/1.0' },
    next: { revalidate: 0 },
  })
  if (!res.ok) throw new Error(`Page fetch failed: ${res.status} ${url}`)
  const html = await res.text()

  const text = extractText(html)

  return [{
    sourceId: '',
    url,
    title: html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] ?? url,
    content: text,
    language: 'unknown',
  }]
}

// ── Step 2b: Extract full article content — 3-level fallback
async function enrichWithFullPage(url: string, useJina = false): Promise<string> {
  // Level 1: browser-like headers (skipped when useJina: true)
  if (!useJina) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
          'Accept-Encoding': 'gzip, deflate, br',
          'Cache-Control': 'no-cache',
        },
        signal: AbortSignal.timeout(15000),
      })
      if (res.ok) {
        const html = await res.text()
        const text = html
          .replace(/<script[\s\S]*?<\/script>/gi, '')
          .replace(/<style[\s\S]*?<\/style>/gi, '')
          .replace(/<nav[\s\S]*?<\/nav>/gi, '')
          .replace(/<header[\s\S]*?<\/header>/gi, '')
          .replace(/<footer[\s\S]*?<\/footer>/gi, '')
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
        if (text.length > 200) {
          console.log(`[enrich] L1 ${url} (${text.length}c)`)
          return text.slice(0, 12000)
        }
      }
    } catch (err) {
      console.warn(`[enrich] L1 failed for ${url}:`, err)
    }
  }

  // Level 2: Jina AI Reader
  try {
    const jinaRes = await fetch(`https://r.jina.ai/${url}`, {
      headers: { 'Accept': 'text/plain', 'X-Return-Format': 'text' },
      signal: AbortSignal.timeout(15000),
    })
    if (jinaRes.ok) {
      const text = await jinaRes.text()
      if (text.length > 200) {
        console.log(`[enrich] L2 (Jina) ${url} (${text.length}c)`)
        return text.slice(0, 12000)
      }
    }
  } catch (err) {
    console.warn(`[enrich] L2 (Jina) failed for ${url}:`, err)
  }

  // Level 3: Google News RSS — site:{domain} query
  try {
    const domain = new URL(url).hostname.replace(/^www\./, '')
    const gRssUrl = `https://news.google.com/rss/search?q=site:${domain}&hl=en&gl=EU&ceid=EU:en`
    const gRes = await fetch(gRssUrl, { signal: AbortSignal.timeout(10000) })
    if (gRes.ok) {
      const xml = await gRes.text()
      const items: string[] = []
      for (const match of xml.matchAll(/<item[\s\S]*?<\/item>/g)) {
        const item = match[0]
        const title = item.match(/<title[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/)?.[1]?.replace(/<[^>]+>/g, '').trim() ?? ''
        const desc = item.match(/<description[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/)?.[1]?.replace(/<[^>]+>/g, ' ').trim() ?? ''
        if (title) items.push(`${title}\n${desc}`.trim())
      }
      if (items.length > 0) {
        const text = items.join('\n\n')
        console.log(`[enrich] L3 (GNews RSS) ${domain} (${items.length} items)`)
        return text.slice(0, 12000)
      }
    }
  } catch (err) {
    console.warn(`[enrich] L3 (GNews RSS) failed for ${url}:`, err)
  }

  return ''
}

// ── Layer 3: Extract article links from a news list page ───
export async function extractArticleLinks(
  source: CrawlerSource,
  seenUrls: Set<string>
): Promise<RawArticle[]> {
  // ── useJina path: fetch listing via Jina, parse markdown links ──
  if (source.useJina) {
    let jinaOk = false
    try {
      const jinaRes = await fetch(`https://r.jina.ai/${source.url}`, {
        headers: { 'Accept': 'text/plain', 'X-Return-Format': 'text' },
        signal: AbortSignal.timeout(15000),
      })
      if (!jinaRes.ok) throw new Error(`Jina HTTP ${jinaRes.status}`)
      const markdown = await jinaRes.text()

      const linkCount = (markdown.match(/\[.+?\]\(https?/g) || []).length
      if (linkCount < 3 || markdown.length < 800) {
        console.warn(`[JINA] poor content quality for ${source.id} (links=${linkCount}, len=${markdown.length}), falling to L3`)
      } else {
        jinaOk = true
        const origin = new URL(source.url).origin
        const candidates = new Set<string>()
        const mdLinkPattern = /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g
        let m: RegExpExecArray | null
        while ((m = mdLinkPattern.exec(markdown)) !== null) {
          const href = m[2]
          if (href.includes(origin.replace(/^https?:\/\//, ''))) candidates.add(href)
        }

        const newUrls = [...candidates].filter(u => !seenUrls.has(u)).slice(0, 15)
        const articles: RawArticle[] = []
        for (const articleUrl of newUrls) {
          const content = await enrichWithFullPage(articleUrl, true)
          if (!content || content.length < 100) continue
          const title = content.split('\n')[0].trim().slice(0, 200) || articleUrl
          articles.push({ sourceId: source.id, url: articleUrl, title, content, language: source.language })
          await new Promise(r => setTimeout(r, 1500))
        }
        return articles
      }
    } catch (err) {
      console.warn(`[JINA] fetch failed for ${source.id}: ${err}, falling to L3`)
    }

    if (!jinaOk) {
      // Level 3: Google News RSS for domain
      try {
        const domain = new URL(source.url).hostname.replace(/^www\./, '')
        const gRssUrl = `https://news.google.com/rss/search?q=site:${domain}&hl=en&gl=EU&ceid=EU:en`
        const gRes = await fetch(gRssUrl, { signal: AbortSignal.timeout(10000) })
        if (gRes.ok) {
          const xml = await gRes.text()
          const articles: RawArticle[] = []
          for (const match of xml.matchAll(/<item[\s\S]*?<\/item>/g)) {
            const item = match[0]
            const title = item.match(/<title[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/)?.[1]?.replace(/<[^>]+>/g, '').trim() ?? ''
            const link = item.match(/<link[^>]*>([\s\S]*?)<\/link>/)?.[1]?.trim() ?? ''
            const desc = item.match(/<description[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/)?.[1]?.replace(/<[^>]+>/g, ' ').trim() ?? ''
            if (title && link && !seenUrls.has(link)) {
              articles.push({ sourceId: source.id, url: link, title, content: desc, language: source.language })
            }
          }
          console.log(`[L3] GNews RSS for ${domain}: ${articles.length} items`)
          return articles.slice(0, 10)
        }
      } catch (err) {
        throw new Error(`L3 Google News RSS failed for ${source.id}: ${err}`)
      }
    }

    return []
  }

  // ── standard path ────────────────────────────────────────────
  let html: string
  try {
    const res = await fetch(source.url, {
      headers: { 'User-Agent': 'relocant.help/1.0' },
      next: { revalidate: 0 },
      signal: AbortSignal.timeout(15000),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    html = await res.text()
  } catch (err) {
    throw new Error(`Page fetch failed: ${err}`)
  }

  // Extract base origin for relative links
  const origin = new URL(source.url).origin

  // Find all hrefs that look like article/news links
  const hrefPattern = /href=["']([^"']+)["']/g
  const candidates = new Set<string>()
  let m: RegExpExecArray | null

  while ((m = hrefPattern.exec(html)) !== null) {
    const href = m[1]
    // Skip anchors, javascript, mailto, assets
    if (!href || href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('mailto:')) continue
    if (/\.(css|js|png|jpg|gif|svg|ico|woff|pdf)(\?|$)/i.test(href)) continue

    // Only keep links that contain article-like path segments
    const articlePattern = /\/(news|article|aktualit|sprav|meldung|press|novinky|aktualn|media|clanek|info|post|blog)\//i
    if (!articlePattern.test(href)) continue

    const absolute = href.startsWith('http') ? href : `${origin}${href.startsWith('/') ? '' : '/'}${href}`
    candidates.add(absolute)
  }

  // Filter to only URLs not seen before
  const newUrls = [...candidates].filter(u => !seenUrls.has(u)).slice(0, 15)

  const articles: RawArticle[] = []
  for (const url of newUrls) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'relocant.help/1.0' },
        next: { revalidate: 0 },
        signal: AbortSignal.timeout(10000),
      })
      if (!res.ok) continue
      const pageHtml = await res.text()
      const title = pageHtml.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim() ?? url
      const content = extractText(pageHtml)
      if (content.length < 100) continue

      articles.push({
        sourceId: source.id,
        url,
        title,
        content,
        language: source.language,
      })

      // Polite delay between article fetches
      await new Promise(r => setTimeout(r, 1500))
    } catch {
      // Skip unreachable article pages
    }
  }

  return articles
}

function extractText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<nav[\s\S]*?<\/nav>/gi, '')
    .replace(/<header[\s\S]*?<\/header>/gi, '')
    .replace(/<footer[\s\S]*?<\/footer>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 8000)
}

// ── Country detection from URL (first-pass before Claude) ─────
function detectCountryFromUrl(url: string): string | null {
  try {
    const { hostname, pathname } = new URL(url)
    const full = `${hostname}${pathname}`.toLowerCase()
    const tld = hostname.split('.').pop() ?? ''

    if (tld === 'es' || full.includes('spain') || full.includes('españa')) return 'Spain'
    if (tld === 'it' || full.includes('italy') || full.includes('italia')) return 'Italy'
    if (tld === 'pl' || full.includes('poland') || full.includes('polska')) return 'Poland'
    if (tld === 'de' || full.includes('germany') || full.includes('deutschland')) return 'Germany'
    if (tld === 'sk' || full.includes('slovakia') || full.includes('slovensko')) return 'Slovakia'
    if (tld === 'cz' || full.includes('czech') || full.includes('czechia')) return 'Czech Republic'
    if (tld === 'ro' || full.includes('romania') || full.includes('românia')) return 'Romania'
    if (tld === 'bg' || full.includes('bulgaria') || full.includes('българия')) return 'Bulgaria'
    if (tld === 'at' || full.includes('austria') || full.includes('österreich')) return 'Austria'
    if (tld === 'hu' || full.includes('hungary') || full.includes('magyarország')) return 'Hungary'
    if (tld === 'pt' || full.includes('portugal')) return 'Portugal'
    if (tld === 'nl' || full.includes('netherlands') || full.includes('nederland')) return 'Netherlands'
    if (tld === 'fr' || full.includes('france')) return 'France'
    if (tld === 'dk' || full.includes('denmark') || full.includes('danmark')) return 'Denmark'
    if (tld === 'no' || full.includes('norway') || full.includes('norge')) return 'Norway'
    if (tld === 'se' || full.includes('sweden') || full.includes('sverige')) return 'Sweden'
    if (tld === 'fi' || full.includes('finland') || full.includes('suomi')) return 'Finland'
    if (tld === 'be' || full.includes('belgium') || full.includes('belgie') || full.includes('belgique')) return 'Belgium'
    if (tld === 'gb' || tld === 'uk' || full.includes('united kingdom') || full.includes('britain')) return 'United Kingdom'
  } catch {
    // ignore malformed URLs
  }
  return null
}

// ── Step 3: Claude AI filters and translates ───────────────
export async function processWithClaude(
  article: RawArticle,
  source: CrawlerSource
): Promise<ProcessedArticle | null> {
  const keywordsStr = RELEVANCE_KEYWORDS.join(', ')
  const urlCountry = detectCountryFromUrl(article.url)
  const countryHint = urlCountry ?? source.country

  // ── Call 1: Haiku — filter only (cheap, runs for every article) ──
  const filterPrompt = `You are a filter for a news aggregator for Ukrainian/Russian-speaking relocants in Europe.
Respond with ONLY valid JSON (no markdown, no explanation).

SOURCE: ${source.name} (${countryHint})
TITLE: ${article.title}
CONTENT (first 2000 chars): ${article.content.slice(0, 2000)}

{"relevanceScore":number 0-100,"detectedCountry":"one of: Slovakia,Poland,Germany,Czech Republic,Spain,Italy,Romania,Bulgaria,Portugal,Austria,Netherlands,France,Belgium,Denmark,Norway,Sweden,Finland,United Kingdom,Turkey,Ukraine,Hungary,European Union","tags":["tag1","tag2"]}

Score 80-100: directly about Ukrainians, TP status, residence permits, displaced persons.
Score 50-79: work permits, social benefits, housing, integration, health, school, banking for migrants in EU.
Score 20-49: general migration stats, EU policy debates, economic news affecting migrants.
Score 0-19: domestic politics, sports, crime, culture with no migration angle.
NOT relevant (score 0-15): other refugee groups (Syrian/Afghan/African), general EU politics, disasters unrelated to Ukrainian relocation.
Keywords: ${keywordsStr}`

  let score = 0
  let detectedCountry: string | undefined
  let tags: string[] = []

  try {
    const filterRes = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      messages: [{ role: 'user', content: filterPrompt }],
    })
    const filterText = filterRes.content[0].type === 'text' ? filterRes.content[0].text : ''
    const filterJson = filterText.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim()
    const filterParsed = JSON.parse(filterJson) as {
      relevanceScore: number
      detectedCountry?: string
      tags: string[]
    }
    score = filterParsed.relevanceScore ?? 0
    detectedCountry = filterParsed.detectedCountry
    tags = filterParsed.tags ?? []
  } catch (e) {
    console.error('Haiku filter failed:', e)
    return null
  }

  const country = detectedCountry || urlCountry || source.country

  // Stop here — irrelevant articles don't need translation
  if (score < 30) {
    return {
      sourceId: source.id,
      url: article.url,
      originalTitle: article.title,
      originalContent: article.content,
      originalLanguage: source.language,
      tags: [...tags, ...source.tags],
      relevanceScore: score,
      isRelevant: false,
      country,
      publishedAt: article.publishedAt,
      status: 'rejected',
    }
  }

  // ── Call 2a / 2b: Sonnet — one language per call to avoid token truncation ──
  const TRANSLATION_RULES = `TRANSLATION RULES (strictly follow):
- Translate WORD FOR WORD — do not summarize, do not shorten
- Keep ALL numbers: salaries, amounts, percentages, years
- Keep ALL dates and deadlines exactly as written
- Keep ALL country names, city names, institution names
- Keep ALL official law names and legal terms
- Keep ALL steps, bullet points, and numbered lists
- Keep ALL links and references to official resources
- If original is long → translation must be equally long
- Minimum translation length: 500 words
- Format with paragraphs and headers matching the original`

  function buildPrompt(lang: 'Ukrainian' | 'Russian', content: string): string {
    return `You are a professional translator for a legal/migration news service.
Translate this article to ${lang}.
Respond with ONLY valid JSON (no markdown, no explanation).

TITLE: ${article.title}
CONTENT: ${content}

${TRANSLATION_RULES}

{"title":"title in ${lang}","summary":"2-3 sentences in ${lang}: what changed and what relocants must do","fullText":"complete word-for-word translation to ${lang}"}`
  }

  async function callTranslation(
    lang: 'Ukrainian' | 'Russian',
    content: string
  ): Promise<{ title?: string; summary?: string; fullText?: string } | null> {
    for (const slice of [content, content.slice(0, 4000)]) {
      try {
        const res = await anthropic.messages.create({
          model: 'claude-sonnet-4-6',
          max_tokens: 4000,
          messages: [{ role: 'user', content: buildPrompt(lang, slice) }],
        })
        const text = res.content[0].type === 'text' ? res.content[0].text : ''
        const cleaned = text.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim()
        return JSON.parse(cleaned) as { title?: string; summary?: string; fullText?: string }
      } catch (e) {
        if (slice === content) {
          console.warn(`[Translation] ${lang} parse failed, retrying with shorter content:`, e)
        } else {
          console.error(`[Translation] ${lang} failed on retry:`, e)
        }
      }
    }
    return null
  }

  try {
    const content = article.content.slice(0, 12000)
    const [uk, ru] = await Promise.all([
      callTranslation('Ukrainian', content),
      callTranslation('Russian', content),
    ])

    return {
      sourceId: source.id,
      url: article.url,
      originalTitle: article.title,
      originalContent: article.content,
      originalLanguage: source.language,
      titleUk: uk?.title,
      titleRu: ru?.title,
      summaryUk: uk?.summary,
      summaryRu: ru?.summary,
      fullTextUk: uk?.fullText,
      fullTextRu: ru?.fullText,
      tags: [...tags, ...source.tags],
      relevanceScore: score,
      isRelevant: true,
      country,
      publishedAt: article.publishedAt,
      status: score >= 50 ? 'pending_review' : 'rejected',
    }
  } catch (e) {
    console.error('Translation step failed entirely:', e)
    return {
      sourceId: source.id,
      url: article.url,
      originalTitle: article.title,
      originalContent: article.content,
      originalLanguage: source.language,
      tags: [...tags, ...source.tags],
      relevanceScore: score,
      isRelevant: true,
      country,
      publishedAt: article.publishedAt,
      status: 'rejected',
    }
  }
}

// ── Step 4: Main crawl runner ──────────────────────────────
export async function runCrawler(sourceIds?: string[]): Promise<{
  processed: number
  relevant: number
  errors: string[]
}> {
  const allSources = await getSources()
  const sources = sourceIds
    ? allSources.filter(s => sourceIds.includes(s.id) && s.active)
    : allSources.filter(s => s.active)

  let processed = 0
  let relevant = 0
  const errors: string[] = []

  // ── Layer 0: Direct website scraping ─────────────────────────
  {
    let sc_found = 0
    let sc_relevant = 0
    try {
      const scrapedArticles = await scrapeNewsPages()
      sc_found = scrapedArticles.length

      for (const raw of scrapedArticles) {
        const existing = await getPrisma().crawledArticle.findFirst({
          where: {
            OR: [
              { url: raw.url },
              { originalTitle: raw.title },
            ],
          },
          select: { id: true },
        })
        if (existing) continue

        const content = await enrichWithFullPage(raw.url)
        if (content.length < 100) continue
        const enriched = { ...raw, content }

        const scrapeSource: CrawlerSource = {
          id: raw.sourceId,
          country: 'European Union',
          countryFlag: '🌍',
          name: raw.sourceId.replace(/-/g, ' '),
          url: raw.url,
          language: 'en',
          targetLanguages: ['uk', 'ru'],
          tags: ['migration', 'Ukraine', 'Europe'],
          checkIntervalHours: 12,
          active: true,
        }

        const result = await processWithClaude(enriched, scrapeSource)
        processed++

        if (result && result.isRelevant) {
          relevant++
          sc_relevant++
          console.log(`[Scraper] Relevant: "${result.originalTitle}" → ${result.country} (score: ${result.relevanceScore})`)
          await getPrisma().crawledArticle.create({
            data: {
              sourceId: result.sourceId,
              url: result.url,
              originalTitle: result.originalTitle,
              originalContent: result.originalContent?.slice(0, 10000),
              originalLanguage: 'en',
              titleUk: result.titleUk,
              titleRu: result.titleRu,
              summaryUk: result.summaryUk,
              summaryRu: result.summaryRu,
              fullTextUk: result.fullTextUk,
              fullTextRu: result.fullTextRu,
              tags: result.tags,
              relevanceScore: result.relevanceScore,
              country: result.country,
              status: result.status,
              publishedAt: new Date(),
            },
          })
        }

        await new Promise(r => setTimeout(r, 2000))
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      errors.push(`scraper: ${message}`)
    }

    await getPrisma().crawlerLog.create({
      data: {
        sourceId: 'scraper-layer0',
        status: 'success',
        articlesFound: sc_found,
        articlesRelevant: sc_relevant,
      },
    })
  }

  // ── Layer 1: Google News RSS (free, no API key) ──────────────
  {
    let gn_found = 0
    let gn_relevant = 0
    try {
      const googleArticles = await fetchFromGoogleNews()
      gn_found = googleArticles.length

      for (const raw of googleArticles.slice(0, 40)) {
        const existing = await getPrisma().crawledArticle.findFirst({
          where: {
            OR: [
              { url: raw.url },
              { originalTitle: raw.title },
            ],
          },
          select: { id: true },
        })
        if (existing) continue

        const fetchedContent = await enrichWithFullPage(raw.url)
        const enriched = { ...raw, content: fetchedContent || raw.content }

        const googleSource: CrawlerSource = {
          id: 'googlenews',
          country: 'European Union',
          countryFlag: '🌍',
          name: 'Google News',
          url: raw.url,
          language: 'en',
          targetLanguages: ['uk', 'ru'],
          tags: ['migration', 'Ukraine', 'Europe'],
          checkIntervalHours: 6,
          active: true,
        }

        const result = await processWithClaude(enriched, googleSource)
        processed++

        if (result && result.isRelevant) {
          relevant++
          gn_relevant++
          console.log(`[GoogleNews] Relevant: "${result.originalTitle}" → ${result.country} (score: ${result.relevanceScore})`)
          await getPrisma().crawledArticle.create({
            data: {
              sourceId: 'googlenews',
              url: result.url,
              originalTitle: result.originalTitle,
              originalContent: result.originalContent?.slice(0, 10000),
              originalLanguage: 'en',
              titleUk: result.titleUk,
              titleRu: result.titleRu,
              summaryUk: result.summaryUk,
              summaryRu: result.summaryRu,
              fullTextUk: result.fullTextUk,
              fullTextRu: result.fullTextRu,
              tags: result.tags,
              relevanceScore: result.relevanceScore,
              country: result.country,
              status: result.status,
              publishedAt: new Date(),
            },
          })
        }

        await new Promise(r => setTimeout(r, 2000))
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      errors.push(`googlenews: ${message}`)
    }

    await getPrisma().crawlerLog.create({
      data: {
        sourceId: 'googlenews-layer1',
        status: 'success',
        articlesFound: gn_found,
        articlesRelevant: gn_relevant,
      },
    })
  }

  // ── Layer 2: NewsData.io + GNews APIs ────────────────────────
  if (process.env.NEWSDATA_API_KEY || process.env.GNEWS_API_KEY) {
    let nd_found = 0
    let nd_relevant = 0
    try {
      const newsArticles = await fetchAllNewsArticles()
      nd_found = newsArticles.length

      for (const article of newsArticles) {
        const existing = await getPrisma().crawledArticle.findFirst({
          where: {
            OR: [
              { url: article.link },
              { originalTitle: article.title },
            ],
          },
          select: { id: true },
        })
        if (existing) continue

        const raw: RawArticle = {
          sourceId: `newsdata-${article.source_id}`,
          url: article.link,
          title: article.title,
          content: article.content || article.description || article.title,
          publishedAt: article.pubDate,
          language: article.language || 'en',
        }

        const newsSource: CrawlerSource = {
          id: `newsdata-${article.source_id}`,
          country: mapNewsDataCountry(article.country),
          countryFlag: '🌍',
          name: article.source_name ?? 'NewsData.io',
          url: article.link,
          language: article.language || 'en',
          targetLanguages: ['uk', 'ru'],
          tags: article.keywords ?? ['migration'],
          checkIntervalHours: 24,
          active: true,
        }

        const result = await processWithClaude(raw, newsSource)
        processed++

        if (result && result.isRelevant) {
          relevant++
          nd_relevant++
          console.log(`[NewsData] Relevant: "${result.originalTitle}" → ${result.country} (score: ${result.relevanceScore})`)
          await getPrisma().crawledArticle.create({
            data: {
              sourceId: result.sourceId,
              url: result.url,
              originalTitle: result.originalTitle,
              originalContent: result.originalContent?.slice(0, 10000),
              originalLanguage: result.originalLanguage,
              titleUk: result.titleUk,
              titleRu: result.titleRu,
              summaryUk: result.summaryUk,
              summaryRu: result.summaryRu,
              fullTextUk: result.fullTextUk,
              fullTextRu: result.fullTextRu,
              tags: result.tags,
              relevanceScore: result.relevanceScore,
              country: result.country,
              status: result.status,
              publishedAt: result.publishedAt ? new Date(result.publishedAt) : new Date(),
            },
          })
        }

        await new Promise(r => setTimeout(r, 2000))
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      errors.push(`newsdata: ${message}`)
    }

    await getPrisma().crawlerLog.create({
      data: {
        sourceId: 'newsdata-layer2',
        status: 'success',
        articlesFound: nd_found,
        articlesRelevant: nd_relevant,
      },
    })
  }

  // ── Layer 3 + 4: RSS feeds and scraping ───────────────────
  // Skip newsapi-type sources — handled by Layer 2 above
  const scrapeableSources = sources.filter(s => s.type !== 'newsapi')

  for (const source of scrapeableSources) {
    try {
      let rawArticles: RawArticle[] = []

      // ── Layer 3: RSS / Atom feeds ──────────────────────────
      if (source.rssUrl) {
        rawArticles = await fetchRSS(source.rssUrl)
        const cutoffDate = new Date()
        cutoffDate.setHours(cutoffDate.getHours() - source.checkIntervalHours)
        const beforeFilter = rawArticles.length
        rawArticles = rawArticles.filter(item => {
          if (!item.publishedAt) return true
          return new Date(item.publishedAt) > cutoffDate
        })
        console.log(`[RSS] ${source.id}: ${rawArticles.length}/${beforeFilter} items after date filter`)

      // ── Layer 4: Scrape + link extraction ─────────────────
      } else {
        // Load previously seen URLs from CrawlerLog meta or existing articles
        const seenArticles = await getPrisma().crawledArticle.findMany({
          where: { sourceId: source.id },
          select: { url: true },
        })
        const seenUrls = new Set(seenArticles.map(a => a.url))
        rawArticles = await extractArticleLinks(source, seenUrls)
      }

      rawArticles = rawArticles.map(a => ({ ...a, sourceId: source.id, language: source.language }))

      for (const raw of rawArticles.slice(0, 10)) {
        const existing = await getPrisma().crawledArticle.findFirst({
          where: {
            OR: [
              { url: raw.url },
              { originalTitle: raw.title },
            ],
          },
          select: { id: true },
        })
        if (existing) continue

        // Enrich RSS items that only have a short description
        const enriched = source.rssUrl
          ? { ...raw, content: (await enrichWithFullPage(raw.url, source.useJina)) || raw.content }
          : raw

        const article = await processWithClaude(enriched, source)
        processed++

        if (article && article.isRelevant) {
          relevant++

          // Run vector verification before saving (non-blocking — crawl continues on error)
          let verificationStatus = 'pending'
          let vectorCheckResult: object | undefined
          let extractedFactsData: object[] | undefined

          try {
            const verification = await verifyArticle({
              titleUk: article.titleUk,
              summaryUk: article.summaryUk,
              fullTextUk: article.fullTextUk,
              originalContent: article.originalContent,
              country: article.country,
            })
            verificationStatus =
              verification.recommendation === 'publish' ? 'verified'
              : verification.recommendation === 'reject' ? 'rejected_duplicate'
              : 'review_needed'
            vectorCheckResult = verification as object
            extractedFactsData = verification.extractedFacts as object[]
          } catch (e) {
            console.error('[verify] verifyArticle failed:', e)
          }

          await getPrisma().crawledArticle.create({
            data: {
              sourceId: article.sourceId,
              url: article.url,
              originalTitle: article.originalTitle,
              originalContent: article.originalContent.slice(0, 10000),
              originalLanguage: article.originalLanguage,
              titleUk: article.titleUk,
              titleRu: article.titleRu,
              summaryUk: article.summaryUk,
              summaryRu: article.summaryRu,
              fullTextUk: article.fullTextUk,
              fullTextRu: article.fullTextRu,
              tags: article.tags,
              relevanceScore: article.relevanceScore,
              country: article.country,
              status: article.status,
              verificationStatus,
              vectorCheckResult,
              extractedFacts: extractedFactsData,
              publishedAt: article.publishedAt ? new Date(article.publishedAt) : new Date(),
            },
          })
        }

        // Be polite to government servers
        await new Promise(r => setTimeout(r, 2000))
      }

      await getPrisma().crawlerLog.create({
        data: {
          sourceId: source.id,
          status: 'success',
          articlesFound: rawArticles.length,
          articlesRelevant: relevant,
        },
      })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      errors.push(`${source.id}: ${message}`)
      await getPrisma().crawlerLog.create({
        data: {
          sourceId: source.id,
          status: 'error',
          error: message,
          articlesFound: 0,
          articlesRelevant: 0,
        },
      })
    }
  }

  return { processed, relevant, errors }
}
