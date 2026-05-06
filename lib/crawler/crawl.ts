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

// ── Step 2b: Enrich RSS item with full page content ────────
async function enrichWithFullPage(article: RawArticle): Promise<RawArticle> {
  if (article.content.length >= 100) return article

  try {
    const res = await fetch(article.url, {
      headers: { 'User-Agent': 'relocant.help/1.0' },
      next: { revalidate: 0 },
      signal: AbortSignal.timeout(10000),
    })
    if (!res.ok) return article
    const html = await res.text()
    const fullText = extractText(html)
    if (fullText.length > article.content.length) {
      return { ...article, content: fullText }
    }
  } catch {
    // Fall back to RSS description if page fetch fails
  }
  return article
}

// ── Layer 3: Extract article links from a news list page ───
export async function extractArticleLinks(
  source: CrawlerSource,
  seenUrls: Set<string>
): Promise<RawArticle[]> {
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

  const prompt = `You are an assistant helping Ukrainian and Russian-speaking relocants in Europe.

Analyze this article from a government or international organization website and respond with ONLY valid JSON (no markdown, no explanation).

SOURCE: ${source.name} (${countryHint})
ARTICLE TITLE: ${article.title}
ARTICLE CONTENT: ${article.content.slice(0, 4000)}

Respond with this exact JSON structure:
{
  "isRelevant": boolean,
  "relevanceScore": number 0-100,
  "relevanceReason": "one sentence why relevant or not",
  "detectedCountry": "the European country this article is primarily about — one of: Slovakia, Poland, Germany, Czech Republic, Spain, Italy, Romania, Bulgaria, Portugal, Austria, Netherlands, France, United Kingdom, Turkey, Ukraine, European Union",
  "tags": ["tag1", "tag2"],
  "translations": {
    "uk": {
      "title": "title in Ukrainian",
      "summary": "2-3 sentence summary in Ukrainian explaining what changed and what relocants need to do",
      "fullText": "full helpful explanation in Ukrainian (200-400 words)"
    },
    "ru": {
      "title": "title in Russian",
      "summary": "2-3 sentence summary in Russian",
      "fullText": "full explanation in Russian (200-400 words)"
    }
  }
}

For detectedCountry: if the article mentions a specific EU country → use that country name. If it covers EU-wide policy with no single country focus → use "European Union".

RELEVANCE SCORING — our audience is Ukrainian/Russian-speaking migrants and refugees living in Europe. Be generous.

Score 80-100 (HIGHLY RELEVANT — definitely save):
- Directly mentions Ukraine, Ukrainians, Russian speakers, or displaced persons
- Covers temporary protection, Section 17/Section 15 directives, TP status changes
- Covers residence permits, visas, registration procedures

Score 50-79 (RELEVANT — save for review):
- ANY aspect of daily life for migrants/refugees in Europe:
  work permits, employment rights, taxes, social insurance, health insurance
  housing assistance, social benefits, integration programs
  language courses, recognition of foreign qualifications, banking
  school enrollment, childcare, family reunification
- ANY change in law or procedure that could affect foreigners living in EU countries
- Asylum rules, refugee status, migration policy updates
- EU-wide regulations affecting non-EU residents

Score 20-49 (POSSIBLY RELEVANT — save but auto-reject for manual check):
- General migration/asylum statistics or reports
- EU policy debates that may lead to future changes
- Economic news (minimum wage, inflation) indirectly affecting migrants

Score 0-19 (NOT RELEVANT — skip):
- Purely domestic political news with no migration dimension
- Sports, entertainment, culture unrelated to integration
- Crime, disasters unrelated to migrant issues
- Administrative/organizational news irrelevant to daily life

IMPORTANT: This article is ONLY relevant if it specifically mentions:
- Ukrainian people / refugees / migrants
- OR temporary protection status (TP / TPS)
- OR residence permits for foreigners in Europe
- OR social / legal rights for Ukrainian relocants

Articles about OTHER refugee groups (Syrian, Afghan, African, Georgian) are NOT relevant — score 0-15.
Articles about general European politics with no migration dimension are NOT relevant — score 0-15.
Articles about conflicts, disasters, or crime unrelated to Ukrainian relocation are NOT relevant — score 0-15.

Keywords indicating relevance: ${keywordsStr}`

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''

    // Strip markdown code fences if Claude wraps response in them
    const jsonText = text.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim()

    const parsed = JSON.parse(jsonText) as {
      isRelevant: boolean
      relevanceScore: number
      detectedCountry?: string
      tags: string[]
      translations: {
        uk?: { title?: string; summary?: string; fullText?: string }
        ru?: { title?: string; summary?: string; fullText?: string }
      }
    }

    const score = parsed.relevanceScore ?? 0
    const country = parsed.detectedCountry || urlCountry || source.country

    return {
      sourceId: source.id,
      url: article.url,
      originalTitle: article.title,
      originalContent: article.content,
      originalLanguage: source.language,
      titleUk: parsed.translations?.uk?.title,
      titleRu: parsed.translations?.ru?.title,
      summaryUk: parsed.translations?.uk?.summary,
      summaryRu: parsed.translations?.ru?.summary,
      fullTextUk: parsed.translations?.uk?.fullText,
      fullTextRu: parsed.translations?.ru?.fullText,
      tags: [...(parsed.tags ?? []), ...source.tags],
      relevanceScore: score,
      isRelevant: score >= 20,
      country,
      publishedAt: article.publishedAt,
      // 25+ goes to pending_review for human check, 20-24 auto-rejected but saved
      status: score >= 25 ? 'pending_review' : 'rejected',
    }
  } catch (e) {
    console.error('Claude processing failed:', e)
    return null
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

        const enriched = await enrichWithFullPage(raw)
        if (!enriched.content || enriched.content.length < 100) continue

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

        const enriched = await enrichWithFullPage(raw)

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
        sourceId: 'newsdata-layer1',
        status: 'success',
        articlesFound: nd_found,
        articlesRelevant: nd_relevant,
      },
    })
  }

  // ── Layer 2 + 3: RSS feeds and scraping ───────────────────
  // Skip newsapi-type sources — handled by Layer 1 above
  const scrapeableSources = sources.filter(s => s.type !== 'newsapi')

  for (const source of scrapeableSources) {
    try {
      let rawArticles: RawArticle[] = []

      // ── Layer 2: RSS / Atom feeds ──────────────────────────
      if (source.rssUrl) {
        rawArticles = await fetchRSS(source.rssUrl)

      // ── Layer 3: Scrape + link extraction ─────────────────
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
        const enriched = source.rssUrl ? await enrichWithFullPage(raw) : raw

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
