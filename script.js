// Initial Seed Mock Data if sheet API is empty
const INITIAL_MOCK_SHAYARI = [
  {
    id: "sh-1",
    content:
      "कुछ तबियत ही इन दिनों उदास है ग़ालिब,\nवर्ना दिल बहलाने के बहाने तो बहुतायत में थे...",
    author: "Mirza Ghalib",
    category: "Sad",
    language: "Hindi",
    tags: "Ghalib, Udas, Yaadein",
    likes: 342,
    shares: 120,
    featured: true,
    created_at: "2026-01-15T10:00:00Z",
    status: "active",
  },
  {
    id: "sh-2",
    content: "तुम मेरे पास होते हो गोया,\nजब कोई दूसरा नहीं होता।",
    author: "Momin Khan Momin",
    category: "Love",
    language: "Hindi",
    tags: "Love, Mohabbat, Classic",
    likes: 512,
    shares: 240,
    featured: true,
    created_at: "2026-02-01T12:30:00Z",
    status: "active",
  },
  {
    id: "sh-3",
    content:
      "उसकी आँखों में नज़र आता है सारा जहाँ,\nऔर एक हम हैं कि उस शख्स से आगे न गए।",
    author: "Anonymous",
    category: "Romantic",
    language: "Hindi",
    tags: "Romantic, Aankhein, Ishq",
    likes: 189,
    shares: 95,
    featured: false,
    created_at: "2026-02-10T15:45:00Z",
    status: "active",
  },
  {
    id: "sh-4",
    content: "हसरतों के दिए बुझा दो अब,\nरात गहरी है सो जाओ अब।",
    author: "Jaun Elia",
    category: "Sad",
    language: "Hindi",
    tags: "Jaun, Raat, Dard",
    likes: 420,
    shares: 180,
    featured: false,
    created_at: "2026-02-14T09:20:00Z",
    status: "active",
  },
  {
    id: "sh-5",
    content:
      "मेरी खामोशी को कमजोरी मत समझना,\nसमुंदर जब शांत होता है तो तूफान की तैयारी होती है।",
    author: "Unknown Poet",
    category: "Attitude",
    language: "Hindi",
    tags: "Attitude, Royal, SelfRespect",
    likes: 678,
    shares: 310,
    featured: false,
    created_at: "2026-02-20T11:10:00Z",
    status: "active",
  },
  {
    id: "sh-6",
    content:
      "Dosti wo nahi jo jaan deti hai,\nDosti wo bhi nahi jo muskaan deti hai,\nAsli dosti wo hai jo paani me gira aansu bhi pehchan leti hai.",
    author: "Rahat Fan",
    category: "Friendship",
    language: "Hinglish",
    tags: "Friendship, Dosti, Yaar",
    likes: 295,
    shares: 115,
    featured: false,
    created_at: "2026-02-22T08:00:00Z",
    status: "active",
  },
];

const CATEGORIES = [
  "All",
  "Love",
  "Sad",
  "Attitude",
  "Life",
  "Romantic",
  "Friendship",
  "Motivational",
];

// Global Application State
let state = {
  shayariList: [],
  filteredList: [],
  currentTab: "home", // 'home' | 'bookmarks'
  activeCategory: "All",
  activeLanguage: "ALL",
  sortBy: "latest",
  searchQuery: "",
  bookmarks: JSON.parse(localStorage.getItem("ehsaas_bookmarks") || "[]"),
  likedIds: JSON.parse(localStorage.getItem("ehsaas_likes") || "[]"),
  currentPage: 1,
  pageSize: CONFIG.DEFAULT_PAGE_SIZE,
  isAdmin: false,
};

// App Initialization
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  renderCategoryTabs();
  fetchShayariData();
  updateBookmarkBadge();
});

// Theme Setup
function initTheme() {
  if (
    localStorage.theme === "dark" ||
    (!("theme" in localStorage) &&
      window.matchMedia("(prefers-color-scheme: dark)").matches)
  ) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
}

function toggleDarkMode() {
  if (document.documentElement.classList.contains("dark")) {
    document.documentElement.classList.remove("dark");
    localStorage.theme = "light";
  } else {
    document.documentElement.classList.add("dark");
    localStorage.theme = "dark";
  }
}

