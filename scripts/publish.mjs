#!/usr/bin/env node
/**
 * 下書きを公開するスクリプト。
 *
 *   npm run publish-post                  下書きを選んで公開する
 *   npm run publish-post -- hello-blog    ファイル名を指定して公開する
 *
 * やること:
 *   1. drafts/<slug>.md を src/content/blog/<slug>.md へ移す
 *   2. npm run build でビルドが通るか確かめる（通らなければ元に戻します）
 *   3. drafts/ の private リポジトリに「公開したので削除」を記録する
 *   4. このサイトのリポジトリにコミットし、確認のうえ push する
 *      （push した時点で GitHub Actions が動き、サイトに反映されます）
 */

import { spawnSync } from 'node:child_process';
import { readFile, rename, writeFile } from 'node:fs/promises';
import { createInterface } from 'node:readline/promises';
import { parseArgs } from 'node:util';
import path from 'node:path';

import {
  BLOG_DIR,
  DRAFTS_DIR,
  ROOT,
  clearContentCache,
  confirm,
  display,
  fail,
  git,
  isGitRoot,
  isInteractive,
  listPosts,
  parseFrontmatter,
} from './lib.mjs';

const HELP = `
使い方:
  npm run publish-post [-- <ファイル名>] [オプション]

オプション:
  -y, --yes       確認を省いて push まで実行する
  --skip-build    公開前のビルド確認を省く
  --no-push       コミットまでで止める（push しない = 公開しない）
  --help          この使い方を表示する
`.trim();

main();

async function main() {
  let args;
  let positionals;
  try {
    ({ values: args, positionals } = parseArgs({
      options: {
        yes: { type: 'boolean', short: 'y', default: false },
        'skip-build': { type: 'boolean', default: false },
        'no-push': { type: 'boolean', default: false },
        help: { type: 'boolean', default: false },
      },
      allowPositionals: true,
    }));
  } catch (error) {
    fail(`${error.message}\n\n${HELP}`);
  }

  if (args.help) {
    console.log(HELP);
    return;
  }

  const slug = positionals[0] ?? (await chooseDraft());
  const from = path.join(DRAFTS_DIR, `${slug}.md`);
  const to = path.join(BLOG_DIR, `${slug}.md`);

  const source = await readFile(from, 'utf8').catch(() => null);
  if (source === null) fail(`drafts/${slug}.md が見つかりません。npm run posts で確認できます。`);
  if (await exists(to)) fail(`src/content/blog/${slug}.md はすでにあります。`);

  const data = parseFrontmatter(source);
  if (data.draft) {
    console.log('この下書きは draft: true です。このまま公開してもサイトには出ません。');
    if (await approve(args.yes, 'draft: false に直して公開しますか？')) {
      await writeFile(from, source.replace(/^draft:\s*true$/m, 'draft: false'), 'utf8');
    }
  }

  console.log('');
  console.log(`公開する記事: ${data.title ?? slug}`);
  console.log(`  ${display(from)} → ${display(to)}`);
  console.log(`  公開後の URL: /blog/${slug}/`);
  console.log('');
  if (!(await approve(args.yes, '進めますか？'))) {
    console.log('やめました。');
    return;
  }

  await rename(from, to);
  console.log(`移しました: ${display(to)}`);

  if (!args['skip-build'] && !(await runBuild())) {
    await rename(to, from);
    fail('ビルドが通らなかったので、下書きに戻しました。上のエラーを直してからやり直してください。');
  }

  await recordDraftRemoval(slug, args.yes);
  await commitAndPush(slug, data.title ?? slug, args);
}

