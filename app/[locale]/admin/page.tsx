import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'

const requests = [
  {
    id: '#R-4128', time: '2 min ago', name: 'Kateryna V.', email: 'k.volkova@gmail.com',
    av: 'rh-av-1', initials: 'КВ',
    message: '"Got Blue Card refusal last week. Need to file Widerspruch within 30 days. Speak UA/RU. Berlin-based."',
    country: '🇩🇪 Germany', aiTag: 'Visa appeal', aiSec: 'Secondary: Blue Card',
    conf: '0.94', urgency: 'High', urgencyColor: '#DC2626',
    status: 'New', statusColor: '#185FA5', matched: false,
  },
  {
    id: '#R-4127', time: '28 min ago', name: 'Дмитрий В.', email: 'd.voloshyn@proton.me',
    av: 'rh-av-2', initials: 'ДВ',
    message: '"Need to register IT B2B activity in Poland. PIT/CIT advice + VAT EU. Working RU only."',
    country: '🇵🇱 Poland', aiTag: 'Tax setup', aiSec: 'Secondary: B2B contracts',
    conf: '0.91', urgency: 'Medium', urgencyColor: '#D97706',
    status: 'New', statusColor: '#185FA5', matched: false,
  },
  {
    id: '#R-4126', time: '1 hour ago', name: 'Olena T.', email: 'olena.tk@me.com',
    av: 'rh-av-4', initials: 'ОТ',
    message: '"Setting up s.r.o. in Prague for SaaS startup. 3 founders, mix of UA and EU citizens."',
    country: '🇨🇿 Czechia', aiTag: 'Company setup', aiSec: 'Secondary: Contracts',
    conf: '0.97', urgency: 'Low', urgencyColor: '#1D9E75',
    status: 'New', statusColor: '#185FA5', matched: false,
  },
  {
    id: '#R-4125', time: '3 hours ago', name: 'Maria R.', email: 'm.reinhardt@web.de',
    av: 'rh-av-3', initials: 'МР',
    message: '"Divorce from RU citizen, two children with EU passports. Custody concerns. Vienna."',
    country: '🇦🇹 Austria', aiTag: 'Family law', aiSec: 'Secondary: Custody',
    conf: '0.89', urgency: 'High', urgencyColor: '#DC2626',
    status: 'Reviewing', statusColor: '#D97706', matched: false,
  },
  {
    id: '#R-4124', time: '5 hours ago', name: 'Iryna P.', email: 'i.petrenko@ukr.net',
    av: 'rh-av-5', initials: 'ИП',
    message: '"3 years on Aufenthaltserlaubnis, applying for Niederlassungserlaubnis."',
    country: '🇩🇪 Germany', aiTag: 'Permanent residence', aiSec: 'Secondary: Citizenship',
    conf: '0.96', urgency: 'Low', urgencyColor: '#1D9E75',
    status: 'Matched', statusColor: '#1D9E75', matched: true, matchedTo: 'Anna K.',
  },
]

