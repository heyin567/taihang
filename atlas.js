/* ============================================================
   行山志 · 山川舆图 (atlas.js)
   --------------------
   - 仿《禹贡九州图》水墨青绿舆图
   - 自动从 routes[] 读取 coords,新增山自动落点
   - 太行九山地理太密,会自动力学避让散开
   - 14 座山各有独特图标(寺、亭、瀑、剑峰、悬空寺...)
   - 悬停不位移(避免闪烁),浮卡固定显示在舆图右侧
   ============================================================ */

(function () {
    "use strict";

    const LON_MIN = 73, LON_MAX = 135;
    const LAT_MIN = 18, LAT_MAX = 54;
    const VB_W = 1200, VB_H = 800;
    const PAD_X = 60, PAD_Y = 60;

    function project(lon, lat) {
        const x = PAD_X + (lon - LON_MIN) / (LON_MAX - LON_MIN) * (VB_W - 2 * PAD_X);
        const y = PAD_Y + (LAT_MAX - lat) / (LAT_MAX - LAT_MIN) * (VB_H - 2 * PAD_Y);
        return { x, y };
    }

    /* ============================================================
       中国陆地轮廓(自西向东顺时针,平滑曲线连接)
       关键节点按真实经纬度计算:喀什、阿里、雅鲁藏布、瑞丽、广西、雷州、
       浙闽、长三角、山东半岛、辽东、长白、抚远、漠河、阿尔泰、伊犁
       ============================================================ */
    const CHINA_PATH = `
        M 78 343
        Q 65 380 92 412
        Q 130 450 175 478
        Q 235 510 312 528
        Q 380 552 446 600
        Q 510 638 582 660
        Q 640 685 695 696
        Q 720 700 745 692
        Q 790 678 825 650
        Q 855 620 870 590
        Q 880 555 880 518
        Q 880 480 875 455
        Q 870 425 873 395
        Q 880 378 905 372
        Q 928 376 920 392
        Q 905 410 887 408
        Q 882 398 882 380
        Q 882 360 870 352
        Q 850 348 832 348
        Q 825 332 838 322
        Q 870 320 905 340
        Q 940 350 968 320
        Q 1010 290 1042 270
        Q 1075 250 1098 215
        Q 1130 175 1140 158
        Q 1135 110 1108 82
        Q 1010 70 922 78
        Q 880 86 845 110
        Q 815 138 802 152
        Q 770 195 745 252
        Q 705 280 658 290
        Q 580 305 510 308
        Q 470 295 450 268
        Q 405 248 348 246
        Q 308 222 305 178
        Q 295 148 268 158
        Q 230 198 200 230
        Q 168 252 130 282
        Q 95 308 78 343 Z
    `.replace(/\s+/g, " ").trim();

    const ISLANDS = [
        { type: "ellipse", cx: 700, cy: 720, rx: 22, ry: 13, name: "海南" },
        { type: "path",    d: "M 920 540 q -10 -28 0 -50 q 14 -10 16 16 q 0 28 -4 42 q -8 6 -12 -8 z", name: "台湾" }
    ];

    /* ============================================================
       主要山系/河流写意线
       ============================================================ */
    const MOUNTAIN_RANGES = [
        { name: "太行",     d: "M 760 290 Q 778 350 788 415 T 815 525", w: 2.4, op: 0.45 },
        { name: "燕山",     d: "M 760 248 Q 810 240 860 250", w: 2, op: 0.4 },
        { name: "秦岭",     d: "M 600 460 Q 680 470 770 478", w: 2.2, op: 0.45 },
        { name: "大别",     d: "M 800 510 Q 840 520 880 535", w: 1.6, op: 0.32 },
        { name: "武夷",     d: "M 925 580 Q 935 615 945 645", w: 1.6, op: 0.32 },
        { name: "横断",     d: "M 470 510 Q 490 560 510 615", w: 2, op: 0.4 },
        { name: "喜马拉雅", d: "M 280 500 Q 380 540 470 560", w: 2.2, op: 0.42 },
        { name: "天山",     d: "M 215 295 Q 305 290 405 300", w: 2.1, op: 0.42 }
    ];
    const RIVERS = [
        { name: "长江", d: "M 530 480 Q 660 510 760 540 T 950 590 T 1030 615", w: 1.6, op: 0.55, color: "#5a7ba0" },
        { name: "黄河", d: "M 470 380 Q 540 360 610 400 T 760 420 T 880 440 T 970 470", w: 1.6, op: 0.55, color: "#a08555" }
    ];

    /* ============================================================
       14 座山的独特图标(各取山之一神)
       底中心 (0,0) · 大致 x∈[-16,16] y∈[-22,8]
       --
       fc = 主体填充色 / sc = 边线色 · 由 isRemote 决定
       ============================================================ */
    const PEAK_ICONS = {
        // 1 苍岩山:双峰夹悬空殿(福庆寺桥楼殿)
        1: (fc, sc) => `
            <path d="M -15 8 L -8 -4 Q -4 -12 0 -8 Q 4 -12 8 -4 L 15 8 Z" fill="${fc}" stroke="${sc}" stroke-width="0.9" stroke-linejoin="round"/>
            <rect x="-4" y="-7" width="8" height="3.5" fill="#fff5e0" stroke="${sc}" stroke-width="0.6"/>
            <path d="M -5 -7 L 5 -7" stroke="${sc}" stroke-width="0.5"/>`,
        // 2 驼梁山:双驼峰
        2: (fc, sc) => `
            <path d="M -15 8 Q -10 -4 -6 -2 Q -2 -10 2 -2 Q 6 -4 10 -8 Q 14 -2 15 8 Z" fill="${fc}" stroke="${sc}" stroke-width="0.9" stroke-linejoin="round"/>`,
        // 3 嶂石岩:三栈赭崖
        3: (fc, sc) => `
            <path d="M -15 8 L -15 0 L -7 0 L -7 -5 L 1 -5 L 1 -11 L 15 -11 L 15 8 Z" fill="${fc}" stroke="${sc}" stroke-width="0.9" stroke-linejoin="round"/>
            <path d="M -15 0 L -7 0 M -7 -5 L 1 -5 M 1 -11 L 15 -11" stroke="${sc}" stroke-width="0.5" opacity="0.6"/>`,
        // 4 抱犊寨:平顶台山,顶有寨亭
        4: (fc, sc) => `
            <path d="M -15 8 L -10 -5 L 10 -5 L 15 8 Z" fill="${fc}" stroke="${sc}" stroke-width="0.9" stroke-linejoin="round"/>
            <rect x="-5" y="-11" width="10" height="6" fill="#c9402a" stroke="${sc}" stroke-width="0.6"/>
            <path d="M -7 -11 L 7 -11" stroke="${sc}" stroke-width="0.7"/>`,
        // 5 天桂山:尖峰 + 顶上小亭(崇祯避难处)
        5: (fc, sc) => `
            <path d="M -10 8 L -1 -16 L 1 -16 L 10 8 Z" fill="${fc}" stroke="${sc}" stroke-width="0.9" stroke-linejoin="round"/>
            <path d="M -3 -10 L 0 -16 L 3 -10 Z" fill="#d4a017" stroke="${sc}" stroke-width="0.5"/>`,
        // 6 五岳寨:五个并立小尖
        6: (fc, sc) => `
            <path d="M -15 8 L -11 -3 L -7 8 L -3 -8 L 1 8 L 5 -5 L 9 8 L 13 -2 L 15 8 Z" fill="${fc}" stroke="${sc}" stroke-width="0.9" stroke-linejoin="round"/>`,
        // 7 仙台山:圆顶云台
        7: (fc, sc) => `
            <path d="M -10 8 Q -8 -10 0 -12 Q 8 -10 10 8 Z" fill="${fc}" stroke="${sc}" stroke-width="0.9" stroke-linejoin="round"/>
            <path d="M -7 -14 q 4 -3 8 0 q 4 -3 8 0 q -3 4 -8 2 q -5 2 -8 -2 z" fill="#fff5e0" stroke="${sc}" stroke-width="0.5" opacity="0.85"/>`,
        // 8 藤龙山:山间飞索
        8: (fc, sc) => `
            <path d="M -15 8 L -8 -4 L 0 -8 L 8 -4 L 15 8 Z" fill="${fc}" stroke="${sc}" stroke-width="0.9" stroke-linejoin="round"/>
            <path d="M -12 -2 L 12 -10" stroke="#c9402a" stroke-width="0.8" stroke-dasharray="2 1.5"/>
            <circle cx="-12" cy="-2" r="1.2" fill="${sc}"/>
            <circle cx="12" cy="-10" r="1.2" fill="${sc}"/>`,
        // 9 沕沕水:山下瀑布
        9: (fc, sc) => `
            <path d="M -12 8 L -8 -4 Q -4 -12 0 -10 Q 4 -12 8 -4 L 12 8 Z" fill="${fc}" stroke="${sc}" stroke-width="0.9" stroke-linejoin="round"/>
            <path d="M -2 -4 L -2 8 M 0 -5 L 0 8 M 2 -4 L 2 8" stroke="#a8d5e8" stroke-width="0.9"/>`,
        // 10 东岳泰山:雄方山 + 红日
        10: (fc, sc) => `
            <path d="M -16 8 L -12 -3 L -5 -9 L 5 -9 L 12 -3 L 16 8 Z" fill="${fc}" stroke="${sc}" stroke-width="0.9" stroke-linejoin="round"/>
            <circle cx="9" cy="-13" r="3.2" fill="#c9402a" stroke="#fff5e0" stroke-width="0.6"/>`,
        // 11 西岳华山:剑峰冲天
        11: (fc, sc) => `
            <path d="M -7 8 L -2 -18 L 0 -22 L 2 -18 L 7 8 Z" fill="${fc}" stroke="${sc}" stroke-width="0.9" stroke-linejoin="round"/>
            <path d="M -3 -2 L 3 -2" stroke="${sc}" stroke-width="0.5" opacity="0.7"/>`,
        // 12 南岳衡山:云山(回雁峰)
        12: (fc, sc) => `
            <path d="M -13 8 Q -8 -8 0 -11 Q 8 -8 13 8 Z" fill="${fc}" stroke="${sc}" stroke-width="0.9" stroke-linejoin="round"/>
            <path d="M -11 -2 q 4 -4 8 -1 q 4 -4 9 -1 q 5 -2 7 0 q -3 4 -8 2 q -5 3 -9 -1 q -4 4 -7 0 z" fill="#fff5e0" stroke="${sc}" stroke-width="0.5" opacity="0.85"/>`,
        // 13 北岳恒山:山壁悬空寺
        13: (fc, sc) => `
            <path d="M -15 8 L -10 -3 L -3 -11 L 3 -11 L 10 -3 L 15 8 Z" fill="${fc}" stroke="${sc}" stroke-width="0.9" stroke-linejoin="round"/>
            <rect x="-7" y="-6" width="14" height="4" fill="#8b4513" stroke="${sc}" stroke-width="0.5"/>
            <path d="M -7 -2 L -8 4 M 7 -2 L 8 4" stroke="${sc}" stroke-width="0.5"/>`,
        // 14 中岳嵩山:双圆峰中间塔(少林)
        14: (fc, sc) => `
            <path d="M -15 8 Q -10 -7 -3 0 Q 0 -10 3 0 Q 10 -7 15 8 Z" fill="${fc}" stroke="${sc}" stroke-width="0.9" stroke-linejoin="round"/>
            <rect x="-1.5" y="-9" width="3" height="9" fill="#d4a017" stroke="${sc}" stroke-width="0.4"/>
            <path d="M -2.5 -9 L 2.5 -9" stroke="${sc}" stroke-width="0.5"/>`,
        // 默认(任何未来新增、暂无独立图标的山):带阴影的小三角
        default: (fc, sc) => `
            <path d="M -10 8 L 0 -12 L 10 8 Z" fill="${fc}" stroke="${sc}" stroke-width="0.9" stroke-linejoin="round"/>`
    };

    /* ============================================================
       14 座山 × 四时风景(春/夏/秋/冬,各一句)
       ============================================================ */
    const SEASONAL_VIEW = {
        1:  ["山桃染溪 · 福庆寺前杏花飞", "松涛蔽日 · 桥楼殿下风穿涧", "层林尽染 · 悬空殿落叶满阶", "雪压千崖 · 古寺独立一痕白"],
        2:  ["野杏漫坡 · 草甸初绿见羊群", "云蒸驼背 · 高山草原浪如海", "漫山红叶 · 双驼负秋人难寻", "雪覆双驼 · 北脊银白千里寒"],
        3:  ["崖前野桃 · 红岩衬粉花最艳", "三栈风凉 · 赭壁如染人未热", "丹崖如焚 · 三阶秋色入云中", "冰挂千仞 · 长龙倒挂不觉寒"],
        4:  ["平台桃花 · 寨墙外杏粉如云", "山顶清风 · 夏日寨城凉如井", "残阳照寨 · 古墙金红似封禅", "雪覆山门 · 寨上无人独闻钟"],
        5:  ["翠柏抽新 · 皇姑庵前嫩芽簇", "古寺荫凉 · 苍松碧水避暑天", "松籽满径 · 崇祯遗松金色秋", "雪压宫墙 · 明末故人已无踪"],
        6:  ["针叶返青 · 五峰春雪未化尽", "云海蒸腾 · 五岳并立云中浮", "五峰金辉 · 桦黄松绿层叠出", "雪压林海 · 五座银峰守山门"],
        7:  ["槐花初绽 · 满谷雪白香十里", "树荫如盖 · 仙台清凉避暑佳", "黄栌如焚 · 漫山金红一齐燃", "雪压仙台 · 云海封山宛若仙"],
        8:  ["藤芽初萌 · 飞拉达旁春意浅", "藤龙腾空 · 飞索穿林如练飞", "藤叶尽染 · 一道金线穿红崖", "冰封索道 · 静观苍崖待春来"],
        9:  ["水流复苏 · 春水叮咚溶冰雪", "瀑落银河 · 飞流九叠最宜夏", "潭映丹枫 · 红叶倒入碧水中", "冰瀑奇观 · 千尺玉柱挂崖间"],
        10: ["岱顶杏花 · 春云浮岱日初升", "松涛瀑泉 · 黑龙潭凉云步桥", "云步桥红 · 十八盘上枫如染", "玉皇顶雪 · 五岳之首独披银"],
        11: ["山桃迎客 · 玉女峰前花满枝", "长空栈险 · 苍龙岭上云未开", "御道金枫 · 千尺幢边秋如画", "雪压莲花 · 西岳剑锋插云端"],
        12: ["祝融杜鹃 · 南岳花海五月红", "藏经殿凉 · 古杉荫蔽暑无声", "回雁雁去 · 衡阳秋深万雁飞", "南岳雪松 · 翠盖披银韵更幽"],
        13: ["悬空燕舞 · 北岳春融寺燕归", "松林清风 · 苍崖避暑塞外凉", "北岳金辉 · 万山红叶塞外秋", "塞外雪原 · 悬空寺顶白茫茫"],
        14: ["少林山樱 · 嵩岳春深花满坞", "藏经阁凉 · 嵩高维岳避暑天", "嵩山秋叶 · 三皇寨上枫如锦", "塔林雪覆 · 千塔披银禅意深"]
    };

    function getSeasonIdx() {
        const m = new Date().getMonth() + 1;
        if (m >= 3 && m <= 5) return 0;
        if (m >= 6 && m <= 8) return 1;
        if (m >= 9 && m <= 11) return 2;
        return 3;
    }
    const SEASON_LABEL = ["春", "夏", "秋", "冬"];

    /* ============================================================
       简化的力学避让:石家庄附近 9 座山地理太密,需要散开
       ============================================================ */
    function avoidOverlap(nodes, minDist) {
        const iters = 80;
        for (let k = 0; k < iters; k++) {
            let moved = false;
            for (let i = 0; i < nodes.length; i++) {
                for (let j = i + 1; j < nodes.length; j++) {
                    const a = nodes[i], b = nodes[j];
                    const dx = b.sx - a.sx, dy = b.sy - a.sy;
                    const d = Math.sqrt(dx * dx + dy * dy) || 0.01;
                    if (d < minDist) {
                        const push = (minDist - d) / 2 * 0.6;
                        const ux = dx / d, uy = dy / d;
                        a.sx -= ux * push; a.sy -= uy * push;
                        b.sx += ux * push; b.sy += uy * push;
                        moved = true;
                    }
                }
            }
            if (!moved) break;
        }
        // 软回弹:每点向其原点拉一点,让结果不至于飞太远
        nodes.forEach(n => {
            n.sx = n.sx * 0.85 + n.ox * 0.15;
            n.sy = n.sy * 0.85 + n.oy * 0.15;
        });
    }

    /* ============================================================
       渲染主函数
       ============================================================ */
    function renderAtlas() {
        const host = document.getElementById("atlasStage");
        if (!host) return;

        const list = (typeof routes !== "undefined" && Array.isArray(routes)) ? routes : [];
        const peaks = list
            .filter(r => r.coords && typeof r.coords.lon === "number" && typeof r.coords.lat === "number")
            .map(r => {
                const p = project(r.coords.lon, r.coords.lat);
                return { route: r, ox: p.x, oy: p.y, sx: p.x, sy: p.y };
            });
        avoidOverlap(peaks, 56);

        const seasonIdx = getSeasonIdx();
        const seasonLabel = SEASON_LABEL[seasonIdx];

        const rangePaths = [...MOUNTAIN_RANGES, ...RIVERS].map(m => {
            const stroke = m.color || "#5a7048";
            const dash = m.color ? "" : 'stroke-dasharray="3 4"';
            return `<path d="${m.d}" fill="none" stroke="${stroke}" stroke-width="${m.w}" stroke-linecap="round" opacity="${m.op}" ${dash}/>`;
        }).join("");

        const islandHtml = ISLANDS.map(i => {
            if (i.type === "ellipse") {
                return `<ellipse cx="${i.cx}" cy="${i.cy}" rx="${i.rx}" ry="${i.ry}" fill="url(#atlasLand)" stroke="#6b4a2a" stroke-width="1.2" opacity="0.92"/>`;
            }
            return `<path d="${i.d}" fill="url(#atlasLand)" stroke="#6b4a2a" stroke-width="1.2" opacity="0.92"/>`;
        }).join("");

        const peakNodes = peaks.map((node) => {
            const r = node.route;
            const isRemote = r.type === "remote";
            const visited = (typeof STORE !== "undefined" && STORE.getVisited)
                ? STORE.getVisited().has(r.id) : false;
            const front = isRemote ? "#c9402a" : "#5a8c6a";
            const back  = isRemote ? "#6b1a08" : "#234a32";
            const builder = PEAK_ICONS[r.id] || PEAK_ICONS.default;
            const iconHtml = builder(front, back);
            const cls = `atlas-peak ${isRemote ? "is-remote" : "is-local"} ${visited ? "is-visited" : ""}`;
            // 若发生避让位移,画一根淡线指回真实位置
            const moved = Math.hypot(node.sx - node.ox, node.sy - node.oy) > 4;
            const guideLine = moved
                ? `<line x1="${node.ox.toFixed(1)}" y1="${node.oy.toFixed(1)}" x2="${node.sx.toFixed(1)}" y2="${node.sy.toFixed(1)}" stroke="#6b4a2a" stroke-width="0.6" stroke-dasharray="2 2" opacity="0.4"/>
                   <circle cx="${node.ox.toFixed(1)}" cy="${node.oy.toFixed(1)}" r="1.5" fill="#6b4a2a" opacity="0.55"/>`
                : "";
            return `${guideLine}<g class="${cls}" data-id="${r.id}" transform="translate(${node.sx.toFixed(1)} ${node.sy.toFixed(1)})" tabindex="0" role="button" aria-label="${r.name}">
                ${iconHtml}
                <text class="peak-name" y="20" text-anchor="middle">${r.name}</text>
            </g>`;
        }).join("");

        const counts = {
            local: peaks.filter(p => p.route.type !== "remote").length,
            remote: peaks.filter(p => p.route.type === "remote").length,
            visited: peaks.filter(p => {
                if (typeof STORE === "undefined" || !STORE.getVisited) return false;
                return STORE.getVisited().has(p.route.id);
            }).length
        };

        host.innerHTML = `
            <div class="atlas-wrap">
                <div class="atlas-frame">
                    <div class="atlas-corner tl"></div>
                    <div class="atlas-corner tr"></div>
                    <div class="atlas-corner bl"></div>
                    <div class="atlas-corner br"></div>
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
                                <feGaussianBlur stdDeviation="3"/>
                                <feOffset dx="0" dy="3"/>
                            </filter>
                        </defs>
                        <rect width="${VB_W}" height="${VB_H}" fill="url(#atlasPaper)"/>
                        <path d="${CHINA_PATH}" fill="url(#atlasLand)" stroke="#6b4a2a" stroke-width="1.6" stroke-linejoin="round" opacity="0.95" filter="url(#atlasShadow)"/>
                        ${islandHtml}
                        <g class="atlas-ranges">${rangePaths}</g>
                        <g class="atlas-compass" transform="translate(1110 100)">
                            <circle r="28" fill="rgba(255,250,235,0.78)" stroke="#6b4a2a" stroke-width="1.2"/>
                            <path d="M 0 -22 L 5 0 L 0 22 L -5 0 Z" fill="#8a2818"/>
                            <text y="-32" text-anchor="middle" font-size="14" fill="#6b3a1a">北</text>
                            <text y="40" text-anchor="middle" font-size="14" fill="#6b4a2a">南</text>
                        </g>
                        <g transform="translate(110 100)">
                            <rect x="-44" y="-22" width="88" height="44" fill="#8a2818" rx="3"/>
                            <text y="6" text-anchor="middle" font-size="22" fill="#fff5e0" letter-spacing="6" font-family="LXGW WenKai Screen, serif">山川</text>
                        </g>
                        <g class="atlas-peaks">${peakNodes}</g>
                    </svg>
                </div>
                <aside class="atlas-aside" id="atlasAside">
                    <div class="aside-default" id="asideDefault">
                        <div class="aside-stamp">山<br>川<br>舆<br>图</div>
                        <div class="aside-title">凭舆图远眺</div>
                        <div class="aside-hint">指点山头,观此地${seasonLabel}时风景</div>
                        <div class="aside-counts">
                            <span><i class="dot dot-local"></i>实地 ${counts.local}</span>
                            <span><i class="dot dot-remote"></i>远望 ${counts.remote}</span>
                            <span><i class="dot dot-visited"></i>已徒 ${counts.visited}</span>
                        </div>
                        <div class="aside-foot">每补一山,自添一峰,不待主人手画</div>
                    </div>
                    <div class="aside-detail" id="asideDetail" hidden></div>
                </aside>
            </div>
        `;

        const aside = document.getElementById("asideDetail");
        const asideDefault = document.getElementById("asideDefault");

        host.querySelectorAll(".atlas-peak").forEach(g => {
            const id = parseInt(g.getAttribute("data-id"), 10);
            const r = list.find(x => x.id === id);
            const handle = () => {
                if (typeof window.openModalById === "function") window.openModalById(id);
                else document.querySelector(`.route-card[data-id="${id}"]`)?.click();
            };
            g.addEventListener("click", handle);
            g.addEventListener("keydown", e => {
                if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handle(); }
            });
            const showDetail = () => {
                if (!r) return;
                const scene = (SEASONAL_VIEW[r.id] && SEASONAL_VIEW[r.id][seasonIdx]) || "";
                const isRemote = r.type === "remote";
                aside.innerHTML = `
                    <div class="ad-tag ${isRemote ? "is-remote" : "is-local"}">${isRemote ? "远望志" : "实地"}</div>
                    <h3 class="ad-name">${r.name}</h3>
                    ${r.epithet ? `<div class="ad-epithet">${r.epithet}</div>` : ""}
                    <div class="ad-meta">📍 ${r.location || ""} · 最佳季 ${r.bestSeason || ""}</div>
                    ${scene ? `<div class="ad-scene">
                        <span class="scene-tag">${seasonLabel}景</span>
                        ${scene}
                    </div>` : ""}
                    ${r.poem ? `<div class="ad-poem">「${r.poem.lines[r.poem.lines.length - 1]}」<span>— ${r.poem.author}</span></div>` : ""}
                    <button class="ad-go" data-go="${r.id}">入卷 →</button>
                `;
                aside.hidden = false;
                asideDefault.hidden = true;
                aside.querySelector(".ad-go").addEventListener("click", handle);
            };
            const hideDetail = () => {
                // 不立即关,留个停留期,避免来回扫山头闪烁
            };
            g.addEventListener("mouseenter", showDetail);
            g.addEventListener("focus", showDetail);
            g.addEventListener("mouseleave", hideDetail);
        });

        // 鼠标移开整个舆图时才回到默认面板
        const wrap = host.querySelector(".atlas-wrap");
        if (wrap) {
            wrap.addEventListener("mouseleave", () => {
                aside.hidden = true;
                asideDefault.hidden = false;
            });
        }
    }

    window.renderAtlas = renderAtlas;

    function init() {
        if (document.getElementById("atlasStage")) renderAtlas();
    }
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
