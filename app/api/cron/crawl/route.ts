import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { runCrawler } = await import('@/lib/crawler/crawl')
  await runCrawler()

  return NextResponse.json({ success: true, time: new Date().toISOString() })
}