/** 公開する下書きを選ぶ */
async function chooseDraft() {
  const drafts = await listPosts(DRAFTS_DIR);
  if (drafts.length === 0) fail('下書きがありません。npm run new-post で作れます。');
  if (drafts.length === 1) return drafts[0].slug;
  if (!isInteractive()) {
    fail(`公開する下書きを指定してください。\n${drafts.map((d) => `  ${d.slug}`).join('\n')}`);
  }

  console.log('公開する下書きを選んでください:');
  drafts.forEach((draft, index) => {
    console.log(`  ${index + 1}. ${draft.data.title ?? draft.slug}  (${draft.slug})`);
  });

  const rl = createInterface({ input: process.stdin, output: process.stdout });
  try {
    const answer = await rl.question('番号: ');
    const chosen = drafts[Number(answer.trim()) - 1];
    if (!chosen) fail('その番号の下書きはありません。');
    return chosen.slug;
  } finally {
    rl.close();
  }
}

/** 公開前にビルドが通るか確かめる */
async function runBuild() {
  console.log('');
  console.log('ビルドを確認しています…');
  // 消したはずの記事が残らないよう、キャッシュを捨ててから確かめます
  await clearContentCache();
  const result = spawnSync('npm', ['run', 'build'], { cwd: ROOT, shell: true, stdio: 'inherit' });
  return result.status === 0;
}

/** drafts/ の private リポジトリに、下書きが無くなったことを記録する */
async function recordDraftRemoval(slug, skipConfirm) {
  if (!isGitRoot(DRAFTS_DIR)) return;
  const status = git(['status', '--porcelain'], DRAFTS_DIR);
  if (!status.ok || status.stdout === '') return;

  console.log('');
  if (!(await approve(skipConfirm, 'private リポジトリ側にも「公開したので削除」を記録しますか？'))) {
    console.log('記録しませんでした。あとで npm run save を実行してください。');
    return;
  }

  git(['add', '-A'], DRAFTS_DIR);
  const committed = git(['commit', '-m', `${slug} を公開したので下書きから削除`], DRAFTS_DIR);
  if (!committed.ok) {
    console.log(`記録できませんでした: ${committed.stderr || committed.stdout}`);
    return;
  }
  const pushed = git(['push'], DRAFTS_DIR);
  console.log(pushed.ok ? 'private リポジトリを更新しました。' : 'コミットしました（push は後で npm run save を）。');
}

/** サイトのリポジトリにコミットし、確認のうえ push する */
async function commitAndPush(slug, title, args) {
  const file = `src/content/blog/${slug}.md`;
  const added = git(['add', '--', file]);
  if (!added.ok) fail(`git add に失敗しました。\n${added.stderr}`);

  const committed = git(['commit', '-m', `記事「${title}」を公開`, '--', file]);
  if (!committed.ok) fail(`コミットに失敗しました。\n${committed.stderr || committed.stdout}`);
  console.log('');
  console.log(`コミットしました: 記事「${title}」を公開`);

  if (args['no-push']) {
    console.log('push はしていません。公開するときは git push origin main を実行してください。');
    return;
  }

  const pending = git(['log', '--oneline', 'origin/main..HEAD']);
  console.log('');
  console.log('push すると、次のコミットが公開リポジトリに送られます:');
  console.log(pending.stdout === '' ? '  （なし）' : pending.stdout.split(/\r?\n/).map((l) => `  ${l}`).join('\n'));
  console.log('');

  if (!(await approve(args.yes, 'push して公開しますか？'))) {
    console.log('push はしませんでした。公開するときは git push origin main を実行してください。');
    return;
  }

  const pushed = git(['push', 'origin', 'main']);
  if (!pushed.ok) fail(`push に失敗しました。\n${pushed.stderr || pushed.stdout}`);
  console.log('');
  console.log('公開しました。GitHub Actions のビルドが終わると数分でサイトに反映されます。');
  console.log('  https://github.com/0tsu-0w0/0tsu-0w0.github.io/actions');
  console.log(`  https://0tsu-0w0.github.io/blog/${slug}/`);
}

async function approve(skipConfirm, question) {
  if (skipConfirm) return true;
  if (!isInteractive()) {
    console.log(`${question}（確認できない環境です。実行するなら --yes を付けてください）`);
    return false;
  }
  return confirm(question);
}

async function exists(file) {
  return readFile(file).then(
    () => true,
    () => false
  );
}
