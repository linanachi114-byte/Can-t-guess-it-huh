const state = {
  game: null,
  wordbank: {},
  mode: "ask",
  selectedCategories: new Set()
};

const els = {
  categoryLabel: document.querySelector("#categoryLabel"),
  questionCount: document.querySelector("#questionCount"),
  guessCount: document.querySelector("#guessCount"),
  historyList: document.querySelector("#historyList"),
  emptyHistory: document.querySelector("#emptyHistory"),
  message: document.querySelector("#message"),
  winBanner: document.querySelector("#winBanner"),
  bannerTitle: document.querySelector("#bannerTitle"),
  revealedWord: document.querySelector("#revealedWord"),
  roundSummary: document.querySelector("#roundSummary"),
  askModeBtn: document.querySelector("#askModeBtn"),
  guessModeBtn: document.querySelector("#guessModeBtn"),
  playForm: document.querySelector("#playForm"),
  mainInput: document.querySelector("#mainInput"),
  submitBtn: document.querySelector("#submitBtn"),
  revealBtn: document.querySelector("#revealBtn"),
  newGameBtn: document.querySelector("#newGameBtn"),
  categoryList: document.querySelector("#categoryList"),
  categoryOptions: document.querySelector("#categoryOptions"),
  wordForm: document.querySelector("#wordForm"),
  categoryInput: document.querySelector("#categoryInput"),
  wordInput: document.querySelector("#wordInput"),
  wordMessage: document.querySelector("#wordMessage")
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

function setWordMessage(text, isError = false) {
  els.wordMessage.textContent = text;
  els.wordMessage.classList.toggle("error", isError);
}

function setLoading(isLoading) {
  const isOver = Boolean(state.game?.isWon || state.game?.isRevealed);
  els.submitBtn.disabled = isLoading || isOver;
  els.revealBtn.disabled = isLoading || isOver;
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

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
}

function renderGame() {
  const game = state.game;
  const history = game?.history || [];
  const questionTotal = history.filter((item) => item.type === "question").length;
  const guessTotal = history.filter((item) => item.type === "guess").length;
  const isOver = Boolean(game?.isWon || game?.isRevealed);
  els.categoryLabel.textContent = game ? game.category : "未开始";
  els.questionCount.textContent = questionTotal;
  els.guessCount.textContent = guessTotal;
  els.roundSummary.textContent = `本局已问 ${questionTotal} 轮问题，已猜测 ${guessTotal} 次。`;
  els.historyList.innerHTML = "";
  els.emptyHistory.classList.toggle("hidden", history.length > 0);

  els.winBanner.classList.toggle("hidden", !isOver);
  els.bannerTitle.textContent = game?.isWon ? "答案正确" : "已公布答案";
  els.revealedWord.textContent = game?.revealedWord || "";
  els.mainInput.disabled = isOver;
  els.submitBtn.disabled = isOver;
  els.revealBtn.disabled = isOver;

  [...history].reverse().forEach((item, index) => {
    const originalIndex = history.length - index;
    const li = document.createElement("li");
    li.className = "history-item";
    const meta = document.createElement("div");
    meta.className = "history-meta";
    const typeLabel = item.type === "question" ? "提问" : item.type === "guess" ? "猜答案" : "公布答案";
    meta.innerHTML = `<span>#${originalIndex} ${typeLabel}</span><span>${formatTime(item.at)}</span>`;
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
    } else {
      answer.textContent = `正解：${item.answer}`;
      answer.classList.add("reveal");
    }
    li.append(meta, text, answer);
    els.historyList.append(li);
  });
}

function renderWordbank() {
  els.categoryList.innerHTML = "";
  els.categoryOptions.innerHTML = "";
  if (state.selectedCategories.size === 0) {
    Object.keys(state.wordbank).forEach((category) => state.selectedCategories.add(category));
  }
  Object.entries(state.wordbank).forEach(([category, words]) => {
    const option = document.createElement("option");
    option.value = category;
    els.categoryOptions.append(option);

    const label = document.createElement("label");
    label.className = "category-row";
    label.innerHTML = `
      <input type="checkbox" ${state.selectedCategories.has(category) ? "checked" : ""} value="${escapeHtml(category)}">
      <span>${escapeHtml(category)}</span>
      <small>${words.length} 个</small>
    `;
    const checkbox = label.querySelector("input");
    checkbox.addEventListener("change", () => {
      if (checkbox.checked) state.selectedCategories.add(category);
      else state.selectedCategories.delete(category);
    });
    els.categoryList.append(label);
  });
}

function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);
}

async function loadWordbank() {
  state.wordbank = await api("/api/wordbank");
  renderWordbank();
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

async function addWord(event) {
  event.preventDefault();
  const category = els.categoryInput.value.trim();
  const word = els.wordInput.value.trim();
  if (!category || !word) {
    setWordMessage("词库名和词条都要填。", true);
    return;
  }

  const button = els.wordForm.querySelector("button");
  button.disabled = true;
  try {
    state.wordbank = await api("/api/wordbank", {
      method: "POST",
      body: JSON.stringify({ category, word })
    });
    state.selectedCategories.add(category);
    els.wordInput.value = "";
    setWordMessage(`已添加：${word}`);
    renderWordbank();
  } catch (error) {
    setWordMessage(error.message, true);
  } finally {
    button.disabled = false;
  }
}

els.askModeBtn.addEventListener("click", () => setMode("ask"));
els.guessModeBtn.addEventListener("click", () => setMode("guess"));
els.playForm.addEventListener("submit", submitTurn);
els.revealBtn.addEventListener("click", revealAnswer);
els.newGameBtn.addEventListener("click", async () => {
  try {
    await newGame();
  } catch (error) {
    setMessage(error.message, true);
  }
});
els.wordForm.addEventListener("submit", addWord);

await loadWordbank();
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
