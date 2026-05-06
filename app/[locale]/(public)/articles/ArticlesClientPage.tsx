'use client'

import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'
import { Link } from '@/i18n/navigation'
import type { SearchArticle } from '@/lib/types/search'
import { getLocalizedContent, getLocaleDate } from '@/lib/utils/locale-content'
import { getCountryMeta } from '@/lib/utils/countries'

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

function ArticlesClientPageInner({ articles, countries }: { articles: ArticleCardData[]; countries: string[] }) {
  const t = useTranslations('articles')
  const locale = useLocale()
  const searchParams = useSearchParams()
  const [activeFilter, setActiveFilter] = useState(searchParams.get('country') ?? 'ALL')
  const [page, setPage] = useState(1)

  // ── Search state ──────────────────────────────────────────
  const [query, setQuery] = useState(searchParams.get('q') ?? '')
  const [searchResults, setSearchResults] = useState<SearchArticle[] | null>(null)
  const [searching, setSearching] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (query.trim().length < 2) return

    debounceRef.current = setTimeout(async () => {
      setSearching(true)
      try {
        const params = new URLSearchParams({ q: query.trim(), locale })
        const res = await fetch(`/api/search?${params}`)
        if (res.ok) {
          const data = await res.json() as SearchArticle[]
          setSearchResults(data)
        }
      } catch {
        setSearchResults([])
      } finally {
        setSearching(false)
      }
    }, 300)

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [query, locale])

  function clearSearch() {
    setQuery('')
    setSearchResults(null)
  }

  function handleFilter(code: string) {
    setActiveFilter(code)
    setPage(1)
  }

  const countryTabs = [
    { label: t('filterAll'), code: 'ALL' },
    ...countries.map(c => {
      const { flag, label } = getCountryMeta(c)
      return { label: `${flag} ${label}`, code: label }
    }),
  ]

  const filtered = activeFilter === 'ALL'
    ? articles
    : articles.filter(a => a.countryCode === activeFilter)

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const isSearching = query.trim().length >= 2

  return (
    <main>
      <style>{`
        .rh-article-card:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.13); border-color: var(--rh-blue) !important; }
        .rh-search-input:focus { outline: none; border-color: var(--rh-blue) !important; box-shadow: 0 0 0 3px rgba(24,95,165,0.12); }
      `}</style>

      <section style={{ background: 'var(--rh-navy)', color: 'white', padding: '64px 24px 80px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 12 }}>
            relocant.help · {t('title')}
          </div>
          <h1 style={{ fontSize: 38, fontWeight: 700, margin: '0 0 12px', letterSpacing: '-0.02em' }}>
            {t('title')}
          </h1>
          <p style={{ margin: '0 0 28px', color: 'rgba(255,255,255,0.7)', fontSize: 17 }}>
            {t('subtitle')}
          </p>

          {/* Search bar */}
          <div style={{ position: 'relative', maxWidth: 560 }}>
            <svg
              width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="rgba(255,255,255,0.45)" strokeWidth="2"
              style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
            >
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              className="rh-search-input"
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={t('searchPlaceholder')}
              style={{
                width: '100%', boxSizing: 'border-box',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: 'var(--rh-radius)',
                padding: '13px 44px 13px 44px',
                fontSize: 15, color: 'white',
                fontFamily: 'var(--rh-font)',
              }}
            />
            {query && (
              <button
                onClick={clearSearch}
                style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'rgba(255,255,255,0.15)', border: 'none',
                  color: 'white', borderRadius: '50%', width: 22, height: 22,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', fontSize: 14, lineHeight: 1,
                }}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>
        </div>
      </section>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px 80px' }}>
        {/* Search results */}
        {isSearching ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <p style={{ fontSize: 14, color: 'var(--rh-fg-2)', margin: 0 }}>
                {searching ? (
                  <span style={{ color: 'var(--rh-fg-3)' }}>Пошук…</span>
                ) : searchResults !== null ? (
                  <span>
                    <strong style={{ color: 'var(--rh-fg)' }}>{searchResults.length}</strong>
                    {' '}{t('searchResults')}{' '}
                    <strong style={{ color: 'var(--rh-navy)' }}>«{query}»</strong>
                  </span>
                ) : null}
              </p>
              <button
                onClick={clearSearch}
                style={{
                  background: 'none', border: '1px solid var(--rh-border)',
                  borderRadius: 'var(--rh-radius-pill)', padding: '6px 14px',
                  fontSize: 13, color: 'var(--rh-fg-2)', cursor: 'pointer',
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                }}
              >
                <span>×</span> {t('searchClear')}
              </button>
            </div>

            {searchResults !== null && searchResults.length === 0 && !searching && (
              <div style={{
                background: 'white', border: '1px solid var(--rh-border)',
                borderRadius: 'var(--rh-radius-lg)', padding: 64,
                textAlign: 'center', color: 'var(--rh-fg-2)', fontSize: 16,
                boxShadow: 'var(--rh-shadow-xs)',
              }}>
                {t('searchEmpty')}
              </div>
            )}

            {searchResults && searchResults.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
                {searchResults.map(article => {
                  const { title, summary } = getLocalizedContent(article, locale)
                  const { flag, label: code } = getCountryMeta(article.country)
                  const tag = article.tags[0] ?? ''
                  const date = getLocaleDate(article.publishedAt, locale)

                  return (
                    <Link
                      key={article.id}
                      href={`/articles/${article.id}`}
                      style={{ textDecoration: 'none', color: 'inherit', display: 'flex' }}
                    >
                      <div className="rh-article-card" style={{
                        background: 'white', border: '1px solid var(--rh-border)',
                        borderRadius: 'var(--rh-radius-lg)', padding: '24px',
                        boxShadow: 'var(--rh-shadow-xs)',
                        display: 'flex', flexDirection: 'column', gap: 12, flex: 1,
                        transition: 'box-shadow 0.15s, border-color 0.15s', cursor: 'pointer',
                      }}>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 4,
                            background: 'var(--rh-bg-2)', color: 'var(--rh-fg-2)',
                            borderRadius: 'var(--rh-radius-pill)', padding: '3px 10px',
                            fontSize: 12, fontWeight: 500,
                          }}>
                            {flag} {code}
                          </span>
                          {tag && (
                            <span style={{
                              background: 'rgba(29,158,117,0.1)', color: 'var(--rh-teal)',
                              borderRadius: 'var(--rh-radius-pill)', padding: '3px 10px',
                              fontSize: 12, fontWeight: 600,
                            }}>{tag}</span>
                          )}
                          {article.vectorScore > 0 && (
                            <span style={{
                              background: 'var(--rh-blue-100)', color: 'var(--rh-blue-700)',
                              borderRadius: 'var(--rh-radius-pill)', padding: '3px 8px',
                              fontSize: 11, fontWeight: 600, marginLeft: 'auto',
                            }}>✦ AI</span>
                          )}
                        </div>
                        <h3 style={{
                          margin: 0, fontSize: 16, fontWeight: 700,
                          color: 'var(--rh-fg-1)', lineHeight: 1.4, letterSpacing: '-0.01em',
                        }}>
                          {title || 'Article'}
                        </h3>
                        <p style={{
                          margin: 0, fontSize: 14, color: 'var(--rh-fg-2)', lineHeight: 1.6,
                          display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}>
                          {summary}
                        </p>
                        <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ fontSize: 12, color: 'var(--rh-fg-3)' }}>
                            {date} · {article.sourceId}
                          </div>
                          <span style={{ fontSize: 13, color: 'var(--rh-blue)', fontWeight: 600 }}>
                            {t('readMore')}
                          </span>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </>
        ) : (
          /* Normal browse mode */
          <>
            <div style={{ display: 'flex', gap: 8, marginBottom: 36, flexWrap: 'wrap' }}>
              {countryTabs.map(({ code, label }) => (
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
                    fontSize: 13, cursor: 'pointer',
                    fontFamily: 'var(--rh-font)', transition: 'all 0.15s',
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
                      <div className="rh-article-card" style={{
                        background: 'white', border: '1px solid var(--rh-border)',
                        borderRadius: 'var(--rh-radius-lg)', padding: '24px',
                        boxShadow: 'var(--rh-shadow-xs)',
                        display: 'flex', flexDirection: 'column', gap: 12, flex: 1,
                        transition: 'box-shadow 0.15s, border-color 0.15s', cursor: 'pointer',
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
          </>
        )}
      </div>
    </main>
  )
}

import { Suspense } from 'react'

export default function ArticlesClientPage({ articles, countries }: { articles: ArticleCardData[]; countries: string[] }) {
  return (
    <Suspense>
      <ArticlesClientPageInner articles={articles} countries={countries} />
    </Suspense>
  )
}
