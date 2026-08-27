const MAX_CLUES = 5;
const AUTO_QUESTION_LIMIT = 20;
const MOBILE_QUERY = window.matchMedia("(max-width: 920px)");
const COMMON_ASK_QUESTIONS = [
  "它通常能被人直接看见吗？",
  "它在现代社会仍然常见吗？",
  "它通常有明确的功能用途吗？",
  "它和日常生活关系很近吗？",
  "它通常比成年人小吗？",
  "它通常比成年人大吗？",
  "它主要出现在室内吗？",
  "它经常在户外出现吗？",
  "它可以被移动或携带吗？",
  "它有明显的颜色或外观特征吗？",
  "它通常不是活物吗？",
  "它可以作为礼物吗？"
];
const CATEGORY_ASK_QUESTIONS = {
  "日常物品": [
    "它通常能被人拿在手里吗？",
    "它主要在家庭环境中使用吗？",
    "它需要用电或电池吗？",
    "它通常用于收纳或携带东西吗？",
    "它和清洁整理有关吗？",
    "它和吃饭喝水有关吗？",
    "它通常放在桌面或柜子上吗？",
    "它经常被带出门使用吗？",
    "它主要由金属或塑料制成吗？",
    "它有开关、按钮或可活动部件吗？",
    "它通常每天都会被用到吗？",
    "它的主要用途是保护某样东西吗？",
    "它通常需要单手操作吗？",
    "它通常会和衣物或穿戴有关吗？",
    "它能装进普通背包里吗？",
    "它通常放在厨房或餐桌附近吗？",
    "它通常放在卧室或客厅里吗？",
    "它和照明、温度或环境舒适度有关吗？",
    "它会接触水或液体吗？",
    "它通常容易损坏或需要保养吗？",
    "它的形状通常比较扁平吗？",
    "它通常有盖子、把手或拉链吗？",
    "它主要用于记录、阅读或信息展示吗？",
    "它主要用于安全、防护或锁定吗？",
    "它经常成对或成套出现吗？",
    "它通常价格不算昂贵吗？",
    "它能直接帮助人完成某个动作吗？",
    "它通常需要插电才能工作吗？",
    "它主要由纸、布或皮革制成吗？",
    "它通常有透明或反光部分吗？",
    "它更偏工具而不是装饰品吗？",
    "儿童也经常会使用它吗？"
  ],
  "自然与生物": [
    "它是活物或曾经是活物吗？",
    "它属于动物吗？",
    "它属于植物吗？",
    "它主要生活或出现在水中吗？",
    "它主要出现在陆地上吗？",
    "它通常比成年人更大吗？",
    "它能自己移动吗？",
    "它和天气或天体现象有关吗？",
    "它在自然界中很常见吗？",
    "它通常需要阳光或水分吗？",
    "它对人类有食用或药用价值吗？",
    "它有明显的季节性吗？",
    "它有根、茎、叶或类似结构吗？",
    "它有翅膀、鳍或足吗？",
    "它通常生活在群体中吗？",
    "它主要出现在寒冷环境中吗？",
    "它主要出现在炎热或热带环境中吗？",
    "它和森林、草原或山地有关吗？",
    "它和海洋、河流或湖泊有关吗？",
    "它能被肉眼清楚看见吗？",
    "它的颜色通常比较鲜明吗？",
    "它会开花、结果或繁殖后代吗？",
    "它对生态环境有重要作用吗？",
    "它可能对人类有危险吗？",
    "它通常会发出声音吗？",
    "它在夜间更容易被观察到吗？",
    "它的形态会随生命周期变化吗？",
    "它和岩石、土壤或地貌有关吗？",
    "它可以被人工饲养或种植吗？",
    "它常出现在神话、象征或文化意象中吗？",
    "它的体型通常很小吗？",
    "它通常依赖其他生物生存吗？"
  ],
  "食物饮品": [
    "它通常是热食或热饮吗？",
    "它通常是甜的味道吗？",
    "它通常是咸的味道吗？",
    "它主要由谷物或面粉制成吗？",
    "它主要包含肉类或海鲜吗？",
    "它通常需要烹饪后食用吗？",
    "它经常作为早餐出现吗？",
    "它常见于聚餐或节日场景吗？",
    "它通常可以直接用手拿着吃吗？",
    "它属于饮品吗？",
    "它常见于中国饮食文化吗？",
    "它通常有明显的香味或调味吗？",
    "它通常是冷食或冷饮吗？",
    "它主要由蔬菜或水果制成吗？",
    "它包含乳制品或蛋类吗？",
    "它通常需要餐具食用吗？",
    "它常见于街边小吃或快餐吗？",
    "它通常作为主食吗？",
    "它通常作为零食或甜点吗？",
    "它的口感偏脆吗？",
    "它的口感偏软或黏吗？",
    "它通常带有辣味吗？",
    "它通常需要发酵、腌制或长时间加工吗？",
    "它常见于西式饮食吗？",
    "它通常有汤汁或液体部分吗？",
    "它能长期保存吗？",
    "它通常适合多人分享吗？",
    "它的外形通常是圆形或片状吗？",
    "它和某个节日或传统习俗有关吗？",
    "它通常含有咖啡因或酒精吗？",
    "它更偏健康食品而不是高热量食品吗？",
    "它通常需要冷藏保存吗？"
  ],
  "地点": [
    "它通常是室内场所吗？",
    "它通常是公共场所吗？",
    "它和交通出行有关吗？",
    "它和学习、阅读或展览有关吗？",
    "它和消费、购物或娱乐有关吗？",
    "它需要买票或预约才能进入吗？",
    "它通常会有大量人流吗？",
    "它具有历史或文化意义吗？",
    "它通常位于城市中吗？",
    "它和自然风景关系更大吗？",
    "人们去那里通常会停留较长时间吗？",
    "它有明确的管理人员或服务人员吗？",
    "它通常有固定开放时间吗？",
    "它主要用于居住或住宿吗？",
    "它主要用于工作或办公吗？",
    "它和医疗、教育或公共服务有关吗？",
    "它和宗教、纪念或仪式有关吗？",
    "它通常需要安检或身份验证吗？",
    "它通常有座位、柜台或售票处吗？",
    "它适合儿童或家庭活动吗？",
    "它通常位于室外或露天环境吗？",
    "它和水域、山地或自然景观有关吗？",
    "它通常会出现在旅游攻略中吗？",
    "它的建筑规模通常比较大吗？",
    "它通常有明显的标志或入口吗？",
    "它和体育运动或健身有关吗？",
    "它和餐饮或休闲社交有关吗？",
    "它通常需要排队吗？",
    "它主要服务本地居民吗？",
    "它可能跨越很大的地理范围吗？",
    "它在夜间也常有人活动吗？",
    "它通常有较强的安全或秩序管理吗？"
  ],
  "职业身份": [
    "这个职业通常需要专业资格或证书吗？",
    "这个职业主要在室内工作吗？",
    "这个职业经常需要与人沟通吗？",
    "这个职业和医疗健康有关吗？",
    "这个职业和教育或研究有关吗？",
    "这个职业和科技或工程有关吗？",
    "这个职业和艺术创作有关吗？",
    "这个职业有较明显的制服或装备吗？",
    "这个职业经常需要体力劳动吗？",
    "这个职业承担公共安全或公共服务职责吗？",
    "这个职业的工作成果通常很容易被公众看到吗？",
    "这个职业通常需要长期训练吗？",
    "这个职业主要服务个人客户吗？",
    "这个职业主要在团队中完成工作吗？",
    "这个职业需要经常出差或移动吗？",
    "这个职业需要使用电脑或专业软件吗？",
    "这个职业需要操作机器、器械或工具吗？",
    "这个职业和食物制作或餐饮服务有关吗？",
    "这个职业和法律、金融或管理有关吗？",
    "这个职业和媒体传播或写作有关吗？",
    "这个职业和交通运输有关吗？",
    "这个职业通常有较高风险吗？",
    "这个职业经常面对公众或观众吗？",
    "这个职业的工作时间通常不固定吗？",
    "这个职业需要较强的创造力吗？",
    "这个职业需要较强的体能吗？",
    "这个职业需要照顾、指导或帮助他人吗？",
    "这个职业常见于学校或医院吗？",
    "这个职业更偏脑力劳动吗？",
    "这个职业通常有明确的等级或职称吗？",
    "这个职业的收入通常依赖项目或订单吗？",
    "这个职业在现代城市中很常见吗？"
  ],
  "名人": [
    "这个人主要因科学或发明闻名吗？",
    "这个人主要因文学或艺术闻名吗？",
    "这个人主要因音乐闻名吗？",
    "这个人主要因政治或军事闻名吗？",
    "这个人是中国历史或文化人物吗？",
    "这个人主要活动在近现代吗？",
    "这个人已经去世了吗？",
    "这个人的作品或贡献常在学校教材中出现吗？",
    "这个人获得过重要奖项或荣誉吗？",
    "这个人的影响跨越多个国家吗？",
    "这个人和某个著名理论或作品强相关吗？",
    "这个人更偏思想家而不是表演者吗？",
    "这个人主要活跃在欧洲吗？",
    "这个人主要活跃在亚洲吗？",
    "这个人出生在古代或中世纪吗？",
    "这个人和战争、国家治理或政治变革有关吗？",
    "这个人和诗歌、小说或戏剧有关吗？",
    "这个人和绘画、雕塑或建筑有关吗？",
    "这个人和物理、化学或数学有关吗？",
    "这个人和医学、生命科学或工程技术有关吗？",
    "这个人有广为流传的代表作吗？",
    "这个人的名字常被翻译成中文音译吗？",
    "这个人曾经被迫害、流亡或经历重大挫折吗？",
    "这个人主要以个人创作而不是职位闻名吗？",
    "这个人和宗教或哲学思想有关吗？",
    "这个人曾影响某个学派或运动吗？",
    "这个人的成就和表演或舞台有关吗？",
    "这个人常出现在纪念馆、雕像或货币图案中吗？",
    "这个人是否生活在 20 世纪以后？",
    "这个人和中国语文或历史课本关系很强吗？",
    "这个人通常被认为改变了某个领域的发展方向吗？",
    "这个人的姓氏或名字在大众文化中很有辨识度吗？"
  ],
  "杀戮尖塔": [
    "它是一张卡牌吗？",
    "它是遗物或药水吗？",
    "它属于诅咒或状态牌吗？",
    "它主要用于造成伤害吗？",
    "它主要用于防御或获得格挡吗？",
    "它会影响能量、抽牌或弃牌吗？",
    "它和力量、敏捷或集中有关吗？",
    "它通常有负面效果吗？",
    "它是某个角色的专属内容吗？",
    "它在战斗中会被直接打出吗？",
    "它的费用通常大于 1 点能量吗？",
    "它更偏进攻而不是防守吗？",
    "它属于铁甲战士相关内容吗？",
    "它属于静默猎手相关内容吗？",
    "它属于故障机器人相关内容吗？",
    "它属于观者相关内容吗？",
    "它会施加或利用中毒效果吗？",
    "它会生成或消耗球吗？",
    "它和姿态切换有关吗？",
    "它会造成多段伤害吗？",
    "它会影响手牌数量吗？",
    "它会消耗、保留或复制卡牌吗？",
    "它会给敌人施加易伤、虚弱或易伤类负面状态吗？",
    "它会给自己增加能力或长期效果吗？",
    "它通常适合前期使用吗？",
    "它通常适合构筑核心套路吗？",
    "它的稀有度通常较高吗？",
    "它升级后变化很明显吗？",
    "它通常需要特定配合才强吗？",
    "它更像防御资源而不是输出资源吗？",
    "它会在回合结束或战斗结束时触发效果吗？",
    "它和生命值、治疗或自伤有关吗？"
  ]
};

