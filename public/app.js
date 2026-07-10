const state = {
  game: null,
  wordbank: {},
  gameHistory: [],
  shareRecord: null,
  shareStep: 0,
  mode: "ask",
  view: "game",
  selectedCategories: new Set(),
  activeCategory: null
};

const els = {
  gameNavBtn: document.querySelector("#gameNavBtn"),
  libraryNavBtn: document.querySelector("#libraryNavBtn"),
  historyNavBtn: document.querySelector("#historyNavBtn"),
  gameView: document.querySelector("#gameView"),
  libraryView: document.querySelector("#libraryView"),
  historyView: document.querySelector("#historyView"),
  shareView: document.querySelector("#shareView"),
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
  shareBtn: document.querySelector("#shareBtn"),
  newGameBtn: document.querySelector("#newGameBtn"),
  openLibraryBtn: document.querySelector("#openLibraryBtn"),
  categoryToggleAllBtn: document.querySelector("#categoryToggleAllBtn"),
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
  libraryMessage: document.querySelector("#libraryMessage"),
  entryList: document.querySelector("#entryList"),
  refreshHistoryBtn: document.querySelector("#refreshHistoryBtn"),
  gameHistoryList: document.querySelector("#gameHistoryList"),
  emptyGameHistory: document.querySelector("#emptyGameHistory"),
  shareMeta: document.querySelector("#shareMeta"),
  shareSteps: document.querySelector("#shareSteps"),
  nextShareStepBtn: document.querySelector("#nextShareStepBtn"),
  exitShareBtn: document.querySelector("#exitShareBtn")
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
  els.historyNavBtn.classList.toggle("active", view === "history");
  els.gameView.classList.toggle("hidden", view !== "game");
  els.libraryView.classList.toggle("hidden", view !== "library");
  els.historyView.classList.toggle("hidden", view !== "history");
  els.shareView.classList.toggle("hidden", view !== "share");
  if (view === "library") renderLibrary();
  if (view === "history") loadGameHistory();
}

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
}

