#!/usr/bin/env node
/**
 * SNS で共有されたときに出るカード画像（public/og.png）を作り直すスクリプト。
 *
 *   npm run og-image
 *
 * 名前やタグラインを変えたときに実行してください。
 * 生成した PNG はリポジトリにコミットします（ビルド時には生成しません）。
 */
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// OGP の推奨サイズ。X・Facebook・LINE・Discord・Slack いずれもこの比率で表示される
const WIDTH = 1200;
const HEIGHT = 630;

const AVATAR_SIZE = 300;
const AVATAR_X = 110;
const AVATAR_Y = (HEIGHT - AVATAR_SIZE) / 2;
const TEXT_X = AVATAR_X + AVATAR_SIZE + 80;

/** site.config.ts から表示に使う値を読む（TypeScript を実行せずに済ませる） */
async function readSiteConfig() {
  const source = await readFile(path.join(ROOT, 'src/site.config.ts'), 'utf8');
  const pick = (key) => {
    const match = source.match(new RegExp(key + ": *'([^']*)'"));
    return match ? match[1] : '';
  };
  return {
    name: pick('name'),
    nameRoman: pick('nameRoman'),
    tagline: pick('tagline'),
  };
}

function escapeXml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

const { name, nameRoman, tagline } = await readSiteConfig();

const background = `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}">
  <rect width="${WIDTH}" height="${HEIGHT}" fill="#fbfbf9"/>
  <rect x="0" y="0" width="${WIDTH}" height="10" fill="#9a3412"/>
  <text x="${TEXT_X}" y="284" font-family="Yu Gothic UI, Yu Gothic, Meiryo, Hiragino Sans, sans-serif" font-size="76" font-weight="700" fill="#1c1b19">${escapeXml(name)}</text>
  <text x="${TEXT_X}" y="330" font-family="Segoe UI" font-size="26" letter-spacing="5" fill="#6b6862">${escapeXml(nameRoman.toUpperCase())}</text>
  <text x="${TEXT_X}" y="400" font-family="Yu Gothic UI, Yu Gothic, Meiryo, Hiragino Sans, sans-serif" font-size="32" fill="#6b6862">${escapeXml(tagline)}</text>
  <text x="${TEXT_X}" y="470" font-family="Consolas, monospace" font-size="22" fill="#9a3412">0tsu-0w0.github.io</text>
</svg>`;

const mask = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${AVATAR_SIZE}" height="${AVATAR_SIZE}"><circle cx="${AVATAR_SIZE / 2}" cy="${AVATAR_SIZE / 2}" r="${AVATAR_SIZE / 2}" fill="#fff"/></svg>`
);

const avatar = await sharp(path.join(ROOT, 'public/avatar.jpg'))
  .resize(AVATAR_SIZE, AVATAR_SIZE, { fit: 'cover' })
  .composite([{ input: mask, blend: 'dest-in' }])
  .png()
  .toBuffer();

const output = await sharp(Buffer.from(background))
  .composite([{ input: avatar, left: AVATAR_X, top: Math.round(AVATAR_Y) }])
  .png()
  .toBuffer();

const target = path.join(ROOT, 'public/og.png');
await writeFile(target, output);
console.log(`public/og.png を作成しました（${WIDTH}x${HEIGHT}, ${Math.round(output.length / 1024)}KB）`);
