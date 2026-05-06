'use client'

import { useTranslations } from 'next-intl'
import { useState } from 'react'

interface ImportResult {
  success: boolean
  notRelevant?: boolean
  relevanceScore?: number
  titleUk?: string
  summaryUk?: string
  country?: string
  tags?: string[]
  id?: string
}

export default function ImportPage() {
  const t = useTranslations('admin')
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!url.trim()) return

    setLoading(true)
    setResult(null)
    setError(null)

    try {
      const res = await fetch('/api/admin/import-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      })
      const data = await res.json() as ImportResult & { error?: string }

      if (!res.ok) {
        setError(data.error ?? t('importError'))
      } else {
        setResult(data)
      }
    } catch {
      setError(t('importError'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '32px 40px', maxWidth: 720 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--rh-text)', marginBottom: 8 }}>
        {t('importTitle')}
      </h1>
      <p style={{ color: 'var(--rh-text-muted)', marginBottom: 32, fontSize: 14 }}>
        {t('importDesc')}
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label
            htmlFor="import-url"
            style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--rh-text)', marginBottom: 6 }}
          >
            {t('importUrlLabel')}
          </label>
          <input
            id="import-url"
            type="url"
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder={t('importUrlPlaceholder')}
            required
            style={{
              width: '100%',
              padding: '10px 14px',
              border: '1px solid var(--rh-border)',
              borderRadius: 8,
              fontSize: 14,
              background: 'var(--rh-surface)',
              color: 'var(--rh-text)',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <button
          type="submit"
          disabled={loading || !url.trim()}
          style={{
            alignSelf: 'flex-start',
            padding: '10px 24px',
            background: loading || !url.trim() ? 'var(--rh-text-muted)' : 'var(--rh-teal)',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            cursor: loading || !url.trim() ? 'not-allowed' : 'pointer',
            transition: 'background 0.15s',
          }}
        >
          {loading ? t('importLoading') : t('importBtn')}
        </button>
      </form>

      {error && (
        <div style={{
          marginTop: 24,
          padding: '14px 18px',
          background: 'rgba(220, 38, 38, 0.08)',
          border: '1px solid rgba(220, 38, 38, 0.2)',
          borderRadius: 8,
          color: '#dc2626',
          fontSize: 14,
        }}>
          {error}
        </div>
      )}

      {result && !result.success && result.notRelevant && (
        <div style={{
          marginTop: 24,
          padding: '16px 20px',
          background: 'rgba(234, 179, 8, 0.08)',
          border: '1px solid rgba(234, 179, 8, 0.25)',
          borderRadius: 8,
          fontSize: 14,
        }}>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>{t('importNotRelevant')}</div>
          <div style={{ color: 'var(--rh-text-muted)' }}>
            {t('importScoreLabel')}: {result.relevanceScore}/100
          </div>
          {result.titleUk && (
            <div style={{ marginTop: 8, fontStyle: 'italic', color: 'var(--rh-text-muted)' }}>
              {result.titleUk}
            </div>
          )}
        </div>
      )}

      {result?.success && (
        <div style={{
          marginTop: 24,
          padding: '20px 24px',
          background: 'rgba(20, 184, 166, 0.06)',
          border: '1px solid rgba(20, 184, 166, 0.25)',
          borderRadius: 8,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <span style={{ color: 'var(--rh-teal)', fontSize: 20, lineHeight: 1 }}>✓</span>
            <span style={{ fontWeight: 600, fontSize: 15 }}>{t('importSuccess')}</span>
            <span style={{
              marginLeft: 'auto',
              background: 'var(--rh-teal)',
              color: 'white',
              borderRadius: 12,
              padding: '2px 10px',
              fontSize: 12,
              fontWeight: 700,
            }}>
              {result.relevanceScore}/100
            </span>
          </div>

          {result.titleUk && (
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, color: 'var(--rh-text)' }}>
              {result.titleUk}
            </div>
          )}

          {result.summaryUk && (
            <div style={{
              fontSize: 14,
              color: 'var(--rh-text-muted)',
              lineHeight: 1.6,
              marginBottom: 14,
            }}>
              {result.summaryUk}
            </div>
          )}

          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
            {result.country && (
              <span style={{
                padding: '3px 10px',
                background: 'rgba(99, 102, 241, 0.1)',
                borderRadius: 12,
                fontSize: 12,
                color: '#6366f1',
                fontWeight: 500,
              }}>
                {result.country}
              </span>
            )}
            {result.tags?.slice(0, 5).map(tag => (
              <span key={tag} style={{
                padding: '3px 10px',
                background: 'var(--rh-surface)',
                border: '1px solid var(--rh-border)',
                borderRadius: 12,
                fontSize: 12,
                color: 'var(--rh-text-muted)',
              }}>
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
