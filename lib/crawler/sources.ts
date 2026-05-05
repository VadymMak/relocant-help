export interface CrawlerSource {
  id: string
  country: string
  countryFlag: string
  name: string
  url: string
  rssUrl?: string
  crawlSelector?: string
  language: string
  targetLanguages: ('uk' | 'ru' | 'en')[]
  tags: string[]
  checkIntervalHours: number
  active: boolean
  type?: 'rss' | 'scrape' | 'newsapi'
}

export const CRAWLER_SOURCES: CrawlerSource[] = [
  // ── NEWSDATA.IO API ───────────────────────────────────────
  {
    id: 'newsdata-api',
    country: 'European Union',
    countryFlag: '🌐',
    name: 'NewsData.io — EU Migration News',
    url: 'https://newsdata.io',
    language: 'en',
    targetLanguages: ['uk', 'ru'],
    tags: ['migration', 'EU', 'refugees', 'Ukraine'],
    checkIntervalHours: 12,
    active: true,
    type: 'newsapi',
  },

  // ── SLOVAKIA ──────────────────────────────────────────────
  {
    id: 'sk-minv',
    country: 'Slovakia',
    countryFlag: '🇸🇰',
    name: 'Ministerstvo vnútra SR',
    url: 'https://www.minv.sk/?tlacove-spravy',
    rssUrl: 'https://www.minv.sk/rss.php?rss-tlacove-spravy',
    language: 'sk',
    targetLanguages: ['uk', 'ru'],
    tags: ['residence', 'police', 'registration', 'temporary-protection'],
    checkIntervalHours: 24,
    active: true,
    type: 'rss',
  },
  {
    id: 'sk-financna',
    country: 'Slovakia',
    countryFlag: '🇸🇰',
    name: 'Finančná správa SR',
    url: 'https://www.financnasprava.sk/sk/pre-media/novinky',
    language: 'sk',
    targetLanguages: ['uk', 'ru'],
    tags: ['taxes', 'tax-return', 'vat', 'freelancer'],
    checkIntervalHours: 168,
    active: true,
    type: 'scrape',
  },
  {
    id: 'sk-sozpoist',
    country: 'Slovakia',
    countryFlag: '🇸🇰',
    name: 'Sociálna poisťovňa',
    url: 'https://www.socpoist.sk/aktuality',
    language: 'sk',
    targetLanguages: ['uk', 'ru'],
    tags: ['social-insurance', 'pension', 'sick-leave', 'maternity'],
    checkIntervalHours: 168,
    active: true,
    type: 'scrape',
  },
  {
    id: 'sk-upsvar',
    country: 'Slovakia',
    countryFlag: '🇸🇰',
    name: 'Ústredie PSVR (Labour Office)',
    url: 'https://www.upsvr.gov.sk/media/medialne-spravy.html?page_id=272',
    language: 'sk',
    targetLanguages: ['uk', 'ru'],
    tags: ['employment', 'job-seeker', 'unemployment-benefit'],
    checkIntervalHours: 168,
    active: true,
    type: 'scrape',
  },
  {
    id: 'sk-employment',
    country: 'Slovakia',
    countryFlag: '🇸🇰',
    name: 'MPSVR SR (Ministry of Labour)',
    url: 'https://www.employment.gov.sk/sk/uvodna-stranka/aktualne-informacie/novinky/',
    rssUrl: 'https://www.employment.gov.sk/rss.xml',
    language: 'sk',
    targetLanguages: ['uk', 'ru'],
    tags: ['employment', 'labour', 'social-policy', 'minimum-wage', 'Ukraine'],
    checkIntervalHours: 24,
    active: true,
    type: 'rss',
  },

  // ── POLAND ────────────────────────────────────────────────
  {
    id: 'pl-udsc',
    country: 'Poland',
    countryFlag: '🇵🇱',
    name: 'Urząd do Spraw Cudzoziemców',
    url: 'https://www.gov.pl/web/udsc/aktualnosci',
    language: 'pl',
    targetLanguages: ['uk', 'ru'],
    tags: ['residence', 'foreigners', 'temporary-protection', 'Poland'],
    checkIntervalHours: 168,
    active: true,
    type: 'scrape',
  },
  {
    id: 'pl-zus',
    country: 'Poland',
    countryFlag: '🇵🇱',
    name: 'ZUS (Social Insurance)',
    url: 'https://www.zus.pl/o-zus/aktualnosci',
    language: 'pl',
    targetLanguages: ['uk', 'ru'],
    tags: ['social-insurance', 'Poland', 'contributions'],
    checkIntervalHours: 168,
    active: true,
    type: 'scrape',
  },

  // ── GERMANY ───────────────────────────────────────────────
  {
    id: 'de-bamf',
    country: 'Germany',
    countryFlag: '🇩🇪',
    name: 'BAMF — Aktuelle Meldungen',
    url: 'https://www.bamf.de/EN/Presse/presse-node.html',
    rssUrl: 'https://www.bamf.de/SiteGlobals/Functions/RSS/DE/Feed/RSSNewsfeed_Meldungen.xml?nn=1363092',
    language: 'de',
    targetLanguages: ['uk', 'ru', 'en'],
    tags: ['asylum', 'residence', 'Germany', 'Blue-Card', 'integration'],
    checkIntervalHours: 24,
    active: true,
    type: 'rss',
  },
  {
    id: 'de-bamf-press',
    country: 'Germany',
    countryFlag: '🇩🇪',
    name: 'BAMF — Pressemitteilungen',
    url: 'https://www.bamf.de/DE/Presse/Pressemitteilungen/pressemitteilungen-node.html',
    rssUrl: 'https://www.bamf.de/SiteGlobals/Functions/RSS/DE/Feed/RSSNewsfeed_Pressemitteilungen.xml?nn=282656',
    language: 'de',
    targetLanguages: ['uk', 'ru', 'en'],
    tags: ['Germany', 'asylum', 'migration', 'press'],
    checkIntervalHours: 48,
    active: true,
    type: 'rss',
  },
  {
    id: 'de-germany4ukraine',
    country: 'Germany',
    countryFlag: '🇩🇪',
    name: 'Germany4Ukraine (Federal Government)',
    url: 'https://www.germany4ukraine.de/hilfeportal-en',
    language: 'en',
    targetLanguages: ['uk', 'ru'],
    tags: ['Germany', 'Ukrainian', 'work-permit', 'integration', 'help'],
    checkIntervalHours: 168,
    active: true,
    type: 'scrape',
  },

  // ── CZECH REPUBLIC ────────────────────────────────────────
  {
    id: 'cz-mvcr',
    country: 'Czech Republic',
    countryFlag: '🇨🇿',
    name: 'Ministerstvo vnitra ČR',
    url: 'https://mv.gov.cz/clanek/informace-pro-obcany-ukrajiny.aspx',
    language: 'cs',
    targetLanguages: ['uk', 'ru'],
    tags: ['residence', 'Czech', 'visa', 'registration'],
    checkIntervalHours: 168,
    active: true,
    type: 'scrape',
  },
  {
    // IPC = Integration Policy Center, Czech Republic — WordPress RSS verified 10 items
    id: 'cz-ipc',
    country: 'Czech Republic',
    countryFlag: '🇨🇿',
    name: 'IPC — Integration Policy Center CZ',
    url: 'https://ipc.gov.cz/en/news/',
    rssUrl: 'https://ipc.gov.cz/en/feed/',
    language: 'en',
    targetLanguages: ['uk', 'ru'],
    tags: ['Czech', 'integration', 'foreigners', 'residence', 'services'],
    checkIntervalHours: 48,
    active: true,
    type: 'rss',
  },

  // ── SPAIN ─────────────────────────────────────────────────
  {
    // All inclusion.gob.es and extranjeros.inclusion.gob.es URLs return fetch failed (network-level block)
    id: 'es-migraciones',
    country: 'Spain',
    countryFlag: '🇪🇸',
    name: 'Ministerio de Inclusión - Migraciones',
    url: 'https://www.inclusion.gob.es/en/web/migraciones/vivir-en-espana',
    language: 'es',
    targetLanguages: ['uk', 'ru'],
    tags: ['residence', 'Spain', 'migration', 'foreigners'],
    checkIntervalHours: 48,
    active: false,
    type: 'scrape',
  },

  // ── ITALY ─────────────────────────────────────────────────
  {
    // interno.gov.it is the Ministry of Interior — HEAD 200, redirects to IT version (fine for scraping)
    id: 'it-interno',
    country: 'Italy',
    countryFlag: '🇮🇹',
    name: 'Ministero dell\'Interno — Immigrazione e Asilo',
    url: 'https://www.interno.gov.it/en/themes/immigration',
    language: 'it',
    targetLanguages: ['uk', 'ru'],
    tags: ['residence', 'Italy', 'immigration', 'asylum'],
    checkIntervalHours: 48,
    active: true,
    type: 'scrape',
  },

  // ── ROMANIA ───────────────────────────────────────────────
  {
    // protectieucraina.gov.ro unreachable (DNS/connection error); re-enable when site recovers
    id: 'ro-protectie',
    country: 'Romania',
    countryFlag: '🇷🇴',
    name: 'Protectie Ucraina Romania',
    url: 'https://protectieucraina.gov.ro/',
    language: 'ro',
    targetLanguages: ['uk', 'ru'],
    tags: ['Ukraine', 'Romania', 'temporary-protection', 'refugees'],
    checkIntervalHours: 24,
    active: false,
    type: 'scrape',
  },
  {
    // ANOFM (National Employment Agency) — 200 ✓; covers employment rights for Ukrainians
    id: 'ro-anofm',
    country: 'Romania',
    countryFlag: '🇷🇴',
    name: 'ANOFM — National Employment Agency Romania',
    url: 'https://www.anofm.ro/',
    language: 'ro',
    targetLanguages: ['uk', 'ru'],
    tags: ['Romania', 'employment', 'work-permit', 'foreigners'],
    checkIntervalHours: 48,
    active: true,
    type: 'scrape',
  },

  // ── BULGARIA ──────────────────────────────────────────────
  {
    // ukraine.gov.bg/bg/ unreachable; MVR (Ministry of Interior) EN — 200 ✓
    id: 'bg-mvr',
    country: 'Bulgaria',
    countryFlag: '🇧🇬',
    name: 'MVR — Ministry of Interior Bulgaria',
    url: 'https://www.mvr.bg/en',
    language: 'bg',
    targetLanguages: ['uk', 'ru'],
    tags: ['Bulgaria', 'residence', 'registration', 'foreigners'],
    checkIntervalHours: 48,
    active: true,
    type: 'scrape',
  },
  {
    // AREF (State Agency for Refugees) EN — 200 ✓; primary refugee authority
    id: 'bg-aref',
    country: 'Bulgaria',
    countryFlag: '🇧🇬',
    name: 'AREF — State Agency for Refugees Bulgaria',
    url: 'https://aref.government.bg/en',
    language: 'bg',
    targetLanguages: ['uk', 'ru'],
    tags: ['Bulgaria', 'Ukraine', 'temporary-protection', 'refugees', 'asylum'],
    checkIntervalHours: 24,
    active: true,
    type: 'scrape',
  },

  // ── TURKEY ────────────────────────────────────────────────
  {
    // www.goc.gov.tr/en redirects to Turkish 404; EN subdomain en.goc.gov.tr/ — 200 ✓
    id: 'tr-goc',
    country: 'Turkey',
    countryFlag: '🇹🇷',
    name: 'Göç İdaresi — Directorate General of Migration Management',
    url: 'https://en.goc.gov.tr/',
    language: 'tr',
    targetLanguages: ['uk', 'ru', 'en'],
    tags: ['Turkey', 'residence-permit', 'migration', 'foreigners'],
    checkIntervalHours: 48,
    active: true,
    type: 'scrape',
  },

  // ── PORTUGAL ──────────────────────────────────────────────
  {
    // All aima.gov.pt and sef.pt URLs return fetch failed (network-level block)
    id: 'pt-aima',
    country: 'Portugal',
    countryFlag: '🇵🇹',
    name: 'AIMA - Agência para a Integração, Migrações e Asilo',
    url: 'https://aima.gov.pt/en',
    language: 'pt',
    targetLanguages: ['uk', 'ru'],
    tags: ['Portugal', 'residence', 'migration', 'asylum'],
    checkIntervalHours: 48,
    active: false,
    type: 'scrape',
  },

  // ── EU / INTERNATIONAL ────────────────────────────────────
  {
    id: 'eu-commission',
    country: 'European Union',
    countryFlag: '🇪🇺',
    name: 'EU Commission — Temporary Protection',
    url: 'https://home-affairs.ec.europa.eu/policies/migration-and-asylum/asylum-eu/temporary-protection_en',
    language: 'en',
    targetLanguages: ['uk', 'ru'],
    tags: ['EU', 'temporary-protection', 'directive', 'rights'],
    checkIntervalHours: 168,
    active: true,
    type: 'scrape',
  },
  {
    id: 'eu-euaa',
    country: 'European Union',
    countryFlag: '🇪🇺',
    name: 'EUAA — EU Agency for Asylum',
    url: 'https://euaa.europa.eu/news-events/press-releases',
    rssUrl: 'https://euaa.europa.eu/category/press-releases/feed',
    language: 'en',
    targetLanguages: ['uk', 'ru'],
    tags: ['EU', 'asylum', 'temporary-protection', 'country-guidance', 'rights'],
    checkIntervalHours: 48,
    active: true,
    type: 'rss',
  },
  {
    id: 'eu-ecre',
    country: 'European Union',
    countryFlag: '🇪🇺',
    name: 'ECRE — European Council on Refugees and Exiles',
    url: 'https://ecre.org/category/news/',
    rssUrl: 'https://ecre.org/category/news/feed/',
    language: 'en',
    targetLanguages: ['uk', 'ru'],
    tags: ['EU', 'asylum', 'refugees', 'rights', 'protection'],
    checkIntervalHours: 24,
    active: true,
    type: 'rss',
  },
  {
    id: 'eu-un-migrants',
    country: 'European Union',
    countryFlag: '🇺🇳',
    name: 'UN News — Migrants & Refugees',
    url: 'https://news.un.org/en/news/topic/migrants-and-refugees',
    rssUrl: 'https://news.un.org/feed/subscribe/en/news/topic/migrants-and-refugees/feed/rss.xml',
    language: 'en',
    targetLanguages: ['uk', 'ru'],
    tags: ['UN', 'migrants', 'refugees', 'international', 'rights'],
    checkIntervalHours: 24,
    active: true,
    type: 'rss',
  },
  {
    id: 'eu-europarl-libe',
    country: 'European Union',
    countryFlag: '🇪🇺',
    name: 'European Parliament — LIBE Committee',
    url: 'https://www.europarl.europa.eu/committees/en/libe/home',
    rssUrl: 'https://www.europarl.europa.eu/rss/committee/libe/en.xml',
    language: 'en',
    targetLanguages: ['uk', 'ru'],
    tags: ['EU', 'parliament', 'migration', 'asylum', 'civil-liberties', 'legislation'],
    checkIntervalHours: 48,
    active: true,
    type: 'rss',
  },
]

