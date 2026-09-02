---
title: 'サイトを Astro で作り直しました'
description: '個人サイトを Astro で立ち上げたときに考えたことと、選んだ構成のメモ。'
pubDate: 2026-09-01
tags: ['Astro', '雑記']
---

このサイトは [Astro](https://astro.build) で作っています。記事は Markdown で書いて、
`src/content/blog/` に置くだけで一覧と個別ページが自動的に生成されます。

## なぜ Astro なのか

- 出力が完全な静的 HTML なので表示が速い
- 必要なところにだけ JavaScript を足せる
- Markdown と型付きのフロントマターが標準で扱える

## 記事の書き方

見出し、リスト、リンク、コードブロックはそのまま使えます。

```ts
const greet = (name: string) => `こんにちは、${name}さん`;
console.log(greet('世界'));
```

> 引用もこのように表示されます。

書きかけの記事はフロントマターに `draft: true` を足しておくと、
一覧にも個別ページにも出てこなくなります。
