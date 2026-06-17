/* ============================================================
   行山志 · 伴山 (Banshan)
   - 常驻底层:时辰光线 + 节气山骨,以分钟为单位的极慢动
   - 入山静坐:压暗外物,只留中央卷轴,模拟阳明洞顿悟之夜
   - 闲置十分钟自浮一句心学/山诗,三十秒散去
   ============================================================ */
(function () {
    "use strict";

    const PHASES = [
        { start: 0,  end: 5,  name: "子", sky1: "#1a2032", sky2: "#2a3042", sun: null,        moon: "#dcd6c0", moonOp: 0.65 },
        { start: 5,  end: 7,  name: "卯", sky1: "#5a4838", sky2: "#a07858", sun: "#e8a868",   sunOp: 0.55,    moon: null  },
        { start: 7,  end: 9,  name: "辰", sky1: "#a8906a", sky2: "#d8c490", sun: "#f0c878",   sunOp: 0.85,    moon: null  },
        { start: 9,  end: 12, name: "巳", sky1: "#c8b888", sky2: "#e8d8b0", sun: "#f4d098",   sunOp: 0.9,     moon: null  },
        { start: 12, end: 14, name: "午", sky1: "#e0d4a8", sky2: "#f0e4c0", sun: "#f8e0a8",   sunOp: 0.95,    moon: null  },
        { start: 14, end: 16, name: "未", sky1: "#d4b888", sky2: "#e0c898", sun: "#f0b878",   sunOp: 0.85,    moon: null  },
        { start: 16, end: 18, name: "申", sky1: "#b87a52", sky2: "#d49860", sun: "#e07840",   sunOp: 0.9,     moon: null  },
        { start: 18, end: 20, name: "酉", sky1: "#7a4838", sky2: "#a85838", sun: "#c94028",   sunOp: 0.95,    moon: null  },
        { start: 20, end: 22, name: "戌", sky1: "#3a3848", sky2: "#52485a", sun: null,        moon: "#e8d8b0", moonOp: 0.7  },
        { start: 22, end: 24, name: "亥", sky1: "#1a2032", sky2: "#2a3042", sun: null,        moon: "#dcd6c0", moonOp: 0.6  },
    ];

    const MOUNTAINS = {
        spring: {
            far:  "M0 320 Q 120 270 240 290 T 480 280 T 720 285 T 960 275 T 1200 285 L 1200 480 L 0 480 Z",
            mid:  "M0 380 Q 150 340 300 360 T 600 355 T 900 365 T 1200 360 L 1200 480 L 0 480 Z",
            near: "M0 430 Q 200 410 400 420 T 800 425 T 1200 420 L 1200 480 L 0 480 Z",
            farColor: "#9a8c6a", midColor: "#6a604a", nearColor: "#3a3328",
            note: "终南春 · 圆缓"
        },
        summer: {
            far:  "M0 280 L 80 220 L 180 260 L 260 200 L 360 250 L 480 210 L 580 250 L 700 200 L 800 240 L 920 210 L 1020 250 L 1120 220 L 1200 240 L 1200 480 L 0 480 Z",
            mid:  "M0 360 L 100 300 L 220 340 L 340 290 L 460 330 L 580 280 L 700 320 L 820 290 L 940 330 L 1060 290 L 1180 320 L 1200 310 L 1200 480 L 0 480 Z",
            near: "M0 420 L 140 380 L 280 410 L 420 380 L 560 410 L 700 380 L 840 410 L 980 380 L 1120 410 L 1200 400 L 1200 480 L 0 480 Z",
            farColor: "#5a6a50", midColor: "#3a4838", nearColor: "#1a2418",
            note: "太行松青 · 峻拔"
        },
        autumn: {
            far:  "M0 300 Q 150 250 300 280 T 600 270 T 900 285 T 1200 275 L 1200 480 L 0 480 Z",
            mid:  "M0 370 Q 180 330 360 350 T 720 345 T 1080 355 T 1200 350 L 1200 480 L 0 480 Z",
            near: "M0 425 Q 240 405 480 415 T 960 420 T 1200 415 L 1200 480 L 0 480 Z",
            farColor: "#b88858", midColor: "#7a5838", nearColor: "#3a2818",
            note: "五岳秋 · 沉肃"
        },
        winter: {
            far:  "M0 270 L 100 200 L 200 240 L 320 180 L 440 230 L 560 190 L 700 230 L 820 180 L 940 230 L 1060 200 L 1180 240 L 1200 230 L 1200 480 L 0 480 Z",
            mid:  "M0 350 L 140 290 L 280 330 L 420 280 L 560 320 L 700 280 L 840 320 L 980 290 L 1120 320 L 1200 310 L 1200 480 L 0 480 Z",
            near: "M0 420 Q 200 395 400 410 T 800 415 T 1200 410 L 1200 480 L 0 480 Z",
            farColor: "#c8c4d8", midColor: "#8a8a9a", nearColor: "#3a3a48",
            note: "天山雪 · 凛峭"
        }
    };

    const QUOTES = [
        { t: "破山中贼易,破心中贼难",                    s: "阳明语录" },
        { t: "此心光明,亦复何言",                        s: "阳明绝笔" },
        { t: "山中莫道无供给,明月清风不用钱",            s: "阳明诗" },
        { t: "行到水穷处,坐看云起时",                    s: "王摩诘" },
        { t: "山静似太古,日长如小年",                    s: "唐子西" },
        { t: "我见青山多妩媚,料青山见我应如是",          s: "辛稼轩" },
        { t: "终南阴岭秀,积雪浮云端",                    s: "祖咏" },
        { t: "相看两不厌,只有敬亭山",                    s: "李太白" },
        { t: "采菊东篱下,悠然见南山",                    s: "陶渊明" },
        { t: "会当凌绝顶,一览众山小",                    s: "杜工部" },
        { t: "溪声便是广长舌,山色岂非清净身",            s: "苏东坡" },
        { t: "人生到处知何似,应似飞鸿踏雪泥",            s: "苏东坡" },
        { t: "北风卷地白草折,胡天八月即飞雪",            s: "岑嘉州" },
        { t: "深林人不知,明月来相照",                    s: "王摩诘" },
        { t: "欲穷千里目,更上一层楼",                    s: "王之涣" },
        { t: "山光忽西落,池月渐东上",                    s: "孟襄阳" }
    ];

    function currentSeason() {
        const now = new Date();
        const m = now.getMonth() + 1;
        const d = now.getDate();
        if ((m === 2 && d >= 4) || m === 3 || m === 4 || (m === 5 && d < 6)) return "spring";
        if ((m === 5 && d >= 6) || m === 6 || m === 7 || (m === 8 && d < 8)) return "summer";
        if ((m === 8 && d >= 8) || m === 9 || m === 10 || (m === 11 && d < 8)) return "autumn";
        return "winter";
    }

    function currentPhase() {
        const h = new Date().getHours();
        return PHASES.find(p => h >= p.start && h < p.end) || PHASES[0];
    }

    function pickQuote() {
        return QUOTES[Math.floor(Math.random() * QUOTES.length)];
    }

    function buildLayer() {
        const old = document.getElementById("banshanLayer");
        if (old) old.remove();

        const season = currentSeason();
        const phase = currentPhase();
        const m = MOUNTAINS[season];

        const layer = document.createElement("div");
        layer.className = "banshan-layer";
        layer.id = "banshanLayer";
        layer.dataset.season = season;
        layer.dataset.phase = phase.name;

        const sunDef = phase.sun ? `
            <radialGradient id="banshanSun" cx="0.5" cy="0.5" r="0.5">
                <stop offset="0%" stop-color="${phase.sun}" stop-opacity="${phase.sunOp}"/>
                <stop offset="100%" stop-color="${phase.sun}" stop-opacity="0"/>
            </radialGradient>` : "";

        const sunDisc = phase.sun
            ? `<circle cx="940" cy="140" r="120" fill="url(#banshanSun)"/>
               <circle cx="940" cy="140" r="22" fill="${phase.sun}" opacity="0.55"/>`
            : "";

        const moonDisc = phase.moon
            ? `<circle cx="940" cy="120" r="34" fill="${phase.moon}" opacity="${phase.moonOp}"/>
               <circle cx="930" cy="116" r="6"  fill="#ffffff" opacity="0.18"/>`
            : "";

        layer.innerHTML = `
        <svg class="banshan-svg" viewBox="0 0 1200 480" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <defs>
                <linearGradient id="banshanSky" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%"   stop-color="${phase.sky1}"/>
                    <stop offset="60%"  stop-color="${phase.sky2}"/>
                    <stop offset="100%" stop-color="${m.farColor}" stop-opacity="0.55"/>
                </linearGradient>
                ${sunDef}
            </defs>
            <rect width="1200" height="480" fill="url(#banshanSky)"/>
            ${moonDisc}
            ${sunDisc}
            <g class="banshan-mist">
                <path class="banshan-cloud bc1" d="M -300 180 Q -100 160 100 180 T 500 180 T 900 180 T 1300 180 L 1300 210 L -300 210 Z" fill="#ffffff" opacity="0.16"/>
                <path class="banshan-cloud bc2" d="M -300 260 Q -50 240 200 260 T 700 260 T 1200 260 T 1500 260 L 1500 290 L -300 290 Z" fill="#ffffff" opacity="0.10"/>
            </g>
            <g opacity="0.55"><path d="${m.far}"  fill="${m.farColor}"/></g>
            <g opacity="0.78"><path d="${m.mid}"  fill="${m.midColor}"/></g>
            <g><path d="${m.near}" fill="${m.nearColor}"/></g>
        </svg>
        <div class="banshan-veil"></div>`;

        document.body.insertBefore(layer, document.body.firstChild);
    }

    function buildIcon() {
        if (document.getElementById("banshanBtn")) return;
        const tools = document.querySelector(".brand-tools");
        if (!tools) return;
        const btn = document.createElement("button");
        btn.className = "icon-btn banshan-icon";
        btn.id = "banshanBtn";
        btn.title = "入山静坐 · 阳明洞";
        btn.textContent = "⛰";
        tools.insertBefore(btn, tools.firstChild);
        btn.addEventListener("click", toggleJingzuo);
    }

    let jingzuoOn = false;
    function toggleJingzuo() {
        jingzuoOn = !jingzuoOn;
        document.body.classList.toggle("banshan-jingzuo", jingzuoOn);
        const btn = document.getElementById("banshanBtn");
        if (btn) {
            btn.classList.toggle("on", jingzuoOn);
            btn.title = jingzuoOn ? "出山 · 回到人间" : "入山静坐 · 阳明洞";
        }
        if (jingzuoOn) showQuote(true);
    }

    function showQuote(longer) {
        const old = document.getElementById("banshanQuote");
        if (old) old.remove();
        const q = pickQuote();
        const div = document.createElement("div");
        div.id = "banshanQuote";
        div.className = "banshan-quote";
        div.innerHTML = `<div class="bq-text">${q.t}</div><div class="bq-source">—— ${q.s}</div>`;
        document.body.appendChild(div);
        requestAnimationFrame(() => div.classList.add("on"));
        const dwell = longer ? 12000 : 8000;
        setTimeout(() => {
            div.classList.remove("on");
            setTimeout(() => div.remove(), 1500);
        }, dwell);
    }

    let idleTimer = null;
    function resetIdle() {
        if (idleTimer) clearTimeout(idleTimer);
        idleTimer = setTimeout(() => {
            if (document.hidden) return;
            if (document.getElementById("banshanQuote")) return;
            const anyModalOpen = !!document.querySelector(".modal.active, .modal[style*='display: block'], .modal[style*='display:block']");
            if (anyModalOpen && !jingzuoOn) return;
            showQuote(false);
            resetIdle();
        }, 10 * 60 * 1000);
    }

    ["mousemove", "scroll", "keydown", "touchstart", "click"].forEach(ev =>
        document.addEventListener(ev, resetIdle, { passive: true }));

    function tick() {
        const layer = document.getElementById("banshanLayer");
        if (!layer) return;
        const phase = currentPhase();
        const season = currentSeason();
        if (layer.dataset.phase !== phase.name || layer.dataset.season !== season) {
            buildLayer();
        }
    }
    setInterval(tick, 3 * 60 * 1000);

    function init() {
        buildLayer();
        buildIcon();
        resetIdle();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