// Fetch Data from Google Sheets Webhook OR Fallback
async function fetchShayariData() {
  showLoading(true);
  if (CONFIG.GOOGLE_APPS_SCRIPT_URL) {
    try {
      const res = await fetch(CONFIG.GOOGLE_APPS_SCRIPT_URL);
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        state.shayariList = data;
      } else {
        state.shayariList = INITIAL_MOCK_SHAYARI;
      }
    } catch (err) {
      console.warn("API load failed, fallback to initial dataset.", err);
      showToast("Connected to local backup dataset", "info");
      state.shayariList = INITIAL_MOCK_SHAYARI;
    }
  } else {
    // Default local storage/seed mock
    const stored = localStorage.getItem("ehsaas_local_db");
    state.shayariList = stored ? JSON.parse(stored) : INITIAL_MOCK_SHAYARI;
  }

  showLoading(false);
  applyFilters();
  updateHeroBanner();
}

function saveLocalDb() {
  localStorage.setItem("ehsaas_local_db", JSON.stringify(state.shayariList));
}

// Render Category Tabs Pill Bar
function renderCategoryTabs() {
  const container = document.getElementById("categoryTabs");
  if (!container) return;
  container.innerHTML = CATEGORIES.map(
    (cat) => `
                <button onclick="filterByCategory('${cat}')" 
                    class="category-tab px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${state.activeCategory === cat ? "bg-brand-600 text-white shadow-md shadow-brand-600/30" : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"}">
                    ${cat === "All" ? "✨ All Poetry" : "#" + cat}
                </button>
            `,
  ).join("");
}

// Filter & Search Engine
function applyFilters() {
  const langElem = document.getElementById("languageFilter");
  const sortElem = document.getElementById("sortFilter");

  const lang = langElem ? langElem.value : "ALL";
  const sort = sortElem ? sortElem.value : "latest";

  state.activeLanguage = lang;
  state.sortBy = sort;

  let result = [...state.shayariList];

  // Tab check: Home vs Bookmarks
  if (state.currentTab === "bookmarks") {
    result = result.filter((item) => state.bookmarks.includes(item.id));
  }

  // Category Filter
  if (state.activeCategory !== "All") {
    result = result.filter(
      (item) =>
        item.category &&
        item.category.toLowerCase() === state.activeCategory.toLowerCase(),
    );
  }

  // Language Filter
  if (state.activeLanguage !== "ALL") {
    result = result.filter(
      (item) =>
        item.language &&
        item.language.toLowerCase() === state.activeLanguage.toLowerCase(),
    );
  }

  // Search Query Filter
  if (state.searchQuery.trim() !== "") {
    const q = state.searchQuery.toLowerCase();
    result = result.filter(
      (item) =>
        item.content.toLowerCase().includes(q) ||
        (item.author && item.author.toLowerCase().includes(q)) ||
        (item.tags && item.tags.toLowerCase().includes(q)) ||
        (item.category && item.category.toLowerCase().includes(q)),
    );
  }

  // Sorting
  if (sort === "popular") {
    result.sort((a, b) => (b.likes || 0) - (a.likes || 0));
  } else if (sort === "oldest") {
    result.sort(
      (a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0),
    );
  } else {
    // Latest first
    result.sort(
      (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0),
    );
  }

  state.filteredList = result;
  state.currentPage = 1;
  renderGrid();
  renderActiveFilterBadges();
}

// Grid Renderer with Pagination
function renderGrid() {
  const container = document.getElementById("shayariGrid");
  const empty = document.getElementById("emptyState");
  const counter = document.getElementById("shayariCounter");
  const total = state.filteredList.length;

  if (counter)
    counter.innerText = `${total} ${total === 1 ? "Quote" : "Quotes"}`;

  if (total === 0) {
    if (container) container.innerHTML = "";
    if (empty) empty.classList.remove("hidden");
    const pagContainer = document.getElementById("paginationContainer");
    if (pagContainer) pagContainer.classList.add("hidden");
    return;
  } else {
    if (empty) empty.classList.add("hidden");
  }

  // Slice for pagination
  const start = (state.currentPage - 1) * state.pageSize;
  const end = start + state.pageSize;
  const pageItems = state.filteredList.slice(start, end);

  if (container)
    container.innerHTML = pageItems
      .map((item) => createCardHTML(item))
      .join("");
  updatePaginationControls();
}

