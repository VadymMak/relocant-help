import { NextRequest, NextResponse } from 'next/server'
import { getPrisma } from '@/lib/db'

function slugify(url: string): string {
  try {
    const { hostname, pathname } = new URL(url)
    const base = hostname.replace(/^www\./, '').replace(/\./g, '-')
    const path = pathname.replace(/\//g, '-').replace(/[^a-z0-9-]/gi, '').slice(0, 20).replace(/-+$/, '')
    return `custom-${base}${path ? `-${path}` : ''}`
  } catch {
    return `custom-${Date.now()}`
  }
}

function detectRssUrl(html: string, baseUrl: string): string | null {
  const match = html.match(
    /<link[^>]+type=["']application\/(?:rss|atom)\+xml["'][^>]+href=["']([^"']+)["']/i
  ) ?? html.match(
    /<link[^>]+href=["']([^"']+)["'][^>]+type=["']application\/(?:rss|atom)\+xml["']/i
  )
  if (!match) return null
  const href = match[1]
  if (href.startsWith('http')) return href
  try {
    return new URL(href, baseUrl).toString()
  } catch {
    return null
  }
}

function extractTitle(html: string): string {
  return html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim().slice(0, 120) ?? ''
}

export async function POST(req: NextRequest) {
  const session = req.cookies.get('admin_session')
  if (!session?.value) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => ({})) as {
    url?: string
    country?: string
    name?: string
    sourceType?: string
    checkIntervalHours?: number
  }

  const url = body.url?.trim()
  if (!url) return NextResponse.json({ error: 'URL is required' }, { status: 400 })

  try { new URL(url) } catch {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
  }

  const sourceId = slugify(url)

  const existing = await getPrisma().sourceConfig.findUnique({ where: { sourceId } })
  if (existing) {
    return NextResponse.json({ error: 'Source with this URL already exists' }, { status: 409 })
  }

  // Test connectivity + fetch HTML for name/RSS detection
  let html = ''
  let statusCode = 0
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'relocant.help/1.0 (crawler source check)' },
      signal: AbortSignal.timeout(12000),
    })
    statusCode = res.status
    if (!res.ok) {
      return NextResponse.json({ error: `URL returned HTTP ${res.status}` }, { status: 422 })
    }
    html = await res.text()
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: `Cannot reach URL: ${message}` }, { status: 422 })
  }

  const detectedName = body.name?.trim() || extractTitle(html) || new URL(url).hostname
  const rssUrl = body.sourceType === 'rss' ? url : detectRssUrl(html, url)
  const hasRss = !!rssUrl
  const resolvedType = hasRss ? 'rss' : (body.sourceType ?? 'scrape')

  await getPrisma().sourceConfig.create({
    data: {
      sourceId,
      url,
      rssUrl: rssUrl ?? null,
      active: true,
      name: detectedName,
      country: body.country ?? 'European Union',
      language: 'en',
      checkIntervalHours: body.checkIntervalHours ?? 24,
      sourceType: resolvedType,
      isCustom: true,
      fixedAt: new Date(),
    },
  })

  return NextResponse.json({
    success: true,
    sourceId,
    detectedName,
    hasRss,
    rssUrl: rssUrl ?? null,
    statusCode,
  })
}
