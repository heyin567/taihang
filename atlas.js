/* ============================================================
   行山志 · 山川舆图 (atlas.js)
   --------------------
   - 中国轮廓按真实经纬度打点重绘
   - 仿《禹贡九州图》笔意,九州古名、海域名、题跋俱全
   - 自动从 routes[] 读取 coords,新增山自动落点
   - 太行九山地理太密,会自动力学避让散开
   - 14 座山各有独特图标
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
       中国国境线 · 真实经纬度打点(顺时针,自西向东)
       关键节点参照真实地理:
       新疆西、西北段 → 北部中蒙边境 → 漠河 → 黑龙江尽头 →
       珲春图们江 → 辽东半岛 → 山东半岛 → 长三角 → 闽粤 →
       北部湾 → 中越/中老/中缅边境 → 藏南墨脱 → 喜马拉雅 →
       阿里普兰 → 喀喇昆仑 → 帕米尔 → 阿尔泰
       ============================================================ */
    const CHINA_OUTLINE = [
        // 新疆西北角(阿尔泰山西段起)
        [88.0, 49.2],   [90.0, 47.8],   [92.5, 46.0],   [96.0, 43.5],
        [99.0, 42.0],   [102.5, 42.2],  [105.5, 41.8],  [108.5, 42.5],
        [112.0, 43.6],  [114.5, 45.0],  [117.5, 46.5],  [118.5, 49.6],   // 满洲里
        [121.0, 53.0],  [122.4, 53.5],  // 漠河
        [124.5, 52.8],  [127.5, 51.0],  [130.0, 48.8],  [134.0, 48.4],
        [134.8, 48.3],  // 抚远(黑乌汇合)
        [133.0, 46.5],  [131.0, 45.0],  [131.0, 42.9],
        [130.5, 42.4],  // 珲春(图们江入海)
        // 辽东海岸
        [125.0, 40.0],  // 丹东
        [122.5, 39.8],
        [121.6, 38.9],  // 大连
        [121.2, 39.5],  // 渤海湾内折
        [118.0, 39.0],  [117.7, 38.0],  [119.0, 37.5],
        [122.5, 37.4],  // 山东半岛东端 荣成
        [120.4, 36.1],  // 青岛
        [120.0, 35.0],  [119.5, 34.5],
        [121.5, 31.3],  // 长江口/上海
        [121.6, 29.0],  // 浙东
        [120.5, 27.0],  // 闽北
        [119.3, 26.1],  // 福州
        [118.1, 24.5],  // 厦门
        [116.7, 23.4],  // 汕头
        [114.2, 22.3],  // 香港
        [113.5, 22.2],  // 澳门
        [111.0, 21.8],  // 阳江
        [110.4, 20.4],  // 雷州半岛南端
        [109.8, 20.9],  // 雷州西
        [109.7, 21.5],  [108.6, 21.6],  // 北海
        [108.4, 21.7],  // 防城港(中越交界)
        // 中越边境西行
        [106.7, 22.1],  // 友谊关
        [105.5, 22.8],  [103.9, 22.5],  // 河口
        // 中老边境
        [101.5, 22.4],  [101.3, 21.5],  [100.2, 21.5],
        // 中缅边境
        [99.4, 22.0],   [97.8, 24.0],   // 瑞丽
        [98.0, 25.5],   [97.5, 27.5],   [96.7, 28.5],   // 察隅
        [96.0, 29.0],   [95.3, 29.3],   // 墨脱
        // 喜马拉雅(中印/中不/中尼)
        [92.0, 27.7],   [88.9, 27.5],   // 亚东
        [86.0, 27.99],  // 樟木(中尼)
        [83.5, 28.5],   [81.2, 30.3],   // 普兰
        // 西段(克什米尔/阿克赛钦)
        [79.0, 32.5],   [78.6, 33.5],   // 班公湖
        [77.0, 35.0],   [76.5, 35.6],   // 喀喇昆仑山口(中巴)
        [75.5, 36.5],   [74.5, 37.2],   // 瓦罕走廊(中阿)
        // 帕米尔/中塔
        [73.6, 38.5],   [73.5, 39.6],
        // 中吉
        [74.0, 40.5],   [75.0, 42.0],
        // 中哈
        [80.4, 44.2],   // 霍尔果斯
        [82.6, 45.2],   // 阿拉山口
        [85.0, 47.0],   [85.9, 47.5],
        [88.0, 49.2]    // 闭合
    ];

    function outlinePath(points) {
        return points.map((p, i) => {
            const { x, y } = project(p[0], p[1]);
            return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
        }).join(" ") + " Z";
    }
    const CHINA_PATH = outlinePath(CHINA_OUTLINE);

    /* ============================================================
       海南、台湾、舟山(主要岛屿,按真实位置)
       ============================================================ */
    const ISLAND_POLYGONS = [
        // 海南岛(自东北沿岸顺时针)
        {
            name: "海南",
            points: [
                [110.8, 20.1], [111.0, 19.4], [110.5, 18.5], [109.0, 18.3],
                [108.6, 19.2], [109.5, 20.0], [110.8, 20.1]
            ]
        },
        // 台湾(沿岸顺时针)
        {
            name: "台湾",
            points: [
                [121.6, 25.3], [122.0, 24.3], [121.5, 22.8], [120.8, 21.95],
                [120.2, 22.5], [120.5, 23.8], [121.0, 25.0], [121.6, 25.3]
            ]
        }
    ];

    /* ============================================================
       九州古名(《禹贡》):按大致中心位置
       ============================================================ */
    const NINE_PROVINCES = [
        { name: "雍州", lon: 100.0, lat: 38.0 },
        { name: "梁州", lon: 105.5, lat: 30.5 },
        { name: "豫州", lon: 113.0, lat: 33.5 },
        { name: "冀州", lon: 113.5, lat: 38.5 },
        { name: "兖州", lon: 115.5, lat: 35.5 },
        { name: "青州", lon: 119.0, lat: 36.5 },
        { name: "徐州", lon: 117.5, lat: 33.8 },
        { name: "扬州", lon: 119.0, lat: 29.5 },
        { name: "荆州", lon: 112.0, lat: 30.0 }
    ];

    /* ============================================================
       海域名(淡墨)
       ============================================================ */
    const SEA_LABELS = [
        { name: "渤  海", lon: 120.0, lat: 39.0, size: 14 },
        { name: "黄  海", lon: 124.0, lat: 35.5, size: 16 },
        { name: "东  海", lon: 125.5, lat: 29.0, size: 18 },
        { name: "南  海", lon: 115.0, lat: 17.5, size: 20 }
    ];

    /* ============================================================
       主要山系/河流写意线(山系不带轮廓,只勾走向)
       ============================================================ */
    function lineByCoords(coords, opts) {
        const pts = coords.map(c => project(c[0], c[1]));
        let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
        for (let i = 1; i < pts.length - 1; i++) {
            const mx = (pts[i].x + pts[i + 1].x) / 2;
            const my = (pts[i].y + pts[i + 1].y) / 2;
            d += ` Q ${pts[i].x.toFixed(1)} ${pts[i].y.toFixed(1)} ${mx.toFixed(1)} ${my.toFixed(1)}`;
        }
        const last = pts[pts.length - 1];
        d += ` T ${last.x.toFixed(1)} ${last.y.toFixed(1)}`;
        return Object.assign({ d }, opts);
    }
    const MOUNTAIN_RANGES = [
        // 太行山:北起燕山,南至豫西
        lineByCoords([[114.0, 41.0], [114.0, 39.0], [113.5, 37.0], [113.0, 35.0]],
            { w: 2.4, op: 0.45, name: "太行" }),
        // 燕山
        lineByCoords([[115.5, 40.5], [117.5, 40.8], [120.0, 41.0]],
            { w: 2, op: 0.4, name: "燕山" }),
        // 秦岭
        lineByCoords([[104.0, 33.5], [107.5, 33.8], [111.0, 34.0], [113.0, 33.8]],
            { w: 2.2, op: 0.45, name: "秦岭" }),
        // 大别山
        lineByCoords([[114.0, 31.5], [115.5, 31.2], [116.5, 30.8]],
            { w: 1.6, op: 0.32, name: "大别" }),
        // 武夷山
        lineByCoords([[117.0, 27.5], [117.5, 26.5], [118.0, 25.5]],
            { w: 1.6, op: 0.32, name: "武夷" }),
        // 横断山
        lineByCoords([[99.0, 31.0], [100.0, 29.0], [101.0, 26.0]],
            { w: 2, op: 0.4, name: "横断" }),
        // 喜马拉雅
        lineByCoords([[85.0, 28.5], [88.0, 28.0], [92.0, 28.0], [95.0, 28.5]],
            { w: 2.2, op: 0.42, name: "喜马拉雅" }),
        // 天山
        lineByCoords([[78.0, 42.5], [83.0, 42.8], [88.0, 43.0], [94.0, 42.8]],
            { w: 2.1, op: 0.42, name: "天山" }),
        // 阴山
        lineByCoords([[107.0, 41.5], [111.0, 41.8], [114.0, 41.5]],
            { w: 1.6, op: 0.32, name: "阴山" })
    ];

    // 长江:沱沱河→宜宾→重庆→武汉→南京→上海
    const YANGTZE = lineByCoords([
        [92.5, 33.5], [97.0, 33.0], [100.5, 30.0], [104.6, 28.8],
        [106.5, 29.6], [110.0, 30.7], [114.3, 30.6], [118.8, 32.0], [121.5, 31.3]
    ], { w: 1.8, op: 0.6, color: "#5a7ba0", name: "长江" });

    // 黄河:巴颜喀拉→兰州→银川→河套→风陵渡→郑州→东营
    const YELLOW_RIVER = lineByCoords([
        [96.0, 34.5], [101.5, 35.5], [103.8, 36.0], [106.3, 38.5],
        [109.8, 40.7], [111.2, 39.2], [110.3, 34.7], [113.7, 34.7],
        [116.5, 36.0], [118.6, 37.8]
    ], { w: 1.8, op: 0.6, color: "#a08555", name: "黄河" });

    /* ============================================================
       14 座山的独特图标
       ============================================================ */
    const PEAK_ICONS = {
        1: (fc, sc) => `
            <path d="M -15 8 L -8 -4 Q -4 -12 0 -8 Q 4 -12 8 -4 L 15 8 Z" fill="${fc}" stroke="${sc}" stroke-width="0.9" stroke-linejoin="round"/>
            <rect x="-4" y="-7" width="8" height="3.5" fill="#fff5e0" stroke="${sc}" stroke-width="0.6"/>
            <path d="M -5 -7 L 5 -7" stroke="${sc}" stroke-width="0.5"/>`,
        2: (fc, sc) => `
            <path d="M -15 8 Q -10 -4 -6 -2 Q -2 -10 2 -2 Q 6 -4 10 -8 Q 14 -2 15 8 Z" fill="${fc}" stroke="${sc}" stroke-width="0.9" stroke-linejoin="round"/>`,
        3: (fc, sc) => `
            <path d="M -15 8 L -15 0 L -7 0 L -7 -5 L 1 -5 L 1 -11 L 15 -11 L 15 8 Z" fill="${fc}" stroke="${sc}" stroke-width="0.9" stroke-linejoin="round"/>
            <path d="M -15 0 L -7 0 M -7 -5 L 1 -5 M 1 -11 L 15 -11" stroke="${sc}" stroke-width="0.5" opacity="0.6"/>`,
        4: (fc, sc) => `
            <path d="M -15 8 L -10 -5 L 10 -5 L 15 8 Z" fill="${fc}" stroke="${sc}" stroke-width="0.9" stroke-linejoin="round"/>
            <rect x="-5" y="-11" width="10" height="6" fill="#c9402a" stroke="${sc}" stroke-width="0.6"/>
            <path d="M -7 -11 L 7 -11" stroke="${sc}" stroke-width="0.7"/>`,
        5: (fc, sc) => `
            <path d="M -10 8 L -1 -16 L 1 -16 L 10 8 Z" fill="${fc}" stroke="${sc}" stroke-width="0.9" stroke-linejoin="round"/>
            <path d="M -3 -10 L 0 -16 L 3 -10 Z" fill="#d4a017" stroke="${sc}" stroke-width="0.5"/>`,
        6: (fc, sc) => `
            <path d="M -15 8 L -11 -3 L -7 8 L -3 -8 L 1 8 L 5 -5 L 9 8 L 13 -2 L 15 8 Z" fill="${fc}" stroke="${sc}" stroke-width="0.9" stroke-linejoin="round"/>`,
        7: (fc, sc) => `
            <path d="M -10 8 Q -8 -10 0 -12 Q 8 -10 10 8 Z" fill="${fc}" stroke="${sc}" stroke-width="0.9" stroke-linejoin="round"/>
            <path d="M -7 -14 q 4 -3 8 0 q 4 -3 8 0 q -3 4 -8 2 q -5 2 -8 -2 z" fill="#fff5e0" stroke="${sc}" stroke-width="0.5" opacity="0.85"/>`,
        8: (fc, sc) => `
            <path d="M -15 8 L -8 -4 L 0 -8 L 8 -4 L 15 8 Z" fill="${fc}" stroke="${sc}" stroke-width="0.9" stroke-linejoin="round"/>
            <path d="M -12 -2 L 12 -10" stroke="#c9402a" stroke-width="0.8" stroke-dasharray="2 1.5"/>
            <circle cx="-12" cy="-2" r="1.2" fill="${sc}"/>
            <circle cx="12" cy="-10" r="1.2" fill="${sc}"/>`,
        9: (fc, sc) => `
            <path d="M -12 8 L -8 -4 Q -4 -12 0 -10 Q 4 -12 8 -4 L 12 8 Z" fill="${fc}" stroke="${sc}" stroke-width="0.9" stroke-linejoin="round"/>
            <path d="M -2 -4 L -2 8 M 0 -5 L 0 8 M 2 -4 L 2 8" stroke="#a8d5e8" stroke-width="0.9"/>`,
        10: (fc, sc) => `
            <path d="M -16 8 L -12 -3 L -5 -9 L 5 -9 L 12 -3 L 16 8 Z" fill="${fc}" stroke="${sc}" stroke-width="0.9" stroke-linejoin="round"/>
            <circle cx="9" cy="-13" r="3.2" fill="#c9402a" stroke="#fff5e0" stroke-width="0.6"/>`,
        11: (fc, sc) => `
            <path d="M -7 8 L -2 -18 L 0 -22 L 2 -18 L 7 8 Z" fill="${fc}" stroke="${sc}" stroke-width="0.9" stroke-linejoin="round"/>
            <path d="M -3 -2 L 3 -2" stroke="${sc}" stroke-width="0.5" opacity="0.7"/>`,
        12: (fc, sc) => `
            <path d="M -13 8 Q -8 -8 0 -11 Q 8 -8 13 8 Z" fill="${fc}" stroke="${sc}" stroke-width="0.9" stroke-linejoin="round"/>
            <path d="M -11 -2 q 4 -4 8 -1 q 4 -4 9 -1 q 5 -2 7 0 q -3 4 -8 2 q -5 3 -9 -1 q -4 4 -7 0 z" fill="#fff5e0" stroke="${sc}" stroke-width="0.5" opacity="0.85"/>`,
        13: (fc, sc) => `
            <path d="M -15 8 L -10 -3 L -3 -11 L 3 -11 L 10 -3 L 15 8 Z" fill="${fc}" stroke="${sc}" stroke-width="0.9" stroke-linejoin="round"/>
            <rect x="-7" y="-6" width="14" height="4" fill="#8b4513" stroke="${sc}" stroke-width="0.5"/>
            <path d="M -7 -2 L -8 4 M 7 -2 L 8 4" stroke="${sc}" stroke-width="0.5"/>`,
        14: (fc, sc) => `
            <path d="M -15 8 Q -10 -7 -3 0 Q 0 -10 3 0 Q 10 -7 15 8 Z" fill="${fc}" stroke="${sc}" stroke-width="0.9" stroke-linejoin="round"/>
            <rect x="-1.5" y="-9" width="3" height="9" fill="#d4a017" stroke="${sc}" stroke-width="0.4"/>
            <path d="M -2.5 -9 L 2.5 -9" stroke="${sc}" stroke-width="0.5"/>`,
        // 黄山 · 迎客松立云海
        15: (fc, sc) => `
            <path d="M -14 8 Q -8 -8 -2 -3 Q 0 -12 2 -3 Q 8 -8 14 8 Z" fill="${fc}" stroke="${sc}" stroke-width="0.9" stroke-linejoin="round"/>
            <path d="M -10 4 Q -2 0 6 -2" stroke="${sc}" stroke-width="0.7" fill="none"/>
            <path d="M 6 -2 q -2 -3 -1 -6 q 3 1 5 -2 q 1 3 4 1 q 1 3 -2 4 q 2 3 -1 4 q -3 1 -5 -1 z" fill="#3d6e5a" stroke="${sc}" stroke-width="0.4"/>
            <path d="M 6 -2 L 6 6" stroke="#5a3a1f" stroke-width="0.6"/>`,
        // 雁荡 · 灵峰双柱
        16: (fc, sc) => `
            <path d="M -14 8 L -10 -2 L -6 -10 L -3 -2 L 0 8 Z" fill="${fc}" stroke="${sc}" stroke-width="0.9" stroke-linejoin="round"/>
            <path d="M 0 8 L 3 -2 L 7 -12 L 10 -2 L 14 8 Z" fill="${fc}" stroke="${sc}" stroke-width="0.9" stroke-linejoin="round"/>
            <circle cx="-7" cy="-7" r="0.9" fill="${sc}"/>
            <circle cx="7" cy="-9" r="0.9" fill="${sc}"/>`,
        // 武当 · 金顶宫殿三檐
        17: (fc, sc) => `
            <path d="M -15 8 L -10 -2 L -2 -8 L 2 -8 L 10 -2 L 15 8 Z" fill="${fc}" stroke="${sc}" stroke-width="0.9" stroke-linejoin="round"/>
            <rect x="-5" y="-6" width="10" height="3" fill="#d4a017" stroke="${sc}" stroke-width="0.5"/>
            <path d="M -6 -8 L 6 -8 L 4 -10 L -4 -10 Z" fill="#d4a017" stroke="${sc}" stroke-width="0.5"/>
            <rect x="-1" y="-13" width="2" height="3" fill="#d4a017" stroke="${sc}" stroke-width="0.4"/>`,
        // 峨眉 · 金顶佛光
        18: (fc, sc) => `
            <path d="M -14 8 L -8 -4 L -2 -10 L 2 -10 L 8 -4 L 14 8 Z" fill="${fc}" stroke="${sc}" stroke-width="0.9" stroke-linejoin="round"/>
            <circle cx="0" cy="-13" r="4" fill="none" stroke="#d4a017" stroke-width="0.7" stroke-dasharray="1.2 1"/>
            <circle cx="0" cy="-13" r="2" fill="#d4a017" stroke="${sc}" stroke-width="0.5"/>
            <rect x="-2" y="-9" width="4" height="3" fill="#c9402a" stroke="${sc}" stroke-width="0.4"/>`,
        // 终南 · 云隐山脊
        19: (fc, sc) => `
            <path d="M -15 8 Q -10 -2 -6 -4 Q -2 -9 0 -6 Q 2 -10 6 -4 Q 10 -2 15 8 Z" fill="${fc}" stroke="${sc}" stroke-width="0.9" stroke-linejoin="round"/>
            <path d="M -12 -1 q 4 -3 8 -1 q 4 -3 8 -1 q 4 -2 8 -1" fill="none" stroke="#fff5e0" stroke-width="1.4" opacity="0.85"/>
            <path d="M -10 3 q 4 -2 8 0 q 4 -2 8 0" fill="none" stroke="#fff5e0" stroke-width="1" opacity="0.7"/>`,
        // 龙冈 · 阳明洞 · 一山一洞一卷书
        34: (fc, sc) => `
            <path d="M -14 8 L -8 -3 L -2 -8 L 2 -8 L 8 -3 L 14 8 Z" fill="${fc}" stroke="${sc}" stroke-width="0.9" stroke-linejoin="round"/>
            <path d="M -4 8 L -4 -1 Q 0 -5 4 -1 L 4 8 Z" fill="#1a1208" stroke="${sc}" stroke-width="0.5"/>
            <rect x="-3" y="-12" width="6" height="4" fill="#fff5e0" stroke="${sc}" stroke-width="0.5"/>
            <path d="M -2 -11 L 2 -11 M -2 -10 L 2 -10" stroke="${sc}" stroke-width="0.3"/>
            <text x="0" y="-13" text-anchor="middle" font-size="3.5" fill="${sc}" font-family="LXGW WenKai Screen, serif">心</text>`,
        default: (fc, sc) => `
            <path d="M -10 8 L 0 -12 L 10 8 Z" fill="${fc}" stroke="${sc}" stroke-width="0.9" stroke-linejoin="round"/>`
    };

    /* ============================================================
       14 座山 × 四时风景
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
        14: ["少林山樱 · 嵩岳春深花满坞", "藏经阁凉 · 嵩高维岳避暑天", "嵩山秋叶 · 三皇寨上枫如锦", "塔林雪覆 · 千塔披银禅意深"],
        15: ["黄山映杜鹃 · 始信峰前云蒸花", "迎客松凉 · 光明顶上观云海", "黄山秋色 · 西海大峡谷红霜染", "黄山雪松 · 玉屏松雪冠如银"],
        16: ["雁荡春兰 · 灵峰夜色情人现", "大龙湫凉 · 飞瀑千尺溅风衣", "雁荡黄叶 · 灵岩飞渡红云间", "雁荡冬岚 · 海雾绕峰怪石静"],
        17: ["武当桃源 · 太子坡前杏花开", "紫霄夏荫 · 道院蝉鸣松风冷", "金顶秋光 · 七十二峰朝大顶", "玄岳雪封 · 金殿一点夕阳红"],
        18: ["峨眉杜鹃 · 万年寺前花海春", "清音消暑 · 双桥流水洗尘心", "峨眉红叶 · 报国寺秋满千林", "金顶佛光 · 云海冬阳现圆轮"],
        19: ["终南桃林 · 翠华春深花满涧", "辋川夏风 · 摩诘旧居山水清", "终南秋云 · 行到水穷坐看时", "南五台雪 · 重阳宫外鹤归来"],
        34: ["阳明洞春 · 龙场草青读《易》声", "何陋夏荫 · 君子亭凉竹风冷", "龙冈秋静 · 良知一悟天地清", "黔中冬寒 · 阳明洞中独立思"]
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
       干支纪年
       ============================================================ */
    function getGanzhi() {
        const STEMS = ["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"];
        const BRANCHES = ["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"];
        const y = new Date().getFullYear();
        // 2026 = 丙午
        const offset = (y - 4) % 60;
        return STEMS[offset % 10] + BRANCHES[offset % 12];
    }

    /* ============================================================
       海水江崖纹(沿东海岸 + 南海 + 北部海域的波纹)
       不是描完整海岸线,只在主要海湾外撒一些波纹笔意
       ============================================================ */
    function buildSeaWaves() {
        const zones = [
            // 渤海
            { center: [120.0, 39.0], r: 60, count: 6 },
            // 黄海
            { center: [123.5, 35.0], r: 80, count: 8 },
            // 东海
            { center: [126.0, 29.0], r: 110, count: 10 },
            // 南海
            { center: [115.0, 17.0], r: 100, count: 10 },
            // 北部湾
            { center: [108.0, 19.5], r: 40, count: 5 }
        ];
        let html = "";
        zones.forEach(z => {
            const c = project(z.center[0], z.center[1]);
            for (let i = 0; i < z.count; i++) {
                const ang = (Math.PI * 2 / z.count) * i;
                const rr = z.r * (0.5 + (i % 3) * 0.18);
                const cx = c.x + Math.cos(ang) * rr;
                const cy = c.y + Math.sin(ang) * rr;
                html += `<path d="M ${(cx - 12).toFixed(1)} ${cy.toFixed(1)} q 6 -5 12 0 q 6 5 12 0" fill="none" stroke="#6b8aa8" stroke-width="0.7" opacity="0.45"/>`;
            }
        });
        return html;
    }

    /* ============================================================
       山系分卷:按 region / id 段归属
       ============================================================ */
    const FILTERS = [
        { key: "all",      label: "全部",       desc: "九州山志,一卷尽收" },
        { key: "taihang",  label: "太行 · 实地", desc: "燕赵九径,皆可亲行" },
        { key: "wuyue",    label: "五岳 · 远望", desc: "封禅之地,凭书远眺" },
        { key: "hidden",   label: "隐山 · 访",   desc: "黄雁武峨终,五方气性" },
        { key: "textbook", label: "诗山 · 课本", desc: "课本所选,皆可亲行" },
        { key: "red",      label: "红色山志",   desc: "近百年立,长征所至" },
        { key: "xingren",  label: "行人志",     desc: "以人观山,知行合一" }
    ];

    function categoryOf(route) {
        if (route.region === "wuyue") return "wuyue";
        if (route.region === "hidden") {
            if (route.id >= 34) return "xingren";
            if (route.id >= 28 && route.id <= 33) return "red";
            if (route.id >= 20 && route.id <= 27) return "textbook";
            if (route.id >= 15 && route.id <= 19) return "hidden";
            return "hidden";
        }
        return "taihang";
    }

    let currentFilter = "all";

    /* ============================================================
       简化的力学避让
       ============================================================ */
    function avoidOverlap(nodes, minDist) {
        const iters = 120;
        for (let k = 0; k < iters; k++) {
            let moved = false;
            for (let i = 0; i < nodes.length; i++) {
                for (let j = i + 1; j < nodes.length; j++) {
                    const a = nodes[i], b = nodes[j];
                    const dx = b.sx - a.sx, dy = b.sy - a.sy;
                    const d = Math.sqrt(dx * dx + dy * dy) || 0.01;
                    if (d < minDist) {
                        const push = (minDist - d) / 2 * 0.7;
                        const ux = dx / d, uy = dy / d;
                        a.sx -= ux * push; a.sy -= uy * push;
                        b.sx += ux * push; b.sy += uy * push;
                        moved = true;
                    }
                }
            }
            if (!moved) break;
        }
        nodes.forEach(n => {
            n.sx = n.sx * 0.94 + n.ox * 0.06;
            n.sy = n.sy * 0.94 + n.oy * 0.06;
        });
    }

    /* ============================================================
       渲染主函数
       ============================================================ */
    function renderAtlas() {
        const host = document.getElementById("atlasStage");
        if (!host) return;

        const list = (typeof routes !== "undefined" && Array.isArray(routes)) ? routes : [];
        const totalCounts = list.reduce((acc, r) => {
            if (!r.coords || typeof r.coords.lon !== "number") return acc;
            acc.all++;
            const c = categoryOf(r);
            acc[c] = (acc[c] || 0) + 1;
            return acc;
        }, { all: 0 });

        const filteredList = currentFilter === "all"
            ? list
            : list.filter(r => categoryOf(r) === currentFilter);

        const peaks = filteredList
            .filter(r => r.coords && typeof r.coords.lon === "number" && typeof r.coords.lat === "number")
            .map(r => {
                const p = project(r.coords.lon, r.coords.lat);
                return { route: r, ox: p.x, oy: p.y, sx: p.x, sy: p.y };
            });
        avoidOverlap(peaks, 50);

        const seasonIdx = getSeasonIdx();
        const seasonLabel = SEASON_LABEL[seasonIdx];
        const ganzhi = getGanzhi();

        const allLines = [...MOUNTAIN_RANGES, YANGTZE, YELLOW_RIVER];
        const rangePaths = allLines.map(m => {
            const stroke = m.color || "#5a7048";
            const dash = m.color ? "" : `stroke-dasharray="3 4"`;
            return `<path d="${m.d}" fill="none" stroke="${stroke}" stroke-width="${m.w}" stroke-linecap="round" opacity="${m.op}" ${dash}/>`;
        }).join("");

        const islandHtml = ISLAND_POLYGONS.map(isl => {
            const d = outlinePath(isl.points);
            return `<path d="${d}" fill="url(#atlasLand)" stroke="#6b4a2a" stroke-width="1.2" opacity="0.92"/>`;
        }).join("");

        const provinceHtml = NINE_PROVINCES.map(p => {
            const { x, y } = project(p.lon, p.lat);
            return `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" text-anchor="middle" font-size="16" font-family="LXGW WenKai Screen, serif" fill="#8a4818" opacity="0.55" letter-spacing="2">${p.name}</text>`;
        }).join("");

        const seaHtml = SEA_LABELS.map(s => {
            const { x, y } = project(s.lon, s.lat);
            const chars = s.name.split("");
            const lines = chars.map((ch, i) => `<tspan x="${x.toFixed(1)}" dy="${i === 0 ? 0 : s.size + 2}">${ch}</tspan>`).join("");
            return `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" text-anchor="middle" font-size="${s.size}" font-family="LXGW WenKai Screen, serif" fill="#3d6e8a" opacity="0.55" letter-spacing="0.1em">${lines}</text>`;
        }).join("");

        const seaWaves = buildSeaWaves();

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

        const filterButtons = FILTERS.map(f => {
            const cnt = f.key === "all" ? totalCounts.all : (totalCounts[f.key] || 0);
            const active = currentFilter === f.key ? " is-active" : "";
            const dimmed = cnt === 0 && f.key !== "all" ? " is-empty" : "";
            return `<button type="button" class="atlas-filter-btn${active}${dimmed}" data-filter="${f.key}" title="${f.desc}">
                <span class="afb-label">${f.label}</span>
                <span class="afb-count">${cnt}</span>
            </button>`;
        }).join("");
        const currentFilterDef = FILTERS.find(f => f.key === currentFilter) || FILTERS[0];

        host.innerHTML = `
            <div class="atlas-wrap">
                <div class="atlas-frame">
                    <div class="atlas-filterbar" role="tablist" aria-label="山系分卷">
                        ${filterButtons}
                    </div>
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

                        <!-- 海水波纹(在陆地下面) -->
                        <g class="atlas-waves">${seaWaves}</g>

                        <!-- 海域名(淡墨) -->
                        <g class="atlas-seas">${seaHtml}</g>

                        <!-- 中国陆地 -->
                        <path d="${CHINA_PATH}" fill="url(#atlasLand)" stroke="#6b4a2a" stroke-width="1.6" stroke-linejoin="round" opacity="0.95" filter="url(#atlasShadow)"/>
                        ${islandHtml}

                        <!-- 山系与河流 -->
                        <g class="atlas-ranges">${rangePaths}</g>

                        <!-- 九州古名(在山头下面) -->
                        <g class="atlas-provinces">${provinceHtml}</g>

                        <!-- 云气东行(极淡云带,自西向东缓缓平移) -->
                        <g class="atlas-clouds" aria-hidden="true">
                            <path class="atlas-cloud cloud-a" d="M -300 180 q 60 -22 130 0 q 70 -28 150 -4 q 80 -22 160 0 q 70 -18 140 4 q 80 -16 160 6 q 70 -14 140 8 q 70 -10 130 4 L 1140 220 L -300 220 Z" fill="#fff5e0" opacity="0.32"/>
                            <path class="atlas-cloud cloud-b" d="M -400 320 q 80 -16 160 4 q 70 -20 150 -2 q 80 -14 150 6 q 70 -12 140 4 q 80 -10 150 6 L 1100 350 L -400 350 Z" fill="#fff5e0" opacity="0.24"/>
                        </g>

                        <!-- 罗盘 -->
                        <g class="atlas-compass" transform="translate(1100 110)">
                            <circle r="36" fill="rgba(255,250,235,0.78)" stroke="#6b4a2a" stroke-width="1.2"/>
                            <circle r="28" fill="none" stroke="#6b4a2a" stroke-width="0.6" stroke-dasharray="1 3"/>
                            <path d="M 0 -28 L 6 0 L 0 28 L -6 0 Z" fill="#8a2818"/>
                            <text y="-40" text-anchor="middle" font-size="14" fill="#6b3a1a" font-family="LXGW WenKai Screen, serif">北</text>
                            <text y="50" text-anchor="middle" font-size="14" fill="#6b4a2a" font-family="LXGW WenKai Screen, serif">南</text>
                            <text x="-42" y="5" text-anchor="middle" font-size="12" fill="#6b4a2a" font-family="LXGW WenKai Screen, serif">西</text>
                            <text x="42" y="5" text-anchor="middle" font-size="12" fill="#6b4a2a" font-family="LXGW WenKai Screen, serif">东</text>
                        </g>

                        <!-- 大印「山川」 -->
                        <g class="atlas-seal-big" transform="translate(110 110)">
                            <rect x="-44" y="-32" width="88" height="64" fill="#8a2818" rx="3"/>
                            <text y="-4" text-anchor="middle" font-size="22" fill="#fff5e0" letter-spacing="6" font-family="LXGW WenKai Screen, serif">山川</text>
                            <text y="22" text-anchor="middle" font-size="22" fill="#fff5e0" letter-spacing="6" font-family="LXGW WenKai Screen, serif">舆图</text>
                        </g>

                        <!-- 题跋(右下角) -->
                        <g class="atlas-colophon" transform="translate(${VB_W - 70} ${VB_H - 240})">
                            <text font-family="LXGW WenKai Screen, serif" font-size="13" fill="#5a3a1a" opacity="0.85">
                                <tspan x="0" dy="0">行</tspan>
                                <tspan x="0" dy="16">山</tspan>
                                <tspan x="0" dy="16">志</tspan>
                                <tspan x="0" dy="16">舆</tspan>
                                <tspan x="0" dy="16">图</tspan>
                            </text>
                            <text x="-20" font-family="LXGW WenKai Screen, serif" font-size="11" fill="#6b4a2a" opacity="0.75">
                                <tspan x="-20" dy="0">摹</tspan>
                                <tspan x="-20" dy="14">于</tspan>
                                <tspan x="-20" dy="14">${ganzhi[0]}</tspan>
                                <tspan x="-20" dy="14">${ganzhi[1]}</tspan>
                                <tspan x="-20" dy="14">小</tspan>
                                <tspan x="-20" dy="14">满</tspan>
                            </text>
                            <text x="-40" font-family="LXGW WenKai Screen, serif" font-size="10" fill="#6b4a2a" opacity="0.7">
                                <tspan x="-40" dy="0">青</tspan>
                                <tspan x="-40" dy="13">山</tspan>
                                <tspan x="-40" dy="13">为</tspan>
                                <tspan x="-40" dy="13">实</tspan>
                                <tspan x="-40" dy="13">地</tspan>
                                <tspan x="-40" dy="13">朱</tspan>
                                <tspan x="-40" dy="13">印</tspan>
                                <tspan x="-40" dy="13">为</tspan>
                                <tspan x="-40" dy="13">远</tspan>
                                <tspan x="-40" dy="13">望</tspan>
                            </text>
                            <!-- 小印 -->
                            <g class="atlas-seal-small" transform="translate(-15 175)">
                                <rect x="-15" y="-15" width="30" height="30" fill="#8a2818" rx="2"/>
                                <text y="-2" text-anchor="middle" font-size="11" fill="#fff5e0" font-family="LXGW WenKai Screen, serif">${ganzhi[0]}</text>
                                <text y="11" text-anchor="middle" font-size="11" fill="#fff5e0" font-family="LXGW WenKai Screen, serif">${ganzhi[1]}</text>
                            </g>
                        </g>

                        <!-- 山头 -->
                        <g class="atlas-peaks">${peakNodes}</g>
                    </svg>
                </div>
                <aside class="atlas-aside" id="atlasAside">
                    <div class="aside-default" id="asideDefault">
                        <div class="aside-stamp">山<br>川<br>舆<br>图</div>
                        <div class="aside-title">${currentFilterDef.label}</div>
                        <div class="aside-hint">${currentFilterDef.desc}</div>
                        <div class="aside-counts">
                            <span><i class="dot dot-local"></i>实地 ${counts.local}</span>
                            <span><i class="dot dot-remote"></i>远望 ${counts.remote}</span>
                            <span><i class="dot dot-visited"></i>已徒 ${counts.visited}</span>
                        </div>
                        <div class="aside-foot">指点山头,观此地${seasonLabel}时风景</div>
                    </div>
                    <div class="aside-detail" id="asideDetail" hidden></div>
                </aside>
            </div>
        `;

        const aside = document.getElementById("asideDetail");
        const asideDefault = document.getElementById("asideDefault");

        host.querySelectorAll(".atlas-filter-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const key = btn.getAttribute("data-filter");
                if (key === currentFilter) return;
                currentFilter = key;
                renderAtlas();
            });
        });

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
            g.addEventListener("mouseenter", showDetail);
            g.addEventListener("focus", showDetail);
        });

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
