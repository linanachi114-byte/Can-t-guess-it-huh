const state = {
  game: null,
  wordbank: {},
  mode: "ask",
  view: "game",
  selectedCategories: new Set(),
  activeCategory: null
};

const els = {
  gameNavBtn: document.querySelector("#gameNavBtn"),
  libraryNavBtn: document.querySelector("#libraryNavBtn"),
  gameView: document.querySelector("#gameView"),
  libraryView: document.querySelector("#libraryView"),
  categoryLabel: document.querySelector("#categoryLabel"),
  questionCount: document.querySelector("#questionCount"),
  guessCount: document.querySelector("#guessCount"),
  historyList: document.querySelector("#historyList"),
  emptyHistory: document.querySelector("#emptyHistory"),
  message: document.querySelector("#message"),
  winBanner: document.querySelector("#winBanner"),
  bannerTitle: document.querySelector("#bannerTitle"),
  revealedWord: document.querySelector("#revealedWord"),
  hintBanner: document.querySelector("#hintBanner"),
  hintText: document.querySelector("#hintText"),
  roundSummary: document.querySelector("#roundSummary"),
  askModeBtn: document.querySelector("#askModeBtn"),
  guessModeBtn: document.querySelector("#guessModeBtn"),
  playForm: document.querySelector("#playForm"),
  mainInput: document.querySelector("#mainInput"),
  submitBtn: document.querySelector("#submitBtn"),
  clueBtn: document.querySelector("#clueBtn"),
  revealBtn: document.querySelector("#revealBtn"),
  newGameBtn: document.querySelector("#newGameBtn"),
  openLibraryBtn: document.querySelector("#openLibraryBtn"),
  categoryList: document.querySelector("#categoryList"),
  categoryForm: document.querySelector("#categoryForm"),
  newCategoryInput: document.querySelector("#newCategoryInput"),
  libraryCards: document.querySelector("#libraryCards"),
  libraryEditor: document.querySelector("#libraryEditor"),
  editorTitle: document.querySelector("#editorTitle"),
  editorMeta: document.querySelector("#editorMeta"),
  closeEditorBtn: document.querySelector("#closeEditorBtn"),
  entryForm: document.querySelector("#entryForm"),
  entryWordInput: document.querySelector("#entryWordInput"),
  entryHintInput: document.querySelector("#entryHintInput"),
  libraryMessage: document.querySelector("#libraryMessage"),
  entryList: document.querySelector("#entryList")
};

async function api(path, options = {}) {
  const response = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...options
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "请求失败");
  return data;
}

function setMessage(text, isError = false) {
  els.message.textContent = text;
  els.message.classList.toggle("error", isError);
}

function setLibraryMessage(text, isError = false) {
  els.libraryMessage.textContent = text;
  els.libraryMessage.classList.toggle("error", isError);
}

function isGameOver() {
  return Boolean(state.game?.isWon || state.game?.isRevealed);
}

function canShowMoreClues() {
  return Boolean(state.game && (state.game.clueIndex || 0) < (state.game.clueCount || 0));
}

function setLoading(isLoading) {
  const isOver = isGameOver();
  els.submitBtn.disabled = isLoading || isOver;
  els.revealBtn.disabled = isLoading || isOver;
  els.clueBtn.disabled = isLoading || isOver || !canShowMoreClues();
  els.newGameBtn.disabled = isLoading;
  els.submitBtn.textContent = isLoading ? "等待中" : "提交";
}

function setMode(mode) {
  state.mode = mode;
  els.askModeBtn.classList.toggle("active", mode === "ask");
  els.guessModeBtn.classList.toggle("active", mode === "guess");
  els.mainInput.placeholder = mode === "ask" ? "例如：它是人工制品吗？" : "输入你的最终答案";
  els.mainInput.focus();
}

function setView(view) {
  state.view = view;
  els.gameNavBtn.classList.toggle("active", view === "game");
  els.libraryNavBtn.classList.toggle("active", view === "library");
  els.gameView.classList.toggle("hidden", view !== "game");
  els.libraryView.classList.toggle("hidden", view !== "library");
  if (view === "library") renderLibrary();
}

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
}

function cluesToText(clues) {
  return Array.isArray(clues) ? clues.join("\n") : "";
}

function textToClues(text) {
  return String(text || "")
    .split(/\r?\n|[；;]/)
    .map((line) => line.replace(/^\s*(?:线索)?\s*\d+\s*[.、:：-]?\s*/, "").trim())
    .filter(Boolean);
}

