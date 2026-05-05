import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'

export default async function Footer() {
  const t = await getTranslations('footer')

  return (
    <footer style={{
      background: 'var(--rh-navy-900)',
      color: 'rgba(255,255,255,0.7)',
      padding: '56px 24px 32px',
    }}>
      <div style={{
        maxWidth: 1200,
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: '1.5fr 1fr 1fr 1fr',
        gap: 48,
      }}>
        <div>
          <Link href="/" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            fontWeight: 700,
            fontSize: 18,
            color: 'white',
            textDecoration: 'none',
          }}>
            <span style={{
              width: 28, height: 28,
              background: 'var(--rh-teal)',
              borderRadius: 8,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white', fontWeight: 800, fontSize: 14,
            }}>✓</span>
            relocant.help
          </Link>
          <p style={{ fontSize: 13, lineHeight: 1.6, color: 'rgba(255,255,255,0.5)', marginTop: 12 }}>
            {t('tagline')}
          </p>
        </div>

        <div>
          <h5 style={{ color: 'white', fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 16px', fontWeight: 700 }}>
            {t('product')}
          </h5>
          {[
            { href: '/catalog', label: t('findSpecialists') },
            { href: '/#how', label: t('howItWorks') },
            { href: '/#trust', label: t('verificationPolicy') },
          ].map(({ href, label }) => (
            <Link key={href} href={href} style={{ display: 'block', color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: 14, padding: '6px 0' }}>
              {label}
            </Link>
          ))}
        </div>

        <div>
          <h5 style={{ color: 'white', fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 16px', fontWeight: 700 }}>
            {t('company')}
          </h5>
          {[
            { href: '/about', label: t('about') },
            { href: '/articles', label: t('blog') },
            { href: '/contact', label: t('contact') },
          ].map(({ href, label }) => (
            <Link key={href} href={href as '/about' | '/articles' | '/contact'} style={{ display: 'block', color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: 14, padding: '6px 0' }}>
              {label}
            </Link>
          ))}
        </div>

        <div>
          <h5 style={{ color: 'white', fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 16px', fontWeight: 700 }}>
            {t('legal')}
          </h5>
          {[
            { href: '/terms', label: t('terms') },
            { href: '/privacy', label: t('privacy') },
            { href: '/imprint', label: t('imprint') },
          ].map(({ href, label }) => (
            <a key={href} href={href} style={{ display: 'block', color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: 14, padding: '6px 0' }}>
              {label}
            </a>
          ))}
        </div>
      </div>

      <div style={{
        maxWidth: 1200,
        margin: '40px auto 0',
        paddingTop: 24,
        borderTop: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: 13,
        color: 'rgba(255,255,255,0.5)',
      }}>
        <span>{t('copyright')}</span>
        <span>{t('langs')}</span>
      </div>
    </footer>
  )
}
