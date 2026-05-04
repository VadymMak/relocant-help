import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <div style={{ minHeight: 'calc(100vh - 60px)', background: 'var(--rh-bg)' }}>
        {children}
      </div>
      <Footer />
    </>
  )
}