const state = {
  game: null,
  pendingGameMode: "normal",
  activeGameMode: "normal",
  gameEntrySource: "menu",
  autoQuestionDeck: [],
  autoQuestionIndex: 0,
  wordbank: {},
  wordbankLoaded: false,
  categorySummary: {},
  categoryCovers: {},
  favorites: [],
  gameHistory: [],
  historyMode: "normal",
  dailyStatus: null,
  gameHistoryVisibleCount: 10,
  activeHistoryRecord: null,
  highlightHistoryRecordKey: "",
  shareRecord: null,
  shareStep: 0,
  categorySelectionInitialized: false,
  currentAskPlaceholder: "",
  finalGuessOutcome: null,
  view: "game",
  gameStage: "mode",
  libraryCardMode: MOBILE_QUERY.matches ? "compact" : "large",
  selectedCategories: new Set(),
  activeCategory: null,
  editingCategory: null,
  editingEntry: null,
  highlightEntry: null,
  pendingConfirm: null,
  modalEntryClues: [],
  entryPageSize: 10,
  entryPages: {}
};

const GUEST_HISTORY_KEY = "guess-word-guest-history-v1";

function readGuestHistory() {
  try {
    const value = JSON.parse(localStorage.getItem(GUEST_HISTORY_KEY) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function rememberFinishedGame(game) {
  if (!game?.shareId || (!game.isWon && !game.isRevealed)) return;
  const records = readGuestHistory();
  if (records.some((record) => record.id === game.shareId)) return;
  records.unshift({
    id: game.shareId,
    shareId: game.shareId,
    gameId: game.id,
    mode: game.mode || "normal",
    dailyDate: game.dailyDate || "",
    category: game.category,
    word: game.revealedWord || "",
    image: game.revealedImage || "",
    startedAt: game.startedAt,
    endedAt: new Date().toISOString(),
    outcome: game.isWon ? "won" : "revealed",
    questionCount: game.history.filter((item) => item.type === "question").length,
    guessCount: game.history.filter((item) => item.type === "guess").length,
    history: game.history,
  });
  localStorage.setItem(GUEST_HISTORY_KEY, JSON.stringify(records.slice(0, 80)));
}

async function mergeGuestHistoryIntoAccount() {
  const records = readGuestHistory();
  if (!records.length) return;
  await api("/api/history/import", {
    method: "POST",
    body: JSON.stringify({ ids: records.map((record) => record.id) }),
  });
  localStorage.removeItem(GUEST_HISTORY_KEY);
}

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
  myFavoritesPanel: document.querySelector("#myFavoritesPanel"),
  openFavoritesBtn: document.querySelector("#openFavoritesBtn"),
  openGameHistoryBtn: document.querySelector("#openGameHistoryBtn"),
  backToMyBtn: document.querySelector("#backToMyBtn"),
  backToMyFromFavoritesBtn: document.querySelector("#backToMyFromFavoritesBtn"),
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
  revealedSource: document.querySelector("#revealedSource"),
  revealedImage: document.querySelector("#revealedImage"),
  hintBanner: document.querySelector("#hintBanner"),
  hintText: document.querySelector("#hintText"),
  playActionStack: document.querySelector(".play-action-stack"),
  playForm: document.querySelector("#playForm"),
  mainInput: document.querySelector("#mainInput"),
  submitBtn: document.querySelector("#submitBtn"),
  rerollPromptBtn: document.querySelector("#rerollPromptBtn"),
  clearInputBtn: document.querySelector("#clearInputBtn"),
  autoAskPanel: document.querySelector("#autoAskPanel"),
  autoAskProgress: document.querySelector("#autoAskProgress"),
  autoAskPreview: document.querySelector("#autoAskPreview"),
  autoAskBtn: document.querySelector("#autoAskBtn"),
  finalGuessBtn: document.querySelector("#finalGuessBtn"),
  clueBtn: document.querySelector("#clueBtn"),
  revealBtn: document.querySelector("#revealBtn"),
  finalActionRow: document.querySelector(".final-action-row"),
  shareBtn: document.querySelector("#shareBtn"),
  favoriteCurrentBtn: document.querySelector("#favoriteCurrentBtn"),
  rerollCurrentBtn: document.querySelector("#rerollCurrentBtn"),
  backToCategoryBtn: document.querySelector("#backToCategoryBtn"),
  playToolbox: document.querySelector("#playToolbox"),
  mobileToolToggle: document.querySelector("#mobileToolToggle"),
  mobileFinalGuessBtn: document.querySelector("#mobileFinalGuessBtn"),
  mobileToolClose: document.querySelector("#mobileToolClose"),
  mobileToolScrim: document.querySelector("#mobileToolScrim"),
  chooseBankModeBtn: document.querySelector("#chooseBankModeBtn"),
  quickRandomModeBtn: document.querySelector("#quickRandomModeBtn"),
  autoAskModeBtn: document.querySelector("#autoAskModeBtn"),
  returnToRoomModeBtn: document.querySelector("#returnToRoomModeBtn"),
  dailyModeBtn: document.querySelector("#dailyModeBtn"),
  dailyModeStatus: document.querySelector("#dailyModeStatus"),
  normalHistoryTab: document.querySelector("#normalHistoryTab"),
  dailyHistoryTab: document.querySelector("#dailyHistoryTab"),
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
  gameHistoryList: document.querySelector("#gameHistoryList"),
  emptyGameHistory: document.querySelector("#emptyGameHistory"),
  favoriteList: document.querySelector("#favoriteList"),
  emptyFavorites: document.querySelector("#emptyFavorites"),
  shareMeta: document.querySelector("#shareMeta"),
  shareSteps: document.querySelector("#shareSteps"),
  nextShareStepBtn: document.querySelector("#nextShareStepBtn"),
  exitShareBtn: document.querySelector("#exitShareBtn"),
  toastRegion: document.querySelector("#toastRegion")
};

let historyLoadMoreObserver = null;

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

function favoriteKey(category, word) {
  return `${category}::${word}`;
}

function loadFavorites() {
  try {
    const parsed = JSON.parse(localStorage.getItem("guess-word-favorites") || "[]");
    state.favorites = Array.isArray(parsed) ? parsed.filter((item) => item?.category && item?.word) : [];
  } catch {
    state.favorites = [];
  }
}

function saveFavorites() {
  localStorage.setItem("guess-word-favorites", JSON.stringify(state.favorites));
}

function isFavorite(category, word) {
  const key = favoriteKey(category, word);
  return state.favorites.some((item) => favoriteKey(item.category, item.word) === key);
}

function favoriteRecord(category, word) {
  return state.favorites.find((item) => item.category === category && item.word === word);
}

function entryForFavorite(category, word) {
  return (state.wordbank[category] || []).find((entry) => entry.word === word);
}

function favoriteImage(category, word, fallback = "") {
  const entry = entryForFavorite(category, word);
  return imageWithFallback(entry?.image || fallback);
}

function createFavoriteButton(category, word, { showInactive = true, compact = false } = {}) {
  const active = isFavorite(category, word);
  if (!active && !showInactive) return null;
  const button = document.createElement("button");
  button.type = "button";
  button.className = `favorite-button${active ? " active" : ""}${compact ? " compact" : ""}`;
  button.title = active ? "已收藏" : "收藏词条";
  button.setAttribute("aria-label", active ? `已收藏 ${word}` : `收藏 ${word}`);
  button.textContent = "★";
  button.addEventListener("click", (event) => {
    event.stopPropagation();
    toggleFavorite(category, word);
  });
  return button;
}

function toggleFavorite(category, word) {
  const key = favoriteKey(category, word);
  const index = state.favorites.findIndex((item) => favoriteKey(item.category, item.word) === key);
  if (index >= 0) {
    state.favorites.splice(index, 1);
    showToast(`已取消收藏${word}`);
  } else {
    state.favorites.unshift({ category, word, addedAt: new Date().toISOString() });
    showToast(`您已成功收藏${word}`);
  }
  saveFavorites();
  renderFavoriteDependentViews();
}

function renderFavoriteDependentViews() {
  if (state.view === "library" && state.activeCategory) renderEditor(state.activeCategory);
  if (!els.myFavoritesPanel.classList.contains("hidden")) renderFavorites();
  if (!els.myHistoryPanel.classList.contains("hidden") && state.activeHistoryRecord) {
    renderHistoryRecordDetail(state.activeHistoryRecord);
  } else if (!els.myHistoryPanel.classList.contains("hidden")) {
    renderGameHistory();
  }
  if (state.gameStage === "play") renderGame();
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
  els.backToCategoryBtn.disabled = isLoading;
  els.rerollCurrentBtn.disabled = isLoading;
  els.rerollPromptBtn.disabled = isLoading || isOver;
  els.clearInputBtn.disabled = isLoading || isOver;
  if (els.mobileFinalGuessBtn) els.mobileFinalGuessBtn.disabled = isLoading || isOver;
  els.autoAskBtn.disabled = isLoading || isOver || state.autoQuestionIndex >= state.autoQuestionDeck.length;
  els.autoAskBtn.textContent = isLoading ? "随机提问中" : "再问个随机问题";
  els.submitBtn.textContent = isLoading ? "提问中" : "提问";
}

function askedQuestionSet() {
  return new Set((state.game?.history || [])
    .filter((item) => item.type === "question")
    .map((item) => String(item.text || "").trim())
    .filter(Boolean));
}

function askQuestionPoolForCurrentGame() {
  const category = state.game?.category || [...state.selectedCategories][0] || "";
  return CATEGORY_ASK_QUESTIONS[category] || COMMON_ASK_QUESTIONS;
}

function availableAskPlaceholders() {
  const asked = askedQuestionSet();
  return askQuestionPoolForCurrentGame().filter((question) => !asked.has(question));
}

function randomAskPlaceholder() {
  const pool = availableAskPlaceholders();
  if (!pool.length) return "";
  return pool[Math.floor(Math.random() * pool.length)];
}

function shuffledAskQuestions(limit = AUTO_QUESTION_LIMIT) {
  const pool = availableAskPlaceholders();
  return pool
    .sort(() => Math.random() - 0.5)
    .slice(0, Math.min(limit, pool.length));
}

function isAutoAskMode() {
  return state.activeGameMode === "auto";
}

function refreshMainInputPlaceholder() {
  state.currentAskPlaceholder = randomAskPlaceholder();
  els.mainInput.placeholder = state.currentAskPlaceholder || "随机问题已经问完了，请手动输入新问题。";
}

function clearQuestionInput() {
  els.mainInput.value = "";
  refreshMainInputPlaceholder();
  updateClearInputButton();
  els.mainInput.focus();
}

function setPlayToolboxOpen(open) {
  els.playToolbox?.classList.toggle("open", open);
  els.mobileToolScrim?.classList.toggle("show", open);
}

function updateClearInputButton() {
  els.clearInputBtn.classList.toggle("hidden", !els.mainInput.value.trim());
}

function goGameHome() {
  const url = new URL(window.location.href);
  url.searchParams.delete("share");
  window.history.replaceState(null, "", url);
  state.game = null;
  state.pendingGameMode = "normal";
  state.activeGameMode = "normal";
  state.gameEntrySource = "menu";
  state.autoQuestionDeck = [];
  state.autoQuestionIndex = 0;
  localStorage.removeItem("guess-word-game-id");
  setMessage("");
  refreshMainInputPlaceholder();
  setView("game");
  setGameStage("mode");
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
  if (stage !== "play") els.autoAskPanel.classList.add("hidden");
  if (stage !== "play") setPlayToolboxOpen(false);
  if (stage === "category") renderCategoryPicker();
  if (stage === "play") renderGame();
}

function returnToRoom() {
  if (window.NanachiAuth?.returnToLauncher) {
    window.NanachiAuth.returnToLauncher();
    return;
  }
  window.location.href = "https://lijiaqi.me";
}

async function leaveCurrentGame() {
  const returnToCategory = state.gameEntrySource === "category";
  const confirmed = await askConfirm({
    title: returnToCategory ? "是否返回词库选择界面？" : "是否返回主菜单？",
    text: "你的进度将不会保存。",
    okText: "确认返回",
  });
  if (!confirmed) return;

  state.game = null;
  state.autoQuestionDeck = [];
  state.autoQuestionIndex = 0;
  localStorage.removeItem("guess-word-game-id");
  setMessage("");
  refreshMainInputPlaceholder();

  if (returnToCategory) {
    state.pendingGameMode = "normal";
    state.activeGameMode = "normal";
    setGameStage("category");
    return;
  }
  goGameHome();
}

function returnToCategoryPicker() {
  if (state.game?.category) {
    state.selectedCategories = new Set([state.game.category]);
  }
  state.pendingGameMode = state.activeGameMode;
  setMessage("");
  setGameStage("category");
}

function showMyHome() {
  els.myHomePanel.classList.remove("hidden");
  els.myHistoryPanel.classList.add("hidden");
  els.myFavoritesPanel.classList.add("hidden");
}

async function showMyHistory() {
  els.myHomePanel.classList.add("hidden");
  els.myHistoryPanel.classList.remove("hidden");
  els.myFavoritesPanel.classList.add("hidden");
  state.gameHistoryVisibleCount = 10;
  await loadGameHistory();
}

function showMyFavorites() {
  els.myHomePanel.classList.add("hidden");
  els.myHistoryPanel.classList.add("hidden");
  els.myFavoritesPanel.classList.remove("hidden");
  renderFavorites();
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
  const autoMode = isAutoAskMode();
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
  if (!shownClues.length) {
    const clueAction = document.createElement("span");
    clueAction.className = "clue-button-action";
    clueAction.textContent = "没有思路？点此揭示线索";
    els.clueBtn.append(clueAction);
  } else {
    const title = document.createElement("span");
    title.className = "clue-board-title";
    title.textContent = clueIndex < clueCount
      ? `线索板（已展示${clueIndex}/${clueCount}条线索）`
      : "线索板（已显示全部线索）";

    const items = document.createElement("span");
    items.className = "clue-button-items";
    shownClues.forEach((clue, index) => {
      const item = document.createElement("strong");
      item.textContent = `${index + 1}. ${clue}`;
      items.append(item);
    });

    els.clueBtn.append(title, items);
    if (clueIndex < clueCount) {
      const clueAction = document.createElement("span");
      clueAction.className = "clue-button-action";
      clueAction.textContent = "查看下一条线索";
      els.clueBtn.append(clueAction);
    }
  }
  els.winBanner.classList.toggle("hidden", !isOver);
  els.winBanner.classList.toggle("revealed", isOver && !game?.isWon);
  els.bannerTitle.textContent = game?.isWon ? "答案正确" : "答案错误";
  els.revealedWord.textContent = game?.revealedWord || "";
  els.revealedSource.textContent = game?.category ? `来自词库：${game.category}` : "";
  els.revealedImage.classList.toggle("hidden", !game?.revealedImage);
  if (game?.revealedImage) els.revealedImage.src = game.revealedImage;
  els.mainInput.disabled = isOver;
  els.submitBtn.disabled = isOver;
  els.rerollPromptBtn.disabled = isOver;
  els.clearInputBtn.disabled = isOver;
  els.finalGuessBtn.disabled = isOver;
  if (els.mobileFinalGuessBtn) els.mobileFinalGuessBtn.disabled = isOver;
  els.revealBtn.disabled = isOver;
  els.clueBtn.disabled = isOver || !canShowMoreClues();
  els.playActionStack.classList.toggle("hidden", isOver);
  els.playForm.classList.toggle("hidden", isOver || autoMode);
  els.autoAskPanel.classList.toggle("hidden", isOver || !autoMode);
  els.autoAskProgress.textContent = `已问 ${state.autoQuestionIndex}/${state.autoQuestionDeck.length} 个随机问题`;
  els.autoAskPreview.textContent = state.autoQuestionDeck[state.autoQuestionIndex] || "二十个随机问题已经全部问完。";
  els.autoAskBtn.disabled = isOver || state.autoQuestionIndex >= state.autoQuestionDeck.length;
  els.finalActionRow.classList.toggle("hidden", isOver);
  els.shareBtn.classList.toggle("hidden", !isOver || !game?.shareId);
  els.favoriteCurrentBtn.classList.toggle("hidden", !isOver || !game?.category || !game?.revealedWord);
  els.rerollCurrentBtn.classList.toggle("hidden", !isOver || !game?.category);
  updateFavoriteCurrentButton();

  [...history].reverse().forEach((item, index) => {
    const originalIndex = history.length - index;
    const originalHistoryIndex = history.length - index - 1;
    const li = document.createElement("li");
    li.className = "history-item";

    const meta = document.createElement("div");
    meta.className = "history-meta";

    const number = document.createElement("span");
    number.textContent = `#${originalIndex} ${historyItemLabel(item)}`;
    const time = document.createElement("span");
    time.textContent = formatTime(item.at);
    meta.append(number, time);

    const actionRow = document.createElement("div");
    actionRow.className = "history-action-row";

    const text = document.createElement("p");
    text.className = "history-text";
    text.textContent = historyItemAction(item, originalHistoryIndex, history);

    const answer = document.createElement("span");
    answer.className = "answer";
    answer.textContent = historyItemResult(item);
    applyHistoryResultClass(answer, item);
    actionRow.append(text, answer);
    li.append(meta, actionRow);
    els.historyList.append(li);
  });
}

function updateFavoriteCurrentButton() {
  const word = state.game?.revealedWord;
  const category = state.game?.category;
  const visible = Boolean(isGameOver() && word && category);
  els.favoriteCurrentBtn.classList.toggle("hidden", !visible);
  if (!visible) return;
  const active = isFavorite(category, word);
  els.favoriteCurrentBtn.classList.toggle("active", active);
  els.favoriteCurrentBtn.textContent = active ? "已收藏此词条" : "收藏此词条";
  els.favoriteCurrentBtn.title = active ? "取消收藏词条" : "收藏词条";
  els.favoriteCurrentBtn.setAttribute("aria-label", active ? `取消收藏 ${word}` : `收藏 ${word}`);
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

function historyOutcomeText(outcome) {
  if (outcome === "won") return "成功猜出";
  if (outcome === "revealed") return "猜测失败";
  return "未结束";
}

function historyItemLabel(item) {
  if (item.type === "question") return "提问";
  if (item.type === "guess") return "猜答案";
  if (item.type === "hint") return "查看线索";
  return "公布答案";
}

function historyItemAction(item, itemIndex, history) {
  if (item.type === "hint") {
    const hintNumber = history.slice(0, itemIndex + 1).filter((historyItem) => historyItem.type === "hint").length;
    return `查看第 ${hintNumber} 条线索`;
  }
  if (item.type === "reveal") return "公布答案";
  return item.text || historyItemLabel(item);
}

function historyItemResult(item) {
  if (item.type === "question") {
    if (item.answer === "无法回答") return "AI：请换个问法";
    return `AI：${item.answer}`;
  }
  if (item.type === "guess") return item.correct ? "猜测正确" : "猜测错误";
  if (item.type === "hint") return `获取线索：${item.answer}`;
  return `正解：${item.answer}`;
}

function applyHistoryResultClass(element, item) {
  if (item.type === "question" && item.answer === "无法回答") element.classList.add("unclear");
  if (item.type === "guess") element.classList.add(item.correct ? "correct" : "wrong");
  if (item.type === "hint") element.classList.add("hint");
  if (item.type === "reveal") element.classList.add("reveal");
}

function imageWithFallback(image) {
  return String(image || "").trim() || "/images/placeholder.svg";
}

function latestWordbankImage(record) {
  const entries = state.wordbank[record.category] || [];
  const entry = entries.find((item) => item.word === record.word);
  return imageWithFallback(entry?.image || record.image);
}

function attachImageFallback(imageElement) {
  imageElement.addEventListener("error", () => {
    if (imageElement.src.endsWith("/images/placeholder.svg")) return;
    imageElement.src = "/images/placeholder.svg";
  }, { once: true });
}

function historyGroupLabel(iso) {
  const date = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const key = (value) => value.toLocaleDateString("zh-CN");
  if (key(date) === key(today)) return "今天";
  if (key(date) === key(yesterday)) return "昨天";
  return "更早以前";
}

function historyRecordKey(record) {
  return `${record.shareId || record.id || record.endedAt || ""}::${record.category || ""}::${record.word || ""}`;
}

function setHistoryPanelHeaderVisible(visible) {
  els.myHistoryPanel.querySelector(".panel-title")?.classList.toggle("hidden", !visible);
}

function observeHistoryLoadMore(element) {
  if (historyLoadMoreObserver) historyLoadMoreObserver.disconnect();
  if (!("IntersectionObserver" in window)) return;
  historyLoadMoreObserver = new IntersectionObserver((entries) => {
    if (entries.some((entry) => entry.isIntersecting)) loadMoreGameHistoryIfNeeded(true);
  }, { rootMargin: "160px 0px" });
  historyLoadMoreObserver.observe(element);
}

async function loadGameHistory() {
  try {
    const records = await api(`/api/history?mode=${encodeURIComponent(state.historyMode)}`);
    const localRecords = readGuestHistory();
    const merged = [...records, ...localRecords].filter((record, index, all) =>
      all.findIndex((item) => historyRecordKey(item) === historyRecordKey(record)) === index
    );
    state.gameHistory = merged
      .filter((record) => (record.mode || "normal") === state.historyMode)
      .sort((a, b) => new Date(b.endedAt || 0) - new Date(a.endedAt || 0));
    state.activeHistoryRecord = null;
    state.gameHistoryVisibleCount = 10;
    renderGameHistory();
  } catch (error) {
    els.gameHistoryList.innerHTML = "";
    els.emptyGameHistory.textContent = error.message;
    els.emptyGameHistory.classList.remove("hidden");
  }
}

function renderGameHistory() {
  state.activeHistoryRecord = null;
  setHistoryPanelHeaderVisible(true);
  els.normalHistoryTab?.classList.toggle("active", state.historyMode === "normal");
  els.dailyHistoryTab?.classList.toggle("active", state.historyMode === "daily");
  if (historyLoadMoreObserver) historyLoadMoreObserver.disconnect();
  els.gameHistoryList.innerHTML = "";
  els.emptyGameHistory.classList.toggle("hidden", state.gameHistory.length > 0);
  els.emptyGameHistory.textContent = state.historyMode === "daily" ? "还没有完成的每日猜题。" : "还没有完成的普通猜题。";
  const visibleRecords = state.gameHistory.slice(0, state.gameHistoryVisibleCount);
  const groups = ["今天", "昨天", "更早以前"]
    .map((label) => ({
      label,
      records: visibleRecords.filter((record) => historyGroupLabel(record.endedAt) === label)
    }))
    .filter((group) => group.records.length);

  groups.forEach((group) => {
    const section = document.createElement("section");
    section.className = "history-group";
    const title = document.createElement("div");
    title.className = "history-group-title";
    title.textContent = group.label;
    section.append(title);
    group.records.forEach((record) => section.append(renderGameHistoryCard(record)));
    els.gameHistoryList.append(section);
  });

  if (state.gameHistoryVisibleCount < state.gameHistory.length) {
    const more = document.createElement("div");
    more.className = "history-load-more";
    more.textContent = "继续下滑加载更多";
    els.gameHistoryList.append(more);
    observeHistoryLoadMore(more);
  }

  if (state.highlightHistoryRecordKey) {
    window.setTimeout(() => {
      const selector = `[data-history-key="${CSS.escape(state.highlightHistoryRecordKey)}"]`;
      const target = els.gameHistoryList.querySelector(selector);
      state.highlightHistoryRecordKey = "";
      if (!target) return;
      target.classList.add("highlighted-history-card");
      target.scrollIntoView({ behavior: "smooth", block: "center" });
      window.setTimeout(() => target.classList.remove("highlighted-history-card"), 1600);
    }, 60);
  }
}

function renderGameHistoryCard(record) {
  const card = document.createElement("article");
  card.className = "game-history-card";
  card.dataset.historyKey = historyRecordKey(record);
  card.tabIndex = 0;
  card.setAttribute("role", "button");
  card.setAttribute("aria-label", `查看${record.word}的历史记录`);
  const openRecord = () => renderHistoryRecordDetail(record);
  card.addEventListener("click", openRecord);
  card.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openRecord();
    }
  });

  const thumb = document.createElement("img");
  thumb.className = "history-record-thumb";
  thumb.src = latestWordbankImage(record);
  thumb.alt = `${record.word} 图片`;
  thumb.loading = "lazy";
  attachImageFallback(thumb);

  const body = document.createElement("div");
  body.className = "history-record-body";

  const title = document.createElement("div");
  title.className = "history-card-title";
  const strong = document.createElement("strong");
  strong.textContent = record.word;
  title.append(strong);

  const hintCount = (record.history || []).filter((item) => item.type === "hint").length;
  const stats = document.createElement("p");
  stats.className = "history-summary-line";
  stats.textContent = `提问 ${record.questionCount || 0} 次，线索 ${hintCount} 条，进行 ${record.guessCount || 0} 次猜测`;

  const footer = document.createElement("div");
  footer.className = "case-file-footer";
  const outcome = document.createElement("span");
  outcome.className = `case-outcome ${record.outcome === "won" ? "won" : "revealed"}`;
  outcome.textContent = historyOutcomeText(record.outcome);
  const answer = document.createElement("strong");
  answer.textContent = `来自词库：${record.category}`;
  footer.append(outcome, answer);

  const tools = document.createElement("div");
  tools.className = "card-corner-tools";
  const favoriteMark = createFavoriteButton(record.category, record.word, { showInactive: false, compact: true });
  if (favoriteMark) tools.append(favoriteMark);
  const locateBtn = createLocateButton(record.category, record.word);
  tools.append(locateBtn);

  body.append(title, stats, footer);
  card.append(tools, thumb, body);
  return card;
}

