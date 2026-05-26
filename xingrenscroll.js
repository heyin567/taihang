/* ============================================================
   行人卷轴 · 以人观山 · 知行合一
   - 在「行人志」卷钮被点亮时,于舆图上方注入一道横卷
   - 立人(SVG 古风线描)+ 立卷诗 + 三山时序珠链
   - 点珠链上任一山,跳入该山详卷
   - 当前唯一行人:王阳明 · 阳明三山行(阳明洞 → 龙冈 → 白鹿)
   ============================================================ */
(function () {
    "use strict";

    /* ------------------------------------------------------------
       行人谱:一人对应若干山,按生平年序排
       后续可扩 徐霞客、毛泽东 等
       ------------------------------------------------------------ */
    const XINGREN_LIST = [
        {
            key: "yangming",
            name: "王阳明",
            fullName: "王守仁 · 字伯安 · 号阳明",
            life: "1472 — 1529",
            epithet: "知行合一 · 致良知",
            kernel: "阳明三山行",
            poem: {
                title: "立卷诗",
                lines: [
                    "尔身各各自天真",
                    "不用求人更问人",
                    "但致良知成德业",
                    "谩从故纸费精神"
                ],
                author: "王阳明 · 《白鹿洞别诸生》"
            },
            prose: [
                "**立人**:王守仁,字伯安,余姚人也。少负豪迈,长习兵法,中岁两入仕,皆以直谏获咎。然其立身之骨,不在朝堂而在三山 — 一山立其名,一山立其道,一山立其学。",
                "**立志**:1502 年,告病归越,筑室会稽宛委之阳明洞,自号「阳明子」 — 名既立矣;1508 年,贬贵州龙场,龙冈山中悟「圣人之道,吾性自足」,「知行合一」自此而出 — 道既立矣;1521 年,讲学江西白鹿洞,与朱学并坐而辩,立「致良知」三字宗旨 — 学既立矣。",
                "**立行**:阳明非以书斋立志,乃以足量大地。三山之间,跨二十年、行九千里、贬过瘴疠、平过宁王、讲过书院 — 凡名所至、道所悟、学所立者,皆其足之所及。是为「知行合一」 — 知非空知,行非盲行;一山一悟,一悟一行,行而后又悟。"
            ],
            stations: [
                {
                    id: 35,
                    yearNum: 1502,
                    yearLabel: "1502",
                    age: "三十一岁",
                    place: "浙江 · 阳明洞",
                    pith: "立其名",
                    line: "筑室宛委洞侧 · 自号阳明子"
                },
                {
                    id: 34,
                    yearNum: 1508,
                    yearLabel: "1508",
                    age: "三十七岁",
                    place: "贵州 · 龙冈山",
                    pith: "立其道",
                    line: "龙场悟道 · 知行合一"
                },
                {
                    id: 36,
                    yearNum: 1521,
                    yearLabel: "1521",
                    age: "五十岁",
                    place: "江西 · 白鹿洞",
                    pith: "立其学",
                    line: "讲学白鹿 · 致良知"
                }
            ]
        }
    ];

    /* ------------------------------------------------------------
       王阳明 · 古风线描立像(SVG 内联)
       墨笔白描 + 一袭青衫 + 阴阳鱼立掌
       ------------------------------------------------------------ */
    function buildYangmingPortrait() {
        return `
        <svg class="xingren-portrait" viewBox="0 0 200 320" xmlns="http://www.w3.org/2000/svg" aria-label="王阳明 古风立像">
            <defs>
                <linearGradient id="xrRobe" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stop-color="#3a5a48"/>
                    <stop offset="50%" stop-color="#2c4838"/>
                    <stop offset="100%" stop-color="#1a2c22"/>
                </linearGradient>
                <radialGradient id="xrHalo" cx="0.5" cy="0.5" r="0.55">
                    <stop offset="0%" stop-color="#fff5e0" stop-opacity="0.6"/>
                    <stop offset="100%" stop-color="#fff5e0" stop-opacity="0"/>
                </radialGradient>
            </defs>

            <!-- 后景:山影远黛 -->
            <path d="M 0 230 Q 40 200 80 218 T 160 210 T 200 220 L 200 280 L 0 280 Z" fill="#5a7068" opacity="0.18"/>
            <path d="M 0 248 Q 50 222 100 240 T 200 238 L 200 280 L 0 280 Z" fill="#3a5a48" opacity="0.22"/>

            <!-- 头部光晕(知行合一之神主) -->
            <circle cx="100" cy="68" r="42" fill="url(#xrHalo)"/>

            <!-- 头巾(明代东坡巾形) -->
            <path d="M 76 36 Q 100 22 124 36 L 128 56 Q 124 60 122 64 L 78 64 Q 76 60 72 56 Z" fill="#2a2018" stroke="#1a1208" stroke-width="1"/>
            <path d="M 76 36 L 76 28 Q 100 16 124 28 L 124 36" fill="none" stroke="#1a1208" stroke-width="1"/>
            <line x1="100" y1="22" x2="100" y2="36" stroke="#5a3a1a" stroke-width="0.8" opacity="0.6"/>

            <!-- 面部 · 白描 -->
            <path d="M 80 64 Q 78 92 86 110 Q 94 122 100 124 Q 106 122 114 110 Q 122 92 120 64 Z" fill="#f5e6cd" stroke="#3a2818" stroke-width="0.9"/>

            <!-- 眉目 -->
            <path d="M 84 78 q 4 -2 10 0" stroke="#1a1208" stroke-width="1.2" fill="none" stroke-linecap="round"/>
            <path d="M 106 78 q 6 -2 10 0" stroke="#1a1208" stroke-width="1.2" fill="none" stroke-linecap="round"/>
            <ellipse cx="89" cy="84" rx="1.6" ry="1.1" fill="#1a1208"/>
            <ellipse cx="111" cy="84" rx="1.6" ry="1.1" fill="#1a1208"/>

            <!-- 鼻 -->
            <path d="M 100 84 Q 99 96 96 102 Q 100 105 104 102 Q 101 96 100 84" fill="none" stroke="#3a2818" stroke-width="0.8"/>

            <!-- 唇(微闭,有定见之色) -->
            <path d="M 94 110 Q 100 113 106 110" stroke="#5a2818" stroke-width="0.9" fill="none" stroke-linecap="round"/>

            <!-- 须(古文人须,长而垂) -->
            <path d="M 88 116 q 2 14 4 28 q 4 6 8 8" stroke="#1a1208" stroke-width="0.9" fill="none" stroke-linecap="round"/>
            <path d="M 112 116 q -2 14 -4 28 q -4 6 -8 8" stroke="#1a1208" stroke-width="0.9" fill="none" stroke-linecap="round"/>
            <path d="M 100 124 q 0 18 0 28" stroke="#1a1208" stroke-width="0.7" fill="none"/>

            <!-- 肩颈 -->
            <path d="M 86 122 Q 90 130 100 132 Q 110 130 114 122" fill="#f5e6cd" stroke="#3a2818" stroke-width="0.9"/>

            <!-- 衣领(交领右衽,儒生正制) -->
            <path d="M 70 152 Q 88 140 100 140 Q 112 140 130 152 L 100 156 Z" fill="#fff5e0" stroke="#3a2818" stroke-width="0.9"/>
            <path d="M 100 140 L 100 168" stroke="#3a2818" stroke-width="0.7"/>
            <path d="M 84 148 L 100 156 L 116 148" stroke="#3a2818" stroke-width="0.7" fill="none"/>

            <!-- 衣身(青衫宽袖) -->
            <path d="M 60 170 Q 50 220 48 280 L 152 280 Q 150 220 140 170 Q 130 158 120 156 L 80 156 Q 70 158 60 170 Z" fill="url(#xrRobe)" stroke="#1a1208" stroke-width="1"/>

            <!-- 衣纹(古风衣折) -->
            <path d="M 76 180 Q 84 220 80 270" stroke="#1a1208" stroke-width="0.7" fill="none" opacity="0.6"/>
            <path d="M 100 168 Q 100 220 100 280" stroke="#1a1208" stroke-width="0.6" fill="none" opacity="0.5"/>
            <path d="M 124 180 Q 116 220 120 270" stroke="#1a1208" stroke-width="0.7" fill="none" opacity="0.6"/>

            <!-- 腰带 -->
            <rect x="62" y="200" width="76" height="6" fill="#5a3a1a" stroke="#1a1208" stroke-width="0.6"/>
            <rect x="92" y="200" width="16" height="6" fill="#d4a017" stroke="#1a1208" stroke-width="0.5"/>

            <!-- 左袖(自然下垂) -->
            <path d="M 60 170 Q 40 200 38 240 Q 44 246 56 240 Q 58 210 70 188 Z" fill="url(#xrRobe)" stroke="#1a1208" stroke-width="0.8"/>

            <!-- 右袖 + 持卷之手 -->
            <path d="M 140 170 Q 160 200 162 234 Q 156 240 144 234 Q 142 208 130 188 Z" fill="url(#xrRobe)" stroke="#1a1208" stroke-width="0.8"/>
            <!-- 手 -->
            <ellipse cx="152" cy="232" rx="6" ry="5" fill="#f5e6cd" stroke="#3a2818" stroke-width="0.7"/>
            <!-- 卷轴(《传习录》) -->
            <rect x="148" y="222" width="4" height="22" fill="#fff5e0" stroke="#5a3a1a" stroke-width="0.6"/>
            <rect x="146" y="220" width="8" height="3" fill="#8a2818" stroke="#5a3a1a" stroke-width="0.5"/>
            <rect x="146" y="244" width="8" height="3" fill="#8a2818" stroke="#5a3a1a" stroke-width="0.5"/>

            <!-- 印记:阴阳鱼于胸前(知行合一之意) -->
            <g transform="translate(100 188)" opacity="0.78">
                <circle r="9" fill="none" stroke="#fff5e0" stroke-width="0.8"/>
                <path d="M 0 -9 A 9 9 0 0 1 0 9 A 4.5 4.5 0 0 1 0 0 A 4.5 4.5 0 0 0 0 -9 Z" fill="#fff5e0"/>
                <circle cx="0" cy="-4.5" r="1.2" fill="#1a2c22"/>
                <circle cx="0" cy="4.5" r="1.2" fill="#fff5e0"/>
            </g>

            <!-- 立地(脚下一抹水墨) -->
            <ellipse cx="100" cy="282" rx="40" ry="3" fill="#1a1208" opacity="0.4"/>
        </svg>`;
    }

    /* ------------------------------------------------------------
       Timeline 珠链 · 横向年序
       ------------------------------------------------------------ */
    function buildStationDots(stations, routes) {
        const dots = stations.map((s, i) => {
            const route = routes.find(r => r.id === s.id);
            const exists = !!route;
            const last = i === stations.length - 1;
            return `
            <li class="xs-station ${exists ? "" : "is-missing"}" data-id="${s.id}" tabindex="${exists ? 0 : -1}" role="${exists ? "button" : "presentation"}" aria-label="${s.yearLabel} · ${route ? route.name : s.place}">
                <div class="xs-year">${s.yearLabel}</div>
                <div class="xs-axis">
                    <span class="xs-bead"></span>
                    ${last ? "" : `<span class="xs-line"></span>`}
                </div>
                <div class="xs-card">
                    <div class="xs-pith">${s.pith}</div>
                    <div class="xs-name">${route ? route.name : s.place}</div>
                    <div class="xs-age">${s.age}</div>
                    <div class="xs-line-text">${s.line}</div>
                    ${exists ? `<div class="xs-go">入卷 →</div>` : `<div class="xs-go is-pending">尚未入卷</div>`}
                </div>
            </li>`;
        }).join("");
        return `<ol class="xs-stations">${dots}</ol>`;
    }

    /* ------------------------------------------------------------
       渲染主函数 · 注入卷轴到舆图上方
       ------------------------------------------------------------ */
    function renderXingrenScroll(detail) {
        // 仅在「行人志」卷钮亮起时显示
        const sec = document.getElementById("atlasSection");
        if (!sec) return;
        const old = document.getElementById("xingrenScroll");
        if (old) old.remove();

        if (detail.filter !== "xingren") return;

        const routes = (typeof window.routes !== "undefined" && Array.isArray(window.routes))
            ? window.routes
            : (Array.isArray(detail.list) ? detail.list : []);

        // 当前只一行人 — 后扩可遍历
        const ren = XINGREN_LIST[0];
        const portrait = buildYangmingPortrait();
        const dots = buildStationDots(ren.stations, routes);
        const proseHtml = ren.prose.map(p => `<p>${p.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")}</p>`).join("");

        const wrap = document.createElement("div");
        wrap.id = "xingrenScroll";
        wrap.className = "xingren-scroll";
        wrap.innerHTML = `
            <div class="xs-stage">
                <div class="xs-side">
                    ${portrait}
                    <div class="xs-side-meta">
                        <div class="xs-name-row">${ren.fullName}</div>
                        <div class="xs-life">${ren.life}</div>
                        <div class="xs-epithet">${ren.epithet}</div>
                        <div class="xs-poem">
                            <div class="xs-poem-title">${ren.poem.title}</div>
                            ${ren.poem.lines.map(l => `<div class="xs-poem-line">${l}</div>`).join("")}
                            <div class="xs-poem-author">— ${ren.poem.author}</div>
                        </div>
                    </div>
                </div>
                <div class="xs-main">
                    <div class="xs-head">
                        <div class="xs-kernel">${ren.kernel}</div>
                        <div class="xs-sub">以足量大地 · 以心量山河</div>
                    </div>
                    <div class="xs-prose">${proseHtml}</div>
                    ${dots}
                </div>
            </div>
        `;

        // 挂在 .atlas-head 与 .atlas-stage 之间
        const stage = document.getElementById("atlasStage");
        if (stage && stage.parentNode === sec) {
            sec.insertBefore(wrap, stage);
        } else {
            sec.appendChild(wrap);
        }

        // 珠链跳转
        wrap.querySelectorAll(".xs-station").forEach(li => {
            const id = parseInt(li.getAttribute("data-id"), 10);
            const exists = routes.some(r => r.id === id);
            if (!exists) return;
            const handle = () => {
                if (typeof window.openModalById === "function") window.openModalById(id);
                else document.querySelector(`.route-card[data-id="${id}"]`)?.click();
            };
            li.addEventListener("click", handle);
            li.addEventListener("keydown", e => {
                if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handle(); }
            });
        });
    }

    window.addEventListener("atlas:rendered", e => {
        renderXingrenScroll(e.detail || {});
    });
})();
