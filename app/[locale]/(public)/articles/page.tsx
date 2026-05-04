import { useTranslations } from 'next-intl'

export default function ArticlesPage() {
  const t = useTranslations('articles')

  return (
    <main>
      {/* Page header */}
      <section style={{ background: 'var(--rh-navy)', color: 'white', padding: '64px 24px 80px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', marginBottom: 16 }}>
            relocant.help · {t('title')}
          </div>
          <h1 style={{ fontSize: 36, fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>
            {t('title')}
          </h1>
        </div>
      </section>

      {/* Content */}
      <div style={{ maxWidth: 1200, margin: '-40px auto 80px', padding: '0 24px', position: 'relative', zIndex: 2 }}>
        <div style={{
          background: 'white', border: '1px solid var(--rh-border)',
          borderRadius: 'var(--rh-radius-lg)', padding: 48,
          boxShadow: 'var(--rh-shadow-xs)',
          textAlign: 'center',
          color: 'var(--rh-fg-2)', fontSize: 16,
        }}>
          {t('empty')}
        </div>
      </div>
    </main>
  )
}
