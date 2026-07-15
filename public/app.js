const MAX_CLUES = 5;
const MOBILE_QUERY = window.matchMedia("(max-width: 920px)");
const ASK_PLACEHOLDER_PREFIXES = ["它", "这个答案", "你想的词", "目标对象"];
const ASK_PLACEHOLDER_TRAITS = [
  "通常能被人拿在手里",
  "和日常生活关系很近",
  "属于人工制造的东西",
  "主要出现在室内",
  "经常在户外出现",
  "通常比一个成年人小",
  "通常比一个成年人大",
  "和食物或饮品有关",
  "和交通出行有关",
  "和学习工作有关",
  "和艺术作品有关",
  "和历史人物有关",
  "在现代社会仍然常见",
  "需要用电或能源",
  "通常有固定的形状",
  "可以被看见或触摸",
  "和节日或仪式有关",
  "常出现在影视或游戏里",
  "名字里可能有两个以上汉字",
  "更偏自然界而不是人造物",
  "常被多人一起使用或欣赏",
  "和运动或身体活动有关",
  "常见于城市环境",
  "常见于家庭环境",
  "有明显的颜色或外观特征",
  "会发出声音或与声音有关",
  "常被用来收藏或展示",
  "通常不是活物",
  "可能是一个虚构概念或角色",
  "和水有关",
  "和动物有关",
  "和植物有关",
  "和天气或自然现象有关",
  "可以作为礼物",
  "有明确的功能用途"
];
const ASK_PLACEHOLDERS = ASK_PLACEHOLDER_TRAITS.flatMap((trait) =>
  ASK_PLACEHOLDER_PREFIXES.map((prefix) => `${prefix}${trait}吗？`)
);

const state = {
  game: null,
  wordbank: {},
  categoryCovers: {},
  gameHistory: [],
  shareRecord: null,
  shareStep: 0,
  categorySelectionInitialized: false,
  view: "game",
  gameStage: "mode",
  libraryCardMode: MOBILE_QUERY.matches ? "compact" : "large",
  selectedCategories: new Set(),
  activeCategory: null,
  editingCategory: null,
  pendingConfirm: null,
  modalEntryClues: [],
  entryPageSize: 10,
  entryPages: {}
};

