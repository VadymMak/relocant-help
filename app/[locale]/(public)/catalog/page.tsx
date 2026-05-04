import { useTranslations } from 'next-intl'
import { features } from '@/lib/features'
import { notFound } from 'next/navigation'
import { Link } from '@/i18n/navigation'

const mockSpecialists = [
  {
    id: '1', initials: 'АК', av: 'rh-av-1',
    name: 'Anna Kowalski', role: 'Immigration lawyer', city: 'Berlin', country: 'Germany', countryCode: 'DE',
    license: 'BRAK-DE-2019-44827', rating: 4.9, reviews: 127,
    tags: ['Blue Card', 'Family reunion', 'Asylum'],
    langs: ['UA', 'RU', 'DE', 'EN'], price: 150, verified: true,
    bio: 'Licensed immigration attorney with 12 years of experience helping relocants navigate German bureaucracy.',
  },
  {
    id: '2', initials: 'ДВ', av: 'rh-av-2',
    name: 'Dmytro Voloshyn', role: 'Tax accountant', city: 'Warsaw', country: 'Poland', countryCode: 'PL',
    license: 'KIBR-PL-12489', rating: 4.9, reviews: 94,
    tags: ['PIT/CIT', 'B2B contracts', 'VAT registration'],
    langs: ['UA', 'RU', 'PL', 'EN'], price: 85, verified: true,
    bio: 'Certified accountant specializing in tax compliance for Ukrainian and Russian entrepreneurs in Poland.',
  },
  {
    id: '3', initials: 'ОТ', av: 'rh-av-4',
    name: 'Olena Tkachenko', role: 'Corporate lawyer', city: 'Prague', country: 'Czechia', countryCode: 'CZ',
    license: 'ČAK-CZ-18305', rating: 5.0, reviews: 58,
    tags: ['Company setup', 'Trade license', 'Contracts'],
    langs: ['UA', 'CZ', 'EN'], price: 110, verified: true,
    bio: 'Corporate attorney helping Ukrainian entrepreneurs establish and operate businesses in the Czech Republic.',
  },
]

const countries = ['Germany', 'Poland', 'Czechia', 'Austria', 'France', 'Netherlands']
const services = ['Immigration lawyer', 'Tax accountant', 'Corporate lawyer', 'Family lawyer']

