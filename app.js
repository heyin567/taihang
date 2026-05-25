/* ============================================================
   行山志 · Application Logic
   ============================================================ */

const state = {
    region: "all",
    difficulty: "all",
    duration: "all",
    keyword: "",
    compare: new Set(),
    visited: STORE.getVisited()
};

const $ = id => document.getElementById(id);
const grid = $("routeGrid");
const modal = $("routeModal");
const modalBody = $("modalBody");
const searchInput = $("searchInput");

/* ============================================================
   工具
   ============================================================ */
function mulberry32(a) {
    return function () {
        a |= 0; a = a + 0x6D2B79F5 | 0;
        let t = a;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
}

function getSeason() {
    const m = new Date().getMonth() + 1;
    if (m >= 3 && m <= 5) return { key: "spring", label: "春日", verse: "踏花归去马蹄香" };
    if (m >= 6 && m <= 8) return { key: "summer", label: "盛夏", verse: "山深疑无暑,水冷便如秋" };
    if (m >= 9 && m <= 11) return { key: "autumn", label: "深秋", verse: "万山红遍,层林尽染" };
    return { key: "winter", label: "寒冬", verse: "千山鸟飞绝,万径人踪灭" };
}

function persistVisited() {
    STORE.setVisited(state.visited);
}

function toast(msg) {
    let el = $("toast");
    if (!el) {
        el = document.createElement("div");
        el.id = "toast";
        el.className = "toast";
        document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toast._t);
    toast._t = setTimeout(() => el.classList.remove("show"), 2200);
}

/* ============================================================
   SVG 山景图(路线主图)
   ============================================================ */
function buildLandscape(theme, seed) {
    const W = 400, H = 220;
    const rand = mulberry32(seed);
    const sun = theme.sun === "sunset" ? "#ffb84d" : theme.sun === "cool" ? "#fff5e6" : "#ffd966";

    function mountainPath(baseY, amp, count, fill) {
        let d = `M 0 ${H} L 0 ${baseY}`;
        const step = W / count;
        for (let i = 0; i <= count; i++) {
            const x = i * step;
            const y = baseY - Math.abs(Math.sin(i * 1.3 + seed) * amp) - rand() * amp * 0.4;
            d += ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
        }
        d += ` L ${W} ${H} Z`;
        return `<path d="${d}" fill="${fill}"/>`;
    }

    let accent = "";
    const a = theme.accent;
    if (a === "temple") {
        accent = `<g transform="translate(290 130)">
            <path d="M 0 30 L 20 20 L 40 30 L 40 55 L 0 55 Z" fill="#8b4513"/>
            <path d="M -5 30 L 20 12 L 45 30 L 40 30 L 20 18 L 0 30 Z" fill="#5a2d0c"/>
            <rect x="16" y="40" width="8" height="15" fill="#3a1d08"/></g>`;
    } else if (a === "snow") {
        accent = `<path d="M 130 100 L 200 60 L 270 100 L 230 90 L 200 75 L 170 90 Z" fill="#ffffff" opacity="0.85"/>
            <path d="M 60 130 L 110 95 L 160 130 L 130 120 L 110 108 L 90 120 Z" fill="#ffffff" opacity="0.7"/>`;
    } else if (a === "cliff") {
        accent = `<rect x="50" y="100" width="300" height="6" fill="#7a4a30" opacity="0.6"/>
            <rect x="40" y="130" width="320" height="6" fill="#6a3a25" opacity="0.6"/>
            <rect x="30" y="160" width="340" height="6" fill="#5a2e1c" opacity="0.6"/>`;
    } else if (a === "maple") {
        for (let i = 0; i < 18; i++) {
            const x = 30 + rand() * 340;
            const y = 90 + rand() * 90;
            const r = 4 + rand() * 5;
            const c = ["#d9534f", "#e8854a", "#f0a04a", "#c9402a"][Math.floor(rand() * 4)];
            accent += `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${r.toFixed(1)}" fill="${c}" opacity="0.85"/>`;
        }
    } else if (a === "five") {
        for (let i = 0; i < 5; i++) {
            const x = 50 + i * 65;
            const h = 50 + (i === 2 ? 30 : 0) + rand() * 15;
            accent += `<path d="M ${x} 130 L ${x+20} ${130-h} L ${x+40} 130 Z" fill="${theme.mid}" opacity="0.9"/>`;
        }
    } else if (a === "lake") {
        accent = `<ellipse cx="200" cy="195" rx="180" ry="14" fill="#7eb6c4" opacity="0.6"/>
            <ellipse cx="200" cy="195" rx="160" ry="8" fill="#a8d4dc" opacity="0.5"/>`;
    } else if (a === "waterfall") {
        accent = `<rect x="180" y="105" width="14" height="60" fill="#e8f4fa" opacity="0.85"/>
            <rect x="183" y="105" width="8" height="60" fill="#ffffff" opacity="0.7"/>
            <ellipse cx="187" cy="170" rx="22" ry="5" fill="#a8d4dc" opacity="0.7"/>`;
    } else if (a === "flat") {
        accent = `<rect x="100" y="110" width="220" height="3" fill="#3a6e50" opacity="0.5"/>
            <path d="M 150 110 L 158 95 L 170 110 Z" fill="${theme.mid}"/>
            <path d="M 220 110 L 232 90 L 248 110 Z" fill="${theme.mid}"/>`;
    } else if (a === "ridge") {
        accent = `<path d="M 0 130 L 60 110 L 120 125 L 180 100 L 240 120 L 300 95 L 360 115 L 400 105 L 400 220 L 0 220 Z" fill="${theme.near}" opacity="0.5"/>`;
    }

    let trees = "";
    for (let i = 0; i < 14; i++) {
        const x = rand() * W;
        const y = 175 + rand() * 35;
        const sz = 4 + rand() * 6;
        trees += `<path d="M ${x} ${y} L ${x-sz} ${y+sz*1.5} L ${x+sz} ${y+sz*1.5} Z" fill="${theme.near}" opacity="0.7"/>`;
    }

    return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" style="width:100%;height:100%;display:block;">
        <defs><linearGradient id="sky${seed}" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stop-color="${theme.sky[0]}"/>
            <stop offset="100%" stop-color="${theme.sky[1]}"/></linearGradient></defs>
        <rect width="${W}" height="${H}" fill="url(#sky${seed})"/>
        <circle cx="320" cy="55" r="22" fill="${sun}" opacity="0.85"/>
        <circle cx="320" cy="55" r="32" fill="${sun}" opacity="0.25"/>
        ${mountainPath(140, 50, 8, theme.far)}
        ${mountainPath(160, 60, 7, theme.mid)}
        ${accent}
        ${mountainPath(185, 45, 9, theme.near)}
        ${trees}</svg>`;
}

/* ============================================================
   雷达图 (5 维)
   ============================================================ */
const RADAR_AXES = [
    { key: "stamina", label: "体力" },
    { key: "technical", label: "技术" },
    { key: "exposure", label: "暴露" },
    { key: "retreat", label: "撤退" },
    { key: "signal", label: "信号" }
];

function buildRadar(ratings, size = 200, color = "#3d6e5a", showLabels = true) {
    const cx = size / 2, cy = size / 2;
    const r = size * 0.38;
    const N = RADAR_AXES.length;
    const angleStep = (Math.PI * 2) / N;

    let gridPaths = "";
    for (let lvl = 1; lvl <= 5; lvl++) {
        const ratio = lvl / 5;
        const pts = [];
        for (let i = 0; i < N; i++) {
            const a = -Math.PI / 2 + i * angleStep;
            pts.push(`${(cx + Math.cos(a) * r * ratio).toFixed(1)},${(cy + Math.sin(a) * r * ratio).toFixed(1)}`);
        }
        gridPaths += `<polygon points="${pts.join(" ")}" fill="none" stroke="${color}" stroke-opacity="0.15" stroke-width="1"/>`;
    }

    let axisLines = "", labels = "";
    for (let i = 0; i < N; i++) {
        const a = -Math.PI / 2 + i * angleStep;
        const x2 = cx + Math.cos(a) * r;
        const y2 = cy + Math.sin(a) * r;
        axisLines += `<line x1="${cx}" y1="${cy}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${color}" stroke-opacity="0.2" stroke-width="1"/>`;
        if (showLabels) {
            const lx = cx + Math.cos(a) * (r + 14);
            const ly = cy + Math.sin(a) * (r + 14) + 4;
            labels += `<text x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" text-anchor="middle" font-size="11" fill="${color}" font-weight="600">${RADAR_AXES[i].label}</text>`;
        }
    }

    const dataPts = RADAR_AXES.map((ax, i) => {
        const a = -Math.PI / 2 + i * angleStep;
        const v = (ratings[ax.key] || 0) / 5;
        return `${(cx + Math.cos(a) * r * v).toFixed(1)},${(cy + Math.sin(a) * r * v).toFixed(1)}`;
    }).join(" ");

    return `<svg viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg" class="radar-svg">
        ${gridPaths}
        ${axisLines}
        <polygon points="${dataPts}" fill="${color}" fill-opacity="0.28" stroke="${color}" stroke-width="2"/>
        ${labels}
    </svg>`;
}

/* ============================================================
   电影分镜(横向时间轴)
   ============================================================ */
function buildCinemaStrip(waypoints, theme) {
    return `<div class="cinema-strip">${
        waypoints.map(w => {
            const sky = skyForTime(w.time);
            return `<div class="cinema-cell">
                <div class="cinema-sky" style="background: ${sky};">
                    <span class="cinema-time">${w.time}</span>
                    <span class="cinema-elev">${w.elev}</span>
                    ${w.scene || "📍"}
                </div>
                <div class="cinema-info">
                    <div class="cinema-name">${w.name}</div>
                    <div class="cinema-vista">${w.vista || w.note}</div>
                </div>
            </div>`;
        }).join("")
    }</div>`;
}

function skyForTime(timeStr) {
    const hourMatch = timeStr.match(/(\d{1,2}):/);
    const h = hourMatch ? parseInt(hourMatch[1]) : 12;
    if (h < 6) return "linear-gradient(180deg, #1a2a4a 0%, #3a4a6a 100%)";
    if (h < 8) return "linear-gradient(180deg, #ff9966, #ffcc99)";
    if (h < 11) return "linear-gradient(180deg, #87ceeb, #b8d8e8)";
    if (h < 15) return "linear-gradient(180deg, #6ab8e8, #a8d4f0)";
    if (h < 17) return "linear-gradient(180deg, #ffb070, #ffd4a8)";
    if (h < 19) return "linear-gradient(180deg, #d96a4a, #f0a070)";
    return "linear-gradient(180deg, #2a3a5a, #4a5a7a)";
}

/* ============================================================
   过滤 & 渲染
   ============================================================ */
function getFiltered() {
    return routes.filter(r => {
        if (state.region !== "all") {
            const rRegion = r.region || "taihang";
            if (rRegion !== state.region) return false;
        }
        if (state.difficulty !== "all" && r.difficulty !== state.difficulty) return false;
        if (state.duration !== "all" && r.duration !== state.duration) return false;
        if (state.keyword) {
            const kw = state.keyword.toLowerCase();
            if (!r.name.toLowerCase().includes(kw)
                && !r.location.toLowerCase().includes(kw)
                && !r.description.toLowerCase().includes(kw)) return false;
        }
        return true;
    });
}

function render() {
    const filtered = getFiltered();
    if (filtered.length === 0) {
        grid.innerHTML = '<div class="empty-msg">没有找到匹配的路线,试试调整筛选条件吧 🥾</div>';
        grid.classList.remove("has-feature");
        return;
    }

    const season = getSeason();
    const seasonal = filtered.filter(r => r.seasonTags && r.seasonTags.includes(season.key));
    const featuredId = seasonal.length > 0 ? seasonal[0].id : filtered[0].id;
    grid.classList.toggle("has-feature", filtered.length > 1);

    grid.innerHTML = filtered.map(r => {
        const visited = state.visited.has(r.id);
        const isFeatured = r.id === featuredId && filtered.length > 1;
        const inSeason = r.seasonTags && r.seasonTags.includes(season.key);
        const isRemote = r.type === "remote";
        const poemSnippet = r.poem ? `<div class="card-poem-snippet">${r.poem.lines[r.poem.lines.length - 1]}<span class="author">— ${r.poem.author}</span></div>` : "";
        return `<div class="route-card ${isFeatured ? "featured" : ""} ${isRemote ? "is-remote" : ""}" data-id="${r.id}"
                    style="--route-primary: ${r.theme.primary}; --route-soft: ${r.theme.soft};">
            <div class="card-image">
                ${buildLandscape(r.theme, r.id)}
                ${r.epithet ? `<span class="epithet">${r.epithet}</span>` : ""}
                ${inSeason ? `<span class="season-badge">${season.label}正当时</span>` : ""}
                ${isRemote ? `<span class="remote-seal" title="文化拜谒,非实地指南">远望志</span>` : ""}
                <div class="card-badges">
                    <span class="difficulty-badge ${r.difficulty}">${r.difficultyLabel}</span>
                    <span class="tech-grade">${r.techGrade}</span>
                </div>
                ${visited ? `<span class="visited-mark">✓ 已徒步</span>` : ""}
                <div class="card-radar">${buildRadar(r.ratings, 64, r.theme.primary, false)}</div>
            </div>
            <div class="card-body">
                <h3 class="card-title">${r.name}</h3>
                <div class="card-location">📍 ${r.location} · ${r.bestSeason}</div>
                <div class="card-stats">
                    <span>🚶 ${r.distance}</span>
                    <span>⛰️ ${r.elevation}</span>
                    <span>⏱️ ${r.durationLabel}</span>
                </div>
                <div class="card-desc">${r.description}</div>
                ${poemSnippet}
                <div class="card-actions" onclick="event.stopPropagation()">
                    <button class="compare-toggle ${state.compare.has(r.id) ? "checked" : ""}" data-cmp="${r.id}">
                        ${state.compare.has(r.id) ? "✓" : ""}
                    </button>
                    <span class="compare-label">加入对比</span>
                </div>
            </div>
        </div>`;
    }).join("");

    document.querySelectorAll(".route-card").forEach(card => {
        card.addEventListener("click", () => openModal(parseInt(card.dataset.id)));
    });
    document.querySelectorAll(".compare-toggle").forEach(btn => {
        btn.addEventListener("click", e => {
            e.stopPropagation();
            const id = parseInt(btn.dataset.cmp);
            if (state.compare.has(id)) state.compare.delete(id);
            else {
                if (state.compare.size >= 3) { toast("最多对比 3 条路线"); return; }
                state.compare.add(id);
            }
            render();
            renderCompareTray();
        });
    });
}

/* ============================================================
   当季推荐 Band
   ============================================================ */