// Get dynamic colorful background classes for light mode, dark card background for dark mode
function getCardTheme(category) {
  const cat = (category || "").toLowerCase();
  switch (cat) {
    case "love":
      return "bg-gradient-to-br from-rose-100/90 via-pink-50 to-red-100/70 border-rose-200/80 dark:from-slate-800/90 dark:via-slate-800/95 dark:to-slate-900 dark:border-slate-700/60";
    case "sad":
      return "bg-gradient-to-br from-blue-100/90 via-indigo-50 to-slate-100 border-blue-200/80 dark:from-slate-800/90 dark:via-slate-800/95 dark:to-slate-900 dark:border-slate-700/60";
    case "attitude":
      return "bg-gradient-to-br from-amber-100/90 via-orange-50 to-yellow-100/70 border-amber-200/80 dark:from-slate-800/90 dark:via-slate-800/95 dark:to-slate-900 dark:border-slate-700/60";
    case "life":
      return "bg-gradient-to-br from-emerald-100/90 via-teal-50 to-green-100/70 border-emerald-200/80 dark:from-slate-800/90 dark:via-slate-800/95 dark:to-slate-900 dark:border-slate-700/60";
    case "romantic":
      return "bg-gradient-to-br from-fuchsia-100/90 via-rose-50 to-purple-100/70 border-fuchsia-200/80 dark:from-slate-800/90 dark:via-slate-800/95 dark:to-slate-900 dark:border-slate-700/60";
    case "friendship":
      return "bg-gradient-to-br from-cyan-100/90 via-sky-50 to-blue-100/70 border-cyan-200/80 dark:from-slate-800/90 dark:via-slate-800/95 dark:to-slate-900 dark:border-slate-700/60";
    case "motivational":
      return "bg-gradient-to-br from-violet-100/90 via-purple-50 to-indigo-100/70 border-violet-200/80 dark:from-slate-800/90 dark:via-slate-800/95 dark:to-slate-900 dark:border-slate-700/60";
    default:
      return "bg-gradient-to-br from-rose-100/70 via-slate-50 to-pink-100/60 border-rose-200/70 dark:from-slate-800/90 dark:via-slate-800/95 dark:to-slate-900 dark:border-slate-700/60";
  }
}

function getCategoryBadgeClasses(category) {
  const cat = (category || "").toLowerCase();
  switch (cat) {
    case "love":
      return "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-900/60";
    case "sad":
      return "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-900/60";
    case "attitude":
      return "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-900/60";
    case "life":
      return "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-900/60";
    case "romantic":
      return "bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200 dark:bg-fuchsia-950/60 dark:text-fuchsia-300 dark:border-fuchsia-900/60";
    case "friendship":
      return "bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-950/60 dark:text-cyan-300 dark:border-cyan-900/60";
    case "motivational":
      return "bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-950/60 dark:text-violet-300 dark:border-violet-900/60";
    default:
      return "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700";
  }
}