function createLocateButton(category, word) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "locate-button";
  button.title = "在词库中查看";
  button.setAttribute("aria-label", `在词库中查看 ${word}`);
  button.textContent = "⌖";
  button.addEventListener("click", (event) => {
    event.stopPropagation();
    jumpToLibraryEntry(category, word);
  });
  return button;
}

function jumpToLibraryEntry(category, word) {
  const entries = state.wordbank[category] || [];
  const index = entries.findIndex((entry) => entry.word === word);
  if (index < 0) {
    showToast("当前词库中找不到这个词条。", true);
    return;
  }
  state.activeCategory = category;
  state.editingEntry = null;
  state.highlightEntry = { category, index };
  state.entryPages[category] = Math.floor(index / state.entryPageSize) + 1;
  setView("library");
  renderLibrary();
  window.setTimeout(() => {
    const target = document.querySelector(`[data-entry-key="${CSS.escape(favoriteKey(category, word))}"]`);
    target?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, 80);
}

function renderFavorites() {
  els.favoriteList.innerHTML = "";
  els.emptyFavorites.classList.toggle("hidden", state.favorites.length > 0);
  state.favorites.forEach((favorite) => {
    els.favoriteList.append(renderFavoriteCard(favorite));
  });
}

function renderFavoriteCard(favorite) {
  const entry = entryForFavorite(favorite.category, favorite.word);
  const card = document.createElement("article");
  card.className = "game-history-card favorite-card";
  card.tabIndex = 0;
  card.setAttribute("role", "button");
  card.setAttribute("aria-label", `在词库中查看 ${favorite.word}`);
  card.addEventListener("click", () => jumpToLibraryEntry(favorite.category, favorite.word));
  card.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      jumpToLibraryEntry(favorite.category, favorite.word);
    }
  });

  const tools = document.createElement("div");
  tools.className = "card-corner-tools";
  tools.append(createFavoriteButton(favorite.category, favorite.word, { compact: true }));

  const thumb = document.createElement("img");
  thumb.className = "history-record-thumb";
  thumb.src = favoriteImage(favorite.category, favorite.word);
  thumb.alt = `${favorite.word} 图片`;
  thumb.loading = "lazy";
  attachImageFallback(thumb);

  const body = document.createElement("div");
  body.className = "history-record-body";

  const title = document.createElement("div");
  title.className = "history-card-title favorite-card-title";
  const strong = document.createElement("strong");
  strong.textContent = favorite.word;
  const time = document.createElement("span");
  time.textContent = new Date(favorite.addedAt).toLocaleString("zh-CN");
  title.append(strong, time);

  const clues = normalizeClues(entry?.clues);
  const stats = document.createElement("p");
  stats.className = "history-summary-line";
  stats.textContent = clues.length ? `线索 ${clues.length} 条：${clues.slice(0, 2).join("，")}` : "暂无线索";

  const footer = document.createElement("div");
  footer.className = "case-file-footer favorite-card-footer";
  const source = document.createElement("strong");
  source.textContent = `来自词库：${favorite.category}`;
  footer.append(source);

  body.append(title, stats, footer);
  card.append(tools, thumb, body);
  return card;
}

