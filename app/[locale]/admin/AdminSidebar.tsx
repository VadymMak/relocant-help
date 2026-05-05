'use client'

import { useTranslations } from 'next-intl'
import { usePathname } from 'next/navigation'

interface Props {
  locale: string
  pendingCount: number
}

export default function AdminSidebar({ locale, pendingCount }: Props) {
  const t = useTranslations('admin')
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === `/${locale}/admin`) return pathname === `/${locale}/admin`
    return pathname.startsWith(href)
  }

  return (
    <aside style={{
      background: 'var(--rh-navy)', color: 'white',
      padding: '0 0 24px 0',
      display: 'flex', flexDirection: 'column',
      position: 'sticky', top: 0, height: '100vh', overflowY: 'auto',
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
      <SidebarLink
        href={`/${locale}/admin`}
        active={isActive(`/${locale}/admin`)}
        icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>}
        label={t('sidebarDashboard')}
      />
      <SidebarLink
        href={`/${locale}/admin/articles`}
        active={isActive(`/${locale}/admin/articles`)}
        icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>}
        label={t('articles')}
        badge={pendingCount > 0 ? String(pendingCount) : undefined}
      />
      <SidebarLink
        href={`/${locale}/admin/sources`}
        active={isActive(`/${locale}/admin/sources`)}
        icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>}
        label="Sources"
      />

      <SidebarSection label={t('sidebarContent')} />
      <SidebarLink
        href={`/${locale}/admin/archive`}
        active={isActive(`/${locale}/admin/archive`)}
        icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg>}
        label={t('sidebarArchive')}
      />

      <SidebarSection label={t('sidebarNetwork')} />
      <SidebarLink
        href={`/${locale}/admin/requests`}
        active={isActive(`/${locale}/admin/requests`)}
        icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>}
        label={t('sidebarRequests')}
      />
      <SidebarLink
        href={`/${locale}/admin/specialists`}
        active={isActive(`/${locale}/admin/specialists`)}
        icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>}
        label={t('sidebarSpecialists')}
      />
      <SidebarLink
        href={`/${locale}/admin/bookings`}
        active={isActive(`/${locale}/admin/bookings`)}
        icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>}
        label={t('sidebarBookings')}
      />
      <SidebarLink
        href={`/${locale}/admin/verifications`}
        active={isActive(`/${locale}/admin/verifications`)}
        icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 12l2 2 4-4"/><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>}
        label={t('sidebarVerifications')}
      />
      <SidebarLink
        href={`/${locale}/admin/reviews`}
        active={isActive(`/${locale}/admin/reviews`)}
        icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg>}
        label={t('sidebarReviews')}
      />

      <SidebarSection label={t('sidebarSettings')} />
      <SidebarLink
        href={`/${locale}/admin/settings`}
        active={isActive(`/${locale}/admin/settings`)}
        icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>}
        label={t('sidebarConfig')}
      />
    </aside>
  )
}

function SidebarSection({ label }: { label: string }) {
  return (
    <div style={{
      padding: '16px 20px 8px',
      fontSize: 10, fontWeight: 700,
      color: 'rgba(255,255,255,0.35)',
      textTransform: 'uppercase', letterSpacing: '0.08em',
    }}>
      {label}
    </div>
  )
}

function SidebarLink({
  href, icon, label, active, badge,
}: {
  href: string
  icon: React.ReactNode
  label: string
  active: boolean
  badge?: string
}) {
  return (
    <a href={href} style={{
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