function renderGame() {
  const game = state.game;
  const history = game?.history || [];
  const questionTotal = history.filter((item) => item.type === "question").length;
  const guessTotal = history.filter((item) => item.type === "guess").length;
  const isOver = isGameOver();
  const shownClues = game?.revealedClues || [];
  const clueIndex = game?.clueIndex || 0;
  const clueCount = game?.clueCount || 0;

  els.categoryLabel.textContent = game ? game.category : "未开始";
  els.questionCount.textContent = questionTotal;
  els.guessCount.textContent = guessTotal;
  els.roundSummary.textContent = `本局已问 ${questionTotal} 轮问题，已猜测 ${guessTotal} 次。`;
  els.historyList.innerHTML = "";
  els.emptyHistory.classList.toggle("hidden", history.length > 0);

  els.hintBanner.classList.toggle("hidden", shownClues.length === 0);
  els.hintText.innerHTML = "";
  shownClues.forEach((clue, index) => {
    const item = document.createElement("span");
    item.textContent = `${index + 1}. ${clue}`;
    els.hintText.append(item);
  });
  els.clueBtn.textContent = clueIndex < clueCount ? `查看下一条线索（${clueIndex}/${clueCount}）` : "线索已用完";
  els.winBanner.classList.toggle("hidden", !isOver);
  els.bannerTitle.textContent = game?.isWon ? "答案正确" : "已公布答案";
  els.revealedWord.textContent = game?.revealedWord || "";
  els.mainInput.disabled = isOver;
  els.submitBtn.disabled = isOver;
  els.revealBtn.disabled = isOver;
  els.clueBtn.disabled = isOver || !canShowMoreClues();

  [...history].reverse().forEach((item, index) => {
    const originalIndex = history.length - index;
    const li = document.createElement("li");
    li.className = "history-item";

    const meta = document.createElement("div");
    meta.className = "history-meta";
    const typeLabel = item.type === "question"
      ? "提问"
      : item.type === "guess"
        ? "猜答案"
        : item.type === "hint"
          ? "查看线索"
          : "公布答案";

    const number = document.createElement("span");
    number.textContent = `#${originalIndex} ${typeLabel}`;
    const time = document.createElement("span");
    time.textContent = formatTime(item.at);
    meta.append(number, time);

    const text = document.createElement("p");
    text.className = "history-text";
    text.textContent = item.text;

    const answer = document.createElement("span");
    answer.className = "answer";
    if (item.type === "question") {
      answer.textContent = item.answer;
    } else if (item.type === "guess") {
      answer.textContent = item.correct ? "答案正确" : "答案错误";
      answer.classList.add(item.correct ? "correct" : "wrong");
    } else if (item.type === "hint") {
      answer.textContent = `线索：${item.answer}`;
      answer.classList.add("hint");
    } else {
      answer.textContent = `正解：${item.answer}`;
      answer.classList.add("reveal");
    }
    li.append(meta, text, answer);
    els.historyList.append(li);
  });
}

function renderCategoryPicker() {
  const categories = Object.keys(state.wordbank);
  const validCategories = new Set(categories);
  state.selectedCategories.forEach((category) => {
    if (!validCategories.has(category)) state.selectedCategories.delete(category);
  });
  if (state.selectedCategories.size === 0) {
    categories.forEach((category) => state.selectedCategories.add(category));
  }

  els.categoryList.innerHTML = "";
  categories.forEach((category) => {
    const entries = state.wordbank[category] || [];
    const label = document.createElement("label");
    label.className = "category-row";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = state.selectedCategories.has(category);
    checkbox.addEventListener("change", () => {
      if (checkbox.checked) state.selectedCategories.add(category);
      else state.selectedCategories.delete(category);
    });

    const name = document.createElement("span");
    name.textContent = category;
    const count = document.createElement("small");
    count.textContent = `${entries.length} 个`;
    label.append(checkbox, name, count);
    els.categoryList.append(label);
  });
}

function renderLibrary() {
  renderLibraryCards();
  if (state.activeCategory && state.wordbank[state.activeCategory]) {
    renderEditor(state.activeCategory);
  } else {
    state.activeCategory = null;
    els.libraryEditor.classList.add("hidden");
  }
}

