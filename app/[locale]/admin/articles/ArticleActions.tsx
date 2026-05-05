'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function ArticleActions({ articleId }: { articleId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleAction(action: 'approve' | 'reject') {
    setLoading(true)
    await fetch('/api/crawler/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ articleId, action }),
    })
    setLoading(false)
    router.refresh()
    setTimeout(() => router.refresh(), 500)
  }

  return (
    <div style={{ display: 'flex', gap: 6 }}>
      <button
        onClick={() => handleAction('approve')}
        disabled={loading}
        style={{
          background: 'var(--rh-teal)', color: 'white', border: 0,
          padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
          cursor: loading ? 'default' : 'pointer', opacity: loading ? 0.6 : 1,
        }}
      >
        ✅ Approve
      </button>
      <button
        onClick={() => handleAction('reject')}
        disabled={loading}
        style={{
          background: 'white', color: 'var(--rh-fg-2)',
          border: '1px solid var(--rh-border)',
          padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
          cursor: loading ? 'default' : 'pointer', opacity: loading ? 0.6 : 1,
        }}
      >
        ❌ Reject
      </button>
    </div>
  )
}
