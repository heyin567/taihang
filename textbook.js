/* ============================================================
   行山志 · 诗山行 (课本主线)
   --------------------
   按年级竖轴展开:从一年级到高中,逐年级列出课本所选咏山诗,
   每首诗对应一座入卷之山。未涉山诗的年级如实留白,
   不强凑、不附会;读者沿竖轴下滑,如复习一遍童年到少年的语文课本。
   ============================================================ */
(function () {
    "use strict";

    function getRouteById(id) {
        if (typeof routes === "undefined") return null;
        return routes.find(r => r.id === id) || null;
    }

    const KIND_ORDER = { "诗": 0, "文": 1, "事": 2 };
    function sortByKind(subjects) {
        return [...subjects].sort((a, b) => {
            const ka = KIND_ORDER[a.kind || "诗"] ?? 9;
            const kb = KIND_ORDER[b.kind || "诗"] ?? 9;
            return ka - kb;
        });
    }
    function kindMeta(kind) {
        switch (kind) {
            case "文": return { cls: "tb-kind-wen", label: "文", hint: "课本游山记" };
            case "事": return { cls: "tb-kind-shi", label: "事", hint: "历史课本所记" };
            case "诗":
            default:   return { cls: "tb-kind-poem", label: "诗", hint: "语文课本所诵" };
        }
    }

    function renderRouteChip(routeId) {
        const r = getRouteById(routeId);
        if (!r) return "";
        const cls = (r.region === "hidden") ? "tb-chip-hidden"
                   : (r.type === "remote") ? "tb-chip-remote"
                   : "tb-chip-local";
        const tag = (r.region === "hidden") ? "隐山"
                   : (r.type === "remote") ? "远望"
                   : "实地";
        return `<a class="tb-chip ${cls}" href="?route=${routeId}" data-route="${routeId}">
            <span class="tb-chip-tag">${tag}</span>
            <span class="tb-chip-name">${r.name}</span>
            ${r.epithet ? `<span class="tb-chip-epithet">${r.epithet}</span>` : ""}
        </a>`;
    }

    function openTextbookLine() {
        const modal = document.getElementById("textbookLineModal");
        const body  = document.getElementById("textbookLineBody");
        if (!modal || !body) return;

        const timeline = (typeof getTextbookTimeline === "function") ? getTextbookTimeline() : [];

        const stages = timeline.map((g, i) => {
            const isEmpty = !g.subjects || g.subjects.length === 0;
            const stageGroup = i < 6 ? "primary" : (i < 10 ? "middle" : "high");
            const stageLabel = i < 6 ? "小学" : (i < 10 ? "初中" : "高中");

            const cards = isEmpty ? `
                <div class="tb-empty">
                    <span class="tb-empty-mark">·</span>
                    <span class="tb-empty-text">此年级未及山诗</span>
                </div>
            ` : sortByKind(g.subjects).map(s => {
                const km = kindMeta(s.kind || "诗");
                const author = s.protagonist || s.poet || "";
                const dyn = s.dynasty || "";
                return `
                <article class="tb-card ${km.cls}" data-route="${s.routeId}">
                    <div class="tb-card-head">
                        <span class="tb-card-kind" title="${km.hint}">${km.label}</span>
                        <span class="tb-card-version">${s.version}</span>
                    </div>
                    <blockquote class="tb-card-line">${s.line}</blockquote>
                    <div class="tb-card-poet">—— ${dyn}·${author}《${s.title}》</div>
                    <p class="tb-card-note">${s.note}</p>
                    <div class="tb-card-foot">
                        <span class="tb-card-foot-label">所写山志</span>
                        ${renderRouteChip(s.routeId)}
                    </div>
                </article>
                `;
            }).join("");

            return `
                <li class="tb-stage ${stageGroup} ${isEmpty ? "is-empty" : ""}">
                    <div class="tb-stage-dot"></div>
                    <div class="tb-stage-grade">
                        <span class="tb-stage-stage">${stageLabel}</span>
                        <span class="tb-stage-grade-name">${g.grade.replace(stageLabel, "")}</span>
                    </div>
                    <div class="tb-stage-body">${cards}</div>
                </li>
            `;
        }).join("");

        body.innerHTML = `
            <div class="tb-head">
                <h2 class="tb-title">诗山行 · 跟着课本去爬山</h2>
                <p class="tb-sub">自一年级《咏华山》起,至高中《登泰山记》止——三轴并行:语文课本之诗、游山记之文、历史课本之事。少年时所读,如今可以亲自去看。</p>
                <div class="tb-legend">
                    <span class="tb-legend-item tb-kind-poem"><span class="tb-legend-dot">诗</span>语文 · 咏山</span>
                    <span class="tb-legend-item tb-kind-wen"><span class="tb-legend-dot">文</span>语文 · 游山记</span>
                    <span class="tb-legend-item tb-kind-shi"><span class="tb-legend-dot">事</span>历史 · 名人登临</span>
                </div>
            </div>
            <ol class="tb-timeline">${stages}</ol>
            <div class="tb-foot">
                <p>课本所选,皆民国以来最厚重之咏山诗与游山记,兼及历代帝王封禅、文人登临之事。诵之于课堂,登之于山野——少年所背,中年方知。</p>
                <p class="tb-foot-meta">凡得 ${timeline.reduce((n, g) => n + (g.subjects ? g.subjects.length : 0), 0)} 则 · ${new Set(timeline.flatMap(g => (g.subjects || []).map(s => s.routeId))).size} 座山。</p>
            </div>
        `;

        modal.classList.add("active");

        body.querySelectorAll(".tb-chip").forEach(chip => {
            chip.addEventListener("click", e => {
                e.preventDefault();
                const id = parseInt(chip.dataset.route);
                modal.classList.remove("active");
                if (typeof window.openModalById === "function") {
                    setTimeout(() => window.openModalById(id), 200);
                }
            });
        });
    }

    function init() {
        const btn   = document.getElementById("textbookLineBtn");
        const modal = document.getElementById("textbookLineModal");
        const close = document.getElementById("textbookLineClose");
        if (!btn || !modal) return;

        btn.addEventListener("click", openTextbookLine);
        if (close) close.addEventListener("click", () => modal.classList.remove("active"));
        modal.addEventListener("click", e => {
            if (e.target === modal) modal.classList.remove("active");
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }

    window.openTextbookLine = openTextbookLine;
})();
