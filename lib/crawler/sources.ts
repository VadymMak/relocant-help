export interface CrawlerSource {
  id: string
  name: string
  url: string
  country: string
  language: string
}

export const sources: CrawlerSource[] = [
  {
    id: 'gov-sk',
    name: 'Slovak Government',
    url: 'https://www.slovensko.sk',
    country: 'SK',
    language: 'sk',
  },
  {
    id: 'gov-cz',
    name: 'Czech Government',
    url: 'https://www.mvcr.cz',
    country: 'CZ',
    language: 'cs',
  },
  {
    id: 'gov-de',
    name: 'German Government',
    url: 'https://www.make-it-in-germany.com',
    country: 'DE',
    language: 'de',
  },
]
