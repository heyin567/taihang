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
        if (key === "xiake")    return buildXiakePortrait();
        return buildYangmingPortrait();
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
       渲染主函数 · 注入卷轴到舆图上方(支持多人叠卷)
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

        // 总骨题首
        wrap.innerHTML = `
            <div class="xs-stack-head">
                <div class="xs-stack-title">行人志 · 二卷并立</div>
                <div class="xs-stack-sub">形主霞客以足登山 · 神主阳明以心登山 — 一身而二魂,知行合一</div>
            </div>
        `;

        XINGREN_LIST.forEach(ren => {
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
