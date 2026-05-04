import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { id, action } = await req.json() as { id: number; action: 'approve' | 'reject' }

  if (!id || !action) {
    return NextResponse.json({ error: 'Missing id or action' }, { status: 400 })
  }

  return NextResponse.json({ ok: true, id, action })
}