export default function CatalogPage() {
  if (!features.specialists) notFound()

  const t = useTranslations('catalog')

  return (
    <main>
      {/* Page header */}
      <section style={{ background: 'var(--rh-navy)', color: 'white', padding: '48px 24px 80px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', marginBottom: 16 }}>
            <a href="/" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>{t('breadcrumbHome')}</a>
            {' · '}{t('title')}
          </div>
          <h1 style={{ fontSize: 36, fontWeight: 700, margin: '0 0 8px', letterSpacing: '-0.02em' }}>
            {t('title')}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', margin: '0 0 32px', fontSize: 16 }}>
            {t('desc')}
          </p>

          {/* Search bar */}
          <div style={{
            background: 'white', borderRadius: 'var(--rh-radius-lg)',
            boxShadow: 'var(--rh-shadow-md)', padding: 8,
            display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 4,
          }}>
            {[
              { label: t('searchName'), placeholder: t('searchName') },
              { label: t('searchCountry'), placeholder: t('searchCountry') },
            ].map(({ label, placeholder }) => (
              <div key={label} style={{ padding: '12px 16px', borderRadius: 12, cursor: 'pointer' }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--rh-fg-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {label}
                </label>
                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--rh-fg-3)', marginTop: 2 }}>
                  {placeholder}
                </div>
              </div>
            ))}
            <div style={{ padding: '12px 16px', borderRadius: 12, cursor: 'pointer', borderLeft: '1px solid var(--rh-border)' }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--rh-fg-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {t('serviceFilter')}
              </label>
              <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--rh-fg-3)', marginTop: 2 }}>All services</div>
            </div>
            <button className="rh-btn rh-btn-primary" style={{ borderRadius: 12, padding: '0 28px' }}>
              {t('searchBtn')}
            </button>
          </div>
        </div>
      </section>

      {/* Main layout */}
      <div style={{
        maxWidth: 1280, margin: '-40px auto 80px',
        padding: '0 24px',
        display: 'grid', gridTemplateColumns: '280px 1fr', gap: 32,
        position: 'relative', zIndex: 2,
      }}>
        {/* Filters sidebar */}
        <aside style={{
          background: 'white', border: '1px solid var(--rh-border)',
          borderRadius: 'var(--rh-radius-lg)', padding: 24,
          alignSelf: 'flex-start', position: 'sticky', top: 88,
          boxShadow: 'var(--rh-shadow-xs)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{t('filters')}</h3>
            <a href="#" style={{ fontSize: 13, color: 'var(--rh-blue)', textDecoration: 'none', fontWeight: 600 }}>
              {t('resetFilters')}
            </a>
          </div>

          {/* Verified only */}
          <div style={{ padding: '16px 0', borderTop: '1px solid var(--rh-border)' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 14 }}>
              <input type="checkbox" defaultChecked style={{ width: 16, height: 16, accentColor: 'var(--rh-blue)' }} />
              {t('verifiedOnly')}
            </label>
          </div>

          {/* Country */}
          <div style={{ padding: '16px 0', borderTop: '1px solid var(--rh-border)' }}>
            <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--rh-fg)', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {t('countryFilter')}
            </h4>
            {countries.map((country) => (
              <label key={country} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', fontSize: 14, cursor: 'pointer' }}>
                <input type="checkbox" style={{ width: 16, height: 16, accentColor: 'var(--rh-blue)' }} />
                {country}
              </label>
            ))}
          </div>

          {/* Service */}
          <div style={{ padding: '16px 0', borderTop: '1px solid var(--rh-border)' }}>
            <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--rh-fg)', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {t('serviceFilter')}
            </h4>
            {services.map((service) => (
              <label key={service} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', fontSize: 14, cursor: 'pointer' }}>
                <input type="checkbox" style={{ width: 16, height: 16, accentColor: 'var(--rh-blue)' }} />
                {service}
              </label>
            ))}
          </div>

          {/* Languages */}
          <div style={{ padding: '16px 0', borderTop: '1px solid var(--rh-border)' }}>
            <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--rh-fg)', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {t('languageFilter')}
            </h4>
            {['UA', 'RU', 'EN', 'DE', 'PL'].map((lang) => (
              <label key={lang} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', fontSize: 14, cursor: 'pointer' }}>
                <input type="checkbox" style={{ width: 16, height: 16, accentColor: 'var(--rh-blue)' }} />
                {lang}
              </label>
            ))}
          </div>
        </aside>

        {/* Results */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {mockSpecialists.map((spec) => (
            <div key={spec.id} style={{
              background: 'white', border: '1px solid var(--rh-border)',
              borderRadius: 'var(--rh-radius-lg)', padding: 24,
              boxShadow: 'var(--rh-shadow-xs)',
              display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 20, alignItems: 'start',
            }}>
              {/* Avatar */}
              <div className={`rh-avatar ${spec.av}`} style={{ width: 64, height: 64, fontSize: 20 }}>
                {spec.initials}
              </div>

              {/* Info */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontWeight: 700, fontSize: 17 }}>{spec.name}</span>
                  {spec.verified && (
                    <span className="rh-badge rh-badge-verified">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
                      {t('verified')}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 14, color: 'var(--rh-fg-2)', marginBottom: 4 }}>
                  {spec.role} · {spec.city}, {spec.countryCode}
                </div>
                <div style={{ fontFamily: 'var(--rh-font-mono)', fontSize: 11, color: 'var(--rh-fg-3)', marginBottom: 12 }}>
                  License {spec.license}
                </div>
                <p style={{ fontSize: 14, color: 'var(--rh-fg-2)', margin: '0 0 12px', lineHeight: 1.5, maxWidth: 560 }}>
                  {spec.bio}
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                  {spec.tags.map((tag) => (
                    <span key={tag} style={{
                      fontSize: 12, fontWeight: 500,
                      background: 'var(--rh-bg-alt)', color: 'var(--rh-fg-2)',
                      padding: '4px 10px', borderRadius: 'var(--rh-radius-pill)',
                    }}>{tag}</span>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {spec.langs.map((lang) => (
                    <span key={lang} style={{
                      fontSize: 12, fontWeight: 600,
                      background: 'var(--rh-blue-100)', color: 'var(--rh-blue-700)',
                      padding: '3px 8px', borderRadius: 'var(--rh-radius-pill)',
                    }}>{lang}</span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 12, minWidth: 140 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 600 }}>
                  <span style={{ color: '#F59E0B' }}>★</span>
                  {spec.rating}
                  <span style={{ color: 'var(--rh-fg-3)', fontWeight: 400 }}>({spec.reviews})</span>
                </div>
                <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--rh-navy)', textAlign: 'right' }}>
                  €{spec.price}
                  <div style={{ fontSize: 12, fontWeight: 400, color: 'var(--rh-fg-3)' }}>{t('perConsultation')}</div>
                </div>
                <Link href={`/catalog/${spec.id}` as any} className="rh-btn rh-btn-primary rh-btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
                  {t('bookBtn')}
                </Link>
                <Link href={`/catalog/${spec.id}` as any} className="rh-btn rh-btn-secondary rh-btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
                  {t('viewProfile')}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
