import { useTranslations } from 'next-intl'

export default function AdminArticlesPage() {
  const t = useTranslations('admin')

  return (
    <main>
      <h1>{t('articles')}</h1>
    </main>
  )
}