const els = {
  gameNavBtn: document.querySelector("#gameNavBtn"),
  libraryNavBtn: document.querySelector("#libraryNavBtn"),
  historyNavBtn: document.querySelector("#historyNavBtn"),
  gameView: document.querySelector("#gameView"),
  libraryView: document.querySelector("#libraryView"),
  historyView: document.querySelector("#historyView"),
  shareView: document.querySelector("#shareView"),
  myHomePanel: document.querySelector("#myHomePanel"),
  myHistoryPanel: document.querySelector("#myHistoryPanel"),
  openGameHistoryBtn: document.querySelector("#openGameHistoryBtn"),
  backToMyBtn: document.querySelector("#backToMyBtn"),
  categoryLabel: document.querySelector("#categoryLabel"),
  questionCount: document.querySelector("#questionCount"),
  guessCount: document.querySelector("#guessCount"),
  historyPanel: document.querySelector(".history-panel"),
  historyList: document.querySelector("#historyList"),
  emptyHistory: document.querySelector("#emptyHistory"),
  message: document.querySelector("#message"),
  winBanner: document.querySelector("#winBanner"),
  bannerTitle: document.querySelector("#bannerTitle"),
  revealedWord: document.querySelector("#revealedWord"),
  revealedImage: document.querySelector("#revealedImage"),
  hintBanner: document.querySelector("#hintBanner"),
  hintText: document.querySelector("#hintText"),
  playForm: document.querySelector("#playForm"),
  mainInput: document.querySelector("#mainInput"),
  submitBtn: document.querySelector("#submitBtn"),
  finalGuessBtn: document.querySelector("#finalGuessBtn"),
  clueBtn: document.querySelector("#clueBtn"),
  revealBtn: document.querySelector("#revealBtn"),
  shareBtn: document.querySelector("#shareBtn"),
  rerollCurrentBtn: document.querySelector("#rerollCurrentBtn"),
  newGameBtn: document.querySelector("#newGameBtn"),
  chooseBankModeBtn: document.querySelector("#chooseBankModeBtn"),
  dailyModeBtn: document.querySelector("#dailyModeBtn"),
  gameModePanel: document.querySelector("#gameModePanel"),
  gameCategoryPanel: document.querySelector("#gameCategoryPanel"),
  gamePlayPanel: document.querySelector("#gamePlayPanel"),
  backToModeBtn: document.querySelector("#backToModeBtn"),
  randomCategoryBtn: document.querySelector("#randomCategoryBtn"),
  startSelectedGameBtn: document.querySelector("#startSelectedGameBtn"),
  categoryList: document.querySelector("#categoryList"),
  openCategoryModalBtn: document.querySelector("#openCategoryModalBtn"),
  categoryModal: document.querySelector("#categoryModal"),
  categoryModalForm: document.querySelector("#categoryModalForm"),
  categoryModalCloseBtn: document.querySelector("#categoryModalCloseBtn"),
  categoryModalCancelBtn: document.querySelector("#categoryModalCancelBtn"),
  categoryModalSubmitBtn: document.querySelector("#categoryModalSubmitBtn"),
  modalCategoryNameInput: document.querySelector("#modalCategoryNameInput"),
  modalCategoryCoverInput: document.querySelector("#modalCategoryCoverInput"),
  modalCategoryCoverName: document.querySelector("#modalCategoryCoverName"),
  categoryEditModal: document.querySelector("#categoryEditModal"),
  categoryEditForm: document.querySelector("#categoryEditForm"),
  categoryEditCloseBtn: document.querySelector("#categoryEditCloseBtn"),
  categoryEditCancelBtn: document.querySelector("#categoryEditCancelBtn"),
  categoryEditSubmitBtn: document.querySelector("#categoryEditSubmitBtn"),
  editCategoryNameInput: document.querySelector("#editCategoryNameInput"),
  editCategoryCoverInput: document.querySelector("#editCategoryCoverInput"),
  editCategoryCoverName: document.querySelector("#editCategoryCoverName"),
  deleteCategoryBtn: document.querySelector("#deleteCategoryBtn"),
  confirmModal: document.querySelector("#confirmModal"),
  confirmModalTitle: document.querySelector("#confirmModalTitle"),
  confirmModalText: document.querySelector("#confirmModalText"),
  confirmCancelBtn: document.querySelector("#confirmCancelBtn"),
  confirmOkBtn: document.querySelector("#confirmOkBtn"),
  finalGuessModal: document.querySelector("#finalGuessModal"),
  finalGuessForm: document.querySelector("#finalGuessForm"),
  finalGuessCloseBtn: document.querySelector("#finalGuessCloseBtn"),
  finalGuessCancelBtn: document.querySelector("#finalGuessCancelBtn"),
  finalGuessInput: document.querySelector("#finalGuessInput"),
  finalGuessSubmitBtn: document.querySelector("#finalGuessSubmitBtn"),
  finalGuessResult: document.querySelector("#finalGuessResult"),
  libraryMain: document.querySelector("#libraryMain"),
  libraryCards: document.querySelector("#libraryCards"),
  libraryEditor: document.querySelector("#libraryEditor"),
  editorTitle: document.querySelector("#editorTitle"),
  editorMeta: document.querySelector("#editorMeta"),
  closeEditorBtn: document.querySelector("#closeEditorBtn"),
  addEntryBtn: document.querySelector("#addEntryBtn"),
  largeLibraryModeBtn: document.querySelector("#largeLibraryModeBtn"),
  compactLibraryModeBtn: document.querySelector("#compactLibraryModeBtn"),
  entryModal: document.querySelector("#entryModal"),
  entryModalForm: document.querySelector("#entryModalForm"),
  entryModalCloseBtn: document.querySelector("#entryModalCloseBtn"),
  entryModalCancelBtn: document.querySelector("#entryModalCancelBtn"),
  entryModalSubmitBtn: document.querySelector("#entryModalSubmitBtn"),
  modalEntryWordInput: document.querySelector("#modalEntryWordInput"),
  modalEntryImageInput: document.querySelector("#modalEntryImageInput"),
  modalEntryImageName: document.querySelector("#modalEntryImageName"),
  modalEntryClueList: document.querySelector("#modalEntryClueList"),
  modalEntryAddClueBtn: document.querySelector("#modalEntryAddClueBtn"),
  modalEntryAiFillBtn: document.querySelector("#modalEntryAiFillBtn"),
  modalEntryClueLimitNote: document.querySelector("#modalEntryClueLimitNote"),
  libraryMessage: document.querySelector("#libraryMessage"),
  entryPager: document.querySelector("#entryPager"),
  entryList: document.querySelector("#entryList"),
  refreshHistoryBtn: document.querySelector("#refreshHistoryBtn"),
  gameHistoryList: document.querySelector("#gameHistoryList"),
  emptyGameHistory: document.querySelector("#emptyGameHistory"),
  shareMeta: document.querySelector("#shareMeta"),
  shareSteps: document.querySelector("#shareSteps"),
  nextShareStepBtn: document.querySelector("#nextShareStepBtn"),
  exitShareBtn: document.querySelector("#exitShareBtn"),
  toastRegion: document.querySelector("#toastRegion")
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

function clearLibraryMessage() {
  setLibraryMessage("");
}

function showToast(text, isError = false) {
  const item = document.createElement("div");
  item.className = `toast${isError ? " error" : ""}`;
  item.textContent = text;
  els.toastRegion.append(item);
  window.setTimeout(() => {
    item.classList.add("leaving");
    window.setTimeout(() => item.remove(), 180);
  }, 2600);
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
  els.finalGuessBtn.disabled = isLoading || isOver;
  els.revealBtn.disabled = isLoading || isOver;
  els.clueBtn.disabled = isLoading || isOver || !canShowMoreClues();
  els.newGameBtn.disabled = isLoading;
  els.rerollCurrentBtn.disabled = isLoading;
  els.submitBtn.textContent = isLoading ? "等待中" : "提交";
}

function randomAskPlaceholder() {
  return ASK_PLACEHOLDERS[Math.floor(Math.random() * ASK_PLACEHOLDERS.length)];
}

function refreshMainInputPlaceholder() {
  els.mainInput.placeholder = randomAskPlaceholder();
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
  if (view === "history") showMyHome();
}

function setGameStage(stage) {
  state.gameStage = stage;
  els.gameModePanel.classList.toggle("hidden", stage !== "mode");
  els.gameCategoryPanel.classList.toggle("hidden", stage !== "category");
  els.gamePlayPanel.classList.toggle("hidden", stage !== "play");
  if (stage === "category") renderCategoryPicker();
  if (stage === "play") renderGame();
}

function showMyHome() {
  els.myHomePanel.classList.remove("hidden");
  els.myHistoryPanel.classList.add("hidden");
}

async function showMyHistory() {
  els.myHomePanel.classList.add("hidden");
  els.myHistoryPanel.classList.remove("hidden");
  await loadGameHistory();
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

function askConfirm({ title = "确认操作", text = "确定要继续吗？此操作无法撤销。", okText = "确认" } = {}) {
  els.confirmModalTitle.textContent = title;
  els.confirmModalText.textContent = text;
  els.confirmOkBtn.textContent = okText;
  els.confirmModal.classList.remove("hidden");
  els.confirmOkBtn.focus();
  return new Promise((resolve) => {
    state.pendingConfirm = resolve;
  });
}

function closeConfirm(result = false) {
  els.confirmModal.classList.add("hidden");
  if (state.pendingConfirm) {
    const resolve = state.pendingConfirm;
    state.pendingConfirm = null;
    resolve(result);
  }
}

function updateFileName(input, target, fallback = "未选择图片") {
  target.textContent = input.files?.[0]?.name || fallback;
}

function currentModalEntryClues() {
  return normalizeClues(state.modalEntryClues).slice(0, MAX_CLUES);
}

function moveModalEntryClue(fromIndex, toIndex) {
  if (fromIndex === toIndex) return;
  const clues = [...state.modalEntryClues];
  const [moved] = clues.splice(fromIndex, 1);
  clues.splice(toIndex, 0, moved);
  state.modalEntryClues = clues;
  renderModalEntryClues();
}

function renderModalEntryClues() {
  els.modalEntryClueList.innerHTML = "";
  state.modalEntryClues = state.modalEntryClues.slice(0, MAX_CLUES);

  state.modalEntryClues.forEach((clue, clueIndex) => {
    const item = document.createElement("div");
    item.className = "clue-chip modal-clue-chip";
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

    const input = document.createElement("input");
    input.className = "clue-edit-input";
    input.value = clue;
    input.placeholder = "填写线索";
    input.addEventListener("input", () => {
      state.modalEntryClues[clueIndex] = input.value;
    });

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "icon-tool danger";
    deleteBtn.title = "删除线索";
    deleteBtn.setAttribute("aria-label", "删除线索");
    deleteBtn.textContent = "×";
    deleteBtn.disabled = state.modalEntryClues.length <= 1;
    deleteBtn.addEventListener("click", () => {
      if (state.modalEntryClues.length <= 1) return;
      state.modalEntryClues.splice(clueIndex, 1);
      renderModalEntryClues();
    });

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
    item.addEventListener("drop", (event) => {
      event.preventDefault();
      item.classList.remove("drag-over");
      const fromIndex = Number(event.dataTransfer.getData("text/plain"));
      if (!Number.isInteger(fromIndex)) return;
      moveModalEntryClue(fromIndex, clueIndex);
    });

    item.append(handle, number, input, deleteBtn);
    els.modalEntryClueList.append(item);
  });

  const atLimit = state.modalEntryClues.length >= MAX_CLUES;
  els.modalEntryAddClueBtn.disabled = atLimit;
  els.modalEntryClueLimitNote.textContent = atLimit ? "该词条已经有五条线索了，无法再添加新的线索。" : "";
}

function addModalEntryClue() {
  if (state.modalEntryClues.length >= MAX_CLUES) {
    showToast("该词条已经有五条线索了，无法再添加新的线索。", true);
    return;
  }
  state.modalEntryClues.push("");
  renderModalEntryClues();
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
  els.historyList.innerHTML = "";
  els.historyPanel?.classList?.toggle("empty-state", history.length === 0);
  els.historyList.classList.toggle("hidden", history.length === 0);
  els.emptyHistory.classList.toggle("hidden", history.length > 0);

  els.hintBanner.classList.add("hidden");
  els.hintText.innerHTML = "";
  els.clueBtn.classList.toggle("has-clue", shownClues.length > 0);
  els.clueBtn.replaceChildren();
  const clueAction = document.createElement("span");
  clueAction.className = "clue-button-action";
  clueAction.textContent = clueIndex < clueCount ? `查看下一条线索（${clueIndex}/${clueCount}）` : "线索已用完";
  els.clueBtn.append(clueAction);
  if (shownClues.length > 0) {
    const clueList = document.createElement("span");
    clueList.className = "clue-button-list";
    const label = document.createElement("span");
    label.textContent = "线索";
    const items = document.createElement("span");
    items.className = "clue-button-items";
    shownClues.forEach((clue, index) => {
      const item = document.createElement("strong");
      item.textContent = `${index + 1}. ${clue}`;
      items.append(item);
    });
    clueList.append(label, items);
    els.clueBtn.append(clueList);
  }
  els.winBanner.classList.toggle("hidden", !isOver);
  els.bannerTitle.textContent = game?.isWon ? "答案正确" : "已公布答案";
  els.revealedWord.textContent = game?.revealedWord || "";
  els.revealedImage.classList.toggle("hidden", !game?.revealedImage);
  if (game?.revealedImage) els.revealedImage.src = game.revealedImage;
  els.mainInput.disabled = isOver;
  els.submitBtn.disabled = isOver;
  els.finalGuessBtn.disabled = isOver;
  els.revealBtn.disabled = isOver;
  els.clueBtn.disabled = isOver || !canShowMoreClues();
  els.shareBtn.classList.toggle("hidden", !isOver || !game?.shareId);
  els.rerollCurrentBtn.classList.toggle("hidden", !isOver || !game?.category);

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
  els.shareMeta.textContent = `词库：${record.category} · ${record.questionCount} 个问题 · ${outcomeText(record.outcome)}`;
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
  if (state.selectedCategories.size > 1) {
    state.selectedCategories = new Set([state.selectedCategories.values().next().value]);
  }
  if (!state.categorySelectionInitialized) {
    state.categorySelectionInitialized = true;
  }

  els.categoryList.innerHTML = "";
  categories.forEach((category) => {
    const entries = state.wordbank[category] || [];
    const row = document.createElement("button");
    row.type = "button";
    row.className = "category-row";
    row.classList.toggle("selected", state.selectedCategories.has(category));
    row.setAttribute("aria-pressed", state.selectedCategories.has(category) ? "true" : "false");
    row.addEventListener("click", () => {
      state.selectedCategories = new Set([category]);
      renderCategoryPicker();
      updateCategoryActions();
    });

    const name = document.createElement("span");
    name.textContent = category;
    const count = document.createElement("small");
    count.textContent = `${entries.length} 个`;
    row.append(name, count);
    els.categoryList.append(row);
  });
  updateCategoryActions();
}

function updateCategoryActions() {
  const total = Object.keys(state.wordbank).length;
  const selected = state.selectedCategories.size;
  els.startSelectedGameBtn.disabled = selected === 0;
  els.randomCategoryBtn.disabled = total === 0;
}

function selectRandomCategory() {
  const categories = Object.keys(state.wordbank);
  if (!categories.length) return;
  const randomCategory = categories[Math.floor(Math.random() * categories.length)];
  state.selectedCategories = new Set([randomCategory]);
  renderCategoryPicker();
  showToast(`已选择：${randomCategory}`);
}

function renderLibrary() {
  applyLibraryCardMode();
  renderLibraryCards();
  if (state.activeCategory && state.wordbank[state.activeCategory]) {
    renderEditor(state.activeCategory);
  } else {
    state.activeCategory = null;
    els.libraryMain.classList.remove("hidden");
    els.libraryEditor.classList.add("hidden");
  }
}

function applyLibraryCardMode() {
  const compact = MOBILE_QUERY.matches && state.libraryCardMode === "compact";
  els.libraryCards.classList.toggle("compact-mode", compact);
  els.libraryCards.classList.toggle("large-mode", !compact);
  els.compactLibraryModeBtn.classList.toggle("active", compact);
  els.largeLibraryModeBtn.classList.toggle("active", !compact);
}

function setLibraryCardMode(mode) {
  state.libraryCardMode = mode;
  applyLibraryCardMode();
}

function renderLibraryCards() {
  els.libraryCards.innerHTML = "";
  Object.entries(state.wordbank).forEach(([category, entries]) => {
    const card = document.createElement("article");
    card.className = "library-card";
    card.tabIndex = 0;
    card.setAttribute("role", "button");
    card.setAttribute("aria-label", `打开词库 ${category}`);
    const openCategory = () => {
      state.activeCategory = category;
      state.entryPages[category] = 1;
      clearLibraryMessage();
      renderEditor(category);
    };
    card.addEventListener("click", openCategory);
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openCategory();
      }
    });

    const cover = document.createElement("img");
    cover.className = "library-card-cover";
    cover.src = state.categoryCovers[category] || entries[0]?.image || "/images/placeholder.svg";
    cover.alt = "";
    cover.loading = "lazy";

    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.className = "library-card-edit";
    editBtn.title = "编辑词库";
    editBtn.setAttribute("aria-label", `编辑词库 ${category}`);
    editBtn.textContent = "✎";
    editBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      openCategoryEditModal(category);
    });

    const body = document.createElement("div");
    body.className = "library-card-body";

    const title = document.createElement("strong");
    title.textContent = category;
    const meta = document.createElement("span");
    meta.textContent = `${entries.length} 个词条`;
    const sample = document.createElement("small");
    sample.textContent = entries.slice(0, 3).map((entry) => entry.word).join("、") || "空词库";
    body.append(title, meta, sample);
    card.append(cover, editBtn, body);
    els.libraryCards.append(card);
  });
}

