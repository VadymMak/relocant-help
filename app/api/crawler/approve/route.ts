import { NextRequest, NextResponse } from 'next/server'
import { getPrisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  const { articleId, action } = await req.json() as {
    articleId: string
    action: 'approve' | 'reject'
  }

  if (!articleId || !action) {
    return NextResponse.json({ error: 'Missing articleId or action' }, { status: 400 })
  }

  if (action === 'approve') {
    await getPrisma().crawledArticle.update({
      where: { id: articleId },
      data: { status: 'approved' },
    })
    return NextResponse.json({ success: true, message: 'Article published' })
  }

  if (action === 'reject') {
    await getPrisma().crawledArticle.update({
      where: { id: articleId },
      data: { status: 'rejected' },
    })
    return NextResponse.json({ success: true, message: 'Article rejected' })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