export default function AdminPage() {
  const t = useTranslations('admin')

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', minHeight: '100vh', background: 'var(--rh-bg)' }}>
      {/* Sidebar */}
      <aside style={{
        background: 'var(--rh-navy)', color: 'white',
        padding: '0 0 24px 0',
        display: 'flex', flexDirection: 'column',
      }}>
        <div style={{
          padding: '24px 20px',
          display: 'flex', alignItems: 'center', gap: 8,
          fontWeight: 700, fontSize: 16,
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}>
          <span style={{
            width: 28, height: 28, background: 'var(--rh-teal)', borderRadius: 8,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, fontWeight: 800,
          }}>✓</span>
          relocant.help
        </div>

        <SidebarSection label={t('sidebarOperations')} />
        <SidebarLink icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3h18v6H3zM3 11h18v10H3z"/></svg>} label={t('sidebarDashboard')} active />
        <SidebarLink icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>} label={t('sidebarRequests')} badge="12" />
        <SidebarLink icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>} label={t('sidebarSpecialists')} />
        <SidebarLink icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>} label={t('sidebarBookings')} />

        <SidebarSection label={t('sidebarNetwork')} />
        <SidebarLink icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 12l2 2 4-4"/><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>} label={t('sidebarVerifications')} />
        <SidebarLink icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg>} label={t('sidebarReviews')} />

        <SidebarSection label={t('sidebarSettings')} />
        <SidebarLink icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06A1.65 1.65 0 004.6 9a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9"/></svg>} label={t('sidebarConfig')} />
      </aside>

      {/* Main */}
      <main style={{ padding: '32px', overflow: 'auto' }}>
        {/* Top row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 4px', color: 'var(--rh-fg)' }}>{t('title')}</h1>
            <p style={{ fontSize: 14, color: 'var(--rh-fg-2)', margin: 0 }}>{t('subtitle')}</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              className="rh-input"
              placeholder={t('search')}
              style={{ width: 280, fontSize: 13, padding: '8px 12px' }}
            />
            <button className="rh-btn rh-btn-secondary rh-btn-sm">{t('exportCSV')}</button>
            <button className="rh-btn rh-btn-primary rh-btn-sm">{t('newSpecialist')}</button>
          </div>
        </div>

        {/* Metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
          {[
            { label: t('metricsRequests'), value: '186', trend: '↑ 18%', up: true, color: 'var(--rh-blue-100)', iconColor: 'var(--rh-blue)' },
            { label: t('metricsMatchRate'), value: '94%', trend: '↑ 2.1pt', up: true, color: 'var(--rh-teal-100)', iconColor: 'var(--rh-teal)' },
            { label: t('metricsAvgTime'), value: '11h', trend: '↓ 3h faster', up: false, color: 'var(--rh-warning-100)', iconColor: 'var(--rh-warning)' },
            { label: t('metricsGMV'), value: '€48.2k', trend: '↑ 24%', up: true, color: 'var(--rh-bg-alt)', iconColor: 'var(--rh-fg-2)' },
          ].map(({ label, value, trend, up, color, iconColor }) => (
            <div key={label} style={{
              background: 'white', border: '1px solid var(--rh-border)',
              borderRadius: 'var(--rh-radius-lg)', padding: 20,
              boxShadow: 'var(--rh-shadow-xs)',
            }}>
              <div style={{ fontSize: 12, color: 'var(--rh-fg-2)', marginBottom: 8, fontWeight: 600 }}>{label}</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--rh-fg)', letterSpacing: '-0.02em', marginBottom: 4 }}>{value}</div>
              <div style={{ fontSize: 12, color: up ? 'var(--rh-teal)' : 'var(--rh-warning)', fontWeight: 600 }}>{trend}</div>
            </div>
          ))}
        </div>

        {/* Two-col layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24 }}>
          {/* Requests table */}
          <div style={{
            background: 'white', border: '1px solid var(--rh-border)',
            borderRadius: 'var(--rh-radius-lg)', overflow: 'hidden',
          }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--rh-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 2px' }}>{t('requestsTitle')}</h2>
                <p style={{ fontSize: 13, color: 'var(--rh-fg-2)', margin: 0 }}>{t('requestsDesc')}</p>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {[
                  { label: t('filterNew'), count: 12, active: true },
                  { label: t('filterInProgress'), count: 8 },
                  { label: t('filterMatched'), count: 23 },
                ].map(({ label, count, active }) => (
                  <button key={label} style={{
                    background: active ? 'var(--rh-blue-100)' : 'transparent',
                    color: active ? 'var(--rh-blue-700)' : 'var(--rh-fg-2)',
                    border: '1px solid ' + (active ? 'var(--rh-blue-100)' : 'var(--rh-border)'),
                    borderRadius: 'var(--rh-radius-pill)', padding: '5px 12px',
                    fontSize: 13, fontWeight: 600, cursor: 'pointer',
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                  }}>
                    {label}
                    <span style={{
                      background: active ? 'var(--rh-blue-700)' : 'var(--rh-border)',
                      color: active ? 'white' : 'var(--rh-fg-2)',
                      borderRadius: 10, padding: '1px 7px', fontSize: 11,
                    }}>{count}</span>
                  </button>
                ))}
              </div>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--rh-border)', background: 'var(--rh-bg)' }}>
                    {['ID', 'Relocant', 'Message', 'Country', 'AI classification', 'Status', ''].map((h) => (
                      <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 700, fontSize: 11, color: 'var(--rh-fg-3)', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {requests.map((req) => (
                    <tr key={req.id} style={{ borderBottom: '1px solid var(--rh-border)' }}>
                      <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                        <span style={{ fontFamily: 'var(--rh-font-mono)', fontSize: 12, fontWeight: 700, color: 'var(--rh-fg)' }}>{req.id}</span>
                        <div style={{ fontSize: 11, color: 'var(--rh-fg-3)', marginTop: 2 }}>{req.time}</div>
                      </td>
                      <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div className={`rh-avatar ${req.av}`} style={{ width: 32, height: 32, fontSize: 11 }}>{req.initials}</div>
                          <div>
                            <div style={{ fontWeight: 600 }}>{req.name}</div>
                            <div style={{ fontSize: 11, color: 'var(--rh-fg-3)' }}>{req.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px', maxWidth: 220 }}>
                        <div style={{ fontSize: 12, color: 'var(--rh-fg-2)', lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                          {req.message}
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px', whiteSpace: 'nowrap', fontSize: 13 }}>{req.country}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          background: 'var(--rh-blue-100)', color: 'var(--rh-blue-700)',
                          borderRadius: 'var(--rh-radius-pill)', padding: '3px 10px',
                          fontSize: 12, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4,
                        }}>
                          ✦ {req.aiTag}
                        </span>
                        <div style={{ fontSize: 11, color: 'var(--rh-fg-3)', marginTop: 3 }}>{req.aiSec}</div>
                        <div style={{ fontSize: 11, color: 'var(--rh-fg-3)', marginTop: 1 }}>
                          conf. {req.conf} ·{' '}
                          <span style={{ color: req.urgencyColor, fontWeight: 600 }}>{req.urgency}</span>
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 6,
                          background: req.status === 'Matched' ? 'var(--rh-teal-100)' : req.status === 'Reviewing' ? 'var(--rh-warning-100)' : 'var(--rh-blue-100)',
                          color: req.status === 'Matched' ? 'var(--rh-teal-700)' : req.status === 'Reviewing' ? 'var(--rh-warning)' : 'var(--rh-blue-700)',
                          borderRadius: 'var(--rh-radius-pill)', padding: '4px 10px', fontSize: 12, fontWeight: 600,
                        }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', flexShrink: 0 }} />
                          {req.status}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        {req.matched ? (
                          <span style={{
                            background: 'var(--rh-teal-100)', color: 'var(--rh-teal-700)',
                            padding: '8px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                          }}>✓ {req.matchedTo}</span>
                        ) : (
                          <button style={{
                            background: 'var(--rh-blue)', color: 'white', border: 0,
                            padding: '8px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                            cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6,
                          }}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: 14, height: 14 }}>
                              <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                            Match
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right rail */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{
              background: 'white', border: '1px solid var(--rh-border)',
              borderRadius: 'var(--rh-radius-lg)', padding: 20,
            }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 12px', color: 'var(--rh-navy)' }}>{t('weekTitle')}</h3>
              {[
                { label: t('weekRequests'), value: '42' },
                { label: t('weekMatched'), value: '39' },
                { label: t('weekBookings'), value: '28' },
                { label: t('weekRating'), value: '4.87 ★' },
                { label: t('weekSpecialists'), value: '+2' },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderTop: '1px solid var(--rh-border)', fontSize: 13 }}>
                  <span style={{ flex: 1, color: 'var(--rh-fg-2)' }}>{label}</span>
                  <span style={{ fontWeight: 700, color: 'var(--rh-fg)' }}>{value}</span>
                </div>
              ))}
            </div>

            <div style={{
              background: 'white', border: '1px solid var(--rh-border)',
              borderRadius: 'var(--rh-radius-lg)', padding: 20,
            }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 12px', color: 'var(--rh-navy)' }}>{t('aiTitle')}</h3>
              {[
                { label: 'Immigration', value: '38%' },
                { label: 'Tax / Accounting', value: '29%' },
                { label: 'Company setup', value: '14%' },
                { label: 'Family law', value: '9%' },
                { label: 'Other', value: '10%' },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderTop: '1px solid var(--rh-border)', fontSize: 13 }}>
                  <span style={{ flex: 1, color: 'var(--rh-fg-2)' }}>{label}</span>
                  <span style={{ fontWeight: 700, color: 'var(--rh-fg)' }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

function SidebarSection({ label }: { label: string }) {
  return (
    <div style={{ padding: '16px 20px 8px', fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
      {label}
    </div>
  )
}

function SidebarLink({ icon, label, active, badge }: { icon: React.ReactNode; label: string; active?: boolean; badge?: string }) {
  return (
    <a style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '10px 20px', cursor: 'pointer', textDecoration: 'none',
      color: active ? 'white' : 'rgba(255,255,255,0.65)',
      background: active ? 'rgba(255,255,255,0.08)' : 'transparent',
      borderLeft: active ? '2px solid var(--rh-teal)' : '2px solid transparent',
      fontSize: 14, fontWeight: active ? 600 : 400,
    }}>
      <span style={{ width: 18, height: 18, flexShrink: 0 }}>{icon}</span>
      <span style={{ flex: 1 }}>{label}</span>
      {badge && (
        <span style={{
          background: 'var(--rh-blue)', color: 'white',
          borderRadius: 10, padding: '1px 7px', fontSize: 11, fontWeight: 700,
        }}>{badge}</span>
      )}
    </a>
  )
}
