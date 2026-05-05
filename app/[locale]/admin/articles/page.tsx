import { getPrisma } from '@/lib/db'
import ArticleActions from './ArticleActions'

export const dynamic = 'force-dynamic'

export default async function AdminArticlesPage() {
  const articles = await getPrisma().crawledArticle.findMany({
    where: { status: 'pending_review' },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      titleUk: true,
      country: true,
      relevanceScore: true,
      sourceId: true,
      createdAt: true,
      url: true,
      tags: true,
    },
  })

  return (
    <main style={{ padding: '32px', maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 4px', color: 'var(--rh-fg)' }}>
          Articles for Review
        </h1>
        <p style={{ fontSize: 14, color: 'var(--rh-fg-2)', margin: 0 }}>
          {articles.length} article{articles.length !== 1 ? 's' : ''} pending review
        </p>
      </div>

      {articles.length === 0 ? (
        <div style={{
          background: 'white', border: '1px solid var(--rh-border)',
          borderRadius: 'var(--rh-radius-lg)', padding: 64,
          textAlign: 'center', color: 'var(--rh-fg-2)', fontSize: 15,
        }}>
          No articles pending review. Run the crawler to fetch new articles.
        </div>
      ) : (
        <div style={{
          background: 'white', border: '1px solid var(--rh-border)',
          borderRadius: 'var(--rh-radius-lg)', overflow: 'hidden',
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--rh-bg)', borderBottom: '1px solid var(--rh-border)' }}>
                {['Title', 'Country', 'Score', 'Source', 'Tags', 'Date', 'Actions'].map(h => (
                  <th key={h} style={{
                    padding: '12px 16px', textAlign: 'left',
                    fontWeight: 700, fontSize: 11, color: 'var(--rh-fg-3)',
                    textTransform: 'uppercase', letterSpacing: '0.04em',
                    whiteSpace: 'nowrap',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {articles.map(article => (
                <tr key={article.id} style={{ borderBottom: '1px solid var(--rh-border)' }}>
                  <td style={{ padding: '14px 16px', maxWidth: 320 }}>
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: 'var(--rh-fg)', fontWeight: 600, textDecoration: 'none', fontSize: 13 }}
                    >
                      {article.titleUk ?? 'No title'}
                    </a>
                  </td>
                  <td style={{ padding: '14px 16px', whiteSpace: 'nowrap', color: 'var(--rh-fg-2)' }}>
                    {article.country}
                  </td>
                  <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                    <span style={{
                      background: (article.relevanceScore ?? 0) >= 80 ? 'var(--rh-teal-100)' : 'var(--rh-warning-100)',
                      color: (article.relevanceScore ?? 0) >= 80 ? 'var(--rh-teal-700)' : 'var(--rh-warning)',
                      borderRadius: 'var(--rh-radius-pill)', padding: '3px 10px',
                      fontWeight: 700, fontSize: 12,
                    }}>
                      {article.relevanceScore ?? 0}/100
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', color: 'var(--rh-fg-2)', whiteSpace: 'nowrap' }}>
                    {article.sourceId}
                  </td>
                  <td style={{ padding: '14px 16px', maxWidth: 200 }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {article.tags.slice(0, 3).map(tag => (
                        <span key={tag} style={{
                          background: 'var(--rh-bg-alt)', color: 'var(--rh-fg-2)',
                          borderRadius: 'var(--rh-radius-pill)', padding: '2px 8px', fontSize: 11,
                        }}>{tag}</span>
                      ))}
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px', whiteSpace: 'nowrap', color: 'var(--rh-fg-3)', fontSize: 12 }}>
                    {article.createdAt?.toLocaleDateString('uk-UA') ?? '—'}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <ArticleActions articleId={article.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  )
}
