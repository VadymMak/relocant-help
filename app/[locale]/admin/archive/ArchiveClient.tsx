'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'

export interface ArchiveArticle {
  id: string
  titleUk: string | null
  titleRu: string | null
  country: string
  flag: string
  countryCode: string
  publishedAt: string | null
  sourceId: string
  relevanceScore: number
  tags: string[]
}

const PAGE_SIZE = 20

const COUNTRY_TABS = [
  { label: 'Всі', code: 'ALL' },
  { label: '🇸🇰 SK', code: 'SK' },
  { label: '🇵🇱 PL', code: 'PL' },
  { label: '🇩🇪 DE', code: 'DE' },
  { label: '🇨🇿 CZ', code: 'CZ' },
  { label: '🇪🇺 EU', code: 'EU' },
]

interface Props {
  articles: ArchiveArticle[]
  locale: string
}

export default function ArchiveClient({ articles, locale }: Props) {
  const t = useTranslations('admin')
  const [search, setSearch] = useState('')
  const [countryFilter, setCountryFilter] = useState('ALL')
  const [page, setPage] = useState(1)

  const q = search.trim().toLowerCase()

  const filtered = articles.filter(a => {
    const title = (locale === 'ru' ? a.titleRu : a.titleUk) ?? ''
    const matchSearch = !q || title.toLowerCase().includes(q)
    const matchCountry = countryFilter === 'ALL' || a.countryCode === countryFilter
    return matchSearch && matchCountry
  })

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function changeFilter(code: string) {
    setCountryFilter(code)
    setPage(1)
  }

  function changeSearch(val: string) {
    setSearch(val)
    setPage(1)
  }

  return (
    <>
      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 280px', maxWidth: 400 }}>
          <svg
            width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="var(--rh-fg-3)" strokeWidth="2"
            style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
          >
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            value={search}
            onChange={e => changeSearch(e.target.value)}
            placeholder={t('archiveSearch')}
            style={{
              width: '100%', boxSizing: 'border-box',
              border: '1px solid var(--rh-border)', borderRadius: 'var(--rh-radius)',
              padding: '9px 12px 9px 38px', fontSize: 13,
              fontFamily: 'var(--rh-font)', color: 'var(--rh-fg)',
              background: 'white', outline: 'none',
            }}
          />
        </div>
        <div style={{ fontSize: 13, color: 'var(--rh-fg-3)', whiteSpace: 'nowrap' }}>
          {filtered.length} статей
        </div>
      </div>

      {/* Country tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
        {COUNTRY_TABS.map(({ code, label }) => (
          <button
            key={code}
            onClick={() => changeFilter(code)}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--rh-radius-pill)',
              border: countryFilter === code ? '1.5px solid var(--rh-blue)' : '1.5px solid var(--rh-border)',
              background: countryFilter === code ? 'var(--rh-blue)' : 'white',
              color: countryFilter === code ? 'white' : 'var(--rh-fg-2)',
              fontWeight: countryFilter === code ? 600 : 500,
              fontSize: 13, cursor: 'pointer', fontFamily: 'var(--rh-font)',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{
        background: 'white', border: '1px solid var(--rh-border)',
        borderRadius: 'var(--rh-radius-lg)', overflow: 'hidden',
        boxShadow: 'var(--rh-shadow-xs)',
      }}>
        {paged.length === 0 ? (
          <div style={{ padding: '64px 24px', textAlign: 'center', color: 'var(--rh-fg-3)', fontSize: 15 }}>
            {t('archiveEmpty')}
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--rh-border)', background: 'var(--rh-bg)' }}>
                {['Країна', 'Заголовок', 'Джерело', 'Дата', 'Score'].map(h => (
                  <th key={h} style={{
                    padding: '10px 16px', textAlign: 'left',
                    fontWeight: 700, fontSize: 11, color: 'var(--rh-fg-3)',
                    textTransform: 'uppercase', letterSpacing: '0.04em',
                    whiteSpace: 'nowrap',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paged.map(article => {
                const title = (locale === 'ru' ? article.titleRu : article.titleUk) ?? '—'
                const date = article.publishedAt
                  ? new Date(article.publishedAt).toLocaleDateString('uk-UA', { day: 'numeric', month: 'short', year: 'numeric' })
                  : '—'
                const score = Math.round(article.relevanceScore)
                const scoreColor = score >= 80 ? 'var(--rh-teal)' : score >= 50 ? 'var(--rh-warning)' : 'var(--rh-fg-3)'

                return (
                  <tr
                    key={article.id}
                    onClick={() => window.open(`/${locale}/articles/${article.id}`, '_blank')}
                    style={{
                      borderBottom: '1px solid var(--rh-border)',
                      cursor: 'pointer', transition: 'background 0.1s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--rh-bg)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        background: 'var(--rh-bg-2)', borderRadius: 'var(--rh-radius-pill)',
                        padding: '2px 8px', fontSize: 12, fontWeight: 500, color: 'var(--rh-fg-2)',
                      }}>
                        {article.flag} {article.countryCode}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', maxWidth: 380 }}>
                      <div style={{
                        fontWeight: 500, color: 'var(--rh-fg)',
                        overflow: 'hidden', textOverflow: 'ellipsis',
                        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                        lineHeight: 1.4,
                      }}>
                        {title}
                      </div>
                      {article.tags[0] && (
                        <span style={{
                          display: 'inline-block', marginTop: 4,
                          background: 'rgba(29,158,117,0.1)', color: 'var(--rh-teal)',
                          borderRadius: 'var(--rh-radius-pill)', padding: '1px 7px',
                          fontSize: 11, fontWeight: 600,
                        }}>{article.tags[0]}</span>
                      )}
                    </td>
                    <td style={{ padding: '12px 16px', whiteSpace: 'nowrap', color: 'var(--rh-fg-2)', fontSize: 12 }}>
                      {article.sourceId}
                    </td>
                    <td style={{ padding: '12px 16px', whiteSpace: 'nowrap', color: 'var(--rh-fg-2)', fontSize: 12 }}>
                      {date}
                    </td>
                    <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                      <span style={{ fontWeight: 700, fontSize: 13, color: scoreColor }}>
                        {score}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 32, alignItems: 'center' }}>
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            style={{
              padding: '7px 16px', borderRadius: 'var(--rh-radius-pill)',
              border: '1.5px solid var(--rh-border)', background: 'white',
              color: page === 1 ? 'var(--rh-fg-3)' : 'var(--rh-fg)',
              fontSize: 13, fontWeight: 500, fontFamily: 'var(--rh-font)',
              cursor: page === 1 ? 'default' : 'pointer', opacity: page === 1 ? 0.5 : 1,
            }}
          >
            ← Назад
          </button>
          {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
            const n = totalPages <= 7 ? i + 1
              : page <= 4 ? i + 1
              : page >= totalPages - 3 ? totalPages - 6 + i
              : page - 3 + i
            return (
              <button
                key={n}
                onClick={() => setPage(n)}
                style={{
                  width: 34, height: 34, borderRadius: 'var(--rh-radius-pill)',
                  border: n === page ? '1.5px solid var(--rh-blue)' : '1.5px solid var(--rh-border)',
                  background: n === page ? 'var(--rh-blue)' : 'white',
                  color: n === page ? 'white' : 'var(--rh-fg)',
                  fontSize: 13, fontWeight: 600, fontFamily: 'var(--rh-font)', cursor: 'pointer',
                }}
              >
                {n}
              </button>
            )
          })}
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            style={{
              padding: '7px 16px', borderRadius: 'var(--rh-radius-pill)',
              border: '1.5px solid var(--rh-border)', background: 'white',
              color: page === totalPages ? 'var(--rh-fg-3)' : 'var(--rh-fg)',
              fontSize: 13, fontWeight: 500, fontFamily: 'var(--rh-font)',
              cursor: page === totalPages ? 'default' : 'pointer', opacity: page === totalPages ? 0.5 : 1,
            }}
          >
            Далі →
          </button>
        </div>
      )}
    </>
  )
}
