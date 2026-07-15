import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const root = path.join(path.dirname(__filename), "..");
const bankPath = path.join(root, "data", "wordbank.json");
const coverDir = path.join(root, "public", "images", "category-covers");
const indexPath = path.join(coverDir, "index.json");
const force = process.argv.includes("--force");

const coverQueries = {
  "日常物品": "日常物品 生活用品 集合",
  "自然与生物": "自然 生物 动物 植物 风景",
  "食物饮品": "食物 饮品 美食",
  "地点": "城市 地点 建筑 地标",
  "科技产品": "科技产品 电子设备",
  "职业身份": "职业 人物 工作",
  "歌曲": "音乐 歌曲 演唱会",
  "名画": "世界名画 油画 画廊",
  "名人": "名人 肖像 名人墙",
  "影视动漫": "电影 动画 动漫 海报",
  "杀戮尖塔": "Slay the Spire cards relics"
};

const representativeWords = {
  "日常物品": "冰箱",
  "自然与生物": "鲸鱼",
  "食物饮品": "火锅",
  "地点": "长城",
  "科技产品": "手机",
  "职业身份": "医生",
  "歌曲": "晴天",
  "名画": "蒙娜丽莎",
  "名人": "爱因斯坦",
  "影视动漫": "千与千寻",
  "杀戮尖塔": "悔恨"
};

function safePathSegment(value) {
  return String(value || "")
    .trim()
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, "_")
    .replace(/\s+/g, "_")
    .slice(0, 80) || "unknown";
}

function apiUrl(base, params) {
  const url = new URL(base);
  url.search = new URLSearchParams(params).toString();
  return url;
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

function decodeHtml(value) {
  return String(value || "")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

async function requestText(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
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

async function requestJson(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "CantGuessItHuh/0.2 (category covers)" }
    });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
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
      // Skip malformed metadata.
    }
  }
  return [...new Set(candidates)].filter((url) => /^https?:\/\//i.test(url));
}

async function bingSearchImages(query) {
  const html = await requestText(apiUrl("https://www.bing.com/images/search", {
    q: query,
    first: "1",
    count: "10",
    form: "HDRSC2"
  }));
  return extractBingImageCandidates(html);
}

async function commonsSearchImage(query) {
  const data = await requestJson(apiUrl("https://commons.wikimedia.org/w/api.php", {
    action: "query",
    generator: "search",
    gsrsearch: query,
    gsrnamespace: "6",
    gsrlimit: "5",
    prop: "imageinfo",
    iiprop: "url|mime|size",
    iiurlwidth: "1200",
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

async function findCoverUrl(category) {
  const query = coverQueries[category] || `${category} 题库 封面`;
  const bing = await bingSearchImages(query);
  if (bing.length) return bing;
  const commons = await commonsSearchImage(query);
  return commons ? [commons] : [];
}

async function downloadImage(url, category) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "CantGuessItHuh/0.2 (category covers)" }
    });
    if (!response.ok) return null;
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.toLowerCase().startsWith("image/")) return null;
    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.length < 1200) return null;
    const ext = extensionFromContentType(contentType, url);
    const fileName = `${safePathSegment(category)}.${ext}`;
    await mkdir(coverDir, { recursive: true });
    await writeFile(path.join(coverDir, fileName), buffer);
    return `/images/category-covers/${encodeURIComponent(fileName)}`;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

function existingCover(category) {
  const base = safePathSegment(category);
  for (const ext of ["jpg", "jpeg", "png", "webp", "gif", "svg"]) {
    const fileName = `${base}.${ext}`;
    if (existsSync(path.join(coverDir, fileName))) {
      return `/images/category-covers/${encodeURIComponent(fileName)}`;
    }
  }
  return "";
}

async function main() {
  const bank = JSON.parse(await readFile(bankPath, "utf8"));
  const covers = existsSync(indexPath)
    ? JSON.parse(await readFile(indexPath, "utf8"))
    : {};

  for (const [category, entries] of Object.entries(bank)) {
    if (!force && covers[category] && existsSync(path.join(root, "public", decodeURIComponent(covers[category].replace(/^\//, ""))))) {
      console.log(`跳过：${category}`);
      continue;
    }

    let cover = !force ? existingCover(category) : "";
    const representative = (entries || []).find((entry) => entry.word === representativeWords[category]);
    if (!cover && representative?.image) cover = representative.image;
    if (!cover) {
      const candidates = await findCoverUrl(category);
      for (const url of candidates) {
        cover = await downloadImage(url, category);
        if (cover) break;
      }
    }

    if (!cover && entries?.[0]?.image) cover = entries[0].image;
    if (cover) {
      covers[category] = cover;
      console.log(`完成：${category} -> ${cover}`);
    } else {
      console.log(`失败：${category}`);
    }
  }

  await mkdir(coverDir, { recursive: true });
  await writeFile(indexPath, `${JSON.stringify(covers, null, 2)}\n`, "utf8");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
