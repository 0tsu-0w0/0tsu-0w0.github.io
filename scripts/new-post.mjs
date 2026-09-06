#!/usr/bin/env node
/**
 * 下書きの雛形を作るスクリプト。
 *
 *   npm run new-post
 *     → タイトルなどを順に聞いて、drafts/<slug>.md を作り、VS Code で開きます。
 *
 *   npm run new-post -- --title "はじめての記事" --slug hello --tags "雑記,Astro"
 *     → 質問を省略して一気に作ります。渡さなかった項目だけ聞かれます。
 *
 * 作られるのは下書き（drafts/）です。公開サイトには出ません。
 * 書き終えたら npm run publish-post で src/content/blog/ に移して公開します。
 */

import { spawnSync } from 'node:child_process';
import { mkdir, readdir, writeFile } from 'node:fs/promises';
import { createInterface } from 'node:readline/promises';
import { parseArgs } from 'node:util';
import path from 'node:path';

import { DRAFTS_DIR, SLUG_PATTERN, display, fail, isInteractive, quote, today } from './lib.mjs';

const HELP = `
使い方:
  npm run new-post                       対話で作る
  npm run new-post -- [オプション]        値を渡して作る

オプション:
  --title <文字列>        記事のタイトル
  --description <文字列>  一覧や OGP に出る説明文
  --slug <文字列>         ファイル名 兼 URL（英小文字・数字・ハイフン）
  --tags <カンマ区切り>   例: --tags "雑記,Astro"
  --no-open               作ったあと VS Code で開かない
  --help                  この使い方を表示する
`.trim();

main();

async function main() {
  let args;
  try {
    ({ values: args } = parseArgs({
      options: {
        title: { type: 'string' },
        description: { type: 'string' },
        slug: { type: 'string' },
        tags: { type: 'string' },
        'no-open': { type: 'boolean', default: false },
        help: { type: 'boolean', default: false },
      },
      allowPositionals: false,
    }));
  } catch (error) {
    fail(`${error.message}\n\n${HELP}`);
  }

  if (args.help) {
    console.log(HELP);
    return;
  }

  const rl = isInteractive() ? createInterface({ input: process.stdin, output: process.stdout }) : null;

  try {
    const title = await resolveTitle(args.title, rl);
    const description = await resolveDescription(args.description, rl);
    const slug = await resolveSlug(args.slug, title, rl);
    const tags = await resolveTags(args.tags, rl);

    const filePath = path.join(DRAFTS_DIR, `${slug}.md`);
    await mkdir(DRAFTS_DIR, { recursive: true });
    // wx: すでに同じ名前の下書きがあれば上書きせずに失敗します
    await writeFile(filePath, buildPost({ title, description, tags }), {
      encoding: 'utf8',
      flag: 'wx',
    });

    console.log('');
    console.log(`下書きを作りました: ${display(filePath)}`);
    console.log(`プレビュー: npm run dev を起動して http://localhost:4321/blog/drafts/${slug}/`);
    console.log(`保存（private リポジトリへ push）: npm run save`);
    console.log(`公開: npm run publish-post -- ${slug}`);
    if (!args['no-open']) openInEditor(filePath);
  } finally {
    rl?.close();
  }
}

/** 質問して答えを返す。対話できない環境なら null */
async function ask(rl, question, fallback = '') {
  if (!rl) return null;
  const answer = await rl.question(question);
  const trimmed = answer.trim();
  return trimmed === '' ? fallback : trimmed;
}

async function resolveTitle(given, rl) {
  const title = given?.trim() || (await ask(rl, 'タイトル: '));
  if (!title) fail('タイトルが必要です。--title で指定してください。');
  return title;
}

async function resolveDescription(given, rl) {
  const description = given?.trim() || (await ask(rl, '説明（一覧や OGP に出ます）: '));
  if (!description) fail('説明が必要です。--description で指定してください。');
  return description;
}

async function resolveSlug(given, title, rl) {
  const suggestion = suggestSlug(title);
  const input =
    given?.trim() || (await ask(rl, `ファイル名（URL になります）[${suggestion}]: `, suggestion));
  const slug = input ?? suggestion;

  if (!SLUG_PATTERN.test(slug)) {
    fail(
      `ファイル名 "${slug}" は使えません。英小文字・数字・ハイフンで、先頭は英数字にしてください。`
    );
  }

  const drafts = await readdir(DRAFTS_DIR).catch(() => []);
  if (drafts.includes(`${slug}.md`)) {
    fail(`drafts/${slug}.md はすでにあります。別のファイル名にしてください。`);
  }
  return slug;
}

async function resolveTags(given, rl) {
  const input = given ?? (await ask(rl, 'タグ（カンマ区切り、なければ空 Enter）: ')) ?? '';
  return input
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
}

/**
 * タイトルからファイル名の候補を作る。
 * 日本語のタイトルだと英数字が残らないので、その場合は日付を候補にします。
 */
function suggestSlug(title) {
  const slug = title
    .toLowerCase()
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-{2,}/g, '-')
    .replace(/^-|-$/g, '');
  return SLUG_PATTERN.test(slug) ? slug : today();
}

function buildPost({ title, description, tags }) {
  const tagList = tags.length === 0 ? '[]' : `[${tags.map(quote).join(', ')}]`;
  return `---
title: ${quote(title)}
description: ${quote(description)}
pubDate: ${today()}
# updatedDate: ${today()}
tags: ${tagList}
draft: false
---

ここから本文を書きます。

## 見出し

段落を書きます。
`;
}

/** VS Code で開く。code コマンドが無ければ何もしません */
function openInEditor(filePath) {
  const result = spawnSync('code', [filePath], { shell: true, stdio: 'ignore' });
  if (result.status === 0) {
    console.log('VS Code で開きました。');
  } else {
    console.log('（VS Code の code コマンドが見つからないので、手で開いてください）');
  }
}