function renderLibraryCards() {
  els.libraryCards.innerHTML = "";
  Object.entries(state.wordbank).forEach(([category, entries]) => {
    const clueTotal = entries.reduce((sum, entry) => sum + (entry.clues?.length || 0), 0);
    const card = document.createElement("button");
    card.className = "library-card";
    card.type = "button";
    card.addEventListener("click", () => {
      state.activeCategory = category;
      renderEditor(category);
    });

    const title = document.createElement("strong");
    title.textContent = category;
    const meta = document.createElement("span");
    meta.textContent = `${entries.length} 个词条 · ${clueTotal} 条线索`;
    const sample = document.createElement("small");
    sample.textContent = entries.slice(0, 3).map((entry) => entry.word).join("、") || "空题库";
    card.append(title, meta, sample);
    els.libraryCards.append(card);
  });
}

function renderEditor(category) {
  const entries = state.wordbank[category] || [];
  els.libraryEditor.classList.remove("hidden");
  els.editorTitle.textContent = category;
  els.editorMeta.textContent = `${entries.length} 个词条。每行一条线索，游戏里会从上到下逐条公布。`;
  els.entryList.innerHTML = "";

  entries.forEach((entry, index) => {
    const row = document.createElement("article");
    row.className = "entry-row";

    const wordInput = document.createElement("input");
    wordInput.value = entry.word;
    wordInput.placeholder = "词条";

    const clueInput = document.createElement("textarea");
    clueInput.value = cluesToText(entry.clues);
    clueInput.placeholder = "每行一条线索";

    const saveBtn = document.createElement("button");
    saveBtn.type = "button";
    saveBtn.textContent = "保存";
    saveBtn.addEventListener("click", () => saveEntry(category, index, wordInput.value, clueInput.value));

    const generateBtn = document.createElement("button");
    generateBtn.type = "button";
    generateBtn.className = "secondary-button";
    generateBtn.textContent = "AI 线索";
    generateBtn.addEventListener("click", () => regenerateClues(category, wordInput.value, clueInput, generateBtn));

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "danger-button compact";
    deleteBtn.textContent = "删除";
    deleteBtn.addEventListener("click", () => deleteEntry(category, index));

    row.append(wordInput, clueInput, saveBtn, generateBtn, deleteBtn);
    els.entryList.append(row);
  });
}

async function loadWordbank() {
  state.wordbank = await api("/api/wordbank");
  renderCategoryPicker();
}

async function refreshWordbank(bank) {
  state.wordbank = bank || await api("/api/wordbank");
  renderCategoryPicker();
  renderLibrary();
}

async function newGame() {
  setMessage("正在准备隐藏词...");
  const categories = [...state.selectedCategories];
  state.game = await api("/api/game", {
    method: "POST",
    body: JSON.stringify({ categories })
  });
  localStorage.setItem("guess-word-game-id", state.game.id);
  setMessage("新游戏开始。AI 已经想好一个词。");
  renderGame();
}

async function submitTurn(event) {
  event.preventDefault();
  const text = els.mainInput.value.trim();
  if (!text) return;
  if (!state.game) await newGame();

  setLoading(true);
  setMessage(state.mode === "ask" ? "AI 正在判断这个问题..." : "AI 裁判正在核对答案...");

  try {
    const path = state.mode === "ask" ? "/api/ask" : "/api/guess";
    const body = state.mode === "ask"
      ? { gameId: state.game.id, question: text }
      : { gameId: state.game.id, guess: text };
    state.game = await api(path, {
      method: "POST",
      body: JSON.stringify(body)
    });
    els.mainInput.value = "";
    const last = state.game.history.at(-1);
    if (last?.type === "question") setMessage(`AI：${last.answer}`);
    if (last?.type === "guess") setMessage(last.correct ? "猜对了，这局拿下。" : "还不对，可以继续问。");
    localStorage.setItem("guess-word-game-id", state.game.id);
    renderGame();
  } catch (error) {
    setMessage(error.message, true);
  } finally {
    setLoading(false);
  }
}

async function showClue() {
  if (!state.game) await newGame();
  if (!canShowMoreClues()) return;
  setLoading(true);
  setMessage("正在取出下一条线索...");

  try {
    state.game = await api("/api/clue", {
      method: "POST",
      body: JSON.stringify({ gameId: state.game.id })
    });
    localStorage.setItem("guess-word-game-id", state.game.id);
    const latest = state.game.history.at(-1);
    setMessage(latest?.type === "hint" ? `线索：${latest.answer}` : "没有更多线索了。");
    renderGame();
  } catch (error) {
    setMessage(error.message, true);
  } finally {
    setLoading(false);
  }
}