function loadMoreGameHistoryIfNeeded(force = false) {
  if (state.view !== "history") return;
  if (els.myHistoryPanel.classList.contains("hidden")) return;
  if (state.activeHistoryRecord) return;
  if (state.gameHistoryVisibleCount >= state.gameHistory.length) return;
  const distanceToBottom = document.documentElement.scrollHeight - window.innerHeight - window.scrollY;
  if (!force && distanceToBottom > 260) return;
  state.gameHistoryVisibleCount = Math.min(state.gameHistory.length, state.gameHistoryVisibleCount + 10);
  renderGameHistory();
}

function returnToGameHistoryFromDetail(record) {
  state.highlightHistoryRecordKey = historyRecordKey(record);
  renderGameHistory();
}

function renderHistoryRecordDetail(record) {
  state.activeHistoryRecord = record;
  setHistoryPanelHeaderVisible(false);
  if (historyLoadMoreObserver) historyLoadMoreObserver.disconnect();
  els.emptyGameHistory.classList.add("hidden");
  els.gameHistoryList.innerHTML = "";

  const detail = document.createElement("section");
  detail.className = "case-detail";

  const topbar = document.createElement("div");
  topbar.className = "case-detail-topbar";
  const backBtn = document.createElement("button");
  backBtn.type = "button";
  backBtn.className = "back-button";
  backBtn.title = "返回历史记录";
  backBtn.setAttribute("aria-label", "返回历史记录");
  backBtn.textContent = "←";
  backBtn.addEventListener("click", () => returnToGameHistoryFromDetail(record));
  const title = document.createElement("div");
  const eyebrow = document.createElement("p");
  eyebrow.className = "eyebrow";
  eyebrow.textContent = "历史详情";
  const resultTitle = document.createElement("h2");
  resultTitle.className = `case-result-title ${record.outcome === "won" ? "won" : "revealed"}`;
  resultTitle.textContent = record.outcome === "won" ? "成功猜出" : "猜测失败";
  title.append(eyebrow, resultTitle);
  topbar.append(backBtn, title);

  const answerPanel = document.createElement("section");
  answerPanel.className = `case-answer-panel ${record.outcome === "won" ? "won" : "revealed"}`;
  const answerCopy = document.createElement("div");
  const answer = document.createElement("strong");
  answer.textContent = record.word;
  const source = document.createElement("small");
  source.textContent = `来自词库：${record.category}`;
  answerCopy.append(answer, source);
  const image = document.createElement("img");
  image.src = latestWordbankImage(record);
  image.alt = `${record.word} 图片`;
  attachImageFallback(image);
  const favoriteBtn = createFavoriteButton(record.category, record.word, { compact: true });
  answerPanel.append(favoriteBtn, image, answerCopy);

  const hintCount = (record.history || []).filter((item) => item.type === "hint").length;
  const stats = document.createElement("p");
  stats.className = "history-summary-line detail-summary-line";
  stats.textContent = `提问 ${record.questionCount || 0} 次，线索 ${hintCount} 条，进行 ${record.guessCount || 0} 次猜测`;

  const endedAt = document.createElement("p");
  endedAt.className = "history-ended-at";
  endedAt.textContent = `结束时间：${new Date(record.endedAt).toLocaleString("zh-CN")}`;

  const timeline = document.createElement("ol");
  timeline.className = "case-timeline";
  (record.history || []).forEach((item, index) => {
    const li = document.createElement("li");
    li.className = "history-item";

    const meta = document.createElement("div");
    meta.className = "history-meta";
    const number = document.createElement("span");
    number.textContent = `#${index + 1} ${historyItemLabel(item)}`;
    const time = document.createElement("span");
    time.textContent = formatTime(item.at);
    meta.append(number, time);

    const actionRow = document.createElement("div");
    actionRow.className = "history-action-row";

    const text = document.createElement("p");
    text.className = "history-text";
    text.textContent = historyItemAction(item, index, record.history || []);

    const result = document.createElement("span");
    result.className = "answer";
    result.textContent = historyItemResult(item);
    applyHistoryResultClass(result, item);
    actionRow.append(text, result);
    li.append(meta, actionRow);
    timeline.append(li);
  });

  detail.append(topbar, answerPanel, stats, endedAt, timeline);
  els.gameHistoryList.append(detail);
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
    if (item.type === "question") result.textContent = item.answer === "无法回答" ? "AI：请换个问法" : `AI：${item.answer}`;
    if (item.type === "guess") result.textContent = item.correct ? "答案正确" : "答案错误";
    if (item.type === "hint") result.textContent = "线索已出示";
    if (item.type === "reveal") result.textContent = `正解：${item.answer}`;
    card.append(label, text, result);
    els.shareSteps.append(card);
  });

  const done = state.shareStep >= steps.length;
  els.nextShareStepBtn.textContent = done ? `最终答案：${record.word}` : "揭晓下一条";
  els.nextShareStepBtn.disabled = done;
}

