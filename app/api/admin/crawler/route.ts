import { NextRequest, NextResponse } from 'next/server'
import { runCrawler } from '@/lib/crawler/crawl'

export async function POST(req: NextRequest) {
  const session = req.cookies.get('admin_session')
  if (!session?.value) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => ({})) as { sourceIds?: string[] }

  try {
    const result = await runCrawler(body.sourceIds)
    return NextResponse.json(result)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
