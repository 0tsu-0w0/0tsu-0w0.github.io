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
  /** フッターの著作権表記に使う名義 */
  copyright: '0tus Nagatuk1',
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
    note: 'ご依頼・お問い合わせについて',
    href: '/contact/',
    internal: true,
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
  { label: 'Contact', href: '/contact/' },
];

/** Profile ページの中身 */
export const profile = {
  /** 自己紹介の本文。段落ごとに配列の要素にする（空配列なら表示されません） */
  bio: [],
  /** ラベルと内容の組。上から順に並びます */
  details: [
    { label: '専攻', value: '工学 / 有機化学' },
    { label: '使用ツール', value: 'CLIP STUDIO PAINT（補助として Affinity、Procreate）' },
    { label: '使用デバイス', value: 'iPad' },
  ],
  /**
   * 経歴。新しいものを上に並べます。
   * current: true の行は、year を書かなくても年の表示が常に現在の年になります
   * （ビルド時の値を埋め込んだうえで、閲覧時にブラウザ側で上書きします）。
   */
  history: [
    { year: null, current: true, text: '同大学に在学中' },
    { year: '2023/04', current: false, text: '某大学工学部化学科入学' },
  ],
};

/**
 * Contact ページの中身。
 * state は 'open'（受付中）/ 'caution'（要相談）/ 'closed'（受付停止）の 3 種類で、
 * バッジの文言と色が変わります。
 */
export const contact = {
  /** 連絡先メールアドレス */
  email: 'otsu.sapphire09@gmail.com',
  /** 受付状況。カードとして横に並びます */
  statuses: [
    {
      label: 'イラスト依頼',
      state: 'caution',
      note: '内容と条件によってはお受けできます。',
      updated: '2026.09.06',
    },
    {
      label: 'アイコン制作',
      state: 'closed',
      note: '',
      updated: '2026.09.06',
    },
  ],
  /** 案内ボックスの見出し */
  noticeTitle: 'ご依頼について',
  /** 箇条書きの前に置く段落 */
  intro: [
    'ご依頼をご検討いただきありがとうございます。相談ベースでの対応も可能ですので、お気軽にご連絡ください。',
  ],
  /** 「ご依頼の際は」に続く箇条書き */
  checklist: ['利用用途', '予算', '納期'],
  /** 箇条書きの後に置く段落 */
  outro: [
    '詳細が決まりきっていない状態でも構いません。何卒よろしくお願いいたします。',
    '学業の都合上、いただいたご依頼はまとめて可否を判断しております。返答までお待ちいただく場合があります。また、すべてのお問い合わせにお返事をお約束するものではございません。あらかじめご了承ください。',
  ],
};
