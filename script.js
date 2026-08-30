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

// Keep the bundled Hindi seed data as Unicode. This also repairs seed records
// that were previously saved to a visitor's browser with mojibake characters.
const UTF8_SEED_CONTENT = {
  "sh-1":
    "कुछ तबीयत ही इन दिनों उदास है ग़ालिब,\nवरना दिल बहलाने के बहाने तो बहुतायत में थे...",
  "sh-2": "तुम मेरे पास होते हो गोया,\nजब कोई दूसरा नहीं होता।",
  "sh-3":
    "उसकी आँखों में नज़र आता है सारा जहाँ,\nऔर एक हम हैं कि उस शख़्स से आगे न गए।",
  "sh-4": "हसरतों के दिए बुझा दो अब,\nरात गहरी है सो जाओ अब।",
  "sh-5":
    "मेरी खामोशी को कमजोरी मत समझना,\nसमुंदर जब शांत होता है तो तूफ़ान की तैयारी होती है।",
};

INITIAL_MOCK_SHAYARI.forEach((item) => {
  if (UTF8_SEED_CONTENT[item.id]) item.content = UTF8_SEED_CONTENT[item.id];
});

function repairStoredSeedEncoding(items) {
  if (!Array.isArray(items)) return items;
  let repaired = false;
  items.forEach((item) => {
    if (item && UTF8_SEED_CONTENT[item.id] && /[à¤]/.test(item.content || "")) {
      item.content = UTF8_SEED_CONTENT[item.id];
      repaired = true;
    }
  });
  if (repaired) localStorage.setItem("ehsaas_local_db", JSON.stringify(items));
  return items;
}

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
  recentlyViewed: JSON.parse(
    localStorage.getItem("ehsaas_recently_viewed") || "[]",
  ),
  currentPage: 1,
  pageSize: CONFIG.DEFAULT_PAGE_SIZE,
  isAdmin: false,
};

let imageShareState = { item: null, template: "midnight" };
let isLikeSyncInProgress = false;
let pendingLikeOperations = JSON.parse(
  localStorage.getItem("ehsaas_pending_like_operations") || "[]",
);

// App Initialization
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  renderCategoryTabs();
  fetchShayariData();
  updateBookmarkBadge();

  [
    "detailModal",
    "imageShareModal",
    "adminAuthModal",
    "adminPanelModal",
  ].forEach((id) => {
    const modal = document.getElementById(id);
    modal?.addEventListener("click", (event) => {
      if (event.target !== modal) return;
      if (id === "detailModal") closeDetailModal();
      else if (id === "imageShareModal") closeImageShareModal();
      else if (id === "adminAuthModal") closeAdminAuthModal();
      else closeAdminPanel();
    });
  });
});

document.addEventListener("keydown", (event) => {
  const visibleModal = [
    "imageShareModal",
    "detailModal",
    "adminPanelModal",
    "adminAuthModal",
  ]
    .map((id) => document.getElementById(id))
    .find((modal) => modal && !modal.classList.contains("hidden"));
  if (!visibleModal) return;
  if (event.key === "Escape") {
    event.preventDefault();
    if (visibleModal.id === "imageShareModal") closeImageShareModal();
    else if (visibleModal.id === "detailModal") closeDetailModal();
    else if (visibleModal.id === "adminPanelModal") closeAdminPanel();
    else closeAdminAuthModal();
  }
  if (event.key === "Tab") trapModalFocus(event, visibleModal);
});

window.addEventListener("online", flushPendingLikeSync);

function focusModal(modal) {
  setTimeout(
    () =>
      modal
        ?.querySelector(
          "button, input, select, textarea, [tabindex]:not([tabindex='-1'])",
        )
        ?.focus(),
    0,
  );
}

