/* ============================================================
   行山志 · 数据层 (store.js)
   - 集中管理 localStorage / IndexedDB
   - 成就/雅号/护照/计划器/约伴/日记/节气
   ============================================================ */

const STORE = (() => {
    const KEYS = {
        visited: "th_visited",
        visitedLog: "th_visited_log",
        gear: id => `th_gear_${id}`,
        diary: id => `th_diary_${id}`,
        theme: "th_theme",
        plan: "th_plan",
        meetups: "th_meetups",
        achievements: "th_achievements",
        countdownTarget: "th_countdown",
        yearStamps: "th_year_stamps"
    };

    function getJSON(k, def) {
        try { return JSON.parse(localStorage.getItem(k)) ?? def; }
        catch { return def; }
    }
    function setJSON(k, v) { localStorage.setItem(k, JSON.stringify(v)); }

    return {
        KEYS,

        /* 已徒步集合(Set 形态) */
        getVisited: () => new Set(getJSON(KEYS.visited, [])),
        setVisited: set => setJSON(KEYS.visited, [...set]),

        /* 徒步日志(带日期、天气、心情、配诗) */
        getVisitedLog: () => getJSON(KEYS.visitedLog, {}),
        addVisitLog: (routeId, entry) => {
            const log = getJSON(KEYS.visitedLog, {});
            log[routeId] = log[routeId] || [];
            log[routeId].unshift({ id: Date.now(), ...entry });
            setJSON(KEYS.visitedLog, log);
        },
        removeVisitLog: (routeId, entryId) => {
            const log = getJSON(KEYS.visitedLog, {});
            if (!log[routeId]) return;
            log[routeId] = log[routeId].filter(e => e.id !== entryId);
            if (log[routeId].length === 0) delete log[routeId];
            setJSON(KEYS.visitedLog, log);
        },

        /* 装备 checklist */
        getGear: id => new Set(getJSON(KEYS.gear(id), [])),
        setGear: (id, set) => setJSON(KEYS.gear(id), [...set]),

        /* 日记(每条路线最多 10 条) */
        getDiary: id => getJSON(KEYS.diary(id), []),
        addDiary: (id, entry) => {
            const arr = getJSON(KEYS.diary(id), []);
            arr.unshift({ id: Date.now(), ...entry });
            setJSON(KEYS.diary(id), arr.slice(0, 10));
        },
        removeDiary: (id, entryId) => {
            const arr = getJSON(KEYS.diary(id), []).filter(e => e.id !== entryId);
            setJSON(KEYS.diary(id), arr);
        },

        /* 出发计划 */
        getPlan: () => getJSON(KEYS.plan, null),
        setPlan: p => setJSON(KEYS.plan, p),
        clearPlan: () => localStorage.removeItem(KEYS.plan),

        /* 约伴 */
        getMeetups: routeId => getJSON(KEYS.meetups, {})[routeId] || [],
        addMeetup: (routeId, m) => {
            const all = getJSON(KEYS.meetups, {});
            all[routeId] = all[routeId] || [];
            all[routeId].unshift({ id: Date.now(), ...m });
            all[routeId] = all[routeId].slice(0, 20);
            setJSON(KEYS.meetups, all);
        },
        removeMeetup: (routeId, mid) => {
            const all = getJSON(KEYS.meetups, {});
            if (!all[routeId]) return;
            all[routeId] = all[routeId].filter(m => m.id !== mid);
            setJSON(KEYS.meetups, all);
        },

        /* 岁印 · 二十四节气长卷
           结构: { "丙午": { "立春": { date: "2026-02-04", first: true }, ... }, "丁未": {...} }
           key 为干支纪年,值为 24 节气名→盖印记录;访问当节气期间任意一日即可盖印 */
        getYearStamps: () => getJSON(KEYS.yearStamps, {}),
        stampTerm: (ganzhi, termName) => {
            const all = getJSON(KEYS.yearStamps, {});
            all[ganzhi] = all[ganzhi] || {};
            if (all[ganzhi][termName]) return false;
            all[ganzhi][termName] = { date: new Date().toISOString().slice(0, 10), ts: Date.now() };
            setJSON(KEYS.yearStamps, all);
            return true;
        },
        getYearStampCount: ganzhi => {
            const all = getJSON(KEYS.yearStamps, {});
            return Object.keys(all[ganzhi] || {}).length;
        }
    };
})();