function renderSeasonBand() {
    const season = getSeason();
    $("seasonLabel").textContent = `${season.label}推荐`;
    const seasonal = routes.filter(r => r.seasonTags && r.seasonTags.includes(season.key));
    const reasons = {
        spring: "杜鹃/春花/万物复苏",
        summer: "避暑/瀑布/凉爽",
        autumn: "红叶/层林尽染",
        winter: "冰瀑/雪景/静谧"
    };
    $("seasonCards").innerHTML = seasonal.slice(0, 6).map(r =>
        `<div class="season-card" data-id="${r.id}" style="--route-soft:${r.theme.soft};--route-primary:${r.theme.primary};">
            <span class="name" style="color:${r.theme.primary}">${r.name}</span>
            <span class="reason">${reasons[season.key]}</span>
        </div>`
    ).join("");
    document.querySelectorAll(".season-card").forEach(c =>
        c.addEventListener("click", () => openModal(parseInt(c.dataset.id))));
}

/* ============================================================
   路线详情
   ============================================================ */
function buildRouteMap(waypoints, routeName) {
    if (!waypoints || waypoints.length === 0) return "";
    const elevs = waypoints.map(w => parseInt(w.elev) || 0);
    const minE = Math.min(...elevs), maxE = Math.max(...elevs);
    const range = maxE - minE || 1;
    const W = 600, H = 180, padX = 40, padY = 30;
    const stepX = (W - padX * 2) / (waypoints.length - 1 || 1);
    const points = waypoints.map((w, i) => {
        const x = padX + i * stepX;
        const e = parseInt(w.elev) || 0;
        const y = H - padY - ((e - minE) / range) * (H - padY * 2);
        return { x, y, ...w };
    });
    const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
    const areaD = pathD + ` L ${points[points.length-1].x} ${H - padY} L ${points[0].x} ${H - padY} Z`;
    const dots = points.map(p => `<g>
        <circle cx="${p.x}" cy="${p.y}" r="6" fill="currentColor" stroke="white" stroke-width="2"/>
        <text x="${p.x}" y="${p.y - 12}" text-anchor="middle" font-size="11" fill="currentColor" font-weight="600">${p.elev}</text></g>`).join("");

    const svg = `<svg viewBox="0 0 ${W} ${H}" class="elev-svg" style="color: var(--route-primary);">
        <defs><linearGradient id="elevG" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stop-color="currentColor" stop-opacity="0.3"/>
            <stop offset="100%" stop-color="currentColor" stop-opacity="0"/></linearGradient></defs>
        <path d="${areaD}" fill="url(#elevG)"/>
        <path d="${pathD}" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linejoin="round"/>
        ${dots}</svg>`;

    const list = waypoints.map((w, i) => buildWaypointCard(w, i, routeName)).join("");
    return `<div class="route-map">${svg}<ol class="wp-list">${list}</ol></div>`;
}

function buildWaypointCard(w, i, routeName) {
    const safeName = encodeURIComponent(`${routeName} ${w.name}`);
    const photoSrc = `photos/${routeName}/${w.name}.jpg`;
    const fallbackSvg = `data:image/svg+xml;utf8,${encodeURIComponent(buildPhotoFallback(w))}`;
    return `<li class="wp-item">
        <div class="wp-photo">
            <img src="${photoSrc}" alt="${w.name}" loading="lazy"
                 onerror="this.onerror=null;this.src='${fallbackSvg}';">
            <span class="wp-num">${i + 1}</span>
        </div>
        <div class="wp-info">
            <div class="wp-head">
                <strong>${w.name}</strong>
                <span class="wp-meta">${w.time} · ${w.elev}</span>
            </div>
            <div class="wp-vista">${w.scene || "📍"} ${w.vista || ""}</div>
            <div class="wp-note">💡 ${w.note}</div>
            <div class="wp-search">
                <a href="https://image.baidu.com/search/index?tn=baiduimage&word=${safeName}" target="_blank" rel="noopener" class="search-link">🔍 百度图片</a>
                <a href="https://www.xiaohongshu.com/search_result?keyword=${safeName}" target="_blank" rel="noopener" class="search-link">📕 小红书</a>
                <a href="https://www.amap.com/search?query=${safeName}" target="_blank" rel="noopener" class="search-link">🗺️ 高德地图</a>
            </div>
        </div></li>`;
}

