interface OpenAIEmbeddingResponse {
  data: [{ embedding: number[] }]
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error('OPENAI_API_KEY not set')

  const res = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: text.slice(0, 8000),
    }),
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`OpenAI embeddings error: ${res.status} ${body}`)
  }

  const data = await res.json() as OpenAIEmbeddingResponse
  return data.data[0].embedding
}
