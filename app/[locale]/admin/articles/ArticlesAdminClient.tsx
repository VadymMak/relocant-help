'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'

export interface AdminArticle {
  id: string
  titleUk: string | null
  country: string
  relevanceScore: number | null
  sourceId: string
  createdAt: string | null
  url: string
  tags: string[]
}

interface Props {
  pending: AdminArticle[]
  approved: AdminArticle[]
  rejected: AdminArticle[]
}

type Tab = 'pending' | 'approved' | 'rejected'

const COUNTRY_FLAG: Record<string, string> = {
  Slovakia: '🇸🇰',
  Poland: '🇵🇱',
  Germany: '🇩🇪',
  'Czech Republic': '🇨🇿',
  'European Union': '🇪🇺',
}

export default function ArticlesAdminClient({ pending: initialPending, approved: initialApproved, rejected: initialRejected }: Props) {
  const t = useTranslations('admin')
  const [tab, setTab] = useState<Tab>('pending')
  const [articles, setArticles] = useState({
    pending: initialPending,
    approved: initialApproved,
    rejected: initialRejected,
  })
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({})

  async function handleAction(articleId: string, action: 'approve' | 'reject') {
    setActionLoading(prev => ({ ...prev, [articleId]: true }))

    const article = articles.pending.find(a => a.id === articleId)

    setArticles(prev => ({
      pending: prev.pending.filter(a => a.id !== articleId),
      approved: action === 'approve' && article
        ? [article, ...prev.approved]
        : prev.approved,
      rejected: action === 'reject' && article
        ? [article, ...prev.rejected]
        : prev.rejected,
    }))

    try {
      await fetch('/api/crawler/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId, action }),
      })
    } finally {
      setActionLoading(prev => ({ ...prev, [articleId]: false }))
    }
  }

  const current = articles[tab]

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'pending', label: t('tabPending'), count: articles.pending.length },
    { key: 'approved', label: t('tabApproved'), count: articles.approved.length },
    { key: 'rejected', label: t('tabRejected'), count: articles.rejected.length },
  ]

  return (
    <main style={{ padding: '32px', maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 4px', color: 'var(--rh-fg)' }}>
          {t('articles')}
        </h1>
        <p style={{ fontSize: 14, color: 'var(--rh-fg-2)', margin: 0 }}>
          {articles.pending.length} {t('tabPending').toLowerCase()}
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20 }}>
        {tabs.map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            style={{
              background: tab === key ? 'var(--rh-navy)' : 'white',
              color: tab === key ? 'white' : 'var(--rh-fg-2)',
              border: '1px solid ' + (tab === key ? 'var(--rh-navy)' : 'var(--rh-border)'),
              borderRadius: 'var(--rh-radius-md)', padding: '8px 16px',
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 8,
            }}
          >
            {label}
            <span style={{
              background: tab === key ? 'rgba(255,255,255,0.2)' : 'var(--rh-bg-alt)',
              color: tab === key ? 'white' : 'var(--rh-fg-3)',
              borderRadius: 'var(--rh-radius-pill)', padding: '1px 8px', fontSize: 11,
            }}>
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      {current.length === 0 ? (
        <div style={{
          background: 'white', border: '1px solid var(--rh-border)',
          borderRadius: 'var(--rh-radius-lg)', padding: 64,
          textAlign: 'center', color: 'var(--rh-fg-2)', fontSize: 15,
        }}>
          {tab === 'pending' ? t('articlesEmptyPending') : t('articlesEmpty')}
        </div>
      ) : (
        <div style={{
          background: 'white', border: '1px solid var(--rh-border)',
          borderRadius: 'var(--rh-radius-lg)', overflow: 'hidden',
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--rh-bg)', borderBottom: '1px solid var(--rh-border)' }}>
                {['Title', 'Country', 'Score', 'Source', 'Tags', 'Date', tab === 'pending' ? 'Actions' : ''].map(h => (
                  <th key={h} style={{
                    padding: '12px 16px', textAlign: 'left',
                    fontWeight: 700, fontSize: 11, color: 'var(--rh-fg-3)',
                    textTransform: 'uppercase', letterSpacing: '0.04em',
                    whiteSpace: 'nowrap',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {current.map(article => {
                const flag = COUNTRY_FLAG[article.country] ?? '🌍'
                const isLoading = actionLoading[article.id]
                return (
                  <tr key={article.id} style={{ borderBottom: '1px solid var(--rh-border)' }}>
                    <td style={{ padding: '14px 16px', maxWidth: 320 }}>
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: 'var(--rh-fg)', fontWeight: 600, textDecoration: 'none', fontSize: 13 }}
                      >
                        {article.titleUk ?? 'No title'}
                      </a>
                    </td>
                    <td style={{ padding: '14px 16px', whiteSpace: 'nowrap', color: 'var(--rh-fg-2)' }}>
                      {flag} {article.country}
                    </td>
                    <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                      <span style={{
                        background: (article.relevanceScore ?? 0) >= 80 ? 'var(--rh-teal-100)' : 'var(--rh-warning-100)',
                        color: (article.relevanceScore ?? 0) >= 80 ? 'var(--rh-teal-700)' : 'var(--rh-warning)',
                        borderRadius: 'var(--rh-radius-pill)', padding: '3px 10px',
                        fontWeight: 700, fontSize: 12,
                      }}>
                        {article.relevanceScore ?? 0}/100
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--rh-fg-2)', whiteSpace: 'nowrap' }}>
                      {article.sourceId}
                    </td>
                    <td style={{ padding: '14px 16px', maxWidth: 200 }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {article.tags.slice(0, 3).map(tag => (
                          <span key={tag} style={{
                            background: 'var(--rh-bg-alt)', color: 'var(--rh-fg-2)',
                            borderRadius: 'var(--rh-radius-pill)', padding: '2px 8px', fontSize: 11,
                          }}>{tag}</span>
                        ))}
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', whiteSpace: 'nowrap', color: 'var(--rh-fg-3)', fontSize: 12 }}>
                      {article.createdAt
                        ? new Date(article.createdAt).toLocaleDateString('uk-UA')
                        : '—'}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      {tab === 'pending' && (
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button
                            onClick={() => handleAction(article.id, 'approve')}
                            disabled={isLoading}
                            style={{
                              background: 'var(--rh-teal)', color: 'white', border: 0,
                              padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                              cursor: isLoading ? 'default' : 'pointer', opacity: isLoading ? 0.6 : 1,
                            }}
                          >
                            ✅ {t('approve')}
                          </button>
                          <button
                            onClick={() => handleAction(article.id, 'reject')}
                            disabled={isLoading}
                            style={{
                              background: 'white', color: 'var(--rh-fg-2)',
                              border: '1px solid var(--rh-border)',
                              padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                              cursor: isLoading ? 'default' : 'pointer', opacity: isLoading ? 0.6 : 1,
                            }}
                          >
                            ❌ {t('reject')}
                          </button>
                        </div>
                      )}
                      {tab === 'approved' && (
                        <span style={{ fontSize: 12, color: 'var(--rh-teal)', fontWeight: 600 }}>✓ Published</span>
                      )}
                      {tab === 'rejected' && (
                        <span style={{ fontSize: 12, color: 'var(--rh-fg-3)', fontWeight: 600 }}>✗ Rejected</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </main>
  )
}