/* ============================================================
   成就 / 雅号 / 徐霞客印
   ============================================================ */
const ACHIEVEMENTS = [
    { id: "step_1",  count: 1, name: "初入山门", desc: "踏出第一步" },
    { id: "step_3",  count: 3, name: "樵夫",     desc: "已识三山" },
    { id: "step_5",  count: 5, name: "山客",     desc: "云中过往" },
    { id: "step_7",  count: 7, name: "云游",     desc: "万水千山" },
    { id: "step_9",  count: 9, name: "徐霞客·太行卷", desc: "九山尽阅" }
];

function getCurrentAchievement(visitedCount) {
    let cur = null;
    for (const a of ACHIEVEMENTS) {
        if (visitedCount >= a.count) cur = a;
    }
    return cur;
}

function nextAchievement(visitedCount) {
    return ACHIEVEMENTS.find(a => visitedCount < a.count);
}

/* ============================================================
   二十四节气表
   ============================================================ */
const SOLAR_TERMS = [
    { name: "立春", date: [2, 4],  poem: "东风解冻,蛰虫始振",       advice: "宜踏青寻芽,推:抱犊寨" },
    { name: "雨水", date: [2, 19], poem: "好雨知时节,当春乃发生",  advice: "宜赏苏轼湖光,推:西柏坡" },
    { name: "惊蛰", date: [3, 6],  poem: "微雨众卉新,一雷惊蛰始",  advice: "宜山涧听溪,推:藤龙山" },
    { name: "春分", date: [3, 21], poem: "燕飞犹个个,花落已纷纷",  advice: "宜踏花归去,推:抱犊寨" },
    { name: "清明", date: [4, 5],  poem: "清明时节雨纷纷",          advice: "宜怀古登高,推:苍岩山" },
    { name: "谷雨", date: [4, 20], poem: "雨生百谷,万物含新意",    advice: "宜寻幽探瀑,推:藤龙山" },
    { name: "立夏", date: [5, 6],  poem: "绿树阴浓夏日长",          advice: "宜山中纳凉,推:嶂石岩" },
    { name: "小满", date: [5, 21], poem: "夜莺啼绿柳,皓月醒长空",  advice: "宜半日轻徒步,推:抱犊寨" },
    { name: "芒种", date: [6, 6],  poem: "时雨及芒种,四野皆插秧",  advice: "宜赏麦黄山青,推:五岳寨" },
    { name: "夏至", date: [6, 21], poem: "昼晷已云极,宵漏自此长",  advice: "宜避暑望瀑,推:驼梁山" },
    { name: "小暑", date: [7, 7],  poem: "倏忽温风至,因循小暑来",  advice: "宜林荫缓行,推:五岳寨" },
    { name: "大暑", date: [7, 23], poem: "桂轮开子夜,萤火照空时",  advice: "宜高山避暑,推:驼梁山" },
    { name: "立秋", date: [8, 8],  poem: "兹晨戒流火,商飙早已惊",  advice: "宜秋色将至,推:天桂山" },
    { name: "处暑", date: [8, 23], poem: "处暑无三日,新凉直万金",  advice: "宜山行清心,推:佛光山" },
    { name: "白露", date: [9, 8],  poem: "蒹葭苍苍,白露为霜",      advice: "宜湖畔赏雾,推:西柏坡" },
    { name: "秋分", date: [9, 23], poem: "暗虫唧唧夜绵绵",          advice: "宜赏初秋红叶,推:天桂山" },
    { name: "寒露", date: [10, 8], poem: "袅袅凉风动,凄凄寒露零",  advice: "宜深秋远足,推:嶂石岩" },
    { name: "霜降", date: [10, 23],poem: "霜叶红于二月花",          advice: "宜赏满山红枫,推:天桂山" },
    { name: "立冬", date: [11, 7], poem: "冻笔新诗懒写,寒炉美酒时温", advice: "宜雪前最后远行,推:佛光山" },
    { name: "小雪", date: [11, 22],poem: "夜深知雪重,时闻折竹声",  advice: "宜赏初雪山色,推:抱犊寨" },
    { name: "大雪", date: [12, 7], poem: "千山鸟飞绝,万径人踪灭",  advice: "宜赏冰瀑,推:沕沕水(联游天桂山)" },
    { name: "冬至", date: [12, 22],poem: "天时人事日相催,冬至阳生春又来", advice: "宜短途登高祈福,推:抱犊寨" },
    { name: "小寒", date: [1, 6],  poem: "小寒已近春,腊月忽过半",  advice: "宜围炉夜话,小休山行" },
    { name: "大寒", date: [1, 20], poem: "旧雪未及消,新雪又拥户",  advice: "宜赏雪听松,推:苍岩山" }
];

