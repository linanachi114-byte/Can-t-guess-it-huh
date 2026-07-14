import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const root = path.join(path.dirname(__filename), "..");
const bankPath = path.join(root, "data", "wordbank.json");
const imageRoot = path.join(root, "public", "images");
const force = process.argv.includes("--force");
const forceSpire = force || process.argv.includes("--force-spire");
const noFallback = process.argv.includes("--no-fallback");

const stats = {
  total: 0,
  skipped: 0,
  downloaded: 0,
  bing: 0,
  generated: 0,
  failed: 0
};

const contextQueries = {
  "日常物品": ["日用品", "物品"],
  "自然与生物": ["自然", "生物"],
  "食物饮品": ["食物", "饮品"],
  "地点": ["地点", "建筑"],
  "科技产品": ["科技产品", "设备"],
  "职业身份": ["职业", "人物"],
  "歌曲": ["歌曲", "专辑封面"],
  "名画": ["名画", "画作", "painting"],
  "名人": ["人物", "传记"],
  "影视动漫": ["电影", "动漫", "动画"],
  "杀戮尖塔": ["Slay the Spire", "杀戮尖塔"]
};

const wikipediaTitleSuffixes = {
  "歌曲": ["(歌曲)", "(单曲)"],
  "名画": ["(画作)", "(绘画)"],
  "影视动漫": ["(电影)", "(动画)", "(漫画)"],
  "杀戮尖塔": ["(杀戮尖塔)"]
};

const spireEntries = {
  "悔恨": { type: "card", english: "Regret", kind: "Curse" },
  "打击": { type: "card", english: "Strike", kind: "Attack" },
  "防御": { type: "card", english: "Defend", kind: "Skill" },
  "重击": { type: "card", english: "Bash", kind: "Attack" },
  "痛击": { type: "card", english: "Pummel", kind: "Attack" },
  "旋风斩": { type: "card", english: "Whirlwind", kind: "Attack" },
  "完美打击": { type: "card", english: "Perfected Strike", kind: "Attack" },
  "祭品": { type: "card", english: "Offering", kind: "Skill" },
  "恶魔形态": { type: "card", english: "Demon Form", kind: "Power" },
  "壁垒": { type: "card", english: "Barricade", kind: "Power" },
  "火焰吐息": { type: "card", english: "Fire Breathing", kind: "Power" },
  "震荡波": { type: "card", english: "Shockwave", kind: "Skill" },
  "中和": { type: "card", english: "Neutralize", kind: "Attack" },
  "生存者": { type: "card", english: "Survivor", kind: "Skill" },
  "弹跳药瓶": { type: "card", english: "Bouncing Flask", kind: "Skill" },
  "催化剂": { type: "card", english: "Catalyst", kind: "Skill" },
  "尸爆术": { type: "card", english: "Corpse Explosion", kind: "Skill" },
  "幻影杀手": { type: "card", english: "Phantasmal Killer", kind: "Skill" },
  "余像": { type: "card", english: "After Image", kind: "Power" },
  "凌迟": { type: "card", english: "Finisher", kind: "Attack" },
  "电击": { type: "card", english: "Zap", kind: "Skill" },
  "双重释放": { type: "card", english: "Dualcast", kind: "Skill" },
  "暴风雨": { type: "card", english: "Storm", kind: "Power" },
  "机器学习": { type: "card", english: "Machine Learning", kind: "Power" },
  "创造性AI": { type: "card", english: "Creative AI", kind: "Power" },
  "缓冲": { type: "card", english: "Buffer", kind: "Power" },
  "搜寻": { type: "card", english: "Seek", kind: "Skill" },
  "回响形态": { type: "card", english: "Echo Form", kind: "Power" },
  "斩击": { type: "card", english: "Strike", kind: "Attack" },
  "警觉": { type: "card", english: "Vigilance", kind: "Skill" },
  "爆发": { type: "card", english: "Eruption", kind: "Attack" },
  "神圣": { type: "card", english: "Divinity", kind: "Stance" },
  "许愿": { type: "card", english: "Wish", kind: "Skill" },
  "诸神黄昏": { type: "card", english: "Ragnarok", kind: "Attack" },
  "燃烧之血": { type: "relic", english: "Burning Blood", asset: "burningBlood.png" },
  "蛇之戒指": { type: "relic", english: "Ring of the Snake", asset: "ringOfTheSnake.png" },
  "破损核心": { type: "relic", english: "Cracked Core", asset: "crackedCore.png" },
  "纯净水": { type: "relic", english: "Pure Water", asset: "pureWater.png" },
  "锚": { type: "relic", english: "Anchor", asset: "anchor.png" },
  "奥利哈钢": { type: "relic", english: "Orichalcum", asset: "orichalcum.png" },
  "手里剑": { type: "relic", english: "Shuriken", asset: "shuriken.png" },
  "苦无": { type: "relic", english: "Kunai", asset: "kunai.png" },
  "昆虫标本": { type: "relic", english: "Preserved Insect", asset: "preservedInsect.png" },
  "会员卡": { type: "relic", english: "Membership Card", asset: "membershipCard.png" },
  "咖啡滤杯": { type: "relic", english: "Coffee Dripper", asset: "coffeeDripper.png" },
  "符文圆顶": { type: "relic", english: "Runic Dome", asset: "runicDome.png" },
  "贤者之石": { type: "relic", english: "Philosopher's Stone", asset: "philosophersStone.png" },
  "诅咒钥匙": { type: "relic", english: "Cursed Key", asset: "cursedKey.png" },
  "微笑面具": { type: "relic", english: "Smiling Mask", asset: "smilingMask.png" },
  "药水腰带": { type: "relic", english: "Potion Belt", asset: "potionBelt.png" }
};