function entryPageFor(category, entryCount) {
  const totalPages = Math.max(1, Math.ceil(entryCount / state.entryPageSize));
  const current = Number(state.entryPages[category] || 1);
  const page = Math.min(Math.max(1, current), totalPages);
  state.entryPages[category] = page;
  return { page, totalPages };
}

function renderEntryPager(category, entryCount, page, totalPages) {
  els.entryPager.innerHTML = "";
  if (!entryCount) {
    els.entryPager.classList.add("hidden");
    return;
  }

  els.entryPager.classList.remove("hidden");

  const sizeGroup = document.createElement("div");
  sizeGroup.className = "entry-page-size";

  const sizeLabel = document.createElement("span");
  sizeLabel.textContent = "每页";

  const sizeSelect = document.createElement("select");
  [5, 10, 20].forEach((size) => {
    const option = document.createElement("option");
    option.value = String(size);
    option.textContent = `${size} 条`;
    option.selected = size === state.entryPageSize;
    sizeSelect.append(option);
  });
  sizeSelect.addEventListener("change", () => {
    state.entryPageSize = Number(sizeSelect.value);
    state.entryPages[category] = 1;
    renderEditor(category);
  });

  sizeGroup.append(sizeLabel, sizeSelect);

  const actions = document.createElement("div");
  actions.className = "entry-page-actions";

  const prevBtn = document.createElement("button");
  prevBtn.type = "button";
  prevBtn.className = "text-button";
  prevBtn.textContent = "上一页";
  prevBtn.disabled = page <= 1;
  prevBtn.addEventListener("click", () => {
    state.entryPages[category] = page - 1;
    renderEditor(category);
  });

  const pageText = document.createElement("span");
  pageText.textContent = `${page} / ${totalPages}`;

  const nextBtn = document.createElement("button");
  nextBtn.type = "button";
  nextBtn.className = "text-button";
  nextBtn.textContent = "下一页";
  nextBtn.disabled = page >= totalPages;
  nextBtn.addEventListener("click", () => {
    state.entryPages[category] = page + 1;
    renderEditor(category);
  });

  actions.append(prevBtn, pageText, nextBtn);
  els.entryPager.append(sizeGroup, actions);
}

