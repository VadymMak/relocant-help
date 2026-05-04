import { useTranslations } from 'next-intl'

export default function AdminPage() {
  const t = useTranslations('admin')

  return (
    <main>
      <h1>{t('title')}</h1>
    </main>
  )
}
