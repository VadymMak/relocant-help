import { NextRequest, NextResponse } from 'next/server'
import { processWithClaude, type RawArticle } from '@/lib/crawler/crawl'
import type { CrawlerSource } from '@/lib/crawler/sources'
import { getPrisma } from '@/lib/db'

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
    .slice(0, 12000)
}

function detectLanguage(tld: string): string {
  const map: Record<string, string> = {
    sk: 'sk', pl: 'pl', de: 'de', cz: 'cs', at: 'de',
    ua: 'uk', ro: 'ro', bg: 'bg', hu: 'hu', nl: 'nl',
    fr: 'fr', it: 'it', es: 'es', pt: 'pt',
  }
  return map[tld] ?? 'en'
}

function detectCountry(tld: string): string {
  const map: Record<string, string> = {
    sk: 'Slovakia', pl: 'Poland', de: 'Germany', cz: 'Czech Republic',
    at: 'Austria', ua: 'Ukraine', ro: 'Romania', bg: 'Bulgaria',
    es: 'Spain', it: 'Italy', pt: 'Portugal', fr: 'France',
    gb: 'United Kingdom', nl: 'Netherlands', hu: 'Hungary', eu: 'European Union',
  }
  return map[tld] ?? 'European Union'
}

export async function POST(req: NextRequest) {
  const session = req.cookies.get('admin_session')
  if (!session?.value) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => ({})) as { url?: string }
  const url = body.url?.trim()

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 })
  }

  let parsedUrl: URL
  try {
    parsedUrl = new URL(url)
  } catch {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
  }

  const existing = await getPrisma().crawledArticle.findFirst({
    where: { url },
    select: { id: true, status: true },
  })
  if (existing) {
    return NextResponse.json(
      { error: 'Article with this URL already exists in the database' },
      { status: 409 }
    )
  }

  // Level 0: Python scraper (best for geo-blocked sites)
  let pythonContent = ''
  const scraperUrl = process.env.SCRAPER_SERVICE_URL
  const scraperSecret = process.env.SCRAPER_SECRET

  if (scraperUrl && scraperSecret) {
    try {
      const scraperRes = await fetch(`${scraperUrl}/scraper/scrape`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-scraper-secret': scraperSecret },
        body: JSON.stringify({ url }),
        signal: AbortSignal.timeout(20000),
      })
      if (scraperRes.ok) {
        const scraperData = await scraperRes.json() as { success: boolean; content?: string }
        if (scraperData.success && (scraperData.content?.length ?? 0) > 300) {
          pythonContent = scraperData.content!
          console.log(`[IMPORT] Python scraper: ${pythonContent.length} chars`)
        }
      }
    } catch (e) {
      console.warn('[IMPORT] Python scraper failed:', e)
    }
  }

  let title: string
  let content: string

  if (pythonContent.length > 300) {
    content = pythonContent.slice(0, 12000)
    title = pythonContent.match(/^(?:Title:\s*)(.+)$/m)?.[1]?.trim() ?? parsedUrl.hostname
    console.log(`[import-url] using Python scraper content: ${content.length} chars`)
  } else {
    // Level 1: direct fetch
    let html: string
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'relocant.help/1.0 (news aggregator for Ukrainian relocants)' },
        signal: AbortSignal.timeout(20000),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      html = await res.text()
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      return NextResponse.json({ error: `Failed to fetch page: ${message}` }, { status: 422 })
    }

    title = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim() ?? parsedUrl.hostname

    // Level 2: Jina AI Reader for cleaner content
    let jinaContent = ''
    try {
      const jinaRes = await fetch(`https://r.jina.ai/${url}`, {
        headers: { 'Accept': 'text/plain', 'X-Return-Format': 'text' },
        signal: AbortSignal.timeout(15000),
      })
      if (!jinaRes.ok) throw new Error(`Jina: ${jinaRes.status}`)
      const text = await jinaRes.text()
      if (text.length > 200) jinaContent = text.slice(0, 12000)
      else throw new Error('Too short')
    } catch (err) {
      console.warn('[import-url] Jina failed, trying article-extractor:', err)
      try {
        const { extract } = await import('@extractus/article-extractor')
        const article = await extract(url)
        jinaContent = (article?.content || article?.description || '')
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
          .slice(0, 12000)
      } catch (err2) {
        console.warn('[import-url] article-extractor also failed:', err2)
      }
    }

    // Level 3: raw HTML fallback
    const rawContent = extractText(html)
    content = jinaContent.length > rawContent.length ? jinaContent : rawContent
    console.log(`[import-url] contentLength=${content.length} (jina=${jinaContent.length}, raw=${rawContent.length})`)
  }

  if (content.length < 50) {
    return NextResponse.json(
      { error: 'Page content too short or could not be extracted' },
      { status: 422 }
    )
  }

  const tld = parsedUrl.hostname.split('.').pop() ?? ''
  const language = detectLanguage(tld)
  const country = detectCountry(tld)
  const hostname = parsedUrl.hostname.replace(/^www\./, '')

  const raw: RawArticle = {
    sourceId: `manual-import-${hostname}`,
    url,
    title,
    content,
    publishedAt: new Date().toISOString(),
    language,
  }

  const syntheticSource: CrawlerSource = {
    id: `manual-import-${hostname}`,
    country,
    countryFlag: '🌐',
    name: hostname,
    url,
    language,
    targetLanguages: ['uk', 'ru'],
    tags: ['manual-import'],
    checkIntervalHours: 0,
    active: true,
  }

  const result = await processWithClaude(raw, syntheticSource)

  if (!result) {
    return NextResponse.json({ error: 'Claude processing failed' }, { status: 500 })
  }

  if (result.relevanceScore < 30) {
    return NextResponse.json({
      success: false,
      notRelevant: true,
      relevanceScore: result.relevanceScore,
      titleUk: result.titleUk ?? title,
    })
  }

  const saved = await getPrisma().crawledArticle.create({
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
      status: 'pending_review',
      publishedAt: new Date(),
    },
    select: { id: true },
  })

  return NextResponse.json({
    success: true,
    id: saved.id,
    relevanceScore: result.relevanceScore,
    titleUk: result.titleUk,
    summaryUk: result.summaryUk,
    country: result.country,
    tags: result.tags,
  })
}