function renderEditor(category) {
  const entries = state.wordbank[category] || [];
  const { page, totalPages } = entryPageFor(category, entries.length);
  const startIndex = (page - 1) * state.entryPageSize;
  const visibleEntries = entries.slice(startIndex, startIndex + state.entryPageSize);
  els.libraryMain.classList.add("hidden");
  els.libraryEditor.classList.remove("hidden");
  els.editorTitle.textContent = category;
  els.editorMeta.textContent = `${entries.length} 个词条`;
  renderEntryPager(category, entries.length, page, totalPages);
  els.entryList.innerHTML = "";

  visibleEntries.forEach((entry, offset) => {
    const index = startIndex + offset;
    const row = document.createElement("article");
    row.className = "entry-row";

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "entry-delete-button";
    deleteBtn.title = "删除词条";
    deleteBtn.setAttribute("aria-label", `删除词条 ${entry.word}`);
    deleteBtn.textContent = "×";
    deleteBtn.addEventListener("click", () => deleteEntry(category, index, entry.word));

    const main = document.createElement("div");
    main.className = "entry-main";

    const content = document.createElement("div");
    content.className = "entry-content";

    const wordField = document.createElement("label");
    wordField.className = "field-block word-field";

    const wordLabel = document.createElement("span");
    wordLabel.className = "field-label";
    wordLabel.textContent = "词条名字：";

    const wordInput = document.createElement("input");
    wordInput.value = entry.word;
    wordInput.placeholder = "词条";
    wordInput.addEventListener("change", () => {
      const nextWord = wordInput.value.trim();
      if (!nextWord || nextWord === entry.word) return;
      saveEntry(category, index, nextWord, entry.clues, imageInput.value, false);
    });
    wordField.append(wordLabel, wordInput);

    const imageInput = { value: entry.image || "" };

    const imagePanel = document.createElement("div");
    imagePanel.className = "entry-image-panel";

    const imagePreview = document.createElement("img");
    imagePreview.className = "entry-image-preview";
    imagePreview.src = entry.image || "/images/placeholder.svg";
    imagePreview.alt = `${entry.word} 图片`;

    const imageTools = document.createElement("div");
    imageTools.className = "entry-image-tools";

    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/png,image/jpeg,image/webp,image/gif,image/svg+xml";
    fileInput.className = "hidden-file-input";

    const uploadBtn = document.createElement("button");
    uploadBtn.type = "button";
    uploadBtn.className = "secondary-button";
    uploadBtn.textContent = "上传图片";
    uploadBtn.addEventListener("click", () => fileInput.click());
    fileInput.addEventListener("change", () => {
      const file = fileInput.files?.[0];
      if (file) uploadEntryImage(category, index, file, uploadBtn);
      fileInput.value = "";
    });

    imageTools.append(uploadBtn, fileInput);
    imagePanel.append(imagePreview, imageTools);

    const generateBtn = document.createElement("button");
    generateBtn.type = "button";
    generateBtn.className = "ai-clue-button";
    generateBtn.textContent = "让 AI 重新生成此词条的相关线索";
    generateBtn.addEventListener("click", () => regenerateClues(category, index, wordInput.value, generateBtn));

    main.append(wordField, generateBtn);

    const clueSection = document.createElement("section");
    clueSection.className = "entry-clues";

    const clueLabel = document.createElement("p");
    clueLabel.className = "field-label";
    clueLabel.textContent = "词条线索：";

    const clueList = document.createElement("div");
    clueList.className = "clue-list";
    const existingClues = normalizeClues(entry.clues);
    renderClueItems(clueList, category, index, wordInput, imageInput, existingClues);

    const addClueBtn = document.createElement("button");
    addClueBtn.type = "button";
    addClueBtn.className = "add-clue-button";
    addClueBtn.textContent = "+ 添加线索";
    addClueBtn.disabled = existingClues.length >= MAX_CLUES;
    addClueBtn.addEventListener("click", () => addClueInline(clueList, category, index, wordInput.value, imageInput.value));

    const clueTools = document.createElement("div");
    clueTools.className = "clue-toolbar";

    const clueLimitNote = document.createElement("small");
    clueLimitNote.className = "clue-limit-note";
    clueLimitNote.textContent = existingClues.length >= MAX_CLUES ? "该词条已经有五条线索了，无法再添加新的线索。" : "";

    clueTools.append(addClueBtn, clueLimitNote);
    clueSection.append(clueLabel, clueList, clueTools);
    content.append(main, clueSection);
    row.append(deleteBtn, imagePanel, content);
    els.entryList.append(row);
  });
}