async function shareCurrentGame() {
  showToast("该功能尚未实现，请等待后续更新", true);
  return;

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
  const categories = state.wordbankLoaded ? Object.keys(state.wordbank) : Object.keys(state.categorySummary);
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
    const entryCount = state.wordbankLoaded ? (state.wordbank[category] || []).length : (state.categorySummary[category] || 0);
    const row = document.createElement("button");
    row.type = "button";
    row.className = "category-row";
    row.classList.toggle("selected", state.selectedCategories.has(category));
    row.setAttribute("aria-pressed", state.selectedCategories.has(category) ? "true" : "false");
    row.addEventListener("click", async () => {
      if (state.selectedCategories.has(category)) {
        try {
          await startNewGame([category], state.pendingGameMode);
        } catch (error) {
          showToast(error.message, true);
        }
        return;
      }
      state.selectedCategories = new Set([category]);
      renderCategoryPicker();
      updateCategoryActions();
    });

    const name = document.createElement("span");
    name.textContent = category;
    const count = document.createElement("small");
    count.textContent = `含 ${entryCount} 个词条`;
    row.append(name, count);
    els.categoryList.append(row);
  });
  updateCategoryActions();
}

function updateCategoryActions() {
  const total = state.wordbankLoaded ? Object.keys(state.wordbank).length : Object.keys(state.categorySummary).length;
  const selected = state.selectedCategories.size;
  els.startSelectedGameBtn.disabled = selected === 0;
  els.randomCategoryBtn.disabled = total === 0;
}

