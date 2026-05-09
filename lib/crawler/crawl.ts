import Anthropic from '@anthropic-ai/sdk'
import { RELEVANCE_KEYWORDS, CrawlerSource } from './sources'
import { getSources } from '@/lib/db/sources-config'
import { getPrisma } from '@/lib/db'
import { fetchFromGoogleNews } from './googlenews'

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

  const rssMatches = xml.matchAll(/<item[^>]*>([\s\S]*?)<\/item>/g)
  const atomMatches = xml.matchAll(/<entry[^>]*>([\s\S]*?)<\/entry>/g)

  for (const match of [...rssMatches, ...atomMatches]) {
    const item = match[1]

    const title =
      item.match(/<title[^>]*><!\[CDATA\[([\s\S]*?)\]\]><\/title>/)?.[1] ??
      item.match(/<title[^>]*>([^<]+)<\/title>/)?.[1] ?? ''

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

// ── Resolve Google News redirect to real article URL ──────
async function resolveGoogleNewsUrl(url: string): Promise<string> {
  try {
    const res = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
      signal: AbortSignal.timeout(5000),
    })
    return res.url || url
  } catch {
    return url
  }
}

// ── Level 0: Python scraper service (best for geo-blocked gov sites) ──
async function fetchViaPythonScraper(url: string): Promise<string> {
  const serviceUrl = process.env.SCRAPER_SERVICE_URL
  const secret = process.env.SCRAPER_SECRET
  if (!serviceUrl || !secret) return ''
  try {
    const res = await fetch(`${serviceUrl}/scraper/scrape`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-scraper-secret': secret,
      },
      body: JSON.stringify({ url }),
      signal: AbortSignal.timeout(20000),
    })
    if (!res.ok) return ''
    const data = await res.json() as { success: boolean; content?: string }
    if (!data.success || !data.content) return ''
    console.log(`[PYTHON-SCRAPER] ${url}: ${data.content.length} chars`)
    return data.content
  } catch (e) {
    console.warn(`[PYTHON-SCRAPER] failed for ${url}:`, e)
    return ''
  }
}

// ── Enrich article content — 3-level fallback ─────────────
async function enrichContent(url: string): Promise<string> {
  // Level 0: Python scraper
  if (process.env.SCRAPER_SERVICE_URL) {
    const content = await fetchViaPythonScraper(url)
    if (content.length > 300) return content
  }

  // Level 1: browser-like headers
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
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
      if (text.length > 300) {
        console.log(`[enrich] L1 ${url} (${text.length}c)`)
        return text.slice(0, 5000)
      }
    }
  } catch {
    // fall through to Jina
  }

  // Level 2: Jina AI Reader
  try {
    const res = await fetch(`https://r.jina.ai/${url}`, {
      headers: { 'Accept': 'text/plain' },
      signal: AbortSignal.timeout(10000),
    })
    if (!res.ok) return ''
    const text = await res.text()
    return text.slice(0, 5000)
  } catch {
    return ''
  }
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

  // Auto-reject Google navigation pages without API call
  const GOOGLE_NAV_MARKERS = ['Google News', 'Google Новини', 'Головна сторінка']
  if (GOOGLE_NAV_MARKERS.some(marker => article.title.includes(marker))) {
    console.log(`[filter] Skipped Google nav page: "${article.title}"`)
    return {
      sourceId: source.id,
      url: article.url,
      originalTitle: article.title,
      originalContent: article.content,
      originalLanguage: source.language,
      tags: source.tags,
      relevanceScore: 0,
      isRelevant: false,
      country: source.country,
      publishedAt: article.publishedAt,
      status: 'rejected',
    }
  }

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