function trapModalFocus(event, modal) {
  const focusable = [
    ...modal.querySelectorAll(
      "button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])",
    ),
  ];
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

// Theme Setup
function initTheme() {
  document.documentElement.classList.add("dark");
  localStorage.theme = "dark";
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
    state.shayariList = stored
      ? repairStoredSeedEncoding(JSON.parse(stored))
      : INITIAL_MOCK_SHAYARI;
  }

  showLoading(false);
  applyFilters();
  updateHeroBanner();
  renderRecentlyViewed();
  flushPendingLikeSync();
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

  const themes = {
    love: `
      bg-[radial-gradient(circle_at_top_right,rgba(244,63,94,0.18),transparent_45%),linear-gradient(135deg,#1e0b13,#3b1727,#080b12)]
      border-rose-900/60
      shadow-[0_10px_40px_rgba(244,63,94,0.10)]
    `,

    sad: `
      bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.16),transparent_45%),linear-gradient(135deg,#071426,#17233b,#080b12)]
      border-blue-900/60
      shadow-[0_10px_40px_rgba(59,130,246,0.08)]
    `,

    attitude: `
      bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.18),transparent_45%),linear-gradient(135deg,#1c1205,#3b2814,#080b12)]
      border-amber-900/60
      shadow-[0_10px_40px_rgba(245,158,11,0.10)]
    `,

    life: `
      bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.16),transparent_45%),linear-gradient(135deg,#061b17,#12352f,#080b12)]
      border-emerald-900/60
      shadow-[0_10px_40px_rgba(16,185,129,0.08)]
    `,

    romantic: `
      bg-[radial-gradient(circle_at_top_right,rgba(217,70,239,0.18),transparent_45%),linear-gradient(135deg,#1b071c,#351735,#080b12)]
      border-fuchsia-900/60
      shadow-[0_10px_40px_rgba(217,70,239,0.10)]
    `,

    friendship: `
      bg-[radial-gradient(circle_at_top_right,rgba(6,182,212,0.16),transparent_45%),linear-gradient(135deg,#061a20,#12333b,#080b12)]
      border-cyan-900/60
      shadow-[0_10px_40px_rgba(6,182,212,0.08)]
    `,

    motivational: `
      bg-[radial-gradient(circle_at_top_right,rgba(139,92,246,0.18),transparent_45%),linear-gradient(135deg,#12091f,#261942,#080b12)]
      border-violet-900/60
      shadow-[0_10px_40px_rgba(139,92,246,0.10)]
    `,
  };

  return (
    themes[cat] ||
    `
    bg-[radial-gradient(circle_at_top_right,rgba(244,63,94,0.12),transparent_45%),linear-gradient(135deg,#111118,#211b2b,#080b12)]
    border-slate-700/60
    shadow-[0_10px_40px_rgba(148,163,184,0.06)]
  `
  );
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

  // ========== FIXED READ MORE LOGIC ==========
  const content = item.content || "";
  const lines = content.split("\n");
  
  // CRITICAL: Check if content actually exceeds the clamp limit
  // We need to check both: 
  // 1. More than 7 actual lines
  // 2. Any line longer than the character limit per line on the smallest screen
  
  // Mobile-first check (35 chars per line on small screens)
  const MAX_VISIBLE_LINES = 7;
  const CHARS_PER_LINE_MOBILE = 35;
  
  let totalVisualLines = 0;
  let exceedsClamp = false;
  
  for (let line of lines) {
    if (line.length === 0) {
      totalVisualLines += 1; // Empty line counts as 1
    } else {
      // Calculate how many visual lines this text line will take
      const visualLinesForThisLine = Math.ceil(line.length / CHARS_PER_LINE_MOBILE);
      totalVisualLines += visualLinesForThisLine;
    }
    
    // Stop counting if we already exceed 7 lines
    if (totalVisualLines > MAX_VISIBLE_LINES) {
      exceedsClamp = true;
      break;
    }
  }
  
  // Additional check: if total lines > 7
  if (lines.length > MAX_VISIBLE_LINES) {
    exceedsClamp = true;
  }
  
  // Check if content is long enough to wrap
  const charCount = content.replace(/\n/g, "").length;
  if (charCount > 250) { // 250 characters is roughly 7 lines on mobile
    exceedsClamp = true;
  }
  
  // Show "Read more" ONLY if content exceeds clamp limit
  const showReadMore = exceedsClamp;

  // Debug (remove in production)
  if (showReadMore) {
    console.debug('Content exceeds clamp:', {
      id: item.id,
      totalVisualLines,
      actualLines: lines.length,
      charCount,
      contentPreview: content.substring(0, 50) + '...'
    });
  }

  return `
    <div class="${themeClasses} min-h-[390px] rounded-3xl p-6 sm:p-7 border shadow-xl shadow-slate-200/50 dark:shadow-none flex flex-col justify-between hover:border-rose-400 dark:hover:border-rose-500/50 transition-all duration-300 group">
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
          <p class="text-base sm:text-lg font-serif leading-relaxed text-slate-900 dark:text-slate-100 whitespace-pre-line ${
            showReadMore ? 'line-clamp-5' : ''
          } mb-2 group-hover:text-brand-600 dark:group-hover:text-rose-300 transition-colors">
            "${escapeHtml(content)}"
          </p>
          ${
            showReadMore 
              ? `<span class="inline-flex items-center text-xs font-bold text-brand-600 dark:text-rose-300 hover:text-brand-700 dark:hover:text-rose-200 transition-colors">
                   Read full quote <i class="fa-solid fa-arrow-right ml-1.5 text-[10px]"></i>
                 </span>` 
              : ""
          }
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
        <div class="flex items-center justify-between dark:bg-slate-900/20 backdrop-blur-sm p-2 rounded-2xl border border-white/20 dark:border-slate-700/40">
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
            <!-- Share WhatsApp -->
            <button onclick="shareWhatsApp('${encodeURIComponent(content)}', '${encodeURIComponent(item.author || "")}')" class="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center space-x-1 transition-colors">
              <i class="fa-brands fa-whatsapp text-sm"></i>
              <span>Share</span>
            </button>
            
            <details class="relative sm:hidden">
              <summary class="list-none p-2 rounded-xl hover:bg-slate-200/60 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 cursor-pointer" aria-label="More quote actions">
                <i class="fa-solid fa-ellipsis"></i>
              </summary>
              <div class="absolute right-0 bottom-10 z-10 w-36 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl p-1.5">
                <button onclick="copyShayariById('${item.id}')" class="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-700">
                  <i class="fa-regular fa-copy mr-2"></i>Copy text
                </button>
                <button onclick="openImageShareModal('${item.id}')" class="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-700">
                  <i class="fa-solid fa-image mr-2"></i>Share image
                </button>
              </div>
            </details>
            
            <button onclick="copyShayariById('${item.id}')" class="hidden sm:block p-2 rounded-xl hover:bg-slate-200/60 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors" title="Copy Text">
              <i class="fa-regular fa-copy"></i>
            </button>
            <button onclick="openImageShareModal('${item.id}')" class="hidden sm:block p-2 rounded-xl hover:bg-brand-50 dark:hover:bg-rose-900/30 text-brand-600 dark:text-rose-300 transition-colors" title="Create share image" aria-label="Create share image">
              <i class="fa-solid fa-image"></i>
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
  let delta;

  if (index === -1) {
    state.likedIds.push(id);
    item.likes = (item.likes || 0) + 1;
    delta = 1;
    showToast("Added to liked poetry ❤️", "success");
  } else {
    state.likedIds.splice(index, 1);
    item.likes = Math.max(0, (item.likes || 0) - 1);
    delta = -1;
  }

  localStorage.setItem("ehsaas_likes", JSON.stringify(state.likedIds));
  saveLocalDb();
  renderGrid();
  queueLikeSync(id, delta);
}

function queueLikeSync(id, delta) {
  if (!CONFIG.GOOGLE_APPS_SCRIPT_URL) return;
  pendingLikeOperations.push({ id, delta });
  localStorage.setItem(
    "ehsaas_pending_like_operations",
    JSON.stringify(pendingLikeOperations),
  );
  flushPendingLikeSync();
}

async function flushPendingLikeSync() {
  if (
    isLikeSyncInProgress ||
    !CONFIG.GOOGLE_APPS_SCRIPT_URL ||
    !pendingLikeOperations.length
  )
    return;
  isLikeSyncInProgress = true;
  try {
    while (pendingLikeOperations.length) {
      const operation = pendingLikeOperations[0];
      const response = await fetch(CONFIG.GOOGLE_APPS_SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ action: "like", ...operation }),
      });
      if (!response.ok) throw new Error(`Like sync failed: ${response.status}`);
      const result = await response.json();
      if (!Number.isFinite(Number(result.likes))) {
        throw new Error("Sheet endpoint does not support the like action yet");
      }
      pendingLikeOperations.shift();
      localStorage.setItem(
        "ehsaas_pending_like_operations",
        JSON.stringify(pendingLikeOperations),
      );
      const item = state.shayariList.find(
        (shayari) => shayari.id === operation.id,
      );
      if (item) {
        const queuedDelta = pendingLikeOperations
          .filter((queued) => queued.id === operation.id)
          .reduce((total, queued) => total + queued.delta, 0);
        item.likes = Math.max(0, Number(result.likes) + queuedDelta);
      }
      renderGrid();
    }
  } catch (error) {
    console.warn("Likes will be retried when the app reconnects.", error);
    const message = String(error?.message || "");
    showToast(
      message.includes("does not support the like action")
        ? "Sheets needs the new like handler — paste it and redeploy."
        : "Like saved locally — it will sync to Sheets when online.",
      "info",
    );
  } finally {
    isLikeSyncInProgress = false;
  }
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

function openImageShareModal(id) {
  const item = state.shayariList.find((shayari) => shayari.id === id);
  const modal = document.getElementById("imageShareModal");
  if (!item || !modal) return;
  imageShareState = { item, template: "midnight" };
  modal.classList.remove("hidden");
  renderImageSharePreview();
  focusModal(modal);
}

function closeImageShareModal() {
  document.getElementById("imageShareModal")?.classList.add("hidden");
}

function selectImageTemplate(template) {
  imageShareState.template = template;
  document.querySelectorAll("[data-image-template]").forEach((button) => {
    button.classList.toggle(
      "ring-2",
      button.dataset.imageTemplate === template,
    );
    button.classList.toggle(
      "ring-brand-500",
      button.dataset.imageTemplate === template,
    );
  });
  renderImageSharePreview();
}

function wrapCanvasText(context, text, maxWidth) {
  const lines = [];
  text.split("\n").forEach((paragraph) => {
    const words = paragraph
      .trim()
      .split(/\s+/)
      .flatMap((word) => {
        if (context.measureText(word).width <= maxWidth) return [word];
        const pieces = [];
        let piece = "";
        Array.from(word).forEach((character) => {
          if (
            context.measureText(piece + character).width > maxWidth &&
            piece
          ) {
            pieces.push(piece);
            piece = character;
          } else piece += character;
        });
        if (piece) pieces.push(piece);
        return pieces;
      });
    let line = "";
    words.forEach((word) => {
      const candidate = line ? `${line} ${word}` : word;
      if (context.measureText(candidate).width > maxWidth && line) {
        lines.push(line);
        line = word;
      } else line = candidate;
    });
    if (line) lines.push(line);
    if (!paragraph.trim()) lines.push("");
  });
  return lines;
}

function drawRoundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function createShareCanvas() {
  const { item, template } = imageShareState;
  if (!item) return null;
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1080;
  const ctx = canvas.getContext("2d");
  const themes = {
    midnight: ["#10172e", "#353b83", "#e57b93"],
    rose: ["#fff0f4", "#f5b7c9", "#8e2447"],
    ivory: ["#f9f1e4", "#e1bd80", "#513523"],
    forest: ["#083b3a", "#1a766a", "#f4d58d"],
  };
  const [start, end, accent] = themes[template] || themes.midnight;
  const gradient = ctx.createLinearGradient(0, 0, 1080, 1080);
  gradient.addColorStop(0, start);
  gradient.addColorStop(1, end);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1080, 1080);
  ctx.globalAlpha = 0.16;
  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.arc(930, 160, 280, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(130, 970, 350, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  const darkTemplate = template === "midnight" || template === "forest";
  const textColor = darkTemplate ? "#ffffff" : "#2b1b20";
  ctx.strokeStyle = darkTemplate
    ? "rgba(255,255,255,.25)"
    : "rgba(81,53,35,.18)";
  ctx.lineWidth = 3;
  ctx.strokeRect(55, 55, 970, 970);
  ctx.fillStyle = accent;
  ctx.font = '700 28px "Cinzel", Georgia, serif';
  ctx.letterSpacing = "4px";
  ctx.fillText((item.category || "EHSAAS").toUpperCase(), 105, 130);
  ctx.letterSpacing = "0px";
  ctx.fillStyle = textColor;
  ctx.font = 'italic 150px "Rozha One", Georgia, serif';
  ctx.fillText("“", 105, 325);
  let fontSize = 62;
  let lines;
  let lineHeight;
  // Keep the quote inside this safe area so it can never overlap the author bar.
  const textAreaHeight = 430;
  do {
    ctx.font = `500 ${fontSize}px "Rozha One", Georgia, serif`;
    lines = wrapCanvasText(ctx, item.content, 820);
    lineHeight = Math.round(fontSize * 1.34);
    if (lines.length * lineHeight <= textAreaHeight || fontSize <= 10) break;
    fontSize -= 2;
  } while (fontSize >= 10);
  ctx.font = `500 ${fontSize}px "Rozha One", Georgia, serif`;
  ctx.fillStyle = textColor;
  ctx.textAlign = "center";
  let y = 520 - ((lines.length - 1) * lineHeight) / 2;
  lines.forEach((line) => {
    ctx.fillText(line, 540, y);
    y += lineHeight;
  });
  ctx.textAlign = "left";
  ctx.fillStyle = accent;
  ctx.fillRect(420, 780, 240, 4);
  // Hide the former portrait attribution (outside the square composition).
  ctx.globalAlpha = 0;
  ctx.fillStyle = textColor;
  ctx.textAlign = "center";
  ctx.font = "600 32px Georgia, serif";
  ctx.fillText(`— ${item.author || "Anonymous"}`, 540, 1045);
  ctx.globalAlpha = 1;
  ctx.textAlign = "left";
  // Square-card attribution, kept below the quote safe area.
  ctx.save();
  ctx.textAlign = "center";
  ctx.fillStyle = textColor;
  ctx.font = '600 34px "Cinzel", Georgia, serif';
  ctx.fillText(item.author || "Anonymous", 540, 855);

  // GitHub Chip Badge
  ctx.font = '600 20px "Plus Jakarta Sans", Arial, sans-serif';
  const chipText = "github.com/ranjan-builds";
  const chipMetrics = ctx.measureText(chipText);
  const chipWidth = chipMetrics.width + 40;
  const chipHeight = 44;
  const chipX = 540 - chipWidth / 2;
  const chipY = 900;

  // Draw rounded chip background
  ctx.globalAlpha = 0.15;
  ctx.fillStyle = accent;
  drawRoundedRect(ctx, chipX, chipY, chipWidth, chipHeight, 22);
  ctx.fill();

  // Draw chip border
  ctx.globalAlpha = 0.35;
  ctx.strokeStyle = accent;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Draw GitHub icon text
  ctx.globalAlpha = 0.9;
  ctx.fillStyle = accent;
  ctx.font = "600 18px Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("⭐ " + chipText, 540, chipY + 28);

  ctx.globalAlpha = 0.8;
  ctx.fillStyle = textColor;
  ctx.font = '600 16px "Plus Jakarta Sans", Arial, sans-serif';
  ctx.fillText("EHSAAS  |  SHAYARI & QUOTES", 540, 970);
  ctx.restore();
  return canvas;
}

function renderImageSharePreview() {
  const preview = document.getElementById("imageSharePreview");
  const canvas = createShareCanvas();
  if (!preview || !canvas) return;
  preview.src = canvas.toDataURL("image/png");
}

function downloadShareImage() {
  const canvas = createShareCanvas();
  if (!canvas) return;
  const link = document.createElement("a");
  link.download = `ehsaas-instagram-${imageShareState.item.id}-${imageShareState.template}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
  showToast("High-quality image downloaded!", "success");
}

