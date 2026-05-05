import { getPrisma } from '@/lib/db'
import ArticlesAdminClient, { type AdminArticle } from './ArticlesAdminClient'

export const dynamic = 'force-dynamic'

export default async function AdminArticlesPage() {
  const [pendingRaw, approvedRaw, rejectedRaw] = await Promise.all([
    getPrisma().crawledArticle.findMany({
      where: { status: 'pending_review' },
      orderBy: { createdAt: 'desc' },
      select: { id: true, titleUk: true, country: true, relevanceScore: true, sourceId: true, createdAt: true, url: true, tags: true },
    }),
    getPrisma().crawledArticle.findMany({
      where: { status: 'approved' },
      orderBy: { createdAt: 'desc' },
      select: { id: true, titleUk: true, country: true, relevanceScore: true, sourceId: true, createdAt: true, url: true, tags: true },
    }),
    getPrisma().crawledArticle.findMany({
      where: { status: 'rejected' },
      orderBy: { createdAt: 'desc' },
      select: { id: true, titleUk: true, country: true, relevanceScore: true, sourceId: true, createdAt: true, url: true, tags: true },
    }),
  ])

  function serialize(rows: typeof pendingRaw): AdminArticle[] {
    return rows.map(a => ({
      ...a,
      createdAt: a.createdAt?.toISOString() ?? null,
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
