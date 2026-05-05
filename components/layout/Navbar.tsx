'use client'
import { useState, useEffect } from 'react'
import { useRef } from 'react'
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
  const [menuOpen, setMenuOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const locales = [
    { code: 'uk', label: 'UA' },
    { code: 'ru', label: 'RU' },
    { code: 'en', label: 'EN' },
  ]

  const navLinks = ([
    { href: '/articles', label: t('articles') },
    features.specialists ? { href: '/catalog', label: t('catalog') } : null,
    { href: '/about', label: t('about') },
    { href: '/contact', label: t('contact') },
  ].filter(Boolean)) as { href: string; label: string }[]

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

  // Close search on outside click
  useEffect(() => {
    if (!searchOpen) return
    function onClickOutside(e: MouseEvent) {
      const target = e.target as HTMLElement
      if (!target.closest('[data-search-widget]')) closeSearch()
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [searchOpen])

  // Prevent body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  return (
    <>
      <style>{`
        .rh-nav-links-desktop { display: flex; }
        .rh-nav-search { display: flex; }
        .rh-hamburger { display: none !important; }
        @media (max-width: 767px) {
          .rh-nav-links-desktop { display: none !important; }
          .rh-nav-search { display: none !important; }
          .rh-hamburger { display: inline-flex !important; }
        }
      `}</style>

      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(4, 44, 83, 0.98)',
        backdropFilter: 'blur(8px)', color: 'white',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{
          maxWidth: 1200, margin: '0 auto', padding: '14px 20px',
          display: 'flex', alignItems: 'center', gap: 24,
        }}>
          {/* Logo */}
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

          {/* Desktop nav links */}
          <div className="rh-nav-links-desktop" style={{ gap: 24, flex: 1, fontSize: 14 }}>
            {navLinks.map(({ href, label }) => (
              <Link key={href} href={href as '/articles' | '/catalog' | '/about' | '/contact'} style={{
                color: 'rgba(255,255,255,0.85)', textDecoration: 'none', fontWeight: 500,
              }}>
                {label}
              </Link>
            ))}
          </div>

          {/* Spacer on mobile */}
          <div style={{ flex: 1 }} />

          {/* Search widget (desktop only) */}
          <div className="rh-nav-search" data-search-widget style={{ alignItems: 'center', gap: 8 }}>
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

          {/* Hamburger (mobile only) */}
          <button
            className="rh-hamburger"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMenuOpen(o => !o)}
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 8, width: 36, height: 36,
              alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'white',
              fontSize: menuOpen ? 22 : 18, lineHeight: 1, flexShrink: 0,
            }}
          >
            {menuOpen ? '×' : '☰'}
          </button>

          {/* Locale switcher (always visible) */}
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
                  font: `600 12px var(--rh-font)`, padding: '5px 10px',
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

      {/* Mobile menu — backdrop + slide-in panel */}
      {menuOpen && (
        <>
          {/* Backdrop — click to close */}
          <div
            onClick={() => setMenuOpen(false)}
            style={{
              position: 'fixed', inset: 0, zIndex: 48,
              background: 'rgba(0,0,0,0.55)',
            }}
          />

          {/* Slide-in panel */}
          <div style={{
            position: 'fixed', top: 57, left: 0, right: 0, zIndex: 49,
            background: 'rgba(4, 44, 83, 0.99)',
            backdropFilter: 'blur(16px)',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
            padding: '8px 0 24px',
          }}>
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href as '/articles' | '/catalog' | '/about' | '/contact'}
                onClick={() => setMenuOpen(false)}
                style={{
                  display: 'block', color: 'rgba(255,255,255,0.9)', textDecoration: 'none',
                  fontWeight: 600, fontSize: 17,
                  padding: '16px 24px',
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                  transition: 'background 0.1s',
                }}
              >
                {label}
              </Link>
            ))}
          </div>
        </>
      )}
    </>
  )
}
