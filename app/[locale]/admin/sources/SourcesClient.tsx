'use client'

import { useState } from 'react'

export interface SourceRow {
  id: string
  name: string
  country: string
  flag: string
  url: string
  rssUrl: string | null
  active: boolean
  isOverridden: boolean
  isCustom: boolean
  articleCount: number
  lastRun: {
    runAt: string | null
    status: string | null
    error: string | null
  } | null
}

interface CheckStatus {
  checking: boolean
  ok?: boolean
  statusCode?: number
  error?: string
}

interface FixResult {
  sourceId: string
  sourceName: string
  oldUrl: string
  newUrl: string | null
  fixed: boolean
  error?: string
}

interface FixResponse {
  fixed: number
  total: number
  results: FixResult[]
}

interface AddSourceForm {
  url: string
  country: string
  name: string
  sourceType: string
  checkIntervalHours: number
}

interface AddSourceResult {
  success?: boolean
  error?: string
  detectedName?: string
  hasRss?: boolean
  rssUrl?: string | null
  sourceId?: string
}

const COUNTRIES = [
  'Slovakia', 'Poland', 'Germany', 'Czech Republic', 'Spain',
  'Italy', 'Romania', 'Bulgaria', 'Portugal', 'Turkey', 'European Union', 'Other',
]

