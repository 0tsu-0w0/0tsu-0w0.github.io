/**
 * 記事まわりのスクリプトで共通に使う道具。
 *
 * 記事は 2 か所に分かれています。
 *   drafts/            下書き。private リポジトリで管理し、公開サイトには出ません
 *   src/content/blog/  公開する記事。このサイトのリポジトリ（public）で管理します
 */

import { spawnSync } from 'node:child_process';
import { readFile, readdir, rm } from 'node:fs/promises';
import { createInterface } from 'node:readline/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

export const ROOT = fileURLToPath(new URL('../', import.meta.url));
export const DRAFTS_DIR = path.join(ROOT, 'drafts');
export const BLOG_DIR = path.join(ROOT, 'src', 'content', 'blog');

/** ファイル名 兼 URL に使える文字 */
export const SLUG_PATTERN = /^[a-z0-9][a-z0-9-]*$/;

/** 端末から実行されているか（対話で質問してよいか） */
export const isInteractive = () => process.stdin.isTTY === true;

/** 画面に出すときの、プロジェクトからの相対パス */
export function display(filePath) {
  return path.relative(ROOT, filePath).split(path.sep).join('/');
}

/** メッセージを出して終了する */
export function fail(message) {
  console.error(message);
  process.exit(1);
}

/** ローカル時刻の YYYY-MM-DD */
export function today(date = new Date()) {
  const pad = (value) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** YAML の文字列。シングルクォートは '' に重ねてエスケープします */
export function quote(value) {
  return `'${String(value).replaceAll("'", "''")}'`;
}

/**
 * Astro がコンテンツを覚えているキャッシュを消す。
 * 記事ファイルを消したり移したりしても、このキャッシュが残っていると
 * 消したはずの記事がビルドに出てしまうため、確認の前に捨てます。
 */
export async function clearContentCache() {
  const stores = [
    path.join(ROOT, 'node_modules', '.astro', 'data-store.json'),
    path.join(ROOT, '.astro', 'data-store.json'),
  ];
  await Promise.all(stores.map((store) => rm(store, { force: true })));
}

/**
 * git を実行して結果を返す（失敗しても例外は投げません）。
 * status --porcelain は行頭の空白にも意味があるので、末尾だけを削ります。
 */
export function git(args, cwd = ROOT) {
  const result = spawnSync('git', args, { cwd, encoding: 'utf8' });
  const chomp = (value) => (value ?? '').replace(/\s+$/, '');
  return { ok: result.status === 0, stdout: chomp(result.stdout), stderr: chomp(result.stderr) };
}

/** そのフォルダが git リポジトリの最上位かどうか */
export function isGitRoot(dir) {
  const result = git(['rev-parse', '--show-toplevel'], dir);
  if (!result.ok) return false;
  return path.resolve(result.stdout) === path.resolve(dir);
}

/** はい / いいえ を聞く。対話できない環境では fallback をそのまま返します */
export async function confirm(question, fallback = false) {
  if (!isInteractive()) return fallback;
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  try {
    const answer = (await rl.question(`${question} [y/N]: `)).trim().toLowerCase();
    return answer === 'y' || answer === 'yes';
  } finally {
    rl.close();
  }
}

/**
 * フロントマターをざっくり読む（一覧表示に使う程度の簡易パーサー）。
 * 値の前後のクォートを外し、tags は配列にします。
 */
export function parseFrontmatter(source) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---/.exec(source);
  if (!match) return {};

  const data = {};
  for (const line of match[1].split(/\r?\n/)) {
    const pair = /^([A-Za-z][A-Za-z0-9_]*)\s*:\s*(.*)$/.exec(line);
    if (!pair) continue;
    const [, key, rawValue] = pair;
    const value = rawValue.trim();

    if (key === 'tags') {
      data.tags = value
        .replace(/^\[|\]$/g, '')
        .split(',')
        .map((tag) => unquote(tag.trim()))
        .filter(Boolean);
    } else if (key === 'draft') {
      data.draft = value === 'true';
    } else {
      data[key] = unquote(value);
    }
  }
  return data;
}

function unquote(value) {
  const quoted = /^'([\s\S]*)'$/.exec(value) ?? /^"([\s\S]*)"$/.exec(value);
  return quoted ? quoted[1].replaceAll("''", "'") : value;
}

/** フォルダの中の .md を読み、{ slug, file, data } の配列にして返す */
export async function listPosts(dir) {
  const names = await readdir(dir).catch(() => []);
  const posts = [];
  for (const name of names.filter((name) => name.endsWith('.md'))) {
    const file = path.join(dir, name);
    const source = await readFile(file, 'utf8');
    posts.push({ slug: name.replace(/\.md$/, ''), file, data: parseFrontmatter(source) });
  }
  return posts.sort((a, b) => String(b.data.pubDate).localeCompare(String(a.data.pubDate)));
}
