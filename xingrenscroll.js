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
            role: "神主",
            kernelSub: "以足量大地 · 以心量山河",
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
        },
        {
            key: "xiake",
            name: "徐霞客",
            fullName: "徐弘祖 · 字振之 · 号霞客",
            life: "1587 — 1641",
            epithet: "朝碧海 · 暮苍梧",
            kernel: "霞客行卷 · 西南绝笔",
            role: "形主",
            kernelSub: "三十四年 · 八万九千里 · 一笔写中国",
            poem: {
                title: "立卷诗",
                lines: [
                    "大丈夫当朝碧海",
                    "而暮苍梧",
                    "迟回霜雪",
                    "顾盼烟霞"
                ],
                author: "徐霞客 · 自题"
            },
            prose: [
                "**立人**:徐弘祖,字振之,号霞客,南直隶江阴人。父绝意仕途,母鼓其壮游;二十二岁出门,三十四年游遍十六省,八万九千里。本志体例 — 行程逐日、山形逐峰、地物详察、文随物变 — 皆自《徐霞客游记》出。霞客以足登山,所至必书,所书必详,故为本志形主。",
                "**立志**:1636 年九月,五十一岁,自江阴启「西南绝笔」万里行。一去四载,先入湘、再入桂、再入黔、再入滇,直抵中缅边境。1637 年五月入桂林,首立中国岩溶学之声;1638 年量黄果树「捣珠崩玉」、苍洱「十九峰之胜」;1639 年至腾冲见火山「炎气逼人」;1640 年抵鸡足山,立《鸡足山志》四卷 — 此乃**中国第一部山志专著**,本志「行山志」之名,本溯于此。",
                "**立行**:霞客之奇,不在游山,而在以山反推地理。1641 年口述《溯江纪源》,辨明金沙江为长江正源 — 校正《禹贡》「岷山导江」之千年误说。霞客非游客,乃以足之所至,易书之所言;以山之所测,正经之所讹。是为「以足校书」 — 行非走过,行乃证道。鸡足山卷眼三字曰「立志」,正在此 — 立中国第一部山志,亦立其一生之志。"
            ],
            stations: [
                {
                    id: 37,
                    yearNum: 1637,
                    yearLabel: "1637",
                    age: "五十二岁",
                    place: "广西 · 桂林漓江",
                    pith: "入南",
                    line: "首察岩溶 · 中国喀斯特学之源"
                },
                {
                    id: 38,
                    yearNum: 1638,
                    yearLabel: "1638",
                    age: "五十三岁",
                    place: "贵州 · 黄果树",
                    pith: "量瀑",
                    line: "捣珠崩玉 · 飞洒满空"
                },
                {
                    id: 39,
                    yearNum: 1638,
                    yearLabel: "1638",
                    age: "五十三岁",
                    place: "云南 · 苍山洱海",
                    pith: "量湖",
                    line: "十九峰之胜 · 凡溪皆十八"
                },
                {
                    id: 40,
                    yearNum: 1639,
                    yearLabel: "1639",
                    age: "五十四岁",
                    place: "云南 · 腾冲火山",
                    pith: "见火",
                    line: "炎气逼人 · 泉沸如鼎"
                },
                {
                    id: 41,
                    yearNum: 1640,
                    yearLabel: "1640",
                    age: "五十五岁",
                    place: "云南 · 鸡足山",
                    pith: "立志",
                    line: "立《鸡足山志》四卷 · 中国第一部山志"
                }
            ]
        },
        {
            key: "mao",
            name: "毛泽东",
            fullName: "毛润之 · 字咏芝 · 号子任",
            life: "1893 — 1976",
            epithet: "万水千山 · 只等闲",
            kernel: "红色长征 · 三山一万里",
            role: "志主",
            kernelSub: "一万二千里足下之路 · 立一国之志",
            poem: {
                title: "立卷诗",
                lines: [
                    "红军不怕远征难",
                    "万水千山只等闲",
                    "五岭逶迤腾细浪",
                    "乌蒙磅礴走泥丸"
                ],
                author: "毛泽东 · 《七律 · 长征》"
            },
            prose: [
                "**立人**:毛润之,1893 生于湖南湘潭韶山冲。1927 秋立井冈山红军;1934 十月,红军一方面军八万六千人自江西瑞金启程西行,二万五千里之长征始。1935 年遵义会议立其领,自此率红军翻山越岭、跨江过河、西征北上,1936 十月红军三大主力陕北会师,长征终。",
                "**立志**:1935 二月,越乌蒙,「乌蒙磅礴走泥丸」 — 长征中段越南方屏障;1935 九月,入岷山,「更喜岷山千里雪」 — 红军第一座大雪山三军过尽;1935 十月,翻六盘,「不到长城非好汉,屈指行程二万」 — 长征收官,赤旗终至陕北。三山贯长征中后段一万里,皆润之亲历亲咏:七律·长征、忆秦娥·娄山关、清平乐·六盘山,皆诗皆志,皆山皆步。",
                "**立行**:志主之于长征,非以书斋立志,亦非以山志校经,乃以**一万二千里足下之路立一国之志**。神主阳明立心学之心、形主霞客量大地之足、志主毛泽东立一国之志 — 心 / 形 / 志三主合,行人志「以足量大地、以心量山河、以志量天下」之骨自此而备。山志至此,卷二十二红色长征行卷立焉。"
            ],
            stations: [
                {
                    id: 30,
                    yearNum: 1935,
                    yearLabel: "1935 · 春",
                    age: "四十二岁",
                    place: "云贵 · 乌蒙山",
                    pith: "磅礴",
                    line: "乌蒙磅礴走泥丸 · 长征南段越屏障"
                },
                {
                    id: 31,
                    yearNum: 1935,
                    yearLabel: "1935 · 秋",
                    age: "四十二岁",
                    place: "甘川 · 岷山",
                    pith: "千雪",
                    line: "更喜岷山千里雪 · 三军过后尽开颜"
                },
                {
                    id: 29,
                    yearNum: 1935,
                    yearLabel: "1935 · 秋末",
                    age: "四十二岁",
                    place: "宁夏 · 六盘山",
                    pith: "长缨",
                    line: "今日长缨在手 · 何时缚住苍龙"
                }
            ]
        }
    ];

    /* ------------------------------------------------------------
       行人 ↔ 山号映射(供 atlas.js 跨卷取山 + 子分卷过滤)
       ------------------------------------------------------------ */
    const XINGREN_PERSON_IDS = (function () {
        const map = {};
        // 由上方 XINGREN_LIST 静态生成 — 每次 list 改动皆自动更新
        // 但 XINGREN_LIST 在此函数前已立,可直接读
        return map;
    })();
    // 立即填充(因 XINGREN_LIST 已在上方定义)
    XINGREN_LIST.forEach(r => {
        XINGREN_PERSON_IDS[r.key] = r.stations.map(s => s.id);
    });
    const XINGREN_ALL_IDS = Object.values(XINGREN_PERSON_IDS).flat();
    window.XINGREN_PERSON_IDS = XINGREN_PERSON_IDS;
    window.XINGREN_ALL_IDS    = XINGREN_ALL_IDS;

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
       徐霞客 · 古风线描立像(SVG 内联)
       葛巾布衣 · 芒鞋束腰 · 左手执杖 · 右手日记本 · 背一行囊 · 微前倾向远方
       与阳明「静而立学」对照 — 霞客「动而行其形」
       ------------------------------------------------------------ */
    function buildXiakePortrait() {
        return `
        <svg class="xingren-portrait" viewBox="0 0 200 320" xmlns="http://www.w3.org/2000/svg" aria-label="徐霞客 古风立像">
            <defs>
                <linearGradient id="xrXiakeRobe" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stop-color="#7a6038"/>
                    <stop offset="50%" stop-color="#5a4828"/>
                    <stop offset="100%" stop-color="#3a2c18"/>
                </linearGradient>
                <radialGradient id="xrXiakeHalo" cx="0.5" cy="0.5" r="0.55">
                    <stop offset="0%" stop-color="#fff5e0" stop-opacity="0.55"/>
                    <stop offset="100%" stop-color="#fff5e0" stop-opacity="0"/>
                </radialGradient>
            </defs>

            <!-- 后景:远岭如画(霞客所行之西南山形) -->
            <path d="M 0 232 L 26 200 L 50 220 L 78 198 L 110 224 L 142 196 L 174 222 L 200 210 L 200 280 L 0 280 Z" fill="#8b5a2b" opacity="0.18"/>
            <path d="M 0 254 Q 40 232 80 244 T 156 240 T 200 246 L 200 280 L 0 280 Z" fill="#5a4028" opacity="0.22"/>
            <path d="M 18 178 q 16 -6 32 0 q 16 -6 32 0" stroke="#fff5e0" stroke-width="1.4" fill="none" opacity="0.55"/>
            <path d="M 110 168 q 14 -5 28 0 q 14 -5 28 0" stroke="#fff5e0" stroke-width="1.2" fill="none" opacity="0.5"/>

            <!-- 头部光晕 -->
            <circle cx="96" cy="68" r="40" fill="url(#xrXiakeHalo)"/>

            <!-- 葛巾(明代束发巾) -->
            <path d="M 74 38 Q 96 24 120 38 L 124 56 Q 122 60 120 62 L 74 62 Q 72 58 70 54 Z" fill="#3a2c18" stroke="#1a1208" stroke-width="1"/>
            <path d="M 74 38 L 74 32 Q 96 18 120 32 L 120 38" fill="none" stroke="#1a1208" stroke-width="0.9"/>
            <path d="M 120 56 q 14 6 22 0 q -8 8 -18 6" fill="#3a2c18" stroke="#1a1208" stroke-width="0.7"/>

            <!-- 面部 -->
            <path d="M 78 62 Q 76 90 84 108 Q 92 120 96 122 Q 102 120 110 108 Q 118 90 116 62 Z" fill="#e8d4ab" stroke="#3a2818" stroke-width="0.9"/>

            <!-- 眉目(目向远视) -->
            <path d="M 82 76 q 4 -2 9 0" stroke="#1a1208" stroke-width="1.1" fill="none" stroke-linecap="round"/>
            <path d="M 102 76 q 5 -2 10 0" stroke="#1a1208" stroke-width="1.1" fill="none" stroke-linecap="round"/>
            <ellipse cx="86" cy="82" rx="1.5" ry="1" fill="#1a1208"/>
            <ellipse cx="107" cy="82" rx="1.5" ry="1" fill="#1a1208"/>

            <!-- 鼻 -->
            <path d="M 96 82 Q 95 94 92 100 Q 96 103 100 100 Q 97 94 96 82" fill="none" stroke="#3a2818" stroke-width="0.7"/>

            <!-- 唇 -->
            <path d="M 90 108 Q 96 112 102 108" stroke="#5a2818" stroke-width="0.8" fill="none" stroke-linecap="round"/>

            <!-- 风霜须 -->
            <path d="M 86 114 q 1 8 2 14" stroke="#1a1208" stroke-width="0.7" fill="none"/>
            <path d="M 108 114 q -1 8 -2 14" stroke="#1a1208" stroke-width="0.7" fill="none"/>
            <path d="M 96 122 q 0 6 0 10" stroke="#1a1208" stroke-width="0.5" fill="none"/>

            <!-- 肩颈(微前倾) -->
            <path d="M 82 120 Q 88 128 96 130 Q 106 128 112 120" fill="#e8d4ab" stroke="#3a2818" stroke-width="0.8"/>

            <!-- 衣领(布衣) -->
            <path d="M 68 150 Q 86 138 96 138 Q 108 138 128 150 L 96 154 Z" fill="#d8c89a" stroke="#3a2818" stroke-width="0.9"/>
            <path d="M 96 138 L 96 168" stroke="#3a2818" stroke-width="0.7"/>

            <!-- 行囊(背于左肩) -->
            <ellipse cx="56" cy="180" rx="14" ry="20" fill="#5a4028" stroke="#1a1208" stroke-width="1"/>
            <path d="M 60 162 q -8 -6 -18 0 q 4 4 10 4" fill="none" stroke="#1a1208" stroke-width="0.9"/>
            <path d="M 50 170 L 60 168" stroke="#3a2818" stroke-width="0.6"/>
            <path d="M 50 184 L 60 182" stroke="#3a2818" stroke-width="0.6"/>

            <!-- 衣身 -->
            <path d="M 62 168 Q 56 218 56 264 L 138 264 Q 138 218 130 168 Q 122 158 110 156 L 82 156 Q 70 158 62 168 Z" fill="url(#xrXiakeRobe)" stroke="#1a1208" stroke-width="1"/>

            <!-- 腰带 + 葫芦 -->
            <rect x="58" y="200" width="80" height="5" fill="#3a2818" stroke="#1a1208" stroke-width="0.6"/>
            <ellipse cx="120" cy="212" rx="5" ry="7" fill="#a0683a" stroke="#1a1208" stroke-width="0.6"/>
            <ellipse cx="120" cy="206" rx="2.5" ry="1.5" fill="#a0683a" stroke="#1a1208" stroke-width="0.5"/>
            <path d="M 120 206 L 116 200" stroke="#1a1208" stroke-width="0.5"/>

            <!-- 衣纹 -->
            <path d="M 78 178 Q 84 218 80 258" stroke="#1a1208" stroke-width="0.7" fill="none" opacity="0.55"/>
            <path d="M 96 168 Q 96 220 96 264" stroke="#1a1208" stroke-width="0.6" fill="none" opacity="0.5"/>
            <path d="M 116 178 Q 110 218 114 258" stroke="#1a1208" stroke-width="0.7" fill="none" opacity="0.55"/>

            <!-- 左袖 + 持杖之手 -->
            <path d="M 62 168 Q 44 196 40 236 Q 46 244 56 240 Q 58 208 70 186 Z" fill="url(#xrXiakeRobe)" stroke="#1a1208" stroke-width="0.8"/>
            <ellipse cx="46" cy="240" rx="5" ry="4" fill="#e8d4ab" stroke="#3a2818" stroke-width="0.7"/>
            <path d="M 44 240 L 36 282" stroke="#5a3a1a" stroke-width="2.2" stroke-linecap="round"/>
            <path d="M 44 240 L 44 232" stroke="#5a3a1a" stroke-width="1.8" stroke-linecap="round"/>
            <circle cx="44" cy="232" r="1.6" fill="#3a2410"/>

            <!-- 右袖 + 持《游记》之手 -->
            <path d="M 138 168 Q 154 200 156 232 Q 150 240 140 234 Q 138 208 126 188 Z" fill="url(#xrXiakeRobe)" stroke="#1a1208" stroke-width="0.8"/>
            <ellipse cx="148" cy="232" rx="6" ry="5" fill="#e8d4ab" stroke="#3a2818" stroke-width="0.7"/>
            <rect x="142" y="226" width="14" height="14" fill="#fff5e0" stroke="#5a3a1a" stroke-width="0.7"/>
            <path d="M 144 230 L 154 230 M 144 233 L 154 233 M 144 236 L 152 236" stroke="#5a3a1a" stroke-width="0.4"/>
            <rect x="142" y="226" width="14" height="2" fill="#8a2818" stroke="#5a3a1a" stroke-width="0.5"/>

            <!-- 山形朱印 -->
            <g transform="translate(96 188)" opacity="0.78">
                <rect x="-9" y="-9" width="18" height="18" fill="#8a2818" stroke="#fff5e0" stroke-width="0.6" rx="1"/>
                <path d="M -6 4 L -2 -4 L 0 -1 L 2 -5 L 6 4 Z" fill="#fff5e0"/>
            </g>

            <!-- 芒鞋 -->
            <ellipse cx="78" cy="278" rx="12" ry="3" fill="#5a3a1a" stroke="#1a1208" stroke-width="0.6"/>
            <ellipse cx="116" cy="278" rx="12" ry="3" fill="#5a3a1a" stroke="#1a1208" stroke-width="0.6"/>
            <path d="M 70 278 L 86 278 M 108 278 L 124 278" stroke="#3a2818" stroke-width="0.4"/>

            <!-- 立地 · 一抹尘土 -->
            <ellipse cx="96" cy="288" rx="46" ry="3" fill="#1a1208" opacity="0.4"/>
            <path d="M 36 282 q -6 4 -10 6" stroke="#a89060" stroke-width="0.6" fill="none" opacity="0.5"/>
        </svg>`;
    }

    function buildPortrait(key) {
        if (key === "xiake") return buildXiakePortrait();
        if (key === "mao")   return buildMaoPortrait();
        return buildYangmingPortrait();
    }

    /* ------------------------------------------------------------
       毛泽东 · 古风线描立像(SVG 内联)· 长征装
       八角帽红星 · 灰布军装 · 左手叉腰 · 右手指远 · 远山雪峰为背
       与阳明「静而立学」、霞客「动而行其形」对照 —— 毛「立而望远」
       ------------------------------------------------------------ */
    function buildMaoPortrait() {
        return `
        <svg class="xingren-portrait" viewBox="0 0 200 320" xmlns="http://www.w3.org/2000/svg" aria-label="毛泽东 长征立像">
            <defs>
                <linearGradient id="xrMaoUniform" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stop-color="#7d8a8e"/>
                    <stop offset="50%" stop-color="#5a6a72"/>
                    <stop offset="100%" stop-color="#3a4850"/>
                </linearGradient>
                <radialGradient id="xrMaoHalo" cx="0.5" cy="0.5" r="0.55">
                    <stop offset="0%" stop-color="#fff5e0" stop-opacity="0.55"/>
                    <stop offset="100%" stop-color="#fff5e0" stop-opacity="0"/>
                </radialGradient>
                <linearGradient id="xrMaoSky" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stop-color="#d4a87a" stop-opacity="0.55"/>
                    <stop offset="100%" stop-color="#8a3a1a" stop-opacity="0.18"/>
                </linearGradient>
            </defs>

            <!-- 后景:朝霞远山雪峰(长征所历) -->
            <rect x="0" y="160" width="200" height="80" fill="url(#xrMaoSky)" opacity="0.6"/>
            <path d="M 0 222 L 24 188 L 46 210 L 72 180 L 100 214 L 130 178 L 158 208 L 184 184 L 200 200 L 200 280 L 0 280 Z" fill="#5a6a72" opacity="0.22"/>
            <!-- 雪峰一痕(岷山千里雪) -->
            <path d="M 60 198 L 78 176 L 92 196 L 76 198 Z" fill="#fff5e0" opacity="0.7"/>
            <path d="M 130 200 L 148 178 L 162 202 L 144 204 Z" fill="#fff5e0" opacity="0.6"/>
            <!-- 远红旗一抹 -->
            <path d="M 168 168 L 184 164 L 184 174 L 168 178 Z" fill="#b81d22" opacity="0.55"/>
            <line x1="168" y1="166" x2="168" y2="200" stroke="#3a2818" stroke-width="0.7" opacity="0.55"/>

            <!-- 头部光晕 -->
            <circle cx="98" cy="68" r="40" fill="url(#xrMaoHalo)"/>

            <!-- 八角帽(红军帽) + 红星 -->
            <path d="M 70 50 L 126 50 L 130 60 L 124 64 L 72 64 L 66 60 Z" fill="#5a6a72" stroke="#1a1208" stroke-width="0.9"/>
            <!-- 帽顶八角形 -->
            <path d="M 76 50 L 78 42 L 86 38 L 96 36 L 106 38 L 114 42 L 116 50 Z" fill="#5a6a72" stroke="#1a1208" stroke-width="0.9"/>
            <!-- 帽檐 -->
            <path d="M 66 60 Q 96 70 130 60 L 128 66 Q 96 74 68 66 Z" fill="#3a4850" stroke="#1a1208" stroke-width="0.7"/>
            <!-- 红五角星 -->
            <g transform="translate(96 47)">
                <path d="M 0 -6 L 1.5 -2 L 5.5 -2 L 2.3 0.5 L 3.5 4.5 L 0 2 L -3.5 4.5 L -2.3 0.5 L -5.5 -2 L -1.5 -2 Z" fill="#b81d22" stroke="#5a0a08" stroke-width="0.4"/>
            </g>

            <!-- 面部 · 微微抬头望远 -->
            <path d="M 78 64 Q 76 92 84 110 Q 92 122 98 124 Q 104 122 112 110 Q 120 92 118 64 Z" fill="#e8c8a0" stroke="#3a2818" stroke-width="0.9"/>

            <!-- 眉(略浓有力) -->
            <path d="M 82 76 q 5 -3 11 0" stroke="#1a1208" stroke-width="1.4" fill="none" stroke-linecap="round"/>
            <path d="M 104 76 q 5 -3 11 0" stroke="#1a1208" stroke-width="1.4" fill="none" stroke-linecap="round"/>

            <!-- 目(眼向远) -->
            <ellipse cx="87" cy="83" rx="1.6" ry="1.1" fill="#1a1208"/>
            <ellipse cx="109" cy="83" rx="1.6" ry="1.1" fill="#1a1208"/>

            <!-- 鼻 -->
            <path d="M 98 83 Q 97 96 94 102 Q 98 105 102 102 Q 99 96 98 83" fill="none" stroke="#3a2818" stroke-width="0.7"/>

            <!-- 唇(微抿,有定见) -->
            <path d="M 92 110 Q 98 113 104 110" stroke="#5a2818" stroke-width="0.9" fill="none" stroke-linecap="round"/>

            <!-- 颌下痣(右下,润之之识) -->
            <circle cx="105" cy="116" r="0.9" fill="#3a2818"/>

            <!-- 肩颈 -->
            <path d="M 84 122 Q 90 132 98 134 Q 108 132 114 122" fill="#e8c8a0" stroke="#3a2818" stroke-width="0.8"/>

            <!-- 中山领(立领,长征军装) -->
            <path d="M 74 152 L 78 142 Q 98 140 118 142 L 122 152 L 98 156 Z" fill="#5a6a72" stroke="#1a1208" stroke-width="0.9"/>
            <line x1="98" y1="142" x2="98" y2="172" stroke="#1a1208" stroke-width="0.7"/>
            <!-- 双胸袋 -->
            <rect x="78" y="172" width="14" height="12" fill="none" stroke="#1a1208" stroke-width="0.6"/>
            <rect x="104" y="172" width="14" height="12" fill="none" stroke="#1a1208" stroke-width="0.6"/>
            <!-- 袋扣 -->
            <circle cx="85" cy="172" r="0.8" fill="#1a1208"/>
            <circle cx="111" cy="172" r="0.8" fill="#1a1208"/>

            <!-- 衣身(灰布军装) -->
            <path d="M 64 168 Q 58 220 58 268 L 138 268 Q 138 220 132 168 Q 124 158 114 156 L 82 156 Q 72 158 64 168 Z" fill="url(#xrMaoUniform)" stroke="#1a1208" stroke-width="1"/>

            <!-- 衣纹 -->
            <path d="M 78 196 Q 80 230 76 264" stroke="#1a1208" stroke-width="0.7" fill="none" opacity="0.55"/>
            <path d="M 98 168 Q 98 220 98 268" stroke="#1a1208" stroke-width="0.6" fill="none" opacity="0.5"/>
            <path d="M 118 196 Q 116 230 120 264" stroke="#1a1208" stroke-width="0.7" fill="none" opacity="0.55"/>

            <!-- 武装带(长征军装显著识别) -->
            <rect x="60" y="206" width="80" height="4" fill="#3a2818" stroke="#1a1208" stroke-width="0.6"/>
            <rect x="96" y="204" width="6" height="8" fill="#a89060" stroke="#1a1208" stroke-width="0.5"/>
            <!-- 斜挎武装带过左肩 -->
            <path d="M 60 168 L 138 210" stroke="#3a2818" stroke-width="2.4" opacity="0.78"/>
            <path d="M 60 168 L 138 210" stroke="#a89060" stroke-width="0.6" opacity="0.6"/>

            <!-- 左袖(自然下垂,手叉腰) -->
            <path d="M 64 168 Q 50 200 48 240 Q 54 246 64 240 Q 64 210 72 188 Z" fill="url(#xrMaoUniform)" stroke="#1a1208" stroke-width="0.8"/>
            <ellipse cx="56" cy="240" rx="6" ry="5" fill="#e8c8a0" stroke="#3a2818" stroke-width="0.7"/>

            <!-- 右袖(向前略举,持军报/七律) -->
            <path d="M 138 168 Q 158 196 162 226 Q 156 234 144 230 Q 142 200 130 184 Z" fill="url(#xrMaoUniform)" stroke="#1a1208" stroke-width="0.8"/>
            <ellipse cx="152" cy="228" rx="6" ry="5" fill="#e8c8a0" stroke="#3a2818" stroke-width="0.7"/>
            <!-- 军报《七律 · 长征》纸卷 -->
            <rect x="146" y="222" width="14" height="14" fill="#fff5e0" stroke="#5a3a1a" stroke-width="0.7"/>
            <path d="M 148 226 L 158 226 M 148 229 L 158 229 M 148 232 L 156 232" stroke="#5a3a1a" stroke-width="0.4"/>
            <rect x="146" y="222" width="14" height="2" fill="#b81d22" stroke="#5a3a1a" stroke-width="0.5"/>

            <!-- 红印于胸前 · 一颗五角星(立志) -->
            <g transform="translate(98 192)" opacity="0.78">
                <rect x="-9" y="-9" width="18" height="18" fill="#b81d22" stroke="#fff5e0" stroke-width="0.6" rx="1"/>
                <path d="M 0 -5.5 L 1.4 -1.8 L 5 -1.8 L 2.1 0.6 L 3.2 4.2 L 0 1.9 L -3.2 4.2 L -2.1 0.6 L -5 -1.8 L -1.4 -1.8 Z" fill="#fff5e0"/>
            </g>

            <!-- 草鞋(长征军中草鞋) -->
            <ellipse cx="80" cy="280" rx="13" ry="3" fill="#5a3a1a" stroke="#1a1208" stroke-width="0.6"/>
            <ellipse cx="118" cy="280" rx="13" ry="3" fill="#5a3a1a" stroke="#1a1208" stroke-width="0.6"/>
            <path d="M 70 280 L 90 280 M 110 280 L 128 280" stroke="#3a2818" stroke-width="0.4"/>
            <path d="M 73 278 L 89 278 M 109 278 L 127 278" stroke="#a89060" stroke-width="0.4" opacity="0.6"/>

            <!-- 立地 -->
            <ellipse cx="98" cy="290" rx="48" ry="3" fill="#1a1208" opacity="0.4"/>
        </svg>`;
    }

    /* ------------------------------------------------------------
       Timeline 珠链 · 横向年序
       ------------------------------------------------------------ */
    function buildStationDots(stations, routes, beadKey) {
        const dots = stations.map((s, i) => {
            const route = routes.find(r => r.id === s.id);
            const exists = !!route;
            const last = i === stations.length - 1;
            return `
            <li class="xs-station ${exists ? "" : "is-missing"}" data-id="${s.id}" tabindex="${exists ? 0 : -1}" role="${exists ? "button" : "presentation"}" aria-label="${s.yearLabel} · ${route ? route.name : s.place}">
                <div class="xs-year">${s.yearLabel}</div>
                <div class="xs-axis">
                    <span class="xs-bead xs-bead-${beadKey || "yangming"}"></span>
                    ${last ? "" : `<span class="xs-line xs-line-${beadKey || "yangming"}"></span>`}
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
       行人志子分卷状态(全部 / 阳明 / 霞客 / 志主)
       ------------------------------------------------------------ */
    let currentXingren = "all";

    function buildSubTabs() {
        const tabs = [
            { key: "all",       label: "全部",   sub: "三主并立" },
            { key: "yangming",  label: "阳明",   sub: "神主 · 立心" },
            { key: "xiake",     label: "霞客",   sub: "形主 · 立形" },
            { key: "mao",       label: "志主",   sub: "毛 · 立志" }
        ];
        return `<div class="xs-subtabs" role="tablist" aria-label="行人志子分卷">
            ${tabs.map(t => `
            <button type="button" class="xs-subtab xs-subtab-${t.key} ${currentXingren === t.key ? "is-active" : ""}" data-subtab="${t.key}" role="tab" aria-selected="${currentXingren === t.key}">
                <span class="xst-label">${t.label}</span>
                <span class="xst-sub">${t.sub}</span>
            </button>`).join("")}
        </div>`;
    }

    /* ------------------------------------------------------------
       渲染主函数 · 注入卷轴到舆图上方(支持多人叠卷 + 子分卷)
       ------------------------------------------------------------ */
    function renderXingrenScroll(detail) {
        const sec = document.getElementById("atlasSection");
        if (!sec) return;
        const old = document.getElementById("xingrenScroll");
        if (old) old.remove();

        if (detail.filter !== "xingren") return;

        const routes = (typeof window.routes !== "undefined" && Array.isArray(window.routes))
            ? window.routes
            : (Array.isArray(detail.list) ? detail.list : []);

        const wrap = document.createElement("div");
        wrap.id = "xingrenScroll";
        wrap.className = "xingren-scroll xingren-stack";

        const subTitleMap = {
            all:      "三主并立 · 心 / 形 / 志合骨",
            yangming: "神主 · 阳明卷 · 一山一悟",
            xiake:    "形主 · 霞客卷 · 西南绝笔",
            mao:      "志主 · 长征卷 · 一万二千里"
        };

        wrap.innerHTML = `
            <div class="xs-stack-head">
                <div class="xs-stack-title">行人志 · 三卷并立</div>
                <div class="xs-stack-sub">心主阳明 · 形主霞客 · 志主毛 — 一身而三魂,知行合一</div>
            </div>
            ${buildSubTabs()}
            <div class="xs-current-sub">${subTitleMap[currentXingren] || subTitleMap.all}</div>
        `;

        const visibleList = currentXingren === "all"
            ? XINGREN_LIST
            : XINGREN_LIST.filter(r => r.key === currentXingren);

        visibleList.forEach(ren => {
            const portrait = buildPortrait(ren.key);
            const dots = buildStationDots(ren.stations, routes, ren.key);
            const proseHtml = ren.prose.map(p => `<p>${p.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")}</p>`).join("");

            const block = document.createElement("div");
            block.className = `xs-block xs-block-${ren.key}`;
            block.innerHTML = `
                <div class="xs-stage">
                    <div class="xs-side">
                        ${portrait}
                        <div class="xs-side-meta">
                            <div class="xs-role">${ren.role}</div>
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
                            <div class="xs-sub">${ren.kernelSub || "以足量大地 · 以心量山河"}</div>
                        </div>
                        <div class="xs-prose">${proseHtml}</div>
                        ${dots}
                    </div>
                </div>
            `;
            wrap.appendChild(block);
        });

        const stage = document.getElementById("atlasStage");
        if (stage && stage.parentNode === sec) {
            sec.insertBefore(wrap, stage);
        } else {
            sec.appendChild(wrap);
        }

        // 子分卷钮:点之即换 currentXingren,通知 atlas 重画并联动
        wrap.querySelectorAll(".xs-subtab").forEach(btn => {
            btn.addEventListener("click", () => {
                const k = btn.getAttribute("data-subtab");
                if (k === currentXingren) return;
                currentXingren = k;
                if (typeof window.setAtlasXingren === "function") {
                    window.setAtlasXingren(k);
                } else if (typeof window.renderAtlas === "function") {
                    window.renderAtlas();
                }
            });
        });

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

    // 暴露给 atlas.js 读取(舆图也据此过滤山头与串线)
    window.getXingrenSubFilter = function () { return currentXingren; };

    window.addEventListener("atlas:rendered", e => {
        renderXingrenScroll(e.detail || {});
    });
})();
