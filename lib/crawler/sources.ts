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
  },
  {
    // RSS is dead (connection refused) — static page only, check weekly
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
  },
  {
    // Static page, no RSS — check weekly
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
  },
  {
    // Static page — check weekly
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
  },
  {
    // Active RSS — daily updates, covers employment, wages, Ukrainian displaced persons
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
  },

  // ── POLAND ────────────────────────────────────────────────
  {
    // Static page — check weekly
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
  },
  {
    // Static page — check weekly
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
  },

  // ── GERMANY ───────────────────────────────────────────────
  {
    // Active RSS — news feed (Meldungen), verified 200 with items
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
  },
  {
    // Active RSS — press releases feed, verified 200 with items
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
  },
  {
    // Static page — check weekly
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
  },

  // ── CZECH REPUBLIC ────────────────────────────────────────
  {
    // Static page — check weekly
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
  },

  // ── EU / INTERNATIONAL — RSS FEEDS ───────────────────────
  {
    // Static page — check weekly
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
  },
  {
    // Active RSS — EU Agency for Asylum, press releases, verified 30 items
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
  },
  {
    // Active RSS — ECRE European Council on Refugees and Exiles, verified 10 items
    id: 'eu-ecre',
    country: 'European Union',
    countryFlag: '🇪🇺',
    name: 'ECRE — European Council on Refugees and Exiles',
    url: 'https://ecre.org/category/news/',
    rssUrl: 'https://ecre.org/feed/',
    language: 'en',
    targetLanguages: ['uk', 'ru'],
    tags: ['EU', 'asylum', 'refugees', 'rights', 'protection'],
    checkIntervalHours: 24,
    active: true,
  },
  {
    // Active RSS — UN News, Migrants & Refugees topic, verified items
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
  },
  {
    // Active RSS — European Parliament LIBE Committee (Civil Liberties, Justice, Home Affairs)
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
]
