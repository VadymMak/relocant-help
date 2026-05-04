import { useTranslations } from 'next-intl'
import { features } from '@/lib/features'
import { notFound } from 'next/navigation'

export default function CatalogPage() {
  if (!features.specialists) notFound()

  const t = useTranslations('catalog')

  return (
    <main>
      <h1>{t('title')}</h1>
    </main>
  )
}
