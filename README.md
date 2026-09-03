# 個人サイト

[Astro](https://astro.build) で作った静的サイトです。トップは litlink のようなリンクまとめページで、
ブログとプロフィールを別ページとして持っています。

- `/` — リンクまとめ（アイコン、名前、SNS、リンクボタン）
- `/blog/` — 記事一覧、`/blog/<ファイル名>/` — 記事本文
- `/profile/` — 自己紹介、スキル、経歴

レイアウトは [akakura.wixsite.com/mysite](https://akakura.wixsite.com/mysite) の構成を参考にしています
（中央寄せの円形アイコン、区切り線で区切った中央ナビ、広い画面で右端に固定される円形 SNS アイコン）。
配色はこのサイト独自のものです。

## 使い方

```
npm install     # 初回のみ
npm run dev     # 開発サーバー（http://localhost:4321）
npm run build   # dist/ に静的ファイルを出力
npm run preview # ビルド結果を確認
```

## ディレクトリ構成

```
public/
└── avatar.jpg            トップの円形アイコン
src/
├── site.config.ts        名前・リンクボタン・SNS・経歴（まずここを編集）
├── content.config.ts     ブログのフロントマター定義（スキーマ）
├── content/blog/         ブログ記事（Markdown）
├── layouts/
│   └── BaseLayout.astro  下層ページ共通のヘッダー・フッター
├── components/
│   ├── BaseHead.astro    <head> の中身（メタタグ、OGP）
│   ├── Icon.astro        SNS アイコンの SVG
│   ├── SocialLinks.astro 円形 SNS アイコンの並び
│   ├── PostLink.astro    記事一覧の 1 件分
│   └── FormattedDate.astro
├── pages/
│   ├── index.astro       リンクまとめページ（独立したレイアウト）
│   ├── profile.astro
│   ├── blog/index.astro
│   ├── blog/[...slug].astro
│   └── 404.astro
└── styles/global.css     配色（CSS 変数）と共通スタイル
```

## 編集の入り口

| やりたいこと | 触るファイル |
| --- | --- |
| 名前・肩書きを変える | `src/site.config.ts` の `site` |
| トップのリンクボタンを増減する | `src/site.config.ts` の `linkButtons` |
| SNS アイコンを増減する | `src/site.config.ts` の `socials` |
| プロフィールの本文・経歴を変える | `src/site.config.ts` の `profile` |
| ナビゲーションの項目を変える | `src/site.config.ts` の `nav` |
| 配色を変える | `src/styles/global.css` の `:root` |
| 記事を追加する | `src/content/blog/` に `.md` を追加 |

## アイコン画像の差し替え

アイコンは `public/avatar.jpg` です。差し替えるときは同じ名前で上書きするか、
別名で `public/` に置いて `src/site.config.ts` の `avatar` を書き換えてください。
指定したファイルが無い場合は `.jpg` `.jpeg` `.webp` を順に試し、
どれも無ければ名前の頭文字が円の中に表示されます。`avatar: null` でも同じです。

新しい SNS を追加したいときは、`src/components/Icon.astro` の `paths` に
24×24 の viewBox で SVG のパスを足してから、`socials` でその名前を指定します。

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

## 公開する前に

`astro.config.mjs` の `site` を実際のドメインに書き換えてください。
canonical URL と OGP の URL に使われます。

`npm run build` で `dist/` に出力されるものはただの静的ファイルなので、
GitHub Pages / Cloudflare Pages / Vercel / Netlify など、どこにでも置けます。

## 注意（Windows）

`node_modules` を含むパスが 260 文字を超えると、Node がパッケージの設定を読めず
ビルドが失敗します（`ERR_PACKAGE_IMPORT_NOT_DEFINED`）。深い階層は避けて、
`C:\Users\<ユーザー名>\` の直下など短いパスに置いてください。