async function copyShareImage() {
  const canvas = createShareCanvas();
  if (!canvas) return;

  const blob = await new Promise((resolve) =>
    canvas.toBlob(resolve, "image/png"),
  );
  if (!blob || !navigator.clipboard?.write || !window.ClipboardItem) {
    downloadShareImage();
    showToast(
      "Image copying is unavailable here, so it was downloaded instead.",
      "info",
    );
    return;
  }

  try {
    await navigator.clipboard.write([
      new window.ClipboardItem({ "image/png": blob }),
    ]);
    showToast(
      "Quote image copied — paste it into Instagram or Stories!",
      "success",
    );
  } catch (error) {
    console.warn("Unable to copy quote image.", error);
    downloadShareImage();
    showToast(
      "Could not copy the image, so it was downloaded instead.",
      "info",
    );
  }
}

async function shareImageFile() {
  const canvas = createShareCanvas();
  if (!canvas) return;
  const blob = await new Promise((resolve) =>
    canvas.toBlob(resolve, "image/png"),
  );
  const file = new File([blob], "ehsaas-shayari.png", { type: "image/png" });
  if (navigator.share && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ title: "Ehsaas Shayari", files: [file] });
    } catch (error) {
      if (error.name !== "AbortError") downloadShareImage();
    }
  } else downloadShareImage();
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
    badges.push({ label: `Cat: ${state.activeCategory}`, clear: "category" });
  if (state.activeLanguage !== "ALL")
    badges.push({ label: `Lang: ${state.activeLanguage}`, clear: "language" });
  if (state.searchQuery)
    badges.push({ label: `Search: "${state.searchQuery}"`, clear: "search" });

  if (badges.length > 0) {
    container.innerHTML = badges
      .map(
        (badge) =>
          `<button onclick="clearFilter('${badge.clear}')" class="bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-rose-300 px-2 py-1 rounded-md text-[10px] font-semibold hover:bg-brand-200 dark:hover:bg-brand-900/70">${escapeHtml(badge.label)} <i class="fa-solid fa-xmark ml-1"></i></button>`,
      )
      .join("");
    bar.classList.remove("hidden");
  } else {
    bar.classList.add("hidden");
  }
}

