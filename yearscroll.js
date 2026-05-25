/* ============================================================
   行山志 · 岁卷(廿四节气长轴)
   --------------------
   每节气来访一次,可盖一枚岁印;集齐 24 印则「一岁山志成」。
   主线声口为徐霞客:卷主寄语 + 各节气一段「霞客曰」。
   霞客实到者(黄山/五岳/雁荡/武当/嵩山/终南)用「予曾」承之;
   未到者(燕赵小山等)用「霞客虽未及此」承之。
   ============================================================ */
(function () {
    "use strict";

    const SOLAR_ORDER = [
        "立春","雨水","惊蛰","春分","清明","谷雨",
        "立夏","小满","芒种","夏至","小暑","大暑",
        "立秋","处暑","白露","秋分","寒露","霜降",
        "立冬","小雪","大雪","冬至","小寒","大寒"
    ];

    function getGanzhiYear() {
        const STEMS = ["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"];
        const BRANCHES = ["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"];
        const y = new Date().getFullYear();
        const offset = (y - 4) % 60;
        return STEMS[offset % 10] + BRANCHES[offset % 12];
    }

    function getRouteById(id) {
        if (typeof routes === "undefined") return null;
        return routes.find(r => r.id === id) || null;
    }

    function fmtPeak(id) {
        const r = getRouteById(id);
        if (!r) return "";
        const cls = (r.region === "hidden") ? "yp-hidden" : (r.type === "remote") ? "yp-remote" : "yp-local";
        return `<a class="ys-peak ${cls}" href="?route=${id}" data-route="${id}">${r.name}</a>`;
    }

    function openYearScroll() {
        const modal = document.getElementById("yearScrollModal");
        const body  = document.getElementById("yearScrollBody");
        if (!modal || !body) return;

        const ganzhi = getGanzhiYear();
        const stamps = STORE.getYearStamps()[ganzhi] || {};
        const stampedCount = Object.keys(stamps).length;
        const cur = (typeof getCurrentSolarTerm === "function") ? getCurrentSolarTerm() : null;

        // 当节气当日来访则自动盖一枚(温和提示)
        let justStamped = false;
        if (cur && !stamps[cur.name]) {
            justStamped = STORE.stampTerm(ganzhi, cur.name);
        }

        const tiles = SOLAR_ORDER.map((name, i) => {
            const term  = (typeof SOLAR_TERMS !== "undefined") ? SOLAR_TERMS.find(t => t.name === name) : null;
            const data  = (typeof SEASONAL_BY_TERM !== "undefined") ? SEASONAL_BY_TERM[name] : null;
            const inked = !!stamps[name];
            const isNow = cur && cur.name === name;
            const seasonGroup = ["spring","spring","spring","spring","spring","spring",
                                "summer","summer","summer","summer","summer","summer",
                                "autumn","autumn","autumn","autumn","autumn","autumn",
                                "winter","winter","winter","winter","winter","winter"][i];
            const dateStr = term ? `${term.date[0]}月${term.date[1]}` : "";
            const stampedDate = inked ? stamps[name].date : "";

            return `
                <button class="ys-tile season-${seasonGroup} ${inked ? "is-inked" : ""} ${isNow ? "is-now" : ""}"
                        data-term="${name}">
                    <span class="ys-tile-no">${String(i+1).padStart(2,"0")}</span>
                    <span class="ys-tile-name">${name}</span>
                    <span class="ys-tile-date">${dateStr}</span>
                    ${inked ? `<span class="ys-ink">印</span>` : ""}
                    ${isNow ? `<span class="ys-now-tag">今</span>` : ""}
                </button>
            `;
        }).join("");

        const completion = stampedCount >= 24;
        const headerNote = completion
            ? `<span class="ys-success">一岁山志成 · 凡得廿四印</span>`
            : `<span class="ys-progress">已得 <em>${stampedCount}</em>/24 印 · 余 <em>${24 - stampedCount}</em> 节气未及</span>`;

        const justNote = justStamped
            ? `<div class="ys-just">今日为 <b>${cur.name}</b>,岁印一枚已落卷。<span class="ys-just-sub">下一节气来访,再添一印。</span></div>`
            : "";

        body.innerHTML = `
            <div class="ys-head">
                <div class="ys-title-row">
                    <h2 class="ys-title">岁卷 · ${ganzhi}年廿四节气长轴</h2>
                    <div class="ys-meta">${headerNote}</div>
                </div>
                <div class="ys-foreword">
                    <div class="ys-fw-seal">霞</div>
                    <div class="ys-fw-text">
                        <div class="ys-fw-title">霞客寄语</div>
                        <p>予一生好入名山,自天启元年游天台、雁荡始,至崇祯十二年抵丽江止,凡三十四年,所至必书。今者《行山志》以廿四节气为经,以山为纬,使读者一岁之中,与山相应;每过一节,辄添一印;一岁圆满,则山志亦圆。此事虽小,然合古之「应时而行」之意。诸君自珍。</p>
                        <p class="ys-fw-sign">—— 霞客 题于卷首</p>
                    </div>
                </div>
            </div>
            ${justNote}
            <div class="ys-grid">${tiles}</div>
            <div class="ys-detail" id="ysDetail" hidden></div>
        `;

        modal.classList.add("active");

        body.querySelectorAll(".ys-tile").forEach(btn => {
            btn.addEventListener("click", () => {
                const name = btn.dataset.term;
                renderTermDetail(name, ganzhi);
                body.querySelectorAll(".ys-tile").forEach(b => b.classList.remove("is-active"));
                btn.classList.add("is-active");
            });
        });

        // 默认展开当前节气
        if (cur) {
            const curBtn = body.querySelector(`.ys-tile[data-term="${cur.name}"]`);
            if (curBtn) curBtn.click();
        }
    }

    function renderTermDetail(termName, ganzhi) {
        const detail = document.getElementById("ysDetail");
        if (!detail) return;
        const term  = (typeof SOLAR_TERMS !== "undefined") ? SOLAR_TERMS.find(t => t.name === termName) : null;
        const data  = (typeof SEASONAL_BY_TERM !== "undefined") ? SEASONAL_BY_TERM[termName] : null;
        const pent  = (typeof PENTADS_BY_TERM !== "undefined") ? PENTADS_BY_TERM[termName] : null;
        const stamps = STORE.getYearStamps()[ganzhi] || {};
        const inked = !!stamps[termName];

        const peaks = (data && data.peaks) ? data.peaks.map(fmtPeak).filter(Boolean).join("、") : "(此节暂无应季山志)";
        const pentadHtml = pent ? pent.map((p, i) => `
            <div class="ys-pentad">
                <span class="ys-pentad-no">${["初","二","三"][i]}候</span>
                <span class="ys-pentad-name">${p.name}</span>
                <span class="ys-pentad-desc">${p.taihang}</span>
            </div>
        `).join("") : "";

        const xiakeBy = (data && data.xiakeBy) ? data.xiakeBy : "";
        const poem    = (data && data.poem) ? data.poem : (term ? term.poem : "");
        const act     = (data && data.act) ? data.act : "";
        const dateStr = term ? `${term.date[0]}月${term.date[1]}日` : "";

        detail.hidden = false;
        detail.innerHTML = `
            <div class="ys-detail-head">
                <h3>${termName} · ${dateStr}</h3>
                ${inked ? `<span class="ys-detail-ink">已盖印 · ${stamps[termName].date}</span>` : `<span class="ys-detail-noink">尚未及此节</span>`}
            </div>
            <div class="ys-detail-poem">${poem}</div>
            ${act ? `<div class="ys-detail-act">宜 · ${act}</div>` : ""}
            <div class="ys-detail-pentads">${pentadHtml}</div>
            ${xiakeBy ? `
                <blockquote class="ys-detail-xiake">
                    <div class="ys-xiake-mark">霞客曰</div>
                    <p>${xiakeBy}</p>
                </blockquote>
            ` : ""}
            <div class="ys-detail-peaks">
                <span class="ys-peaks-label">应季山志</span>
                <span class="ys-peaks-list">${peaks}</span>
            </div>
        `;
    }

    function init() {
        const btn = document.getElementById("yearScrollBtn");
        const modal = document.getElementById("yearScrollModal");
        const close = document.getElementById("yearScrollClose");
        if (!btn || !modal) return;

        btn.addEventListener("click", openYearScroll);
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

    window.openYearScroll = openYearScroll;
})();
