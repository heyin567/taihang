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
            sky: { from: "#cec4ac", mid: "#a89a82", to: "#3a3428" },
            mountainColors: { far: "#9aa0a4", mid: "#54544a", near: "#1c1c14" },
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
        <svg class="shanju-figure" viewBox="0 0 240 300" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <defs>
                <radialGradient id="qiyun" cx="0.5" cy="0.5" r="0.5">
                    <stop offset="0%" stop-color="#f5ecd9" stop-opacity="0.55"/>
                    <stop offset="100%" stop-color="#f5ecd9" stop-opacity="0"/>
                </radialGradient>
            </defs>

            <!-- 身侧烟云,从地表升起 -->
            <g class="shanju-figmist">
                <ellipse class="qm qm1" cx="40" cy="262" rx="48" ry="10" fill="url(#qiyun)"/>
                <ellipse class="qm qm2" cx="200" cy="270" rx="56" ry="12" fill="url(#qiyun)"/>
                <ellipse class="qm qm3" cx="120" cy="278" rx="78" ry="9"  fill="url(#qiyun)"/>
            </g>

            <g stroke="#1a1408" stroke-width="1.4" fill="none" stroke-linecap="round" stroke-linejoin="round">
                <!-- 坐石:三笔大写意,墨色不匀 -->
                <path d="M 60 280 Q 80 244 130 240 Q 184 238 200 268 Q 196 290 60 290 Z" fill="#5a5246" stroke="#2a2418" stroke-width="1.6"/>
                <path d="M 76 268 Q 100 256 130 254" stroke="#1a1408" stroke-width="0.7" fill="none"/>
                <path d="M 150 252 Q 168 256 188 268" stroke="#1a1408" stroke-width="0.7" fill="none"/>
                <path d="M 110 282 L 128 282" stroke="#1a1408" stroke-width="0.6" fill="none"/>

                <!-- 整体:头/身/袖/裾,3/4 侧身朝右(向山)。group 整体随风微摆 -->
                <g class="shanju-fig-body">

                    <!-- 长袍裾摆,从坐石向左铺开 -->
                    <g class="shanju-fig-robe">
                        <path d="M 76 256 Q 60 244 56 220 Q 60 200 80 188 Q 96 178 116 178 L 156 178 Q 174 184 184 200 Q 192 220 188 244 Q 184 258 174 264 L 76 264 Z"
                              fill="#e8dcc0" stroke="#1a1408" stroke-width="1.4"/>
                        <!-- 袍上墨纹:衣折数笔 -->
                        <path d="M 96 192 Q 90 220 88 252" stroke="#5a4838" stroke-width="0.8" fill="none"/>
                        <path d="M 124 184 Q 124 220 122 256" stroke="#5a4838" stroke-width="0.8" fill="none"/>
                        <path d="M 156 184 Q 158 220 162 256" stroke="#5a4838" stroke-width="0.8" fill="none"/>
                        <!-- 衣领斜纹:右领压左领 -->
                        <path d="M 116 178 Q 130 188 142 178 L 156 178 L 152 196 L 130 198 L 122 188 Z" fill="#3a2a18" stroke="#1a1408" stroke-width="1.0"/>
                        <!-- 腰带 -->
                        <path d="M 80 218 Q 130 222 184 218" stroke="#3a2a18" stroke-width="2.5" fill="none"/>
                        <path d="M 140 222 Q 150 240 144 256" stroke="#3a2a18" stroke-width="1.2" fill="none"/>
                    </g>

                    <!-- 右袖与右手,前伸略下垂 -->
                    <g class="shanju-fig-rsleeve">
                        <path d="M 160 184 Q 196 192 218 212 Q 220 226 210 232 Q 196 238 188 226 Q 172 208 160 196 Z"
                              fill="#e8dcc0" stroke="#1a1408" stroke-width="1.4"/>
                        <path d="M 178 196 Q 196 210 210 224" stroke="#5a4838" stroke-width="0.7" fill="none"/>
                        <!-- 露出的手:撑石 -->
                        <path d="M 210 232 Q 218 234 222 240 L 218 248 L 210 244 Z" fill="#f0d8b0" stroke="#1a1408" stroke-width="0.9"/>
                    </g>

                    <!-- 左袖搭膝,袖口往内卷 -->
                    <g class="shanju-fig-lsleeve">
                        <path d="M 96 196 Q 80 220 70 250 Q 80 256 92 250 Q 104 232 110 208 Z"
                              fill="#e8dcc0" stroke="#1a1408" stroke-width="1.4"/>
                        <path d="M 90 210 Q 84 232 78 246" stroke="#5a4838" stroke-width="0.7" fill="none"/>
                    </g>

                    <!-- 头部:3/4 侧身,面朝右上(望山方向) -->
                    <g class="shanju-fig-head">
                        <!-- 颈 -->
                        <path d="M 124 168 Q 128 178 132 184" stroke="#1a1408" stroke-width="1.2" fill="none"/>
                        <!-- 头形:3/4 侧 -->
                        <path d="M 110 130 Q 110 100 128 92 Q 152 88 160 110 Q 162 138 152 150 Q 138 160 124 156 Q 114 148 110 130 Z"
                              fill="#f0d8b0" stroke="#1a1408" stroke-width="1.3"/>

                        <!-- 五官:侧脸所见 -->
                        <!-- 眉 -->
                        <path d="M 134 116 Q 140 113 146 116" stroke="#1a1408" stroke-width="1.0" fill="none"/>
                        <!-- 眼:微闭,长一笔 -->
                        <path d="M 134 122 Q 140 121 146 124" stroke="#1a1408" stroke-width="0.9" fill="none"/>
                        <!-- 鼻:侧面外缘 -->
                        <path d="M 152 120 Q 158 128 154 136" stroke="#1a1408" stroke-width="0.9" fill="none"/>
                        <!-- 嘴:微抿 -->
                        <path d="M 142 142 Q 146 144 150 142" stroke="#1a1408" stroke-width="0.8" fill="none"/>
                        <!-- 耳 -->
                        <path d="M 116 130 Q 112 134 116 142" stroke="#1a1408" stroke-width="0.8" fill="none"/>

                        <!-- 长须:垂至胸前,会随风动 -->
                        <g class="shanju-fig-beard">
                            <path d="M 142 148 Q 138 162 134 178 Q 132 188 134 196" stroke="#3a2a18" stroke-width="1.0" fill="none"/>
                            <path d="M 146 148 Q 146 168 144 188 Q 144 198 146 204" stroke="#3a2a18" stroke-width="1.0" fill="none"/>
                            <path d="M 150 150 Q 152 168 152 184" stroke="#3a2a18" stroke-width="0.9" fill="none"/>
                        </g>

                        <!-- 头巾:东坡巾式,顶有一折 -->
                        <path d="M 108 100 Q 110 78 132 70 Q 156 70 166 90 Q 168 104 160 116 Q 158 100 152 94 L 138 92 Q 124 92 116 98 Q 110 106 110 116 Q 106 112 108 100 Z"
                              fill="#2a2418" stroke="#1a1408" stroke-width="1.2"/>
                        <path d="M 132 70 L 140 64 L 148 70" stroke="#1a1408" stroke-width="0.9" fill="#1a1408"/>

                        <!-- 头巾飘带,从脑后垂下 -->
                        <g class="shanju-fig-ribbon">
                            <path d="M 116 108 Q 102 118 96 138 Q 94 156 100 166" stroke="#1a1408" stroke-width="1.0" fill="none"/>
                            <path d="M 114 112 Q 100 122 94 142 Q 92 160 98 170" stroke="#3a2a18" stroke-width="0.7" fill="none"/>
                        </g>
                    </g>
                </g>
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
                <g class="shanju-yunhai">
                    <path class="shanju-cloud sc3" d="M -200 320 Q 80 296 280 312 T 600 308 T 920 314 T 1240 308 T 1500 312 L 1500 345 L -200 345 Z" fill="#f0e8d4" opacity="0.42"/>
                    <path class="shanju-cloud sc4" d="M -200 340 Q 120 318 320 334 T 700 328 T 1080 336 T 1500 332 L 1500 360 L -200 360 Z" fill="#e8e0c8" opacity="0.28"/>
                </g>
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