const spireCardAssets = {
  "悔恨": "regret.C_uyo9B5.png",
  "打击": "strike.Ba0Y0E1v.png",
  "防御": "defend.DGGRrpdM.png",
  "重击": "bash.B4CFT6ik.png",
  "痛击": "pummel.Bh8EitcQ.png",
  "旋风斩": "whirlwind.BM9tzNgi.png",
  "完美打击": "perfectedStrike.DnvdIoms.png",
  "祭品": "offering.CyO7zEKr.png",
  "恶魔形态": "demonForm.D8nr2jnE.png",
  "壁垒": "barricade.BW-1DxXa.png",
  "火焰吐息": "fireBreathing.DWKBDSnN.png",
  "震荡波": "shockwave.BTDlJAsV.png",
  "中和": "neutralize.Cq3Q3v36.png",
  "生存者": "survivor.D_eiGq-T.png",
  "弹跳药瓶": "bouncingFlask.C2-qKdIf.png",
  "催化剂": "catalyst.YQiFy3v5.png",
  "尸爆术": "corpseExplosion.CAI7tBbA.png",
  "幻影杀手": "phantasmalKiller.CnSbDx3R.png",
  "余像": "afterImage.CeeTtzIH.png",
  "凌迟": "finisher.Ci7oQWdE.png",
  "电击": "zap.RNuoLk8-.png",
  "双重释放": "dualcast.BO1zz1gg.png",
  "暴风雨": "storm.CjCyn2UZ.png",
  "机器学习": "machineLearning.rSpiFtAi.png",
  "创造性AI": "creativeAI.1Q4VXkl6.png",
  "缓冲": "buffer.i-9sS6FT.png",
  "搜寻": "seek.C7HEZZUt.png",
  "回响形态": "echoForm.Dn9H_orH.png",
  "斩击": "strike.Ba0Y0E1v.png",
  "警觉": "vigilance.viHiZhGu.png",
  "爆发": "eruption.CjDDwmjs.png",
  "许愿": "wish.DQTNeHsB.png",
  "诸神黄昏": "ragnarok.CQ7uCsQ8.png"
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function safePathSegment(value) {
  return String(value || "")
    .trim()
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, "_")
    .replace(/\s+/g, "_")
    .slice(0, 80) || "unknown";
}

function publicImagePath(category, fileName) {
  return `/images/${encodeURIComponent(safePathSegment(category))}/${encodeURIComponent(fileName)}`;
}

function localImagePath(category, fileName) {
  return path.join(imageRoot, safePathSegment(category), fileName);
}

