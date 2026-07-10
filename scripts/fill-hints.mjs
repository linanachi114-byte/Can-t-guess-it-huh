import { readFile, writeFile } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..");
const envPath = path.join(root, ".env");
const bankPath = path.join(root, "data", "wordbank.json");
const regenerateAll = process.argv.includes("--all");

loadEnv(envPath);

const API_KEY = process.env.DEEPSEEK_API_KEY || "";
const MODEL = process.env.DEEPSEEK_MODEL || "deepseek-v4-flash";
const API_URL = "https://api.deepseek.com/chat/completions";

if (!API_KEY) {
  throw new Error("缺少 DEEPSEEK_API_KEY，请在 .env 中填写。");
}

const bank = normalizeWordBank(JSON.parse(await readFile(bankPath, "utf8")));

for (const [category, entries] of Object.entries(bank)) {
  const targets = entries.filter((entry) => regenerateAll || entry.clues.length === 0);
  if (!targets.length) continue;

  console.log(`生成分层线索：${category} (${targets.length})`);
  const generated = await generateClues(category, targets.map((entry) => entry.word));
  for (const entry of targets) {
    entry.clues = generated[entry.word] || fallbackClues(category);
  }
}

await writeFile(bankPath, `${JSON.stringify(bank, null, 2)}\n`, "utf8");
console.log("分层线索已写入 data/wordbank.json");

function loadEnv(filePath) {
  if (!existsSync(filePath)) return;
  const text = readFileSync(filePath, "utf8");
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

function normalizeWordBank(rawBank) {
  const normalized = {};
  for (const [category, entries] of Object.entries(rawBank || {})) {
    normalized[category] = Array.isArray(entries)
      ? entries.map(normalizeEntry).filter((entry) => entry.word)
      : [];
  }
  return normalized;
}

function normalizeEntry(entry) {
  if (typeof entry === "string") return { word: entry.trim(), clues: [] };
  const clues = Array.isArray(entry?.clues)
    ? entry.clues.map(cleanClue).filter(Boolean)
    : splitClues(entry?.hint);
  return {
    word: String(entry?.word || "").trim(),
    clues
  };
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

async function generateClues(category, words) {
  const content = await askDeepSeek([
    {
      role: "system",
      content:
        "你要为中文猜词游戏批量生成分层线索。必须优先理解题库名代表的语境：同一个词在不同题库里含义可能完全不同，例如题库是“杀戮尖塔”时，“悔恨”应理解为游戏中的诅咒卡，而不是普通情绪。每个目标生成 3 条线索，按从宽到窄排列。每条线索只能包含一个事实，不能把多个特征合并在同一句里。第 1 条只说大领域或大类别，第 2 条只说一个泛属性，第 3 条给一个中等强度特征。不要直接写出答案，不要包含答案完整词语，不要使用唯一定位式描述。避免“最大、唯一、标志、代表作、具体节日、作者、歌手、画家”等一眼锁定的信息。每条 4 到 12 个中文字符。每个目标输出一行，格式必须是：目标词<TAB>线索1<TAB>线索2<TAB>线索3。不要编号，不要解释。"
    },
    {
      role: "user",
      content: `题库名：${category}\n目标词列表：${JSON.stringify(words)}`
    }
  ], 5000);

  const result = {};
  for (const line of content.split(/\r?\n/)) {
    const parts = line.split("\t").map((part) => part.trim()).filter(Boolean);
    if (parts.length >= 4) {
      result[parts[0]] = parts.slice(1, 4).map(cleanClue).filter(Boolean);
    }
  }
  return result;
}

async function askDeepSeek(messages, maxTokens) {
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
  const content = data?.choices?.[0]?.message?.content?.trim() || "";
  if (!content) throw new Error("DeepSeek 返回了空答案。");
  return content;
}

function fallbackClues(category) {
  return [`来自${category}题库`, "有明确辨识特征", "常见于特定语境"];
}
