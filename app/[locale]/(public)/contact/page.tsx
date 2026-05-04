import { useTranslations } from 'next-intl'

export default function ContactPage() {
  const t = useTranslations('contact')

  return (
    <main>
      {/* Hero */}
      <section style={{ background: 'var(--rh-navy)', color: 'white', padding: '64px 24px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <h1 style={{ fontSize: 48, fontWeight: 800, letterSpacing: '-0.025em', margin: '0 0 16px', color: 'white' }}>
            {t('title')}
          </h1>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.7)', margin: 0 }}>
            {t('heroDesc')}
          </p>
        </div>
      </section>

      {/* Content */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '64px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 48, alignItems: 'start' }}>
          {/* Form */}
          <div style={{
            background: 'white', border: '1px solid var(--rh-border)',
            borderRadius: 'var(--rh-radius-lg)', padding: 40,
            boxShadow: 'var(--rh-shadow-sm)',
          }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 24px', color: 'var(--rh-fg)' }}>
              {t('formTitle')}
            </h2>
            <form style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--rh-fg)' }}>
                  {t('nameLabel')}
                </label>
                <input className="rh-input" type="text" placeholder={t('namePlaceholder')} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--rh-fg)' }}>
                  {t('emailLabel')}
                </label>
                <input className="rh-input" type="email" placeholder={t('emailPlaceholder')} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--rh-fg)' }}>
                  {t('subjectLabel')}
                </label>
                <input className="rh-input" type="text" placeholder={t('subjectPlaceholder')} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--rh-fg)' }}>
                  {t('messageLabel')}
                </label>
                <textarea
                  className="rh-input"
                  placeholder={t('messagePlaceholder')}
                  rows={5}
                  style={{ resize: 'vertical' }}
                />
              </div>
              <button type="submit" className="rh-btn rh-btn-primary" style={{ marginTop: 8 }}>
                {t('sendBtn')}
              </button>
            </form>
          </div>

          {/* Info */}
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 24px', color: 'var(--rh-fg)' }}>
              {t('infoTitle')}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                {
                  label: 'Email',
                  value: t('emailInfo'),
                  icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
                },
                {
                  label: t('telegramLabel'),
                  value: t('telegramInfo'),
                  icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>,
                },
              ].map(({ label, value, icon }) => (
                <div key={label} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 16,
                  padding: 20, background: 'white',
                  border: '1px solid var(--rh-border)',
                  borderRadius: 'var(--rh-radius-lg)',
                }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 10,
                    background: 'var(--rh-blue-100)', color: 'var(--rh-blue)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>{icon}</div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--rh-fg-3)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>
                      {label}
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--rh-fg)' }}>{value}</div>
                  </div>
                </div>
              ))}

              <div style={{
                padding: 16,
                background: 'var(--rh-teal-100)',
                borderRadius: 'var(--rh-radius)',
                fontSize: 13, color: 'var(--rh-teal-700)', fontWeight: 500,
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
                </svg>
                {t('responseTime')}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