// Single Card Component Builder
function createCardHTML(item) {
  const isLiked = state.likedIds.includes(item.id);
  const isBookmarked = state.bookmarks.includes(item.id);
  const formattedTags = item.tags
    ? item.tags
        .split(",")
        .map((t) => `#${t.trim()}`)
        .join(" ")
    : "";
  const themeClasses = getCardTheme(item.category);

  return `
                <div class="${themeClasses} rounded-3xl p-6 sm:p-7 border shadow-xl shadow-slate-200/50 dark:shadow-none flex flex-col justify-between hover:border-rose-400 dark:hover:border-rose-500/50 transition-all duration-300 group">
                    <div>
                        <!-- Top Meta -->
                        <div class="flex items-center justify-between mb-4">
                            <span class="px-3 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase border shadow-sm ${getCategoryBadgeClasses(item.category)}">
                                ${item.category || "General"}
                            </span>
                            <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                ${item.language || ""}
                            </span>
                        </div>

                        <!-- Main Shayari Text -->
                        <div onclick="openDetailModal('${item.id}')" class="cursor-pointer">
                            <p class="text-base sm:text-lg font-serif leading-relaxed text-slate-900 dark:text-slate-100 whitespace-pre-line mb-4 group-hover:text-brand-600 dark:group-hover:text-rose-300 transition-colors">
                                "${escapeHtml(item.content)}"
                            </p>
                        </div>
                    </div>

                    <div>
                        <!-- Poet Name & Tags -->
                        <div class="pt-3 border-t border-slate-300/40 dark:border-slate-700/50 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 mb-4">
                            <span class="font-semibold text-slate-800 dark:text-slate-300 flex items-center">
                                <i class="fa-solid fa-pen-nib text-brand-500 mr-1.5 text-[10px]"></i>
                                ${item.author || "Anonymous"}
                            </span>
                            <span class="truncate max-w-[120px] italic text-[11px] text-slate-500 dark:text-slate-400">${formattedTags}</span>
                        </div>

                        <!-- Card Action Toolbar -->
                        <div class="flex items-center justify-between bg-white/70 dark:bg-slate-900/60 backdrop-blur-sm p-2 rounded-2xl border border-white/60 dark:border-slate-700/40">
                            <div class="flex items-center space-x-1">
                                <!-- Like Button -->
                                <button onclick="toggleLike('${item.id}')" class="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-900/30 text-xs font-semibold transition-colors ${isLiked ? "text-rose-600 dark:text-rose-400" : "text-slate-600 dark:text-slate-400"}">
                                    <i class="${isLiked ? "fa-solid" : "fa-regular"} fa-heart text-sm text-rose-500"></i>
                                    <span>${item.likes || 0}</span>
                                </button>
                                
                                <!-- Bookmark Button -->
                                <button onclick="toggleBookmark('${item.id}')" class="p-2 rounded-xl hover:bg-slate-200/60 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors" title="Save Quote">
                                    <i class="${isBookmarked ? "fa-solid text-brand-600" : "fa-regular"} fa-bookmark"></i>
                                </button>
                            </div>

                            <div class="flex items-center space-x-1">
                                <!-- Copy Button -->
                                <button onclick="copyShayariById('${item.id}')" class="p-2 rounded-xl hover:bg-slate-200/60 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors" title="Copy Text">
                                    <i class="fa-regular fa-copy"></i>
                                </button>
                                
                                <!-- Share WhatsApp -->
                                <button onclick="shareWhatsApp('${encodeURIComponent(item.content)}', '${encodeURIComponent(item.author || "")}')" class="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center space-x-1 transition-colors">
                                    <i class="fa-brands fa-whatsapp text-sm"></i>
                                    <span>Share</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
}

// Interactive Handlers
function toggleLike(id) {
  const index = state.likedIds.indexOf(id);
  const item = state.shayariList.find((s) => s.id === id);

  if (!item) return;

  if (index === -1) {
    state.likedIds.push(id);
    item.likes = (item.likes || 0) + 1;
    showToast("Added to liked poetry ❤️", "success");
  } else {
    state.likedIds.splice(index, 1);
    item.likes = Math.max(0, (item.likes || 0) - 1);
  }

  localStorage.setItem("ehsaas_likes", JSON.stringify(state.likedIds));
  saveLocalDb();
  renderGrid();
}

function toggleBookmark(id) {
  const index = state.bookmarks.indexOf(id);
  if (index === -1) {
    state.bookmarks.push(id);
    showToast("Saved to your bookmarks collection", "success");
  } else {
    state.bookmarks.splice(index, 1);
    showToast("Removed from bookmarks", "info");
  }

  localStorage.setItem("ehsaas_bookmarks", JSON.stringify(state.bookmarks));
  updateBookmarkBadge();
  applyFilters();
}

function updateBookmarkBadge() {
  const badge = document.getElementById("bookmarkBadge");
  if (!badge) return;
  if (state.bookmarks.length > 0) {
    badge.innerText = state.bookmarks.length;
    badge.classList.remove("hidden");
  } else {
    badge.classList.add("hidden");
  }
}

function copyShayariById(id) {
  const item = state.shayariList.find((shayari) => shayari.id === id);
  if (!item) return;
  copyShayari(item.content, item.author || "");
}

async function copyShayari(content, author) {
  const formatted = `"${content}"\n\n— ${author || "Anonymous"}\nShared via Ehsaas App`;

  // Clipboard Copy Guard
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(formatted);
    } else {
      const textarea = document.createElement("textarea");
      textarea.value = formatted;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      textarea.remove();
    }
    showToast("Shayari copied to clipboard!", "success");
  } catch (error) {
    console.error("Unable to copy shayari.", error);
    showToast("Could not copy shayari", "error");
  }
}

function shareWhatsApp(content, author) {
  const decodedContent = decodeURIComponent(content);
  const decodedAuthor = decodeURIComponent(author);
  const text = encodeURIComponent(
    `"${decodedContent}"\n\n— *${decodedAuthor || "Anonymous"}*\n\n✨ Read more expressives on Ehsaas`,
  );
  window.open(`https://wa.me/?text=${text}`, "_blank", "noopener,noreferrer");
}

function getRandomShayari() {
  if (state.shayariList.length === 0) return;
  const randomItem =
    state.shayariList[Math.floor(Math.random() * state.shayariList.length)];
  openDetailModal(randomItem.id);
}

