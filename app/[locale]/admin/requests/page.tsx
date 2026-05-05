import { getTranslations } from 'next-intl/server'

export const dynamic = 'force-dynamic'

export default async function RequestsPage() {
  const t = await getTranslations('admin')

  return (
    <main style={{ padding: 32 }}>
      <div style={{
        maxWidth: 560, margin: '80px auto 0',
        background: 'white', border: '1px solid var(--rh-border)',
        borderRadius: 'var(--rh-radius-lg)', padding: '48px 40px',
        boxShadow: 'var(--rh-shadow-xs)', textAlign: 'center',
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: 16,
          background: 'var(--rh-bg-2)', border: '1px solid var(--rh-border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px',
        }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--rh-fg-3)" strokeWidth="1.5">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
          </svg>
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 10px', color: 'var(--rh-fg)' }}>
          {t('comingSoonTitle')}
        </h1>
        <p style={{ fontSize: 15, color: 'var(--rh-fg-2)', margin: '0 0 28px', lineHeight: 1.6 }}>
          {t('comingSoonDesc')}
        </p>
        <a
          href="https://vercel.com/docs/environment-variables"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'var(--rh-navy)', color: 'white',
            padding: '11px 22px', borderRadius: 'var(--rh-radius)',
            fontSize: 14, fontWeight: 600, textDecoration: 'none',
          }}
        >
          {t('comingSoonBtn')}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/>
          </svg>
        </a>
      </div>
    </main>
  )
}
