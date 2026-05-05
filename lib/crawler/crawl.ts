import Anthropic from '@anthropic-ai/sdk'
import { CRAWLER_SOURCES, RELEVANCE_KEYWORDS, CrawlerSource } from './sources'
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

  const itemMatches = xml.matchAll(/<item[^>]*>([\s\S]*?)<\/item>/g)
  for (const match of itemMatches) {
    const item = match[1]
    const title =
      item.match(/<title[^>]*><!\[CDATA\[([\s\S]*?)\]\]><\/title>|<title[^>]*>([\s\S]*?)<\/title>/)?.[1] ?? ''
    const link =
      item.match(/<link[^>]*>([\s\S]*?)<\/link>/)?.[1]?.trim() ?? ''
    const desc =
      item.match(/<description[^>]*><!\[CDATA\[([\s\S]*?)\]\]><\/description>|<description[^>]*>([\s\S]*?)<\/description>/)?.[1] ?? ''
    const pubDate =
      item.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/)?.[1] ?? ''

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

  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 8000)

  return [{
    sourceId: '',
    url,
    title: html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] ?? url,
    content: text,
    language: 'unknown',
  }]
}

// ── Step 3: Claude AI filters and translates ───────────────
export async function processWithClaude(
  article: RawArticle,
  source: CrawlerSource
): Promise<ProcessedArticle | null> {
  const keywordsStr = RELEVANCE_KEYWORDS.join(', ')

  const prompt = `You are an assistant helping Ukrainian and Russian-speaking relocants in Europe.

Analyze this article from a government website and respond with ONLY valid JSON (no markdown, no explanation).

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

An article IS relevant if it mentions: ${keywordsStr}
An article is NOT relevant if it's about: local politics, sports, culture unrelated to foreigners, general news.

Relevance score: 80+ = publish immediately, 50-79 = review needed, below 50 = skip.`

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    const parsed = JSON.parse(text) as {
      isRelevant: boolean
      relevanceScore: number
      tags: string[]
      translations: {
        uk?: { title?: string; summary?: string; fullText?: string }
        ru?: { title?: string; summary?: string; fullText?: string }
      }
    }

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
      relevanceScore: parsed.relevanceScore ?? 0,
      isRelevant: parsed.isRelevant && parsed.relevanceScore >= 50,
      country: source.country,
      publishedAt: article.publishedAt,
      status: parsed.relevanceScore >= 80 ? 'pending_review' : 'rejected',
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
  const sources = sourceIds
    ? CRAWLER_SOURCES.filter(s => sourceIds.includes(s.id) && s.active)
    : CRAWLER_SOURCES.filter(s => s.active)

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
        const existing = await getPrisma().crawledArticle.findUnique({
          where: { url: raw.url },
        })
        if (existing) continue

        const article = await processWithClaude(raw, source)
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
