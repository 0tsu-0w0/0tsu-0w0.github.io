// @ts-check
import { defineConfig } from 'astro/config';

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
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
    },
  },
});