function getCurrentSolarTerm() {
    const now = new Date();
    const today = _dayOfYear(now);
    let best = null, bestDay = -1;
    for (const t of SOLAR_TERMS) {
        const td = _dayOfYear(new Date(now.getFullYear(), t.date[0] - 1, t.date[1]));
        if (td <= today && td > bestDay) { best = t; bestDay = td; }
    }
    // 1 月初(在小寒 1/6 之前):仍处于上一年冬至期间
    return best || SOLAR_TERMS.find(t => t.name === "冬至") || SOLAR_TERMS[0];
}

function getNextSolarTerm() {
    const now = new Date();
    const today = _dayOfYear(now);
    let best = null, bestDay = Infinity;
    for (const t of SOLAR_TERMS) {
        const td = _dayOfYear(new Date(now.getFullYear(), t.date[0] - 1, t.date[1]));
        if (td > today && td < bestDay) { best = t; bestDay = td; }
    }
    if (best) return best;
    // 当年已无更晚节气(12 月末到年末):下一节气是明年的"小寒"
    return SOLAR_TERMS.find(t => t.name === "小寒") || SOLAR_TERMS[0];
}

function _dayOfYear(d) {
    const start = new Date(d.getFullYear(), 0, 0);
    return Math.floor((d - start) / 86400000);
}

/* ============================================================
   山中冷知识(每次打开随机一条)
   ============================================================ */
const TRIVIA = [
    "苍岩山桥楼殿是中国唯一的下承式悬空寺,以两端崖壁为柱、中央天然石桥为梁,无一根钉子。",
    "嶂石岩回音壁声波回响达 6-7 次,缘于半圆形崖面与岩石密度,被称为'世界声学奇观'。",
    "驼梁山名字由来:山形如卧驼,北宋《太行山志》已有记载,清代《井陉县志》详写其形。",
    "抱犊寨原名'萆山',西汉名将韩信曾用'明修栈道,暗度陈仓'的兵法在此演练。",
    "天桂山相传明末崇祯帝曾欲在此建行宫,'青龙观'三字至今保留明代风骨。",
    "五岳寨因山中五峰象征五岳:东岳/西岳/南岳/北岳/中岳俱备,故有'袖珍五岳'之称。",
    "西柏坡是新中国'最后一个农村指挥所',1948-1949 年五大书记在此运筹帷幄。",
    "藤龙山的飞拉达全长 3 公里,是亚洲最长的攀岩铁道路线,从意大利引进技术。",
    "佛光山的秦皇古道,石板上车辙印深达 20 厘米,是 2200 年前秦驰道的活化石。",
    "太行山八陉之一'井陉'即在石家庄西部,自古为兵家必争之地,'背水之战'就发生在此。",
    "石家庄'省会'地位与铁路相关:1907 年京汉铁路与正太铁路在此交汇,小村庄因此兴起。",
    "河北话'爬山'读作 pá shān,但当地老人称登山为'上山'或'走山',更显尊重。"
];

