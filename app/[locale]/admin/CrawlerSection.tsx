'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'

interface Props {
  lastRun: {
    createdAt: string | null
    status: string | null
    articlesFound: number | null
    articlesRelevant: number | null
  } | null
  stats: {
    pending: number
    approved: number
    rejected: number
  }
}

interface RunResult {
  processed: number
  relevant: number
  errors: string[]
}

export default function CrawlerSection({ lastRun, stats }: Props) {
  const t = useTranslations('admin')
  const router = useRouter()
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState<RunResult | null>(null)
  const [runError, setRunError] = useState<string | null>(null)

  async function handleRun() {
    setRunning(true)
    setResult(null)
    setRunError(null)

    try {
      const res = await fetch('/api/admin/crawler', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      const data = await res.json() as RunResult & { error?: string }

      if (!res.ok) {
        setRunError(data.error ?? 'Unknown error')
      } else {
        setResult(data)
        router.refresh()
      }
    } catch {
      setRunError('Network error')
    } finally {
      setRunning(false)
    }
  }

  const lastRunDate = lastRun?.createdAt
    ? new Date(lastRun.createdAt).toLocaleString('uk-UA', {
        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
      })
    : t('crawlerNeverRun')

  return (
    <div style={{
      background: 'white', border: '1px solid var(--rh-border)',
      borderRadius: 'var(--rh-radius-lg)', padding: '20px 24px',
      marginBottom: 24,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 2px', color: 'var(--rh-fg)' }}>
            {t('crawlerTitle')}
          </h2>
          <p style={{ fontSize: 12, color: 'var(--rh-fg-3)', margin: 0 }}>
            {t('crawlerLastRun')}: {lastRunDate}
            {lastRun?.status && (
              <span style={{
                marginLeft: 8, fontWeight: 600,
                color: lastRun.status === 'success' ? 'var(--rh-teal)' : 'var(--rh-warning)',
              }}>
                · {lastRun.status}
              </span>
            )}
          </p>
        </div>

        <button
          onClick={handleRun}
          disabled={running}
          style={{
            background: running ? 'var(--rh-bg-alt)' : 'var(--rh-teal)',
            color: running ? 'var(--rh-fg-2)' : 'white',
            border: 0, borderRadius: 'var(--rh-radius-md)',
            padding: '10px 20px', fontSize: 13, fontWeight: 700,
            cursor: running ? 'default' : 'pointer',
            display: 'inline-flex', alignItems: 'center', gap: 8,
            transition: 'background 0.15s',
          }}
        >
          {running ? (
            <>
              <span style={{
                display: 'inline-block', width: 12, height: 12,
                border: '2px solid var(--rh-fg-3)', borderTopColor: 'transparent',
                borderRadius: '50%', animation: 'spin 0.7s linear infinite',
              }} />
              {t('crawlerRunning')}
            </>
          ) : (
            <>▶ {t('crawlerRunBtn')}</>
          )}
        </button>
      </div>

      {/* Article counts */}
      <div style={{ display: 'flex', gap: 12, marginBottom: result || runError ? 16 : 0 }}>
        {[
          { label: t('crawlerPending'), value: stats.pending, color: 'var(--rh-warning)', bg: 'var(--rh-warning-100)' },
          { label: t('crawlerApproved'), value: stats.approved, color: 'var(--rh-teal-700)', bg: 'var(--rh-teal-100)' },
          { label: t('crawlerRejected'), value: stats.rejected, color: 'var(--rh-fg-3)', bg: 'var(--rh-bg-alt)' },
        ].map(({ label, value, color, bg }) => (
          <div key={label} style={{
            background: bg, borderRadius: 'var(--rh-radius-md)',
            padding: '10px 16px', flex: 1, textAlign: 'center',
          }}>
            <div style={{ fontSize: 22, fontWeight: 800, color, letterSpacing: '-0.02em' }}>{value}</div>
            <div style={{ fontSize: 11, color, fontWeight: 600, marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Run result */}
      {result && (
        <div style={{
          background: 'var(--rh-teal-100)', borderRadius: 'var(--rh-radius-md)',
          padding: '12px 16px', display: 'flex', gap: 24, fontSize: 13,
        }}>
          <span><strong style={{ color: 'var(--rh-teal-700)' }}>{result.processed}</strong> {t('crawlerProcessed')}</span>
          <span><strong style={{ color: 'var(--rh-teal-700)' }}>{result.relevant}</strong> {t('crawlerRelevant')}</span>
          <span><strong style={{ color: result.errors.length > 0 ? 'var(--rh-warning)' : 'var(--rh-teal-700)' }}>{result.errors.length}</strong> {t('crawlerErrors')}</span>
        </div>
      )}

      {runError && (
        <div style={{
          background: 'var(--rh-warning-100)', borderRadius: 'var(--rh-radius-md)',
          padding: '12px 16px', fontSize: 13, color: 'var(--rh-warning)', fontWeight: 600,
        }}>
          Error: {runError}
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