function normalizeClues(clues) {
  return Array.isArray(clues)
    ? clues.map((clue) => String(clue || "").trim()).filter(Boolean)
    : [];
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
  els.shareBtn.classList.toggle("hidden", !isOver || !game?.shareId);

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

function shareableSteps(record) {
  return (record.history || []).filter((item) => (
    item.type === "question" || item.type === "guess" || item.type === "hint" || item.type === "reveal"
  ));
}

function outcomeText(outcome) {
  if (outcome === "won") return "猜对了";
  if (outcome === "revealed") return "公布答案";
  return "未结束";
}

async function loadGameHistory() {
  try {
    state.gameHistory = await api("/api/history");
    renderGameHistory();
  } catch (error) {
    els.gameHistoryList.innerHTML = "";
    els.emptyGameHistory.textContent = error.message;
    els.emptyGameHistory.classList.remove("hidden");
  }
}

function renderGameHistory() {
  els.gameHistoryList.innerHTML = "";
  els.emptyGameHistory.classList.toggle("hidden", state.gameHistory.length > 0);

  state.gameHistory.forEach((record) => {
    const card = document.createElement("article");
    card.className = "game-history-card";

    const title = document.createElement("div");
    title.className = "history-card-title";
    const strong = document.createElement("strong");
    strong.textContent = `${record.category} · ${outcomeText(record.outcome)}`;
    const time = document.createElement("span");
    time.textContent = new Date(record.endedAt).toLocaleString("zh-CN");
    title.append(strong, time);

    const meta = document.createElement("p");
    meta.className = "subtle";
    meta.textContent = `问题 ${record.questionCount} 轮，猜测 ${record.guessCount} 次，答案：${record.word}`;

    const details = document.createElement("ol");
    details.className = "history-mini-list";
    (record.history || []).forEach((item) => {
      const li = document.createElement("li");
      if (item.type === "question") li.textContent = `问：${item.text} → ${item.answer}`;
      if (item.type === "guess") li.textContent = `猜：${item.text} → ${item.correct ? "正确" : "错误"}`;
      if (item.type === "hint") li.textContent = `线索：${item.answer}`;
      if (item.type === "reveal") li.textContent = `公布答案：${item.answer}`;
      details.append(li);
    });

    const actions = document.createElement("div");
    actions.className = "history-actions";
    const share = document.createElement("button");
    share.type = "button";
    share.className = "text-button";
    share.textContent = "打开分享";
    share.addEventListener("click", () => openShare(record.id));
    actions.append(share);

    card.append(title, meta, details, actions);
    els.gameHistoryList.append(card);
  });
}

async function openShare(id) {
  try {
    state.shareRecord = await api(`/api/share/${id}`);
    state.shareStep = 0;
    const url = new URL(window.location.href);
    url.searchParams.set("share", id);
    window.history.replaceState(null, "", url);
    renderShare();
    setView("share");
  } catch (error) {
    setMessage(error.message, true);
  }
}

function renderShare() {
  const record = state.shareRecord;
  if (!record) return;
  const steps = shareableSteps(record);
  els.shareMeta.textContent = `题库：${record.category} · ${record.questionCount} 个问题 · ${outcomeText(record.outcome)}`;
  els.shareSteps.innerHTML = "";

  steps.slice(0, state.shareStep).forEach((item, index) => {
    const card = document.createElement("article");
    card.className = "share-step";
    const label = document.createElement("span");
    label.className = "share-step-label";
    label.textContent = `#${index + 1}`;
    const text = document.createElement("p");
    if (item.type === "question") text.textContent = `问：${item.text}`;
    if (item.type === "guess") text.textContent = `猜：${item.text}`;
    if (item.type === "hint") text.textContent = `查看线索：${item.answer}`;
    if (item.type === "reveal") text.textContent = "玩家选择公布答案";
    const result = document.createElement("strong");
    if (item.type === "question") result.textContent = `AI：${item.answer}`;
    if (item.type === "guess") result.textContent = item.correct ? "答案正确" : "答案错误";
    if (item.type === "hint") result.textContent = "线索已出现";
    if (item.type === "reveal") result.textContent = `正解：${item.answer}`;
    card.append(label, text, result);
    els.shareSteps.append(card);
  });

  const done = state.shareStep >= steps.length;
  els.nextShareStepBtn.textContent = done ? `最终答案：${record.word}` : "揭晓下一步";
  els.nextShareStepBtn.disabled = done;
}

async function shareCurrentGame() {
  if (!state.game?.shareId) return;
  const url = new URL(window.location.href);
  url.searchParams.set("share", state.game.shareId);
  try {
    await navigator.clipboard.writeText(url.toString());
    setMessage("分享链接已复制。");
  } catch {
    setMessage(url.toString());
  }
  await openShare(state.game.shareId);
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
      updateCategoryToggleButton();
    });

    const name = document.createElement("span");
    name.textContent = category;
    const count = document.createElement("small");
    count.textContent = `${entries.length} 个`;
    label.append(checkbox, name, count);
    els.categoryList.append(label);
  });
  updateCategoryToggleButton();
}

function updateCategoryToggleButton() {
  const total = Object.keys(state.wordbank).length;
  const selected = state.selectedCategories.size;
  els.categoryToggleAllBtn.textContent = selected === total && total > 0 ? "全不选" : "全选";
}

function toggleAllCategories() {
  const categories = Object.keys(state.wordbank);
  if (state.selectedCategories.size === categories.length) {
    state.selectedCategories.clear();
  } else {
    state.selectedCategories = new Set(categories);
  }
  renderCategoryPicker();
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
  els.editorMeta.textContent = `${entries.length} 个词条。拖动线索左侧的三横线可以调整公布顺序。`;
  els.entryList.innerHTML = "";

  entries.forEach((entry, index) => {
    const row = document.createElement("article");
    row.className = "entry-row";

    const main = document.createElement("div");
    main.className = "entry-main";

    const wordInput = document.createElement("input");
    wordInput.value = entry.word;
    wordInput.placeholder = "词条";

    const saveBtn = document.createElement("button");
    saveBtn.type = "button";
    saveBtn.textContent = "保存";
    saveBtn.addEventListener("click", () => saveEntry(category, index, wordInput.value, entry.clues));

    const generateBtn = document.createElement("button");
    generateBtn.type = "button";
    generateBtn.className = "secondary-button";
    generateBtn.textContent = "AI 线索";
    generateBtn.addEventListener("click", () => regenerateClues(category, index, wordInput.value, generateBtn));

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "danger-button compact";
    deleteBtn.textContent = "删除";
    deleteBtn.addEventListener("click", () => deleteEntry(category, index));

    main.append(wordInput, saveBtn, generateBtn, deleteBtn);

    const clueList = document.createElement("div");
    clueList.className = "clue-list";
    renderClueItems(clueList, category, index, wordInput, entry.clues || []);

    const addClueBtn = document.createElement("button");
    addClueBtn.type = "button";
    addClueBtn.className = "add-clue-button";
    addClueBtn.textContent = "+ 添加线索";
    addClueBtn.addEventListener("click", () => addClueInline(clueList, category, index, wordInput.value));

    row.append(main, clueList, addClueBtn);
    els.entryList.append(row);
  });
}

