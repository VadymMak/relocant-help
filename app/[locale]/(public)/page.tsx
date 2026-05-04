import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'

const specialists = [
  {
    id: '1',
    initials: 'АК',
    av: 'rh-av-1',
    name: 'Anna Kowalski',
    role: 'Immigration lawyer',
    city: 'Berlin, DE',
    flag: '🇩🇪',
    license: 'BRAK-DE-2019-44827',
    rating: 4.9,
    reviews: 127,
    tags: ['Blue Card', 'Family reunion', 'Asylum'],
    langs: ['🇺🇦 UA', '🇷🇺 RU', '🇩🇪 DE', '🇬🇧 EN'],
    price: 150,
  },
  {
    id: '2',
    initials: 'ДВ',
    av: 'rh-av-2',
    name: 'Dmytro Voloshyn',
    role: 'Tax accountant',
    city: 'Warsaw, PL',
    flag: '🇵🇱',
    license: 'KIBR-PL-12489',
    rating: 4.9,
    reviews: 94,
    tags: ['PIT/CIT', 'B2B contracts', 'VAT registration'],
    langs: ['🇺🇦 UA', '🇷🇺 RU', '🇵🇱 PL', '🇬🇧 EN'],
    price: 85,
  },
  {
    id: '3',
    initials: 'ОТ',
    av: 'rh-av-4',
    name: 'Olena Tkachenko',
    role: 'Corporate lawyer',
    city: 'Prague, CZ',
    flag: '🇨🇿',
    license: 'ČAK-CZ-18305',
    rating: 5.0,
    reviews: 58,
    tags: ['Company setup', 'Trade license', 'Contracts'],
    langs: ['🇺🇦 UA', '🇨🇿 CZ', '🇬🇧 EN'],
    price: 110,
  },
]

