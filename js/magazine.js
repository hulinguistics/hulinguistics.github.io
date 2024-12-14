// 言サ note マガジンの最新記事を取得して表示する

/** note マガジンの URL */
const url = "https://note.com/huling/m/m8a70e16198cc";

/** 取得する note マガジンの RSS URL */
const rssUrl = `https://corsproxy.io/?url=${encodeURIComponent(url + "/rss")}`;

/** 描画するコンテナの Element */
const baseElement = document.getElementById("magazine-container");

/** 取得する記事の数 */
const number = baseElement.getElementsByTagName("magazine-card").length;

/** タイトルのダミー */
const dummyTitle = "█████████████";
/** サムネイル画像のダミー */
const dummyThumbnail = "";
/** クリエイター画像のダミー */
const dummyCreatorImage = "";
/** クリエイター名のダミー */
const dummyCreatorName = "█████";
/** 公開日付のダミー */
const dummyDate = "██";
/** 記事URLのダミー */
const dummyLink = url;

/**
 * 相対的な時間差を表す文字列("1日前")を取得する関数
 * @param {Date} targetDate 調べる対象の時刻 i.e., 記事公開日
 * @param {Date} baseDate 基準の時刻 i.e., 現在の時刻
 */
const relDateString = (targetDate, baseDate) => {
  const rtf = new Intl.RelativeTimeFormat("ja");
  const diff = targetDate - baseDate;
  if (Math.abs(diff) < 60 * 1000) {
    // 1分未満
    return rtf.format(Math.floor(diff / 1000), "seconds");
  } else if (Math.abs(diff) < 60 * 60 * 1000) {
    // 1時間未満
    return rtf.format(Math.floor(diff / (60 * 1000)), "minutes");
  } else if (Math.abs(diff) < 24 * 60 * 60 * 1000) {
    // 1日未満
    return rtf.format(Math.floor(diff / (60 * 60 * 1000)), "hours");
  } else if (Math.abs(diff) < 30 * 24 * 60 * 60 * 1000) {
    // 1月未満
    return rtf.format(Math.floor(diff / (24 * 60 * 60 * 1000)), "days");
  } else if (Math.abs(diff) < 365 * 30 * 24 * 60 * 60 * 1000) {
    // 1年未満
    return rtf.format(Math.floor(diff / (30 * 24 * 60 * 60 * 1000)), "months");
  } else {
    // 数年
    return rtf.format(Math.floor(diff / 31556925168), "years");
  }
}

/**
 * マガジンのカードの WebComponents
 *
 * ```html
 * <magazine-card
 *  title="タイトル"
 *  thumbnail="https://(サムネイル画像のURL)"
 *  creatorImage="https://(クリエイター画像のURL)"
 *  creatorName="クリエイター名"
 *  date="(投稿日時)"
 *  link="https://(記事URL)"
 * ></magazine-card>
 * ```
 */
class MagazineCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.render();
  }
  static get observedAttributes() {
    return ["title", "thumbnail", "creatorImage", "creatorName", "date", "link"];
  }
  attributeChangedCallback() {
    this.render();
  }
  /** カード内部をレンダする関数 */
  render() {
    // 引数を取得(引数がないときはダミーに差し替え)
    const title = this.getAttribute("title") || dummyTitle;
    const thumbnail = this.getAttribute("thumbnail") || dummyThumbnail;
    const creatorImage = this.getAttribute("creatorImage") || dummyCreatorImage;
    const creatorName = this.getAttribute("creatorName") || dummyCreatorName;
    const date = this.getAttribute("date") || dummyDate;
    const link = this.getAttribute("link") || dummyLink;

    // 公開日付がダミーのときはカード全体がダミーと解釈
    const dummyMode = date === dummyDate;

    const relDate = dummyMode ? "" : relDateString(new Date(date), new Date());

    // カード内部を書き換え
    this.shadowRoot.innerHTML = `
      <style>
        a {
          display: grid;
          grid-template-rows: auto 1fr auto;
          grid-template-columns: 2em 1fr auto;
          align-items: center;
          text-decoration: none;
          gap: 0.8rem 0.5rem;

          .thumbnail {
            grid-row: 1 / 2;
            grid-column: 1 / 4;
            display: block;
            width: 100%;
            aspect-ratio: 2 / 1;
            background: var(--color-bg-sub);
            transition: 200ms;
          }

          &:hover img.thumbnail {
            opacity: 0.6;
          }

          h3 {
            grid-row: 2 / 3;
            grid-column: 1 / 4;
            margin: 0;
            padding: 0;
            color: ${dummyMode ? "var(--color-bg-sub)" : "var(--color-text)"};
            word-wrap: ${dummyMode ? "break-word" : "inherit"};
          }

          .creatorImage {
            grid-row: 3 / 4;
            grid-column: 1 / 2;
            display: block;
            width: 2em;
            aspect-ratio: 1 / 1;
            background: var(--color-bg-sub);
            border-radius: 50%;
          }

          span {
            color: ${dummyMode ? "var(--color-bg-sub)" : "var(--color-text-sub)"};
            white-space: nowrap;

            &.creatorName {
              overflow: hidden;
              text-overflow: ellipsis;
            }
          }
        }
      </style>
      <a href="${link}">
        ${thumbnail
          ? `<img class="thumbnail" src="${thumbnail}" alt="${title}" />`
          : `<div class="thumbnail"></div>`
        }
        <h3>${title}</h3>
        ${creatorImage
          ? `<img class="creatorImage" src="${creatorImage}" alt="${creatorName}" />`
          : `<div class="creatorImage"></div>`
        }
        <span class="creatorName">${creatorName}</span>
        <span class="pubDate">${dummyMode ? date : `<time datetime="${date}">${relDate}</time>`}</span>
      </a>
    `;
  }
}

// WebComponents を登録
customElements.define("magazine-card", MagazineCard);

(async () => {
  // RSS を fetch して xml を取り出す
  const res = await fetch(rssUrl);
  const str = await res.text();
  const xml = new window.DOMParser().parseFromString(str, "text/xml");

  // xml から最新の投稿を取り出す
  const items = Array
    .from(xml.getElementsByTagName("item"))
    .sort((a, b) => {
      /** @param {Element} item */
      const getDate = (item) => new Date(item.getElementsByTagName("pubDate")[0].innerHTML);
      return getDate(b) - getDate(a);
    })
    .slice(0, number);

  // 書き換え対象の Element のリスト
  const cardElements = baseElement.getElementsByTagName("magazine-card");

  // item ごとに書き換える
  for (const [i, item] of items.entries()) {
    // 空の Element を作成
    const element = document.createElement("magazine-card");

    // xml から情報を抜き出す
    const title = item.getElementsByTagName("title")[0].innerHTML;
    const thumbnail = item.getElementsByTagName("media:thumbnail")[0].innerHTML;
    const creatorImage = item.getElementsByTagName("note:creatorImage")[0].innerHTML;
    const creatorName = item.getElementsByTagName("note:creatorName")[0].innerHTML;
    const date = item.getElementsByTagName("pubDate")[0].innerHTML;
    const link = item.getElementsByTagName("link")[0].innerHTML;

    // Element の atributes に代入
    element.setAttribute("title", title);
    element.setAttribute("thumbnail", thumbnail);
    element.setAttribute("creatorImage", creatorImage);
    element.setAttribute("creatorName", creatorName);
    element.setAttribute("date", date);
    element.setAttribute("link", link);

    // 作成した Element に差し替え
    cardElements[i].replaceWith(element);
  }
})();
