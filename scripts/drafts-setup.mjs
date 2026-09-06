#!/usr/bin/env node
/**
 * drafts/ を private リポジトリにつなぐスクリプト。最初に一度だけ実行します。
 *
 *   npm run drafts:setup -- https://github.com/<ユーザー名>/<リポジトリ名>.git
 *
 * リポジトリ本体（private）は GitHub 側で作っておいてください。
 * 空の状態（README なども入れない）で作るのが一番かんたんです。
 */

import { mkdir } from 'node:fs/promises';
import { parseArgs } from 'node:util';

import { DRAFTS_DIR, display, fail, git, isGitRoot } from './lib.mjs';

const HELP = `
使い方:
  npm run drafts:setup -- <private リポジトリの URL>

例:
  npm run drafts:setup -- https://github.com/0tsu-0w0/my-site-drafts.git

事前に GitHub で private リポジトリを作っておいてください（中身は空のままで大丈夫です）。
`.trim();

main();

async function main() {
  let args;
  let positionals;
  try {
    ({ values: args, positionals } = parseArgs({
      options: { help: { type: 'boolean', default: false } },
      allowPositionals: true,
    }));
  } catch (error) {
    fail(`${error.message}\n\n${HELP}`);
  }

  if (args.help) {
    console.log(HELP);
    return;
  }

  await mkdir(DRAFTS_DIR, { recursive: true });

  if (isGitRoot(DRAFTS_DIR)) {
    const remote = git(['remote', 'get-url', 'origin'], DRAFTS_DIR);
    console.log('drafts/ はすでに private リポジトリとして設定されています。');
    console.log(remote.ok ? `  保存先: ${remote.stdout}` : '  保存先（origin）が設定されていません。');
    console.log('  保存先を変えたいときは: git -C drafts remote set-url origin <URL>');
    return;
  }

  const url = positionals[0];
  if (!url) fail(`private リポジトリの URL が必要です。\n\n${HELP}`);
  if (!/^(https:\/\/|git@)/.test(url)) {
    fail(`URL の形式が違うようです: ${url}\nhttps://... か git@... の形で渡してください。`);
  }

  run(['init', '-b', 'main'], 'drafts/ を git リポジトリにする');
  run(['remote', 'add', 'origin', url], '保存先（origin）を登録する');

  console.log('');
  console.log(`${display(DRAFTS_DIR)} を private リポジトリとして設定しました。`);
  console.log(`  保存先: ${url}`);
  console.log('');
  console.log('次にすること:');
  console.log('  npm run new-post   下書きを作る');
  console.log('  npm run save       下書きを private リポジトリへ保存（push）する');
}

function run(args, label) {
  const result = git(args, DRAFTS_DIR);
  if (!result.ok) fail(`${label}に失敗しました。\n${result.stderr || result.stdout}`);
}