function renderClueItems(container, category, entryIndex, wordInput, imageInput, clues) {
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
    editBtn.addEventListener("click", () => editClueInline(item, category, entryIndex, clueIndex, wordInput.value, imageInput.value));

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "icon-tool danger";
    deleteBtn.title = "删除线索";
    deleteBtn.setAttribute("aria-label", "删除线索");
    deleteBtn.textContent = "×";
    deleteBtn.addEventListener("click", () => deleteClue(category, entryIndex, clueIndex, wordInput.value, imageInput.value));

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
      await moveClue(category, entryIndex, fromIndex, clueIndex, wordInput.value, imageInput.value);
    });

    item.append(handle, number, text, editBtn, deleteBtn);
    container.append(item);
  });
}

async function loadWordbank() {
  state.wordbank = await api("/api/wordbank");
  try {
    const response = await fetch("/images/category-covers/index.json");
    state.categoryCovers = response.ok ? await response.json() : {};
  } catch {
    state.categoryCovers = {};
  }
  renderCategoryPicker();
}

async function refreshWordbank(bank) {
  state.wordbank = bank || await api("/api/wordbank");
  renderCategoryPicker();
  renderLibrary();
}

async function startNewGame(categories) {
  if (!categories.length) {
    showToast("请先选择词库。", true);
    setGameStage("category");
    return;
  }
  setMessage("正在准备隐藏词...");
  state.game = await api("/api/game", {
    method: "POST",
    body: JSON.stringify({ categories })
  });
  localStorage.setItem("guess-word-game-id", state.game.id);
  setMessage("");
  refreshMainInputPlaceholder();
  setGameStage("play");
  renderGame();
}

async function newGame() {
  await startNewGame([...state.selectedCategories]);
}

async function rerollCurrentCategory() {
  const category = state.game?.category;
  if (!category) {
    showToast("请先选择词库并开始猜词。", true);
    setGameStage("category");
    return;
  }
  state.selectedCategories = new Set([category]);
  await startNewGame([category]);
}

async function submitTurn(event) {
  event.preventDefault();
  const text = els.mainInput.value.trim();
  if (!text) return;
  if (!state.game) {
    showToast("请先选择词库并开始猜词。", true);
    setGameStage("category");
    return;
  }

  setLoading(true);
  setMessage("AI 正在判断这个问题...");

  try {
    state.game = await api("/api/ask", {
      method: "POST",
      body: JSON.stringify({ gameId: state.game.id, question: text })
    });
    els.mainInput.value = "";
    const last = state.game.history.at(-1);
    if (last?.type === "question") setMessage(`AI：${last.answer}`);
    localStorage.setItem("guess-word-game-id", state.game.id);
    renderGame();
  } catch (error) {
    setMessage(error.message, true);
  } finally {
    setLoading(false);
  }
}

async function showClue() {
  if (!state.game) {
    showToast("请先选择词库并开始猜词。", true);
    setGameStage("category");
    return;
  }
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
    setMessage(latest?.type === "hint" ? "" : "没有更多线索了。");
    renderGame();
  } catch (error) {
    setMessage(error.message, true);
  } finally {
    setLoading(false);
  }
}

async function revealAnswer() {
  if (!state.game) {
    showToast("请先选择词库并开始猜词。", true);
    setGameStage("category");
    return;
  }
  setLoading(true);
  setMessage("正在公布答案...");

  try {
    state.game = await api("/api/reveal", {
      method: "POST",
      body: JSON.stringify({ gameId: state.game.id })
    });
    localStorage.setItem("guess-word-game-id", state.game.id);
    setMessage("");
    renderGame();
  } catch (error) {
    setMessage(error.message, true);
  } finally {
    setLoading(false);
  }
}

