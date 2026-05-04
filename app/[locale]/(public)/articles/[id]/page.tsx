import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { mockArticles } from '@/lib/mock-articles'

interface Props {
  params: Promise<{ locale: string; id: string }>
}

function renderFullText(text: string) {
  const blocks = text.trim().split(/\n\n+/)
  return blocks.map((block, i) => {
    if (block.startsWith('**') && block.endsWith('**')) {
      return (
        <h3 key={i} style={{ fontSize: 17, fontWeight: 700, margin: '28px 0 10px', color: 'var(--rh-fg-1)' }}>
          {block.slice(2, -2)}
        </h3>
      )
    }
    const lines = block.split('\n')
    const isListBlock = lines.every(l => l.startsWith('- '))
    if (isListBlock) {
      return (
        <ul key={i} style={{ margin: '12px 0', paddingLeft: 20 }}>
          {lines.map((line, j) => (
            <li key={j} style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--rh-fg-1)', marginBottom: 4 }}>
              {line.slice(2)}
            </li>
          ))}
        </ul>
      )
    }
    const rendered = lines.map((line, j) => {
      if (line.startsWith('**') && line.endsWith('**')) {
        return <strong key={j}>{line.slice(2, -2)}</strong>
      }
      const parts = line.split(/(\*\*[^*]+\*\*)/)
      if (parts.length > 1) {
        return (
          <span key={j}>
            {parts.map((p, k) =>
              p.startsWith('**') && p.endsWith('**')
                ? <strong key={k}>{p.slice(2, -2)}</strong>
                : p
            )}
          </span>
        )
      }
      if (line.startsWith('- ')) {
        return <li key={j} style={{ marginBottom: 4 }}>{line.slice(2)}</li>
      }
      return <span key={j}>{line}{j < lines.length - 1 ? <br /> : null}</span>
    })
    return (
      <p key={i} style={{ margin: '0 0 16px', fontSize: 15, lineHeight: 1.75, color: 'var(--rh-fg-1)' }}>
        {rendered}
      </p>
    )
  })
}

export default async function ArticlePage({ params }: Props) {
  const { id } = await params
  const t = await getTranslations('articles')

  const article = mockArticles.find(a => a.id === id)
  if (!article) notFound()

  const related = mockArticles.filter(a => a.id !== id).slice(0, 3)

  return (
    <main>
      <section style={{ background: 'var(--rh-navy)', color: 'white', padding: '48px 24px 72px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <Link href="/articles" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: 13, fontWeight: 500 }}>
            {t('backToList')}
          </Link>

          <div style={{ display: 'flex', gap: 8, marginTop: 20, marginBottom: 16, flexWrap: 'wrap' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.9)',
              borderRadius: 'var(--rh-radius-pill)', padding: '4px 12px', fontSize: 12, fontWeight: 500,
            }}>
              {article.flag} {article.country}
            </span>
            <span style={{
              background: 'rgba(29,158,117,0.25)', color: '#5de0b3',
              borderRadius: 'var(--rh-radius-pill)', padding: '4px 12px', fontSize: 12, fontWeight: 600,
            }}>
              {article.tag}
            </span>
          </div>

          <h1 style={{ fontSize: 34, fontWeight: 700, margin: '0 0 20px', lineHeight: 1.3, letterSpacing: '-0.02em', maxWidth: 800 }}>
            {article.title}
          </h1>

          <div style={{ display: 'flex', gap: 20, fontSize: 13, color: 'rgba(255,255,255,0.55)', flexWrap: 'wrap' }}>
            <span>{t('published')}: {article.date}</span>
            <span>{t('source')}: {article.source}</span>
          </div>
        </div>
      </section>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 24px 80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 40, alignItems: 'start' }}>
          {/* Main content */}
          <div>
            <div style={{
              background: 'white', border: '1px solid var(--rh-border)',
              borderRadius: 'var(--rh-radius-lg)', padding: '36px 40px',
              boxShadow: 'var(--rh-shadow-xs)',
            }}>
              {renderFullText(article.fullText)}

              <div style={{
                marginTop: 36, paddingTop: 24,
                borderTop: '1px solid var(--rh-border)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <div style={{ fontSize: 13, color: 'var(--rh-fg-3)' }}>
                  {t('source')}: {article.source}
                </div>
                <a
                  href={article.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: 'var(--rh-blue)', fontWeight: 600, fontSize: 13,
                    textDecoration: 'none',
                  }}
                >
                  {t('originalLink')}
                </a>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <aside>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--rh-fg-3)', textTransform: 'uppercase', marginBottom: 16 }}>
              {t('relatedTitle')}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {related.map(rel => (
                <Link
                  key={rel.id}
                  href={`/articles/${rel.id}` as any}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <div style={{
                    background: 'white', border: '1px solid var(--rh-border)',
                    borderRadius: 'var(--rh-radius-md)', padding: '16px 18px',
                    boxShadow: 'var(--rh-shadow-xs)',
                  }}>
                    <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
                      <span style={{
                        background: 'var(--rh-bg-2)', color: 'var(--rh-fg-2)',
                        borderRadius: 'var(--rh-radius-pill)', padding: '2px 8px', fontSize: 11, fontWeight: 500,
                      }}>
                        {rel.flag} {rel.country}
                      </span>
                      <span style={{
                        background: 'rgba(29,158,117,0.1)', color: 'var(--rh-teal)',
                        borderRadius: 'var(--rh-radius-pill)', padding: '2px 8px', fontSize: 11, fontWeight: 600,
                      }}>
                        {rel.tag}
                      </span>
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.4, color: 'var(--rh-fg-1)', marginBottom: 8 }}>
                      {rel.title}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--rh-fg-3)' }}>
                      {rel.date}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}