function buildPhotoFallback(w) {
    const scene = (w.scene || "📍").replace(/[<>&"]/g, "");
    const name = (w.name || "").replace(/[<>&"]/g, "");
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
        <defs><linearGradient id="g" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stop-color="#88a896"/><stop offset="100%" stop-color="#4a7c59"/></linearGradient></defs>
        <rect width="200" height="200" fill="url(#g)"/>
        <text x="100" y="105" text-anchor="middle" font-size="60" fill="white" opacity="0.95">${scene}</text>
        <text x="100" y="160" text-anchor="middle" font-size="14" fill="white" opacity="0.85" font-weight="600">${name}</text>
    </svg>`;
}

/* ============================================================
   山行三餐(仿菜牌)
   ============================================================ */
function buildFeastBlock(r) {
    const c = r.cuisine;
    if (!c) return r.food ? `<p>${r.food}</p>` : "";

    const dish = (d, isSig) => d ? `
        <div class="feast-dish ${isSig ? "signature" : ""}">
            <div class="feast-icon">${d.icon || "🍽"}</div>
            <div class="feast-info">
                <div class="feast-name">${d.name}</div>
                <div class="feast-desc">${d.desc}</div>
            </div>
            <div class="feast-price">${d.price || ""}</div>
        </div>` : "";

    const seasonalNow = () => {
        if (!c.seasonal) return "";
        const month = new Date().getMonth() + 1;
        const key = month >= 3 && month <= 5 ? "spring"
                  : month >= 6 && month <= 8 ? "summer"
                  : month >= 9 && month <= 11 ? "autumn" : "winter";
        return c.seasonal[key] || Object.values(c.seasonal)[0] || "";
    };

    const sealChars = (r.epithet || "山").slice(0, 2).split("").map(ch => `<span>${ch}</span>`).join("");

    return `<div class="feast-block">
        <div class="feast-seal">${sealChars}</div>
        ${c.tagline ? `<div class="feast-tagline">${c.tagline}</div>` : ""}
        <div class="feast-dishes">
            ${dish(c.signature, true)}
            ${dish(c.snack, false)}
            ${dish(c.drink, false)}
        </div>
        <div class="feast-meta">
            ${c.shop ? `<div class="meta-row"><span class="meta-label">店家</span><span class="meta-value">${c.shop}</span></div>` : ""}
            ${seasonalNow() ? `<div class="meta-row"><span class="meta-label">时令</span><span class="meta-value">${seasonalNow()}</span></div>` : ""}
            ${c.tea ? `<div class="meta-row"><span class="meta-label">茶寮</span><span class="meta-value">${c.tea}</span></div>` : ""}
        </div>
        ${c.verse ? `<div class="feast-verse">${c.verse}</div>` : ""}
    </div>`;
}

/* ============================================================
   古人登临谱 · 时间卷轴
   ============================================================ */
function buildChronicleScroll(chronicle, mountainName) {
    if (!chronicle || chronicle.length === 0) return "";
    const items = chronicle.map((c, i) => `
        <div class="chron-item" style="--chron-i:${i}">
            <div class="chron-dot"></div>
            <div class="chron-card">
                <div class="chron-head">
                    <span class="chron-year">${c.year || ""}</span>
                    <span class="chron-dynasty">${c.dynasty || ""}</span>
                </div>
                <div class="chron-person">${c.person || ""}</div>
                <div class="chron-event">${c.event || ""}</div>
                ${c.legacy ? `<div class="chron-legacy">「${c.legacy}」</div>` : ""}
            </div>
        </div>
    `).join("");
    return `
    <div class="chronicle-scroll">
        <div class="chron-title-row">
            <span class="chron-title">古人登临谱</span>
            <span class="chron-sub">与历代登${mountainName ? mountainName.replace(/^[东西南北中]岳/, "") : "山"}者同游</span>
        </div>
        <div class="chron-rail">
            <div class="chron-line"></div>
            ${items}
        </div>
    </div>`;
}

/* ============================================================
   诗轴(立轴竖排,落朱印)
   ============================================================ */
function buildPoemScroll(poem, epithet, routeId) {
    if (!poem) return "";
    const lines = poem.lines.map(l => `<div class="poem-line">${l}</div>`).join("");
    const sealText = (epithet || "").slice(0, 4) || "山";
    const sealHtml = sealText.split("").map(c => `<span>${c}</span>`).join("");
    const tb = (typeof getTextbookForRoute === "function" && routeId != null)
        ? getTextbookForRoute(routeId) : null;
    const textbookSeal = tb ? `
        <button class="textbook-seal" type="button" data-route="${routeId}" title="此山曾入语文课本 · 点开看典出">
            <span class="tbs-line1">故人句</span>
            <span class="tbs-line2">曾入课本</span>
        </button>` : "";
    return `<div class="poem-scroll">
        <div class="poem-meta">
            <div class="title">《${poem.title}》</div>
            <div class="author">${poem.dynasty} · ${poem.author}</div>
        </div>
        <div class="poem-lines">${lines}</div>
        <div class="poem-seal">${sealHtml}</div>
        ${textbookSeal}
        <button class="recite-btn" id="reciteBtn" style="position:absolute;left:18px;top:14px;">🔊 听诗</button>
        ${poem.note ? `<div class="poem-note" style="position:absolute;left:0;right:0;bottom:-32px;">${poem.note}</div>` : ""}
    </div>`;
}

function openModal(id) {
    const r = routes.find(x => x.id === id);
    if (!r) return;

    const features = (r.features || []).map(f => `<li>${f}</li>`).join("");
    const hidden = (r.hiddenSpots || []).map(h => `<li>${h}</li>`).join("");

    document.querySelector(".modal-content").style.setProperty("--route-primary", r.theme.primary);
    document.querySelector(".modal-content").style.setProperty("--route-soft", r.theme.soft);

    const radarLegend = `
        <dl class="radar-legend">
            <dt>体力 ${r.ratings.stamina}/5</dt><dd>累计上升 / 距离强度</dd>
            <dt>技术 ${r.ratings.technical}/5</dt><dd>瑞士 SAC 等级 ${r.techGrade}</dd>
            <dt>暴露 ${r.ratings.exposure}/5</dt><dd>悬崖 / 绝壁 / 高空感</dd>
            <dt>撤退 ${r.ratings.retreat}/5</dt><dd>分数越高越容易撤退</dd>
            <dt>信号 ${r.ratings.signal}/5</dt><dd>手机网络覆盖</dd>
        </dl>`;

    const isVisited = state.visited.has(r.id);
    const gear = (r.gear || []).map((g, i) => `<div class="gear-item" data-gi="${i}">
        <span class="gear-check">✓</span>${g}</div>`).join("");

    modalBody.innerHTML = `
        <div class="modal-header">
            ${buildLandscape(r.theme, r.id)}
            <div class="modal-title-block">
                ${r.epithet ? `<div class="epithet-inline">· ${r.epithet} ·</div>` : ""}
                <h2>${r.name}</h2>
                <div class="meta">📍 ${r.location} · ${r.bestSeason} · ${r.techGrade}</div>
            </div>
        </div>
        <div class="modal-body">
            ${buildPoemScroll(r.poem, r.epithet, r.id)}

            ${r.chronicle && r.chronicle.length ? buildChronicleScroll(r.chronicle, r.name) : ""}

            <div class="radar-block">
                <div>${buildRadar(r.ratings, 200, r.theme.primary, true)}</div>
                ${radarLegend}
            </div>

            <div class="info-grid">
                <div class="info-item"><div class="info-label">难度</div><div class="info-value">${r.difficultyLabel}</div></div>
                <div class="info-item"><div class="info-label">距离</div><div class="info-value">${r.distance}</div></div>
                <div class="info-item"><div class="info-label">海拔差</div><div class="info-value">${r.elevation}</div></div>
                <div class="info-item"><div class="info-label">时长</div><div class="info-value">${r.durationLabel}</div></div>
            </div>

            <h3 class="section-title">路线特点</h3>
            <ul>${features}</ul>

            <h3 class="section-title">一日分镜 · 时间地平线</h3>
            ${buildCinemaStrip(r.waypoints, r.theme)}

            <h3 class="section-title">详细路线图 · 打卡点 📷</h3>
            <div class="photo-tip">
                每个打卡点显示场景预览,点击 <strong>百度图片 / 小红书 / 高德地图</strong> 一键查看真实景色。
                想换成自己拍的照片?把图片命名为 <code>打卡点名.jpg</code> 放到 <code>photos/${r.name}/</code> 即可。
            </div>
            ${buildRouteMap(r.waypoints, r.name)}

            <h3 class="section-title">🤫 隐藏玩法</h3>
            <ul class="hidden-list">${hidden}</ul>

            <h3 class="section-title">🎒 装备 Checklist</h3>
            <div class="gear-grid">${gear}</div>

            <h3 class="section-title">📞 应急通讯</h3>
            <div class="emergency-block">
                <h4>就近联系</h4>
                <div class="emergency-row"><span>${r.emergency.local.split(" ")[0]}</span><a href="tel:${r.emergency.local.match(/[\d-]+/)[0]}">${r.emergency.local.match(/[\d-]+/)[0]}</a></div>
                <div class="emergency-row"><span>景区救援</span><a href="tel:${r.emergency.rescue.match(/[\d-]+/)[0]}">${r.emergency.rescue.match(/[\d-]+/)[0]}</a></div>
                <div class="emergency-row"><span>110 / 120</span><a href="tel:110">一键拨打 110</a></div>
                <div class="emergency-row"><span>蓝天救援</span><a href="tel:0311-87085222">0311-87085222</a></div>
            </div>

            ${r.photography ? `<h3 class="section-title">📷 摄影建议</h3><p>${r.photography}</p>` : ""}

            <h3 class="section-title">🍶 山行三餐 · 山下烟火</h3>
            ${buildFeastBlock(r)}

            <h3 class="section-title">${r.type === "remote" ? `🏛️ ${(LOCAL_SPIRIT_BY_ROUTE[r.id] || {}).region || ""}气性 · 山的性格` : "🏛️ 燕赵九风 · 山的性格"}</h3>
            ${buildSpiritSeal(r)}
            ${buildCohortBlock(r)}

            <h3 class="section-title">🎨 诗书画琴 · 一山一意</h3>
            ${buildCultureGrid(r)}

            <h3 class="section-title">${r.type === "remote" ? `📖 ${(LOCAL_SPIRIT_BY_ROUTE[r.id] || {}).region || "本地"}典故 · 与山有缘` : "📖 燕赵成语 · 与山有缘"}</h3>
            ${buildIdiomBlock(r)}

            <h3 class="section-title">🚗 交通方式</h3>
            <p>${r.access}</p>

            <h3 class="section-title">🌤 山中天气</h3>
            <div id="routeWeather" class="route-weather-box">载入中...</div>

            <h3 class="section-title">🗺️ 离线地图</h3>
            <p>${r.gpxNote}</p>

            <div class="tip-box"><strong>⚠️ 出行提示:</strong> ${r.tips}</div>
            <div class="last-updated">📅 信息更新:${r.lastUpdated}</div>

            <h3 class="section-title">🎵 山门音景</h3>
            <div class="sound-link-bar">
                <button class="sound-link" id="playSoundscape" data-name="${r.soundscape ? r.soundscape.name : "山风"}" data-search="${r.soundscape ? r.soundscape.search : "mountain wind"}">▶ 播放「${r.soundscape ? r.soundscape.name : "山风"}」</button>
                <a class="sound-link" href="https://pixabay.com/sound-effects/search/${encodeURIComponent(r.soundscape ? r.soundscape.search : "mountain")}/" target="_blank" rel="noopener">🔍 Pixabay 搜索此音景</a>
            </div>
            <p style="font-size:0.78rem;color:var(--text-mute);margin-top:6px;">点击播放将用浏览器内置声音模拟,或前往 Pixabay 寻找无版权实景录音。</p>

            <h3 class="section-title">🤝 山友约伴</h3>
            <div class="meetup-wall" id="meetupWall"></div>

            <h3 class="section-title">📓 山行日记</h3>
            <div class="diary-block" id="diaryBlock"></div>

            <button class="toggle-visited ${isVisited ? "is-visited" : ""}" id="visitedBtn">
                ${isVisited ? "✓ 已徒步过此线路 — 取消标记" : "标记为已徒步(自动收录护照)"}
            </button>

            <div class="rite-bar">
                <button class="rite-btn" data-rite="bow">🙏 辞山 · 出发前</button>
                <button class="rite-btn" data-rite="thank">📝 谢山 · 归来时</button>
                <button class="rite-btn" data-rite="farewell">🍃 送山 · 离去前</button>
            </div>

            <div class="share-bar">
                <button class="share-btn" id="shareCopy">🔗 复制路线链接</button>
                <button class="share-btn" id="shareText">📋 复制路线文本</button>
                <button class="share-btn" id="makePostcard">✉️ 生成明信片</button>
                <button class="share-btn" id="addToCalendar">📅 加入日历</button>
            </div>
        </div>`;

    modal.classList.add("active");
    document.body.style.overflow = "hidden";
    history.replaceState(null, "", `#route-${r.id}`);

    // 装备 checklist 交互
    const gearKey = `th_gear_${r.id}`;
    const savedGear = new Set(JSON.parse(localStorage.getItem(gearKey) || "[]"));
    document.querySelectorAll(".gear-item").forEach((item, i) => {
        if (savedGear.has(i)) item.classList.add("checked");
        item.addEventListener("click", () => {
            item.classList.toggle("checked");
            if (item.classList.contains("checked")) savedGear.add(i);
            else savedGear.delete(i);
            localStorage.setItem(gearKey, JSON.stringify([...savedGear]));
        });
    });

    $("visitedBtn").addEventListener("click", () => {
        const wasVisited = state.visited.has(r.id);
        if (wasVisited) {
            state.visited.delete(r.id);
            toast("已取消标记");
            persistVisited();
            render();
            openModal(r.id);
        } else {
            state.visited.add(r.id);
            STORE.addVisitLog(r.id, { date: todayStr(), note: "" });
            persistVisited();
            checkAchievement();
            // 弹谢山礼
            openRite("thank", r);
            setTimeout(() => { render(); openModal(r.id); }, 300);
        }
    });

    $("shareCopy").addEventListener("click", () => {
        const url = `${location.origin}${location.pathname}#route-${r.id}`;
        navigator.clipboard.writeText(url).then(() => toast("链接已复制,可发送给朋友!"))
            .catch(() => prompt("复制下方链接分享:", url));
    });
    $("shareText").addEventListener("click", () => {
        const text = formatShareText(r);
        navigator.clipboard.writeText(text).then(() => toast("路线文本已复制"))
            .catch(() => prompt("复制下方文本分享:", text));
    });

    // 明信片 / 日历 / 音景 / 诗诵 / 约伴 / 日记
    $("makePostcard").addEventListener("click", () => openPostcard(r));
    $("addToCalendar").addEventListener("click", () => downloadICS(r));

    const reciteBtn = $("reciteBtn");
    if (reciteBtn && r.poem) {
        reciteBtn.addEventListener("click", () => recitePoem(r.poem, reciteBtn));
    }

    const tbSeal = modalBody.querySelector(".textbook-seal");
    if (tbSeal) {
        tbSeal.addEventListener("click", () => openTextbookCard(r.id));
    }

    const playSnd = $("playSoundscape");
    if (playSnd) playSnd.addEventListener("click", () => playSoundscape(r));

    renderMeetupWall(r);
    renderDiaryBlock(r);
    loadRouteWeather(r);

    // 礼仪按钮
    document.querySelectorAll(".rite-btn").forEach(b =>
        b.addEventListener("click", () => openRite(b.dataset.rite, r)));
}

function openTextbookCard(routeId) {
    const r = routes.find(x => x.id === routeId);
    const tb = (typeof getTextbookForRoute === "function") ? getTextbookForRoute(routeId) : null;
    if (!r || !tb) return;
    const wrap = document.createElement("div");
    wrap.className = "textbook-card-overlay";
    wrap.innerHTML = `
        <div class="textbook-card">
            <button class="tbc-close" aria-label="关">&times;</button>
            <div class="tbc-stamp">课本</div>
            <div class="tbc-eyebrow">${tb.grade} · ${tb.version}</div>
            <h3 class="tbc-mountain">${r.name}</h3>
            <blockquote class="tbc-line">${tb.line}</blockquote>
            <div class="tbc-poet">—— ${tb.poet}</div>
            <p class="tbc-note">${tb.note}</p>
            <div class="tbc-foot">少年时背过,登山方知所写为何处。</div>
        </div>`;
    document.body.appendChild(wrap);
    const close = () => wrap.remove();
    wrap.querySelector(".tbc-close").addEventListener("click", close);
    wrap.addEventListener("click", e => { if (e.target === wrap) close(); });
    requestAnimationFrame(() => wrap.classList.add("show"));
}

function formatShareText(r) {
    const wp = (r.waypoints || []).map((w, i) => `${i+1}. ${w.time} ${w.name}(${w.elev}) - ${w.note}`).join("\n");
    const poemBlock = r.poem ? `

【与古人同游】
《${r.poem.title}》 ${r.poem.dynasty}·${r.poem.author}
${r.poem.lines.join(",")}` : "";

    const c = r.cuisine;
    const feastBlock = c ? `

【山下三味】${c.tagline ? "  " + c.tagline : ""}
🍽 招牌:${c.signature.name} (${c.signature.price})
🥢 小食:${c.snack.name}
🥣 配饮:${c.drink.name}
🍵 茶寮:${c.tea || ""}
📍 店家:${c.shop || ""}` : (r.food ? `

【山下美食】
${r.food}` : "");

    return `🥾 行山志推荐:${r.name}${r.epithet ? "(" + r.epithet + ")" : ""}
📍 位置:${r.location}
⛰️ 难度:${r.difficultyLabel} · ${r.techGrade} · ${r.distance} · 海拔差${r.elevation}
🗓️ 最佳季节:${r.bestSeason}${poemBlock}

【路线特点】
${(r.features || []).map(f => "• " + f).join("\n")}

【详细行程】
${wp}

【隐藏玩法】
${(r.hiddenSpots || []).map(h => "• " + h).join("\n")}${feastBlock}

【出行提示】
${r.tips}

—— 来自《行山志》`;
}

function closeModal() {
    modal.classList.remove("active");
    document.body.style.overflow = "";
    history.replaceState(null, "", location.pathname);
}

$("closeModal").addEventListener("click", closeModal);
modal.addEventListener("click", e => { if (e.target === modal) closeModal(); });
document.addEventListener("keydown", e => { if (e.key === "Escape") { closeModal(); closeLottery(); closeCompare(); closeSafety(); } });

/* ============================================================
   筛选 & 搜索
   ============================================================ */
document.querySelectorAll(".filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        const f = btn.dataset.filter, v = btn.dataset.value;
        state[f] = v;
        document.querySelectorAll(`.filter-btn[data-filter="${f}"]`).forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        render();
    });
});

searchInput.addEventListener("input", e => { state.keyword = e.target.value.trim(); render(); });

/* ============================================================
   抽签(节气签文)
   ============================================================ */
const lotteryBtn = $("lotteryBtn");
const lotteryModal = $("lotteryModal");
const lotteryStage = $("lotteryStage");
const lotteryAgain = $("lotteryAgain");
const lotteryView = $("lotteryView");
let lotteryResultId = null;

lotteryBtn.addEventListener("click", () => {
    const pool = getFiltered();
    if (pool.length === 0) { toast("当前筛选下没有路线"); return; }
    runLottery(pool);
});

function runLottery(pool) {
    lotteryModal.classList.add("active");
    lotteryAgain.style.display = "none";
    lotteryView.style.display = "none";

    const final = pool[Math.floor(Math.random() * pool.length)];
    lotteryResultId = final.id;

    let i = 0;
    const total = 22 + Math.floor(Math.random() * 6);
    function tick() {
        const r = pool[i % pool.length];
        lotteryStage.innerHTML = `<div class="lottery-card spinning">
            <div class="lottery-img">${buildLandscape(r.theme, r.id)}</div>
            <div class="lottery-name">${r.name}</div>
            <div class="lottery-loc">📍 ${r.location}</div>
        </div><div class="lottery-status">🎋 山野神签,缘起山门...</div>`;
        i++;
        if (i >= total) showLotteryResult(final);
        else setTimeout(tick, 60 + Math.floor(i * i * 0.6));
    }
    tick();
}

function showLotteryResult(r) {
    const season = getSeason();
    lotteryStage.innerHTML = `<div class="lottery-card revealed">
        <div class="lottery-img">${buildLandscape(r.theme, r.id)}</div>
        <div class="lottery-name">✦ ${r.name} ✦</div>
        <div class="lottery-loc">${r.location} · ${r.bestSeason}</div>
        <div class="lottery-stats">
            <span class="lottery-tag ${r.difficulty}">${r.difficultyLabel}</span>
            <span class="lottery-tag">🚶 ${r.distance}</span>
            <span class="lottery-tag">⏱️ ${r.durationLabel}</span>
            <span class="lottery-tag">${r.techGrade}</span>
        </div>
        <div class="lottery-desc">${r.description}</div>
        <div class="lottery-fortune">
            <span class="verse">${pickVerse(r, season)}</span>
            ${pickFortune(r)}
        </div>
    </div>`;
    lotteryAgain.style.display = "inline-block";
    lotteryView.style.display = "inline-block";
}

function pickVerse(r, season) {
    const verses = {
        spring: ["春风又绿江南岸", "踏花归去马蹄香", "山色空蒙雨亦奇"],
        summer: ["山深疑无暑", "绿树阴浓夏日长", "万壑有声含晚籁"],
        autumn: ["停车坐爱枫林晚", "万山红遍,层林尽染", "霜叶红于二月花"],
        winter: ["千山鸟飞绝", "雪满山中高士卧", "瀚海阑干百丈冰"]
    };
    const arr = verses[season.key] || verses.spring;
    return arr[Math.floor(Math.random() * arr.length)];
}

function pickFortune(r) {
    // 18% 概率出成语签
    if (Math.random() < 0.18) {
        const i = randomIdiom();
        return `📜 成语签:${i.word} — ${i.origin}「${i.story.slice(0, 24)}…」`;
    }
    const lines = [
        `🌟 上签:${r.bestSeason}是 ${r.name} 最美之时,宜启程`,
        `🍀 此行宜:登高望远,清心静念`,
        `📅 缘签:邀三五挚友同往,以山为席`,
        `💡 玄签:${(r.hiddenSpots[0] || "").slice(0, 30)}... 待你发现`,
        `🍃 古签:${r.poem ? r.poem.author + "曾留诗于此意,与君共赏" : "山静日长,可读书,可独坐"}`,
        `🍶 食签:下山宜尝${r.cuisine ? r.cuisine.signature.name : r.food || "山下农家菜"}`
    ];
    return lines[Math.floor(Math.random() * lines.length)];
}

lotteryAgain.addEventListener("click", () => {
    const pool = getFiltered();
    if (pool.length > 0) runLottery(pool);
});
lotteryView.addEventListener("click", () => {
    if (lotteryResultId) { closeLottery(); openModal(lotteryResultId); }
});
function closeLottery() { lotteryModal.classList.remove("active"); }
$("lotteryClose").addEventListener("click", closeLottery);
lotteryModal.addEventListener("click", e => { if (e.target === lotteryModal) closeLottery(); });

/* ============================================================
   对比
   ============================================================ */
const compareTray = $("compareTray");
const comparePills = $("comparePills");
const compareModal = $("compareModal");

function renderCompareTray() {
    if (state.compare.size === 0) { compareTray.classList.remove("show"); return; }
    compareTray.classList.add("show");
    comparePills.innerHTML = [...state.compare].map(id => {
        const r = routes.find(x => x.id === id);
        return `<span class="compare-pill" style="background:${r.theme.soft};color:${r.theme.primary}">${r.name}<span class="x" data-rm="${id}">&times;</span></span>`;
    }).join("");
    document.querySelectorAll(".compare-pill .x").forEach(x => {
        x.addEventListener("click", () => {
            state.compare.delete(parseInt(x.dataset.rm));
            render(); renderCompareTray();
        });
    });
}

$("compareGo").addEventListener("click", () => {
    if (state.compare.size < 2) { toast("至少选 2 条路线再对比"); return; }
    openCompareModal();
});
$("compareClear").addEventListener("click", () => { state.compare.clear(); render(); renderCompareTray(); });

function openCompareModal() {
    const items = [...state.compare].map(id => routes.find(r => r.id === id));
    const cols = Math.min(items.length, 3);
    $("compareGrid").style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    $("compareGrid").innerHTML = items.map(r => `
        <div class="compare-card" style="--route-primary:${r.theme.primary};--route-soft:${r.theme.soft};border-color:${r.theme.primary}">
            <h3 style="color:${r.theme.primary}">${r.name}</h3>
            <div style="font-size:0.82rem;color:var(--text-soft);margin-bottom:6px;">${r.location} · ${r.techGrade}</div>
            <div class="compare-radar">${buildRadar(r.ratings, 180, r.theme.primary, true)}</div>
            <div class="compare-meta">
                <div><span>难度</span> <strong>${r.difficultyLabel}</strong></div>
                <div><span>距离</span> <strong>${r.distance}</strong></div>
                <div><span>海拔差</span> <strong>${r.elevation}</strong></div>
                <div><span>时长</span> <strong>${r.durationLabel}</strong></div>
                <div><span>最佳</span> <strong>${r.bestSeason}</strong></div>
            </div>
        </div>`).join("");
    compareModal.classList.add("active");
}
function closeCompare() { compareModal.classList.remove("active"); }
$("compareClose").addEventListener("click", closeCompare);
compareModal.addEventListener("click", e => { if (e.target === compareModal) closeCompare(); });

/* ============================================================
   安全侧栏
   ============================================================ */
const safetyPanel = $("safetyPanel");
$("safetyToggle").addEventListener("click", () => safetyPanel.classList.add("open"));
$("safetyClose").addEventListener("click", () => safetyPanel.classList.remove("open"));
function closeSafety() { safetyPanel.classList.remove("open"); }

const weatherSetupOpenBtn = $("weatherSetupOpen");
if (weatherSetupOpenBtn) weatherSetupOpenBtn.addEventListener("click", () => { closeSafety(); openWeatherSetup(); });

/* ============================================================
   主题切换
   ============================================================ */
const savedTheme = localStorage.getItem("th_theme") || "light";
document.documentElement.setAttribute("data-theme", savedTheme);
$("themeToggle").addEventListener("click", () => {
    const cur = document.documentElement.getAttribute("data-theme");
    const next = cur === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("th_theme", next);
});

/* ============================================================
   启动
   ============================================================ */
renderSeasonBand();
render();
renderCompareTray();
initSolarTermPill();
initTrivia();
initCountdownBar();
initPassportBtn();
initChangelogBtn();
initPlannerBtn();
initPostcardClose();
initPostcardActions();
initRing();
initRiteModal();
initFestivalBanner();
initSociety();
checkSerendipityBanner();
initWarningWatcher();

const hashMatch = location.hash.match(/route-(\d+)/);
if (hashMatch) {
    const id = parseInt(hashMatch[1]);
    setTimeout(() => openModal(id), 100);
}

/* ---- PWA shortcut 路由 ---- */
const _action = new URLSearchParams(location.search).get("action");
if (_action) {
    setTimeout(() => {
        const trigger = {
            lottery: "lotteryBtn",
            planner: "plannerBtn",
            passport: "passportBtn",
            ring: "ringBtn",
            society: "societyBtn"
        }[_action];
        const btn = trigger && document.getElementById(trigger);
        if (btn) btn.click();
        history.replaceState(null, "", location.pathname + location.hash);
    }, 200);
}

/* ============================================================
   节气标
   ============================================================ */
function initSolarTermPill() {
    const pill = $("solarTermPill");
    const cur = getCurrentSolarTerm();
    const { pentad, idx } = getCurrentPentad();
    const flower = getCurrentFlower();
    const flowerHtml = flower ? `<span class="ring-flower-tag">花信 · ${flower.name}</span>` : "";
    const pentadName = pentad ? pentad.name : cur.poem;
    pill.innerHTML = `<span class="term-name">${cur.name} · ${["初候","二候","三候"][idx]}</span><span class="term-poem">${pentadName}</span>${flowerHtml}`;
    pill.addEventListener("click", () => openRing());
}

/* ============================================================
   冷知识(打开后 4 秒)
   ============================================================ */
function initTrivia() {
    const last = localStorage.getItem("th_trivia_seen") || "0";
    // 同一天只弹一次
    if (last === todayStr()) return;
    setTimeout(() => {
        const t = $("triviaToast");
        $("triviaBody").textContent = randomTrivia();
        t.classList.add("show");
        localStorage.setItem("th_trivia_seen", todayStr());
        $("triviaClose").onclick = () => t.classList.remove("show");
        setTimeout(() => t.classList.remove("show"), 14000);
    }, 4000);
}

/* ============================================================
   出发倒计时
   ============================================================ */
function initCountdownBar() {
    refreshCountdownBar();
    $("countdownBar").addEventListener("click", e => {
        if (e.target.classList.contains("clear-link")) {
            STORE.clearPlan();
            refreshCountdownBar();
            toast("已清除出发计划");
            return;
        }
        const plan = STORE.getPlan();
        if (plan) openModal(plan.routeId);
    });
}

function refreshCountdownBar() {
    const bar = $("countdownBar");
    const plan = STORE.getPlan();
    if (!plan || !plan.date) { bar.classList.remove("show"); return; }
    const days = diffDays(plan.date);
    if (days < 0) { STORE.clearPlan(); bar.classList.remove("show"); return; }
    const route = routes.find(r => r.id === plan.routeId);
    const name = route ? route.name : "山行";
    const txt = days === 0 ? "今天就出发!" : days === 1 ? "明天出发" : `距出发还有 <span class="num">${days}</span> 天`;
    bar.innerHTML = `🥾 ${txt} · ${name}  <span class="clear-link">取消计划</span>`;
    bar.classList.add("show");
}

/* ============================================================
   徒步护照
   ============================================================ */
function initPassportBtn() {
    $("passportBtn").addEventListener("click", openPassport);
    $("passportClose").addEventListener("click", () => $("passportModal").classList.remove("active"));
    $("passportModal").addEventListener("click", e => { if (e.target.id === "passportModal") $("passportModal").classList.remove("active"); });
}

/* ============================================================
   山志补遗 · 版本史
   ============================================================ */
function initChangelogBtn() {
    const btn = document.getElementById("changelogBtn");
    if (btn) btn.addEventListener("click", () => openChangelog());
    const close = document.getElementById("changelogClose");
    if (close) close.addEventListener("click", () => document.getElementById("changelogModal").classList.remove("active"));
    const modal = document.getElementById("changelogModal");
    if (modal) modal.addEventListener("click", e => { if (e.target.id === "changelogModal") modal.classList.remove("active"); });
}

function openChangelog(opts) {
    opts = opts || {};
    const list = (typeof CHANGELOG !== "undefined" && CHANGELOG) ? CHANGELOG : [];
    const body = document.getElementById("changelogBody");
    const modal = document.getElementById("changelogModal");
    if (!body || !modal) return;

    const pendingSw = opts.pendingSw || null;

    const scrolls = list.map((c, i) => {
        const changeRows = (c.changes || []).map(ch => `
            <li class="cl-change cl-${ch.type === "新增" ? "add" : ch.type === "修订" ? "fix" : "note"}">
                <span class="cl-tag">${ch.type}</span>
                <span class="cl-text">${ch.text}</span>
            </li>`).join("");
        return `
            <article class="cl-scroll" style="--cl-i:${i}">
                <header class="cl-head">
                    <div class="cl-meta">
                        <span class="cl-version">${c.version}</span>
                        <span class="cl-date">${c.date}</span>
                        ${c.season ? `<span class="cl-season">${c.season}</span>` : ""}
                    </div>
                    <h3 class="cl-title">${c.title || ""}</h3>
                </header>
                <div class="cl-prose">${c.prose || ""}</div>
                <ul class="cl-changes">${changeRows}</ul>
                ${c.verse ? `<div class="cl-verse">「 ${c.verse} 」</div>` : ""}
            </article>`;
    }).join('<div class="cl-divider"><span>※</span></div>');

    const updateAction = pendingSw
        ? `<div class="cl-update-row">
                <button class="share-btn primary" id="clUpdateNow">📥 看完了 · 立即翻新</button>
                <button class="share-btn" id="clUpdateLater">📂 留卷再读</button>
            </div>`
        : "";

    body.innerHTML = `
        <div class="cl-paper">
            <div class="cl-cap cl-cap-top"></div>
            <h2 class="cl-main-title">山志补遗</h2>
            <div class="cl-preface">
                山志非一日成,亦非一人书。<br>
                每经一岁,辄添一卷;每补一处,辄记一笔。<br>
                此卷专为留心之人,以见山志增删之迹、补遗之由。
            </div>
            ${updateAction}
            <div class="cl-stack">${scrolls}</div>
            <div class="cl-tail">—— 行山志 · 山门主人 谨识</div>
            <div class="cl-cap cl-cap-bottom"></div>
        </div>`;

    if (pendingSw) {
        const goBtn = document.getElementById("clUpdateNow");
        const laterBtn = document.getElementById("clUpdateLater");
        if (goBtn) goBtn.onclick = () => pendingSw.postMessage("skipWaiting");
        if (laterBtn) laterBtn.onclick = () => modal.classList.remove("active");
    }

    modal.classList.add("active");
}

if (typeof window !== "undefined") window.openChangelog = openChangelog;
if (typeof window !== "undefined") window.openModalById = openModal;

function openPassport() {
    const visitedCount = state.visited.size;
    const totalRoutes = routes.length;
    const ach = getCurrentAchievement(visitedCount);
    const next = nextAchievement(visitedCount);
    const log = STORE.getVisitedLog();

    // 累计公里/海拔
    let totalKm = 0, totalElev = 0;
    [...state.visited].forEach(id => {
        const r = routes.find(x => x.id === id);
        if (!r) return;
        totalKm += parseFloat(r.distance) || 0;
        totalElev += parseFloat(r.elevation.replace(/[^\d.]/g, "")) || 0;
    });

    const sealText = ach ? ach.name : "山";
    const sealHtml = sealText.length <= 2
        ? sealText.split("").map(c => `<span>${c}</span>`).join("")
        : (sealText.slice(0, 4).split("").map(c => `<span>${c}</span>`).join(""));

    const pages = routes.map(r => {
        const visits = log[r.id] || [];
        const visited = state.visited.has(r.id);
        const visitRows = visits.slice(0, 3).map(v => `<div class="row">📅 ${v.date}${v.note ? " · " + v.note.slice(0, 20) : ""}</div>`).join("");
        const epithetCharSpans = (r.epithet || "山门").split("").map(c => `<span>${c}</span>`).join("");
        return `<div class="passport-page ${visited ? "" : "unvisited"}" data-id="${r.id}" style="--route-primary:${r.theme.primary};">
            ${visited ? `<div class="page-seal">${epithetCharSpans}</div>` : ""}
            <h4>${r.name}</h4>
            <div class="epithet-tag">${r.epithet || ""}</div>
            <div style="font-size:0.78rem;color:var(--text-mute);">${r.location} · ${r.distance}</div>
            <div class="visit-rows">${visitRows || (visited ? "" : "<em style=\"color:var(--text-mute);\">尚未启程</em>")}</div>
        </div>`;
    }).join("");

    const progress = (visitedCount / totalRoutes * 100).toFixed(0);
    const nextText = next
        ? `还需踏访 <strong>${next.count - visitedCount}</strong> 山,可得「${next.name}」之号`
        : "九山已尽,可称太行徐霞客";

    $("passportBody").innerHTML = `
        <div class="passport-cover">
            <div class="seal-big">${sealHtml}</div>
            <h2>徒&nbsp;步&nbsp;护&nbsp;照</h2>
            <div class="epithet-line">${ach ? `当前山号 · ${ach.name}` : "未启程"}</div>
            <div class="passport-progress"><div class="bar" style="width:${progress}%;"></div></div>
            <div class="passport-next">${nextText}</div>
            <div class="meta-row">
                <div><strong>${visitedCount}</strong><small>已访山</small></div>
                <div><strong>${totalKm.toFixed(0)}</strong><small>累计公里</small></div>
                <div><strong>${(totalElev/1000).toFixed(1)}k</strong><small>累计海拔(米)</small></div>
            </div>
        </div>
        <div class="passport-pages">${pages}</div>
    `;
    document.querySelectorAll(".passport-page").forEach(p =>
        p.addEventListener("click", () => {
            $("passportModal").classList.remove("active");
            openModal(parseInt(p.dataset.id));
        }));
    $("passportModal").classList.add("active");
}

/* 成就解锁动画 */
function checkAchievement() {
    const count = state.visited.size;
    const lastAch = JSON.parse(localStorage.getItem("th_last_ach") || "null");
    const cur = getCurrentAchievement(count);
    if (cur && (!lastAch || cur.id !== lastAch.id)) {
        localStorage.setItem("th_last_ach", JSON.stringify(cur));
        showAchievementToast(cur);
    }
}

function showAchievementToast(ach) {
    let el = $("achToast");
    if (!el) {
        el = document.createElement("div");
        el.id = "achToast";
        el.className = "achievement-toast";
        document.body.appendChild(el);
    }
    el.innerHTML = `
        <div class="ach-seal">山</div>
        <h3>${ach.name}</h3>
        <p>${ach.desc}</p>
        <p style="font-size:0.85rem;color:var(--text-mute);margin-top:8px;">已踏访 ${state.visited.size} 山</p>`;
    el.classList.add("show");
    el.addEventListener("click", () => el.classList.remove("show"));
    setTimeout(() => el.classList.remove("show"), 4500);
}

/* ============================================================
   周末计划器
   ============================================================ */
function initPlannerBtn() {
    $("plannerBtn").addEventListener("click", openPlanner);
    $("plannerClose").addEventListener("click", () => $("plannerModal").classList.remove("active"));
    $("plannerModal").addEventListener("click", e => { if (e.target.id === "plannerModal") $("plannerModal").classList.remove("active"); });
}

function openPlanner() {
    const cur = STORE.getPlan();
    const minDate = todayStr();
    // 用市区中心(石家庄)作为默认坐标
    const defaultCoords = { lon: 114.51, lat: 38.04 };

    // 先用 mock/缓存渲染骨架,然后异步替换
    $("plannerBody").innerHTML = `<p style="text-align:center;color:var(--text-mute);padding:40px 0;font-family:var(--font-poem);">
        ${WEATHER.hasKey() ? "正在拉取真实未来 7 日天气..." : "未配置和风 API key,显示模拟天气。可在 🛡️ 出行准备 中设置真实天气。"}
    </p>`;
    $("plannerModal").classList.add("active");

    WEATHER.week7d(defaultCoords.lon, defaultCoords.lat).then(weather => {
        renderPlannerBody(weather, cur, minDate);
    });
}

function renderPlannerBody(weather, cur, minDate) {
    const weatherHtml = weather.map(w => {
        const dow = w.date.getDay();
        const isWeekend = dow === 0 || dow === 6;
        return `<div class="weather-day ${isWeekend ? "weekend" : ""}">
            <div class="label">${w.label}</div>
            <span class="icon">${w.icon}</span>
            <div>${w.name}</div>
            <div class="temp">${w.temp}</div>
        </div>`;
    }).join("");

    const weekend = weather.filter(w => [0, 6].includes(w.date.getDay()));
    const bestDay = weekend.sort((a, b) => b.good - a.good)[0];
    const candidates = routes.filter(r => !state.visited.has(r.id));
    const pool = candidates.length > 0 ? candidates : routes;
    let recRoute;
    if (bestDay && bestDay.good >= 4) {
        recRoute = pool.find(r => r.duration !== "multi") || pool[0];
    } else if (bestDay && bestDay.good <= 2) {
        recRoute = pool.find(r => r.difficulty === "easy") || pool[0];
    } else {
        recRoute = pool[Math.floor(Math.random() * pool.length)];
    }

    const reasonText = bestDay ? WEATHER.dayAdvice(bestDay) : "";
    const dataSource = weather[0] && weather[0].source === "qweather" ? "和风天气" : "模拟天气";
    const setupHint = WEATHER.hasKey() ? "" :
        '<div style="text-align:center;font-size:0.78rem;color:var(--text-mute);margin-bottom:10px;">⚠️ 当前为模拟天气,<a href="#" id="goSetWeather" style="color:var(--seal-red);">点此配置和风 API</a> 即可显示真实数据</div>';

    $("plannerBody").innerHTML = `
        <p style="font-size:0.85rem;color:var(--text-mute);text-align:center;margin-bottom:6px;">未来七日 · ${dataSource}</p>
        ${setupHint}
        <div class="weather-strip">${weatherHtml}</div>

        <div class="planner-rec">
            <h4>本周末推荐</h4>
            <div class="rec-card" data-id="${recRoute.id}">
                <div class="rec-svg">${buildLandscape(recRoute.theme, recRoute.id)}</div>
                <div class="rec-info">
                    <h5 style="color:${recRoute.theme.primary};">${recRoute.name}</h5>
                    <p>${recRoute.description.slice(0, 60)}...</p>
                    <div class="rec-reason">🌤 ${bestDay ? bestDay.label + "(" + bestDay.name + ")" : ""} · ${reasonText} · ${recRoute.epithet || ""}</div>
                </div>
            </div>
        </div>

        <div class="countdown-set">
            <label>📅 设定出发日</label>
            <input type="date" id="planDate" value="${cur && cur.routeId === recRoute.id ? cur.date : ""}" min="${minDate}">
            <button id="savePlan" data-rid="${recRoute.id}">立约山门</button>
        </div>
    `;
    document.querySelector(".rec-card").addEventListener("click", () => {
        $("plannerModal").classList.remove("active");
        openModal(recRoute.id);
    });
    $("savePlan").addEventListener("click", () => {
        const date = $("planDate").value;
        if (!date) { toast("请选一个日期"); return; }
        STORE.setPlan({ routeId: parseInt($("savePlan").dataset.rid), date });
        refreshCountdownBar();
        toast("已立约!首页将显示倒计时");
        $("plannerModal").classList.remove("active");
    });
    if (!WEATHER.hasKey()) {
        const link = $("goSetWeather");
        if (link) link.addEventListener("click", e => { e.preventDefault(); $("plannerModal").classList.remove("active"); openWeatherSetup(); });
    }
}

/* ============================================================
   明信片(Canvas 生成)
   ============================================================ */
function initPostcardClose() {
    $("postcardClose").addEventListener("click", () => $("postcardModal").classList.remove("active"));
    $("postcardModal").addEventListener("click", e => { if (e.target.id === "postcardModal") $("postcardModal").classList.remove("active"); });
}

let postcardRoute = null;
function openPostcard(r) {
    postcardRoute = r;
    $("postcardModal").classList.add("active");
    drawPostcard(r, "山行人");
    $("postcardSigner").value = "";
    $("postcardSigner").oninput = e => drawPostcard(r, (e.target.value || "山行人").slice(0, 12));
}

function initPostcardActions() {
    $("postcardDownload").addEventListener("click", () => {
        if (!postcardRoute) return;
        const canvas = document.querySelector("#postcardStage canvas");
        if (!canvas) return;
        const link = document.createElement("a");
        link.download = `${postcardRoute.name}_明信片.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
        toast("明信片已下载");
    });
    $("postcardShare").addEventListener("click", async () => {
        if (!postcardRoute) return;
        const canvas = document.querySelector("#postcardStage canvas");
        if (!canvas) return;
        try {
            canvas.toBlob(async (blob) => {
                if (navigator.clipboard && window.ClipboardItem) {
                    await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
                    toast("已复制到剪贴板,可粘贴到微信/QQ");
                } else {
                    toast("此浏览器不支持复制图片,请使用下载");
                }
            });
        } catch (e) { toast("复制失败,请使用下载按钮"); }
    });
}

function drawPostcard(r, signer) {
    const stage = $("postcardStage");
    let canvas = stage.querySelector("canvas");
    if (!canvas) { canvas = document.createElement("canvas"); stage.appendChild(canvas); }
    const W = 1200, H = 900;
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext("2d");

    // 米黄宣纸底
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, "#f5ecd9");
    bg.addColorStop(1, "#e8d8b8");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // 山景画
    drawMountains(ctx, r.theme, W, H);

    // 外边框
    ctx.strokeStyle = "#b73228";
    ctx.lineWidth = 4;
    ctx.strokeRect(36, 36, W - 72, H - 72);
    ctx.lineWidth = 1.5;
    ctx.strokeRect(50, 50, W - 100, H - 100);

    // 标题
    ctx.fillStyle = "#2c2818";
    ctx.font = "bold 88px 'LXGW WenKai Screen', serif";
    ctx.textAlign = "center";
    ctx.fillText(r.name, W / 2, 200);

    // 雅号
    if (r.epithet) {
        ctx.fillStyle = "#b73228";
        ctx.font = "32px 'LXGW WenKai Screen', serif";
        ctx.fillText(`· ${r.epithet} ·`, W / 2, 250);
    }

    // 诗句(右下)
    if (r.poem) {
        ctx.fillStyle = "#3a2e18";
        ctx.font = "italic 36px 'LXGW WenKai Screen', serif";
        ctx.textAlign = "left";
        const lines = r.poem.lines.slice(-2);
        lines.forEach((l, i) => ctx.fillText(l, 100, H - 200 + i * 50));
        ctx.fillStyle = "#6a5230";
        ctx.font = "italic 24px 'LXGW WenKai Screen', serif";
        ctx.fillText(`—— ${r.poem.dynasty} · ${r.poem.author}`, 100, H - 100);
    }

    // 印章
    ctx.save();
    ctx.translate(W - 180, H - 180);
    ctx.rotate(-0.05);
    ctx.fillStyle = "#b73228";
    ctx.fillRect(0, 0, 120, 120);
    ctx.strokeStyle = "#fff5d6";
    ctx.lineWidth = 4;
    ctx.strokeRect(8, 8, 104, 104);
    ctx.fillStyle = "#fff5d6";
    ctx.font = "bold 48px 'LXGW WenKai Screen', serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("山", 60, 60);
    ctx.restore();

    // 签名
    ctx.fillStyle = "#5a4f3a";
    ctx.font = "28px 'LXGW WenKai Screen', serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    const d = new Date();
    ctx.fillText(`${signer || "山行人"} · ${d.getFullYear()}年${d.getMonth()+1}月${d.getDate()}日 于 ${r.location}`, 100, H - 60);

    // 山下饭(诗与饭的呼应)
    if (r.cuisine) {
        ctx.fillStyle = "#8a4a2a";
        ctx.font = "italic 22px 'LXGW WenKai Screen', serif";
        ctx.textAlign = "center";
        ctx.fillText(`山下三味:${r.cuisine.signature.name} · ${r.cuisine.tea || ""}`, W / 2, H - 240);
    }

    // 行山志 logo
    ctx.fillStyle = "rgba(60, 50, 30, 0.4)";
    ctx.font = "20px 'LXGW WenKai Screen', serif";
    ctx.textAlign = "right";
    ctx.fillText("— 行山志 —", W - 100, H - 60);
}

function drawMountains(ctx, theme, W, H) {
    const sky = ctx.createLinearGradient(0, 0, 0, H * 0.7);
    sky.addColorStop(0, theme.sky[0]);
    sky.addColorStop(1, theme.sky[1]);
    ctx.fillStyle = sky;
    ctx.fillRect(60, 60, W - 120, H * 0.6);

    // 太阳
    ctx.fillStyle = theme.sun === "sunset" ? "rgba(255,184,77,0.85)" : "rgba(255,230,180,0.85)";
    ctx.beginPath(); ctx.arc(W * 0.78, H * 0.18, 60, 0, Math.PI * 2); ctx.fill();

    // 三层山
    const layers = [
        { y: 0.55, color: theme.far, amp: 0.06 },
        { y: 0.62, color: theme.mid, amp: 0.08 },
        { y: 0.68, color: theme.near, amp: 0.05 }
    ];
    layers.forEach((L, idx) => {
        ctx.fillStyle = L.color;
        ctx.beginPath();
        ctx.moveTo(60, H * 0.7);
        const steps = 12;
        for (let i = 0; i <= steps; i++) {
            const x = 60 + (W - 120) * (i / steps);
            const y = H * L.y - Math.sin(i * 0.9 + idx * 2) * H * L.amp - Math.abs(Math.cos(i * 1.4 + idx)) * H * L.amp * 0.6;
            ctx.lineTo(x, y);
        }
        ctx.lineTo(W - 60, H * 0.7);
        ctx.closePath();
        ctx.fill();
    });
}

/* ============================================================
   日历 ICS
   ============================================================ */
function downloadICS(r) {
    const plan = STORE.getPlan();
    const targetDate = (plan && plan.routeId === r.id) ? plan.date : todayStr();
    const dt = targetDate.replace(/-/g, "");
    const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Taihang Trails//ZH
BEGIN:VEVENT
UID:${Date.now()}@taihang-trails
DTSTAMP:${dt}T070000Z
DTSTART:${dt}T070000
DTEND:${dt}T180000
SUMMARY:🥾 ${r.name}徒步
DESCRIPTION:${r.epithet || ""} · ${r.bestSeason} · ${r.distance}\\n${r.description}
LOCATION:${r.location}
BEGIN:VALARM
ACTION:DISPLAY
TRIGGER:-PT1H
DESCRIPTION:出发前一小时提醒
END:VALARM
END:VEVENT
END:VCALENDAR`;
    const blob = new Blob([ics], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${r.name}_徒步.ics`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast("已下载日历文件,导入手机日历即可");
}

/* ============================================================
   约伴墙
   ============================================================ */
function renderMeetupWall(r) {
    const wall = $("meetupWall");
    if (!wall) return;
    const list = STORE.getMeetups(r.id);
    wall.innerHTML = `
        <div class="meetup-row">
            <input type="text" id="muName" placeholder="昵称" maxlength="10">
            <input type="date" id="muDate" min="${todayStr()}">
            <input type="text" id="muNote" placeholder="集合时间/地点/暗号(可选)" maxlength="40">
            <button id="muPost">发布</button>
        </div>
        <p style="font-size:0.78rem;color:var(--text-mute);">⚠️ 仅存于您本机,不上传服务器。提示信息凭信任使用,见面请注意安全。</p>
        <ul class="meetup-list">${
            list.length === 0
                ? '<li style="color:var(--text-mute);font-size:0.86rem;padding:8px 0;">尚无山友,做第一个发起人吧 ☘️</li>'
                : list.map(m => `<li class="meetup-card">
                    <div class="head">
                        <span><span class="name">${escapeHtml(m.name)}</span> · ${m.date}</span>
                        <span class="x" data-mid="${m.id}">删除</span>
                    </div>
                    <div>${escapeHtml(m.note || "(未填备注)")}</div>
                </li>`).join("")
        }</ul>`;
    $("muPost").addEventListener("click", () => {
        const name = $("muName").value.trim();
        const date = $("muDate").value;
        const note = $("muNote").value.trim();
        if (!name || !date) { toast("请填写昵称和日期"); return; }
        STORE.addMeetup(r.id, { name, date, note });
        renderMeetupWall(r);
    });
    wall.querySelectorAll(".x").forEach(x =>
        x.addEventListener("click", () => {
            STORE.removeMeetup(r.id, parseInt(x.dataset.mid));
            renderMeetupWall(r);
        }));
}

function escapeHtml(s) {
    return (s || "").replace(/[<>&"']/g, c => ({ "<":"&lt;",">":"&gt;","&":"&amp;","\"":"&quot;","'":"&#39;" }[c]));
}

/* ============================================================
   山行日记
   ============================================================ */
function renderDiaryBlock(r) {
    const block = $("diaryBlock");
    if (!block) return;
    const arr = STORE.getDiary(r.id);
    block.innerHTML = `
        <div class="diary-form">
            <textarea id="diaryText" placeholder="今日山色如何?所见所感所悟……"></textarea>
            <div class="row">
                <input type="date" id="diaryDate" value="${todayStr()}" max="${todayStr()}">
                <select id="diaryWeather">
                    <option value="☀️ 晴">☀️ 晴</option>
                    <option value="🌤 多云">🌤 多云</option>
                    <option value="⛅ 阴">⛅ 阴</option>
                    <option value="🌧 雨">🌧 雨</option>
                    <option value="❄️ 雪">❄️ 雪</option>
                    <option value="🌫 雾">🌫 雾</option>
                </select>
                <select id="diaryMood">
                    <option value="🌟 通透">🌟 通透</option>
                    <option value="😌 平和">😌 平和</option>
                    <option value="🔥 振奋">🔥 振奋</option>
                    <option value="😣 疲惫">😣 疲惫</option>
                    <option value="🌧 失落">🌧 失落</option>
                </select>
                <button id="diarySave">题字</button>
            </div>
        </div>
        <ul class="diary-list">${
            arr.length === 0
                ? '<li style="color:var(--text-mute);font-size:0.86rem;padding:8px 0;">空山新雨后,等你题第一笔。</li>'
                : arr.map(e => `<li class="diary-entry">
                    <span class="x" data-eid="${e.id}">删除</span>
                    <div class="head">${e.date} · ${e.weather || ""} · ${e.mood || ""}</div>
                    <div class="body">${escapeHtml(e.text)}</div>
                </li>`).join("")
        }</ul>`;
    $("diarySave").addEventListener("click", () => {
        const text = $("diaryText").value.trim();
        if (!text) { toast("写一笔再题"); return; }
        STORE.addDiary(r.id, {
            date: $("diaryDate").value,
            weather: $("diaryWeather").value,
            mood: $("diaryMood").value,
            text
        });
        toast("题字已成");
        renderDiaryBlock(r);
    });
    block.querySelectorAll(".x").forEach(x =>
        x.addEventListener("click", () => {
            STORE.removeDiary(r.id, parseInt(x.dataset.eid));
            renderDiaryBlock(r);
        }));
}

/* ============================================================
   音景(Web Audio 模拟环境声)
   ============================================================ */
let soundCtx = null, soundNodes = [], soundIsPlaying = false;

function playSoundscape(r) {
    if (soundIsPlaying) { stopSoundscape(); return; }
    try {
        if (!soundCtx) soundCtx = new (window.AudioContext || window.webkitAudioContext)();
        const ctx = soundCtx;
        const dest = ctx.destination;

        // 用粉红噪声 + 低频振荡模拟"风/水/钟"的氛围
        const bufferSize = 2 * ctx.sampleRate;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0;
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            b0 = 0.99886*b0 + white*0.0555179;
            b1 = 0.99332*b1 + white*0.0750759;
            b2 = 0.96900*b2 + white*0.1538520;
            b3 = 0.86650*b3 + white*0.3104856;
            b4 = 0.55000*b4 + white*0.5329522;
            b5 = -0.7616*b5 - white*0.0168980;
            output[i] = (b0+b1+b2+b3+b4+b5+b6+white*0.5362) * 0.11;
            b6 = white * 0.115926;
        }
        const noise = ctx.createBufferSource();
        noise.buffer = noiseBuffer; noise.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.value = r.soundscape && r.soundscape.search.includes("waterfall") ? 1200 : 600;

        const gain = ctx.createGain();
        gain.gain.value = 0.18;

        // 低频脉动模拟风
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.frequency.value = 0.15;
        lfoGain.gain.value = 0.08;
        lfo.connect(lfoGain).connect(gain.gain);
        lfo.start();

        noise.connect(filter).connect(gain).connect(dest);
        noise.start();

        soundNodes = [noise, lfo, filter, gain];
        soundIsPlaying = true;

        const mini = $("soundMini");
        mini.hidden = false;
        $("soundName").textContent = r.soundscape ? r.soundscape.name : "山风";
        $("soundToggle").textContent = "⏸";

        // 按钮按下立即响应
        const playBtn = $("playSoundscape");
        if (playBtn) playBtn.textContent = "⏸ 暂停「" + (r.soundscape ? r.soundscape.name : "山风") + "」";
    } catch (e) { toast("浏览器不支持 Web Audio"); }
}

function stopSoundscape() {
    soundNodes.forEach(n => { try { n.stop && n.stop(); n.disconnect && n.disconnect(); } catch {} });
    soundNodes = [];
    soundIsPlaying = false;
    $("soundMini").hidden = true;
    const playBtn = $("playSoundscape");
    if (playBtn) playBtn.textContent = "▶ 播放音景";
}

$("soundToggle").addEventListener("click", () => {
    if (soundIsPlaying) stopSoundscape();
});
$("soundClose").addEventListener("click", stopSoundscape);

/* ============================================================
   诗诵(Web SpeechSynthesis)
   ============================================================ */
let reciteUtterance = null;
function recitePoem(poem, btn) {
    if (!("speechSynthesis" in window)) { toast("浏览器不支持语音"); return; }
    if (reciteUtterance && speechSynthesis.speaking) {
        speechSynthesis.cancel();
        btn.classList.remove("playing");
        btn.textContent = "🔊 听诗";
        reciteUtterance = null;
        return;
    }
    const text = poem.lines.join("。") + "。";
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "zh-CN";
    u.rate = 0.78;
    u.pitch = 1.0;
    const voices = speechSynthesis.getVoices();
    const zh = voices.find(v => v.lang.startsWith("zh"));
    if (zh) u.voice = zh;
    u.onend = () => { btn.classList.remove("playing"); btn.textContent = "🔊 听诗"; reciteUtterance = null; };
    btn.classList.add("playing");
    btn.textContent = "⏸ 朗诵中";
    reciteUtterance = u;
    speechSynthesis.speak(u);
}

/* ============================================================
   ☯ 节气年轮 · 七十二候
   ============================================================ */
function initRing() {
    $("ringBtn").addEventListener("click", openRing);
    $("ringClose").addEventListener("click", () => $("ringModal").classList.remove("active"));
    $("ringModal").addEventListener("click", e => { if (e.target.id === "ringModal") $("ringModal").classList.remove("active"); });
}

function openRing() {
    const cur = getCurrentSolarTerm();
    const { pentad, idx } = getCurrentPentad();
    const flower = getCurrentFlower();

    // 24 节气年轮(SVG)
    const cx = 240, cy = 240, R = 180, R2 = 150;
    const terms = SOLAR_TERMS;
    const N = terms.length;
    let circles = "", labels = "";
    for (let i = 0; i < N; i++) {
        const angle = -Math.PI / 2 + (i / N) * Math.PI * 2;
        const x = cx + Math.cos(angle) * R;
        const y = cy + Math.sin(angle) * R;
        const lx = cx + Math.cos(angle) * (R + 24);
        const ly = cy + Math.sin(angle) * (R + 24);
        const isCur = terms[i].name === cur.name;
        circles += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${isCur ? 11 : 6}"
                         fill="${isCur ? "var(--seal-red)" : "var(--c-imperial)"}"
                         opacity="${isCur ? 1 : 0.6}"
                         style="${isCur ? "filter: drop-shadow(0 0 6px var(--seal-red));animation: pulse 2s ease-in-out infinite;" : ""}"/>`;
        labels += `<text x="${lx.toFixed(1)}" y="${(ly + 4).toFixed(1)}" text-anchor="middle"
                       font-size="13" fill="${isCur ? "var(--seal-red)" : "var(--text)"}"
                       font-weight="${isCur ? "700" : "500"}"
                       font-family="LXGW WenKai Screen, serif">${terms[i].name}</text>`;
    }
    // 中心
    const center = `
        <circle cx="${cx}" cy="${cy}" r="${R2}" fill="none" stroke="var(--line)" stroke-width="1"/>
        <circle cx="${cx}" cy="${cy}" r="40" fill="var(--seal-red)" opacity="0.06"/>
        <text x="${cx}" y="${cy - 8}" text-anchor="middle" font-size="22" fill="var(--seal-red)"
              font-family="LXGW WenKai Screen, serif" font-weight="700">${cur.name}</text>
        <text x="${cx}" y="${cy + 16}" text-anchor="middle" font-size="12" fill="var(--text-soft)"
              font-family="LXGW WenKai Screen, serif">${["初候", "二候", "三候"][idx]}</text>`;

    const svg = `<svg class="ring-svg" viewBox="0 0 480 480" xmlns="http://www.w3.org/2000/svg">
        <style>@keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }</style>
        ${labels}${circles}${center}</svg>`;

    const recRoute = pentad && pentad.route ? routes.find(r => r.name === pentad.route) : null;

    const pentadBox = pentad ? `<div class="ring-pentad-box">
        <h4>当下五日 · ${cur.name}${["初候", "二候", "三候"][idx]} · ${pentad.name}</h4>
        <div class="row"><span class="label">物候</span>${pentad.taihang}</div>
        ${recRoute ? `<div class="row"><span class="label">应季</span><a href="#" onclick="event.preventDefault();$('ringModal').classList.remove('active');openModal(${recRoute.id});">${recRoute.name}</a></div>` : ""}
        <div class="row"><span class="label">食单</span>${pentad.food}</div>
        ${flower ? `<div class="row"><span class="label">花信</span>${flower.name} · 24番花信风之一</div>` : ""}
        <div class="row"><span class="label">农历</span>${lunarHintToday()}</div>
    </div>` : "";

    $("ringBody").innerHTML = svg + pentadBox;
    $("ringModal").classList.add("active");
}

/* ============================================================
   🙏 山中三礼
   ============================================================ */
function initRiteModal() {
    $("riteClose").addEventListener("click", closeRite);
    $("riteModal").addEventListener("click", e => { if (e.target.id === "riteModal") closeRite(); });
}

function openRite(kind, route) {
    const r = MOUNTAIN_RITES[kind];
    if (!r) return;
    const body = $("riteBody");
    body.innerHTML = `
        <h3 class="rite-title">${r.title}</h3>
        <div class="rite-text">${escapeHtml(r.text)}</div>
        <div class="rite-verse">「 ${r.verse} 」</div>
        <div class="rite-buttons">
            <button class="rite-confirm">${kind === "bow" ? "已敬山" : kind === "thank" ? "题字落印" : "山别"}</button>
            <button class="rite-skip">略</button>
        </div>`;
    body.querySelector(".rite-confirm").addEventListener("click", () => {
        toast(`${r.title} · 已成`);
        closeRite();
    });
    body.querySelector(".rite-skip").addEventListener("click", closeRite);
    $("riteModal").classList.add("active");
}

function closeRite() { $("riteModal").classList.remove("active"); }

/* ============================================================
   节日横幅
   ============================================================ */
function initFestivalBanner() {
    const upcoming = getUpcomingFestival();
    const banner = $("festivalBanner");
    if (!upcoming) { banner.hidden = true; return; }
    const route = routes.find(r => r.id === upcoming.route);
    if (!route) { banner.hidden = true; return; }
    banner.hidden = false;
    const daysHtml = upcoming.daysLeft === 0
        ? '<span class="days">今日</span>'
        : `还有 <span class="days">${upcoming.daysLeft}</span> 天`;
    banner.innerHTML = `<span class="icon">${upcoming.icon}</span>
        <span class="name">${upcoming.festival.name}${daysHtml}</span>
        <span class="desc">${upcoming.festival.theme} · 推:${route.name}</span>`;
    banner.addEventListener("click", () => openModal(route.id));
}

/* ============================================================
   性格印 · 燕赵九风
   ============================================================ */
function buildSpiritSeal(r) {
    const s = (typeof getSpiritForRoute === "function") ? getSpiritForRoute(r.id) : YANZHAO_SPIRIT_BY_ROUTE[r.id];
    if (!s) return "";
    const wuxing = WUXING_BY_ROUTE[r.id];
    return `<div class="spirit-seal-line">
        <div class="spirit-seal">${s.icon}</div>
        <div class="spirit-info">
            <div class="name">${s.name}
                ${s.region ? `<span class="wuxing-pill" style="background:rgba(140,40,24,0.12);color:#8a2818;">${s.region}</span>` : ""}
                ${wuxing ? `<span class="wuxing-pill wuxing-${wuxing.e}">五行属${wuxing.e}</span>` : ""}
            </div>
            <div class="person">人格映照 · ${s.refPerson}</div>
            <div class="line">「 ${s.line} 」</div>
            <div class="desc">${s.desc}${wuxing ? " · " + wuxing.desc : ""}</div>
        </div>
    </div>`;
}

/* ============================================================
   诗书画琴 · 文化网格
   ============================================================ */
function buildCultureGrid(r) {
    const p = PAINTER_BY_ROUTE[r.id];
    const c = CALLIGRAPHY_BY_ROUTE[r.id];
    const q = GUQIN_BY_ROUTE[r.id];
    const cards = [];

    if (p) cards.push(`<div class="culture-card">
        <h5>◈ 一山一画家</h5>
        <div class="body">${p.painter}《${p.work}》</div>
        <div class="meta">${p.era} · ${p.style}</div>
    </div>`);

    if (c) cards.push(`<div class="culture-card">
        <h5>◈ 一山一字体</h5>
        <div class="body">${c.master} · ${c.style}</div>
        <div class="meta">${c.trait}</div>
    </div>`);

    if (q) cards.push(`<div class="culture-card">
        <h5>◈ 一山一琴曲</h5>
        <div class="body">《${q.song}》</div>
        <div class="meta">${q.ref}</div>
        <a class="play-link" href="https://www.bilibili.com/search?keyword=${encodeURIComponent("古琴 " + q.song)}" target="_blank" rel="noopener">▶ B站听琴</a>
    </div>`);

    return `<div class="culture-block"><div class="culture-grid">${cards.join("")}</div></div>`;
}

/* ============================================================
   燕赵成语
   ============================================================ */
function buildIdiomBlock(r) {
    const yanzhao = getIdiomForRoute(r.id);
    const local = (typeof getLocalIdiomsForRoute === "function") ? getLocalIdiomsForRoute(r.id) : [];
    const idioms = yanzhao.length > 0 ? yanzhao : local;
    if (idioms.length === 0) return '<p style="color:var(--text-mute);font-size:0.86rem;">此山未与典故相涉,然其本身,正待入典。</p>';
    return idioms.map(i => `<div class="idiom-card">
        <div><span class="word">${i.word}</span><span class="origin">出处 · ${i.origin}</span></div>
        <div class="story">${i.story}</div>
    </div>`).join("");
}

/* 抽签新增成语签:已在 pickFortune 内部加 18% 概率分支 */

/* ============================================================
   🏮 山社(山友帖)
   ============================================================ */
function initSociety() {
    const btn = $("societyBtn");
    if (!btn) return;
    btn.addEventListener("click", openSociety);
    $("societyClose").addEventListener("click", () => $("societyModal").classList.remove("active"));
    $("societyModal").addEventListener("click", e => { if (e.target.id === "societyModal") $("societyModal").classList.remove("active"); });

    // URL 中携带 ?token=xxx 自动收信物
    const urlMatch = location.search.match(/[?&]token=([^&]+)/);
    if (urlMatch) {
        try {
            const token = decodeURIComponent(urlMatch[1]);
            setTimeout(() => receiveTokenFlow(token, "url"), 600);
        } catch {}
    }
}

function openSociety() {
    if (!FRIENDS.hasMe()) {
        renderSignup();
    } else {
        renderSocietyHome();
    }
    $("societyModal").classList.add("active");
}

function renderSignup() {
    const suggestedName = suggestSageName();
    const suggestedAspire = suggestAspiration();
    $("societyBody").innerHTML = `
        <div class="signup-form">
            <h3>初入山社</h3>
            <div class="intro">山社不收银钱,不需手机,只换一个雅号、一句山志。<br/>取号即得朱印一枚,可结友、可立约、可共记。</div>
            <div class="field">
                <label>山号</label>
                <input type="text" id="signupName" maxlength="6" value="${suggestedName}" placeholder="如:松风客">
                <button class="dice" id="diceName" title="另取">🎲</button>
            </div>
            <div class="field">
                <label>山志</label>
                <input type="text" id="signupAspire" maxlength="20" value="${suggestedAspire}">
                <button class="dice" id="diceAspire" title="另取">🎲</button>
            </div>
            <button class="submit-btn" id="submitSignup">取号入社</button>
        </div>`;

    $("diceName").addEventListener("click", e => { e.preventDefault(); $("signupName").value = suggestSageName(); });
    $("diceAspire").addEventListener("click", e => { e.preventDefault(); $("signupAspire").value = suggestAspiration(); });
    $("submitSignup").addEventListener("click", () => {
        const name = ($("signupName").value || "").trim();
        const aspire = ($("signupAspire").value || "").trim();
        if (!name) { toast("请取一个山号"); return; }
        FRIENDS.setMe({
            id: "u_" + Math.random().toString(36).slice(2, 10),
            name,
            seal: name.slice(0, 2),
            aspire,
            joined: todayStr()
        });
        toast(`欢迎入社,${name} ✦`);
        renderSocietyHome();
    });
}

function renderSocietyHome(view) {
    view = view || "home";
    const me = FRIENDS.getMe();
    const roster = FRIENDS.getRoster();
    const ach = getCurrentSocietyAch(roster.length);
    const next = nextSocietyAch(roster.length);
    const sealHtml = (me.seal || me.name).slice(0, 2).split("").map(c => `<span>${c}</span>`).join("");

    let body = `
        <div class="society-cover">
            <div class="me-seal">${sealHtml}</div>
            <h2>${me.name}</h2>
            <div class="epithet-line">${ach ? "·  " + ach.name + "  ·" : "· 初入山门 ·"}</div>
            <div class="aspire">「 ${me.aspire || "山行有时,缘起则往"} 」</div>
        </div>

        <div class="society-ach-line">
            已结识 <span class="ach-name">${roster.length}</span> 友 · 当前山号 <span class="ach-name">${ach ? ach.name : "未结友"}</span>
            ${next ? "  ·  再结 " + (next.count - roster.length) + " 友可得「" + next.name + "」" : ""}
        </div>

        <div class="society-actions">
            <div class="society-action" data-act="give"><span class="ico">🎴</span><span class="text">赠友信物</span></div>
            <div class="society-action" data-act="receive"><span class="ico">📨</span><span class="text">受友信物</span></div>
            <div class="society-action" data-act="post"><span class="ico">📜</span><span class="text">投帖邀约</span></div>
            <div class="society-action" data-act="map"><span class="ico">🗺</span><span class="text">雅集图</span></div>
            <div class="society-action" data-act="settings"><span class="ico">⚙️</span><span class="text">山号设置</span></div>
        </div>`;

    body += renderRosterSection(roster);
    body += renderPostsSection();

    $("societyBody").innerHTML = body;

    document.querySelectorAll(".society-action").forEach(a =>
        a.addEventListener("click", () => {
            const act = a.dataset.act;
            if (act === "give") renderGiveTokenView();
            else if (act === "receive") renderReceiveTokenView();
            else if (act === "post") renderPostView();
            else if (act === "map") renderSocietyMapView();
            else if (act === "settings") renderSettingsView();
        }));

    document.querySelectorAll(".roster-card .x").forEach(x =>
        x.addEventListener("click", e => {
            e.stopPropagation();
            const id = x.dataset.fid;
            if (confirm("确定与此山友别离?")) {
                FRIENDS.removeFriend(id);
                renderSocietyHome();
            }
        }));

    document.querySelectorAll(".post-card .x").forEach(x =>
        x.addEventListener("click", () => {
            FRIENDS.removePost(parseInt(x.dataset.pid));
            renderSocietyHome();
        }));
}

function renderRosterSection(roster) {
    if (roster.length === 0) {
        return `<div class="society-section">
            <div class="section-head"><h4>山友名册</h4><span class="count">0 人</span></div>
            <p style="color:var(--text-mute);text-align:center;padding:20px;font-family:var(--font-poem);">山中无故人,可待新结识。</p>
        </div>`;
    }
    const list = roster.map(f => {
        const inter = computeIntersections(f.id);
        const isTongxin = inter.length >= 3;
        const visitedNames = (f.visited || []).slice(0, 5).map(id => {
            const r = routes.find(x => x.id === id);
            return r ? r.name : "";
        }).filter(Boolean).join("、");
        return `<li class="roster-card ${isTongxin ? "tongxin" : ""}">
            <div class="friend-seal">${(f.seal || f.name).slice(0, 1)}</div>
            <div class="info">
                <div class="name">${escapeHtml(f.name)}</div>
                <div class="meta">${f.aspire ? "「 " + escapeHtml(f.aspire.slice(0, 18)) + " 」 · " : ""}入社 ${f.joined || "—"}</div>
                <div class="badges">
                    ${(f.visited || []).length > 0 ? `<span class="badge">已访 ${f.visited.length} 山</span>` : '<span class="badge">浅交</span>'}
                    ${inter.length > 0 ? `<span class="badge tongxin">同行 ${inter.length} 山</span>` : ""}
                    ${isTongxin ? '<span class="badge tongxin">同心结</span>' : ""}
                    ${f.diary && f.diary.length > 0 ? '<span class="badge">挚友 · 共日记</span>' : ""}
                </div>
                ${visitedNames ? `<div class="meta" style="margin-top:4px;">足迹:${visitedNames}${(f.visited && f.visited.length > 5) ? "…" : ""}</div>` : ""}
            </div>
            <span class="x" data-fid="${f.id}" title="离别">✕</span>
        </li>`;
    }).join("");
    return `<div class="society-section">
        <div class="section-head"><h4>山友名册</h4><span class="count">${roster.length} 人</span></div>
        <ul class="roster-list">${list}</ul>
    </div>`;
}

function renderPostsSection() {
    const myPosts = FRIENDS.getPosts();
    const replies = FRIENDS.getReplies();
    if (myPosts.length === 0 && replies.length === 0) return "";

    let html = `<div class="society-section">
        <div class="section-head"><h4>山中投帖</h4><span class="count">${myPosts.length} 帖 / ${replies.length} 答</span></div>
        <ul class="posts-list">`;
    myPosts.forEach(p => {
        const r = routes.find(x => x.id === p.routeId);
        html += `<li class="post-card">
            <span class="x" data-pid="${p.id}">删</span>
            <div class="head">📜 ${p.target ? "邀 " + escapeHtml(p.target) + " · " : ""}${r ? r.name : "未指定"}</div>
            <div class="body">${escapeHtml(p.text)}</div>
            <div class="target">投于 ${formatDate(p.id)}${p.date ? "  ·  约期 " + p.date : ""}</div>
        </li>`;
    });
    replies.forEach(r => {
        html += `<li class="post-card" style="border-left-color:var(--c-pine);">
            <div class="head">✉ ${escapeHtml(r.from)} 答帖</div>
            <div class="body">${escapeHtml(r.text)}</div>
        </li>`;
    });
    html += `</ul></div>`;
    return html;
}

function renderGiveTokenView() {
    const me = FRIENDS.getMe();
    const visitedCount = STORE.getVisited().size;
    let depth = "qian";
    let token = "";

    function refresh() {
        token = buildMyToken(depth);
        $("tokenText").value = token;
    }

    $("societyBody").innerHTML = `
        <button class="rite-skip" id="backHome" style="margin-bottom:12px;">← 返回</button>
        <h3 style="font-family:var(--font-poem);text-align:center;letter-spacing:0.4em;margin-bottom:14px;color:var(--seal-red);">🎴 赠 友 信 物</h3>
        <p style="text-align:center;font-family:var(--font-poem);color:var(--text-soft);letter-spacing:0.1em;margin-bottom:16px;line-height:1.8;">
            一段信物码,即一面名帖。<br/>
            发给好友,他/她粘贴即可见你足迹,如赠故人一卷。
        </p>
        <div class="token-block">
            <div class="row">
                <button class="depth-btn active" data-depth="qian">浅交 · 仅山号</button>
                <button class="depth-btn" data-depth="tongdao">同道 · 加足迹</button>
                <button class="depth-btn" data-depth="zhiyou">挚友 · 加日记</button>
            </div>
            <textarea id="tokenText" readonly></textarea>
            <div class="row">
                <button class="copy-btn" id="copyToken">📋 复制信物</button>
                <button class="copy-btn" id="copyLink" style="background:var(--c-pine);">🔗 复制带链接</button>
                <button class="rite-skip" id="qrBtn">📱 生成二维码</button>
            </div>
            <div class="hint">
                · 信物有效期 30 天,过期请再赠新信物<br/>
                · 你已访 ${visitedCount} 山,${depth === "zhiyou" ? "挚友档可见全部足迹与近 3 条日记" : depth === "tongdao" ? "同道档可见全部足迹" : "浅交仅传山号与志"}
            </div>
            <div id="qrBox" style="text-align:center;margin-top:12px;"></div>
        </div>
    `;
    refresh();

    $("backHome").addEventListener("click", () => renderSocietyHome());
    document.querySelectorAll(".depth-btn").forEach(b =>
        b.addEventListener("click", () => {
            depth = b.dataset.depth;
            document.querySelectorAll(".depth-btn").forEach(x => x.classList.remove("active"));
            b.classList.add("active");
            refresh();
        }));

    $("copyToken").addEventListener("click", () => {
        navigator.clipboard.writeText(token).then(() => toast("信物已复制,可发给山友"))
            .catch(() => prompt("复制下方信物码:", token));
    });

    $("copyLink").addEventListener("click", () => {
        const url = `${location.origin}${location.pathname}?token=${encodeURIComponent(token)}`;
        navigator.clipboard.writeText(url).then(() => toast("带链接已复制,朋友点击即自动入社"))
            .catch(() => prompt("复制下方链接:", url));
    });

    $("qrBtn").addEventListener("click", () => {
        const url = `${location.origin}${location.pathname}?token=${encodeURIComponent(token)}`;
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;
        $("qrBox").innerHTML = `<img src="${qrUrl}" style="border-radius:8px;border:1px solid var(--line);" alt="二维码"/>
            <div style="font-size:0.78rem;color:var(--text-mute);margin-top:6px;">扫码即入社</div>`;
    });
}

function renderReceiveTokenView() {
    $("societyBody").innerHTML = `
        <button class="rite-skip" id="backHome" style="margin-bottom:12px;">← 返回</button>
        <h3 style="font-family:var(--font-poem);text-align:center;letter-spacing:0.4em;margin-bottom:14px;color:var(--c-pine);">📨 受 友 信 物</h3>
        <p style="text-align:center;font-family:var(--font-poem);color:var(--text-soft);letter-spacing:0.1em;margin-bottom:16px;line-height:1.8;">
            粘贴朋友赠你的信物码,即可收他入社。
        </p>
        <div class="receive-block">
            <textarea id="recvToken" placeholder="把朋友发来的信物码粘贴在此..." style="width:100%;min-height:100px;padding:10px;font-family:monospace;font-size:0.78rem;border:1px solid var(--line);border-radius:6px;background:var(--bg);color:var(--text);word-break:break-all;"></textarea>
            <div style="margin-top:10px;text-align:center;">
                <button class="copy-btn" id="acceptBtn" style="background:var(--c-pine);">受信物 · 入社</button>
            </div>
        </div>
        <div id="recvPreview" style="margin-top:14px;"></div>`;

    $("backHome").addEventListener("click", () => renderSocietyHome());

    $("acceptBtn").addEventListener("click", () => {
        const tk = ($("recvToken").value || "").trim();
        if (!tk) { toast("请先粘贴信物码"); return; }
        receiveTokenFlow(tk, "manual");
    });
}

function receiveTokenFlow(token, source) {
    const me = FRIENDS.getMe();
    if (!me) {
        // 触发取号
        toast("请先取山号入社");
        renderSignup();
        return;
    }
    const res = parseFriendToken(token);
    if (!res.ok) {
        toast(res.err);
        return;
    }
    const f = res.friend;
    if (f.id === me.id) { toast("此乃你自己的信物"); return; }

    FRIENDS.addFriend({
        id: f.id, name: f.name, seal: f.seal, aspire: f.aspire,
        joined: f.joined, visited: f.visited || [], visitedAt: f.visitedAt || {},
        diary: f.diary || [], plan: f.plan || null,
        receivedAt: todayStr(), depth: f.depth
    });

    showAchievementToast({ name: "得友 · " + f.name, desc: `你与 ${f.name} 结为山友` });
    setTimeout(() => {
        $("societyModal").classList.add("active");
        renderSocietyHome();
        // 检查命定相遇
        checkSerendipityBanner();
    }, 600);
}

function renderPostView() {
    const roster = FRIENDS.getRoster();
    $("societyBody").innerHTML = `
        <button class="rite-skip" id="backHome" style="margin-bottom:12px;">← 返回</button>
        <h3 style="font-family:var(--font-poem);text-align:center;letter-spacing:0.4em;margin-bottom:14px;color:var(--c-imperial);">📜 投 帖 邀 约</h3>
        <p style="text-align:center;font-family:var(--font-poem);color:var(--text-soft);letter-spacing:0.1em;margin-bottom:16px;line-height:1.8;">
            如古人投递诗笺。<br/>
            选一山,题一句,赠一友(可不指定),即成一帖。
        </p>
        <div class="receive-block">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px;">
                <select id="postRoute" style="padding:8px 12px;border:1px solid var(--line);border-radius:6px;background:var(--bg);color:var(--text);font-family:inherit;">
                    ${routes.map(r => `<option value="${r.id}">${r.name}</option>`).join("")}
                </select>
                <input type="date" id="postDate" min="${todayStr()}" style="padding:8px 12px;border:1px solid var(--line);border-radius:6px;background:var(--bg);color:var(--text);font-family:inherit;">
            </div>
            <input type="text" id="postTarget" placeholder="邀谁?(可空,留作公帖)" list="rosterDl" style="width:100%;padding:8px 12px;border:1px solid var(--line);border-radius:6px;background:var(--bg);color:var(--text);font-family:inherit;margin-bottom:8px;">
            <datalist id="rosterDl">
                ${roster.map(f => `<option value="${f.name}">`).join("")}
            </datalist>
            <textarea id="postText" placeholder="题一句邀约或感想..." style="width:100%;min-height:80px;padding:10px;border:1px solid var(--line);border-radius:6px;background:var(--bg);color:var(--text);font-family:var(--font-poem);"></textarea>
            <div style="margin-top:10px;text-align:center;">
                <button class="copy-btn" id="postSave">投帖</button>
            </div>
        </div>`;

    $("backHome").addEventListener("click", () => renderSocietyHome());
    $("postSave").addEventListener("click", () => {
        const text = $("postText").value.trim();
        if (!text) { toast("请题一句"); return; }
        FRIENDS.addPost({
            routeId: parseInt($("postRoute").value),
            date: $("postDate").value,
            target: $("postTarget").value.trim(),
            text
        });
        toast("帖已投");
        renderSocietyHome();
    });
}

function renderSocietyMapView() {
    $("societyBody").innerHTML = `
        <button class="rite-skip" id="backHome" style="margin-bottom:12px;">← 返回</button>
        <h3 style="font-family:var(--font-poem);text-align:center;letter-spacing:0.4em;margin-bottom:14px;color:var(--seal-red);">🗺 山 社 雅 集</h3>
        <p style="text-align:center;font-family:var(--font-poem);color:var(--text-soft);letter-spacing:0.1em;margin-bottom:14px;line-height:1.8;">
            朱印为我,绿印为友。<br/>
            实线代表"同行 ≥ 3 山"的同心之友,虚线代表初识之缘。
        </p>
        <div class="society-map">${buildSocietyMap()}</div>
        <div style="text-align:center;margin-top:12px;">
            <button class="copy-btn" id="downloadMap">📥 下载雅集图</button>
        </div>`;

    $("backHome").addEventListener("click", () => renderSocietyHome());
    $("downloadMap").addEventListener("click", () => {
        const svg = document.querySelector(".society-map svg");
        if (!svg) return;
        const xml = new XMLSerializer().serializeToString(svg);
        const blob = new Blob([xml], { type: "image/svg+xml" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = "山社雅集图.svg";
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    });
}

function renderSettingsView() {
    const me = FRIENDS.getMe();
    $("societyBody").innerHTML = `
        <button class="rite-skip" id="backHome" style="margin-bottom:12px;">← 返回</button>
        <h3 style="font-family:var(--font-poem);text-align:center;letter-spacing:0.4em;margin-bottom:14px;">⚙️ 山 号 设 置</h3>
        <div class="signup-form">
            <div class="field">
                <label>山号</label>
                <input type="text" id="setName" maxlength="6" value="${escapeHtml(me.name)}">
            </div>
            <div class="field">
                <label>山志</label>
                <input type="text" id="setAspire" maxlength="20" value="${escapeHtml(me.aspire || "")}">
            </div>
            <button class="submit-btn" id="setSave">保存</button>
            <div style="margin-top:18px;font-size:0.8rem;color:var(--text-mute);font-family:var(--font-poem);">
                <button class="rite-skip" id="exitSociety" style="color:var(--seal-red);border-color:var(--seal-red);">退出山社(清除山号与所有山友)</button>
            </div>
        </div>`;

    $("backHome").addEventListener("click", () => renderSocietyHome());
    $("setSave").addEventListener("click", () => {
        const name = $("setName").value.trim();
        const aspire = $("setAspire").value.trim();
        if (!name) { toast("请取山号"); return; }
        FRIENDS.setMe({ ...me, name, seal: name.slice(0, 2), aspire });
        toast("已存");
        renderSocietyHome();
    });
    $("exitSociety").addEventListener("click", () => {
        if (confirm("确定退出山社?山号、信物、山友名册将一并清除。")) {
            FRIENDS.clearAll();
            $("societyModal").classList.remove("active");
            toast("已退出山社");
            render();
        }
    });
}

/* ============================================================
   命定相遇横幅
   ============================================================ */
function checkSerendipityBanner() {
    const matches = checkSerendipity();
    let bar = document.getElementById("serendipityBar");
    if (matches.length === 0) {
        if (bar) bar.remove();
        return;
    }
    if (!bar) {
        bar = document.createElement("div");
        bar.id = "serendipityBar";
        bar.className = "serendipity-banner";
        const banner = document.getElementById("festivalBanner");
        if (banner && banner.parentNode) banner.parentNode.insertBefore(bar, banner.nextSibling);
        else document.body.insertBefore(bar, document.querySelector(".season-band"));
    }
    const m = matches[0];
    const route = routes.find(r => r.id === m.friend.plan.routeId);
    bar.textContent = m.kind === "same"
        ? `✦ 命定相遇:${m.friend.name} 也将于 ${m.friend.plan.date} 同登 ${route ? route.name : ""},何不同行?`
        : `🌙 同日山行:${m.friend.name} 在 ${m.friend.plan.date} 也有山行计划`;
    bar.onclick = () => {
        if (route) openModal(route.id);
    };
}

/* ============================================================
   护照页 / 详情页插入"同心结"
   ============================================================ */
function getCohortForRoute(routeId) {
    return FRIENDS.getRoster().filter(f => (f.visited || []).includes(routeId));
}

function buildCohortBlock(r) {
    const cohort = getCohortForRoute(r.id);
    if (cohort.length === 0) return "";
    const pills = cohort.map(f => {
        const at = f.visitedAt && f.visitedAt[r.id] ? "(" + f.visitedAt[r.id] + ")" : "";
        return `<span class="tongxin-pill">${escapeHtml(f.name)}${at}</span>`;
    }).join("");
    return `<div class="cohort-row"><span class="label">同行</span>${pills}此山已有 ${cohort.length} 位山友走过</div>`;
}

/* ============================================================
   🌤 路线详情页 · 实时山中天气
   ============================================================ */
async function loadRouteWeather(r) {
    const box = $("routeWeather");
    if (!box) return;
    const c = r.coords;
    if (!c) { box.innerHTML = '<p style="color:var(--text-mute);">此山未设坐标</p>'; return; }

    if (!WEATHER.hasKey()) {
        box.innerHTML = `<div class="route-weather-empty">
            <p style="margin-bottom:8px;">尚未配置和风天气 API</p>
            <button class="share-btn primary" id="setupWeatherBtn">⚙ 配置天气 API(免费)</button>
        </div>`;
        $("setupWeatherBtn").addEventListener("click", openWeatherSetup);
        return;
    }

    box.innerHTML = '<p style="color:var(--text-mute);text-align:center;padding:20px;">正在拉取山中天气...</p>';

    try {
        const [now, week, warn, indices] = await Promise.all([
            WEATHER.todayBrief(c.lon, c.lat),
            WEATHER.week7d(c.lon, c.lat),
            WEATHER.warningFor(c.lon, c.lat),
            WEATHER.indicesFor(c.lon, c.lat)
        ]);

        if (!now && (!week || week.length === 0)) {
            box.innerHTML = '<p style="color:var(--text-mute);">天气获取失败,请检查 API key 是否有效</p>';
            return;
        }

        const nowHtml = now ? `<div class="rw-now">
            <div class="rw-icon">${now.icon}</div>
            <div class="rw-cur">
                <div class="rw-text">${now.text} · ${now.temp}</div>
                <div class="rw-meta">体感 ${now.feels} · ${now.wind} · 湿度 ${now.humidity}</div>
            </div>
        </div>` : "";

        const weekHtml = (week && week.length > 0) ? `<div class="rw-week">${
            week.slice(0, 7).map(w => `<div class="rw-day ${w.good <= 2 ? "warn" : ""}">
                <div class="d-label">${w.label}</div>
                <div class="d-icon">${w.icon}</div>
                <div class="d-name">${w.name}</div>
                <div class="d-temp">${w.temp}</div>
            </div>`).join("")
        }</div>` : "";

        const warnHtml = (warn && warn.length > 0) ? `<div class="rw-warn">
            ⚠️ ${warn.map(w => `<strong>${w.title || w.typeName || ""}</strong>:${w.text || ""}`).join(" · ")}
        </div>` : "";

        const indicesHtml = buildIndicesBlock(indices);

        box.innerHTML = nowHtml + warnHtml + weekHtml + indicesHtml;
    } catch (err) {
        console.error(err);
        box.innerHTML = '<p style="color:var(--text-mute);">天气获取出错</p>';
    }
}

/* 生活指数 */
const INDEX_ICON = {
    "1": "🏃",   // 运动
    "2": "🚗",   // 洗车
    "3": "👕",   // 穿衣
    "5": "☀️",   // 紫外线
    "6": "🎣",   // 钓鱼
    "9": "🤧",   // 感冒
    "14": "🤧",  // 过敏
    "15": "🧳",  // 旅游
    "16": "🌫"   // 空气
};

function buildIndicesBlock(indices) {
    if (!indices || indices.length === 0) return "";
    const cards = indices.map(d => {
        const ic = INDEX_ICON[d.type] || "📊";
        const lvl = d.category || d.level;
        return `<div class="idx-card" title="${escapeHtml(d.text || "")}">
            <div class="idx-head">
                <span class="idx-ico">${ic}</span>
                <span class="idx-name">${escapeHtml(d.name)}</span>
                <span class="idx-level lvl-${d.level}">${escapeHtml(lvl)}</span>
            </div>
            <div class="idx-text">${escapeHtml((d.text || "").slice(0, 60))}</div>
        </div>`;
    }).join("");
    return `<div class="rw-section-title">📊 今日生活指数</div>
        <div class="indices-grid">${cards}</div>`;
}

/* ============================================================
   ⚙ 和风天气 · 设置 API key
   ============================================================ */
function openWeatherSetup() {
    let modal = $("weatherSetupModal");
    if (!modal) {
        modal = document.createElement("div");
        modal.id = "weatherSetupModal";
        modal.className = "modal";
        modal.innerHTML = `
            <div class="weather-setup-content">
                <span class="close-btn" id="weatherSetupClose">&times;</span>
                <h2 class="planner-title">⚙ 配置和风天气 API</h2>
                <div id="weatherSetupBody"></div>
            </div>`;
        document.body.appendChild(modal);
        modal.addEventListener("click", e => { if (e.target.id === "weatherSetupModal") modal.classList.remove("active"); });
        document.body.querySelector("#weatherSetupClose").addEventListener("click", () => modal.classList.remove("active"));
    }

    const curKey = WEATHER.getKey();
    const curHost = WEATHER.getHost();

    $("weatherSetupBody").innerHTML = `
        <p style="font-family:var(--font-poem);color:var(--text-soft);line-height:1.8;letter-spacing:0.05em;">
            和风天气 <strong>开发版免费</strong>(每日 1000 次调用),足够个人使用。<br/>
            数据存在你本地,不上传任何服务器。
        </p>

        <ol style="margin:14px 0 14px 22px;color:var(--text-soft);line-height:2;font-size:0.9rem;">
            <li>访问 <a href="https://dev.qweather.com/" target="_blank" rel="noopener" style="color:var(--seal-red);">dev.qweather.com</a> 注册账号</li>
            <li>控制台 → 应用管理 → 创建应用 → 选 <strong>Web API</strong></li>
            <li>得到 <strong>API KEY</strong> 与 <strong>API Host</strong>(可能形如 <code style="background:var(--route-soft);padding:1px 4px;border-radius:3px;">xxxxx.re.qweatherapi.com</code>)</li>
            <li>把它们粘贴到下面</li>
        </ol>

        <div class="ed-field">
            <span class="ed-label">API Host(可选,默认 devapi.qweather.com)</span>
            <input type="text" id="weatherHostInput" value="${curHost}" placeholder="https://devapi.qweather.com">
        </div>
        <div class="ed-field">
            <span class="ed-label">API Key</span>
            <input type="text" id="weatherKeyInput" value="${curKey}" placeholder="例如 abc123def456..." autocomplete="off">
        </div>

        <div style="display:flex;gap:8px;margin-top:14px;flex-wrap:wrap;">
            <button class="share-btn primary" id="weatherSaveBtn">保存并测试</button>
            <button class="share-btn" id="weatherClearBtn">清除</button>
            <button class="share-btn" id="weatherClearCacheBtn">清除缓存</button>
        </div>

        <div id="weatherTestResult" style="margin-top:14px;"></div>

        <p style="font-size:0.78rem;color:var(--text-mute);margin-top:18px;line-height:1.6;">
            ⚠️ key 仅存于此设备 localStorage,不上传服务器。<br/>
            若清除浏览器数据,需重新填入。生产部署可考虑用代理隐藏 key。
        </p>`;

    $("weatherSaveBtn").addEventListener("click", async () => {
        const k = $("weatherKeyInput").value.trim();
        const h = $("weatherHostInput").value.trim();
        if (!k) { toast("请填入 key"); return; }
        WEATHER.setKey(k);
        if (h) WEATHER.setHost(h);
        WEATHER.clearCache();
        $("weatherTestResult").innerHTML = '<p style="color:var(--text-mute);">正在测试...</p>';
        const test = await WEATHER.todayBrief(114.51, 38.04);
        if (test) {
            $("weatherTestResult").innerHTML = `<div style="background:rgba(74,140,74,0.1);border:1px solid #5a8c4a;padding:10px 14px;border-radius:8px;color:#3a6e3a;">
                ✓ 测试成功!石家庄当前 ${test.text} ${test.temp}</div>`;
            toast("天气配置成功");
        } else {
            $("weatherTestResult").innerHTML = `<div style="background:rgba(201,64,42,0.1);border:1px solid var(--seal-red);padding:10px 14px;border-radius:8px;color:var(--seal-red);">
                ✗ 测试失败 — 请检查 key/Host 是否正确(开发者 Host 形如 xxxx.re.qweatherapi.com,通常需把上方 Host 改为该地址,首尾不带斜杠)</div>`;
        }
    });

    $("weatherClearBtn").addEventListener("click", () => {
        if (!confirm("清除已保存的 API key?")) return;
        WEATHER.clearKey();
        WEATHER.clearCache();
        $("weatherKeyInput").value = "";
        toast("已清除");
    });

    $("weatherClearCacheBtn").addEventListener("click", () => {
        WEATHER.clearCache();
        toast("缓存已清除");
    });

    modal.classList.add("active");
}

/* ============================================================
   ⚡ 预警轮询 + 浏览器通知
   ============================================================ */
const WARN_CHECK_INTERVAL = 60 * 60 * 1000; // 1 小时
const WARN_SEEN_KEY = "th_warn_seen";

function initWarningWatcher() {
    // 不强制要求通知权限,仅显示横幅;用户可在通知按钮里手动启用
    setTimeout(checkAllWarnings, 4000); // 启动 4 秒后第一次检查
    setInterval(checkAllWarnings, WARN_CHECK_INTERVAL);
    refreshNotifyButton();
}

function getWarnSeen() {
    try { return JSON.parse(localStorage.getItem(WARN_SEEN_KEY) || "{}"); }
    catch { return {}; }
}

function setWarnSeen(map) {
    try { localStorage.setItem(WARN_SEEN_KEY, JSON.stringify(map)); } catch {}
}

async function checkAllWarnings() {
    if (!WEATHER.hasKey()) return;
    const seen = getWarnSeen();
    const found = [];

    // 优先检查"出行计划路线",再检查"已访"路线,以减少 API 调用
    const planRid = STORE.getPlan() && STORE.getPlan().routeId;
    const ids = new Set();
    if (planRid) ids.add(planRid);
    [...state.visited].forEach(id => ids.add(id));
    if (ids.size === 0) {
        // 没有任何关注的山,只检查"距离市区最近"的一两条
        routes.slice(0, 2).forEach(r => ids.add(r.id));
    }

    for (const id of ids) {
        const r = routes.find(x => x.id === id);
        if (!r || !r.coords) continue;
        try {
            const warns = await WEATHER.warningFor(r.coords.lon, r.coords.lat);
            if (warns && warns.length > 0) {
                warns.forEach(w => {
                    const wid = `${id}:${w.id || w.title || ""}`;
                    if (!seen[wid]) {
                        seen[wid] = Date.now();
                        found.push({ route: r, warn: w });
                    }
                });
            }
        } catch {}
    }

    setWarnSeen(seen);
    pruneSeenWarnings(seen);

    if (found.length > 0) showWarnBanner(found);
}

function pruneSeenWarnings(seen) {
    // 保留最近 7 天的记录
    const cutoff = Date.now() - 7 * 86400 * 1000;
    Object.keys(seen).forEach(k => { if (seen[k] < cutoff) delete seen[k]; });
    setWarnSeen(seen);
}

function showWarnBanner(items) {
    let bar = $("warnBanner");
    if (!bar) {
        bar = document.createElement("div");
        bar.id = "warnBanner";
        bar.className = "warn-banner";
        const hero = document.querySelector(".hero");
        if (hero && hero.parentNode) hero.parentNode.insertBefore(bar, hero.nextSibling);
        else document.body.prepend(bar);
    }
    const txt = items.map(x => `${x.route.name}:${x.warn.title || x.warn.typeName || "气象预警"}`).join(" · ");
    bar.innerHTML = `<span>⚡ 气象预警</span> ${escapeHtml(txt)}
        <span class="x" id="warnBarClose">收</span>`;
    bar.classList.add("show");
    $("warnBarClose").addEventListener("click", () => bar.classList.remove("show"));

    // 推送本地通知(若已授权)
    if ("Notification" in window && Notification.permission === "granted") {
        items.forEach(x => {
            try {
                new Notification("⚡ " + x.route.name + " 气象预警", {
                    body: x.warn.title || x.warn.typeName || "请关注",
                    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Cpath d='M2 26 L10 14 L14 20 L20 8 L30 26 Z' fill='%23c9402a'/%3E%3C/svg%3E",
                    tag: "th-warn-" + x.route.id
                });
            } catch {}
        });
    }
}

function refreshNotifyButton() {
    // 在安全侧栏增加通知开关
    const safetyBody = document.querySelector(".safety-body");
    if (!safetyBody) return;
    if (document.getElementById("notifyToggleBtn")) return;
    const block = document.createElement("div");
    block.style.marginBottom = "12px";
    block.innerHTML = `<h4>⚡ 气象预警推送</h4>
        <p style="font-size:0.85rem;color:var(--text-soft);line-height:1.6;margin-bottom:8px;">
            授权浏览器通知后,出现暴雨/雷电/大风等预警时自动弹出,无需打开网页。每小时检查一次。
        </p>
        <button class="share-btn" id="notifyToggleBtn" style="width:100%;"></button>`;
    safetyBody.insertBefore(block, safetyBody.children[2] || null);
    updateNotifyToggleLabel();
    $("notifyToggleBtn").addEventListener("click", async () => {
        if (!("Notification" in window)) { toast("此浏览器不支持通知"); return; }
        if (Notification.permission === "granted") {
            new Notification("行山志", { body: "通知已启用,有预警时会自动提醒。" });
            return;
        }
        const p = await Notification.requestPermission();
        if (p === "granted") {
            toast("已开启预警通知");
            updateNotifyToggleLabel();
            // 立刻检查一次
            checkAllWarnings();
        } else {
            toast("已拒绝,可在浏览器设置中重新开启");
        }
    });
}

function updateNotifyToggleLabel() {
    const btn = $("notifyToggleBtn");
    if (!btn) return;
    if (!("Notification" in window)) { btn.textContent = "浏览器不支持"; btn.disabled = true; return; }
    const p = Notification.permission;
    btn.textContent = p === "granted" ? "✓ 已启用预警通知(测试)" : p === "denied" ? "已拒绝(请到浏览器设置改)" : "🔔 启用预警推送";
    btn.classList.toggle("primary", p === "granted");
}
