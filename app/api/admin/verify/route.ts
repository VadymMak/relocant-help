import { NextRequest, NextResponse } from 'next/server'
import { getPrisma } from '@/lib/db'
import { verifyArticle } from '@/lib/vector/verify'

export const maxDuration = 60

export async function POST(req: NextRequest) {
  const session = req.cookies.get('admin_session')
  if (!session?.value) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { articleId } = await req.json() as { articleId: string }
  if (!articleId) {
    return NextResponse.json({ error: 'Missing articleId' }, { status: 400 })
  }

  const article = await getPrisma().crawledArticle.findUnique({
    where: { id: articleId },
    select: {
      id: true, titleUk: true, summaryUk: true,
      fullTextUk: true, originalContent: true, country: true,
    },
  })

  if (!article) {
    return NextResponse.json({ error: 'Article not found' }, { status: 404 })
  }

  const verification = await verifyArticle(article)

  const verificationStatus =
    verification.recommendation === 'publish' ? 'verified'
    : verification.recommendation === 'reject' ? 'rejected_duplicate'
    : 'review_needed'

  await getPrisma().crawledArticle.update({
    where: { id: articleId },
    data: {
      verificationStatus,
      vectorCheckResult: verification as object,
      extractedFacts: verification.extractedFacts as object[],
    },
  })

  return NextResponse.json({ verification, verificationStatus })
}
