// @ts-check
import { defineConfig } from 'astro/config';
import { satteri } from '@astrojs/markdown-satteri';
import embeds from './src/lib/mdast-embeds.mjs';

/**
 * 下書きのプレビューを開発サーバーにだけ生やす。
 * ページの実体は src/pages/_drafts/ に置いてあります（_ で始まるフォルダは
 * そのままではルートにならないため、ここで dev のときだけ割り当てています）。
 */
function draftsPreview() {
  return {
    name: 'drafts-preview',
    hooks: {
      'astro:config:setup': ({ command, injectRoute }) => {
        if (command !== 'dev') return;
        injectRoute({ pattern: '/blog/drafts', entrypoint: './src/pages/_drafts/index.astro' });
        injectRoute({
          pattern: '/blog/drafts/[...slug]',
          entrypoint: './src/pages/_drafts/[...slug].astro',
        });
      },
    },
  };
}

// https://astro.build/config
export default defineConfig({
  // GitHub Pages のユーザーサイトとして公開する。
  // canonical URL と OGP の URL に使われます。
  site: 'https://0tsu-0w0.github.io',
  build: {
    // すべてのページを /path/index.html として出力します（末尾スラッシュ付き URL）
    format: 'directory',
  },
  markdown: {
    // 記事に URL だけの行を書くと埋め込みに変わる
    processor: satteri({ mdastPlugins: [embeds()] }),
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
    },
  },
  integrations: [draftsPreview()],
});
