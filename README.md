# 個人サイト

[Astro](https://astro.build) で作った静的サイトです。トップは litlink のようなリンクまとめページで、
ブログとプロフィールを別ページとして持っています。

- `/` — リンクまとめ（アイコン、名前、SNS、リンクボタン）
- `/blog/` — 記事一覧、`/blog/<ファイル名>/` — 記事本文
- `/profile/` — 自己紹介、スキル、経歴
- `/contact/` — 依頼の受付状況と問い合わせの案内
- `/contact/mail/` — メールアドレスとコピーボタン

レイアウトは [akakura.wixsite.com/mysite](https://akakura.wixsite.com/mysite) の構成を参考にしています
（中央寄せの円形アイコン、区切り線で区切った中央ナビ、広い画面で右端に固定される円形 SNS アイコン）。
配色はこのサイト独自のものです。

## 使い方

```
npm install          # 初回のみ
npm run dev          # 開発サーバー（http://localhost:4321）
npm run build        # dist/ に静的ファイルを出力
npm run preview      # ビルド結果を確認

npm run new-post     # 下書きを新しく作る
npm run posts        # いまある記事と下書きの一覧
npm run save         # 下書きを private リポジトリへ保存する
npm run publish-post # 下書きを公開する
```

## ディレクトリ構成

```
drafts/                   書きかけの下書き（private リポジトリ・このリポジトリには入りません）
public/
└── avatar.jpg            トップの円形アイコン
scripts/
├── new-post.mjs          下書きを作る       （npm run new-post）
├── posts.mjs             一覧を出す         （npm run posts）
├── save.mjs              下書きを保存する   （npm run save）
├── publish.mjs           下書きを公開する   （npm run publish-post）
├── drafts-setup.mjs      保存先をつなぐ     （npm run drafts:setup）
└── lib.mjs               上記の共通処理
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
│   ├── _drafts/          下書きのプレビュー（開発サーバーでだけ表示）
│   └── 404.astro
└── styles/global.css     配色（CSS 変数）と共通スタイル
.vscode/
└── blog.code-snippets    記事のフロントマターの VS Code スニペット
```

## 編集の入り口

| やりたいこと | 触るファイル |
| --- | --- |
| 名前・肩書きを変える | `src/site.config.ts` の `site` |
| トップのリンクボタンを増減する | `src/site.config.ts` の `linkButtons` |
| SNS アイコンを増減する | `src/site.config.ts` の `socials` |
| プロフィールの項目を変える | `src/site.config.ts` の `profile` |
| 受付状況や依頼の案内を変える | `src/site.config.ts` の `contact` |
| ナビゲーションの項目を変える | `src/site.config.ts` の `nav` |
| 配色を変える | `src/styles/global.css` の `:root` |
| 配色の切り替えを直す | `src/components/ThemeToggle.astro` |
| 記事を書く | `npm run new-post` → `drafts/` に下書きができます |
| 書きかけの記事を探す | `npm run posts` |

## 配色の切り替え

各ページの上部に、ライト / ダーク / 環境依存を選ぶボタンがあります。
選択は `localStorage` の `theme` に保存され、`<html>` の `data-theme` 属性として
反映されます。属性が無い状態が「環境依存」で、OS の設定に従います。

色は `light-dark(ライト時の値, ダーク時の値)` の形で `global.css` の `:root` に
まとめてあるので、片方だけ変えたいときもその行だけ触れば済みます。

## アイコン画像の差し替え

アイコンは `public/avatar.jpg` です。差し替えるときは同じ名前で上書きするか、
別名で `public/` に置いて `src/site.config.ts` の `avatar` を書き換えてください。
指定したファイルが無い場合は `.jpg` `.jpeg` `.webp` を順に試し、
どれも無ければ名前の頭文字が円の中に表示されます。`avatar: null` でも同じです。

新しい SNS を追加したいときは、`src/components/Icon.astro` の `paths` に
24×24 の viewBox で SVG のパスを足してから、`socials` でその名前を指定します。

## 記事を書く

記事は置き場所で 2 つに分かれています。

| 場所 | 中身 | 管理しているリポジトリ |
| --- | --- | --- |
| `drafts/` | 書きかけの下書き | 別の **private** リポジトリ |
| `src/content/blog/` | 公開している記事 | このリポジトリ（public） |

`drafts/` はこのリポジトリの `.gitignore` に入れてあるので、下書きは公開サイトにも
GitHub の公開リポジトリにも出ません。書き終えたものだけを `src/content/blog/` へ移して公開します。

### 下書きの保存先

下書きの保存先は **private** リポジトリ
[0tsu-0w0/blog-writing](https://github.com/0tsu-0w0/blog-writing) です。設定は済んでいるので、
普段は何もしなくて構いません。

新しく手元にこのサイトを持ってきたとき（別の PC で clone したときなど）は、
一度だけ次を実行して `drafts/` を保存先につなぎます。

```
npm run drafts:setup -- https://github.com/0tsu-0w0/blog-writing.git
```

保存先を変えたくなったら `git -C drafts remote set-url origin <URL>` で差し替えられます。

### 1. 下書きを作る

```
npm run new-post
```

タイトル・説明・ファイル名・タグを順に聞かれ、`drafts/<ファイル名>.md` ができて
VS Code で開きます。ファイル名は空のまま Enter でも構いません（タイトルが英数字なら
そこから、日本語なら今日の日付が候補になります）。

タイトルと説明をその場で渡すこともできます。

```
npm run new-post -- "記事のタイトル" "説明文"
```

ファイル名やタグまで指定したいときは、**npm を挟まず** `node` で直に呼びます。

```
node scripts/new-post.mjs --title "記事のタイトル" --description "説明文" --slug my-post --tags "雑記,Astro"
```

> **PowerShell での注意**
> `npm run new-post -- --title "…"` と書くと、npm が `--title` などのオプション名を
> 自分のものとして取り込んでしまい、値だけがスクリプトに渡ります。
> オプションを使うときは上のように `node` で直に呼ぶか、`--` を引用符でくくって
> `npm run new-post '--' --title "…"` としてください。

| オプション | 意味 |
| --- | --- |
| `--title` | 記事のタイトル |
| `--description` | 一覧や OGP に出る説明文 |
| `--slug` | ファイル名 兼 URL（英小文字・数字・ハイフン） |
| `--tags` | カンマ区切りのタグ |
| `--no-open` | 作ったあと VS Code で開かない |
| `--help` | 使い方を表示する |

手で書き足すときのために、VS Code のスニペットも入れてあります。Markdown ファイルで
`post` と打つとフロントマターが展開されます（`.vscode/blog.code-snippets`）。
更新日の行だけ足すときは `updated` です。

### 2. 書きながら確認する

```
npm run dev
```

- `http://localhost:4321/blog/drafts/` … 下書きの一覧
- `http://localhost:4321/blog/drafts/<ファイル名>/` … 下書きの本文

このプレビューは開発サーバーにだけあり、公開ビルドには含まれません。
下書きはフロントマターが途中でもプレビューできます（足りない項目は仮の値で埋めます）。

### 3. 下書きを保存する

```
npm run save
```

変更を見せて確認したうえで、private リポジトリへ commit + push します。
`-m "メモ"` でコミットメッセージを指定でき、`--yes` で確認を省けます。

### 4. 公開する

```
npm run publish-post
```

下書きを選ぶと、次の順に進みます。

1. `drafts/<名前>.md` を `src/content/blog/<名前>.md` へ移す
2. `npm run build` が通るか確かめる（**通らなければ下書きに戻します**）
3. private リポジトリ側に「公開したので下書きから削除」を記録する
4. このリポジトリにコミットし、**確認のうえ** `git push origin main` する

4 の push でサイトに反映されます。コミットまでで止めたいときは `--no-push` を付けてください。

### いま何があるか見る

```
npm run posts
```

下書きと公開中の記事を、タイトル・ファイル名・URL 付きで一覧します。
保存していない下書きが残っているかどうかも最後に出ます。

### フロントマター

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

`updatedDate`（更新日）は任意です。`draft: true` は、**公開済みの記事を一時的に
サイトから隠す**ためのものです（下書きかどうかは `drafts/` にあるかで決まります）。

### 消したはずの記事が残るとき

Astro は読み込んだ記事を `node_modules/.astro/data-store.json` に覚えています。
ファイルを消したり移したりしたあと、これが古いままだと、もう無い記事が
ビルドやプレビューに出てくることがあります。その場合はキャッシュを捨ててください。

```powershell
Remove-Item -Recurse -Force node_modules/.astro
```

`npm run publish-post` は、公開前のビルド確認をする前に自動で捨てています。

## SNS で共有されたときの見え方（OGP）

すべてのページに Open Graph と X のカード用のメタタグが入っています。
Facebook・X・LINE・Discord・Slack・Mastodon・Bluesky・はてなブックマークなど、
OGP を読む一般的なサービスで、タイトル・説明・画像付きのカードとして表示されます。

カード画像は `public/og.png`（1200x630）です。名前やタグラインを変えたら
作り直してください。

```
npm run og-image
```

生成に使う素材は `public/avatar.jpg` と `src/site.config.ts` の
`name` / `nameRoman` / `tagline` です。レイアウトを変えたいときは
`scripts/og-image.mjs` を編集します。**生成した PNG はコミットします**
（公開時のビルドでは作り直しません）。

記事ごとにカード画像を変えたいときは、フロントマターに `image` を足します。

```markdown
---
title: '記事のタイトル'
image: '/og-posts/my-post.png'
---
```

記事ページは `og:type` が `article` になり、公開日・更新日・タグも
メタタグとして出力されます。

## SNS などの埋め込み

段落に URL だけを 1 行で書くと、埋め込みに変わります（note と同じ書き方です）。

```markdown
今日のポストです。

https://x.com/your-account/status/1234567890
```

| URL | 表示 |
| --- | --- |
| `https://x.com/<user>/status/<id>` | X のポスト |
| `https://twitter.com/<user>/status/<id>` | 同上 |
| `https://www.instagram.com/p/<id>/` | Instagram の投稿（`reel` `tv` も可） |
| `https://www.youtube.com/watch?v=<id>` | YouTube の動画（`youtu.be` も可） |
| `https://open.spotify.com/track/<id>` | Spotify のプレイヤー（`album` `playlist` `artist` `show` `episode` も可） |
| その他 | リンクカード |

文中にリンクとして書いた URL や、他の文と同じ行にある URL は、これまでどおり
普通のリンクのままです。埋め込みにしたいときは、前後を空行で挟んで URL だけの
行にしてください。

対応するサービスを増やすときは `src/lib/mdast-embeds.mjs` の `embedFor` に
条件を足します。見た目は `src/styles/global.css` の「記事本文の埋め込み」の節です。

### 注意

X と Instagram の埋め込みは、各サービスが配布するスクリプトが描画します。
そのため、**その記事を開いた人の情報が X や Instagram にも渡ります。**
スクリプトはこれらの埋め込みを使っている記事にだけ読み込まれ、使っていない記事には
入りません。YouTube は cookie を置かない `youtube-nocookie.com` を使っています。
YouTube と Spotify は iframe なので、読者の情報が渡るのは埋め込みを表示したときだけです。

X の埋め込みの配色は、ページを開いた時点のテーマに合わせます。
表示後に配色を切り替えても、埋め込みの中だけは元のままです。

## 公開

https://0tsu-0w0.github.io/ で公開しています。

`main` に push すると `.github/workflows/deploy.yml` が動き、ビルドした `dist/` が
GitHub Pages へ配信されます。手元で公開作業をする必要はありません。
GitHub の Actions タブから手動で実行することもできます。

記事の公開は `npm run publish-post` が push まで面倒を見ます（「記事を書く」を参照）。
サイトの見た目や設定を変えたときは、いつもどおり自分で commit して push してください。

公開先のドメインは `astro.config.mjs` の `site` に書いてあります。
canonical URL と OGP の URL に使われるので、独自ドメインへ移すときはここも変更してください。

## 注意（Windows）

`node_modules` を含むパスが 260 文字を超えると、Node がパッケージの設定を読めず
ビルドが失敗します（`ERR_PACKAGE_IMPORT_NOT_DEFINED`）。深い階層は避けて、
`C:\Users\<ユーザー名>\` の直下など短いパスに置いてください。