function imageExists(publicPath) {
  if (!publicPath?.startsWith("/images/")) return false;
  const decoded = decodeURIComponent(publicPath.replace(/^\/images\//, ""));
  return existsSync(path.join(imageRoot, decoded));
}

function extensionFromContentType(contentType, fallbackUrl = "") {
  const lower = String(contentType || "").toLowerCase();
  if (lower.includes("image/png")) return "png";
  if (lower.includes("image/webp")) return "webp";
  if (lower.includes("image/gif")) return "gif";
  if (lower.includes("image/svg")) return "svg";
  if (lower.includes("image/jpeg") || lower.includes("image/jpg")) return "jpg";
  const pathname = new URL(fallbackUrl).pathname.toLowerCase();
  const match = pathname.match(/\.(jpe?g|png|webp|gif|svg)$/);
  return match ? match[1].replace("jpeg", "jpg") : "jpg";
}

async function requestJson(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3000);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "CantGuessItHuh/0.2 (local image cache)" }
    });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

async function requestText(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36",
        "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.6"
      }
    });
    if (!response.ok) return "";
    return await response.text();
  } catch {
    return "";
  } finally {
    clearTimeout(timeout);
  }
}

function apiUrl(base, params) {
  const url = new URL(base);
  url.search = new URLSearchParams(params).toString();
  return url;
}

async function zhWikipediaImageForTitle(title) {
  const data = await requestJson(apiUrl("https://zh.wikipedia.org/w/api.php", {
    action: "query",
    redirects: "1",
    titles: title,
    prop: "pageimages",
    piprop: "thumbnail|original",
    pithumbsize: "1000",
    format: "json",
    origin: "*"
  }));
  const page = Object.values(data?.query?.pages || {})[0];
  return page?.thumbnail?.source || page?.original?.source || null;
}

async function zhWikipediaSearchImage(query, word, category) {
  const data = await requestJson(apiUrl("https://zh.wikipedia.org/w/api.php", {
    action: "query",
    list: "search",
    srsearch: query,
    srlimit: "6",
    format: "json",
    origin: "*"
  }));
  const results = data?.query?.search || [];
  const sorted = results
    .map((item) => ({ title: item.title, score: scoreTitle(item.title, word, category) }))
    .sort((a, b) => b.score - a.score);

  for (const result of sorted) {
    const image = await zhWikipediaImageForTitle(result.title);
    if (image) return image;
  }
  return null;
}

function scoreTitle(title, word, category) {
  let score = 0;
  if (title === word) score += 8;
  if (title.includes(word)) score += 5;
  for (const token of contextQueries[category] || []) {
    if (title.includes(token)) score += 2;
  }
  if (/消歧义|列表|模板|分类/.test(title)) score -= 10;
  return score;
}

async function wikidataImage(query, word, category) {
  const search = await requestJson(apiUrl("https://www.wikidata.org/w/api.php", {
    action: "wbsearchentities",
    search: query,
    language: "zh",
    uselang: "zh",
    type: "item",
    limit: "8",
    format: "json",
    origin: "*"
  }));
  const ids = (search?.search || [])
    .map((item) => ({
      id: item.id,
      score: scoreText(`${item.label || ""} ${item.description || ""}`, word, category)
    }))
    .sort((a, b) => b.score - a.score)
    .map((item) => item.id);
  if (!ids.length) return null;

  const entities = await requestJson(apiUrl("https://www.wikidata.org/w/api.php", {
    action: "wbgetentities",
    ids: ids.join("|"),
    props: "claims",
    format: "json",
    origin: "*"
  }));
  for (const id of ids) {
    const claim = entities?.entities?.[id]?.claims?.P18?.[0];
    const fileName = claim?.mainsnak?.datavalue?.value;
    if (fileName) {
      return `https://commons.wikimedia.org/wiki/Special:Redirect/file/${encodeURIComponent(fileName)}?width=1000`;
    }
  }
  return null;
}

function scoreText(text, word, category) {
  let score = text.includes(word) ? 4 : 0;
  for (const token of contextQueries[category] || []) {
    if (text.includes(token)) score += 3;
  }
  return score;
}