// Filtering Helpers
function filterByCategory(cat) {
  state.activeCategory = cat;
  renderCategoryTabs();
  applyFilters();

  const titleMap = {
    All: "Trending Poetry & Quotes",
    Love: "Love & Mohabbat Shayari",
    Sad: "Heartbroken & Sad Lines",
    Attitude: "Royal Attitude Shayari",
    Life: "Life Lessons & Thoughts",
    Romantic: "Romantic Expressive Poetry",
    Friendship: "Dosti & Yaari Quotes",
    Motivational: "Inspirational & Motivational Lines",
  };
  const sectionTitle = document.getElementById("sectionTitle");
  if (sectionTitle) {
    sectionTitle.innerText = titleMap[cat] || `${cat} Collection`;
  }
}

function handleSearch(event) {
  state.searchQuery = event.target.value;
  const desktopClear = document.getElementById("clearSearchBtnDesktop");
  if (desktopClear) {
    if (state.searchQuery) {
      desktopClear.classList.remove("hidden");
    } else {
      desktopClear.classList.add("hidden");
    }
  }
  applyFilters();
}

function clearSearch() {
  state.searchQuery = "";
  const searchDesktop = document.getElementById("searchInputDesktop");
  const searchMobile = document.getElementById("searchInputMobile");
  const desktopClear = document.getElementById("clearSearchBtnDesktop");
  if (searchDesktop) searchDesktop.value = "";
  if (searchMobile) searchMobile.value = "";
  if (desktopClear) desktopClear.classList.add("hidden");
  applyFilters();
}

function resetAllFilters() {
  state.activeCategory = "All";
  state.activeLanguage = "ALL";
  state.searchQuery = "";
  const langFilter = document.getElementById("languageFilter");
  const sortFilter = document.getElementById("sortFilter");
  const searchDesktop = document.getElementById("searchInputDesktop");
  const searchMobile = document.getElementById("searchInputMobile");

  if (langFilter) langFilter.value = "ALL";
  if (sortFilter) sortFilter.value = "latest";
  if (searchDesktop) searchDesktop.value = "";
  if (searchMobile) searchMobile.value = "";

  renderCategoryTabs();
  applyFilters();
}

function renderActiveFilterBadges() {
  const container = document.getElementById("activeFilterBadges");
  const bar = document.getElementById("activeFiltersBar");
  if (!container || !bar) return;

  let badges = [];

  if (state.activeCategory !== "All")
    badges.push(`Cat: ${state.activeCategory}`);
  if (state.activeLanguage !== "ALL")
    badges.push(`Lang: ${state.activeLanguage}`);
  if (state.searchQuery) badges.push(`Search: "${state.searchQuery}"`);

  if (badges.length > 0) {
    container.innerHTML = badges
      .map(
        (b) =>
          `<span class="bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-rose-300 px-2 py-0.5 rounded-md text-[10px] font-semibold">${b}</span>`,
      )
      .join("");
    bar.classList.remove("hidden");
  } else {
    bar.classList.add("hidden");
  }
}

// Tab Navigation (Home vs Saved)
function switchTab(tab) {
  state.currentTab = tab;
  document.querySelectorAll(".nav-btn").forEach((b) => {
    b.classList.remove(
      "bg-brand-50",
      "dark:bg-brand-900/30",
      "text-brand-600",
      "dark:text-rose-400",
    );
    b.classList.add("text-slate-600", "dark:text-slate-300");
  });

  const activeBtn = document.getElementById(`nav-${tab}`);
  if (activeBtn) {
    activeBtn.classList.add(
      "bg-brand-50",
      "dark:bg-brand-900/30",
      "text-brand-600",
      "dark:text-rose-400",
    );
  }

  const title = document.getElementById("sectionTitle");
  const subtitle = document.getElementById("sectionSubtitle");

  if (tab === "bookmarks") {
    if (title) title.innerText = "Your Saved Bookmarks";
    if (subtitle) subtitle.innerText = "Poetry and quotes you have bookmarked";
  } else {
    if (title) title.innerText = "Trending Poetry & Quotes";
    if (subtitle)
      subtitle.innerText = "Handpicked lines to touch your emotions";
  }

  applyFilters();
}

// Pagination Handler
function updatePaginationControls() {
  const container = document.getElementById("paginationContainer");
  if (!container) return;
  const totalPages = Math.ceil(state.filteredList.length / state.pageSize);

  if (totalPages <= 1) {
    container.classList.add("hidden");
    return;
  }

  container.classList.remove("hidden");
  const indicator = document.getElementById("pageIndicator");
  const prevBtn = document.getElementById("prevPageBtn");
  const nextBtn = document.getElementById("nextPageBtn");

  if (indicator)
    indicator.innerText = `Page ${state.currentPage} of ${totalPages}`;
  if (prevBtn) prevBtn.disabled = state.currentPage === 1;
  if (nextBtn) nextBtn.disabled = state.currentPage === totalPages;
}

