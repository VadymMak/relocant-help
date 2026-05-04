import { notFound } from 'next/navigation'

interface Props {
  params: Promise<{ locale: string; id: string }>
}

export default async function ArticlePage({ params }: Props) {
  const { id } = await params

  if (!id) notFound()

  return (
    <main>
      <article>Article {id}</article>
    </main>
  )
}
