/**
 * 記事本文に書いた URL を埋め込みに変える Markdown プラグイン。
 *
 * note と同じように、段落に URL だけを 1 行で書くと埋め込みになります。
 * 文中にリンクとして書いた URL は、これまでどおり普通のリンクのままです。
 *
 *   https://x.com/user/status/123        → ポストの埋め込み
 *   https://www.instagram.com/p/xxxx/    → 投稿の埋め込み
 *   https://www.youtube.com/watch?v=xxx  → 動画プレイヤー
 *   https://open.spotify.com/track/xxx   → 再生プレイヤー
 *   その他の URL                          → リンクカード
 *
 * X と Instagram は各サービスが配布するスクリプトで描画されるため、
 * 実際に使われている記事にだけ、読み込み用の script を末尾に足しています。
 */
import { defineMdastPlugin } from 'satteri';

/** HTML の属性に URL を埋めるときの最低限のエスケープ */
function escapeAttr(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function embedFor(rawUrl, used) {
  let url;
  try {
    url = new URL(rawUrl);
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^www\./, '');
  const href = escapeAttr(rawUrl);

  // X（旧 Twitter）のポスト
  if (
    (host === 'x.com' || host === 'twitter.com') &&
    /^\/[^/]+\/status\/\d+/.test(url.pathname)
  ) {
    used.x = true;
    return `<div class="embed embed-x"><blockquote class="twitter-tweet" data-dnt="true"><a href="${href}">${href}</a></blockquote></div>`;
  }

  // Instagram の投稿・リール
  if (host === 'instagram.com' && /^\/(p|reel|tv)\/[^/]+/.test(url.pathname)) {
    used.instagram = true;
    const permalink = escapeAttr(`${url.origin}${url.pathname}`);
    return `<div class="embed embed-instagram"><blockquote class="instagram-media" data-instgrm-permalink="${permalink}" data-instgrm-version="14"><a href="${href}">${href}</a></blockquote></div>`;
  }

  // YouTube。cookie を置かない nocookie ドメインを使う
  let videoId = null;
  if (host === 'youtu.be') {
    videoId = url.pathname.slice(1);
  } else if (host === 'youtube.com' && url.pathname === '/watch') {
    videoId = url.searchParams.get('v');
  }
  if (videoId && /^[\w-]{6,}$/.test(videoId)) {
    const id = escapeAttr(videoId);
    return `<div class="embed embed-video"><iframe src="https://www.youtube-nocookie.com/embed/${id}" title="YouTube の動画" loading="lazy" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`;
  }

  // Spotify の曲・アルバム・プレイリストなど
  if (host === 'open.spotify.com') {
    const segments = url.pathname.split('/').filter(Boolean);
    // https://open.spotify.com/intl-ja/track/xxx のように言語が挟まることがある
    if (segments[0]?.startsWith('intl-')) segments.shift();
    const [type, id] = segments;
    // 種類ごとにプレイヤーの高さが決まっている
    const heights = {
      track: 152,
      episode: 232,
      album: 352,
      playlist: 352,
      artist: 352,
      show: 352,
    };
    if (type in heights && /^[A-Za-z0-9]+$/.test(id ?? '')) {
      return `<div class="embed embed-spotify"><iframe src="https://open.spotify.com/embed/${type}/${escapeAttr(id)}" title="Spotify のプレイヤー" height="${heights[type]}" loading="lazy" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" allowfullscreen></iframe></div>`;
    }
  }

  // それ以外はリンクカード
  return `<div class="embed"><a class="link-card" href="${href}" target="_blank" rel="noopener noreferrer"><span class="link-card-host">${escapeAttr(host)}</span><span class="link-card-url">${href}</span></a></div>`;
}

/** その段落が「URL 1 個だけ」かどうかを見て、URL を返す */
function soleUrl(node) {
  const children = node.children ?? [];
  if (children.length !== 1) return null;
  const child = children[0];

  // 自動リンクで link ノードになっている場合
  if (child.type === 'link') {
    const labels = child.children ?? [];
    if (
      labels.length === 1 &&
      labels[0].type === 'text' &&
      labels[0].value.trim() === child.url
    ) {
      return child.url;
    }
    return null;
  }

  // 素のテキストとして書かれている場合
  if (child.type === 'text' && /^https?:\/\/\S+$/.test(child.value.trim())) {
    return child.value.trim();
  }

  return null;
}

const TWITTER_SCRIPTS =
  // 描画前にサイトの配色を伝えておく（読み込み後のテーマ変更には追従しません）
  '<script>(function(){var r=document.documentElement;var dark=r.dataset.theme==="dark"||(!r.dataset.theme&&matchMedia("(prefers-color-scheme: dark)").matches);if(dark){document.querySelectorAll(".twitter-tweet").forEach(function(el){el.setAttribute("data-theme","dark")})}})();</script>' +
  '<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>';

const INSTAGRAM_SCRIPT = '<script async src="https://www.instagram.com/embed.js"></script>';

/**
 * ファクトリとして渡すことで、記事 1 本ごとに状態を持たせる
 * （どのサービスの埋め込みが使われたかを数えるため）。
 */
export default function embeds() {
  return () => {
    const used = { x: false, instagram: false };

    return defineMdastPlugin({
      name: 'embeds',

      paragraph(node) {
        const url = soleUrl(node);
        if (!url) return;
        const html = embedFor(url, used);
        if (html) return { raw: html, mdxExpressions: false };
      },

      after(root, ctx) {
        const scripts = [];
        if (used.x) scripts.push(TWITTER_SCRIPTS);
        if (used.instagram) scripts.push(INSTAGRAM_SCRIPT);
        if (scripts.length > 0) {
          ctx.appendChild(root, { raw: scripts.join(''), mdxExpressions: false });
        }
      },
    });
  };
}
