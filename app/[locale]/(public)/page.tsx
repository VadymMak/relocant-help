import { getTranslations } from 'next-intl/server'
import { getLocale } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { getPrisma } from '@/lib/db'
import { getLocalizedContent, getLocaleDate } from '@/lib/utils/locale-content'
import { getCountryMeta } from '@/lib/utils/countries'

export const dynamic = 'force-dynamic'

type HomeArticle = {
  id: string
  flag: string
  country: string
  tag: string
  title: string
  summary: string
  date: string
  source: string
  featured: boolean
}

export default async function HomePage() {
  const [t, locale] = await Promise.all([
    getTranslations('home'),
    getLocale(),
  ])

  const [dbArticles, distinctCountriesRaw] = await Promise.all([
    getPrisma().crawledArticle.findMany({
      where: { status: 'approved' },
      orderBy: { publishedAt: 'desc' },
      take: 6,
      select: {
        id: true,
        country: true,
        tags: true,
        titleUk: true,
        titleRu: true,
        summaryUk: true,
        summaryRu: true,
        publishedAt: true,
        sourceId: true,
      },
    }),
    getPrisma().crawledArticle.findMany({
      where: { status: 'approved' },
      select: { country: true },
      distinct: ['country'],
      orderBy: { country: 'asc' },
    }),
  ])

  const countryFilters = [
    { label: t('filterAll'), code: 'ALL' },
    ...distinctCountriesRaw.map(({ country }) => {
      const { flag, label } = getCountryMeta(country)
      return { label: `${flag} ${label}`, code: label }
    }),
  ]

  const articles: HomeArticle[] = dbArticles.map((a, i) => {
    const { title, summary } = getLocalizedContent(a, locale)
    const { flag, label: country } = getCountryMeta(a.country)
    return {
      id: a.id,
      country,
      flag,
      tag: a.tags[0] ?? '',
      title,
      summary,
      date: getLocaleDate(a.publishedAt, locale),
      source: a.sourceId,
      featured: i === 0,
    }
  })

  return (
    <main>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section style={{
        background: `
          radial-gradient(ellipse 80% 60% at 80% 0%, rgba(24,95,165,0.35), transparent 60%),
          radial-gradient(ellipse 60% 50% at 0% 100%, rgba(29,158,117,0.18), transparent 60%),
          var(--rh-navy)
        `,
        color: 'white',
        padding: '96px 24px 136px',
        position: 'relative',
        overflow: 'hidden',
        textAlign: 'center',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)
          `,
          backgroundSize: '64px 64px',
          maskImage: 'radial-gradient(ellipse 80% 90% at 50% 40%, black, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 90% at 50% 40%, black, transparent 80%)',
          pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: 760, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <h1 style={{
            fontSize: 52, fontWeight: 800, lineHeight: 1.08,
            letterSpacing: '-0.025em', margin: '0 0 20px', color: 'white',
          }}>
            {t('title')}
          </h1>
          <p style={{ fontSize: 19, lineHeight: 1.6, color: 'rgba(255,255,255,0.72)', margin: '0 0 40px' }}>
            {t('subtitle')}
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/articles" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'var(--rh-teal)', color: 'white', border: '1px solid transparent',
              padding: '14px 28px', borderRadius: 'var(--rh-radius)',
              fontSize: 16, fontWeight: 700, textDecoration: 'none',
              boxShadow: '0 4px 16px rgba(29,158,117,0.35)',
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
              </svg>
              {t('readNewsBtn')}
            </Link>
            <Link href="/about" style={{
              display: 'inline-flex', alignItems: 'center',
              background: 'rgba(255,255,255,0.1)', color: 'white',
              border: '1px solid rgba(255,255,255,0.2)',
              padding: '14px 28px', borderRadius: 'var(--rh-radius)',
              fontSize: 16, fontWeight: 600, textDecoration: 'none',
              backdropFilter: 'blur(8px)',
            }}>
              {t('aboutBtn')}
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats bar ────────────────────────────────────────── */}
      <div style={{
        background: 'white', border: '1px solid var(--rh-border)',
        borderRadius: 'var(--rh-radius-lg)',
        maxWidth: 1200, margin: '-56px auto 0',
        position: 'relative', zIndex: 2,
        boxShadow: 'var(--rh-shadow-md)',
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', padding: '32px 16px' }}>
          {[
            { num: '200+', label: t('statsArticles') },
            { num: '8', label: t('statsCountries'), accent: true },
            { num: '2×', label: t('statsUpdates') },
            { num: '🇺🇦 🇷🇺', label: t('statsLanguages'), emoji: true },
          ].map(({ num, label, accent, emoji }, i) => (
            <div key={i} style={{
              textAlign: 'center',
              borderRight: i < 3 ? '1px solid var(--rh-border)' : undefined,
              padding: '0 16px',
            }}>
              <div style={{
                fontSize: emoji ? 28 : 36, fontWeight: 800,
                color: accent ? 'var(--rh-teal)' : 'var(--rh-navy)',
                letterSpacing: '-0.02em', lineHeight: 1, marginBottom: 2,
              }}>{num}</div>
              <div style={{ fontSize: 13, color: 'var(--rh-fg-2)', marginTop: 6 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Latest articles ───────────────────────────────────── */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28 }}>
          <h2 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', margin: 0, color: 'var(--rh-navy)' }}>
            {t('latestTitle')}
          </h2>
          <Link href="/articles" style={{ color: 'var(--rh-blue)', fontWeight: 600, textDecoration: 'none', fontSize: 14, whiteSpace: 'nowrap' }}>
            {t('readMore')}
          </Link>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 28, flexWrap: 'wrap' }}>
          {countryFilters.map(({ label, code }, i) => (
            <button key={code} style={{
              padding: '7px 16px', borderRadius: 'var(--rh-radius-pill)',
              border: i === 0 ? 'none' : '1px solid var(--rh-border)',
              background: i === 0 ? 'var(--rh-navy)' : 'white',
              color: i === 0 ? 'white' : 'var(--rh-fg-2)',
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
              boxShadow: i === 0 ? 'none' : 'var(--rh-shadow-xs)',
            }}>
              {label}
            </button>
          ))}
        </div>

        <style>{`
          .rh-news-card:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.13); border-color: var(--rh-blue) !important; }
          .rh-news-card-featured:hover { box-shadow: 0 8px 32px rgba(0,0,0,0.35); }
          .rh-news-card-link { text-decoration: none; color: inherit; display: block; }
        `}</style>

        {articles.length === 0 ? (
          <div style={{
            background: 'white', border: '1px solid var(--rh-border)',
            borderRadius: 'var(--rh-radius-lg)', padding: 64,
            textAlign: 'center', color: 'var(--rh-fg-2)', fontSize: 15,
          }}>
            No articles yet. Run the crawler to fetch news.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {articles.map(article => (
              article.featured ? (
                <FeaturedArticleCard key={article.id} article={article} readMore={t('readMore')} />
              ) : (
                <ArticleCard key={article.id} article={article} readMore={t('readMore')} />
              )
            ))}
          </div>
        )}
      </section>

      {/* ── How it works ─────────────────────────────────────── */}
      <section style={{ background: 'var(--rh-navy)', color: 'white', padding: '80px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h2 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', margin: '0 0 8px', color: 'white' }}>
            {t('howTitle')}
          </h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.65)', margin: '0 0 40px' }}>
            {t('howDesc')}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {[
              { num: '1', title: t('step1Title'), desc: t('step1Desc'),
                icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> },
              { num: '2', title: t('step2Title'), desc: t('step2Desc'),
                icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l3 9h9l-7.5 5.5L19 24l-7-5-7 5 2.5-9.5L0 11h9z"/></svg> },
              { num: '3', title: t('step3Title'), desc: t('step3Desc'),
                icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg> },
            ].map(({ num, title, desc, icon }) => (
              <div key={num} style={{
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 'var(--rh-radius-lg)', padding: 28,
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: 'rgba(29,158,117,0.18)', color: '#6FCFA9',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16,
                }}>{icon}</div>
                <h3 style={{ fontSize: 17, fontWeight: 600, margin: '0 0 8px', color: 'white' }}>{title}</h3>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', margin: 0, lineHeight: 1.6 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust ────────────────────────────────────────────── */}
      <section style={{ background: 'white', borderTop: '1px solid var(--rh-border)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 24px' }}>
          <h2 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', margin: '0 0 8px', color: 'var(--rh-navy)' }}>
            {t('trustTitle')}
          </h2>
          <p style={{ fontSize: 16, color: 'var(--rh-fg-2)', margin: '0 0 40px' }}>
            {t('trustDesc')}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
            {[
              { title: t('trust1Title'), desc: t('trust1Desc'), teal: true,
                icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 12l2 2 4-4"/><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> },
              { title: t('trust2Title'), desc: t('trust2Desc'), teal: false,
                icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 8h14M5 16h14M9 4l-2 16M17 4l-2 16"/></svg> },
              { title: t('trust3Title'), desc: t('trust3Desc'), teal: false,
                icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg> },
              { title: t('trust4Title'), desc: t('trust4Desc'), teal: true,
                icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg> },
            ].map(({ title, desc, teal, icon }) => (
              <div key={title} style={{ padding: 24, border: '1px solid var(--rh-border)', borderRadius: 'var(--rh-radius-lg)' }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: teal ? 'var(--rh-teal-100)' : 'var(--rh-blue-100)',
                  color: teal ? 'var(--rh-teal-700)' : 'var(--rh-blue)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16,
                }}>{icon}</div>
                <h4 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 6px', color: 'var(--rh-fg)' }}>{title}</h4>
                <p style={{ fontSize: 13, color: 'var(--rh-fg-2)', margin: 0, lineHeight: 1.5 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px 80px' }}>
        <div style={{
          background: 'linear-gradient(135deg, var(--rh-navy), var(--rh-blue))',
          borderRadius: 'var(--rh-radius-xl)', padding: 56, color: 'white',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: '-40%', right: '-10%',
            width: 360, height: 360,
            background: 'radial-gradient(circle, rgba(29,158,117,0.4), transparent 70%)',
            pointerEvents: 'none',
          }} />
          <h2 style={{ fontSize: 32, fontWeight: 700, margin: '0 0 12px', color: 'white', letterSpacing: '-0.02em', maxWidth: 560 }}>
            {t('ctaTitle')}
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', margin: '0 0 24px', fontSize: 15, maxWidth: 480 }}>
            {t('ctaDesc')}
          </p>
          <div style={{ display: 'flex', gap: 12 }}>
            <Link href="/articles" style={{
              display: 'inline-flex', alignItems: 'center',
              background: 'var(--rh-teal)', color: 'white', border: '1px solid transparent',
              padding: '14px 28px', borderRadius: 'var(--rh-radius)', fontSize: 15, fontWeight: 600,
              textDecoration: 'none',
            }}>
              {t('ctaBtn')}
            </Link>
            <Link href="/about" style={{
              display: 'inline-flex', alignItems: 'center',
              background: 'transparent', color: 'white', border: '1px solid rgba(255,255,255,0.3)',
              padding: '14px 28px', borderRadius: 'var(--rh-radius)', fontSize: 15, fontWeight: 600,
              textDecoration: 'none',
            }}>
              {t('ctaCatalog')}
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}

function FeaturedArticleCard({ article, readMore }: { article: HomeArticle; readMore: string }) {
  return (
    <Link href={`/articles/${article.id}`} className="rh-news-card-link" style={{ gridColumn: 'span 2' }}>
    <article className="rh-news-card-featured" style={{
      background: 'var(--rh-navy)',
      borderRadius: 'var(--rh-radius-lg)', padding: 32,
      display: 'flex', flexDirection: 'column', gap: 16,
      position: 'relative', overflow: 'hidden', color: 'white', cursor: 'pointer',
      transition: 'box-shadow 0.15s', height: '100%',
    }}>
      <div style={{
        position: 'absolute', top: '-20%', right: '-5%',
        width: 240, height: 240,
        background: 'radial-gradient(circle, rgba(29,158,117,0.2), transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 20 }}>{article.flag}</span>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)' }}>
          {article.country}
        </span>
        {article.tag && (
          <span style={{
            background: 'rgba(29,158,117,0.25)', color: '#6FCFA9',
            borderRadius: 'var(--rh-radius-pill)', padding: '3px 10px', fontSize: 12, fontWeight: 600,
          }}>{article.tag}</span>
        )}
      </div>
      <h3 style={{ fontSize: 22, fontWeight: 700, margin: 0, lineHeight: 1.3, letterSpacing: '-0.01em', color: 'white' }}>
        {article.title}
      </h3>
      <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.7)', margin: 0, lineHeight: 1.6 }}>
        {article.summary}
      </p>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: 'auto',
      }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{article.date}</span>
          <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(255,255,255,0.3)' }} />
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{article.source}</span>
        </div>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#6FCFA9' }}>{readMore}</span>
      </div>
    </article>
    </Link>
  )
}

function ArticleCard({ article, readMore }: { article: HomeArticle; readMore: string }) {
  return (
    <Link href={`/articles/${article.id}`} className="rh-news-card-link">
    <article className="rh-news-card" style={{
      background: 'white', border: '1px solid var(--rh-border)',
      borderRadius: 'var(--rh-radius-lg)', padding: 24,
      display: 'flex', flexDirection: 'column', gap: 12, cursor: 'pointer',
      boxShadow: 'var(--rh-shadow-xs)', transition: 'box-shadow 0.15s, border-color 0.15s',
      height: '100%',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 16 }}>{article.flag}</span>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--rh-fg-3)' }}>
          {article.country}
        </span>
        {article.tag && (
          <span style={{
            background: 'var(--rh-blue-100)', color: 'var(--rh-blue-700)',
            borderRadius: 'var(--rh-radius-pill)', padding: '2px 8px', fontSize: 11, fontWeight: 600, marginLeft: 'auto',
          }}>{article.tag}</span>
        )}
      </div>
      <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0, lineHeight: 1.4, letterSpacing: '-0.01em', color: 'var(--rh-fg)' }}>
        {article.title}
      </h3>
      <p style={{
        fontSize: 13, color: 'var(--rh-fg-2)', margin: 0, lineHeight: 1.55,
        display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
      }}>
        {article.summary}
      </p>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        paddingTop: 12, borderTop: '1px solid var(--rh-border)', marginTop: 'auto',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={{ fontSize: 11, color: 'var(--rh-fg-3)' }}>{article.date}</span>
          <span style={{ fontSize: 11, color: 'var(--rh-fg-3)' }}>{article.source}</span>
        </div>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--rh-blue)' }}>{readMore}</span>
      </div>
    </article>
    </Link>
  )
}
