import { pgTable, text, integer, timestamp, boolean, jsonb } from 'drizzle-orm/pg-core';

export const crawledArticles = pgTable('crawled_articles', {
  id:               text('id').primaryKey().default('gen_random_uuid()'),
  sourceId:         text('source_id').notNull(),
  url:              text('url').notNull().unique(),
  originalTitle:    text('original_title').notNull(),
  originalContent:  text('original_content'),
  originalLanguage: text('original_language').notNull(),

  // Translated content
  titleUk:    text('title_uk'),
  titleRu:    text('title_ru'),
  summaryUk:  text('summary_uk'),
  summaryRu:  text('summary_ru'),
  fullTextUk: text('full_text_uk'),
  fullTextRu: text('full_text_ru'),

  // Metadata
  tags:           jsonb('tags').$type<string[]>().default([]),
  relevanceScore: integer('relevance_score').default(0),
  country:        text('country').notNull(),
  status:         text('status').default('pending_review'), // pending_review | approved | rejected
  publishedAt:    timestamp('published_at'),
  approvedAt:     timestamp('approved_at'),
  approvedBy:     text('approved_by'),
  createdAt:      timestamp('created_at').defaultNow(),
});

export const crawlerLog = pgTable('crawler_log', {
  id:               text('id').primaryKey().default('gen_random_uuid()'),
  sourceId:         text('source_id').notNull(),
  status:           text('status').notNull(), // success | error
  articlesFound:    integer('articles_found').default(0),
  articlesRelevant: integer('articles_relevant').default(0),
  error:            text('error'),
  runAt:            timestamp('run_at').defaultNow(),
});

export const crawlerSources = pgTable('crawler_sources', {
  id:           text('id').primaryKey(),
  active:       boolean('active').default(true),
  lastCrawledAt: timestamp('last_crawled_at'),
  totalArticles: integer('total_articles').default(0),
});