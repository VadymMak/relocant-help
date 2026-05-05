import { cookies } from 'next/headers'
import { getPrisma } from '@/lib/db'
import AdminSidebar from './AdminSidebar'

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const cookieStore = await cookies()
  const session = cookieStore.get('admin_session')

  // Login page — no session yet, render without sidebar
  if (!session?.value) {
    return <>{children}</>
  }

  const pendingCount = await getPrisma().crawledArticle.count({
    where: { status: 'pending_review' },
  })

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '220px 1fr',
      minHeight: '100vh',
      background: 'var(--rh-bg)',
    }}>
      <AdminSidebar locale={locale} pendingCount={pendingCount} />
      <div style={{ overflow: 'auto', minWidth: 0 }}>
        {children}
      </div>
    </div>
  )
}
