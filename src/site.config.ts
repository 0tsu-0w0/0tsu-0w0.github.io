/**
 * サイト全体で使う設定。基本的にこのファイルだけ書き換えれば
 * 名前・肩書き・SNS リンクなどが全ページに反映されます。
 */
export const site = {
  /** サイト名（ヘッダーと <title> の末尾に使われます） */
  title: 'Your Name',
  /** 肩書き・一行紹介 */
  tagline: 'Web Developer / Tokyo',
  /** <meta name="description"> の既定値 */
  description: '個人サイトです。プロフィール、ブログ、制作物を掲載しています。',
  /** トップページの自己紹介文（段落ごとに配列の要素にする） */
  bio: [
    'はじめまして。ここに自己紹介を書きます。どんなことをしている人なのか、何に興味があるのかを 2〜3 段落でまとめると読みやすくなります。',
    '普段は Web アプリケーションの設計と実装をしています。最近は TypeScript と静的サイト生成まわりを触ることが多いです。',
  ],
  /** 得意なこと・使っている技術 */
  skills: ['TypeScript', 'Astro', 'React', 'Node.js', 'PostgreSQL', 'CSS'],
  /** 外部リンク。不要な行は消してください */
  links: [
    { label: 'GitHub', href: 'https://github.com/your-account' },
    { label: 'X', href: 'https://x.com/your-account' },
    { label: 'Email', href: 'mailto:you@example.com' },
  ],
} as const;

/** ヘッダーのナビゲーション */
export const nav = [
  { label: 'Home', href: '/' },
  { label: 'Blog', href: '/blog/' },
  { label: 'Works', href: '/works/' },
];
