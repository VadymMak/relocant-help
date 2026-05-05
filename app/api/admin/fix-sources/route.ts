import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { getSources, upsertSourceUrl } from '@/lib/db/sources-config'

export const maxDuration = 120

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

interface FixResult {
  sourceId: string
  sourceName: string
  oldUrl: string
  newUrl: string | null
  fixed: boolean
  error?: string
}

async function isUrlBroken(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, {
      method: 'HEAD',
      headers: { 'User-Agent': 'relocant.help/1.0' },
      redirect: 'follow',
      signal: AbortSignal.timeout(8000),
    })
    return !res.ok
  } catch {
    return true
  }
}

async function findCorrectUrl(source: { id: string; name: string; country: string; url: string }): Promise<string | null> {
  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 512,
      tools: [{ type: 'web_search_20250305' as const, name: 'web_search' }],
      messages: [{
        role: 'user',
        content: `Find the current working URL for the official news or press releases page of "${source.name}" (${source.country} government website). The old URL was: ${source.url}. Search the web and return only the new working URL. No explanation, just the URL.`,
      }],
    })

    for (const block of response.content) {
      if (block.type === 'text') {
        const urlMatch = block.text.match(/https?:\/\/[^\s"'<>]+/)
        if (urlMatch) return urlMatch[0].replace(/[.,;)]+$/, '')
      }
    }
    return null
  } catch (err) {
    console.error(`[fix-sources] Claude failed for ${source.id}:`, err)
    return null
  }
}

export async function POST(req: NextRequest) {
  const session = req.cookies.get('admin_session')
  if (!session?.value) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => ({})) as { sourceIds?: string[] }
  const sources = await getSources()
  const targets = body.sourceIds
    ? sources.filter(s => body.sourceIds!.includes(s.id))
    : sources.filter(s => s.active)

  const results: FixResult[] = []

  for (const source of targets) {
    const broken = await isUrlBroken(source.url)
    if (!broken) {
      results.push({ sourceId: source.id, sourceName: source.name, oldUrl: source.url, newUrl: null, fixed: false })
      continue
    }

    const newUrl = await findCorrectUrl(source)
    if (newUrl && newUrl !== source.url) {
      try {
        await upsertSourceUrl(source.id, newUrl)
        results.push({ sourceId: source.id, sourceName: source.name, oldUrl: source.url, newUrl, fixed: true })
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err)
        results.push({ sourceId: source.id, sourceName: source.name, oldUrl: source.url, newUrl, fixed: false, error: message })
      }
    } else {
      results.push({ sourceId: source.id, sourceName: source.name, oldUrl: source.url, newUrl: null, fixed: false, error: 'Could not find new URL' })
    }

    // Be polite between requests
    await new Promise(r => setTimeout(r, 1500))
  }

  const fixed = results.filter(r => r.fixed).length
  return NextResponse.json({ fixed, total: targets.length, results })
}