function clearFilter(filter) {
  if (filter === "category") state.activeCategory = "All";
  if (filter === "language") {
    state.activeLanguage = "ALL";
    const language = document.getElementById("languageFilter");
    if (language) language.value = "ALL";
  }
  if (filter === "search") clearSearch();
  renderCategoryTabs();
  applyFilters();
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
  recordRecentlyViewed(item.id);

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
  if (modal) {
    modal.classList.remove("hidden");
    focusModal(modal);
  }
}

function closeDetailModal() {
  const modal = document.getElementById("detailModal");
  if (modal) modal.classList.add("hidden");
}

function recordRecentlyViewed(id) {
  state.recentlyViewed = [
    id,
    ...state.recentlyViewed.filter((itemId) => itemId !== id),
  ].slice(0, 3);
  localStorage.setItem(
    "ehsaas_recently_viewed",
    JSON.stringify(state.recentlyViewed),
  );
  renderRecentlyViewed();
}

function clearRecentlyViewed() {
  state.recentlyViewed = [];
  localStorage.removeItem("ehsaas_recently_viewed");
  renderRecentlyViewed();
}

function renderRecentlyViewed() {
  const section = document.getElementById("recentlyViewedSection");
  const container = document.getElementById("recentlyViewedGrid");
  if (!section || !container) return;
  const recentItems = state.recentlyViewed
    .map((id) => state.shayariList.find((item) => item.id === id))
    .filter(Boolean);
  if (!recentItems.length) {
    section.classList.add("hidden");
    return;
  }
  container.innerHTML = recentItems
    .map(
      (item) => `
    <button onclick="openDetailModal('${item.id}')" class="text-left p-4 rounded-2xl bg-white dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 hover:border-brand-400 transition-colors">
      <p class="font-serif text-sm leading-relaxed text-slate-800 dark:text-slate-100 line-clamp-2">“${escapeHtml(item.content)}”</p>
      <span class="block mt-2 text-xs font-semibold text-brand-600 dark:text-rose-300">${escapeHtml(item.author || "Anonymous")}</span>
    </button>`,
    )
    .join("");
  section.classList.remove("hidden");
}

// ADMIN PANEL MANAGEMENT
function openAdminModal() {
  if (state.isAdmin) {
    openAdminPanel();
  } else {
    const modal = document.getElementById("adminAuthModal");
    if (modal) {
      modal.classList.remove("hidden");
      focusModal(modal);
    }
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
  if (modal) {
    modal.classList.remove("hidden");
    focusModal(modal);
  }
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
          "min-h-[390px] bg-white dark:bg-slate-800/60 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 animate-pulse space-y-4";
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
