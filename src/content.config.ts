import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/** 公開する記事のフロントマター。ここを満たしていないとビルドが止まります */
const postSchema = z.object({
  title: z.string(),
  description: z.string(),
  pubDate: z.coerce.date(),
  updatedDate: z.coerce.date().optional(),
  tags: z.array(z.string()).default([]),
  /** この記事だけ SNS のカード画像を変えたいとき（public/ からのパス） */
  image: z.string().optional(),
  /** true にすると、公開済みの記事を一覧・詳細ページから外せます */
  draft: z.boolean().default(false),
});

/**
 * 下書きのフロントマター。書きかけでもビルドが止まらないよう、
 * 項目が欠けていたり形式が違っていたりしても既定値で通します。
 */
const draftSchema = z.object({
  title: z.string().catch('（無題の下書き）'),
  description: z.string().catch(''),
  pubDate: z.coerce.date().catch(() => new Date()),
  updatedDate: z.coerce.date().optional().catch(undefined),
  tags: z.array(z.string()).catch([]),
  image: z.string().optional().catch(undefined),
  draft: z.boolean().catch(false),
});

/** 公開する記事。このリポジトリ（public）で管理します */
const blog = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: '**/*.md' }),
  schema: postSchema,
});

/**
 * 書きかけの下書き。drafts/ は別の private リポジトリで管理していて、
 * このリポジトリには含まれません（.gitignore 済み）。
 * 開発サーバーの /blog/drafts/ でだけ表示されます。
 */
const drafts = defineCollection({
  loader: glob({ base: './drafts', pattern: '**/*.md' }),
  schema: draftSchema,
});

export const collections = { blog, drafts };
