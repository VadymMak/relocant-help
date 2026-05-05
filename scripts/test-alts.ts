const ALTS = [
  // Turkey — /en redirected to 404, try other paths
  ['Turkey - goc EN news',     'https://www.goc.gov.tr/news'],
  ['Turkey - goc duyurular',   'https://en.goc.gov.tr/'],
  ['Turkey - goc press',       'https://www.goc.gov.tr/press-releases'],
  // Romania — connection refused, try alternatives
  ['Romania - igpf foreigners','https://www.politiadefrontiera.ro/ro/main/pg-servicii-pentru-straini-88.html'],
  ['Romania - gov main',       'https://www.gov.ro/en/'],
  ['Romania - anofm',          'https://www.anofm.ro/'],
  // Bulgaria — connection refused, try alternatives
  ['Bulgaria - mvr EN',        'https://www.mvr.bg/en'],
  ['Bulgaria - ukraine EN',    'https://www.ukraine.gov.bg/en/'],
  ['Bulgaria - dab EN',        'https://www.aref.government.bg/en/'],
  // Spain — timeout, try news/press section
  ['Spain - inclusion press',  'https://www.inclusion.gob.es/es/web/inclusion/home'],
  ['Spain - migraciones news', 'https://www.inclusion.gob.es/es/web/migraciones/noticias'],
  ['Spain - extranjeria',      'https://extranjeros.inclusion.gob.es/'],
  // Portugal — timeout, try news section
  ['Portugal - aima news',     'https://aima.gov.pt/pt/noticias'],
  ['Portugal - aima EN news',  'https://aima.gov.pt/en/news'],
  ['Portugal - sef redirect',  'https://www.sef.pt/en/Pages/home.aspx'],
  // Italy — GET timed out, try specific news
  ['Italy - integr news',      'https://integrazionemigranti.gov.it/en-gb/Notizie/'],
  ['Italy - interno EN',       'https://www.interno.gov.it/en/themes/immigration'],
  ['Italy - viaggiaresicuri',  'https://www.esteri.it/en/'],
]

async function main() {
  console.log('Alternative URL probe — timeout 15s each\n')
  for (const [label, url] of ALTS) {
    try {
      const r = await fetch(url, {
        method: 'HEAD',
        signal: AbortSignal.timeout(15000),
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; bot)', Accept: 'text/html' },
        redirect: 'follow',
      })
      const final = r.url !== url ? ` → ${r.url}` : ''
      console.log(`${String(r.status).padEnd(5)} ${label}${final}`)
    } catch (e) {
      const msg = String(e).includes('abort') ? 'TIMEOUT' : `ERR: ${String(e).split(':').pop()?.trim().slice(0, 40)}`
      console.log(`${msg.padEnd(5)} ${label}`)
    }
  }
}
main()
