import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

export interface ExtractedFact {
  subject: string
  property: string
  value: string
  country?: string
  confidence: number
  validFrom?: string
  validTo?: string
}

export async function extractFacts(
  content: string,
  country: string
): Promise<ExtractedFact[]> {
  const prompt = `Extract migration-relevant facts from this article about ${country}.
Return ONLY a JSON array (no markdown, no explanation):
[{
  "subject": "Temporary Protection",
  "property": "valid_until",
  "value": "2027-03-04",
  "country": "Slovakia",
  "confidence": 0.9,
  "validFrom": "2022-03-01",
  "validTo": "2027-03-04"
}]

Focus on:
- Dates and deadlines (permit validity, registration deadlines, benefit expiry)
- Requirements (documents needed, eligibility criteria)
- Policy changes (new rules, extended programs, cancelled benefits)
- Legal status rules (who qualifies, what rights are granted)
- Amounts (benefit amounts, fees, financial thresholds)

If no migration-relevant facts, return empty array: []

ARTICLE:
${content.slice(0, 4000)}`

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : '[]'
    const jsonText = text.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim()
    const facts = JSON.parse(jsonText) as ExtractedFact[]
    return Array.isArray(facts) ? facts : []
  } catch {
    return []
  }
}