export const RELEVANCE_KEYWORDS = [
  'ukraine', 'ukrainian', 'україн', 'dočasné útočisko', 'odídenec',
  'временная защита', 'biežaniec', 'utečenec',
  'temporary protection', 'residence permit', 'visa', 'registration',
  'povolenie', 'pobyt', 'cudzoziemec', 'foreigner', 'refugee', 'asylum',
  'živnosť', 'SZČO', 'tax', 'daň', 'social insurance', 'health insurance',
  'employment', 'work permit', 'freelancer', 'self-employed',
  'bank account', 'bankový účet', 'konto',
  'displaced', 'protection', 'migration', 'migrant', 'integration',
  'Blue Card', 'aufenthaltserlaubnis', 'niederlassungserlaubnis',
  'housing', 'social benefits', 'language course', 'recognition',
  'qualification', 'war', 'conflict', 'relocation', 'relocant',
  // Spanish
  'ucrania', 'ucraniano', 'protección temporal', 'permiso de residencia',
  // Italian
  'ucraina', 'protezione temporanea', 'permesso di soggiorno',
  // Romanian
  'ucraina', 'protectie temporara', 'permis de sedere',
  // Bulgarian
  'украйна', 'временна закрила', 'разрешение за пребиваване',
  // Turkish
  'ukrayna', 'geçici koruma', 'ikamet', 'oturma izni',
  // Portuguese
  'portugal', 'autorização de residência', 'proteção temporária',
]
