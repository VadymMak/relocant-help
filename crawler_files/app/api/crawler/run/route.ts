import { NextRequest, NextResponse } from 'next/server';
import { runCrawler } from '@/lib/crawler/crawl';
import { sendTelegramMessage } from '@/lib/telegram';

// Protect with secret key
const CRON_SECRET = process.env.CRON_SECRET!;

export async function POST(req: NextRequest) {
  // Auth check
  const auth = req.headers.get('authorization');
  if (auth !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const sourceIds = body.sourceIds as string[] | undefined;

  try {
    const result = await runCrawler(sourceIds);

    // Notify admin via Telegram
    if (result.relevant > 0) {
      await sendTelegramMessage(
        process.env.TELEGRAM_ADMIN_CHAT_ID!,
        `🕷️ Crawler завершён\n\n` +
        `📰 Оброблено: ${result.processed}\n` +
        `✅ Релевантних: ${result.relevant}\n` +
        `❌ Помилок: ${result.errors.length}\n\n` +
        `Перевірити: https://relocant.help/admin/articles`
      );
    }

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Allow cron jobs (Vercel Cron) via GET
export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (auth !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const result = await runCrawler();
  return NextResponse.json(result);
}