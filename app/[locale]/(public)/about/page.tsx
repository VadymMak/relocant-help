import { useTranslations } from 'next-intl'

export default function AboutPage() {
  const t = useTranslations('about')

  const values = [
    {
      title: t('value1Title'),
      desc: t('value1Desc'),
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 12l2 2 4-4"/><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
      teal: true,
    },
    {
      title: t('value2Title'),
      desc: t('value2Desc'),
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>,
      teal: false,
    },
    {
      title: t('value3Title'),
      desc: t('value3Desc'),
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>,
      teal: false,
    },
    {
      title: t('value4Title'),
      desc: t('value4Desc'),
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>,
      teal: true,
    },
  ]

  return (
    <main>
      {/* Hero */}
      <section style={{ background: 'var(--rh-navy)', color: 'white', padding: '80px 24px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <h1 style={{ fontSize: 48, fontWeight: 800, letterSpacing: '-0.025em', margin: '0 0 16px', color: 'white' }}>
            {t('title')}
          </h1>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.7)', margin: 0, lineHeight: 1.55 }}>
            {t('heroDesc')}
          </p>
        </div>
      </section>

      {/* Story */}
      <section style={{ maxWidth: 800, margin: '0 auto', padding: '80px 24px' }}>
        <h2 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--rh-navy)', margin: '0 0 24px' }}>
          {t('storyTitle')}
        </h2>
        <p style={{ fontSize: 17, lineHeight: 1.7, color: 'var(--rh-fg)', margin: '0 0 16px' }}>
          {t('storyText1')}
        </p>
        <p style={{ fontSize: 17, lineHeight: 1.7, color: 'var(--rh-fg)', margin: 0 }}>
          {t('storyText2')}
        </p>
      </section>

      {/* Values */}
      <section style={{ background: 'white', borderTop: '1px solid var(--rh-border)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 24px' }}>
          <h2 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--rh-navy)', margin: '0 0 40px' }}>
            {t('valuesTitle')}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
            {values.map(({ title, desc, icon, teal }) => (
              <div key={title} style={{
                padding: 24, border: '1px solid var(--rh-border)',
                borderRadius: 'var(--rh-radius-lg)',
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: teal ? 'var(--rh-teal-100)' : 'var(--rh-blue-100)',
                  color: teal ? 'var(--rh-teal-700)' : 'var(--rh-blue)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 16,
                }}>{icon}</div>
                <h4 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 6px', color: 'var(--rh-fg)' }}>{title}</h4>
                <p style={{ fontSize: 13, color: 'var(--rh-fg-2)', margin: 0, lineHeight: 1.5 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
