'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'

export interface ArticleCardData {
  id: string
  countryCode: string
  flag: string
  tag: string
  title: string
  summary: string
  date: string
  source: string
}

const PAGE_SIZE = 6

const COUNTRY_FILTERS = [
  { label: 'Всі', code: 'ALL' },
  { label: '🇸🇰 SK', code: 'SK' },
  { label: '🇵🇱 PL', code: 'PL' },
  { label: '🇩🇪 DE', code: 'DE' },
  { label: '🇨🇿 CZ', code: 'CZ' },
  { label: '🇪🇺 EU', code: 'EU' },
]

export default function ArticlesClientPage({ articles }: { articles: ArticleCardData[] }) {
  const t = useTranslations('articles')
  const [activeFilter, setActiveFilter] = useState('ALL')
  const [page, setPage] = useState(1)

  function handleFilter(code: string) {
    setActiveFilter(code)
    setPage(1)
  }

  const filtered = activeFilter === 'ALL'
    ? articles
    : articles.filter(a => a.countryCode === activeFilter)

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <main>
      <section style={{ background: 'var(--rh-navy)', color: 'white', padding: '64px 24px 80px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 12 }}>
            relocant.help · {t('title')}
          </div>
          <h1 style={{ fontSize: 38, fontWeight: 700, margin: '0 0 12px', letterSpacing: '-0.02em' }}>
            {t('title')}
          </h1>
          <p style={{ margin: 0, color: 'rgba(255,255,255,0.7)', fontSize: 17 }}>
            {t('subtitle')}
          </p>
        </div>
      </section>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px 80px' }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 36, flexWrap: 'wrap' }}>
          {COUNTRY_FILTERS.map(({ code, label }) => (
            <button
              key={code}
              onClick={() => handleFilter(code)}
              style={{
                padding: '8px 18px',
                borderRadius: 'var(--rh-radius-pill)',
                border: activeFilter === code ? '1.5px solid var(--rh-blue)' : '1.5px solid var(--rh-border)',
                background: activeFilter === code ? 'var(--rh-blue)' : 'white',
                color: activeFilter === code ? 'white' : 'var(--rh-fg-2)',
                fontWeight: activeFilter === code ? 600 : 500,
                fontSize: 13,
                cursor: 'pointer',
                fontFamily: 'var(--rh-font)',
                transition: 'all 0.15s',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {paged.length === 0 ? (
          <div style={{
            background: 'white', border: '1px solid var(--rh-border)',
            borderRadius: 'var(--rh-radius-lg)', padding: 64,
            textAlign: 'center', color: 'var(--rh-fg-2)', fontSize: 16,
            boxShadow: 'var(--rh-shadow-xs)',
          }}>
            {t('empty')}
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
              {paged.map(article => (
                <Link
                  key={article.id}
                  href={`/articles/${article.id}`}
                  style={{ textDecoration: 'none', color: 'inherit', display: 'flex' }}
                >
                  <div style={{
                    background: 'white',
                    border: '1px solid var(--rh-border)',
                    borderRadius: 'var(--rh-radius-lg)',
                    padding: '24px',
                    boxShadow: 'var(--rh-shadow-xs)',
                    display: 'flex', flexDirection: 'column', gap: 12, flex: 1,
                    transition: 'box-shadow 0.15s',
                  }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        background: 'var(--rh-bg-2)', color: 'var(--rh-fg-2)',
                        borderRadius: 'var(--rh-radius-pill)', padding: '3px 10px',
                        fontSize: 12, fontWeight: 500,
                      }}>
                        {article.flag} {article.countryCode}
                      </span>
                      {article.tag && (
                        <span style={{
                          background: 'rgba(29,158,117,0.1)', color: 'var(--rh-teal)',
                          borderRadius: 'var(--rh-radius-pill)', padding: '3px 10px',
                          fontSize: 12, fontWeight: 600,
                        }}>
                          {article.tag}
                        </span>
                      )}
                    </div>

                    <h3 style={{
                      margin: 0, fontSize: 16, fontWeight: 700,
                      color: 'var(--rh-fg-1)', lineHeight: 1.4, letterSpacing: '-0.01em',
                    }}>
                      {article.title || 'Article'}
                    </h3>

                    <p style={{
                      margin: 0, fontSize: 14, color: 'var(--rh-fg-2)', lineHeight: 1.6,
                      display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}>
                      {article.summary}
                    </p>

                    <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontSize: 12, color: 'var(--rh-fg-3)' }}>
                        {article.date} · {article.source}
                      </div>
                      <span style={{ fontSize: 13, color: 'var(--rh-blue)', fontWeight: 600 }}>
                        {t('readMore')}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {totalPages > 1 && (
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 48, alignItems: 'center' }}>
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  style={{
                    padding: '8px 18px', borderRadius: 'var(--rh-radius-pill)',
                    border: '1.5px solid var(--rh-border)',
                    background: 'white', color: page === 1 ? 'var(--rh-fg-3)' : 'var(--rh-fg-1)',
                    fontFamily: 'var(--rh-font)', fontSize: 13, fontWeight: 500,
                    cursor: page === 1 ? 'default' : 'pointer', opacity: page === 1 ? 0.5 : 1,
                  }}
                >
                  {t('paginationPrev')}
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                  <button
                    key={n}
                    onClick={() => setPage(n)}
                    style={{
                      width: 36, height: 36, borderRadius: 'var(--rh-radius-pill)',
                      border: n === page ? '1.5px solid var(--rh-blue)' : '1.5px solid var(--rh-border)',
                      background: n === page ? 'var(--rh-blue)' : 'white',
                      color: n === page ? 'white' : 'var(--rh-fg-1)',
                      fontFamily: 'var(--rh-font)', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                    }}
                  >
                    {n}
                  </button>
                ))}
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  style={{
                    padding: '8px 18px', borderRadius: 'var(--rh-radius-pill)',
                    border: '1.5px solid var(--rh-border)',
                    background: 'white', color: page === totalPages ? 'var(--rh-fg-3)' : 'var(--rh-fg-1)',
                    fontFamily: 'var(--rh-font)', fontSize: 13, fontWeight: 500,
                    cursor: page === totalPages ? 'default' : 'pointer', opacity: page === totalPages ? 0.5 : 1,
                  }}
                >
                  {t('paginationNext')}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  )
}