function selectRandomCategory() {
  const categories = state.wordbankLoaded ? Object.keys(state.wordbank) : Object.keys(state.categorySummary);
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
      state.editingEntry = null;
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
    meta.textContent = `含 ${entries.length} 个词条`;
    const sample = document.createElement("small");
    sample.textContent = entries.slice(0, 3).map((entry) => entry.word).join("，") || "空词库";
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
    const isEditing = state.editingEntry?.category === category && state.editingEntry?.index === index;
    const isHighlighted = state.highlightEntry?.category === category && state.highlightEntry?.index === index;
    const row = document.createElement("article");
    row.className = `entry-row${isEditing ? " editing-entry" : " summary-entry"}${isHighlighted ? " located-entry" : ""}`;
    row.dataset.entryKey = favoriteKey(category, entry.word);

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "entry-delete-button";
    deleteBtn.title = "删除词条";
    deleteBtn.setAttribute("aria-label", `删除词条 ${entry.word}`);
    deleteBtn.textContent = "×";
    deleteBtn.addEventListener("click", () => deleteEntry(category, index, entry.word));

    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.className = `entry-edit-button${isEditing ? " active" : ""}`;
    editBtn.title = isEditing ? "收起编辑" : "编辑词条";
    editBtn.setAttribute("aria-label", `${isEditing ? "收起编辑" : "编辑词条"} ${entry.word}`);
    editBtn.textContent = isEditing ? "×" : "✎";
    editBtn.addEventListener("click", () => {
      state.editingEntry = isEditing ? null : { category, index };
      renderEditor(category);
    });

    const favoriteBtn = createFavoriteButton(category, entry.word, { compact: true });

    const imagePanel = document.createElement("div");
    imagePanel.className = "entry-image-panel";

    const imagePreview = document.createElement("img");
    imagePreview.className = "entry-image-preview";
    imagePreview.src = entry.image || "/images/placeholder.svg";
    imagePreview.alt = `${entry.word} 图片`;

    imagePanel.append(imagePreview);

    if (!isEditing) {
      const summary = document.createElement("div");
      summary.className = "entry-summary";

      const title = document.createElement("strong");
      title.className = "entry-summary-title";
      title.textContent = entry.word || "未命名词条";

      const clueWrap = document.createElement("div");
      clueWrap.className = "entry-summary-clues";
      normalizeClues(entry.clues).forEach((clue, clueIndex) => {
        const clueItem = document.createElement("span");
        clueItem.textContent = `${clueIndex + 1}. ${clue}`;
        clueWrap.append(clueItem);
      });
      if (!clueWrap.children.length) {
        const empty = document.createElement("span");
        empty.className = "empty-clue";
        empty.textContent = "暂无线索";
        clueWrap.append(empty);
      }

      summary.append(title, clueWrap);
      row.append(deleteBtn, editBtn, favoriteBtn, imagePanel, summary);
      els.entryList.append(row);
      return;
    }

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
    imagePanel.append(imageTools);

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
    row.append(deleteBtn, editBtn, favoriteBtn, imagePanel, content);
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
  state.wordbankLoaded = true;
  try {
    const response = await fetch("/images/category-covers/index.json");
    state.categoryCovers = response.ok ? await response.json() : {};
  } catch {
    state.categoryCovers = {};
  }
  renderCategoryPicker();
}

