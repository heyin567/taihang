/* ============================================================
   行山志 · 伴山 · 入山中书房
   - 点⛰入山:山色铺面但中央留窗,可继续翻志读卷
   - 左下立古人(SVG 线描) · 名号 · 身世 · 此山诗
   - 右下故事卡:四则相和,可翻可不翻
   - 再点⛰出山,渐隐回常
   ============================================================ */
(function () {
    "use strict";

    const SHAN_KU = {
        zhongnan: {
            id: "zhongnan",
            name: "终南",
            sky: { from: "#d8c08a", mid: "#b89a6a", to: "#5a4c34" },
            mountainColors: { far: "#8a7c5a", mid: "#5a4e36", near: "#2a2418" },
            mountainPaths: {
                far:  "M0 290 Q 100 240 220 260 T 460 255 T 700 265 T 940 250 T 1200 260 L 1200 480 L 0 480 Z",
                mid:  "M0 360 Q 140 310 280 330 T 580 325 T 880 335 T 1200 330 L 1200 480 L 0 480 Z",
                near: "M0 425 Q 200 405 400 420 T 800 425 T 1200 420 L 1200 480 L 0 480 Z"
            },
            persona: {
                name: "王摩诘",
                dynasty: "唐",
                years: "701 — 761",
                intro: "本名王维,字摩诘,号摩诘居士。盛唐诗佛,工书善画,通音律。中岁辋川,晚家南山。"
            },
            poem: {
                title: "终南别业",
                lines: [
                    "中岁颇好道,晚家南山陲。",
                    "兴来每独往,胜事空自知。",
                    "行到水穷处,坐看云起时。",
                    "偶然值林叟,谈笑无还期。"
                ]
            },
            stories: [
                {
                    title: "辋川一席",
                    text: "维三十始辞,得宋之问蓝田旧业于辋川。山谷为缘,溪流为脉,有华子冈、文杏馆、斤竹岭、鹿柴二十胜。维与裴迪居此二十年,各景一咏。后维卒,妻早亡无嗣,以辋川舍为佛寺,曰清源寺,留供香火。"
                },
                {
                    title: "行到水穷处",
                    text: "维某日入终南,无所求,亦无目的,但循溪而行。水尽,无路,乃坐石上。云自远峰起,徐徐过其顶,徐徐又散去。林中有叟担柴归,见维相视一笑,坐谈无尽,归而成诗 ——「行到水穷处,坐看云起时」。后人谓:十字胜千卷书 —— 此境非求得,乃任之而至。"
                },
                {
                    title: "二十首相和",
                    text: "裴迪,关中人,与维终南共居者也。《辋川集》二十首,维一首,裴和一首,相对而成。维《辛夷坞》:「木末芙蓉花,山中发红萼;涧户寂无人,纷纷开且落。」裴和:「绿堤春草合,王孙自留玩。况有辛夷花,色与芙蓉乱。」二人之诗如二溪汇海,各成韵致,而气脉无二。"
                },
                {
                    title: "诗画一体",
                    text: "维善画,工诗,通音律。东坡论之:「味摩诘之诗,诗中有画;观摩诘之画,画中有诗。」《雪溪图》《辋川图》皆传世名作,《辋川图》今散佚,惟刻石及摹本存。维晚年信佛,屏居终南,日饭十数僧,焚香独坐 —— 此即「南山陲」之实。"
                }
            ]
        }
    };

    let on = false;
    let storyIdx = 0;

    function figureWangwei() {
        return `
        <svg class="shanju-figure" viewBox="0 0 200 280" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <g stroke="#3a2a18" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
                <path d="M 26 248 Q 100 240 174 248 L 174 272 L 26 272 Z" fill="#a89070"/>
                <path d="M 50 252 Q 100 248 150 252" stroke-width="0.8"/>
                <path d="M 36 258 Q 100 254 164 258" stroke-width="0.6"/>

                <path d="M 76 60 Q 100 28 124 60 Q 132 70 124 82 L 76 82 Q 68 70 76 60 Z" fill="#2a2418" stroke-width="1.2"/>
                <path d="M 84 50 Q 100 42 116 50" stroke-width="0.8"/>
                <path d="M 100 28 Q 100 18 110 12" stroke-width="0.8"/>

                <path d="M 80 82 Q 78 96 86 112 Q 100 124 114 112 Q 122 96 120 82" fill="#f0d8b0" stroke-width="1.2"/>
                <path d="M 89 96 Q 91 97 93 96" stroke-width="0.9"/>
                <path d="M 107 96 Q 109 97 111 96" stroke-width="0.9"/>
                <path d="M 100 102 L 100 108" stroke-width="0.7"/>
                <path d="M 94 113 Q 100 116 106 113" stroke-width="0.7"/>
                <path d="M 90 116 Q 92 124 90 132" stroke-width="0.7" stroke="#5a4838"/>
                <path d="M 110 116 Q 108 124 110 132" stroke-width="0.7" stroke="#5a4838"/>

                <path d="M 58 112 Q 46 134 52 184 Q 46 218 64 248 L 136 248 Q 154 218 148 184 Q 154 134 142 112 Q 122 100 100 100 Q 78 100 58 112 Z" fill="#e8d8b8" stroke-width="1.4"/>

                <path d="M 70 142 Q 100 148 130 142" stroke-width="0.8" stroke="#8a7858"/>
                <path d="M 65 178 Q 100 184 135 178" stroke-width="0.8" stroke="#8a7858"/>
                <path d="M 70 214 Q 100 220 130 214" stroke-width="0.8" stroke="#8a7858"/>
                <path d="M 86 120 L 92 240" stroke-width="0.6" stroke="#a8957a"/>
                <path d="M 114 120 L 108 240" stroke-width="0.6" stroke="#a8957a"/>

                <path d="M 56 132 L 42 150 L 54 168 L 72 154 Z" fill="#d8c098" stroke-width="1.2"/>
                <path d="M 144 132 L 158 150 L 146 168 L 128 154 Z" fill="#d8c098" stroke-width="1.2"/>

                <path d="M 70 222 Q 76 232 84 232 L 96 228" stroke-width="1.2" fill="#f0d8b0"/>
                <path d="M 130 222 Q 124 232 116 232 L 104 228" stroke-width="1.2" fill="#f0d8b0"/>
            </g>
        </svg>`;
    }

    function buildStage() {
        const old = document.getElementById("shanjuStage");
        if (old) old.remove();

        const data = SHAN_KU.zhongnan;
        const stage = document.createElement("div");
        stage.className = "shanju-stage";
        stage.id = "shanjuStage";

        const poemHtml = data.poem.lines.map(l => `<div class="shanju-poem-line">${l}</div>`).join("");
        const story = data.stories[storyIdx];

        stage.innerHTML = `
            <svg class="shanju-bg" viewBox="0 0 1200 480" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <defs>
                    <linearGradient id="shanjuSky" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%"   stop-color="${data.sky.from}"/>
                        <stop offset="55%"  stop-color="${data.sky.mid}"/>
                        <stop offset="100%" stop-color="${data.sky.to}"/>
                    </linearGradient>
                    <radialGradient id="shanjuSun" cx="0.78" cy="0.28" r="0.22">
                        <stop offset="0%" stop-color="#f8e0a8" stop-opacity="0.85"/>
                        <stop offset="100%" stop-color="#f8e0a8" stop-opacity="0"/>
                    </radialGradient>
                </defs>
                <rect width="1200" height="480" fill="url(#shanjuSky)"/>
                <circle cx="940" cy="130" r="160" fill="url(#shanjuSun)"/>
                <circle cx="940" cy="130" r="32" fill="#d8a868" opacity="0.7"/>
                <g class="shanju-mist">
                    <path class="shanju-cloud sc1" d="M -200 200 Q 0 180 200 200 T 600 200 T 1000 200 T 1400 200 L 1400 235 L -200 235 Z" fill="#ffffff" opacity="0.18"/>
                    <path class="shanju-cloud sc2" d="M -200 280 Q 100 260 400 280 T 1000 280 T 1500 280 L 1500 305 L -200 305 Z" fill="#ffffff" opacity="0.10"/>
                </g>
                <g opacity="0.78"><path d="${data.mountainPaths.far}"  fill="${data.mountainColors.far}"/></g>
                <g opacity="0.92"><path d="${data.mountainPaths.mid}"  fill="${data.mountainColors.mid}"/></g>
                <g><path d="${data.mountainPaths.near}" fill="${data.mountainColors.near}"/></g>
                <g class="shanju-pine" transform="translate(160, 320)" opacity="0.85">
                    <path d="M 0 90 L 0 -16" stroke="#1a1408" stroke-width="3" fill="none"/>
                    <path d="M 0 0 Q -28 -10 -42 -28 M 0 0 Q 28 -10 42 -28" stroke="#1a3018" stroke-width="2" fill="none"/>
                    <path d="M 0 -22 Q -24 -32 -34 -50 M 0 -22 Q 24 -32 34 -50" stroke="#1a3018" stroke-width="2" fill="none"/>
                    <path d="M 0 -42 Q -16 -50 -22 -64 M 0 -42 Q 16 -50 22 -64" stroke="#1a3018" stroke-width="1.8" fill="none"/>
                </g>
                <g class="shanju-pine" transform="translate(1040, 340)" opacity="0.7">
                    <path d="M 0 70 L 0 -10" stroke="#1a1408" stroke-width="2.4" fill="none"/>
                    <path d="M 0 0 Q -22 -8 -32 -22 M 0 0 Q 22 -8 32 -22" stroke="#1a3018" stroke-width="1.8" fill="none"/>
                    <path d="M 0 -16 Q -18 -24 -26 -38 M 0 -16 Q 18 -24 26 -38" stroke="#1a3018" stroke-width="1.6" fill="none"/>
                </g>
            </svg>

            <div class="shanju-banner">入${data.name} · 与${data.persona.name}共坐</div>

            <aside class="shanju-persona">
                ${figureWangwei()}
                <div class="shanju-persona-info">
                    <div class="shanju-persona-name">${data.persona.name}</div>
                    <div class="shanju-persona-meta">${data.persona.dynasty} · ${data.persona.years}</div>
                    <div class="shanju-persona-intro">${data.persona.intro}</div>
                    <div class="shanju-poem">
                        <div class="shanju-poem-title">${data.poem.title}</div>
                        ${poemHtml}
                    </div>
                </div>
            </aside>

            <article class="shanju-story" id="shanjuStory">
                <div class="shanju-story-head">
                    <span class="shanju-story-mark">山中故事</span>
                    <span class="shanju-story-idx">${storyIdx + 1} / ${data.stories.length}</span>
                </div>
                <div class="shanju-story-title">${story.title}</div>
                <div class="shanju-story-text">${story.text}</div>
                <div class="shanju-story-nav">
                    <button class="shanju-prev" id="shanjuPrev" ${storyIdx === 0 ? "disabled" : ""}>← 前则</button>
                    <button class="shanju-next" id="shanjuNext" ${storyIdx === data.stories.length - 1 ? "disabled" : ""}>后则 →</button>
                </div>
            </article>
        `;

        document.body.appendChild(stage);
        document.getElementById("shanjuPrev")?.addEventListener("click", () => navStory(-1));
        document.getElementById("shanjuNext")?.addEventListener("click", () => navStory(1));
        requestAnimationFrame(() => stage.classList.add("on"));
    }

    function navStory(d) {
        const data = SHAN_KU.zhongnan;
        const next = storyIdx + d;
        if (next < 0 || next >= data.stories.length) return;
        storyIdx = next;
        const story = data.stories[storyIdx];
        const card = document.getElementById("shanjuStory");
        if (!card) return;
        card.classList.add("flip");
        setTimeout(() => {
            card.querySelector(".shanju-story-title").textContent = story.title;
            card.querySelector(".shanju-story-text").textContent = story.text;
            card.querySelector(".shanju-story-idx").textContent = `${storyIdx + 1} / ${data.stories.length}`;
            const prev = document.getElementById("shanjuPrev");
            const nxt = document.getElementById("shanjuNext");
            if (prev) prev.disabled = storyIdx === 0;
            if (nxt) nxt.disabled = storyIdx === data.stories.length - 1;
            card.classList.remove("flip");
        }, 260);
    }

    function buildIcon() {
        if (document.getElementById("banshanBtn")) return;
        const tools = document.querySelector(".brand-tools");
        if (!tools) return;
        const btn = document.createElement("button");
        btn.className = "icon-btn banshan-icon";
        btn.id = "banshanBtn";
        btn.title = "入山 · 与古人共坐";
        btn.textContent = "⛰";
        tools.insertBefore(btn, tools.firstChild);
        btn.addEventListener("click", toggle);
    }

    function toggle() {
        on = !on;
        if (on) {
            storyIdx = 0;
            buildStage();
            document.body.classList.add("shanju-on");
        } else {
            const stage = document.getElementById("shanjuStage");
            if (stage) {
                stage.classList.remove("on");
                setTimeout(() => stage.remove(), 1200);
            }
            document.body.classList.remove("shanju-on");
        }
        const btn = document.getElementById("banshanBtn");
        if (btn) {
            btn.classList.toggle("on", on);
            btn.title = on ? "出山 · 回到人间" : "入山 · 与古人共坐";
        }
    }

    document.addEventListener("keydown", e => {
        if (!on) return;
        if (e.key === "Escape") toggle();
        else if (e.key === "ArrowLeft") navStory(-1);
        else if (e.key === "ArrowRight") navStory(1);
    });

    function init() {
        buildIcon();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
