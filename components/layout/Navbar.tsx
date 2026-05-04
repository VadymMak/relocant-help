'use client'
import { useTranslations, useLocale } from 'next-intl'
import { Link, usePathname, useRouter } from '@/i18n/navigation'

export default function Navbar() {
  const t = useTranslations('nav')
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  const locales = [
    { code: 'uk', label: 'UA' },
    { code: 'ru', label: 'RU' },
    { code: 'en', label: 'EN' },
  ]

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      background: 'rgba(4, 44, 83, 0.98)',
      backdropFilter: 'blur(8px)',
      color: 'white',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
    }}>
      <div style={{
        maxWidth: 1200,
        margin: '0 auto',
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: 32,
      }}>
        <Link href="/" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          fontWeight: 700,
          fontSize: 18,
          color: 'white',
          textDecoration: 'none',
          letterSpacing: '-0.01em',
        }}>
          <span style={{
            width: 28,
            height: 28,
            background: 'var(--rh-teal)',
            borderRadius: 8,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 800,
            fontSize: 14,
            boxShadow: 'inset 0 -2px 0 rgba(0,0,0,0.15)',
          }}>✓</span>
          relocant.help
        </Link>

        <div style={{ display: 'flex', gap: 24, flex: 1, fontSize: 14 }}>
          {[
            { href: '/articles', label: t('articles') },
            { href: '/catalog', label: t('catalog') },
            { href: '/about', label: t('about') },
            { href: '/contact', label: t('contact') },
          ].map(({ href, label }) => (
            <Link key={href} href={href as '/articles' | '/catalog' | '/about' | '/contact'} style={{
              color: 'rgba(255,255,255,0.85)',
              textDecoration: 'none',
              fontWeight: 500,
            }}>
              {label}
            </Link>
          ))}
        </div>

        <div style={{
          display: 'flex',
          background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 'var(--rh-radius-pill)',
          padding: 3,
        }}>
          {locales.map(({ code, label }) => (
            <button
              key={code}
              onClick={() => router.replace(pathname, { locale: code as 'uk' | 'ru' | 'en' })}
              style={{
                background: locale === code ? 'white' : 'transparent',
                border: 0,
                color: locale === code ? 'var(--rh-navy)' : 'rgba(255,255,255,0.7)',
                font: `600 12px var(--rh-font)`,
                padding: '5px 12px',
                borderRadius: 'var(--rh-radius-pill)',
                cursor: 'pointer',
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
