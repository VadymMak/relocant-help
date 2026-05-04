import Anthropic from '@anthropic-ai/sdk';
import { CRAWLER_SOURCES, RELEVANCE_KEYWORDS, CrawlerSource } from './sources';
import { db } from '@/lib/db';
import { crawledArticles, crawlerLog } from '@/lib/db/schema';
import { eq, and, gte } from 'drizzle-orm';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

// ── Types ─────────────────────────────────────────────────
export interface RawArticle {
  sourceId: string;
  url: string;
  title: string;
  content: string;
  publishedAt?: string;
  language: string;
}

export interface ProcessedArticle {
  sourceId: string;
  url: string;
  originalTitle: string;
  originalContent: string;
  originalLanguage: string;
  titleUk?: string;
  titleRu?: string;
  titleEn?: string;
  summaryUk?: string;
  summaryRu?: string;
  summaryEn?: string;
  fullTextUk?: string;
  fullTextRu?: string;
  tags: string[];
  relevanceScore: number;  // 0-100
  isRelevant: boolean;
  country: string;
  publishedAt?: string;
  status: 'pending_review' | 'approved' | 'rejected';
}

// ── Step 1: Fetch RSS feed ─────────────────────────────────
export async function fetchRSS(url: string): Promise<RawArticle[]> {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'relocant.help/1.0 (news aggregator for Ukrainian relocants)' },
    next: { revalidate: 0 },
  });
  if (!res.ok) throw new Error(`RSS fetch failed: ${res.status} ${url}`);

  const xml = await res.text();
  const items: RawArticle[] = [];

  // Simple XML parser for RSS items
  const itemMatches = xml.matchAll(/<item[^>]*>([sS]*?)</item>/g);
  for (const match of itemMatches) {
    const item = match[1];
    const title = item.match(/<title[^>]*><!\[CDATA\[([\s\S]*?)\]\]><\/title>|<title[^>]*>([\s\S]*?)<\/title>/)?.[1] || '';
    const link  = item.match(/<link[^>]*>([\s\S]*?)<\/link>/)?.[1]?.trim() || '';
    const desc  = item.match(/<description[^>]*><!\[CDATA\[([\s\S]*?)\]\]><\/description>|<description[^>]*>([\s\S]*?)<\/description>/)?.[1] || '';
    const pubDate = item.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/)?.[1] || '';

    if (title && link) {
      items.push({
        sourceId: '',
        url: link,
        title: title.replace(/<[^>]+>/g, '').trim(),
        content: desc.replace(/<[^>]+>/g, '').trim(),
        publishedAt: pubDate,
        language: 'unknown',
      });
    }
  }
  return items;
}

// ── Step 2: Fetch HTML page and extract articles ───────────
export async function fetchPage(url: string, selector?: string): Promise<RawArticle[]> {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'relocant.help/1.0' },
    next: { revalidate: 0 },
  });
  if (!res.ok) throw new Error(`Page fetch failed: ${res.status} ${url}`);
  const html = await res.text();

  // Extract text content (simplified - in production use cheerio)
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 8000); // Limit for Claude

  return [{
    sourceId: '',
    url,
    title: html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] || url,
    content: text,
    language: 'unknown',
  }];
}

// ── Step 3: Claude AI filters and translates ───────────────
export async function processWithClaude(
  article: RawArticle,
  source: CrawlerSource
): Promise<ProcessedArticle | null> {
  const keywordsStr = RELEVANCE_KEYWORDS.join(', ');

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
      "fullText": "full helpful explanation in Ukrainian (200-400 words) written for a Ukrainian relocant who may not speak Slovak/Polish/German. Include practical steps if applicable."
    },
    "ru": {
      "title": "title in Russian",
      "summary": "2-3 sentence summary in Russian",
      "fullText": "full explanation in Russian (200-400 words)"
    }
  }
}

An article IS relevant if it mentions: ${keywordsStr}
An article is NOT relevant if it's about: local Slovak politics, sports, culture unrelated to foreigners, general news.

