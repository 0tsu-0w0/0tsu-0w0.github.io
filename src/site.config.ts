/**
 * サイト全体で使う設定。基本的にこのファイルだけ書き換えれば
 * 名前・肩書き・リンク・SNS が全ページに反映されます。
 */
export const site = {
  /** サイト名（<title> の末尾に使われます） */
  title: '長月おつ',
  /** トップに大きく出る表示名 */
  name: '長月おつ',
  /** 名前のローマ字表記。トップで名前の下に小さく出ます（不要なら null） */
  nameRoman: 'Nagatuki 0tsu',
  /** 肩書き・一行紹介 */
  tagline: '関東のどこかにいる化学徒',
  /** <meta name="description"> の既定値 */
  description: 'リンクまとめ、ブログ、プロフィールを置いている個人サイトです。',
  /**
   * トップの円形アイコン。public/ に画像を置いて
   * '/avatar.jpg' のように指定してください。
   * null にすると name の頭文字が代わりに表示されます。
   */
  avatar: '/avatar.jpg',
} as const;

/**
 * トップページに縦に並ぶリンクボタン。
 * 上から表示されるので、見せたい順に並べてください。
 * internal: true はサイト内ページ、false は外部リンク（別タブで開きます）。
 */
export const linkButtons = [
  {
    label: 'Blog',
    note: '書いたものの一覧',
    href: '/blog/',
    internal: true,
  },
  {
    label: 'Profile',
    note: 'これまでのことと、できること',
    href: '/profile/',
    internal: true,
  },
  {
    label: 'pixiv',
    note: 'イラストを投稿しています',
    href: 'https://www.pixiv.net/users/110858681',
    internal: false,
  },
  {
    label: 'X',
    note: '日々の記録',
    href: 'https://twitter.com/_0tmz4_09',
    internal: false,
  },
  {
    label: 'GitHub',
    note: 'コードとつくったもの',
    href: 'https://github.com/0tsu-0w0',
    internal: false,
  },
  {
    label: 'Contact',
    note: 'ご連絡はメールで',
    href: 'mailto:otsu.sapphire09@gmail.com',
    internal: false,
  },
];

/**
 * 円形アイコンで並ぶ SNS リンク。
 * icon に使えるのは 'x' | 'instagram' | 'github' | 'mail' | 'note' です
 * （増やしたいときは src/components/Icon.astro に SVG を追加）。
 */
export const socials = [
  { icon: 'x', label: 'X', href: 'https://twitter.com/_0tmz4_09' },
  { icon: 'pixiv', label: 'pixiv', href: 'https://www.pixiv.net/users/110858681' },
  { icon: 'github', label: 'GitHub', href: 'https://github.com/0tsu-0w0' },
  { icon: 'mail', label: 'Email', href: 'mailto:otsu.sapphire09@gmail.com' },
] as const;

/** 下層ページのヘッダーに並ぶナビゲーション */
export const nav = [
  { label: 'Home', href: '/' },
  { label: 'Blog', href: '/blog/' },
  { label: 'Profile', href: '/profile/' },
];

/** Profile ページの中身 */
export const profile = {
  bio: [
    'はじめまして。ここに自己紹介を書きます。どんなことをしている人なのか、何に興味があるのかを 2〜3 段落でまとめると読みやすくなります。',
    '普段は Web アプリケーションの設計と実装をしています。最近は TypeScript と静的サイト生成まわりを触ることが多いです。',
  ],
  skills: ['TypeScript', 'Astro', 'React', 'Node.js', 'PostgreSQL', 'CSS'],
  /** 経歴。新しいものを上に */
  history: [
    { year: '2024 —', text: 'フリーランスとして Web 開発を請け負う' },
    { year: '2021 — 2024', text: '事業会社で自社サービスの開発に従事' },
    { year: '2021', text: '大学卒業' },
  ],
};
