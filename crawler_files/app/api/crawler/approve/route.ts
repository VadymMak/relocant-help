import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { crawledArticles } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { sendTelegramMessage } from '@/lib/telegram';

export async function POST(req: NextRequest) {
  const { articleId, action } = await req.json();
  // action: 'approve' | 'reject' | 'edit'

  if (action === 'approve') {
    await db.update(crawledArticles)
      .set({ status: 'approved', approvedAt: new Date() })
      .where(eq(crawledArticles.id, articleId));

    // Article is now live on the site
    return NextResponse.json({ success: true, message: 'Article published' });
  }

  if (action === 'reject') {
    await db.update(crawledArticles)
      .set({ status: 'rejected' })
      .where(eq(crawledArticles.id, articleId));
    return NextResponse.json({ success: true, message: 'Article rejected' });
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}