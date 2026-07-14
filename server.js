import { createServer } from "node:http";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

loadEnv(path.join(__dirname, ".env"));

const PORT = Number(process.env.PORT || 5177);
const API_KEY = process.env.DEEPSEEK_API_KEY || "";
const MODEL = process.env.DEEPSEEK_MODEL || "deepseek-v4-flash";
const FALLBACK_MODEL = process.env.DEEPSEEK_FALLBACK_MODEL || MODEL;
const ANSWER_VOTES = Math.max(1, Number(process.env.ANSWER_VOTES || 3));
const API_URL = "https://api.deepseek.com/chat/completions";
const WORD_BANK_PATH = path.join(__dirname, "data", "wordbank.json");
const GAME_HISTORY_PATH = path.join(__dirname, "data", "game-history.json");
const PUBLIC_DIR = path.join(__dirname, "public");
const IMAGE_DIR = path.join(PUBLIC_DIR, "images");
const PLACEHOLDER_IMAGE = "/images/placeholder.svg";
const games = new Map();

function loadEnv(envPath) {
  if (!existsSync(envPath)) return;
  const text = readFileSync(envPath, "utf8");
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const index = trimmed.indexOf("=");
    if (index === -1) continue;
    const key = trimmed.slice(0, index).trim();
    const value = trimmed.slice(index + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, "utf8"));
}

async function writeJson(filePath, value) {
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

async function readWordBank() {
  return normalizeWordBank(await readJson(WORD_BANK_PATH));
}

async function writeWordBank(bank) {
  await writeJson(WORD_BANK_PATH, normalizeWordBank(bank));
}

async function readGameHistory() {
  if (!existsSync(GAME_HISTORY_PATH)) return [];
  return JSON.parse(await readFile(GAME_HISTORY_PATH, "utf8"));
}

async function writeGameHistory(history) {
  await writeJson(GAME_HISTORY_PATH, history);
}

function normalizeWordBank(rawBank) {
  const bank = {};
  for (const [category, entries] of Object.entries(rawBank || {})) {
    bank[category] = Array.isArray(entries)
      ? entries.map(normalizeEntry).filter((entry) => entry.word)
      : [];
  }
  return bank;
}

function normalizeEntry(entry) {
  if (typeof entry === "string") {
    return { word: entry.trim(), clues: [], image: "" };
  }

  const word = String(entry?.word || "").trim();
  const clues = Array.isArray(entry?.clues)
    ? entry.clues.map(cleanClue).filter(Boolean)
    : splitClues(entry?.hint);
  const image = String(entry?.image || "").trim();

  return { word, clues, image };
}

function splitClues(value) {
  return String(value || "")
    .split(/\r?\n|[；;]/)
    .map(cleanClue)
    .filter(Boolean);
}

function cleanClue(value) {
  return String(value || "")
    .replace(/^\s*(?:线索\s*)?\d+\s*[.、:：-]\s*/, "")
    .trim();
}

function safePathSegment(value) {
  return String(value || "")
    .trim()
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, "_")
    .replace(/\s+/g, "_")
    .slice(0, 80) || "unknown";
}

function contentTypeToExtension(contentType) {
  if (contentType.includes("png")) return "png";
  if (contentType.includes("webp")) return "webp";
  if (contentType.includes("svg")) return "svg";
  if (contentType.includes("gif")) return "gif";
  return "jpg";
}

function isAllowedImageType(contentType) {
  return [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/svg+xml"
  ].includes(String(contentType || "").toLowerCase());
}