async function commonsSearchImage(query) {
  const data = await requestJson(apiUrl("https://commons.wikimedia.org/w/api.php", {
    action: "query",
    generator: "search",
    gsrsearch: query,
    gsrnamespace: "6",
    gsrlimit: "4",
    prop: "imageinfo",
    iiprop: "url|mime|size",
    iiurlwidth: "1000",
    format: "json",
    origin: "*"
  }));
  const pages = Object.values(data?.query?.pages || {});
  const candidates = pages
    .map((page) => page.imageinfo?.[0])
    .filter(Boolean)
    .filter((info) => !String(info.mime || "").includes("tiff"))
    .sort((a, b) => (b.size || 0) - (a.size || 0));
  return candidates[0]?.thumburl || candidates[0]?.url || null;
}

function decodeHtml(value) {
  return String(value || "")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function extractBingImageCandidates(html) {
  const candidates = [];
  const matches = html.matchAll(/class="iusc"[^>]*\sm="([^"]+)"/g);
  for (const match of matches) {
    try {
      const metadata = JSON.parse(decodeHtml(match[1]));
      if (metadata.turl) candidates.push(metadata.turl);
      if (metadata.murl) candidates.push(metadata.murl);
    } catch {
      // Ignore malformed result blobs.
    }
  }
  return unique(candidates).filter((url) => /^https?:\/\//i.test(url));
}

async function bingSearchImages(query) {
  const html = await requestText(apiUrl("https://www.bing.com/images/search", {
    q: query,
    first: "1",
    count: "12",
    form: "HDRSC2"
  }));
  return extractBingImageCandidates(html);
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function buildQueries(word, category) {
  const suffixes = wikipediaTitleSuffixes[category] || [];
  const contexts = contextQueries[category] || [];
  return unique([
    ...suffixes.map((suffix) => `${word}${suffix}`),
    ...contexts.map((context) => `${word} ${context}`),
    `${word} ${category}`,
    word
  ]);
}

async function findImageUrl(word, category) {
  const queries = buildQueries(word, category);

  for (const query of queries) {
    const candidates = await bingSearchImages(query);
    if (candidates.length) return { image: candidates, source: "bing" };
  }

  for (const title of queries) {
    const image = await zhWikipediaImageForTitle(title);
    if (image) return { image, source: "zhwiki-page" };
  }

  for (const query of queries) {
    const image = await zhWikipediaSearchImage(query, word, category);
    if (image) return { image, source: "zhwiki-search" };
  }

  for (const query of queries) {
    const image = await wikidataImage(query, word, category);
    if (image) return { image, source: "wikidata" };
  }

  for (const query of queries) {
    const image = await commonsSearchImage(query);
    if (image) return { image, source: "commons" };
  }

  return null;
}

async function downloadImage(url, category, word) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "CantGuessItHuh/0.2 (local image cache)" }
    });
    if (!response.ok) return null;
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.toLowerCase().startsWith("image/")) return null;
    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.length < 800) return null;
    const extension = extensionFromContentType(contentType, url);
    const fileName = `${safePathSegment(word)}.${extension}`;
    const diskPath = localImagePath(category, fileName);
    await mkdir(path.dirname(diskPath), { recursive: true });
    await writeFile(diskPath, buffer);
    return publicImagePath(category, fileName);
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

async function downloadFirstImage(urls, category, word) {
  const candidates = Array.isArray(urls) ? urls : [urls];
  for (const url of candidates) {
    const cached = await downloadImage(url, category, word);
    if (cached) return cached;
  }
  return null;
}

