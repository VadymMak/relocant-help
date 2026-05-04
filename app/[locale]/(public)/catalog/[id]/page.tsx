import { features } from '@/lib/features'
import { notFound } from 'next/navigation'

interface Props {
  params: Promise<{ locale: string; id: string }>
}

export default async function SpecialistPage({ params }: Props) {
  if (!features.specialists) notFound()

  const { id } = await params

  return (
    <main>
      <article>Specialist {id}</article>
    </main>
  )
}