Relevance score: 80+ = publish immediately, 50-79 = review needed, below 50 = skip.`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    const parsed = JSON.parse(text);

    return {
      sourceId: source.id,
      url: article.url,
      originalTitle: article.title,
      originalContent: article.content,
      originalLanguage: source.language,
      titleUk: parsed.translations?.uk?.title,
      titleRu: parsed.translations?.ru?.title,
      titleEn: article.language === 'en' ? article.title : undefined,
      summaryUk: parsed.translations?.uk?.summary,
      summaryRu: parsed.translations?.ru?.summary,
      fullTextUk: parsed.translations?.uk?.fullText,
      fullTextRu: parsed.translations?.ru?.fullText,
      tags: [...(parsed.tags || []), ...source.tags],
      relevanceScore: parsed.relevanceScore || 0,
      isRelevant: parsed.isRelevant && parsed.relevanceScore >= 50,
      country: source.country,
      publishedAt: article.publishedAt,
      status: parsed.relevanceScore >= 80 ? 'pending_review' : 'rejected',
    };
  } catch (e) {
    console.error('Claude processing failed:', e);
    return null;
  }
}

// ── Step 4: Main crawl runner ──────────────────────────────
export async function runCrawler(sourceIds?: string[]): Promise<{
  processed: number;
  relevant: number;
  errors: string[];
}> {
  const sources = sourceIds
    ? CRAWLER_SOURCES.filter(s => sourceIds.includes(s.id) && s.active)
    : CRAWLER_SOURCES.filter(s => s.active);

  let processed = 0;
  let relevant = 0;
  const errors: string[] = [];

  for (const source of sources) {
    try {
      // Fetch articles
      let rawArticles: RawArticle[] = [];
      if (source.rssUrl) {
        rawArticles = await fetchRSS(source.rssUrl);
      } else {
        rawArticles = await fetchPage(source.url, source.crawlSelector);
      }

      // Tag with source
      rawArticles = rawArticles.map(a => ({ ...a, sourceId: source.id, language: source.language }));

      // Process each article with Claude
      for (const raw of rawArticles.slice(0, 10)) { // Max 10 per source per run
        // Check if already processed
        const existing = await db.query.crawledArticles.findFirst({
          where: eq(crawledArticles.url, raw.url),
        });
        if (existing) continue;

        const processed_article = await processWithClaude(raw, source);
        processed++;

        if (processed_article && processed_article.isRelevant) {
          relevant++;
          await db.insert(crawledArticles).values({
            sourceId: processed_article.sourceId,
            url: processed_article.url,
            originalTitle: processed_article.originalTitle,
            originalContent: processed_article.originalContent.slice(0, 10000),
            originalLanguage: processed_article.originalLanguage,
            titleUk: processed_article.titleUk,
            titleRu: processed_article.titleRu,
            summaryUk: processed_article.summaryUk,
            summaryRu: processed_article.summaryRu,
            fullTextUk: processed_article.fullTextUk,
            fullTextRu: processed_article.fullTextRu,
            tags: processed_article.tags,
            relevanceScore: processed_article.relevanceScore,
            country: processed_article.country,
            status: processed_article.status,
            publishedAt: processed_article.publishedAt
              ? new Date(processed_article.publishedAt)
              : new Date(),
            createdAt: new Date(),
          });
        }

        // Rate limiting — be polite to government servers
        await new Promise(r => setTimeout(r, 2000));
      }

      // Log successful crawl
      await db.insert(crawlerLog).values({
        sourceId: source.id,
        status: 'success',
        articlesFound: rawArticles.length,
        articlesRelevant: relevant,
        runAt: new Date(),
      });

    } catch (err: any) {
      errors.push(`${source.id}: ${err.message}`);
      await db.insert(crawlerLog).values({
        sourceId: source.id,
        status: 'error',
        error: err.message,
        articlesFound: 0,
        articlesRelevant: 0,
        runAt: new Date(),
      });
    }
  }

  return { processed, relevant, errors };
}