function escapeSvg(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function categoryColor(category) {
  const palettes = {
    "日常物品": ["#f7f3e8", "#2c5f5d", "#e09f3e"],
    "自然与生物": ["#eaf6ee", "#256d3d", "#7eb77f"],
    "食物饮品": ["#fff2e6", "#8a3b12", "#f4a261"],
    "地点": ["#eef3ff", "#284b8f", "#6d8fd8"],
    "科技产品": ["#eef7f8", "#145c6b", "#5bc0be"],
    "职业身份": ["#f4f0ff", "#503b8f", "#9b8ae6"],
    "歌曲": ["#fff0f3", "#7a2143", "#f28482"],
    "名画": ["#f8f0de", "#66512c", "#d6a84f"],
    "名人": ["#eef2f3", "#303a42", "#8aa1b1"],
    "影视动漫": ["#f0f4ff", "#243b6b", "#ffb703"],
    "杀戮尖塔": ["#f7eee8", "#742a20", "#d8572a"]
  };
  return palettes[category] || ["#eef3f4", "#243b53", "#7fb3d5"];
}

async function generateFallbackImage(category, word) {
  const [background, ink, accent] = categoryColor(category);
  const fileName = `${safePathSegment(word)}.svg`;
  const diskPath = localImagePath(category, fileName);
  await mkdir(path.dirname(diskPath), { recursive: true });
  const title = escapeSvg(word);
  const subtitle = escapeSvg(category);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="640" viewBox="0 0 960 640">
  <rect width="960" height="640" fill="${background}"/>
  <rect x="76" y="72" width="808" height="496" rx="30" fill="#fffdf8" stroke="${accent}" stroke-width="8"/>
  <circle cx="780" cy="152" r="72" fill="${accent}" opacity=".22"/>
  <circle cx="176" cy="492" r="118" fill="${accent}" opacity=".18"/>
  <path d="M150 180h660M150 460h660" stroke="${accent}" stroke-width="10" stroke-linecap="round" opacity=".55"/>
  <text x="480" y="292" font-family="Microsoft YaHei, PingFang SC, Arial, sans-serif" font-size="86" font-weight="800" text-anchor="middle" fill="${ink}">${title}</text>
  <text x="480" y="382" font-family="Microsoft YaHei, PingFang SC, Arial, sans-serif" font-size="34" text-anchor="middle" fill="${ink}" opacity=".72">${subtitle}</text>
</svg>`;
  await writeFile(diskPath, svg, "utf8");
  return publicImagePath(category, fileName);
}

async function removeExistingImages(category, word) {
  const dir = path.join(imageRoot, safePathSegment(category));
  const base = safePathSegment(word);
  for (const ext of ["jpg", "jpeg", "png", "webp", "gif", "svg"]) {
    const filePath = path.join(dir, `${base}.${ext}`);
    if (existsSync(filePath)) await rm(filePath, { force: true });
  }
}

async function generateSpireCardImage(word, metadata) {
  const fileName = `${safePathSegment(word)}.svg`;
  const diskPath = localImagePath("杀戮尖塔", fileName);
  await mkdir(path.dirname(diskPath), { recursive: true });
  const title = escapeSvg(word);
  const english = escapeSvg(metadata.english);
  const kind = escapeSvg(metadata.kind || "Card");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="840" viewBox="0 0 600 840">
  <defs>
    <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0" stop-color="#4a1712"/>
      <stop offset=".52" stop-color="#201319"/>
      <stop offset="1" stop-color="#6f2a15"/>
    </linearGradient>
    <linearGradient id="panel" x1="0" x2="0" y1="0" y2="1">
      <stop offset="0" stop-color="#f4d997"/>
      <stop offset="1" stop-color="#9d6335"/>
    </linearGradient>
  </defs>
  <rect width="600" height="840" rx="42" fill="#120b0b"/>
  <rect x="28" y="28" width="544" height="784" rx="34" fill="url(#bg)" stroke="#d9aa55" stroke-width="10"/>
  <rect x="70" y="112" width="460" height="340" rx="22" fill="#1a1110" stroke="#c68b42" stroke-width="8"/>
  <path d="M120 390c48-72 82-110 132-114 40-3 70 17 104 10 44-9 70-48 120-96-18 88-50 152-100 194-72 62-166 66-256 6z" fill="#d65a31" opacity=".78"/>
  <circle cx="186" cy="214" r="58" fill="#f1c86b" opacity=".45"/>
  <path d="M118 306c75-82 163-116 270-102 38 5 74 18 108 38" fill="none" stroke="#f4d997" stroke-width="12" stroke-linecap="round" opacity=".52"/>
  <rect x="78" y="56" width="444" height="82" rx="18" fill="url(#panel)" stroke="#3c2116" stroke-width="5"/>
  <text x="300" y="111" font-family="Microsoft YaHei, PingFang SC, Arial, sans-serif" font-size="43" font-weight="800" text-anchor="middle" fill="#25120d">${title}</text>
  <rect x="92" y="486" width="416" height="210" rx="18" fill="#f1dfb6" stroke="#5a3523" stroke-width="6"/>
  <text x="300" y="565" font-family="Georgia, Times New Roman, serif" font-size="38" font-weight="700" text-anchor="middle" fill="#2a1915">${english}</text>
  <text x="300" y="630" font-family="Arial, sans-serif" font-size="26" text-anchor="middle" fill="#68402a">${kind}</text>
  <text x="300" y="748" font-family="Microsoft YaHei, PingFang SC, Arial, sans-serif" font-size="24" text-anchor="middle" fill="#f4d997">Slay the Spire</text>
</svg>`;
  await writeFile(diskPath, svg, "utf8");
  return publicImagePath("杀戮尖塔", fileName);
}

async function cacheSpireImage(entry) {
  const metadata = spireEntries[entry.word] || { type: "card", english: entry.word, kind: "Card" };
  await removeExistingImages("杀戮尖塔", entry.word);

  if (metadata.type === "relic") {
    const url = `https://maybelatergames.co.uk/spirespy/_ipx/s_512x512/assets/relics/${metadata.asset}`;
    const cached = await downloadImage(url, "杀戮尖塔", entry.word);
    if (cached) {
      stats.downloaded += 1;
      console.log(`[下载] 杀戮尖塔 / ${entry.word} <- SpireSpy`);
      return cached;
    }
  }

  if (metadata.type === "card") {
    const asset = spireCardAssets[entry.word];
    if (asset) {
      const cached = await downloadImage(`https://maybelatergames.co.uk/spirespy/_nuxt/${asset}`, "杀戮尖塔", entry.word);
      if (cached) {
        stats.downloaded += 1;
        console.log(`[下载] 杀戮尖塔 / ${entry.word} <- SpireSpy card`);
        return cached;
      }
    }

    const generated = await generateSpireCardImage(entry.word, metadata);
    stats.generated += 1;
    console.log(`[生成] 杀戮尖塔 / ${entry.word} <- 专属卡片`);
    return generated;
  }

  const generated = await generateSpireCardImage(entry.word, metadata);
  stats.generated += 1;
  console.log(`[生成] 杀戮尖塔 / ${entry.word} <- 专属卡片`);
  return generated;
}

async function cacheOne(category, entry) {
  if (category === "杀戮尖塔" && forceSpire) {
    return await cacheSpireImage(entry);
  }

  if (!force && entry.image && imageExists(entry.image)) {
    stats.skipped += 1;
    return entry.image;
  }

  const found = await findImageUrl(entry.word, category);
  if (found?.image) {
    const cached = await downloadFirstImage(found.image, category, entry.word);
    if (cached) {
      stats.downloaded += 1;
      if (found.source === "bing") stats.bing += 1;
      console.log(`[下载] ${category} / ${entry.word} <- ${found.source}`);
      return cached;
    }
  }

  if (!noFallback) {
    const fallback = await generateFallbackImage(category, entry.word);
    stats.generated += 1;
    console.log(`[生成] ${category} / ${entry.word}`);
    return fallback;
  }

  stats.failed += 1;
  console.log(`[失败] ${category} / ${entry.word}`);
  return "";
}

async function main() {
  const bank = JSON.parse(await readFile(bankPath, "utf8"));
  for (const [category, entries] of Object.entries(bank)) {
    for (const entry of entries) {
      stats.total += 1;
      entry.image = await cacheOne(category, entry);
      await writeFile(bankPath, `${JSON.stringify(bank, null, 2)}\n`, "utf8");
      await sleep(120);
    }
  }

  console.log(`完成：总计 ${stats.total}，跳过 ${stats.skipped}，下载 ${stats.downloaded}（Bing ${stats.bing}），生成 ${stats.generated}，失败 ${stats.failed}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
