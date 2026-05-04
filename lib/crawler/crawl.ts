import Anthropic from '@anthropic-ai/sdk'
import { sources, type CrawlerSource } from './sources'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export interface CrawlResult {
  sourceId: string
  url: string
  title: string
  content: string
  language: string
  relevanceScore: number
  titleUk: string
  titleRu: string
  summaryUk: string
  summaryRu: string
  fullTextUk: string
  fullTextRu: string
  tags: string[]
}

async function translateWithClaude(
  title: string,
  content: string,
  sourceLanguage: string
): Promise<{
  titleUk: string
  titleRu: string
  summaryUk: string
  summaryRu: string
  fullTextUk: string
  fullTextRu: string
  tags: string[]
  relevanceScore: number
}> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: `You are processing an article from ${sourceLanguage} for Ukrainian and Russian-speaking relocants in Europe.

Article title: ${title}
Article content: ${content.substring(0, 3000)}

Respond with a JSON object (no markdown) with these fields:
- titleUk: title in Ukrainian
- titleRu: title in Russian
- summaryUk: 2-3 sentence summary in Ukrainian
- summaryRu: 2-3 sentence summary in Russian
- fullTextUk: full translation to Ukrainian
- fullTextRu: full translation to Russian
- tags: array of 3-5 relevant tags in English (e.g. ["visa", "work", "healthcare"])
- relevanceScore: float 0-1 indicating how relevant this is for relocants (0 = not relevant, 1 = highly relevant)`,
      },
    ],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : '{}'
  return JSON.parse(text)
}

export async function crawlSource(source: CrawlerSource): Promise<CrawlResult[]> {
  // Placeholder: real implementation would fetch and parse pages
  console.log(`Crawling ${source.name}...`)
  return []
}

export async function runCrawler(): Promise<{ found: number; relevant: number }> {
  let totalFound = 0
  let totalRelevant = 0

  for (const source of sources) {
    const results = await crawlSource(source)
    totalFound += results.length
    totalRelevant += results.filter((r) => r.relevanceScore >= 0.5).length
  }

  return { found: totalFound, relevant: totalRelevant }
}

export { translateWithClaude }