async function revealAnswer() {
  if (!state.game) await newGame();
  setLoading(true);
  setMessage("正在公布答案...");

  try {
    state.game = await api("/api/reveal", {
      method: "POST",
      body: JSON.stringify({ gameId: state.game.id })
    });
    localStorage.setItem("guess-word-game-id", state.game.id);
    setMessage(`正解是：${state.game.revealedWord}`);
    renderGame();
  } catch (error) {
    setMessage(error.message, true);
  } finally {
    setLoading(false);
  }
}

async function createCategory(event) {
  event.preventDefault();
  const category = els.newCategoryInput.value.trim();
  if (!category) return;

  try {
    const bank = await api("/api/wordbank/category", {
      method: "POST",
      body: JSON.stringify({ category })
    });
    els.newCategoryInput.value = "";
    state.selectedCategories.add(category);
    state.activeCategory = category;
    await refreshWordbank(bank);
    setLibraryMessage(`已新建题库：${category}`);
  } catch (error) {
    setLibraryMessage(error.message, true);
  }
}

async function addEntry(event) {
  event.preventDefault();
  if (!state.activeCategory) return;
  const word = els.entryWordInput.value.trim();
  const clues = textToClues(els.entryHintInput.value);
  if (!word) {
    setLibraryMessage("词条不能为空。", true);
    return;
  }

  const button = els.entryForm.querySelector("button");
  button.disabled = true;
  button.textContent = clues.length ? "添加中" : "生成线索中";
  try {
    const bank = await api("/api/wordbank/entry", {
      method: "POST",
      body: JSON.stringify({ category: state.activeCategory, word, clues })
    });
    els.entryWordInput.value = "";
    els.entryHintInput.value = "";
    await refreshWordbank(bank);
    setLibraryMessage(`已添加：${word}`);
  } catch (error) {
    setLibraryMessage(error.message, true);
  } finally {
    button.disabled = false;
    button.textContent = "添加词条";
  }
}

async function saveEntry(category, index, word, clueText) {
  try {
    const bank = await api("/api/wordbank/entry", {
      method: "PUT",
      body: JSON.stringify({ category, index, word, clues: textToClues(clueText) })
    });
    await refreshWordbank(bank);
    setLibraryMessage("已保存。");
  } catch (error) {
    setLibraryMessage(error.message, true);
  }
}

async function deleteEntry(category, index) {
  try {
    const bank = await api("/api/wordbank/entry", {
      method: "DELETE",
      body: JSON.stringify({ category, index })
    });
    await refreshWordbank(bank);
    setLibraryMessage("已删除词条。");
  } catch (error) {
    setLibraryMessage(error.message, true);
  }
}

async function regenerateClues(category, word, clueInput, button) {
  const cleanedWord = word.trim();
  if (!cleanedWord) {
    setLibraryMessage("请先填写词条。", true);
    return;
  }

  button.disabled = true;
  button.textContent = "生成中";
  try {
    const data = await api("/api/hint", {
      method: "POST",
      body: JSON.stringify({ category, word: cleanedWord })
    });
    clueInput.value = cluesToText(data.clues || []);
    setLibraryMessage("AI 已生成 3 条分层线索，记得保存。");
  } catch (error) {
    setLibraryMessage(error.message, true);
  } finally {
    button.disabled = false;
    button.textContent = "AI 线索";
  }
}

els.gameNavBtn.addEventListener("click", () => setView("game"));
els.libraryNavBtn.addEventListener("click", () => setView("library"));
els.openLibraryBtn.addEventListener("click", () => setView("library"));
els.askModeBtn.addEventListener("click", () => setMode("ask"));
els.guessModeBtn.addEventListener("click", () => setMode("guess"));
els.playForm.addEventListener("submit", submitTurn);
els.clueBtn.addEventListener("click", showClue);
els.revealBtn.addEventListener("click", revealAnswer);
els.newGameBtn.addEventListener("click", async () => {
  try {
    await newGame();
  } catch (error) {
    setMessage(error.message, true);
  }
});
els.categoryForm.addEventListener("submit", createCategory);
els.entryForm.addEventListener("submit", addEntry);
els.closeEditorBtn.addEventListener("click", () => {
  state.activeCategory = null;
  els.libraryEditor.classList.add("hidden");
});

await loadWordbank();
renderLibrary();

try {
  const gameId = localStorage.getItem("guess-word-game-id");
  if (gameId) {
    state.game = await api(`/api/game/${gameId}`);
    setMessage("已恢复上一局。");
    renderGame();
  } else {
    await newGame();
  }
} catch {
  localStorage.removeItem("guess-word-game-id");
  await newGame();
}