export default function SourcesClient({ sources: initial }: { sources: SourceRow[] }) {
  const [sources] = useState(initial)
  const [checkStatus, setCheckStatus] = useState<Record<string, CheckStatus>>({})
  const [fixing, setFixing] = useState(false)
  const [fixResults, setFixResults] = useState<FixResponse | null>(null)

  const [form, setForm] = useState<AddSourceForm>({
    url: '', country: 'European Union', name: '', sourceType: 'scrape', checkIntervalHours: 24,
  })
  const [adding, setAdding] = useState(false)
  const [addResult, setAddResult] = useState<AddSourceResult | null>(null)

  async function handleAddSource(e: React.FormEvent) {
    e.preventDefault()
    if (!form.url.trim()) return
    setAdding(true)
    setAddResult(null)
    try {
      const res = await fetch('/api/admin/add-source', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json() as AddSourceResult
      setAddResult(data)
      if (data.success) {
        setForm({ url: '', country: 'European Union', name: '', sourceType: 'scrape', checkIntervalHours: 24 })
      }
    } catch {
      setAddResult({ error: 'Network error' })
    } finally {
      setAdding(false)
    }
  }

  async function checkUrl(sourceId: string, url: string) {
    setCheckStatus(prev => ({ ...prev, [sourceId]: { checking: true } }))
    try {
      const res = await fetch('/api/admin/check-source', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })
      const data = await res.json() as { ok: boolean; status: number; error?: string }
      setCheckStatus(prev => ({
        ...prev,
        [sourceId]: { checking: false, ok: data.ok, statusCode: data.status, error: data.error },
      }))
    } catch {
      setCheckStatus(prev => ({ ...prev, [sourceId]: { checking: false, ok: false, error: 'Network error' } }))
    }
  }

  async function checkAll() {
    for (const source of sources) {
      await checkUrl(source.id, source.url)
    }
  }

  async function autoFix() {
    setFixing(true)
    setFixResults(null)
    try {
      const res = await fetch('/api/admin/fix-sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      const data = await res.json() as FixResponse
      setFixResults(data)
    } catch {
      setFixResults({ fixed: 0, total: 0, results: [{ sourceId: '', sourceName: '', oldUrl: '', newUrl: null, fixed: false, error: 'Network error' }] })
    } finally {
      setFixing(false)
    }
  }

  const broken = Object.values(checkStatus).filter(s => !s.checking && s.ok === false).length

  return (
    <main style={{ padding: '32px', maxWidth: 1300, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 4px', color: 'var(--rh-fg)' }}>
            Crawler Sources
          </h1>
          <p style={{ fontSize: 14, color: 'var(--rh-fg-2)', margin: 0 }}>
            {sources.length} sources · {sources.filter(s => s.isOverridden).length} with DB overrides
            {broken > 0 && <span style={{ color: 'var(--rh-warning)', fontWeight: 600, marginLeft: 8 }}>· {broken} broken URLs detected</span>}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={checkAll}
            style={{
              background: 'white', color: 'var(--rh-fg)',
              border: '1px solid var(--rh-border)',
              borderRadius: 'var(--rh-radius-md)', padding: '9px 18px',
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}
          >
            Check All URLs
          </button>
          <button
            onClick={autoFix}
            disabled={fixing}
            style={{
              background: fixing ? 'var(--rh-bg-alt)' : 'var(--rh-teal)',
              color: fixing ? 'var(--rh-fg-2)' : 'white',
              border: 0, borderRadius: 'var(--rh-radius-md)',
              padding: '9px 18px', fontSize: 13, fontWeight: 700,
              cursor: fixing ? 'default' : 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 8,
            }}
          >
            {fixing ? (
              <>
                <span style={{
                  display: 'inline-block', width: 12, height: 12,
                  border: '2px solid var(--rh-fg-3)', borderTopColor: 'transparent',
                  borderRadius: '50%', animation: 'spin 0.7s linear infinite',
                }} />
                Auto-fixing...
              </>
            ) : '✨ Auto-fix Broken URLs'}
          </button>
        </div>
      </div>

      {/* Fix results banner */}
      {fixResults && (
        <div style={{
          background: fixResults.fixed > 0 ? 'var(--rh-teal-100)' : 'var(--rh-warning-100)',
          border: '1px solid ' + (fixResults.fixed > 0 ? 'var(--rh-teal)' : 'var(--rh-warning)'),
          borderRadius: 'var(--rh-radius-md)', padding: '16px 20px', marginBottom: 20,
        }}>
          <div style={{ fontWeight: 700, marginBottom: 8, color: fixResults.fixed > 0 ? 'var(--rh-teal-700)' : 'var(--rh-warning)' }}>
            Fixed {fixResults.fixed} of {fixResults.total} sources
          </div>
          {fixResults.results.filter(r => r.fixed).map(r => (
            <div key={r.sourceId} style={{ fontSize: 13, marginBottom: 4 }}>
              <strong>{r.sourceName}</strong>: <span style={{ textDecoration: 'line-through', color: 'var(--rh-fg-3)' }}>{r.oldUrl}</span>
              {' → '}
              <a href={r.newUrl!} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--rh-blue)', fontWeight: 600 }}>{r.newUrl}</a>
            </div>
          ))}
          {fixResults.results.filter(r => !r.fixed && r.error).map(r => (
            <div key={r.sourceId} style={{ fontSize: 13, color: 'var(--rh-warning)', marginBottom: 4 }}>
              <strong>{r.sourceName}</strong>: {r.error}
            </div>
          ))}
        </div>
      )}

      {/* Table */}
      <div style={{
        background: 'white', border: '1px solid var(--rh-border)',
        borderRadius: 'var(--rh-radius-lg)', overflow: 'hidden',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: 'var(--rh-bg)', borderBottom: '1px solid var(--rh-border)' }}>
              {['Source', 'URL', 'Articles', 'Last Run', 'URL Status', 'Actions'].map(h => (
                <th key={h} style={{
                  padding: '12px 16px', textAlign: 'left',
                  fontWeight: 700, fontSize: 11, color: 'var(--rh-fg-3)',
                  textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap',
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sources.map(source => {
              const check = checkStatus[source.id]
              return (
                <tr key={source.id} style={{ borderBottom: '1px solid var(--rh-border)' }}>
                  {/* Source */}
                  <td style={{ padding: '14px 16px', minWidth: 200 }}>
                    <div style={{ fontWeight: 600, color: 'var(--rh-fg)', marginBottom: 2 }}>
                      {source.flag} {source.name}
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                      <span style={{
                        background: 'var(--rh-bg-alt)', color: 'var(--rh-fg-3)',
                        borderRadius: 'var(--rh-radius-pill)', padding: '1px 8px', fontSize: 11,
                      }}>{source.id}</span>
                      {source.isCustom && (
                        <span style={{
                          background: 'rgba(29,158,117,0.12)', color: 'var(--rh-teal)',
                          borderRadius: 'var(--rh-radius-pill)', padding: '1px 8px', fontSize: 11, fontWeight: 600,
                        }}>custom</span>
                      )}
                      {source.isOverridden && (
                        <span style={{
                          background: 'var(--rh-blue-100)', color: 'var(--rh-blue-700)',
                          borderRadius: 'var(--rh-radius-pill)', padding: '1px 8px', fontSize: 11, fontWeight: 600,
                        }}>DB override</span>
                      )}
                      {!source.active && (
                        <span style={{
                          background: 'var(--rh-warning-100)', color: 'var(--rh-warning)',
                          borderRadius: 'var(--rh-radius-pill)', padding: '1px 8px', fontSize: 11, fontWeight: 600,
                        }}>inactive</span>
                      )}
                    </div>
                  </td>

                  {/* URL */}
                  <td style={{ padding: '14px 16px', maxWidth: 300 }}>
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: 'var(--rh-blue)', fontSize: 12, wordBreak: 'break-all',
                        textDecoration: 'none',
                      }}
                    >
                      {source.url}
                    </a>
                    {source.rssUrl && (
                      <div style={{ fontSize: 11, color: 'var(--rh-fg-3)', marginTop: 3 }}>
                        RSS: {source.rssUrl}
                      </div>
                    )}
                  </td>

                  {/* Articles */}
                  <td style={{ padding: '14px 16px', whiteSpace: 'nowrap', textAlign: 'center' }}>
                    <span style={{
                      display: 'inline-block',
                      background: source.articleCount > 0 ? 'var(--rh-teal-100)' : 'var(--rh-bg-alt)',
                      color: source.articleCount > 0 ? 'var(--rh-teal-700)' : 'var(--rh-fg-3)',
                      borderRadius: 'var(--rh-radius-pill)', padding: '3px 10px',
                      fontSize: 12, fontWeight: 700,
                    }}>
                      {source.articleCount}
                    </span>
                  </td>

                  {/* Last Run */}
                  <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                    {source.lastRun ? (
                      <>
                        <div style={{ fontSize: 12, color: 'var(--rh-fg-2)' }}>
                          {source.lastRun.runAt
                            ? new Date(source.lastRun.runAt).toLocaleString('uk-UA', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
                            : '—'}
                        </div>
                        <div style={{
                          fontSize: 11, fontWeight: 600, marginTop: 2,
                          color: source.lastRun.status === 'success' ? 'var(--rh-teal)' : 'var(--rh-warning)',
                        }}>
                          {source.lastRun.status}
                          {source.lastRun.error && (
                            <span title={source.lastRun.error} style={{ cursor: 'help', marginLeft: 4 }}>⚠</span>
                          )}
                        </div>
                      </>
                    ) : (
                      <span style={{ color: 'var(--rh-fg-3)', fontSize: 12 }}>Never</span>
                    )}
                  </td>

                  {/* URL Status */}
                  <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                    {!check ? (
                      <span style={{ color: 'var(--rh-fg-3)', fontSize: 12 }}>—</span>
                    ) : check.checking ? (
                      <span style={{ color: 'var(--rh-fg-3)', fontSize: 12 }}>Checking...</span>
                    ) : check.ok ? (
                      <span style={{
                        background: 'var(--rh-teal-100)', color: 'var(--rh-teal-700)',
                        borderRadius: 'var(--rh-radius-pill)', padding: '3px 10px',
                        fontSize: 12, fontWeight: 700,
                      }}>
                        ✓ {check.statusCode}
                      </span>
                    ) : (
                      <span style={{
                        background: 'var(--rh-warning-100)', color: 'var(--rh-warning)',
                        borderRadius: 'var(--rh-radius-pill)', padding: '3px 10px',
                        fontSize: 12, fontWeight: 700,
                      }} title={check.error}>
                        ✗ {check.statusCode || 'ERR'}
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td style={{ padding: '14px 16px' }}>
                    <button
                      onClick={() => checkUrl(source.id, source.url)}
                      disabled={check?.checking}
                      style={{
                        background: 'white', color: 'var(--rh-fg)',
                        border: '1px solid var(--rh-border)',
                        borderRadius: 8, padding: '6px 12px',
                        fontSize: 12, fontWeight: 600, cursor: check?.checking ? 'default' : 'pointer',
                        opacity: check?.checking ? 0.6 : 1,
                      }}
                    >
                      Check URL
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* ── Add New Source ───────────────────────────────────── */}
      <div style={{ marginTop: 40 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 4px', color: 'var(--rh-fg)' }}>
          Add New Source
        </h2>
        <p style={{ fontSize: 13, color: 'var(--rh-fg-2)', margin: '0 0 20px' }}>
          Add any website or RSS feed as a permanent crawler source. It will be crawled automatically on the next run.
        </p>

        <form onSubmit={handleAddSource} style={{
          background: 'white', border: '1px solid var(--rh-border)',
          borderRadius: 'var(--rh-radius-lg)', padding: 28,
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16,
        }}>
          {/* URL */}
          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--rh-fg-2)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              URL *
            </label>
            <input
              type="url"
              required
              value={form.url}
              onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
              placeholder="https://example.com/news or https://example.com/feed.xml"
              style={{
                width: '100%', boxSizing: 'border-box',
                padding: '9px 12px', border: '1.5px solid var(--rh-border)',
                borderRadius: 'var(--rh-radius-md)', fontSize: 13,
                fontFamily: 'var(--rh-font)', color: 'var(--rh-fg)',
                background: 'var(--rh-bg)',
              }}
            />
          </div>

          {/* Country */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--rh-fg-2)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Country
            </label>
            <select
              value={form.country}
              onChange={e => setForm(f => ({ ...f, country: e.target.value }))}
              style={{
                width: '100%', padding: '9px 12px', border: '1.5px solid var(--rh-border)',
                borderRadius: 'var(--rh-radius-md)', fontSize: 13,
                fontFamily: 'var(--rh-font)', color: 'var(--rh-fg)', background: 'var(--rh-bg)',
              }}
            >
              {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Name */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--rh-fg-2)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Name (optional — auto-detected)
            </label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Migration News Slovakia"
              style={{
                width: '100%', boxSizing: 'border-box',
                padding: '9px 12px', border: '1.5px solid var(--rh-border)',
                borderRadius: 'var(--rh-radius-md)', fontSize: 13,
                fontFamily: 'var(--rh-font)', color: 'var(--rh-fg)', background: 'var(--rh-bg)',
              }}
            />
          </div>

          {/* Type */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--rh-fg-2)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Type
            </label>
            <select
              value={form.sourceType}
              onChange={e => setForm(f => ({ ...f, sourceType: e.target.value }))}
              style={{
                width: '100%', padding: '9px 12px', border: '1.5px solid var(--rh-border)',
                borderRadius: 'var(--rh-radius-md)', fontSize: 13,
                fontFamily: 'var(--rh-font)', color: 'var(--rh-fg)', background: 'var(--rh-bg)',
              }}
            >
              <option value="scrape">News page (scrape)</option>
              <option value="rss">RSS feed</option>
              <option value="government">Government site</option>
            </select>
          </div>

          {/* Interval */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--rh-fg-2)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Check interval
            </label>
            <select
              value={form.checkIntervalHours}
              onChange={e => setForm(f => ({ ...f, checkIntervalHours: Number(e.target.value) }))}
              style={{
                width: '100%', padding: '9px 12px', border: '1.5px solid var(--rh-border)',
                borderRadius: 'var(--rh-radius-md)', fontSize: 13,
                fontFamily: 'var(--rh-font)', color: 'var(--rh-fg)', background: 'var(--rh-bg)',
              }}
            >
              <option value={6}>Every 6 hours</option>
              <option value={12}>Every 12 hours</option>
              <option value={24}>Daily</option>
              <option value={48}>Every 2 days</option>
              <option value={168}>Weekly</option>
            </select>
          </div>

          {/* Submit */}
          <div style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center', gap: 16 }}>
            <button
              type="submit"
              disabled={adding || !form.url.trim()}
              style={{
                background: adding || !form.url.trim() ? 'var(--rh-bg-alt)' : 'var(--rh-teal)',
                color: adding || !form.url.trim() ? 'var(--rh-fg-3)' : 'white',
                border: 0, borderRadius: 'var(--rh-radius-md)',
                padding: '10px 24px', fontSize: 13, fontWeight: 700,
                cursor: adding || !form.url.trim() ? 'default' : 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: 8,
              }}
            >
              {adding ? (
                <>
                  <span style={{
                    display: 'inline-block', width: 12, height: 12,
                    border: '2px solid var(--rh-fg-3)', borderTopColor: 'transparent',
                    borderRadius: '50%', animation: 'spin 0.7s linear infinite',
                  }} />
                  Перевіряємо...
                </>
              ) : 'Перевірити та додати'}
            </button>

            {addResult && (
              addResult.success ? (
                <div style={{
                  padding: '10px 16px', background: 'rgba(29,158,117,0.08)',
                  border: '1px solid rgba(29,158,117,0.25)', borderRadius: 'var(--rh-radius-md)',
                  fontSize: 13,
                }}>
                  <span style={{ color: 'var(--rh-teal)', fontWeight: 700 }}>✓ Added: </span>
                  {addResult.detectedName}
                  {addResult.hasRss && <span style={{ color: 'var(--rh-fg-3)', marginLeft: 8 }}>· RSS detected</span>}
                  <span style={{ color: 'var(--rh-fg-3)', marginLeft: 8 }}>· Reload to see in table</span>
                </div>
              ) : (
                <div style={{
                  padding: '10px 16px', background: 'rgba(220,38,38,0.06)',
                  border: '1px solid rgba(220,38,38,0.2)', borderRadius: 'var(--rh-radius-md)',
                  fontSize: 13, color: '#dc2626',
                }}>
                  {addResult.error}
                </div>
              )
            )}
          </div>
        </form>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </main>
  )
}
