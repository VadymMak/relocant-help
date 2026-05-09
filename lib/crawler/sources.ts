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

  // ── EU / INTERNATIONAL ────────────────────────────────────
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
  // ── SPAIN ─────────────────────────────────────────────────
  {
    id: 'es-migraciones',
    country: 'Spain',
    countryFlag: '🇪🇸',
    name: 'Ministerio de Inclusión - Migraciones',
    url: 'https://www.inclusion.gob.es/en/web/migraciones/vivir-en-espana',
    language: 'es',
    targetLanguages: ['uk', 'ru'],
    tags: ['residence', 'Spain', 'migration', 'foreigners'],
    checkIntervalHours: 48,
    active: true,
    type: 'scrape',
  },

  // ── ITALY ─────────────────────────────────────────────────
  {
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

  // ── PORTUGAL ──────────────────────────────────────────────
  {
    id: 'pt-aima',
    country: 'Portugal',
    countryFlag: '🇵🇹',
    name: 'AIMA - Agência para a Integração, Migrações e Asilo',
    url: 'https://aima.gov.pt/en/news',
    language: 'pt',
    targetLanguages: ['uk', 'ru'],
    tags: ['Portugal', 'residence', 'migration', 'asylum'],
    checkIntervalHours: 48,
    active: true,
    type: 'scrape',
  },

  // ── BULGARIA ──────────────────────────────────────────────
  {
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

  // ── TURKEY ────────────────────────────────────────────────
  {
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

  // ── ROMANIA ───────────────────────────────────────────────
  {
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
