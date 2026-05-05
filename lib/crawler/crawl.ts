import Anthropic from '@anthropic-ai/sdk'
import { RELEVANCE_KEYWORDS, CrawlerSource } from './sources'
import { getSources } from '@/lib/db/sources-config'
import { getPrisma } from '@/lib/db'

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

// ── Step 3: Claude AI filters and translates ───────────────
export async function processWithClaude(
  article: RawArticle,
  source: CrawlerSource
): Promise<ProcessedArticle | null> {
  const keywordsStr = RELEVANCE_KEYWORDS.join(', ')

  const prompt = `You are an assistant helping Ukrainian and Russian-speaking relocants in Europe.

Analyze this article from a government or international organization website and respond with ONLY valid JSON (no markdown, no explanation).

SOURCE: ${source.name} (${source.country})
ARTICLE TITLE: ${article.title}
ARTICLE CONTENT: ${article.content.slice(0, 4000)}

Respond with this exact JSON structure:
{
  "isRelevant": boolean,
  "relevanceScore": number 0-100,
  "relevanceReason": "one sentence why relevant or not",
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

RELEVANCE SCORING — be generous, the audience is Ukrainian/Russian relocants in Europe:

Score 60-100 (RELEVANT — save for review):
- Directly mentions Ukraine, Ukrainians, Russian speakers, or displaced persons
- Covers residence permits, temporary protection, visas, registration
- Covers work permits, employment rights, taxes, social insurance
- Covers housing, social benefits, healthcare access for migrants
- Covers asylum, refugee status, migration policy changes
- Any change in law or procedure that affects foreigners in EU countries
- Integration programs, language courses, recognition of qualifications

Score 30-59 (POSSIBLY RELEVANT — save but auto-reject):
- General migration/asylum news that may affect relocants indirectly
- EU policy changes that could affect foreigners
- Economic news relevant to immigrants (minimum wage, benefits changes)

Score 0-29 (NOT RELEVANT — skip):
- Purely local/domestic news with no foreign dimension
- Sports, culture, entertainment unrelated to integration
- Political commentary not affecting foreigners' legal status
- Administrative news irrelevant to daily life of relocants

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
      tags: string[]
      translations: {
        uk?: { title?: string; summary?: string; fullText?: string }
        ru?: { title?: string; summary?: string; fullText?: string }
      }
    }

    const score = parsed.relevanceScore ?? 0

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
      isRelevant: score >= 30,
      country: source.country,
      publishedAt: article.publishedAt,
      // 60+ goes to pending_review for human check, 30-59 auto-rejected but saved
      status: score >= 60 ? 'pending_review' : 'rejected',
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

  for (const source of sources) {
    try {
      let rawArticles: RawArticle[] = []
      if (source.rssUrl) {
        rawArticles = await fetchRSS(source.rssUrl)
      } else {
        rawArticles = await fetchPage(source.url)
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
