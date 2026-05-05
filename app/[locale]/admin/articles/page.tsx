import { getPrisma } from '@/lib/db'
import ArticlesAdminClient, { type AdminArticle } from './ArticlesAdminClient'
import type { VectorCheckResult } from './ArticlesAdminClient'

export const dynamic = 'force-dynamic'

export default async function AdminArticlesPage() {
  const selectFields = {
    id: true, titleUk: true, country: true, relevanceScore: true,
    sourceId: true, createdAt: true, url: true, tags: true,
    verificationStatus: true, vectorCheckResult: true, extractedFacts: true,
  } as const

  const [pendingRaw, approvedRaw, rejectedRaw] = await Promise.all([
    getPrisma().crawledArticle.findMany({
      where: { status: 'pending_review' },
      orderBy: { createdAt: 'desc' },
      select: selectFields,
    }),
    getPrisma().crawledArticle.findMany({
      where: { status: 'approved' },
      orderBy: { createdAt: 'desc' },
      select: selectFields,
    }),
    getPrisma().crawledArticle.findMany({
      where: { status: 'rejected' },
      orderBy: { createdAt: 'desc' },
      select: selectFields,
    }),
  ])

  type RawRow = typeof pendingRaw[number]

  function serialize(rows: RawRow[]): AdminArticle[] {
    return rows.map(a => ({
      id: a.id,
      titleUk: a.titleUk,
      country: a.country,
      relevanceScore: a.relevanceScore,
      sourceId: a.sourceId,
      createdAt: a.createdAt?.toISOString() ?? null,
      url: a.url,
      tags: a.tags,
      verificationStatus: a.verificationStatus,
      vectorCheckResult: a.vectorCheckResult as VectorCheckResult | null,
      extractedFacts: a.extractedFacts as AdminArticle['extractedFacts'],
    }))
  }

  return (
    <ArticlesAdminClient
      pending={serialize(pendingRaw)}
      approved={serialize(approvedRaw)}
      rejected={serialize(rejectedRaw)}
    />
  )
}
