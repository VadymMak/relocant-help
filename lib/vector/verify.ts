import Anthropic from '@anthropic-ai/sdk'
import { getPrisma } from '@/lib/db'
import { generateEmbedding } from './embeddings'
import { extractFacts, ExtractedFact } from './facts'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

export interface VerificationResult {
  contradictions: Array<{
    newFact: string
    conflictsWith: string
    severity: 'low' | 'medium' | 'high'
  }>
  duplicateScore: number
  recommendation: 'publish' | 'review' | 'reject'
  explanation: string
  extractedFacts: ExtractedFact[]
}

interface SimilarNode {
  id: string
  content: string
  subject: string | null
  property: string | null
  value: string | null
  country: string | null
  source_type: string
  confidence: number
  is_superseded: boolean
  similarity: number
}

export async function verifyArticle(article: {
  titleUk?: string | null
  summaryUk?: string | null
  fullTextUk?: string | null
  originalContent?: string | null
  country: string
}): Promise<VerificationResult> {
  const textToAnalyze = [article.titleUk, article.summaryUk, article.fullTextUk]
    .filter(Boolean).join('\n\n') || article.originalContent || ''

  // 1. Extract structured facts
  const extractedFacts = await extractFacts(textToAnalyze, article.country)

  if (extractedFacts.length === 0) {
    return {
      contradictions: [],
      duplicateScore: 0,
      recommendation: 'publish',
      explanation: 'No structured facts extracted — likely a general news article.',
      extractedFacts: [],
    }
  }

  // 2. Generate embedding from title + summary + fact labels
  const embeddingText = [
    article.titleUk ?? '',
    article.summaryUk ?? '',
    extractedFacts.map(f => `${f.subject} ${f.property}: ${f.value}`).join('. '),
  ].join(' ')

  let embedding: number[]
  try {
    embedding = await generateEmbedding(embeddingText)
  } catch {
    return {
      contradictions: [],
      duplicateScore: 0,
      recommendation: 'publish',
      explanation: 'Embedding service unavailable — skipping vector check.',
      extractedFacts,
    }
  }

  // 3. Query KnowledgeNode for similar existing knowledge via cosine similarity
  const embeddingStr = JSON.stringify(embedding)
  let similarNodes: SimilarNode[] = []

  try {
    similarNodes = await getPrisma().$queryRaw<SimilarNode[]>`
      SELECT id, content, subject, property, value, country,
             source_type, confidence, is_superseded,
             1 - (embedding <=> ${embeddingStr}::vector) as similarity
      FROM "KnowledgeNode"
      WHERE embedding IS NOT NULL
        AND (level >= 2 OR created_at > NOW() - INTERVAL '30 days')
      ORDER BY embedding <=> ${embeddingStr}::vector
      LIMIT 8
    `
  } catch {
    similarNodes = []
  }

  const topMatches = similarNodes.filter(n => n.similarity > 0.8)
  const duplicateScore = topMatches.length > 0 ? topMatches[0].similarity : 0

  if (topMatches.length === 0) {
    return {
      contradictions: [],
      duplicateScore,
      recommendation: 'publish',
      explanation: 'No similar knowledge found. Appears to be new information.',
      extractedFacts,
    }
  }

  // 4. Claude contradiction analysis against retrieved context
  const contextStr = topMatches
    .map(n =>
      `[${n.source_type.toUpperCase()}] ${n.subject ?? ''} ${n.property ?? ''}: ${n.value ?? n.content} (${n.country ?? 'EU'}, sim: ${(n.similarity * 100).toFixed(0)}%)`
    )
    .join('\n')

  const newFactsStr = extractedFacts
    .map(f => `${f.subject} ${f.property}: ${f.value} (${f.country ?? article.country})`)
    .join('\n')

  const prompt = `You are a fact-checker for a Ukrainian/Russian relocant news platform.

NEW ARTICLE FACTS:
${newFactsStr}

EXISTING KNOWLEDGE BASE (similar approved articles):
${contextStr}

Check if any new facts contradict existing knowledge. Also check for near-duplicate content.

Respond with ONLY valid JSON (no markdown):
{
  "contradictions": [
    {
      "newFact": "what the new article claims",
      "conflictsWith": "what existing knowledge says",
      "severity": "low|medium|high"
    }
  ],
  "duplicateScore": 0.0,
  "recommendation": "publish|review|reject",
  "explanation": "one sentence summary"
}

Rules:
- "reject" if duplicateScore > 0.92 (near-identical content already published)
- "review" if any high/medium contradictions, or duplicateScore 0.75-0.92
- "publish" if no contradictions and duplicateScore < 0.75`

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 800,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : '{}'
    const jsonText = text.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim()
    const parsed = JSON.parse(jsonText) as Omit<VerificationResult, 'extractedFacts'>

    return {
      contradictions: parsed.contradictions ?? [],
      duplicateScore: typeof parsed.duplicateScore === 'number' ? parsed.duplicateScore : duplicateScore,
      recommendation: parsed.recommendation ?? 'review',
      explanation: parsed.explanation ?? '',
      extractedFacts,
    }
  } catch {
    return {
      contradictions: [],
      duplicateScore,
      recommendation: 'review',
      explanation: 'AI analysis failed — flagged for manual review.',
      extractedFacts,
    }
  }
}

export async function storeInKnowledgeBase(
  articleId: string,
  facts: ExtractedFact[],
  country: string,
  sourceType: 'official' | 'ngo' | 'media' = 'media'
): Promise<void> {
  for (const fact of facts) {
    const factCountry = fact.country ?? country

    // Mark older facts with same subject+property as superseded
    await getPrisma().knowledgeNode.updateMany({
      where: {
        subject: fact.subject,
        property: fact.property,
        country: factCountry,
        isSuperseded: false,
      },
      data: { isSuperseded: true },
    })

    const content = `${fact.subject} ${fact.property}: ${fact.value}`

    const node = await getPrisma().knowledgeNode.create({
      data: {
        articleId,
        content,
        level: 2,
        country: factCountry,
        subject: fact.subject,
        property: fact.property,
        value: fact.value,
        confidence: fact.confidence,
        sourceType,
        validFrom: fact.validFrom ? new Date(fact.validFrom) : undefined,
        validTo: fact.validTo ? new Date(fact.validTo) : undefined,
      },
    })

    try {
      const embedding = await generateEmbedding(content)
      const embeddingStr = JSON.stringify(embedding)
      await getPrisma().$executeRaw`
        UPDATE "KnowledgeNode" SET embedding = ${embeddingStr}::vector WHERE id = ${node.id}
      `
    } catch (e) {
      console.error(`[knowledge] Failed to embed node ${node.id}:`, e)
    }
  }
}
