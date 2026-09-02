# 個人サイト

[Astro](https://astro.build) で作った静的サイトです。プロフィール（トップ）、ブログ、制作物一覧の 3 つで構成しています。

## 使い方

```
npm install     # 初回のみ
npm run dev     # 開発サーバー（http://localhost:4321）
npm run build   # dist/ に静的ファイルを出力
npm run preview # ビルド結果を確認
```

## ディレクトリ構成

```
src/
├── site.config.ts        名前・肩書き・自己紹介・SNS リンク（まずここを編集）
├── content.config.ts     ブログと制作物のフロントマター定義（スキーマ）
├── content/
│   ├── blog/             ブログ記事（Markdown）
│   └── works/            制作物（Markdown）
├── layouts/
│   └── BaseLayout.astro  ヘッダー・フッター・<head> の共通部分
├── components/           一覧のカードや日付表示など
├── pages/                URL と 1 対 1 で対応するページ
└── styles/global.css     配色（CSS 変数）と共通スタイル
```

## 編集の入り口

| やりたいこと | 触るファイル |
| --- | --- |
| 名前・自己紹介・SNS リンクを変える | `src/site.config.ts` |
| 配色を変える | `src/styles/global.css` の `:root` |
| ナビゲーションの項目を変える | `src/site.config.ts` の `nav` |
| 記事を追加する | `src/content/blog/` に `.md` を追加 |
| 制作物を追加する | `src/content/works/` に `.md` を追加 |

## 記事の追加

`src/content/blog/` に Markdown ファイルを置くだけで、一覧と個別ページが生成されます。
URL はファイル名がそのまま使われます（`my-post.md` → `/blog/my-post/`）。

```markdown
---
title: '記事のタイトル'
description: '一覧に表示される説明文'
pubDate: 2026-09-01
tags: ['Astro']
draft: false
---

本文をここに書きます。
```

`updatedDate`（更新日）は任意です。`draft: true` にすると公開されません。

## 制作物の追加

`src/content/works/` に Markdown ファイルを置きます。本文は今は使っていないので、
フロントマターだけで構いません。

```markdown
---
title: '作品名'
description: '説明'
year: 2026
role: '設計・実装'
tech: ['TypeScript', 'React']
url: 'https://example.com'
repo: 'https://github.com/you/repo'
---
```

## 公開する前に

`astro.config.mjs` の `site` を実際のドメインに書き換えてください。
canonical URL と OGP の URL に使われます。

`npm run build` で `dist/` に出力されるものはただの静的ファイルなので、
GitHub Pages / Cloudflare Pages / Vercel / Netlify など、どこにでも置けます。

## 注意（Windows）

`node_modules` を含むパスが 260 文字を超えると、Node がパッケージの設定を読めず
ビルドが失敗します（`ERR_PACKAGE_IMPORT_NOT_DEFINED`）。深い階層は避けて、
`C:\Users\<ユーザー名>\` の直下など短いパスに置いてください。
