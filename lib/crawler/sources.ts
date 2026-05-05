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
    checkIntervalHours: 12,
    active: true,
  },
  {
    id: 'sk-financna',
    country: 'Slovakia',
    countryFlag: '🇸🇰',
    name: 'Finančná správa SR',
    url: 'https://www.financnasprava.sk/sk/pre-media/novinky',
    rssUrl: 'https://www.financnasprava.sk/sk/rss/rss-novinky',
    language: 'sk',
    targetLanguages: ['uk', 'ru'],
    tags: ['taxes', 'tax-return', 'vat', 'freelancer'],
    checkIntervalHours: 24,
    active: true,
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
    checkIntervalHours: 24,
    active: true,
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
    checkIntervalHours: 24,
    active: true,
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
    checkIntervalHours: 12,
    active: true,
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
    checkIntervalHours: 24,
    active: true,
  },

  // ── GERMANY ───────────────────────────────────────────────
  {
    id: 'de-bamf',
    country: 'Germany',
    countryFlag: '🇩🇪',
    name: 'BAMF',
    url: 'https://www.bamf.de/EN/Presse/presse-node.html',
    rssUrl: 'https://www.bamf.de/SiteGlobals/Functions/RSS/DE/Feed/RSSNewsfeed_Meldungen.xml?nn=282656',
    language: 'de',
    targetLanguages: ['uk', 'ru', 'en'],
    tags: ['asylum', 'residence', 'Germany', 'Blue-Card'],
    checkIntervalHours: 12,
    active: true,
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
    checkIntervalHours: 48,
    active: true,
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
    checkIntervalHours: 24,
    active: true,
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
    checkIntervalHours: 48,
    active: true,
  },
]

export const RELEVANCE_KEYWORDS = [
  'ukraine', 'ukrainian', 'україн', 'dočasné útočisko', 'odídenec',
  'временная защита', 'biežaniec', 'utečenec',
  'temporary protection', 'residence permit', 'visa', 'registration',
  'povolenie', 'pobyt', 'cudzoziemec', 'foreigner',
  'živnosť', 'SZČO', 'tax', 'daň', 'social insurance', 'health insurance',
  'employment', 'work permit', 'freelancer', 'self-employed',
  'bank account', 'bankový účet', 'konto',
]