// ── Main crawl runner ──────────────────────────────────────
export async function runCrawler(sourceIds?: string[]): Promise<{
  processed: number
  relevant: number
  errors: string[]
}> {
  let processed = 0
  let relevant = 0
  const errors: string[] = []

  // ── Layer 1+2: Google News RSS → resolve real URLs → Jina ──
  {
    let gn_found = 0
    let gn_relevant = 0
    try {
      const rawArticles = await fetchFromGoogleNews()

      // Resolve all Google News redirects + enrich content in parallel
      const settledResults = await Promise.allSettled(
        rawArticles.map(async (article): Promise<RawArticle | null> => {
          const realUrl = await resolveGoogleNewsUrl(article.url)
          if (realUrl.includes('google.com')) return null
          const fullText = await enrichContent(realUrl)
          return {
            ...article,
            url: realUrl,
            content: fullText.length > 300 ? fullText : article.content,
          }
        })
      )

      const enriched: RawArticle[] = []
      for (const r of settledResults) {
        if (r.status === 'fulfilled' && r.value !== null) enriched.push(r.value)
      }
      gn_found = enriched.length
      console.log(`[GoogleNews] ${gn_found} articles enriched (resolved + Jina)`)

      // ── Layer 3: Claude filter + translate ──────────────────
      const gnSource: CrawlerSource = {
        id: 'googlenews',
        country: 'European Union',
        countryFlag: '🌍',
        name: 'Google News',
        url: 'https://news.google.com',
        language: 'en',
        targetLanguages: ['uk', 'ru'],
        tags: ['migration', 'Ukraine', 'Europe'],
        checkIntervalHours: 6,
        active: true,
      }

      for (const article of enriched) {
        const existing = await getPrisma().crawledArticle.findFirst({
          where: { OR: [{ url: article.url }, { originalTitle: article.title }] },
          select: { id: true },
        })
        if (existing) continue

        const result = await processWithClaude(article, gnSource)
        processed++

        if (result?.isRelevant) {
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
              publishedAt: result.publishedAt ? new Date(result.publishedAt) : new Date(),
            },
          })
        }

        await new Promise(r => setTimeout(r, 1000))
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

  // ── RSS sources: fetchRSS → Jina → Claude ─────────────────
  const allSources = await getSources()
  const rssSources = (sourceIds
    ? allSources.filter(s => sourceIds.includes(s.id) && s.active)
    : allSources.filter(s => s.active)
  ).filter(s => s.rssUrl)

  for (const source of rssSources) {
    let rs_found = 0
    let rs_relevant = 0
    try {
      let rawArticles = await fetchRSS(source.rssUrl!)
      const cutoff = new Date()
      cutoff.setHours(cutoff.getHours() - source.checkIntervalHours)
      const beforeFilter = rawArticles.length
      rawArticles = rawArticles.filter(a => !a.publishedAt || new Date(a.publishedAt) > cutoff)
      console.log(`[RSS] ${source.id}: ${rawArticles.length}/${beforeFilter} items after date filter`)
      rs_found = rawArticles.length

      for (const raw of rawArticles.slice(0, 10)) {
        const existing = await getPrisma().crawledArticle.findFirst({
          where: { OR: [{ url: raw.url }, { originalTitle: raw.title }] },
          select: { id: true },
        })
        if (existing) continue

        const fullText = await enrichContent(raw.url)
        const enriched: RawArticle = {
          ...raw,
          sourceId: source.id,
          language: source.language,
          content: fullText.length > 300 ? fullText : raw.content,
        }

        const result = await processWithClaude(enriched, source)
        processed++

        if (result?.isRelevant) {
          relevant++
          rs_relevant++
          console.log(`[RSS:${source.id}] Relevant: "${result.originalTitle}" → ${result.country} (score: ${result.relevanceScore})`)
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

        await new Promise(r => setTimeout(r, 1000))
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      errors.push(`${source.id}: ${message}`)
    }

    await getPrisma().crawlerLog.create({
      data: {
        sourceId: source.id,
        status: errors.some(e => e.startsWith(source.id)) ? 'error' : 'success',
        articlesFound: rs_found,
        articlesRelevant: rs_relevant,
      },
    })
  }

  return { processed, relevant, errors }
}
