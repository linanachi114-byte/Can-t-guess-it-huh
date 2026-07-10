import { readFile, writeFile } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..");
const envPath = path.join(root, ".env");
const bankPath = path.join(root, "data", "wordbank.json");

loadEnv(envPath);

const API_KEY = process.env.DEEPSEEK_API_KEY || "";
const MODEL = process.env.DEEPSEEK_MODEL || "deepseek-v4-flash";
const API_URL = "https://api.deepseek.com/chat/completions";

if (!API_KEY) {
  throw new Error("缺少 DEEPSEEK_API_KEY，请在 .env 中填写。");
}

const bank = normalizeWordBank(JSON.parse(await readFile(bankPath, "utf8")));

for (const [category, entries] of Object.entries(bank)) {
  const missing = entries.filter((entry) => !entry.hint);
  if (!missing.length) continue;

  console.log(`生成线索：${category} (${missing.length})`);
  const generated = await generateHints(category, missing.map((entry) => entry.word));
  for (const entry of missing) {
    entry.hint = generated[entry.word] || fallbackHint(entry.word, category);
  }
}

await writeFile(bankPath, `${JSON.stringify(bank, null, 2)}\n`, "utf8");
console.log("线索已写入 data/wordbank.json");

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
      ? entries
          .map((entry) => {
            if (typeof entry === "string") return { word: entry.trim(), hint: "" };
            return {
              word: String(entry?.word || "").trim(),
              hint: String(entry?.hint || "").trim()
            };
          })
          .filter((entry) => entry.word)
      : [];
  }
  return normalized;
}

async function generateHints(category, words) {
  const content = await askDeepSeek([
    {
      role: "system",
      content:
        "你要为中文猜词游戏批量生成线索。每条线索要能明显缩小范围，但不能直接说出答案，不能包含目标词的完整词语。每条线索 20 到 35 个中文字符。只输出 JSON 数组，不要解释。"
    },
    {
      role: "user",
      content: `题库：${category}\n目标词列表：${JSON.stringify(words)}\n输出格式：[{"word":"目标词","hint":"线索"}]`
    }
  ], 3000);

  const match = content.match(/\[[\s\S]*\]/);
  if (!match) return {};
  const parsed = JSON.parse(match[0]);
  return Object.fromEntries(parsed.map((item) => [String(item.word || "").trim(), String(item.hint || "").trim()]));
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

function fallbackHint(word, category) {
  return `这个词来自${category}题库，常和特定场景或文化印象联系在一起。`;
}
