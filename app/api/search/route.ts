import { NextRequest, NextResponse } from 'next/server'
import { getPrisma } from '@/lib/db'
import { generateEmbedding } from '@/lib/vector/embeddings'

export const dynamic = 'force-dynamic'

import type { SearchArticle } from '@/lib/types/search'
export type { SearchArticle }

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const q = searchParams.get('q')?.trim() ?? ''
  const country = searchParams.get('country') ?? undefined

  if (q.length < 2) return NextResponse.json([])

  // ── Mode A: keyword search (always runs) ──────────────────
  const keywordResults = await getPrisma().crawledArticle.findMany({
    where: {
      status: 'approved',
      ...(country ? { country } : {}),
      OR: [
        { titleUk: { contains: q, mode: 'insensitive' } },
        { summaryUk: { contains: q, mode: 'insensitive' } },
        { fullTextUk: { contains: q, mode: 'insensitive' } },
        { titleRu: { contains: q, mode: 'insensitive' } },
        { summaryRu: { contains: q, mode: 'insensitive' } },
      ],
    },
    orderBy: { publishedAt: 'desc' },
    take: 20,
    select: {
      id: true, sourceId: true, country: true, tags: true,
      titleUk: true, titleRu: true, summaryUk: true, summaryRu: true,
      publishedAt: true, relevanceScore: true,
    },
  })

  const keywordIds = new Set(keywordResults.map(r => r.id))
  const vectorScores = new Map<string, number>()

  // ── Mode B: semantic search (3+ words, requires pgvector) ─
  const wordCount = q.split(/\s+/).filter(Boolean).length
  if (wordCount >= 3 && process.env.OPENAI_API_KEY) {
    try {
      const embedding = await generateEmbedding(q)
      const embeddingStr = JSON.stringify(embedding)

      const nodes = await getPrisma().$queryRaw<{ article_id: string | null; similarity: number }[]>`
        SELECT article_id, 1 - (embedding <=> ${embeddingStr}::vector) as similarity
        FROM "KnowledgeNode"
        WHERE embedding IS NOT NULL
          AND article_id IS NOT NULL
          AND 1 - (embedding <=> ${embeddingStr}::vector) > 0.55
        ORDER BY embedding <=> ${embeddingStr}::vector
        LIMIT 20
      `

      for (const n of nodes) {
        if (!n.article_id) continue
        const prev = vectorScores.get(n.article_id) ?? 0
        if (n.similarity > prev) vectorScores.set(n.article_id, n.similarity)
      }
    } catch {
      // pgvector not ready or OPENAI unavailable — keyword only
    }
  }

  // Fetch semantic-only articles not already in keyword results
  const semanticOnlyIds = [...vectorScores.keys()].filter(id => !keywordIds.has(id))
  let semanticArticles: typeof keywordResults = []
  if (semanticOnlyIds.length > 0) {
    semanticArticles = await getPrisma().crawledArticle.findMany({
      where: {
        id: { in: semanticOnlyIds },
        status: 'approved',
        ...(country ? { country } : {}),
      },
      select: {
        id: true, sourceId: true, country: true, tags: true,
        titleUk: true, titleRu: true, summaryUk: true, summaryRu: true,
        publishedAt: true, relevanceScore: true,
      },
    })
  }

  // ── Merge + rank ──────────────────────────────────────────
  const all: SearchArticle[] = [
    ...keywordResults.map(a => ({
      ...a,
      publishedAt: a.publishedAt?.toISOString() ?? null,
      relevanceScore: a.relevanceScore ?? 0,
      vectorScore: vectorScores.get(a.id) ?? 0,
    })),
    ...semanticArticles.map(a => ({
      ...a,
      publishedAt: a.publishedAt?.toISOString() ?? null,
      relevanceScore: a.relevanceScore ?? 0,
      vectorScore: vectorScores.get(a.id) ?? 0,
    })),
  ]

  // Keyword hits first, then boost by vector similarity
  all.sort((a, b) =>
    (b.relevanceScore + b.vectorScore * 50) - (a.relevanceScore + a.vectorScore * 50)
  )

  return NextResponse.json(all.slice(0, 30))
}
