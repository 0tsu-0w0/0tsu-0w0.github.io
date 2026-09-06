#!/usr/bin/env node
/**
 * いま手元にある記事の一覧を出すスクリプト。
 *
 *   npm run posts
 *
 * 「どのファイルを開けば続きが書けるのか」を確認するために使います。
 */

import { BLOG_DIR, DRAFTS_DIR, display, git, isGitRoot, listPosts } from './lib.mjs';

main();

async function main() {
  const drafts = await listPosts(DRAFTS_DIR);
  const published = await listPosts(BLOG_DIR);

  console.log('');
  console.log(`下書き（drafts/ · private リポジトリ）— ${drafts.length} 件`);
  if (drafts.length === 0) {
    console.log('  ありません。npm run new-post で作れます。');
  }
  for (const draft of drafts) {
    console.log('');
    console.log(`  ● ${draft.data.title ?? draft.slug}  (${draft.data.pubDate ?? '日付なし'})`);
    console.log(`    ファイル  : ${display(draft.file)}`);
    console.log(`    プレビュー: http://localhost:4321/blog/drafts/${draft.slug}/`);
    console.log(`    公開する  : npm run publish-post -- ${draft.slug}`);
  }

  console.log('');
  console.log(`公開中の記事（src/content/blog/）— ${published.length} 件`);
  if (published.length === 0) {
    console.log('  ありません。下書きができたら npm run publish-post で公開します。');
  }
  for (const post of published) {
    const hidden = post.data.draft ? '  ［draft: true なのでサイトには出ていません］' : '';
    console.log('');
    console.log(`  ● ${post.data.title ?? post.slug}  (${post.data.pubDate ?? '日付なし'})${hidden}`);
    console.log(`    ファイル: ${display(post.file)}`);
    console.log(`    URL     : /blog/${post.slug}/`);
  }

  console.log('');
  reportDraftsRepo();
}

/** drafts/ の private リポジトリに、まだ保存していない変更が無いかを見る */
function reportDraftsRepo() {
  if (!isGitRoot(DRAFTS_DIR)) {
    console.log('drafts/ はまだ private リポジトリになっていません（npm run drafts:setup）。');
    return;
  }

  const status = git(['status', '--porcelain'], DRAFTS_DIR);
  if (status.ok && status.stdout !== '') {
    console.log('drafts/ に保存していない変更があります → npm run save');
    return;
  }

  const ahead = git(['rev-list', '--count', '@{u}..HEAD'], DRAFTS_DIR);
  if (ahead.ok && ahead.stdout !== '0') {
    console.log(`drafts/ に push していないコミットが ${ahead.stdout} 件あります → npm run save`);
    return;
  }

  console.log('drafts/ の変更はすべて保存済みです。');
}