async function loadWordbankSummary() {
  state.categorySummary = await api("/api/wordbank/summary");
  renderCategoryPicker();
}

async function loadDailyStatus() {
  try {
    state.dailyStatus = await api("/api/daily/status");
    const status = state.dailyStatus.completed ? "已经猜完" : "尚未猜题";
    els.dailyModeStatus.className = `daily-mode-status ${state.dailyStatus.completed ? "done" : "pending"}`;
    els.dailyModeStatus.textContent = status;
  } catch {
    els.dailyModeStatus.className = "daily-mode-status pending";
    els.dailyModeStatus.textContent = "登录后可用";
  }
}

async function refreshWordbank(bank) {
  state.wordbank = bank || await api("/api/wordbank");
  state.wordbankLoaded = true;
  state.categorySummary = Object.fromEntries(Object.entries(state.wordbank).map(([category, entries]) => [category, entries.length]));
  renderCategoryPicker();
  renderLibrary();
}

async function startNewGame(categories, mode = state.pendingGameMode || "normal", entrySource = "category") {
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
  window.NanachiGameShell?.record("core_start", "guess");
  localStorage.setItem("guess-word-game-id", state.game.id);
  state.activeGameMode = mode === "auto" ? "auto" : "normal";
  state.gameEntrySource = entrySource;
  state.autoQuestionDeck = state.activeGameMode === "auto" ? shuffledAskQuestions() : [];
  state.autoQuestionIndex = 0;
  setMessage("");
  refreshMainInputPlaceholder();
  setGameStage("play");
  if (state.activeGameMode === "auto") await askNextAutoQuestion();
}

async function startDailyGame() {
  setMessage("正在载入今日题目...");
  state.game = await api("/api/daily/game", { method: "POST" });
  window.NanachiGameShell?.record("core_start", "guess");
  localStorage.setItem("guess-word-game-id", state.game.id);
  state.activeGameMode = "daily";
  state.gameEntrySource = "daily";
  state.autoQuestionDeck = [];
  state.autoQuestionIndex = 0;
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
  await startNewGame([category], state.activeGameMode === "auto" ? "auto" : "normal");
}

async function submitTurn(event) {
  event.preventDefault();
  const text = els.mainInput.value.trim() || state.currentAskPlaceholder || randomAskPlaceholder();
  if (!state.game) {
    showToast("请先选择词库并开始猜词。", true);
    setGameStage("category");
    return;
  }
  if (!text) {
    showToast("随机问题已经问完了，请手动输入新问题。", true);
    els.mainInput.focus();
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
    refreshMainInputPlaceholder();
    updateClearInputButton();
    setMessage("");
    localStorage.setItem("guess-word-game-id", state.game.id);
    renderGame();
  } catch (error) {
    setMessage(error.message, true);
  } finally {
    setLoading(false);
  }
}

