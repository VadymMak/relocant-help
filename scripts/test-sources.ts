const SOURCES = [
  { id: 'es-migraciones', country: 'Spain',    url: 'https://www.inclusion.gob.es/en/web/migraciones/vivir-en-espana' },
  { id: 'it-integrazione', country: 'Italy',   url: 'https://integrazionemigranti.gov.it/en-gb/' },
  { id: 'ro-protectie',   country: 'Romania',  url: 'https://protectieucraina.gov.ro/' },
  { id: 'bg-ukraine',     country: 'Bulgaria', url: 'https://ukraine.gov.bg/bg/' },
  { id: 'pt-aima',        country: 'Portugal', url: 'https://aima.gov.pt/en' },
  { id: 'tr-goc',         country: 'Turkey',   url: 'https://www.goc.gov.tr/en' },
]

const LINK_RE = /href=["']([^"']+)["']/gi
const ARTICLE_PATH_RE = /\/(news|article|aktualit|pressrelease|haber|noticias|novita|stire|novini|noutati)[^"'\s]*/i

async function testSource(id: string, country: string, url: string) {
  console.log(`\n${'─'.repeat(60)}`)
  console.log(`▶  ${country.toUpperCase()} — ${id}`)
  console.log(`   ${url}`)

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 10_000)

  try {
    // 1. HEAD
    let headStatus = 0
    try {
      const head = await fetch(url, {
        method: 'HEAD',
        signal: controller.signal,
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; relocant.help crawler)' },
        redirect: 'follow',
      })
      headStatus = head.status
      console.log(`   HEAD → ${head.status} ${head.statusText}  (final URL: ${head.url})`)
    } catch (e) {
      console.log(`   HEAD → ERROR: ${(e as Error).message}`)
    }

    // 2. GET
    const get = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; relocant.help crawler)',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'en,uk;q=0.9,ru;q=0.8',
      },
      redirect: 'follow',
    })

    console.log(`   GET  → ${get.status} ${get.statusText}  (final URL: ${get.url})`)

    if (!get.ok) {
      console.log(`   ✗ Non-2xx — skipping body parse`)
      return { id, country, url, ok: false, status: get.status, finalUrl: get.url, links: 0 }
    }

    const html = await get.text()
    const isHtml = html.trim().startsWith('<') || html.includes('<html')
    console.log(`   Body  → ${html.length.toLocaleString()} chars  HTML: ${isHtml}`)

    // 3. Extract links
    const allLinks: string[] = []
    let m: RegExpExecArray | null
    LINK_RE.lastIndex = 0
    while ((m = LINK_RE.exec(html)) !== null) {
      const href = m[1]
      if (ARTICLE_PATH_RE.test(href)) allLinks.push(href)
    }
    const unique = [...new Set(allLinks)].slice(0, 8)
    console.log(`   Article-like links found: ${allLinks.length} (unique: ${new Set(allLinks).size})`)
    if (unique.length) {
      console.log(`   Sample links:`)
      unique.forEach(l => console.log(`     • ${l}`))
    } else {
      // Show any links at all to understand structure
      LINK_RE.lastIndex = 0
      const anyLinks: string[] = []
      while ((m = LINK_RE.exec(html)) !== null) {
        const h = m[1]
        if (h.startsWith('/') && !h.startsWith('//') && h.length > 5) anyLinks.push(h)
      }
      const sample = [...new Set(anyLinks)].slice(0, 6)
      if (sample.length) {
        console.log(`   No article links matched — sample internal paths:`)
        sample.forEach(l => console.log(`     • ${l}`))
      }
    }

    return { id, country, url, ok: true, status: get.status, finalUrl: get.url, links: new Set(allLinks).size }
  } catch (e) {
    console.log(`   ✗ FETCH ERROR: ${(e as Error).message}`)
    return { id, country, url, ok: false, status: 0, finalUrl: url, links: 0 }
  } finally {
    clearTimeout(timer)
  }
}

async function main() {
  console.log('Relocant.help — New country source test')
  console.log(`Timestamp: ${new Date().toISOString()}`)

  const results = []
  for (const s of SOURCES) {
    results.push(await testSource(s.id, s.country, s.url))
  }

  console.log(`\n${'═'.repeat(60)}`)
  console.log('SUMMARY')
  console.log('═'.repeat(60))
  for (const r of results) {
    const icon = r.ok ? '✓' : '✗'
    console.log(`${icon}  ${r.country.padEnd(10)} status=${r.status}  links=${r.links}  ${r.ok ? '' : '← PROBLEM'}`)
    if (r.finalUrl !== r.url) console.log(`   redirected → ${r.finalUrl}`)
  }
}

main().catch(console.error)
