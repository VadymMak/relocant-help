export interface SearchArticle {
  id: string
  titleUk: string | null
  titleRu: string | null
  summaryUk: string | null
  summaryRu: string | null
  country: string
  tags: string[]
  publishedAt: string | null
  sourceId: string
  relevanceScore: number
  vectorScore: number
}
