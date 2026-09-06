#!/usr/bin/env node
/**
 * 下書きを private リポジトリへ保存（commit + push）するスクリプト。
 *
 *   npm run save                      変更を確認してから保存する
 *   npm run save -- -m "メモを追記"    コミットメッセージを指定する
 *   npm run save -- --yes             確認を省いて保存する
 *
 * 保存先は drafts/ につないだ private リポジトリです。
 * このサイトのリポジトリ（public）には push しません。公開は npm run publish-post です。
 */

import { parseArgs } from 'node:util';

import { DRAFTS_DIR, confirm, fail, git, isGitRoot, isInteractive } from './lib.mjs';

const HELP = `
使い方:
  npm run save [-- オプション]

オプション:
  -m, --message <文字列>  コミットメッセージ（省略すると自動で作ります）
  -y, --yes               確認を省いてそのまま保存する
  --help                  この使い方を表示する
`.trim();

main();

async function main() {
  let args;
  try {
    ({ values: args } = parseArgs({
      options: {
        message: { type: 'string', short: 'm' },
        yes: { type: 'boolean', short: 'y', default: false },
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

  if (!isGitRoot(DRAFTS_DIR)) {
    fail(
      'drafts/ がまだ private リポジトリになっていません。\n' +
        '  npm run drafts:setup -- <private リポジトリの URL>\n' +
        'を先に実行してください。'
    );
  }

  const status = git(['status', '--porcelain'], DRAFTS_DIR);
  if (!status.ok) fail(`drafts/ の状態を読めませんでした。\n${status.stderr}`);

  const changes = status.stdout === '' ? [] : status.stdout.split(/\r?\n/);
  if (changes.length > 0) {
    console.log('保存する変更:');
    for (const line of changes) console.log(`  ${line}`);
    console.log('');

    if (!(await approve(args.yes, '上の変更を private リポジトリに保存しますか？'))) {
      console.log('やめました。');
      return;
    }

    const added = git(['add', '-A'], DRAFTS_DIR);
    if (!added.ok) fail(`git add に失敗しました。\n${added.stderr}`);

    const message = args.message?.trim() || defaultMessage(changes);
    const committed = git(['commit', '-m', message], DRAFTS_DIR);
    if (!committed.ok) fail(`コミットに失敗しました。\n${committed.stderr || committed.stdout}`);
    console.log(`コミットしました: ${message}`);
  } else {
    console.log('保存していない変更はありません。');
  }

  await push(args.yes);
}

/** push していないコミットがあれば push する */
async function push(skipConfirm) {
  const branch = git(['branch', '--show-current'], DRAFTS_DIR).stdout || 'main';
  const hasUpstream = git(['rev-parse', '--abbrev-ref', '@{u}'], DRAFTS_DIR).ok;

  if (hasUpstream) {
    const ahead = git(['rev-list', '--count', '@{u}..HEAD'], DRAFTS_DIR);
    if (ahead.ok && ahead.stdout === '0') {
      console.log('GitHub の private リポジトリと同じ状態です。');
      return;
    }
  }

  const remote = git(['remote', 'get-url', 'origin'], DRAFTS_DIR);
  if (!remote.ok) {
    fail('保存先（origin）が設定されていません。npm run drafts:setup を実行してください。');
  }

  if (!(await approve(skipConfirm, `${remote.stdout} へ push しますか？`))) {
    console.log('push はしませんでした。コミットは手元に残っています。');
    return;
  }

  const args = hasUpstream ? ['push'] : ['push', '-u', 'origin', branch];
  const pushed = git(args, DRAFTS_DIR);
  if (!pushed.ok) fail(`push に失敗しました。\n${pushed.stderr || pushed.stdout}`);
  console.log('保存しました（private リポジトリへ push 済み）。');
}

/** 確認を取る。--yes なら聞かず、端末でないときは中止します */
async function approve(skipConfirm, question) {
  if (skipConfirm) return true;
  if (!isInteractive()) {
    console.log(`${question}（確認できない環境です。実行するなら --yes を付けてください）`);
    return false;
  }
  return confirm(question);
}

function defaultMessage(changes) {
  const entries = changes
    .map((line) => ({ code: line.slice(0, 2), name: line.slice(3).trim().replace(/^"|"$/g, '') }))
    .filter((entry) => entry.name.endsWith('.md'));

  if (entries.length === 0) return '下書きを更新';

  const verb = pickVerb(entries.map((entry) => entry.code));
  if (entries.length === 1) return `下書き ${entries[0].name.replace(/\.md$/, '')} を${verb}`;
  return `下書きを${verb}（${entries.length} 件）`;
}

/** git status の記号から「追加」「削除」「更新」を決める */
function pickVerb(codes) {
  if (codes.every((code) => code === '??' || code.startsWith('A'))) return '追加';
  if (codes.every((code) => code.includes('D'))) return '削除';
  return '更新';
}