function changePage(direction) {
  const totalPages = Math.ceil(state.filteredList.length / state.pageSize);
  const newPage = state.currentPage + direction;
  if (newPage >= 1 && newPage <= totalPages) {
    state.currentPage = newPage;
    renderGrid();
    window.scrollTo({ top: 400, behavior: "smooth" });
  }
}

// Hero Banner Refresh
function updateHeroBanner() {
  const featured = state.shayariList.filter((s) => s.featured);
  const display = document.getElementById("heroQuoteDisplay");
  if (featured.length > 0 && display) {
    const randomFeatured =
      featured[Math.floor(Math.random() * featured.length)];
    display.innerText = `"${randomFeatured.content}"`;
  }
}

// Detail Modal Handler
function openDetailModal(id) {
  const item = state.shayariList.find((s) => s.id === id);
  if (!item) return;

  const isLiked = state.likedIds.includes(item.id);
  const isBookmarked = state.bookmarks.includes(item.id);

  const content = document.getElementById("detailModalContent");
  if (content) {
    content.innerHTML = `
                    <div class="text-center py-4">
                        <span class="px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getCategoryBadgeClasses(item.category)} mb-6 inline-block">
                            ${item.category || "Shayari"}
                        </span>
                        <blockquote class="text-xl sm:text-2xl font-serif text-slate-900 dark:text-white leading-relaxed my-6 whitespace-pre-line">
                            "${escapeHtml(item.content)}"
                        </blockquote>
                        <p class="text-sm font-semibold text-slate-600 dark:text-slate-400 font-cinzel mb-2">
                            — ${item.author || "Anonymous"}
                        </p>
                        <p class="text-xs text-slate-400 italic mb-8">
                            ${
                              item.tags
                                ? item.tags
                                    .split(",")
                                    .map((t) => `#${t.trim()}`)
                                    .join(" ")
                                : ""
                            }
                        </p>

                        <div class="flex justify-center gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                            <button onclick="toggleLike('${item.id}'); openDetailModal('${item.id}')" class="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold flex items-center space-x-2 hover:bg-slate-100 dark:hover:bg-slate-800">
                                <i class="${isLiked ? "fa-solid" : "fa-regular"} fa-heart text-rose-500"></i>
                                <span>${item.likes || 0} Likes</span>
                            </button>
                            <button onclick="copyShayariById('${item.id}')" class="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold flex items-center space-x-2 hover:bg-slate-200 dark:hover:bg-slate-700">
                                <i class="fa-regular fa-copy"></i>
                                <span>Copy Quote</span>
                            </button>
                            <button onclick="shareWhatsApp('${encodeURIComponent(item.content)}', '${encodeURIComponent(item.author || "")}')" class="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold flex items-center space-x-2 hover:bg-emerald-700">
                                <i class="fa-brands fa-whatsapp"></i>
                                <span>WhatsApp</span>
                            </button>
                        </div>
                    </div>
                `;
  }
  const modal = document.getElementById("detailModal");
  if (modal) modal.classList.remove("hidden");
}

function closeDetailModal() {
  const modal = document.getElementById("detailModal");
  if (modal) modal.classList.add("hidden");
}

// ADMIN PANEL MANAGEMENT
function openAdminModal() {
  if (state.isAdmin) {
    openAdminPanel();
  } else {
    const modal = document.getElementById("adminAuthModal");
    if (modal) modal.classList.remove("hidden");
  }
}

function closeAdminAuthModal() {
  const modal = document.getElementById("adminAuthModal");
  if (modal) modal.classList.add("hidden");
}

function handleAdminLogin(e) {
  e.preventDefault();
  const pinInput = document.getElementById("adminPinInput");
  const pin = pinInput ? pinInput.value : "";
  if (pin === CONFIG.ADMIN_PIN) {
    state.isAdmin = true;
    closeAdminAuthModal();
    showToast("Admin access granted!", "success");
    openAdminPanel();
  } else {
    showToast("Invalid Admin PIN!", "error");
  }
}

function openAdminPanel() {
  const modal = document.getElementById("adminPanelModal");
  if (modal) modal.classList.remove("hidden");
  renderAdminTable();
}

function closeAdminPanel() {
  const modal = document.getElementById("adminPanelModal");
  if (modal) modal.classList.add("hidden");
}

function switchAdminTab(tab) {
  ["add", "manage", "setup"].forEach((t) => {
    const section = document.getElementById(`adminSection-${t}`);
    const tabBtn = document.getElementById(`adminTab-${t}`);
    if (section) section.classList.add("hidden");
    if (tabBtn) {
      tabBtn.classList.remove(
        "border-brand-600",
        "text-brand-600",
        "dark:text-rose-400",
      );
      tabBtn.classList.add("border-transparent", "text-slate-500");
    }
  });

  const targetSection = document.getElementById(`adminSection-${tab}`);
  const targetTab = document.getElementById(`adminTab-${tab}`);
  if (targetSection) targetSection.classList.remove("hidden");
  if (targetTab)
    targetTab.classList.add(
      "border-brand-600",
      "text-brand-600",
      "dark:text-rose-400",
    );
}

function renderAdminTable() {
  const tbody = document.getElementById("adminTableBody");
  const totalCount = document.getElementById("adminTotalCount");
  if (totalCount) totalCount.innerText = state.shayariList.length;

  if (tbody) {
    tbody.innerHTML = state.shayariList
      .map(
        (item) => `
                    <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td class="p-3 max-w-xs truncate font-serif">${escapeHtml(item.content)}</td>
                        <td class="p-3"><span class="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-bold">${item.category}</span></td>
                        <td class="p-3">${item.author || "Anon"}</td>
                        <td class="p-3">${item.language}</td>
                        <td class="p-3 text-center">${item.likes || 0}</td>
                        <td class="p-3 text-right space-x-2">
                            <button onclick="editShayari('${item.id}')" class="text-blue-500 hover:text-blue-700"><i class="fa-solid fa-pen-to-square"></i></button>
                            <button onclick="deleteShayari('${item.id}')" class="text-rose-500 hover:text-rose-700"><i class="fa-solid fa-trash"></i></button>
                        </td>
                    </tr>
                `,
      )
      .join("");
  }
}

async function handleShayariSubmit(e) {
  e.preventDefault();
  const formId = document.getElementById("adminFormId");
  const formContent = document.getElementById("adminFormContent");
  const formAuthor = document.getElementById("adminFormAuthor");
  const formCat = document.getElementById("adminFormCategory");
  const formLang = document.getElementById("adminFormLanguage");
  const formTags = document.getElementById("adminFormTags");
  const formFeat = document.getElementById("adminFormFeatured");

  const id = formId && formId.value ? formId.value : `sh-${Date.now()}`;
  const content = formContent ? formContent.value : "";
  const author =
    formAuthor && formAuthor.value ? formAuthor.value : "Anonymous";
  const category = formCat ? formCat.value : "Love";
  const language = formLang ? formLang.value : "Hindi";
  const tags = formTags ? formTags.value : "";
  const featured = formFeat ? formFeat.checked : false;

  const existingIndex = state.shayariList.findIndex((s) => s.id === id);
  const existingItem =
    existingIndex > -1 ? state.shayariList[existingIndex] : null;
  const newItem = {
    id,
    content,
    author,
    category,
    language,
    tags,
    likes: existingItem ? existingItem.likes || 0 : 0,
    shares: existingItem ? existingItem.shares || 0 : 0,
    featured,
    created_at: existingItem
      ? existingItem.created_at
      : new Date().toISOString(),
    status: "active",
  };

  if (existingIndex > -1) {
    state.shayariList[existingIndex] = {
      ...state.shayariList[existingIndex],
      ...newItem,
    };
    showToast("Shayari updated successfully!", "success");
  } else {
    state.shayariList.unshift(newItem);
    showToast("New Shayari published!", "success");
  }

  // Sync with Sheets backend if URL available
  if (CONFIG.GOOGLE_APPS_SCRIPT_URL) {
    try {
      await fetch(CONFIG.GOOGLE_APPS_SCRIPT_URL, {
        method: "POST",
        body: JSON.stringify({
          action: existingIndex > -1 ? "update" : "add",
          ...newItem,
        }),
      });
    } catch (err) {
      console.error("Cloud sync failed", err);
    }
  }

  saveLocalDb();
  resetAdminForm();
  applyFilters();
  renderAdminTable();
}

function editShayari(id) {
  const item = state.shayariList.find((s) => s.id === id);
  if (!item) return;

  const formId = document.getElementById("adminFormId");
  const formContent = document.getElementById("adminFormContent");
  const formAuthor = document.getElementById("adminFormAuthor");
  const formCat = document.getElementById("adminFormCategory");
  const formLang = document.getElementById("adminFormLanguage");
  const formTags = document.getElementById("adminFormTags");
  const formFeat = document.getElementById("adminFormFeatured");

  if (formId) formId.value = item.id;
  if (formContent) formContent.value = item.content;
  if (formAuthor) formAuthor.value = item.author || "";
  if (formCat) formCat.value = item.category || "Love";
  if (formLang) formLang.value = item.language || "Hindi";
  if (formTags) formTags.value = item.tags || "";
  if (formFeat) formFeat.checked = !!item.featured;

  switchAdminTab("add");
}

async function deleteShayari(id) {
  if (!confirm("Are you sure you want to delete this Shayari?")) return;

  if (CONFIG.GOOGLE_APPS_SCRIPT_URL) {
    try {
      const response = await fetch(CONFIG.GOOGLE_APPS_SCRIPT_URL, {
        method: "POST",
        body: JSON.stringify({ action: "delete", id }),
      });
      if (!response.ok)
        throw new Error(`Delete request failed: ${response.status}`);
    } catch (error) {
      console.error("Cloud delete failed", error);
      showToast("Could not delete Shayari from Sheets", "error");
      return;
    }
  }

  state.shayariList = state.shayariList.filter((s) => s.id !== id);
  saveLocalDb();
  applyFilters();
  renderAdminTable();
  showToast("Record archived/removed", "info");
}

function resetAdminForm() {
  const formId = document.getElementById("adminFormId");
  const formContent = document.getElementById("adminFormContent");
  const formAuthor = document.getElementById("adminFormAuthor");
  const formTags = document.getElementById("adminFormTags");
  const formFeat = document.getElementById("adminFormFeatured");

  if (formId) formId.value = "";
  if (formContent) formContent.value = "";
  if (formAuthor) formAuthor.value = "";
  if (formTags) formTags.value = "";
  if (formFeat) formFeat.checked = false;
}

// Mobile Menu Drawer Handler
function toggleMobileMenu() {
  const menu = document.getElementById("mobileMenu");
  const openIcon = document.getElementById("menuOpenIcon");
  const closeIcon = document.getElementById("menuCloseIcon");

  if (menu) menu.classList.toggle("hidden");
  if (openIcon) openIcon.classList.toggle("hidden");
  if (closeIcon) closeIcon.classList.toggle("hidden");
}

// UI Helpers
function showLoading(show) {
  const skeleton = document.getElementById("loadingSkeleton");
  const templateElem = document.getElementById("skeletonTemplate");
  const grid = document.getElementById("shayariGrid");

  if (!skeleton || !grid) return;

  if (show) {
    skeleton.innerHTML = "";
    if (templateElem && templateElem.content) {
      for (let i = 0; i < 6; i++) {
        skeleton.appendChild(templateElem.content.cloneNode(true));
      }
    } else {
      for (let i = 0; i < 6; i++) {
        const card = document.createElement("div");
        card.className =
          "bg-white dark:bg-slate-800/60 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 animate-pulse space-y-4";
        card.innerHTML = `
                            <div class="flex justify-between items-center">
                                <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-20"></div>
                                <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-12"></div>
                            </div>
                            <div class="space-y-2 py-4">
                                <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
                                <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/6"></div>
                                <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-4/6"></div>
                            </div>
                            <div class="flex justify-between items-center pt-2">
                                <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24"></div>
                                <div class="flex space-x-2">
                                    <div class="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                                    <div class="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                                </div>
                            </div>
                        `;
        skeleton.appendChild(card);
      }
    }
    skeleton.classList.remove("hidden");
    grid.classList.add("hidden");
  } else {
    skeleton.classList.add("hidden");
    grid.classList.remove("hidden");
  }
}

function showToast(message, type = "info") {
  const container = document.getElementById("toastContainer");
  if (!container) return;
  const toast = document.createElement("div");

  const bgClass =
    type === "success"
      ? "bg-emerald-600"
      : type === "error"
        ? "bg-rose-600"
        : "bg-slate-800";

  toast.className = `${bgClass} text-white px-4 py-3 rounded-2xl shadow-xl text-xs font-semibold flex items-center space-x-2 transition-all transform translate-y-2 opacity-0 pointer-events-auto`;
  toast.innerHTML = `
                <i class="fa-solid ${type === "success" ? "fa-circle-check" : type === "error" ? "fa-circle-exclamation" : "fa-circle-info"} text-sm"></i>
                <span>${message}</span>
            `;

  container.appendChild(toast);

  // Animate In
  setTimeout(() => {
    toast.classList.remove("translate-y-2", "opacity-0");
  }, 10);

  // Animate Out & Remove
  setTimeout(() => {
    toast.classList.add("opacity-0", "translate-y-2");
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function escapeHtml(text) {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
