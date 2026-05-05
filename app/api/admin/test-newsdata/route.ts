import { NextRequest, NextResponse } from 'next/server'

export const maxDuration = 30

export async function GET(req: NextRequest) {
  const session = req.cookies.get('admin_session')
  if (!session?.value) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const apiKey = process.env.NEWSDATA_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'NEWSDATA_API_KEY not set in env' }, { status: 500 })
  }

  const query = 'Ukrainian refugees Europe'
  const params = new URLSearchParams({
    apikey: apiKey,
    q: query,
    language: 'en',
    size: '5',
  })

  const url = `https://newsdata.io/api/1/news?${params}`

  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(15000),
    })

    const rawText = await res.text()
    let data: unknown
    try {
      data = JSON.parse(rawText)
    } catch {
      return NextResponse.json({
        error: 'Non-JSON response from NewsData',
        httpStatus: res.status,
        rawPreview: rawText.slice(0, 500),
      }, { status: 502 })
    }

    const d = data as {
      status?: string
      message?: string
      totalResults?: number
      results?: Array<{
        article_id: string
        title: string
        source_id: string
        source_name: string
        country: string[]
        language: string
        pubDate: string
        link: string
        description: string | null
        content: string | null
      }>
    }

    const sample = (d.results ?? []).slice(0, 3).map(a => ({
      title: a.title,
      source: a.source_name,
      country: a.country,
      language: a.language,
      pubDate: a.pubDate,
      hasContent: !!a.content,
      contentLength: a.content?.length ?? 0,
      descLength: a.description?.length ?? 0,
    }))

    return NextResponse.json({
      status: d.status,
      message: d.message ?? null,
      articlesFound: d.results?.length ?? 0,
      totalResults: d.totalResults ?? null,
      httpStatus: res.status,
      query,
      apiKeyPrefix: apiKey.slice(0, 8) + '...',
      sample,
    })
  } catch (err) {
    return NextResponse.json({
      error: String(err),
      apiKeyPrefix: apiKey.slice(0, 8) + '...',
    }, { status: 500 })
  }
}