async function ensurePlaceholderImage() {
  const filePath = path.join(IMAGE_DIR, "placeholder.svg");
  if (existsSync(filePath)) return PLACEHOLDER_IMAGE;
  await mkdir(IMAGE_DIR, { recursive: true });
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="640" viewBox="0 0 960 640">
  <rect width="960" height="640" fill="#edf7f5"/>
  <rect x="90" y="90" width="780" height="460" rx="24" fill="#ffffff" stroke="#b7dfd6" stroke-width="6"/>
  <circle cx="330" cy="260" r="70" fill="#0d7c66" opacity=".18"/>
  <path d="M190 470l190-170 120 110 90-80 180 140H190z" fill="#0d7c66" opacity=".35"/>
  <text x="480" y="580" font-family="Arial, sans-serif" font-size="34" text-anchor="middle" fill="#095f50">No image yet</text>
</svg>`;
  await writeFile(filePath, svg, "utf8");
  return PLACEHOLDER_IMAGE;
}

async function searchWikimediaImage(word, category) {
  const query = `${word} ${category}`.trim();
  const searchUrl = new URL("https://commons.wikimedia.org/w/api.php");
  searchUrl.search = new URLSearchParams({
    action: "query",
    generator: "search",
    gsrsearch: query,
    gsrnamespace: "6",
    gsrlimit: "1",
    prop: "imageinfo",
    iiprop: "url|mime",
    iiurlwidth: "900",
    format: "json",
    origin: "*"
  }).toString();

  const response = await fetch(searchUrl, { headers: { "User-Agent": "CantGuessItHuh/0.1" } });
  if (!response.ok) return null;
  const data = await response.json();
  const pages = Object.values(data?.query?.pages || {});
  const imageInfo = pages[0]?.imageinfo?.[0];
  return imageInfo?.thumburl || imageInfo?.url || null;
}

async function cacheImageForEntry(category, entry) {
  if (entry.image && entry.image.startsWith("/images/")) return entry.image;
  const categoryDir = safePathSegment(category);
  const wordName = safePathSegment(entry.word);
  const diskDir = path.join(IMAGE_DIR, categoryDir);
  const publicDir = `/images/${encodeURIComponent(categoryDir)}`;

  for (const ext of ["jpg", "jpeg", "png", "webp", "gif"]) {
    const existing = path.join(diskDir, `${wordName}.${ext}`);
    if (existsSync(existing)) return `${publicDir}/${encodeURIComponent(`${wordName}.${ext}`)}`;
  }

  try {
    const imageUrl = await searchWikimediaImage(entry.word, category);
    if (!imageUrl) return await ensurePlaceholderImage();
    const imageResponse = await fetch(imageUrl, { headers: { "User-Agent": "CantGuessItHuh/0.1" } });
    if (!imageResponse.ok) return await ensurePlaceholderImage();
    const contentType = imageResponse.headers.get("content-type") || "image/jpeg";
    const ext = contentTypeToExtension(contentType);
    const fileName = `${wordName}.${ext}`;
    await mkdir(diskDir, { recursive: true });
    const buffer = Buffer.from(await imageResponse.arrayBuffer());
    await writeFile(path.join(diskDir, fileName), buffer);
    return `${publicDir}/${encodeURIComponent(fileName)}`;
  } catch {
    return await ensurePlaceholderImage();
  }
}

async function ensureGameImage(game) {
  if (game.image) return game.image;
  game.image = await cacheImageForEntry(game.category, { word: game.word, image: game.image });
  return game.image;
}

function sendJson(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  res.end(body);
}

function sendText(res, status, text, contentType = "text/plain; charset=utf-8") {
  res.writeHead(status, { "Content-Type": contentType });
  res.end(text);
}

async function parseBody(req) {
  let body = "";
  for await (const chunk of req) {
    body += chunk;
    if (body.length > 1024 * 1024) throw new Error("请求体太大。");
  }
  return body ? JSON.parse(body) : {};
}

async function parseMultipartBody(req) {
  const contentType = req.headers["content-type"] || "";
  const boundaryMatch = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/i);
  if (!boundaryMatch) throw new Error("缺少上传边界。");
  const boundary = `--${boundaryMatch[1] || boundaryMatch[2]}`;
  const chunks = [];
  let total = 0;
  for await (const chunk of req) {
    chunks.push(chunk);
    total += chunk.length;
    if (total > 10 * 1024 * 1024) throw new Error("图片不能超过 10MB。");
  }

  const raw = Buffer.concat(chunks).toString("latin1");
  const fields = {};
  const files = {};
  for (const part of raw.split(boundary)) {
    if (!part || part === "--\r\n" || part === "--") continue;
    const cleanPart = part.replace(/^\r\n/, "").replace(/\r\n--$/, "");
    const divider = cleanPart.indexOf("\r\n\r\n");
    if (divider === -1) continue;
    const headerText = cleanPart.slice(0, divider);
    let value = cleanPart.slice(divider + 4);
    if (value.endsWith("\r\n")) value = value.slice(0, -2);

    const disposition = headerText.match(/content-disposition:\s*form-data;([^\r\n]+)/i)?.[1] || "";
    const name = disposition.match(/name="([^"]+)"/i)?.[1];
    const filename = disposition.match(/filename="([^"]*)"/i)?.[1];
    const fileType = headerText.match(/content-type:\s*([^\r\n]+)/i)?.[1]?.trim() || "";
    if (!name) continue;

    if (filename) {
      files[name] = {
        filename,
        contentType: fileType,
        buffer: Buffer.from(value, "latin1")
      };
    } else {
      fields[name] = Buffer.from(value, "latin1").toString("utf8");
    }
  }
  return { fields, files };
}

function normalizeAnswer(text) {
  return String(text || "")
    .replace(/[\s"'“”‘’。！!,.，：:；;]/g, "")
    .trim();
}

function revealedClues(game) {
  return game.clues.slice(0, game.clueIndex);
}

function publicGame(game) {
  const shownClues = revealedClues(game);
  return {
    id: game.id,
    shareId: game.shareId || null,
    category: game.category,
    startedAt: game.startedAt,
    isWon: game.isWon,
    isRevealed: Boolean(game.isRevealed),
    clueIndex: game.clueIndex,
    clueCount: game.clues.length,
    revealedClues: shownClues,
    revealedHint: shownClues.join(" / ") || null,
    revealedWord: game.isWon || game.isRevealed ? game.word : null,
    revealedImage: game.isWon || game.isRevealed ? game.image || PLACEHOLDER_IMAGE : null,
    history: game.history
  };
}

function summarizeOutcome(game) {
  if (game.isWon) return "won";
  if (game.isRevealed) return "revealed";
  return "playing";
}

async function archiveGame(game) {
  if (game.shareId) return game.shareId;

  const shareId = crypto.randomUUID();
  const record = {
    id: shareId,
    gameId: game.id,
    category: game.category,
    word: game.word,
    image: game.image || PLACEHOLDER_IMAGE,
    startedAt: game.startedAt,
    endedAt: new Date().toISOString(),
    outcome: summarizeOutcome(game),
    questionCount: game.history.filter((item) => item.type === "question").length,
    guessCount: game.history.filter((item) => item.type === "guess").length,
    history: game.history
  };

  const history = await readGameHistory();
  history.unshift(record);
  await writeGameHistory(history.slice(0, 200));
  game.shareId = shareId;
  return shareId;
}

function pickRandom(items) {
  return items[Math.floor(Math.random() * items.length)];
}

async function startGame(categories) {
  const bank = await readWordBank();
  const allCategories = Object.keys(bank).filter((name) => bank[name].length);
  const selectedCategories = Array.isArray(categories)
    ? categories.filter((name) => Array.isArray(bank[name]) && bank[name].length)
    : allCategories;
  if (!selectedCategories.length) {
    throw new Error("请至少选择一个有词条的题库。");
  }

  const category = pickRandom(selectedCategories);
  const entry = pickRandom(bank[category]);
  const game = {
    id: crypto.randomUUID(),
    word: entry.word,
    clues: entry.clues,
    image: entry.image,
    clueIndex: 0,
    category,
    startedAt: new Date().toISOString(),
    isWon: false,
    isRevealed: false,
    history: []
  };
  games.set(game.id, game);
  return publicGame(game);
}

async function askDeepSeek(messages, maxTokens = 80, options = {}) {
  if (!API_KEY) {
    throw new Error("缺少 DEEPSEEK_API_KEY，请在 .env 中填写。");
  }
  const body = {
    model: options.model || MODEL,
    messages,
    max_tokens: maxTokens,
    stream: false
  };
  if (options.thinking !== "enabled") {
    body.thinking = { type: "disabled" };
  }

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`DeepSeek API 请求失败：${response.status} ${text}`);
  }

  const data = await response.json();
  const choice = data?.choices?.[0];
  const content = choice?.message?.content?.trim() || "";
  if (!content) {
    throw new Error(`DeepSeek 返回了空答案，请检查模型 thinking 参数或 max_tokens。finish_reason=${choice?.finish_reason || "unknown"}`);
  }
  return content;
}

function strictYesNoMaybe(text) {
  const normalized = normalizeAnswer(text);
  if (normalized.includes("是也不是")) return "是也不是";
  if (normalized === "是") return "是";
  if (normalized === "否" || normalized === "不是") return "否";
  if (normalized.startsWith("是")) return "是";
  if (normalized.startsWith("否") || normalized.startsWith("不是")) return "否";
  return "是也不是";
}

function buildQuestionMessages(game, question) {
  const compactHistory = game.history
    .slice(-12)
    .map((item) => {
      if (item.type === "question") return `玩家问：${item.text}\nAI答：${item.answer}`;
      if (item.type === "hint") return `玩家查看线索：${item.answer}`;
      return `玩家猜：${item.text}\n结果：${item.correct ? "正确" : "错误"}`;
    })
    .join("\n");

  return [
    {
      role: "system",
      content:
        "你正在主持一个中文猜词游戏。你知道隐藏答案，但绝不能透露答案，也不能解释。玩家会问关于隐藏答案的是非问题。你只能从这三个中文选项中选择一个并原样输出：是、否、是也不是。若问题无法用稳定的是/否判断，或答案取决于语境、类别、版本、时期、定义差异，就回答：是也不是。"
    },
    {
      role: "user",
      content: `隐藏答案：${game.word}\n所属题库：${game.category}\n已公布线索：${revealedClues(game).join("；") || "暂无"}\n最近历史：\n${compactHistory || "暂无"}\n\n玩家问题：${question}\n请只输出：是、否、是也不是。`
    }
  ];
}

async function answerQuestionOnce(game, question) {
  const content = await askDeepSeek(buildQuestionMessages(game, question));

  return strictYesNoMaybe(content);
}

async function fallbackAnswerQuestion(game, question, votes) {
  const content = await askDeepSeek([
    {
      role: "system",
      content:
        "你是中文猜词游戏的最终裁判。你知道隐藏答案，但绝不能透露答案，也不能解释。玩家问的是关于隐藏答案的是非问题。你会看到多个普通模型的回答投票；如果投票不一致，请基于隐藏答案、题库语境、已公布线索和玩家问题做最终裁决。只能输出：是、否、是也不是。"
    },
    {
      role: "user",
      content: `隐藏答案：${game.word}\n所属题库：${game.category}\n已公布线索：${revealedClues(game).join("；") || "暂无"}\n玩家问题：${question}\n普通模型投票：${votes.join("、")}\n请只输出：是、否、是也不是。`
    }
  ], 800, { model: FALLBACK_MODEL, thinking: "enabled" });
  return strictYesNoMaybe(content);
}

async function answerQuestion(game, question) {
  const votes = [];
  for (let index = 0; index < ANSWER_VOTES; index += 1) {
    votes.push(await answerQuestionOnce(game, question));
  }

  const uniqueVotes = [...new Set(votes)];
  const answer = uniqueVotes.length === 1
    ? uniqueVotes[0]
    : await fallbackAnswerQuestion(game, question, votes);

  return { answer, votes, fallbackUsed: uniqueVotes.length !== 1 };
}

async function judgeGuess(game, guess) {
  const content = await askDeepSeek([
    {
      role: "system",
      content:
        "你是猜词游戏的裁判。判断玩家最终答案是否等同于隐藏答案。允许常见简称、译名、大小写差异、书名号差异、中文全称/简称差异。不要因为只是同类事物而判对。只输出 JSON，不要输出解释。"
    },
    {
      role: "user",
      content: `隐藏答案：${game.word}\n所属题库：${game.category}\n玩家答案：${guess}\n输出格式：{"correct":true} 或 {"correct":false}`
    }
  ], 120);

  try {
    const match = content.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("no json");
    return Boolean(JSON.parse(match[0]).correct);
  } catch {
    return normalizeAnswer(game.word) === normalizeAnswer(guess);
  }
}

async function generateClues(word, category) {
  const content = await askDeepSeek([
    {
      role: "system",
      content:
        "你要为中文猜词游戏生成分层线索。必须优先理解题库名代表的语境：同一个词在不同题库里含义可能完全不同，例如题库是“杀戮尖塔”时，“悔恨”应理解为游戏中的诅咒卡，而不是普通情绪。生成 3 条线索，按从宽到窄排列。每条线索只能包含一个事实，不能把多个特征合并在同一句里。第 1 条只说大领域或大类别，第 2 条只说一个泛属性，第 3 条给一个中等强度特征。不要直接写出答案，不要包含答案完整词语，不要使用唯一定位式描述。避免“最大、唯一、标志、代表作、具体节日、作者、歌手、画家”等一眼锁定的信息。每条 4 到 12 个中文字符。只输出三行，每行一条线索，不要编号，不要解释。"
    },
    {
      role: "user",
      content: `题库名：${category}\n目标词：${word}\n请根据题库语境生成 3 条分层线索。`
    }
  ], 240);
  return splitClues(content).slice(0, 3);
}

function cluesFromBody(body) {
  if (Array.isArray(body.clues)) return body.clues.map(cleanClue).filter(Boolean);
  return splitClues(body.clues ?? body.hint);
}

function requireCategoryName(category) {
  const name = String(category || "").trim();
  if (!name) throw new Error("题库名不能为空。");
  return name;
}

function requireEntryIndex(index, entries) {
  const numeric = Number(index);
  if (!Number.isInteger(numeric) || numeric < 0 || numeric >= entries.length) {
    throw new Error("词条不存在。");
  }
  return numeric;
}

async function serveStatic(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const rawPath = decodeURIComponent(url.pathname === "/" ? "/index.html" : url.pathname);
  const filePath = path.normalize(path.join(PUBLIC_DIR, rawPath));
  if (!filePath.startsWith(PUBLIC_DIR)) {
    sendText(res, 403, "Forbidden");
    return;
  }

  try {
    const data = await readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const types = {
      ".html": "text/html; charset=utf-8",
      ".css": "text/css; charset=utf-8",
      ".js": "application/javascript; charset=utf-8",
      ".json": "application/json; charset=utf-8",
      ".svg": "image/svg+xml",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".webp": "image/webp",
      ".gif": "image/gif"
    };
    res.writeHead(200, { "Content-Type": types[ext] || "application/octet-stream" });
    res.end(data);
  } catch {
    sendText(res, 404, "Not Found");
  }
}

async function handleApi(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === "GET" && url.pathname === "/api/health") {
    sendJson(res, 200, { ok: true, model: MODEL, fallbackModel: FALLBACK_MODEL, answerVotes: ANSWER_VOTES, hasKey: Boolean(API_KEY) });
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/wordbank") {
    sendJson(res, 200, await readWordBank());
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/history") {
    sendJson(res, 200, await readGameHistory());
    return;
  }

  const shareMatch = url.pathname.match(/^\/api\/share\/([^/]+)$/);
  if (req.method === "GET" && shareMatch) {
    const history = await readGameHistory();
    const record = history.find((item) => item.id === shareMatch[1]);
    if (!record) {
      sendJson(res, 404, { error: "分享记录不存在。" });
      return;
    }
    sendJson(res, 200, record);
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/wordbank/category") {
    const body = await parseBody(req);
    const category = requireCategoryName(body.category);
    const bank = await readWordBank();
    if (bank[category]) {
      sendJson(res, 400, { error: "这个题库已经存在。" });
      return;
    }
    bank[category] = [];
    await writeWordBank(bank);
    sendJson(res, 200, bank);
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/wordbank/entry") {
    const body = await parseBody(req);
    const category = requireCategoryName(body.category);
    const word = String(body.word || "").trim();
    let clues = cluesFromBody(body);
    const image = String(body.image || "").trim();
    if (!word) {
      sendJson(res, 400, { error: "词条不能为空。" });
      return;
    }
    const bank = await readWordBank();
    bank[category] ||= [];
    if (!clues.length) clues = await generateClues(word, category);
    bank[category].push({ word, clues, image });
    await writeWordBank(bank);
    sendJson(res, 200, bank);
    return;
  }

  if (req.method === "PUT" && url.pathname === "/api/wordbank/entry") {
    const body = await parseBody(req);
    const category = requireCategoryName(body.category);
    const word = String(body.word || "").trim();
    const clues = cluesFromBody(body);
    const image = String(body.image || "").trim();
    if (!word) {
      sendJson(res, 400, { error: "词条不能为空。" });
      return;
    }
    const bank = await readWordBank();
    const entries = bank[category];
    if (!entries) {
      sendJson(res, 404, { error: "题库不存在。" });
      return;
    }
    const index = requireEntryIndex(body.index, entries);
    entries[index] = { word, clues, image };
    await writeWordBank(bank);
    sendJson(res, 200, bank);
    return;
  }

  if (req.method === "DELETE" && url.pathname === "/api/wordbank/entry") {
    const body = await parseBody(req);
    const category = requireCategoryName(body.category);
    const bank = await readWordBank();
    const entries = bank[category];
    if (!entries) {
      sendJson(res, 404, { error: "题库不存在。" });
      return;
    }
    const index = requireEntryIndex(body.index, entries);
    entries.splice(index, 1);
    await writeWordBank(bank);
    sendJson(res, 200, bank);
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/wordbank/image") {
    const { fields, files } = await parseMultipartBody(req);
    const category = requireCategoryName(fields.category);
    const bank = await readWordBank();
    const entries = bank[category];
    if (!entries) {
      sendJson(res, 404, { error: "题库不存在。" });
      return;
    }
    const index = requireEntryIndex(fields.index, entries);
    const file = files.image;
    if (!file?.buffer?.length) {
      sendJson(res, 400, { error: "请选择一张图片。" });
      return;
    }
    if (!isAllowedImageType(file.contentType)) {
      sendJson(res, 400, { error: "只支持 jpg、png、webp、gif 或 svg 图片。" });
      return;
    }

    const entry = entries[index];
    const ext = contentTypeToExtension(file.contentType);
    const categoryDir = safePathSegment(category);
    const fileName = `${safePathSegment(entry.word)}.${ext}`;
    const diskDir = path.join(IMAGE_DIR, categoryDir);
    await mkdir(diskDir, { recursive: true });
    await writeFile(path.join(diskDir, fileName), file.buffer);
    entry.image = `/images/${encodeURIComponent(categoryDir)}/${encodeURIComponent(fileName)}`;
    await writeWordBank(bank);
    sendJson(res, 200, bank);
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/hint") {
    const body = await parseBody(req);
    const category = requireCategoryName(body.category);
    const word = String(body.word || "").trim();
    if (!word) {
      sendJson(res, 400, { error: "词条不能为空。" });
      return;
    }
    sendJson(res, 200, { clues: await generateClues(word, category) });
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/game") {
    const body = await parseBody(req);
    sendJson(res, 200, await startGame(body.categories));
    return;
  }

  const gameMatch = url.pathname.match(/^\/api\/game\/([^/]+)$/);
  if (req.method === "GET" && gameMatch) {
    const game = games.get(gameMatch[1]);
    if (!game) {
      sendJson(res, 404, { error: "游戏不存在或服务已重启。" });
      return;
    }
    sendJson(res, 200, publicGame(game));
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/ask") {
    const body = await parseBody(req);
    const game = games.get(String(body.gameId || ""));
    const question = String(body.question || "").trim();
    if (!game || !question) {
      sendJson(res, 400, { error: "缺少游戏或问题。" });
      return;
    }
    if (game.isWon || game.isRevealed) {
      sendJson(res, 400, { error: "这局已经结束，请开新局。" });
      return;
    }
    const answerResult = await answerQuestion(game, question);
    game.history.push({
      type: "question",
      text: question,
      answer: answerResult.answer,
      votes: answerResult.votes,
      fallbackUsed: answerResult.fallbackUsed,
      at: new Date().toISOString()
    });
    sendJson(res, 200, publicGame(game));
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/guess") {
    const body = await parseBody(req);
    const game = games.get(String(body.gameId || ""));
    const guess = String(body.guess || "").trim();
    if (!game || !guess) {
      sendJson(res, 400, { error: "缺少游戏或答案。" });
      return;
    }
    if (game.isWon || game.isRevealed) {
      sendJson(res, 400, { error: "这局已经结束，请开新局。" });
      return;
    }
    const correct = await judgeGuess(game, guess);
    if (correct) game.isWon = true;
    game.history.push({
      type: "guess",
      text: guess,
      correct,
      at: new Date().toISOString()
    });
    if (correct) {
      await ensureGameImage(game);
      await archiveGame(game);
    }
    sendJson(res, 200, publicGame(game));
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/clue") {
    const body = await parseBody(req);
    const game = games.get(String(body.gameId || ""));
    if (!game) {
      sendJson(res, 400, { error: "缺少游戏。" });
      return;
    }
    if (game.clueIndex < game.clues.length) {
      const clue = game.clues[game.clueIndex];
      game.clueIndex += 1;
      game.history.push({
        type: "hint",
        text: `查看第 ${game.clueIndex} 条线索`,
        answer: clue,
        at: new Date().toISOString()
      });
    }
    sendJson(res, 200, publicGame(game));
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/reveal") {
    const body = await parseBody(req);
    const game = games.get(String(body.gameId || ""));
    if (!game) {
      sendJson(res, 400, { error: "缺少游戏。" });
      return;
    }
    if (!game.isWon && !game.isRevealed) {
      game.isRevealed = true;
      await ensureGameImage(game);
      game.history.push({
        type: "reveal",
        text: "我猜不出来，请公布答案",
        answer: game.word,
        at: new Date().toISOString()
      });
      await archiveGame(game);
    }
    sendJson(res, 200, publicGame(game));
    return;
  }

  sendJson(res, 404, { error: "API 不存在。" });
}

const server = createServer(async (req, res) => {
  try {
    if (req.url.startsWith("/api/")) {
      await handleApi(req, res);
    } else {
      await serveStatic(req, res);
    }
  } catch (error) {
    sendJson(res, 500, { error: error.message || "服务器错误" });
  }
});

server.listen(PORT, () => {
  console.log(`猜词游戏已启动：http://localhost:${PORT}`);
});
