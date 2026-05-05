import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const session = req.cookies.get('admin_session')
  if (!session?.value) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { url } = await req.json() as { url: string }
  if (!url) return NextResponse.json({ error: 'Missing url' }, { status: 400 })

  try {
    const res = await fetch(url, {
      method: 'HEAD',
      headers: { 'User-Agent': 'relocant.help/1.0 (URL health check)' },
      redirect: 'follow',
      signal: AbortSignal.timeout(10000),
    })
    return NextResponse.json({ ok: res.ok, status: res.status })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ ok: false, status: 0, error: message })
  }
}
