import { NextRequest, NextResponse } from 'next/server'
import { runCrawler } from '@/lib/crawler/crawl'
import { sendTelegramMessage } from '@/lib/telegram'

const CRON_SECRET = process.env.CRON_SECRET!

export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => ({})) as { sourceIds?: string[] }
  const sourceIds = body.sourceIds

  try {
    const result = await runCrawler(sourceIds)

    if (result.relevant > 0) {
      await sendTelegramMessage(
        process.env.TELEGRAM_ADMIN_CHAT_ID!,
        `🕷️ Crawler завершён\n\n` +
        `📰 Оброблено: ${result.processed}\n` +
        `✅ Релевантних: ${result.relevant}\n` +
        `❌ Помилок: ${result.errors.length}\n\n` +
        `Перевірити: https://relocant.help/admin/articles`
      )
    }

    return NextResponse.json(result)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await runCrawler()
    return NextResponse.json(result)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