export default function HomePage() {
  const t = useTranslations('home')

  return (
    <main>
      {/* Hero */}
      <section style={{
        background: `
          radial-gradient(ellipse 80% 60% at 80% 0%, rgba(24,95,165,0.35), transparent 60%),
          radial-gradient(ellipse 60% 50% at 0% 100%, rgba(29,158,117,0.18), transparent 60%),
          var(--rh-navy)
        `,
        color: 'white',
        padding: '80px 24px 120px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Grid overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)
          `,
          backgroundSize: '64px 64px',
          maskImage: 'radial-gradient(ellipse 70% 80% at 50% 30%, black, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse 70% 80% at 50% 30%, black, transparent 80%)',
          pointerEvents: 'none',
        }} />

        <div style={{
          maxWidth: 1200, margin: '0 auto',
          position: 'relative', zIndex: 1,
          display: 'grid',
          gridTemplateColumns: '1.4fr 1fr',
          gap: 56,
          alignItems: 'center',
        }}>
          <div>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(29,158,117,0.15)',
              border: '1px solid rgba(29,158,117,0.35)',
              padding: '6px 14px', borderRadius: 'var(--rh-radius-pill)',
              fontSize: 13, fontWeight: 600, color: '#6FCFA9',
            }}>
              <span style={{
                width: 6, height: 6, borderRadius: '50%',
                background: '#6FCFA9',
                boxShadow: '0 0 0 4px rgba(111,207,169,0.2)',
              }} />
              {t('eyebrow')}
            </span>

            <h1 style={{
              fontSize: 56, fontWeight: 800, lineHeight: 1.05,
              letterSpacing: '-0.025em',
              margin: '16px 0 20px',
            }}>
              {t('title')}{' '}
              <span style={{ color: '#6FCFA9' }}>{t('titleAccent')}</span>
            </h1>

            <p style={{
              fontSize: 18, lineHeight: 1.55,
              color: 'rgba(255,255,255,0.75)',
              maxWidth: 540, margin: '0 0 32px',
            }}>
              {t('subtitle')}
            </p>

            {/* Search card */}
            <div style={{
              background: 'white',
              borderRadius: 'var(--rh-radius-lg)',
              boxShadow: 'var(--rh-shadow-lg)',
              padding: 8,
              display: 'grid',
              gridTemplateColumns: '1fr 1fr auto',
              gap: 4,
              maxWidth: 600,
            }}>
              <div style={{ padding: '12px 16px', borderRadius: 12, display: 'flex', flexDirection: 'column', gap: 2, cursor: 'pointer' }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--rh-fg-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {t('searchCountryLabel')}
                </label>
                <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--rh-fg)' }}>
                  {t('searchCountryValue')}
                </span>
              </div>
              <div style={{ padding: '12px 16px', borderRadius: 12, display: 'flex', flexDirection: 'column', gap: 2, cursor: 'pointer', borderLeft: '1px solid var(--rh-border)' }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--rh-fg-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {t('searchServiceLabel')}
                </label>
                <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--rh-fg)' }}>
                  {t('searchServiceValue')}
                </span>
              </div>
              <Link href="/catalog" style={{
                background: 'var(--rh-blue)', color: 'white', border: '1px solid transparent',
                padding: '0 24px', borderRadius: 12,
                fontWeight: 600, fontSize: 15,
                display: 'inline-flex', alignItems: 'center', gap: 8,
                textDecoration: 'none',
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                {t('searchBtn')}
              </Link>
            </div>
          </div>

          {/* Floating specialist cards */}
          <div style={{ position: 'relative', height: 460 }}>
            {/* Card 1 */}
            <div style={{
              position: 'absolute', top: 20, right: 0, width: 320,
              background: 'white', borderRadius: 'var(--rh-radius-lg)',
              boxShadow: 'var(--rh-shadow-lg)', padding: 20, color: 'var(--rh-fg)',
              transform: 'rotate(2deg)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div className="rh-avatar rh-av-1" style={{ width: 44, height: 44, fontSize: 14 }}>АК</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>Anna Kowalski</div>
                  <div style={{ fontSize: 12, color: 'var(--rh-fg-2)' }}>Immigration lawyer · Berlin</div>
                </div>
              </div>
              <span className="rh-badge rh-badge-verified">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
                Verified · BRAK 2019
              </span>
            </div>
            {/* Card 2 */}
            <div style={{
              position: 'absolute', top: 180, left: 0, width: 300,
              background: 'white', borderRadius: 'var(--rh-radius-lg)',
              boxShadow: 'var(--rh-shadow-lg)', padding: 20, color: 'var(--rh-fg)',
              transform: 'rotate(-3deg)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div className="rh-avatar rh-av-2" style={{ width: 44, height: 44, fontSize: 14 }}>ДВ</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>Dmytro Voloshyn</div>
                  <div style={{ fontSize: 12, color: 'var(--rh-fg-2)' }}>Tax accountant · Warsaw</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, fontSize: 12, color: 'var(--rh-fg-2)', alignItems: 'center' }}>
                <span style={{ color: '#F59E0B' }}>★</span><strong style={{ color: 'var(--rh-fg)' }}>4.9</strong>
                <span>·</span><span>UA RU PL EN</span>
              </div>
            </div>
            {/* Card 3 */}
            <div style={{
              position: 'absolute', bottom: 0, right: 30, width: 280,
              background: 'white', borderRadius: 'var(--rh-radius-lg)',
              boxShadow: 'var(--rh-shadow-lg)', padding: 20, color: 'var(--rh-fg)',
              transform: 'rotate(1deg)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div className="rh-avatar rh-av-3" style={{ width: 44, height: 44, fontSize: 14 }}>МР</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>Maria Reinhardt</div>
                  <div style={{ fontSize: 12, color: 'var(--rh-fg-2)' }}>Family lawyer · Vienna</div>
                </div>
              </div>
              <div style={{ fontSize: 12, color: 'var(--rh-fg-2)' }}>
                <strong style={{ color: 'var(--rh-fg)', fontSize: 15 }}>€120</strong>
                <small style={{ color: 'var(--rh-fg-3)' }}>/consultation</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <div style={{
        background: 'white',
        border: '1px solid var(--rh-border)',
        borderRadius: 'var(--rh-radius-lg)',
        maxWidth: 1200, margin: '-56px auto 0',
        position: 'relative', zIndex: 2,
        boxShadow: 'var(--rh-shadow-md)',
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', padding: '32px 16px' }}>
          {[
            { num: '6M+', label: t('statsRelocants') },
            { num: '47', label: t('statsSpecialists'), accent: true },
            { num: '94%', label: t('statsSuccess') },
            { num: '14', label: t('statsCountries') },
          ].map(({ num, label, accent }, i) => (
            <div key={i} style={{
              textAlign: 'center',
              borderRight: i < 3 ? '1px solid var(--rh-border)' : undefined,
              padding: '0 16px',
            }}>
              <div style={{
                fontSize: 36, fontWeight: 800,
                color: accent ? 'var(--rh-teal)' : 'var(--rh-navy)',
                letterSpacing: '-0.02em', lineHeight: 1,
              }}>{num}</div>
              <div style={{ fontSize: 13, color: 'var(--rh-fg-2)', marginTop: 6 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Top specialists */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 32 }}>
          <div>
            <h2 style={{ fontSize: 36, fontWeight: 700, letterSpacing: '-0.02em', margin: 0, color: 'var(--rh-navy)' }}>
              {t('topTitle')}
            </h2>
            <p style={{ fontSize: 16, color: 'var(--rh-fg-2)', margin: '8px 0 0', maxWidth: 520 }}>
              {t('topDesc')}
            </p>
          </div>
          <Link href="/catalog" style={{ color: 'var(--rh-blue)', fontWeight: 600, textDecoration: 'none', fontSize: 14, whiteSpace: 'nowrap' }}>
            {t('topBrowse')}
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          {specialists.map((spec) => (
            <article key={spec.id} style={{
              background: 'white',
              border: '1px solid var(--rh-border)',
              borderRadius: 'var(--rh-radius-lg)',
              padding: 24,
              display: 'flex', flexDirection: 'column', gap: 16,
              cursor: 'pointer',
              transition: 'border-color 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease',
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <div className={`rh-avatar ${spec.av}`} style={{ width: 56, height: 56, fontSize: 18 }}>
                  {spec.initials}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: 16, marginBottom: 2 }}>
                    {spec.name}
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{ color: 'var(--rh-teal)', flexShrink: 0 }}>
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                    </svg>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--rh-fg-2)' }}>{spec.role} · {spec.city}</div>
                  <div style={{ fontFamily: 'var(--rh-font-mono)', fontSize: 11, color: 'var(--rh-fg-3)', marginTop: 2 }}>
                    License {spec.license}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 600, flexShrink: 0 }}>
                  <span style={{ color: '#F59E0B' }}>★</span>
                  {spec.rating}
                  <span style={{ color: 'var(--rh-fg-3)', fontWeight: 400 }}>({spec.reviews})</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {spec.tags.map((tag) => (
                  <span key={tag} style={{
                    fontSize: 12, fontWeight: 500,
                    background: 'var(--rh-bg-alt)', color: 'var(--rh-fg-2)',
                    padding: '4px 10px', borderRadius: 'var(--rh-radius-pill)',
                  }}>{tag}</span>
                ))}
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {spec.langs.map((lang) => (
                  <span key={lang} style={{
                    fontSize: 12, fontWeight: 500,
                    background: 'var(--rh-bg-alt)', color: 'var(--rh-fg-2)',
                    padding: '4px 10px', borderRadius: 'var(--rh-radius-pill)',
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                  }}>{lang}</span>
                ))}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 16, borderTop: '1px solid var(--rh-border)' }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--rh-navy)' }}>
                  €{spec.price} <small style={{ fontWeight: 500, fontSize: 12, color: 'var(--rh-fg-3)' }}>{t('perConsultation')}</small>
                </div>
                <Link href={`/catalog/${spec.id}` as any} className="rh-btn rh-btn-primary rh-btn-sm">
                  {t('bookBtn')}
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section style={{ background: 'var(--rh-navy)', color: 'white', padding: '80px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h2 style={{ fontSize: 36, fontWeight: 700, letterSpacing: '-0.02em', margin: '0 0 8px', color: 'white' }}>
            {t('howTitle')}
          </h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.65)', margin: 0 }}>
            {t('howDesc')}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, marginTop: 40 }}>
            {[
              { num: '1', title: t('step1Title'), desc: t('step1Desc') },
              { num: '2', title: t('step2Title'), desc: t('step2Desc') },
              { num: '3', title: t('step3Title'), desc: t('step3Desc') },
            ].map(({ num, title, desc }) => (
              <div key={num} style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 'var(--rh-radius-lg)',
                padding: 28,
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: 'rgba(29,158,117,0.18)',
                  color: '#6FCFA9',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, marginBottom: 16,
                }}>{num}</div>
                <h3 style={{ fontSize: 18, fontWeight: 600, margin: '0 0 8px', color: 'white' }}>{title}</h3>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', margin: 0, lineHeight: 1.55 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust */}
      <section style={{ background: 'white', borderTop: '1px solid var(--rh-border)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 24px' }}>
          <h2 style={{ fontSize: 36, fontWeight: 700, letterSpacing: '-0.02em', margin: '0 0 8px', color: 'var(--rh-navy)' }}>
            {t('trustTitle')}
          </h2>
          <p style={{ fontSize: 16, color: 'var(--rh-fg-2)', margin: '0 0 40px' }}>
            {t('trustDesc')}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
            {[
              { title: t('trust1Title'), desc: t('trust1Desc'), teal: true,
                icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 12l2 2 4-4"/><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> },
              { title: t('trust2Title'), desc: t('trust2Desc'), teal: false,
                icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 8h14M5 16h14M9 4l-2 16M17 4l-2 16"/></svg> },
              { title: t('trust3Title'), desc: t('trust3Desc'), teal: false,
                icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg> },
              { title: t('trust4Title'), desc: t('trust4Desc'), teal: true,
                icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg> },
            ].map(({ title, desc, teal, icon }) => (
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
                <h4 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 6px' }}>{title}</h4>
                <p style={{ fontSize: 13, color: 'var(--rh-fg-2)', margin: 0, lineHeight: 1.5 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px 80px' }}>
        <div style={{
          background: 'linear-gradient(135deg, var(--rh-navy), var(--rh-blue))',
          borderRadius: 'var(--rh-radius-xl)',
          padding: 56, color: 'white',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: '-40%', right: '-10%',
            width: 360, height: 360,
            background: 'radial-gradient(circle, rgba(29,158,117,0.4), transparent 70%)',
            pointerEvents: 'none',
          }} />
          <h2 style={{ fontSize: 32, fontWeight: 700, margin: '0 0 12px', color: 'white', letterSpacing: '-0.02em', maxWidth: 560 }}>
            {t('ctaTitle')}
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', margin: '0 0 24px', fontSize: 15, maxWidth: 480 }}>
            {t('ctaDesc')}
          </p>
          <div style={{ display: 'flex', gap: 12 }}>
            <Link href="/contact" style={{
              display: 'inline-flex', alignItems: 'center',
              background: 'var(--rh-teal)', color: 'white',
              border: '1px solid transparent',
              padding: '16px 28px', borderRadius: 'var(--rh-radius)', fontSize: 16, fontWeight: 600,
              textDecoration: 'none', whiteSpace: 'nowrap',
            }}>
              {t('ctaBtn')}
            </Link>
            <Link href="/catalog" style={{
              display: 'inline-flex', alignItems: 'center',
              background: 'transparent', color: 'white',
              border: '1px solid rgba(255,255,255,0.3)',
              padding: '16px 28px', borderRadius: 'var(--rh-radius)', fontSize: 16, fontWeight: 600,
              textDecoration: 'none', whiteSpace: 'nowrap',
            }}>
              {t('ctaCatalog')}
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