function delay(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function openFinalGuessModal() {
  if (!state.game) {
    showToast("请先选择词库并开始猜词。", true);
    setGameStage("category");
    return;
  }
  if (isGameOver()) return;
  els.finalGuessForm.classList.remove("judging", "result-correct", "result-wrong");
  els.finalGuessResult.className = "guess-result hidden";
  els.finalGuessResult.replaceChildren();
  els.finalGuessInput.value = "";
  els.finalGuessInput.disabled = false;
  els.finalGuessSubmitBtn.disabled = false;
  els.finalGuessCancelBtn.disabled = false;
  els.finalGuessCloseBtn.disabled = false;
  els.finalGuessSubmitBtn.textContent = "提交最终答案";
  els.finalGuessModal.classList.remove("hidden");
  els.finalGuessInput.focus();
}

function closeFinalGuessModal() {
  els.finalGuessModal.classList.add("hidden");
}

function renderFinalGuessResult(correct) {
  els.finalGuessForm.classList.remove("judging");
  els.finalGuessForm.classList.add(correct ? "result-correct" : "result-wrong");
  els.finalGuessResult.className = `guess-result ${correct ? "correct" : "wrong"}`;
  els.finalGuessResult.replaceChildren();
  const label = document.createElement("span");
  label.textContent = "您的猜测";
  const verdict = document.createElement("strong");
  verdict.textContent = correct ? "完全正确" : "错误";
  els.finalGuessResult.append(label, verdict);
  els.finalGuessSubmitBtn.textContent = "已判定";
  els.finalGuessCancelBtn.disabled = false;
  els.finalGuessCloseBtn.disabled = false;
}

async function submitFinalGuess(event) {
  event.preventDefault();
  const guess = els.finalGuessInput.value.trim();
  if (!guess) {
    showToast("请输入你的最终答案。", true);
    return;
  }
  if (!state.game || isGameOver()) return;

  els.finalGuessForm.classList.add("judging");
  els.finalGuessResult.className = "guess-result judging";
  els.finalGuessResult.textContent = "正在判定";
  els.finalGuessInput.disabled = true;
  els.finalGuessSubmitBtn.disabled = true;
  els.finalGuessCancelBtn.disabled = true;
  els.finalGuessCloseBtn.disabled = true;
  els.finalGuessSubmitBtn.textContent = "判定中";

  try {
    const [game] = await Promise.all([
      api("/api/guess", {
        method: "POST",
        body: JSON.stringify({ gameId: state.game.id, guess })
      }),
      delay(1100)
    ]);
    state.game = game;
    localStorage.setItem("guess-word-game-id", state.game.id);
    const latest = state.game.history.at(-1);
    renderGame();
    renderFinalGuessResult(Boolean(latest?.correct));
  } catch (error) {
    els.finalGuessForm.classList.remove("judging");
    els.finalGuessResult.className = "guess-result wrong";
    els.finalGuessResult.textContent = error.message;
    els.finalGuessInput.disabled = false;
    els.finalGuessSubmitBtn.disabled = false;
    els.finalGuessCancelBtn.disabled = false;
    els.finalGuessCloseBtn.disabled = false;
    els.finalGuessSubmitBtn.textContent = "提交最终答案";
  }
}

function openCategoryModal() {
  els.categoryModalForm.reset();
  updateFileName(els.modalCategoryCoverInput, els.modalCategoryCoverName);
  els.categoryModal.classList.remove("hidden");
  els.modalCategoryNameInput.focus();
}

function closeCategoryModal() {
  els.categoryModal.classList.add("hidden");
}

async function uploadCategoryCover(category, file) {
  const formData = new FormData();
  formData.append("category", category);
  formData.append("cover", file);
  const response = await fetch("/api/wordbank/category-cover", {
    method: "POST",
    body: formData
  });
  const covers = await response.json();
  if (!response.ok) throw new Error(covers.error || "上传封面失败");
  state.categoryCovers = covers;
  return covers;
}

async function createCategory(event) {
  event.preventDefault();
  const category = els.modalCategoryNameInput.value.trim();
  const coverFile = els.modalCategoryCoverInput.files?.[0];
  if (!category) {
    showToast("请填写词库名称。", true);
    return;
  }

  const button = els.categoryModalSubmitBtn;
  button.disabled = true;
  try {
    const bank = await api("/api/wordbank/category", {
      method: "POST",
      body: JSON.stringify({ category })
    });
    state.selectedCategories.add(category);
    state.activeCategory = category;
    state.entryPages[category] = 1;
    state.wordbank = bank;
    if (coverFile) await uploadCategoryCover(category, coverFile);
    await refreshWordbank(bank);
    closeCategoryModal();
    showToast(`已新建词库：${category}`);
  } catch (error) {
    showToast(error.message, true);
  } finally {
    button.disabled = false;
  }
}

function openCategoryEditModal(category) {
  state.editingCategory = category;
  els.categoryEditForm.reset();
  updateFileName(els.editCategoryCoverInput, els.editCategoryCoverName);
  els.editCategoryNameInput.value = category;
  els.categoryEditModal.classList.remove("hidden");
  els.editCategoryNameInput.focus();
  els.editCategoryNameInput.select();
}

function closeCategoryEditModal() {
  els.categoryEditModal.classList.add("hidden");
  state.editingCategory = null;
}

async function saveCategoryEdit(event) {
  event.preventDefault();
  const oldCategory = state.editingCategory;
  const newCategory = els.editCategoryNameInput.value.trim();
  const coverFile = els.editCategoryCoverInput.files?.[0];
  if (!oldCategory || !newCategory) return;

  const button = els.categoryEditSubmitBtn;
  button.disabled = true;
  try {
    let bank = state.wordbank;
    if (newCategory !== oldCategory) {
      bank = await api("/api/wordbank/category", {
        method: "PUT",
        body: JSON.stringify({ oldCategory, newCategory })
      });
      state.selectedCategories.delete(oldCategory);
      state.selectedCategories.add(newCategory);
      if (state.categoryCovers[oldCategory]) {
        state.categoryCovers[newCategory] = state.categoryCovers[oldCategory];
        delete state.categoryCovers[oldCategory];
      }
      if (state.activeCategory === oldCategory) state.activeCategory = newCategory;
      state.entryPages[newCategory] = state.entryPages[oldCategory] || 1;
      delete state.entryPages[oldCategory];
    }
    if (coverFile) await uploadCategoryCover(newCategory, coverFile);
    await refreshWordbank(bank);
    closeCategoryEditModal();
    showToast("词库已更新。");
  } catch (error) {
    showToast(error.message, true);
  } finally {
    button.disabled = false;
  }
}

async function deleteCategory() {
  const category = state.editingCategory;
  if (!category) return;
  const confirmed = await askConfirm({
    title: "删除词库",
    text: `确认要删除“${category}”吗？此操作无法撤销。`,
    okText: "确认删除"
  });
  if (!confirmed) return;

  try {
    const bank = await api("/api/wordbank/category", {
      method: "DELETE",
      body: JSON.stringify({ category })
    });
    state.selectedCategories.delete(category);
    if (state.activeCategory === category) state.activeCategory = null;
    delete state.entryPages[category];
    delete state.categoryCovers[category];
    await refreshWordbank(bank);
    closeCategoryEditModal();
    showToast("词库已删除。");
  } catch (error) {
    showToast(error.message, true);
  }
}

function openEntryModal() {
  if (!state.activeCategory) return;
  clearLibraryMessage();
  els.entryModalForm.reset();
  state.modalEntryClues = ["", "", ""];
  renderModalEntryClues();
  updateFileName(els.modalEntryImageInput, els.modalEntryImageName);
  els.entryModal.classList.remove("hidden");
  els.modalEntryWordInput.focus();
}

function closeEntryModal() {
  els.entryModal.classList.add("hidden");
}

async function addEntry(event) {
  event.preventDefault();
  if (!state.activeCategory) return;

  const word = els.modalEntryWordInput.value.trim();
  const imageFile = els.modalEntryImageInput.files?.[0];
  const manualClues = currentModalEntryClues();
  if (!word) {
    showToast("请填写词条名称。", true);
    return;
  }
  if (!imageFile) {
    showToast("请为词条选择一张图片。", true);
    return;
  }
  if (!manualClues.length) {
    showToast("请至少填写一个线索。", true);
    return;
  }

  const button = els.entryModalSubmitBtn;
  button.disabled = true;
  button.textContent = "添加中";
  try {
    const bank = await api("/api/wordbank/entry", {
      method: "POST",
      body: JSON.stringify({ category: state.activeCategory, word, clues: manualClues, image: "" })
    });
    const entryCount = bank[state.activeCategory]?.length || 0;
    const newIndex = Math.max(0, entryCount - 1);
    const bankWithImage = await uploadEntryImageFile(state.activeCategory, newIndex, imageFile);
    state.entryPages[state.activeCategory] = Math.max(1, Math.ceil((bankWithImage[state.activeCategory]?.length || entryCount) / state.entryPageSize));
    await refreshWordbank(bankWithImage);
    closeEntryModal();
    showToast(`已添加：${word}`);
  } catch (error) {
    showToast(error.message, true);
  } finally {
    button.disabled = false;
    button.textContent = "添加词条";
  }
}

async function fillEmptyEntryModalClues() {
  const word = els.modalEntryWordInput.value.trim();
  if (!word) {
    showToast("请先填写词条名称。", true);
    return;
  }

  const emptyIndexes = state.modalEntryClues
    .map((clue, index) => ({ clue: String(clue || "").trim(), index }))
    .filter((item) => !item.clue)
    .map((item) => item.index);

  if (!emptyIndexes.length) {
    showToast("请至少留出一个空着的词条，不用麻烦 AI", true);
    return;
  }

  const button = els.modalEntryAiFillBtn;
  button.disabled = true;
  button.textContent = "AI 填写中";
  try {
    const data = await api("/api/hint/fill", {
      method: "POST",
      body: JSON.stringify({
        category: state.activeCategory,
        word,
        existingClues: currentModalEntryClues(),
        emptyCount: emptyIndexes.length
      })
    });
    const clues = normalizeClues(data.clues).slice(0, emptyIndexes.length);
    if (!clues.length) {
      showToast("AI 暂时没有生成可用线索。", true);
      return;
    }
    clues.forEach((clue, index) => {
      state.modalEntryClues[emptyIndexes[index]] = clue;
    });
    renderModalEntryClues();
    showToast(`AI 已填写 ${clues.length} 条空线索。`);
  } catch (error) {
    showToast(error.message, true);
  } finally {
    button.disabled = false;
    button.textContent = "让 AI 填写空线索";
  }
}

async function uploadEntryImageFile(category, index, file) {
  const formData = new FormData();
  formData.append("category", category);
  formData.append("index", String(index));
  formData.append("image", file);

  const response = await fetch("/api/wordbank/image", {
    method: "POST",
    body: formData
  });
  const bank = await response.json();
  if (!response.ok) throw new Error(bank.error || "上传失败");
  return bank;
}

async function uploadEntryImage(category, index, file, button) {
  button.disabled = true;
  button.textContent = "上传中";
  try {
    const bank = await uploadEntryImageFile(category, index, file);
    await refreshWordbank(bank);
    showToast("图片已更新。");
  } catch (error) {
    showToast(error.message, true);
  } finally {
    button.disabled = false;
    button.textContent = "上传图片";
  }
}

async function saveEntry(category, index, word, clues, image = "", notify = true) {
  try {
    const bank = await api("/api/wordbank/entry", {
      method: "PUT",
      body: JSON.stringify({ category, index, word, clues: normalizeClues(clues).slice(0, MAX_CLUES), image })
    });
    await refreshWordbank(bank);
    if (notify) showToast("已保存。");
  } catch (error) {
    showToast(error.message, true);
  }
}

async function deleteEntry(category, index, word = "") {
  const label = word ? `“${word}”` : "这个词条";
  const confirmed = await askConfirm({
    title: "删除词条",
    text: `确认要删除${label}吗？此操作无法撤销。`,
    okText: "确认删除"
  });
  if (!confirmed) return;
  try {
    const bank = await api("/api/wordbank/entry", {
      method: "DELETE",
      body: JSON.stringify({ category, index })
    });
    await refreshWordbank(bank);
    showToast("已删除词条。");
  } catch (error) {
    showToast(error.message, true);
  }
}

async function updateEntry(category, index, word, clues, message = "已保存。", image = "") {
  const bank = await api("/api/wordbank/entry", {
    method: "PUT",
    body: JSON.stringify({ category, index, word, clues: normalizeClues(clues).slice(0, MAX_CLUES), image })
  });
  await refreshWordbank(bank);
  if (message) showToast(message);
  else clearLibraryMessage();
}

function addClueInline(container, category, entryIndex, word, image = "") {
  const entry = state.wordbank[category]?.[entryIndex];
  if (!entry) return;
  const currentClues = normalizeClues(entry.clues);
  if (currentClues.length >= MAX_CLUES) {
    showToast("该词条已经有五条线索了，无法再添加新的线索。", true);
    return;
  }

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
    if (!clue) {
      showToast("请输入有效的内容", true);
      input.focus();
      return;
    }
    try {
      await updateEntry(category, entryIndex, word, [...currentClues, clue].slice(0, MAX_CLUES), "", image);
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

async function deleteClue(category, entryIndex, clueIndex, word, image = "") {
  const entry = state.wordbank[category]?.[entryIndex];
  if (!entry) return;
  const clues = normalizeClues(entry.clues).filter((_, index) => index !== clueIndex);
  try {
    await updateEntry(category, entryIndex, word, clues, "", image);
  } catch (error) {
    setLibraryMessage(error.message, true);
  }
}

async function moveClue(category, entryIndex, fromIndex, toIndex, word, image = "") {
  const entry = state.wordbank[category]?.[entryIndex];
  if (!entry) return;
  const clues = normalizeClues(entry.clues);
  const [moved] = clues.splice(fromIndex, 1);
  clues.splice(toIndex, 0, moved);
  try {
    await updateEntry(category, entryIndex, word, clues, "", image);
  } catch (error) {
    setLibraryMessage(error.message, true);
  }
}

function editClueInline(item, category, entryIndex, clueIndex, word, image = "") {
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
    if (!next) {
      showToast("请输入有效的内容", true);
      input.focus();
      return;
    }
    const clues = normalizeClues(entry.clues);
    clues[clueIndex] = next;
    try {
      await updateEntry(category, entryIndex, word, clues, "", image);
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
  const entry = state.wordbank[category]?.[index];
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
    await updateEntry(category, index, cleanedWord, data.clues || [], "", entry?.image || "");
    showToast("AI 已生成并保存 3 条分层线索");
  } catch (error) {
    showToast(error.message, true);
  } finally {
    button.disabled = false;
    button.textContent = "让 AI 重新生成此词条的相关线索";
  }
}

els.gameNavBtn.addEventListener("click", () => setView("game"));
els.libraryNavBtn.addEventListener("click", () => setView("library"));
els.historyNavBtn.addEventListener("click", () => setView("history"));
els.chooseBankModeBtn.addEventListener("click", () => setGameStage("category"));
els.dailyModeBtn.addEventListener("click", () => showToast("每日一题稍后开放。"));
els.backToModeBtn.addEventListener("click", () => setGameStage("mode"));
els.randomCategoryBtn.addEventListener("click", selectRandomCategory);
els.startSelectedGameBtn.addEventListener("click", async () => {
  try {
    await newGame();
  } catch (error) {
    showToast(error.message, true);
  }
});
els.playForm.addEventListener("submit", submitTurn);
els.finalGuessBtn.addEventListener("click", openFinalGuessModal);
els.finalGuessForm.addEventListener("submit", submitFinalGuess);
els.finalGuessCloseBtn.addEventListener("click", closeFinalGuessModal);
els.finalGuessCancelBtn.addEventListener("click", closeFinalGuessModal);
els.finalGuessModal.addEventListener("click", (event) => {
  if (event.target === els.finalGuessModal && !els.finalGuessForm.classList.contains("judging")) closeFinalGuessModal();
});
els.clueBtn.addEventListener("click", showClue);
els.revealBtn.addEventListener("click", revealAnswer);
els.shareBtn.addEventListener("click", shareCurrentGame);
els.rerollCurrentBtn.addEventListener("click", async () => {
  try {
    await rerollCurrentCategory();
  } catch (error) {
    showToast(error.message, true);
  }
});
els.openGameHistoryBtn.addEventListener("click", showMyHistory);
els.backToMyBtn.addEventListener("click", showMyHome);
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
    if (state.game?.category) await rerollCurrentCategory();
    else {
      state.game = null;
      localStorage.removeItem("guess-word-game-id");
      setMessage("");
      setGameStage("category");
    }
  } catch (error) {
    showToast(error.message, true);
  }
});
els.openCategoryModalBtn.addEventListener("click", openCategoryModal);
els.modalCategoryCoverInput.addEventListener("change", () => updateFileName(els.modalCategoryCoverInput, els.modalCategoryCoverName));
els.categoryModalForm.addEventListener("submit", createCategory);
els.categoryModalCloseBtn.addEventListener("click", closeCategoryModal);
els.categoryModalCancelBtn.addEventListener("click", closeCategoryModal);
els.categoryModal.addEventListener("click", (event) => {
  if (event.target === els.categoryModal) closeCategoryModal();
});
els.editCategoryCoverInput.addEventListener("change", () => updateFileName(els.editCategoryCoverInput, els.editCategoryCoverName));
els.categoryEditForm.addEventListener("submit", saveCategoryEdit);
els.categoryEditCloseBtn.addEventListener("click", closeCategoryEditModal);
els.categoryEditCancelBtn.addEventListener("click", closeCategoryEditModal);
els.categoryEditModal.addEventListener("click", (event) => {
  if (event.target === els.categoryEditModal) closeCategoryEditModal();
});
els.deleteCategoryBtn.addEventListener("click", deleteCategory);
els.confirmCancelBtn.addEventListener("click", () => closeConfirm(false));
els.confirmOkBtn.addEventListener("click", () => closeConfirm(true));
els.confirmModal.addEventListener("click", (event) => {
  if (event.target === els.confirmModal) closeConfirm(false);
});
els.addEntryBtn.addEventListener("click", openEntryModal);
els.modalEntryImageInput.addEventListener("change", () => updateFileName(els.modalEntryImageInput, els.modalEntryImageName));
els.modalEntryAddClueBtn.addEventListener("click", addModalEntryClue);
els.modalEntryAiFillBtn.addEventListener("click", fillEmptyEntryModalClues);
els.entryModalForm.addEventListener("submit", addEntry);
els.entryModalCloseBtn.addEventListener("click", closeEntryModal);
els.entryModalCancelBtn.addEventListener("click", closeEntryModal);
els.entryModal.addEventListener("click", (event) => {
  if (event.target === els.entryModal) closeEntryModal();
});
document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  if (!els.confirmModal.classList.contains("hidden")) closeConfirm(false);
  else if (!els.finalGuessModal.classList.contains("hidden") && !els.finalGuessForm.classList.contains("judging")) closeFinalGuessModal();
  else if (!els.entryModal.classList.contains("hidden")) closeEntryModal();
  else if (!els.categoryModal.classList.contains("hidden")) closeCategoryModal();
  else if (!els.categoryEditModal.classList.contains("hidden")) closeCategoryEditModal();
});
els.closeEditorBtn.addEventListener("click", () => {
  state.activeCategory = null;
  els.libraryMain.classList.remove("hidden");
  els.libraryEditor.classList.add("hidden");
});
els.largeLibraryModeBtn.addEventListener("click", () => setLibraryCardMode("large"));
els.compactLibraryModeBtn.addEventListener("click", () => setLibraryCardMode("compact"));
MOBILE_QUERY.addEventListener("change", applyLibraryCardMode);

refreshMainInputPlaceholder();
await loadWordbank();
renderLibrary();
setGameStage("mode");

try {
  const shareId = new URLSearchParams(window.location.search).get("share");
  if (shareId) {
    await openShare(shareId);
  } else {
    localStorage.removeItem("guess-word-game-id");
    state.game = null;
    setGameStage("mode");
  }
} catch {
  localStorage.removeItem("guess-word-game-id");
  state.game = null;
  setGameStage("mode");
}
