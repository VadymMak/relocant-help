import { useTranslations } from 'next-intl'

export default function ArticlesPage() {
  const t = useTranslations('articles')

  return (
    <main>
      <h1>{t('title')}</h1>
    </main>
  )
}