function randomTrivia() {
    return TRIVIA[Math.floor(Math.random() * TRIVIA.length)];
}

/* ============================================================
   小工具:日期/天气模拟/打卡点诗
   ============================================================ */
function formatDate(ts) {
    const d = new Date(ts);
    return `${d.getFullYear()}.${(d.getMonth()+1).toString().padStart(2,"0")}.${d.getDate().toString().padStart(2,"0")}`;
}

function todayStr() {
    const d = new Date();
    return `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,"0")}-${d.getDate().toString().padStart(2,"0")}`;
}

function diffDays(target) {
    const ms = new Date(target).getTime() - Date.now();
    return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

/* 模拟未来 7 天天气(无真实 API,用确定性伪随机) */
function mockWeekWeather() {
    const today = new Date();
    const seed = today.getFullYear() * 1000 + today.getMonth() * 50 + today.getDate();
    const rand = mulberrySeed(seed);
    const conditions = [
        { i: "☀️", n: "晴",   good: 5 },
        { i: "🌤", n: "多云", good: 4 },
        { i: "⛅",  n: "阴",   good: 3 },
        { i: "🌧",  n: "小雨", good: 2 },
        { i: "⛈",  n: "雷阵雨", good: 1 }
    ];
    const result = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date(today.getTime() + i * 86400000);
        const c = conditions[Math.floor(rand() * conditions.length)];
        const t = Math.floor(15 + rand() * 18);
        result.push({
            date: d,
            label: i === 0 ? "今" : i === 1 ? "明" : "周" + "日一二三四五六"[d.getDay()],
            ymd: `${d.getFullYear()}.${d.getMonth()+1}.${d.getDate()}`,
            icon: c.i, name: c.n, good: c.good,
            temp: `${t-5}~${t+3}°C`
        });
    }
    return result;
}

function mulberrySeed(a) {
    return function () {
        a |= 0; a = a + 0x6D2B79F5 | 0;
        let t = a;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
}

/* 打卡点小诗(根据 scene emoji 推荐) */
const WP_VERSES = {
    "🏯": "古寺无人到,松花满地金",
    "⛩️": "山光悦鸟性,潭影空人心",
    "🛕": "曲径通幽处,禅房花木深",
    "🏔️": "会当凌绝顶,一览众山小",
    "🏞️": "山中相送罢,日暮掩柴扉",
    "🌅": "落霞与孤鹜齐飞",
    "🌲": "返景入深林,复照青苔上",
    "🦋": "穿花蛱蝶深深见",
    "💦": "飞流直下三千尺",
    "💧": "明月松间照,清泉石上流",
    "🌊": "山色空蒙雨亦奇",
    "🌾": "稻花香里说丰年",
    "🍁": "霜叶红于二月花",
    "🌿": "苔痕上阶绿,草色入帘青",
    "🪨": "横看成岭侧成峰",
    "🥾": "莫笑前路无知己",
    "🚪": "山门初启,云从此生",
    "🅿️": "晨车初停,正待山门",
    "🚡": "云在青天水在瓶",
    "⛺": "野旷天低树,江清月近人",
    "🎒": "明朝有意抱琴来",
    "🏛️": "前不见古人,后不见来者",
    "🚶": "行到水穷处,坐看云起时",
    "🕳️": "壶中别有日月长",
    "🍜": "山中无历日,寒尽不知年",
    "🍴": "把酒话桑麻",
    "🪜": "举头红日近,回首白云低",
    "🌉": "小桥流水人家",
    "🪟": "高处不胜寒",
    "🧗": "无限风光在险峰",
    "🏘️": "千年古镇,人间烟火",
    "🛤️": "古道西风瘦马",
    "⛰️": "山高人为峰",
    "🏡": "采菊东篱下,悠然见南山",
    "🚐": "明日隔山岳,世事两茫茫"
};

function verseFor(scene) {
    return WP_VERSES[scene] || "山行未已,前路方长";
}
