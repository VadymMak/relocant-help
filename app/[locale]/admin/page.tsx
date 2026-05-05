import { getTranslations } from 'next-intl/server'
import { getPrisma } from '@/lib/db'
import CrawlerSection from './CrawlerSection'

export const dynamic = 'force-dynamic'

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

export default async function AdminPage() {
  const t = await getTranslations('admin')

  const [pending, approved, rejected, lastRun] = await Promise.all([
    getPrisma().crawledArticle.count({ where: { status: 'pending_review' } }),
    getPrisma().crawledArticle.count({ where: { status: 'approved' } }),
    getPrisma().crawledArticle.count({ where: { status: 'rejected' } }),
    getPrisma().crawlerLog.findFirst({ orderBy: { runAt: 'desc' } }),
  ])

  const lastRunSerialized = lastRun ? {
    createdAt: lastRun.runAt?.toISOString() ?? null,
    status: lastRun.status,
    articlesFound: lastRun.articlesFound,
    articlesRelevant: lastRun.articlesRelevant,
  } : null

  return (
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
          { label: t('metricsRequests'), value: '186', trend: '↑ 18%', up: true },
          { label: t('metricsMatchRate'), value: '94%', trend: '↑ 2.1pt', up: true },
          { label: t('metricsAvgTime'), value: '11h', trend: '↓ 3h faster', up: false },
          { label: t('metricsGMV'), value: '€48.2k', trend: '↑ 24%', up: true },
        ].map(({ label, value, trend, up }) => (
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

      {/* Crawler section */}
      <CrawlerSection
        lastRun={lastRunSerialized}
        stats={{ pending, approved, rejected }}
      />

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
                        }}>✓ {(req as typeof req & { matchedTo?: string }).matchedTo}</span>
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
  )
}
