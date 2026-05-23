/* ============================================================
   行山志 · 山川舆图 (atlas.js)
   --------------------
   - 仿《禹贡九州图》水墨青绿舆图
   - 自动从 routes[] 读取 coords,无需手工维护
   - 太行实地为青绿小山,五岳/远望为朱印小山,新增山自动落点
   - 悬停起伏,点击进卷
   ============================================================ */

(function () {
    "use strict";

    // 中国本土经纬度范围(粗略,够用)
    const LON_MIN = 73, LON_MAX = 135;   // 经度
    const LAT_MIN = 18, LAT_MAX = 54;    // 纬度
    // SVG viewBox
    const VB_W = 1200, VB_H = 800;
    // 地图绘制留白
    const PAD_X = 60, PAD_Y = 60;

    // 经纬度 → SVG 坐标
    function project(lon, lat) {
        const x = PAD_X + (lon - LON_MIN) / (LON_MAX - LON_MIN) * (VB_W - 2 * PAD_X);
        // 纬度越大越靠北,SVG y 越小
        const y = PAD_Y + (LAT_MAX - lat) / (LAT_MAX - LAT_MIN) * (VB_H - 2 * PAD_Y);
        return { x, y };
    }

    /* ============================================================
       中国轮廓 path(极简手描九州外形,非测绘级)
       ============================================================ */
    const CHINA_PATH = `
        M 760 720 L 720 730 L 680 740 L 640 745 L 600 740
        L 560 720 L 520 700 L 490 680 L 470 650 L 460 620
        L 450 590 L 440 560 L 420 545 L 395 540 L 370 555
        L 350 575 L 330 590 L 305 595 L 285 580 L 270 555
        L 250 540 L 220 545 L 195 560 L 170 580 L 150 605
        L 130 630 L 110 660 L 100 690 L 95 715 L 105 730
        L 130 728 L 110 705 L 100 685 L 105 665
        M 95 715 L 80 700 L 70 670 L 65 635 L 75 600 L 95 565
        L 115 530 L 130 495 L 135 460 L 130 425 L 115 395
        L 95 370 L 75 360 L 65 380 L 70 410 L 80 440 L 90 470
        L 100 500 L 105 525 L 100 540 L 95 555 L 80 540
        L 60 520 L 55 495 L 60 470 L 75 445 L 95 420 L 115 395
        L 130 365 L 145 335 L 160 310 L 185 290 L 215 280
        L 245 275 L 280 270 L 320 260 L 360 240 L 400 220
        L 445 205 L 490 195 L 540 190 L 590 195 L 640 205
        L 690 220 L 740 235 L 790 250 L 840 270 L 890 290
        L 935 315 L 975 345 L 1010 380 L 1040 415 L 1065 450
        L 1085 485 L 1095 520 L 1095 555 L 1080 580 L 1060 595
        L 1035 600 L 1010 595 L 985 585 L 960 580 L 935 590
        L 910 605 L 885 625 L 860 640 L 835 645 L 810 645
        L 785 645 L 765 655 L 755 680 L 760 710 L 760 720 Z`;

    // 海南、台湾(简化为小岛)
    const ISLANDS = [
        // 海南
        { d: "M 715 730 q 18 -8 35 0 q 8 12 0 22 q -18 6 -35 -2 q -10 -10 0 -20 z", label: "" },
        // 台湾
        { d: "M 1010 525 q 6 18 4 36 q -2 18 -10 30 q -8 -8 -10 -28 q -2 -22 6 -38 z", label: "" }
    ];

    /* ============================================================
       主要山系示意线(写意,非测绘)
       ============================================================ */
    const MOUNTAIN_RANGES = [
        // 太行山脉(华北,纵向)
        { name: "太行", d: "M 750 290 Q 770 350 780 410 T 810 530", w: 2.5, opacity: 0.5 },
        // 燕山(北)
        { name: "燕山", d: "M 750 250 Q 800 240 850 245", w: 2, opacity: 0.4 },
        // 秦岭(中)
        { name: "秦岭", d: "M 600 460 Q 680 470 770 475", w: 2.2, opacity: 0.45 },
        // 大别山
        { name: "大别", d: "M 800 510 Q 840 520 880 535", w: 1.8, opacity: 0.35 },
        // 武夷
        { name: "武夷", d: "M 920 580 Q 935 615 945 645", w: 1.8, opacity: 0.35 },
        // 横断
        { name: "横断", d: "M 470 510 Q 490 560 510 610", w: 2, opacity: 0.4 },
        // 喜马拉雅
        { name: "喜马拉雅", d: "M 280 500 Q 380 540 470 555", w: 2.2, opacity: 0.4 },
        // 天山
        { name: "天山", d: "M 240 320 Q 320 320 400 325", w: 2, opacity: 0.4 },
        // 长江
        { jiang: true, name: "长江", d: "M 530 480 Q 660 510 760 540 T 950 590 T 1020 615", w: 1.6, opacity: 0.55, color: "#5a7ba0" },
        // 黄河
        { jiang: true, name: "黄河", d: "M 470 380 Q 540 360 610 400 T 760 420 T 880 440 T 970 470", w: 1.6, opacity: 0.55, color: "#a08555" }
    ];

    /* ============================================================
       渲染舆图
       ============================================================ */
    function renderAtlas() {
        const host = document.getElementById("atlasStage");
        if (!host) return;
        const list = (typeof routes !== "undefined" && Array.isArray(routes)) ? routes : [];
        const peaks = list.filter(r => r.coords && typeof r.coords.lon === "number" && typeof r.coords.lat === "number");

        const rangePaths = MOUNTAIN_RANGES.map(m => {
            const stroke = m.color || "#5a7048";
            return `<path d="${m.d}" fill="none" stroke="${stroke}" stroke-width="${m.w}" stroke-linecap="round" opacity="${m.opacity}"
                    ${m.jiang ? 'stroke-dasharray="0"' : 'stroke-dasharray="3 4"'}/>`;
        }).join("");

        const islandPaths = ISLANDS.map(i => `<path d="${i.d}" fill="url(#atlasLand)" stroke="#6b4a2a" stroke-width="1.2" opacity="0.85"/>`).join("");

        const peakNodes = peaks.map((r, idx) => {
            const p = project(r.coords.lon, r.coords.lat);
            const isRemote = r.type === "remote";
            const visited = (typeof STORE !== "undefined" && STORE.getVisited)
                ? STORE.getVisited().has(r.id) : false;
            const cls = `atlas-peak ${isRemote ? "is-remote" : "is-local"} ${visited ? "is-visited" : ""}`;
            // 山头形状:小三角带阴影
            return `
                <g class="${cls}" data-id="${r.id}" transform="translate(${p.x.toFixed(1)} ${p.y.toFixed(1)})" tabindex="0" role="button" aria-label="${r.name}">
                    <path class="peak-shadow" d="M -14 6 Q 0 -2 14 6 Z" fill="rgba(40,30,15,0.25)"/>
                    <path class="peak-back" d="M -16 4 L -6 -14 L 4 4 Z" fill="${isRemote ? "#9a3a22" : "#3d6e5a"}" opacity="0.6"/>
                    <path class="peak-front" d="M -10 6 L 2 -18 L 14 6 Z"
                        fill="${isRemote ? "#c9402a" : "#5a8c6a"}"
                        stroke="${isRemote ? "#6b1a08" : "#234a32"}" stroke-width="0.8" stroke-linejoin="round"/>
                    ${visited ? `<circle class="peak-seal" cx="11" cy="-9" r="4" fill="#c9402a" stroke="#fff5e0" stroke-width="0.8"/>` : ""}
                    <text class="peak-name" y="20" text-anchor="middle">${r.name}</text>
                </g>`;
        }).join("");

        const counts = {
            local: peaks.filter(p => p.type !== "remote").length,
            remote: peaks.filter(p => p.type === "remote").length,
            visited: peaks.filter(p => {
                if (typeof STORE === "undefined" || !STORE.getVisited) return false;
                return STORE.getVisited().has(p.id);
            }).length
        };

        host.innerHTML = `
            <div class="atlas-frame">
                <div class="atlas-corner tl"></div>
                <div class="atlas-corner tr"></div>
                <div class="atlas-corner bl"></div>
                <div class="atlas-corner br"></div>
                <div class="atlas-stamp">山<br>川<br>舆<br>图</div>
                <svg class="atlas-svg" viewBox="0 0 ${VB_W} ${VB_H}" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
                    <defs>
                        <radialGradient id="atlasLand" cx="0.5" cy="0.4" r="0.7">
                            <stop offset="0%" stop-color="#e8dcb4"/>
                            <stop offset="55%" stop-color="#d8c895"/>
                            <stop offset="100%" stop-color="#b8a370"/>
                        </radialGradient>
                        <pattern id="atlasPaper" patternUnits="userSpaceOnUse" width="60" height="60">
                            <rect width="60" height="60" fill="#f1e2bd"/>
                            <circle cx="12" cy="20" r="0.6" fill="#a89060" opacity="0.3"/>
                            <circle cx="42" cy="48" r="0.5" fill="#a89060" opacity="0.25"/>
                            <circle cx="28" cy="38" r="0.4" fill="#a89060" opacity="0.2"/>
                        </pattern>
                        <filter id="atlasShadow" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur stdDeviation="4"/>
                            <feOffset dx="0" dy="3"/>
                        </filter>
                    </defs>

                    <rect width="${VB_W}" height="${VB_H}" fill="url(#atlasPaper)"/>

                    <!-- 海域 -->
                    <rect width="${VB_W}" height="${VB_H}" fill="rgba(120,160,180,0.05)"/>

                    <!-- 中国陆地 -->
                    <path d="${CHINA_PATH}" fill="url(#atlasLand)" stroke="#6b4a2a" stroke-width="1.5" stroke-linejoin="round" opacity="0.92" filter="url(#atlasShadow)"/>

                    <!-- 岛屿 -->
                    ${islandPaths}

                    <!-- 山系暗线 -->
                    <g class="atlas-ranges">${rangePaths}</g>

                    <!-- 方位指示 -->
                    <g class="atlas-compass" transform="translate(1110 90)">
                        <circle r="28" fill="rgba(255,250,235,0.7)" stroke="#6b4a2a" stroke-width="1.2"/>
                        <path d="M 0 -22 L 5 0 L 0 22 L -5 0 Z" fill="#8a2818"/>
                        <text y="-32" text-anchor="middle" font-size="14" fill="#6b3a1a">北</text>
                        <text y="40" text-anchor="middle" font-size="14" fill="#6b4a2a">南</text>
                    </g>

                    <!-- 标题印 -->
                    <g transform="translate(110 95)">
                        <rect x="-44" y="-22" width="88" height="44" fill="#8a2818" rx="3"/>
                        <text y="6" text-anchor="middle" font-size="22" fill="#fff5e0" letter-spacing="6" font-family="LXGW WenKai Screen, serif">山川</text>
                    </g>

                    <!-- 山头落点 -->
                    <g class="atlas-peaks">${peakNodes}</g>
                </svg>
                <div class="atlas-tools">
                    <span class="atlas-stat"><i class="dot dot-local"></i>实地 ${counts.local}</span>
                    <span class="atlas-stat"><i class="dot dot-remote"></i>远望 ${counts.remote}</span>
                    <span class="atlas-stat"><i class="dot dot-visited"></i>已徒 ${counts.visited}</span>
                    <span class="atlas-tip">点击山头 · 入卷</span>
                </div>
            </div>
        `;

        // 事件:点击/键盘
        host.querySelectorAll(".atlas-peak").forEach(g => {
            const id = parseInt(g.getAttribute("data-id"), 10);
            const route = list.find(r => r.id === id);
            const handle = () => {
                if (typeof window.openModalById === "function") {
                    window.openModalById(id);
                } else {
                    document.querySelector(`.route-card[data-id="${id}"]`)?.click();
                }
            };
            g.addEventListener("click", handle);
            g.addEventListener("keydown", e => {
                if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handle(); }
            });
            // 悬浮提示
            g.addEventListener("mouseenter", e => showTip(g, route));
            g.addEventListener("mouseleave", hideTip);
            g.addEventListener("focus", () => showTip(g, route));
            g.addEventListener("blur", hideTip);
        });
    }

    let tipEl = null;
    function showTip(g, r) {
        if (!r) return;
        hideTip();
        tipEl = document.createElement("div");
        tipEl.className = "atlas-tip-bubble";
        const region = r.type === "remote"
            ? (r.location || "远望志")
            : (r.location || "太行");
        tipEl.innerHTML = `
            <div class="atip-name">${r.name}${r.epithet ? `<span>· ${r.epithet}</span>` : ""}</div>
            <div class="atip-meta">📍 ${region} · ${r.bestSeason || ""}</div>
            ${r.poem ? `<div class="atip-poem">${r.poem.lines[r.poem.lines.length - 1]}<span>— ${r.poem.author}</span></div>` : ""}
            <div class="atip-go">点击入卷 →</div>`;
        document.body.appendChild(tipEl);
        const rect = g.getBoundingClientRect();
        const tw = tipEl.offsetWidth, th = tipEl.offsetHeight;
        let left = rect.left + rect.width / 2 - tw / 2 + window.scrollX;
        let top = rect.top + window.scrollY - th - 12;
        if (top < window.scrollY + 8) top = rect.bottom + window.scrollY + 12;
        if (left < 8) left = 8;
        if (left + tw > window.innerWidth - 8) left = window.innerWidth - tw - 8;
        tipEl.style.left = left + "px";
        tipEl.style.top = top + "px";
        requestAnimationFrame(() => tipEl && tipEl.classList.add("show"));
    }
    function hideTip() {
        if (tipEl) { tipEl.remove(); tipEl = null; }
    }

    // 暴露给全局,新增山时可重渲
    window.renderAtlas = renderAtlas;

    // 自动初始化
    function init() {
        if (document.getElementById("atlasStage")) renderAtlas();
    }
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
