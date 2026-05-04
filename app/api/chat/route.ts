import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  const { message } = await req.json() as { message: string }

  if (!message) {
    return NextResponse.json({ error: 'Missing message' }, { status: 400 })
  }

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: 'You are a helpful assistant for relocants in Europe. Answer questions about relocation, visas, and life in European countries.',
    messages: [{ role: 'user', content: message }],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''

  return NextResponse.json({ reply: text })
}