async function askNextAutoQuestion() {
  if (!state.game) {
    showToast("请先选择词库并开始猜词。", true);
    setGameStage("category");
    return;
  }
  if (!isAutoAskMode() || isGameOver()) return;
  if (state.autoQuestionIndex >= state.autoQuestionDeck.length) {
    showToast("二十个随机问题已经全部问完。", true);
    return;
  }

  const question = state.autoQuestionDeck[state.autoQuestionIndex];
  setLoading(true);
  setMessage("AI 正在回答随机问题...");

  try {
    state.game = await api("/api/ask", {
      method: "POST",
      body: JSON.stringify({ gameId: state.game.id, question })
    });
    state.autoQuestionIndex += 1;
    localStorage.setItem("guess-word-game-id", state.game.id);
    if (state.autoQuestionIndex >= state.autoQuestionDeck.length) {
      setMessage("二十个随机问题已问完，正在公布答案...");
      state.game = await api("/api/reveal", {
        method: "POST",
        body: JSON.stringify({ gameId: state.game.id })
      });
      localStorage.setItem("guess-word-game-id", state.game.id);
    }
    setMessage("");
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
  const confirmed = await askConfirm({
    title: "公布答案",
    text: "真的不继续猜测了吗？果然猜不出来吧？",
    okText: "公布答案"
  });
  if (!confirmed) return;
  setLoading(true);
  setMessage("正在公布答案...");

  try {
    state.game = await api("/api/reveal", {
      method: "POST",
      body: JSON.stringify({ gameId: state.game.id })
    });
    rememberFinishedGame(state.game);
    window.NanachiGameShell?.record("core_complete", "guess", { success: false });
    localStorage.setItem("guess-word-game-id", state.game.id);
    setMessage("");
    renderGame();
    if (state.game.mode === "daily") void loadDailyStatus();
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
  setPlayToolboxOpen(false);
  resetFinalGuessForm();
  els.finalGuessModal.classList.remove("hidden");
  els.finalGuessInput.focus();
}

function closeFinalGuessModal() {
  els.finalGuessModal.classList.add("hidden");
  state.finalGuessOutcome = null;
}

function resetFinalGuessForm() {
  state.finalGuessOutcome = null;
  els.finalGuessForm.classList.remove("judging", "result-correct", "result-wrong");
  els.finalGuessResult.className = "guess-result hidden";
  els.finalGuessResult.replaceChildren();
  els.finalGuessInput.value = "";
  els.finalGuessInput.disabled = false;
  els.finalGuessSubmitBtn.disabled = false;
  els.finalGuessCancelBtn.disabled = false;
  els.finalGuessCloseBtn.disabled = false;
  els.finalGuessCancelBtn.classList.remove("hidden");
  els.finalGuessCancelBtn.textContent = "取消";
  els.finalGuessSubmitBtn.textContent = "提交最终答案";
}

function renderFinalGuessResult(correct) {
  state.finalGuessOutcome = correct;
  els.finalGuessForm.classList.remove("judging");
  els.finalGuessForm.classList.add(correct ? "result-correct" : "result-wrong");
  els.finalGuessResult.className = `guess-result ${correct ? "correct" : "wrong"}`;
  els.finalGuessResult.replaceChildren();
  const label = document.createElement("span");
  label.textContent = "您的猜测";
  const verdict = document.createElement("strong");
  verdict.textContent = correct ? "完全正确" : "错误";
  els.finalGuessResult.append(label, verdict);
  els.finalGuessInput.disabled = true;
  els.finalGuessSubmitBtn.disabled = false;
  els.finalGuessCancelBtn.disabled = false;
  els.finalGuessCloseBtn.disabled = false;
  if (correct) {
    els.finalGuessCancelBtn.classList.add("hidden");
    els.finalGuessSubmitBtn.textContent = "返回猜词界面";
  } else {
    els.finalGuessCancelBtn.classList.remove("hidden");
    els.finalGuessCancelBtn.textContent = "返回，继续提问";
    els.finalGuessSubmitBtn.textContent = "重新猜测";
  }
}

async function submitFinalGuess(event) {
  event.preventDefault();
  if (state.finalGuessOutcome === true) {
    closeFinalGuessModal();
    return;
  }
  if (state.finalGuessOutcome === false) {
    resetFinalGuessForm();
    els.finalGuessInput.focus();
    return;
  }
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
    rememberFinishedGame(state.game);
    localStorage.setItem("guess-word-game-id", state.game.id);
    const latest = state.game.history.at(-1);
    if (latest?.correct) window.NanachiGameShell?.record("core_complete", "guess", { success: true });
    renderGame();
    renderFinalGuessResult(Boolean(latest?.correct));
    if (state.game.mode === "daily" && latest?.correct) void loadDailyStatus();
  } catch (error) {
    state.finalGuessOutcome = null;
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

window.addEventListener("nanachi-authenticated", () => {
  void mergeGuestHistoryIntoAccount().then(loadGameHistory).catch(() => undefined);
  if (window.NanachiAuth?.consumeProfileLogin?.()) setView("history");
});

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
  els.deleteCategoryBtn.hidden = true;
  els.deleteCategoryBtn.disabled = true;
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
    if (state.editingEntry?.category === category && state.editingEntry?.index === index) {
      state.editingEntry = null;
    }
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
  saveBtn.textContent = "√";

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
  saveBtn.textContent = "√";

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

els.gameNavBtn.addEventListener("click", goGameHome);
els.libraryNavBtn.addEventListener("click", async () => {
  setView("library");
  if (state.wordbankLoaded) return;
  els.libraryCards.innerHTML = '<p class="library-loading">正在打开词库…</p>';
  try {
    await loadWordbank();
    renderLibrary();
  } catch (error) {
    els.libraryCards.innerHTML = '';
    setLibraryMessage(error.message || "词库加载失败。", true);
  }
});
els.historyNavBtn.addEventListener("click", () => {
  if (window.NanachiAuth?.isLoggedIn?.()) {
    setView("history");
    return;
  }
  window.NanachiAuth?.openProfileLogin?.();
});
els.chooseBankModeBtn.addEventListener("click", () => {
  state.pendingGameMode = "normal";
  setGameStage("category");
});
els.quickRandomModeBtn.addEventListener("click", async () => {
  if (els.quickRandomModeBtn.disabled) return;
  els.quickRandomModeBtn.disabled = true;
  try {
    let categories = state.wordbankLoaded ? Object.keys(state.wordbank) : Object.keys(state.categorySummary);
    if (!categories.length) {
      await loadWordbankSummary();
      categories = Object.keys(state.categorySummary);
    }
    if (!categories.length) throw new Error("词库暂时不可用，请稍后再试。");

    const category = categories[Math.floor(Math.random() * categories.length)];
    state.selectedCategories = new Set([category]);
    state.pendingGameMode = "normal";
    await startNewGame([category], "normal", "quick");
  } catch (error) {
    showToast(error.message, true);
  } finally {
    els.quickRandomModeBtn.disabled = false;
  }
});
els.autoAskModeBtn.addEventListener("click", () => {
  showToast("该玩法暂未开放，敬请期待。");
});
els.dailyModeBtn.addEventListener("click", async () => {
  try {
    await startDailyGame();
  } catch (error) {
    showToast(error.message, true);
  }
});
els.normalHistoryTab?.addEventListener("click", () => {
  state.historyMode = "normal";
  void loadGameHistory();
});
els.dailyHistoryTab?.addEventListener("click", () => {
  state.historyMode = "daily";
  void loadGameHistory();
});
els.backToModeBtn.addEventListener("click", () => setGameStage("mode"));
els.randomCategoryBtn.addEventListener("click", selectRandomCategory);
els.startSelectedGameBtn.addEventListener("click", async () => {
  try {
    await startNewGame([...state.selectedCategories], state.pendingGameMode);
  } catch (error) {
    showToast(error.message, true);
  }
});
els.playForm.addEventListener("submit", submitTurn);
els.autoAskBtn.addEventListener("click", askNextAutoQuestion);
els.rerollPromptBtn.addEventListener("click", () => {
  refreshMainInputPlaceholder();
  els.mainInput.focus();
});
els.mainInput.addEventListener("input", updateClearInputButton);
els.clearInputBtn.addEventListener("click", clearQuestionInput);
els.finalGuessBtn.addEventListener("click", openFinalGuessModal);
els.mobileFinalGuessBtn?.addEventListener("click", openFinalGuessModal);
els.finalGuessForm.addEventListener("submit", submitFinalGuess);
els.finalGuessCloseBtn.addEventListener("click", closeFinalGuessModal);
els.finalGuessCancelBtn.addEventListener("click", closeFinalGuessModal);
els.finalGuessModal.addEventListener("click", (event) => {
  if (event.target === els.finalGuessModal && !els.finalGuessForm.classList.contains("judging")) closeFinalGuessModal();
});
els.clueBtn.addEventListener("click", showClue);
els.revealBtn.addEventListener("click", revealAnswer);
els.shareBtn.addEventListener("click", shareCurrentGame);
els.returnToRoomModeBtn.addEventListener("click", returnToRoom);
els.backToCategoryBtn.addEventListener("click", () => void leaveCurrentGame());
els.mobileToolToggle?.addEventListener("click", () => setPlayToolboxOpen(true));
els.mobileToolClose?.addEventListener("click", () => setPlayToolboxOpen(false));
els.mobileToolScrim?.addEventListener("click", () => setPlayToolboxOpen(false));
els.favoriteCurrentBtn.addEventListener("click", () => {
  if (!state.game?.category || !state.game?.revealedWord) return;
  toggleFavorite(state.game.category, state.game.revealedWord);
});
els.rerollCurrentBtn.addEventListener("click", async () => {
  try {
    await rerollCurrentCategory();
  } catch (error) {
    showToast(error.message, true);
  }
});
els.openGameHistoryBtn.addEventListener("click", showMyHistory);
els.openFavoritesBtn.addEventListener("click", showMyFavorites);
els.backToMyBtn.addEventListener("click", showMyHome);
els.backToMyFromFavoritesBtn.addEventListener("click", showMyHome);
window.addEventListener("scroll", loadMoreGameHistoryIfNeeded, { passive: true });
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
  state.editingEntry = null;
  els.libraryMain.classList.remove("hidden");
  els.libraryEditor.classList.add("hidden");
});
els.largeLibraryModeBtn.addEventListener("click", () => setLibraryCardMode("large"));
els.compactLibraryModeBtn.addEventListener("click", () => setLibraryCardMode("compact"));
MOBILE_QUERY.addEventListener("change", applyLibraryCardMode);

refreshMainInputPlaceholder();
loadFavorites();
await loadWordbankSummary();
setGameStage("mode");
document.body.classList.remove("app-loading");
void loadDailyStatus();

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