function renderClueItems(container, category, entryIndex, wordInput, clues) {
  container.innerHTML = "";
  normalizeClues(clues).forEach((clue, clueIndex) => {
    const item = document.createElement("div");
    item.className = "clue-chip";
    item.draggable = true;
    item.dataset.index = String(clueIndex);

    const handle = document.createElement("button");
    handle.type = "button";
    handle.className = "drag-handle";
    handle.title = "拖动排序";
    handle.setAttribute("aria-label", "拖动排序");
    handle.textContent = "☰";

    const number = document.createElement("span");
    number.className = "clue-number";
    number.textContent = String(clueIndex + 1);

    const text = document.createElement("span");
    text.className = "clue-text";
    text.textContent = clue;

    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.className = "icon-tool";
    editBtn.title = "编辑线索";
    editBtn.setAttribute("aria-label", "编辑线索");
    editBtn.textContent = "✎";
    editBtn.addEventListener("click", () => editClueInline(item, category, entryIndex, clueIndex, wordInput.value));

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "icon-tool danger";
    deleteBtn.title = "删除线索";
    deleteBtn.setAttribute("aria-label", "删除线索");
    deleteBtn.textContent = "×";
    deleteBtn.addEventListener("click", () => deleteClue(category, entryIndex, clueIndex, wordInput.value));

    item.addEventListener("dragstart", (event) => {
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", String(clueIndex));
      item.classList.add("dragging");
    });
    item.addEventListener("dragend", () => item.classList.remove("dragging"));
    item.addEventListener("dragover", (event) => {
      event.preventDefault();
      item.classList.add("drag-over");
    });
    item.addEventListener("dragleave", () => item.classList.remove("drag-over"));
    item.addEventListener("drop", async (event) => {
      event.preventDefault();
      item.classList.remove("drag-over");
      const fromIndex = Number(event.dataTransfer.getData("text/plain"));
      if (!Number.isInteger(fromIndex) || fromIndex === clueIndex) return;
      await moveClue(category, entryIndex, fromIndex, clueIndex, wordInput.value);
    });

    item.append(handle, number, text, editBtn, deleteBtn);
    container.append(item);
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
  if (!word) {
    setLibraryMessage("词条不能为空。", true);
    return;
  }

  const button = els.entryForm.querySelector("button");
  button.disabled = true;
  button.textContent = "生成线索中";
  try {
    const bank = await api("/api/wordbank/entry", {
      method: "POST",
      body: JSON.stringify({ category: state.activeCategory, word, clues: [] })
    });
    els.entryWordInput.value = "";
    await refreshWordbank(bank);
    setLibraryMessage(`已添加：${word}`);
  } catch (error) {
    setLibraryMessage(error.message, true);
  } finally {
    button.disabled = false;
    button.textContent = "添加词条";
  }
}

async function saveEntry(category, index, word, clues) {
  try {
    const bank = await api("/api/wordbank/entry", {
      method: "PUT",
      body: JSON.stringify({ category, index, word, clues: normalizeClues(clues) })
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

async function updateEntry(category, index, word, clues, message = "已保存。") {
  const bank = await api("/api/wordbank/entry", {
    method: "PUT",
    body: JSON.stringify({ category, index, word, clues: normalizeClues(clues) })
  });
  await refreshWordbank(bank);
  setLibraryMessage(message);
}

function addClueInline(container, category, entryIndex, word) {
  const entry = state.wordbank[category]?.[entryIndex];
  if (!entry) return;

  const item = document.createElement("div");
  item.className = "clue-chip editing";

  const input = document.createElement("input");
  input.className = "clue-edit-input";
  input.placeholder = "输入新线索";

  const saveBtn = document.createElement("button");
  saveBtn.type = "button";
  saveBtn.className = "icon-tool";
  saveBtn.title = "保存线索";
  saveBtn.textContent = "✓";

  const cancelBtn = document.createElement("button");
  cancelBtn.type = "button";
  cancelBtn.className = "icon-tool danger";
  cancelBtn.title = "取消";
  cancelBtn.textContent = "×";

  const save = async () => {
    const clue = input.value.trim();
    if (!clue) return;
    try {
      await updateEntry(category, entryIndex, word, [...normalizeClues(entry.clues), clue], "已添加线索。");
    } catch (error) {
      setLibraryMessage(error.message, true);
    }
  };

  saveBtn.addEventListener("click", save);
  cancelBtn.addEventListener("click", () => renderLibrary());
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") save();
    if (event.key === "Escape") renderLibrary();
  });

  item.append(input, saveBtn, cancelBtn);
  container.append(item);
  input.focus();
}

async function deleteClue(category, entryIndex, clueIndex, word) {
  const entry = state.wordbank[category]?.[entryIndex];
  if (!entry) return;
  const clues = normalizeClues(entry.clues).filter((_, index) => index !== clueIndex);
  try {
    await updateEntry(category, entryIndex, word, clues, "已删除线索。");
  } catch (error) {
    setLibraryMessage(error.message, true);
  }
}

async function moveClue(category, entryIndex, fromIndex, toIndex, word) {
  const entry = state.wordbank[category]?.[entryIndex];
  if (!entry) return;
  const clues = normalizeClues(entry.clues);
  const [moved] = clues.splice(fromIndex, 1);
  clues.splice(toIndex, 0, moved);
  try {
    await updateEntry(category, entryIndex, word, clues, "已调整线索顺序。");
  } catch (error) {
    setLibraryMessage(error.message, true);
  }
}

function editClueInline(item, category, entryIndex, clueIndex, word) {
  const entry = state.wordbank[category]?.[entryIndex];
  if (!entry) return;
  const current = normalizeClues(entry.clues)[clueIndex] || "";
  item.classList.add("editing");
  item.innerHTML = "";

  const input = document.createElement("input");
  input.className = "clue-edit-input";
  input.value = current;

  const saveBtn = document.createElement("button");
  saveBtn.type = "button";
  saveBtn.className = "icon-tool";
  saveBtn.title = "保存线索";
  saveBtn.textContent = "✓";

  const cancelBtn = document.createElement("button");
  cancelBtn.type = "button";
  cancelBtn.className = "icon-tool danger";
  cancelBtn.title = "取消编辑";
  cancelBtn.textContent = "×";

  const save = async () => {
    const next = input.value.trim();
    if (!next) return;
    const clues = normalizeClues(entry.clues);
    clues[clueIndex] = next;
    try {
      await updateEntry(category, entryIndex, word, clues, "已更新线索。");
    } catch (error) {
      setLibraryMessage(error.message, true);
    }
  };

  saveBtn.addEventListener("click", save);
  cancelBtn.addEventListener("click", () => renderLibrary());
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") save();
    if (event.key === "Escape") renderLibrary();
  });

  item.append(input, saveBtn, cancelBtn);
  input.focus();
  input.select();
}

async function regenerateClues(category, index, word, button) {
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
    await updateEntry(category, index, cleanedWord, data.clues || [], "AI 已生成并保存 3 条分层线索。");
  } catch (error) {
    setLibraryMessage(error.message, true);
  } finally {
    button.disabled = false;
    button.textContent = "AI 线索";
  }
}

els.gameNavBtn.addEventListener("click", () => setView("game"));
els.libraryNavBtn.addEventListener("click", () => setView("library"));
els.historyNavBtn.addEventListener("click", () => setView("history"));
els.openLibraryBtn.addEventListener("click", () => setView("library"));
els.categoryToggleAllBtn.addEventListener("click", toggleAllCategories);
els.askModeBtn.addEventListener("click", () => setMode("ask"));
els.guessModeBtn.addEventListener("click", () => setMode("guess"));
els.playForm.addEventListener("submit", submitTurn);
els.clueBtn.addEventListener("click", showClue);
els.revealBtn.addEventListener("click", revealAnswer);
els.shareBtn.addEventListener("click", shareCurrentGame);
els.refreshHistoryBtn.addEventListener("click", loadGameHistory);
els.nextShareStepBtn.addEventListener("click", () => {
  state.shareStep += 1;
  renderShare();
});
els.exitShareBtn.addEventListener("click", () => {
  const url = new URL(window.location.href);
  url.searchParams.delete("share");
  window.history.replaceState(null, "", url);
  setView("game");
});
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
  const shareId = new URLSearchParams(window.location.search).get("share");
  if (shareId) {
    await openShare(shareId);
  }
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
