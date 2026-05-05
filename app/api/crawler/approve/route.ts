import { NextRequest, NextResponse } from 'next/server'
import { getPrisma } from '@/lib/db'
import { storeInKnowledgeBase } from '@/lib/vector/verify'
import type { ExtractedFact } from '@/lib/vector/facts'

export async function POST(req: NextRequest) {
  const { articleId, action } = await req.json() as {
    articleId: string
    action: 'approve' | 'reject'
  }

  if (!articleId || !action) {
    return NextResponse.json({ error: 'Missing articleId or action' }, { status: 400 })
  }

  if (action === 'approve') {
    const article = await getPrisma().crawledArticle.findUnique({
      where: { id: articleId },
      select: { extractedFacts: true, country: true },
    })

    await getPrisma().crawledArticle.update({
      where: { id: articleId },
      data: { status: 'approved' },
    })

    // Store extracted facts in KnowledgeNode for future contradiction checks
    if (article?.extractedFacts) {
      const facts = article.extractedFacts as unknown as ExtractedFact[]
      if (Array.isArray(facts) && facts.length > 0) {
        try {
          await storeInKnowledgeBase(articleId, facts, article.country, 'media')
        } catch (e) {
          console.error('[approve] storeInKnowledgeBase failed (pgvector may not be enabled):', e)
        }
      }
    }

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
