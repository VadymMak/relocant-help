'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'

export default function AdminLoginPage() {
  const t = useTranslations('admin')
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })

    if (res.ok) {
      router.push('/admin')
    } else {
      setError(t('loginError'))
    }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--rh-navy)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24,
    }}>
      <div style={{
        background: 'white', borderRadius: 'var(--rh-radius-lg)',
        padding: '48px 40px', width: '100%', maxWidth: 380,
        boxShadow: 'var(--rh-shadow-lg)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 40, height: 40, background: 'var(--rh-teal)', borderRadius: 10,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, fontWeight: 800, color: 'white', marginBottom: 16,
          }}>✓</div>
          <h1 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 4px', color: 'var(--rh-fg)' }}>
            relocant.help
          </h1>
          <p style={{ fontSize: 13, color: 'var(--rh-fg-2)', margin: 0 }}>
            {t('loginTitle')}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: 'var(--rh-fg)' }}>
            {t('loginPassword')}
          </label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="rh-input"
            style={{ width: '100%', marginBottom: 8, boxSizing: 'border-box' }}
            autoFocus
            required
          />
          {error && (
            <p style={{ fontSize: 13, color: 'var(--rh-warning)', margin: '0 0 12px', fontWeight: 600 }}>
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="rh-btn rh-btn-primary"
            style={{ width: '100%', marginTop: 8, opacity: loading ? 0.7 : 1 }}
          >
            {loading ? '...' : t('loginBtn')}
          </button>
        </form>
      </div>
    </div>
  )
}
