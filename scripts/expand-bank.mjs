import { readFile, writeFile } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..");
const envPath = path.join(root, ".env");
const bankPath = path.join(root, "data", "wordbank.json");
const targetCount = Number(process.argv.find((arg) => arg.startsWith("--target="))?.split("=")[1] || 50);

loadEnv(envPath);

const API_KEY = process.env.DEEPSEEK_API_KEY || "";
const MODEL = process.env.DEEPSEEK_MODEL || "deepseek-v4-flash";
const API_URL = "https://api.deepseek.com/chat/completions";

if (!API_KEY) throw new Error("缺少 DEEPSEEK_API_KEY，请在 .env 中填写。");

const bank = normalizeWordBank(JSON.parse(await readFile(bankPath, "utf8")));

for (const [category, entries] of Object.entries(bank)) {
  const needed = targetCount - entries.length;
  if (needed <= 0) continue;

  console.log(`扩充题库：${category}，需要 ${needed} 个`);
  const additions = await generateEntries(category, entries.map((entry) => entry.word), needed);
  for (const entry of additions) {
    if (bank[category].some((item) => item.word === entry.word)) continue;
    bank[category].push(entry);
    if (bank[category].length >= targetCount) break;
  }
  console.log(`完成：${category} -> ${bank[category].length}`);
}

await writeFile(bankPath, `${JSON.stringify(bank, null, 2)}\n`, "utf8");
console.log("题库扩充已写入 data/wordbank.json");

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
  if (typeof entry === "string") return { word: entry.trim(), clues: [], image: "" };
  return {
    word: String(entry?.word || "").trim(),
    clues: Array.isArray(entry?.clues) ? entry.clues.map(cleanClue).filter(Boolean).slice(0, 3) : [],
    image: String(entry?.image || "").trim()
  };
}

function cleanClue(value) {
  return String(value || "")
    .replace(/^\s*(?:线索\s*)?\d+\s*[.、:：-]\s*/, "")
    .trim();
}

function fallbackClues(category) {
  return [`来自${category}`, "有明显特征", "常见于特定语境"];
}

async function generateEntries(category, existingWords, needed) {
  const results = [];
  const requested = Math.min(Math.max(needed + 8, 15), 60);

  for (let attempt = 0; attempt < 4 && results.length < needed; attempt += 1) {
    const content = await askDeepSeek([
      {
        role: "system",
        content:
          "你要为中文猜词游戏扩充题库。必须严格理解题库名代表的语境。不要输出已有词。每行输出一个词条，格式必须是：词条<TAB>线索1<TAB>线索2<TAB>线索3。线索按从宽到窄排列，每条只包含一个事实，4到12个中文字符，不要直接包含词条原文，不要一眼锁定。不要编号，不要解释。"
      },
      {
        role: "user",
        content: `题库名：${category}\n已有词条：${JSON.stringify([...existingWords, ...results.map((item) => item.word)])}\n请新增 ${requested} 个适合这个题库的词条。`
      }
    ], 6000);

    for (const entry of parseEntries(content, category)) {
      if (existingWords.includes(entry.word)) continue;
      if (results.some((item) => item.word === entry.word)) continue;
      results.push(entry);
      if (results.length >= needed) break;
    }
  }

  return results.slice(0, needed);
}

function parseEntries(content, category) {
  const entries = [];
  for (const line of content.split(/\r?\n/)) {
    const normalized = line
      .replace(/^[-*]\s*/, "")
      .replace(/^\d+\s*[.、:：-]\s*/, "")
      .trim();
    const parts = normalized
      .split(/\t|\s*\|\s*|，|,|；|;/)
      .map((part) => part.trim())
      .filter(Boolean);
    if (parts.length < 2 && /[:：]/.test(normalized)) {
      const [wordPart, cluePart] = normalized.split(/[:：]/);
      const clues = String(cluePart || "").split(/，|,|；|;/).map(cleanClue).filter(Boolean);
      parts.splice(0, parts.length, wordPart.trim(), ...clues);
    }
    if (parts.length < 2) continue;
    const word = parts[0].trim();
    if (!word || word.length > 24) continue;
    const clues = parts.slice(1, 4).map(cleanClue).filter((clue) => clue && !clue.includes(word));
    entries.push({ word, clues: clues.length >= 3 ? clues : fallbackClues(category), image: "" });
  }
  return entries;
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
