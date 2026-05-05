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
    rssUrl: 'https://www.minv.sk/tlacove-spravy.rss',
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
    url: 'https://www.financnasprava.sk/sk/infoservis/aktuality',
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
    url: 'https://www.upsvr.gov.sk/aktuality.html',
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
    url: 'https://www.bamf.de/DE/Themen/Statistik/Aktuell/aktuell-node.html',
    rssUrl: 'https://www.bamf.de/SiteGlobals/Functions/RSS/DE/Feed/RSSNewsfeed_Meldungen.xml',
    language: 'de',
    targetLanguages: ['uk', 'ru', 'en'],
    tags: ['asylum', 'residence', 'Germany', 'Blue-Card'],
    checkIntervalHours: 12,
    active: true,
  },
  {
    id: 'de-make-it',
    country: 'Germany',
    countryFlag: '🇩🇪',
    name: 'Make it in Germany',
    url: 'https://www.make-it-in-germany.com/en/living-in-germany/ukrainian-refugees',
    language: 'en',
    targetLanguages: ['uk', 'ru'],
    tags: ['Germany', 'Ukrainian', 'work-permit', 'integration'],
    checkIntervalHours: 48,
    active: true,
  },

  // ── CZECH REPUBLIC ────────────────────────────────────────
  {
    id: 'cz-mvcr',
    country: 'Czech Republic',
    countryFlag: '🇨🇿',
    name: 'Ministerstvo vnitra ČR',
    url: 'https://www.mvcr.cz/clanek/aktualni-informace-pro-obcany-ukrajiny.aspx',
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
    name: 'EU Commission — Ukraine',
    url: 'https://home-affairs.ec.europa.eu/policies/migration-and-asylum/common-european-asylum-system/temporary-protection_en',
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
