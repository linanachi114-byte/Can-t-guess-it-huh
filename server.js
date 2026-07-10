import { createServer } from "node:http";
import { readFile, writeFile } from "node:fs/promises";
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
const API_URL = "https://api.deepseek.com/chat/completions";
const WORD_BANK_PATH = path.join(__dirname, "data", "wordbank.json");
const PUBLIC_DIR = path.join(__dirname, "public");
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
    if (body.length > 1024 * 1024) throw new Error("请求体太大");
  }
  return body ? JSON.parse(body) : {};
}

function normalizeAnswer(text) {
  return String(text || "")
    .replace(/[\s"'“”‘’。！!,.，：:；;]/g, "")
    .trim();
}

function publicGame(game) {
  return {
    id: game.id,
    category: game.category,
    startedAt: game.startedAt,
    isWon: game.isWon,
    isRevealed: Boolean(game.isRevealed),
    revealedWord: game.isWon || game.isRevealed ? game.word : null,
    history: game.history
  };
}

function pickRandom(items) {
  return items[Math.floor(Math.random() * items.length)];
}

async function startGame(categories) {
  const bank = await readJson(WORD_BANK_PATH);
  let selectedCategories = Array.isArray(categories) && categories.length
    ? categories.filter((name) => Array.isArray(bank[name]) && bank[name].length)
    : Object.keys(bank);
  if (!selectedCategories.length) selectedCategories = Object.keys(bank);
  const category = pickRandom(selectedCategories);
  const word = pickRandom(bank[category]);
  const game = {
    id: crypto.randomUUID(),
    word,
    category,
    startedAt: new Date().toISOString(),
    isWon: false,
    isRevealed: false,
    history: []
  };
  games.set(game.id, game);
  return publicGame(game);
}

async function askDeepSeek(messages, maxTokens = 32) {
  if (!API_KEY) {
    throw new Error("缺少 DEEPSEEK_API_KEY，请在 .env 中填写。");
  }

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      thinking: { type: "disabled" },
      max_tokens: maxTokens,
      stream: false
    })
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

async function answerQuestion(game, question) {
  const compactHistory = game.history
    .slice(-12)
    .map((item) => {
      if (item.type === "question") return `玩家问：${item.text}\nAI答：${item.answer}`;
      return `玩家猜：${item.text}\n结果：${item.correct ? "正确" : "错误"}`;
    })
    .join("\n");

  const content = await askDeepSeek([
    {
      role: "system",
      content:
        "你正在主持一个中文猜词游戏。你知道隐藏答案，但绝不能透露答案，也不能解释。玩家会问关于隐藏答案的是非问题。你只能从这三个中文选项中选择一个并原样输出：是、否、是也不是。若问题无法用稳定的是/否判断，或答案取决于语境、类别、版本、时期、定义差异，就回答：是也不是。"
    },
    {
      role: "user",
      content: `隐藏答案：${game.word}\n所属词库：${game.category}\n最近历史：\n${compactHistory || "暂无"}\n\n玩家问题：${question}\n请只输出：是、否、是也不是。`
    }
  ]);

  return strictYesNoMaybe(content);
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
      content: `隐藏答案：${game.word}\n所属词库：${game.category}\n玩家答案：${guess}\n输出格式：{"correct":true} 或 {"correct":false}`
    }
  ], 40);

  try {
    const match = content.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("no json");
    return Boolean(JSON.parse(match[0]).correct);
  } catch {
    return normalizeAnswer(game.word) === normalizeAnswer(guess);
  }
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
      ".svg": "image/svg+xml"
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
    sendJson(res, 200, { ok: true, model: MODEL, hasKey: Boolean(API_KEY) });
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/wordbank") {
    sendJson(res, 200, await readJson(WORD_BANK_PATH));
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/wordbank") {
    const body = await parseBody(req);
    const category = String(body.category || "").trim();
    const word = String(body.word || "").trim();
    if (!category || !word) {
      sendJson(res, 400, { error: "词库名和词都不能为空。" });
      return;
    }
    const bank = await readJson(WORD_BANK_PATH);
    bank[category] ||= [];
    if (!bank[category].includes(word)) bank[category].push(word);
    await writeJson(WORD_BANK_PATH, bank);
    sendJson(res, 200, bank);
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
    const answer = await answerQuestion(game, question);
    game.history.push({
      type: "question",
      text: question,
      answer,
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
      game.history.push({
        type: "reveal",
        text: "我猜不出来，请公布答案",
        answer: game.word,
        at: new Date().toISOString()
      });
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
