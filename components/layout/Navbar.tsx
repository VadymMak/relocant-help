'use client'
import { useState, useRef, useEffect } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { Link, usePathname, useRouter } from '@/i18n/navigation'
import { features } from '@/lib/features'

export default function Navbar() {
  const t = useTranslations('nav')
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const locales = [
    { code: 'uk', label: 'UA' },
    { code: 'ru', label: 'RU' },
    { code: 'en', label: 'EN' },
  ]

  function openSearch() {
    setSearchOpen(true)
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  function closeSearch() {
    setSearchOpen(false)
    setSearchQuery('')
  }

  function submitSearch() {
    const q = searchQuery.trim()
    if (!q) { closeSearch(); return }
    router.push(`/articles?q=${encodeURIComponent(q)}` as '/articles')
    closeSearch()
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') submitSearch()
    if (e.key === 'Escape') closeSearch()
  }

  // Close on outside click
  useEffect(() => {
    if (!searchOpen) return
    function onClickOutside(e: MouseEvent) {
      const target = e.target as HTMLElement
      if (!target.closest('[data-search-widget]')) closeSearch()
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [searchOpen])

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: 'rgba(4, 44, 83, 0.98)',
      backdropFilter: 'blur(8px)', color: 'white',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
    }}>
      <div style={{
        maxWidth: 1200, margin: '0 auto', padding: '16px 24px',
        display: 'flex', alignItems: 'center', gap: 32,
      }}>
        <Link href="/" style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          fontWeight: 700, fontSize: 18, color: 'white',
          textDecoration: 'none', letterSpacing: '-0.01em', flexShrink: 0,
        }}>
          <span style={{
            width: 28, height: 28, background: 'var(--rh-teal)', borderRadius: 8,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 800, fontSize: 14,
            boxShadow: 'inset 0 -2px 0 rgba(0,0,0,0.15)',
          }}>✓</span>
          relocant.help
        </Link>

        <div style={{ display: 'flex', gap: 24, flex: 1, fontSize: 14 }}>
          {([
            { href: '/articles', label: t('articles') },
            features.specialists ? { href: '/catalog', label: t('catalog') } : null,
            { href: '/about', label: t('about') },
            { href: '/contact', label: t('contact') },
          ].filter(Boolean) as { href: string; label: string }[]).map(({ href, label }) => (
            <Link key={href} href={href as '/articles' | '/catalog' | '/about' | '/contact'} style={{
              color: 'rgba(255,255,255,0.85)', textDecoration: 'none', fontWeight: 500,
            }}>
              {label}
            </Link>
          ))}
        </div>

        {/* Search widget */}
        <div data-search-widget style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {searchOpen ? (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.25)',
              borderRadius: 'var(--rh-radius)',
              padding: '6px 10px',
            }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t('searchPlaceholder')}
                style={{
                  background: 'none', border: 'none', outline: 'none',
                  color: 'white', fontSize: 13, fontFamily: 'var(--rh-font)',
                  width: 200,
                }}
              />
              {searchQuery && (
                <button
                  onClick={submitSearch}
                  style={{
                    background: 'var(--rh-teal)', border: 'none', color: 'white',
                    borderRadius: 6, padding: '3px 10px', fontSize: 12,
                    fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
                  }}
                >
                  {t('searchBtn')}
                </button>
              )}
              <button
                onClick={closeSearch}
                style={{
                  background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)',
                  cursor: 'pointer', fontSize: 18, lineHeight: 1, padding: '0 2px',
                }}
              >
                ×
              </button>
            </div>
          ) : (
            <button
              onClick={openSearch}
              title={t('searchPlaceholder')}
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 8, width: 36, height: 36,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: 'rgba(255,255,255,0.7)',
                transition: 'background 0.15s',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </button>
          )}
        </div>

        {/* Locale switcher */}
        <div style={{
          display: 'flex', background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 'var(--rh-radius-pill)', padding: 3, flexShrink: 0,
        }}>
          {locales.map(({ code, label }) => (
            <button
              key={code}
              onClick={() => router.replace(pathname, { locale: code as 'uk' | 'ru' | 'en' })}
              style={{
                background: locale === code ? 'white' : 'transparent', border: 0,
                color: locale === code ? 'var(--rh-navy)' : 'rgba(255,255,255,0.7)',
                font: `600 12px var(--rh-font)`, padding: '5px 12px',
                borderRadius: 'var(--rh-radius-pill)', cursor: 'pointer',
                letterSpacing: '0.04em',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  )
}
