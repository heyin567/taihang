/* ============================================================
   行山志 · 文化层 (culture.js)
   - 七十二候 / 花信风 / 传统节日 / 燕赵成语 / 山中三礼 / 农历近似
   - 完全离线、纯静态数据
   ============================================================ */

/* ============================================================
   七十二候(每节气三候,顺序与 SOLAR_TERMS 一一对应)
   ============================================================ */
const PENTADS_BY_TERM = {
    "立春": [
        { name: "东风解冻", taihang: "山阴未消,槐树枝条转柔", route: "抱犊寨", food: "咬春饼" },
        { name: "蛰虫始振", taihang: "山虫初醒,潜行林下", route: "西柏坡", food: "春韭炒蛋" },
        { name: "鱼陟负冰", taihang: "山溪解冻,薄冰碎裂", route: "藤龙山", food: "山泉煮蛋" }
    ],
    "雨水": [
        { name: "獭祭鱼", taihang: "岗南水库浅处见水獭", route: "西柏坡", food: "水库鱼宴" },
        { name: "鸿雁来", taihang: "南雁北归,过平原而上太行", route: "抱犊寨", food: "野菜春卷" },
        { name: "草木萌动", taihang: "山桃枝端见红点", route: "藤龙山", food: "春芽煎蛋" }
    ],
    "惊蛰": [
        { name: "桃始华", taihang: "苍岩山桃花初绽", route: "苍岩山", food: "桃花酥" },
        { name: "仓庚鸣", taihang: "山林黄鹂啼鸣", route: "五岳寨", food: "山菇炖鸡" },
        { name: "鹰化为鸠", taihang: "山鹰隐去,布谷将临", route: "嶂石岩", food: "野菜饼" }
    ],
    "春分": [
        { name: "玄鸟至", taihang: "燕子飞回石家庄,绕梁筑巢", route: "抱犊寨", food: "鹿泉肉饼" },
        { name: "雷乃发声", taihang: "山顶可闻初雷", route: "嶂石岩", food: "核桃酥饼" },
        { name: "始电", taihang: "夜可见远天闪电", route: "驼梁山", food: "压饸饹" }
    ],
    "清明": [
        { name: "桐始华", taihang: "山间梧桐开淡紫花", route: "苍岩山", food: "青团" },
        { name: "田鼠化为鴽", taihang: "鼠藏鹌出,山林热闹", route: "天桂山", food: "明前茶配缸炉烧饼" },
        { name: "虹始见", taihang: "雨后山中初见彩虹", route: "藤龙山", food: "枣花蜜汤" }
    ],
    "谷雨": [
        { name: "萍始生", taihang: "湖面浮萍初出", route: "西柏坡", food: "湖鲜全宴" },
        { name: "鸣鸠拂其羽", taihang: "斑鸠雨中梳羽", route: "五岳寨", food: "山菌烩面" },
        { name: "戴胜降于桑", taihang: "戴胜鸟栖桑林", route: "苍岩山", food: "抿须面" }
    ],
    "立夏": [
        { name: "蝼蝈鸣", taihang: "山间蛙声蝼蝈齐鸣", route: "藤龙山", food: "凉拌野菜" },
        { name: "蚯蚓出", taihang: "雨后山径见蚯蚓", route: "天桂山", food: "山泉小米粥" },
        { name: "王瓜生", taihang: "山下王瓜藤蔓初长", route: "西柏坡", food: "黄瓜冷面" }
    ],
    "小满": [
        { name: "苦菜秀", taihang: "山中苦菜成株,可采", route: "五岳寨", food: "苦菜凉拌" },
        { name: "靡草死", taihang: "细弱草本始枯", route: "佛光山", food: "豆腐宴" },
        { name: "麦秋至", taihang: "山下平原麦熟将收", route: "抱犊寨", food: "新麦烙饼" }
    ],
    "芒种": [
        { name: "螳螂生", taihang: "山林小螳螂初出卵", route: "嶂石岩", food: "野菜核桃饼" },
        { name: "鵙始鸣", taihang: "伯劳鸟开始啼叫", route: "驼梁山", food: "黑猪炖鸡" },
        { name: "反舌无声", taihang: "百舌鸟收声入夏", route: "五岳寨", food: "凉粉拌山韭" }
    ],
    "夏至": [
        { name: "鹿角解", taihang: "山鹿角脱旧换新", route: "驼梁山", food: "高山凉面" },
        { name: "蜩始鸣", taihang: "蝉鸣初起山林", route: "苍岩山", food: "井陉抿须凉面" },
        { name: "半夏生", taihang: "半夏草药出土", route: "嶂石岩", food: "中药煲汤" }
    ],
    "小暑": [
        { name: "温风至", taihang: "山下热风袭来", route: "驼梁山", food: "避暑凉粉" },
        { name: "蟋蟀居壁", taihang: "蟋蟀夜入墙角", route: "抱犊寨", food: "石锅鸡" },
        { name: "鹰始鸷", taihang: "山鹰高翔捕食", route: "佛光山", food: "石磨豆腐" }
    ],
    "大暑": [
        { name: "腐草为萤", taihang: "山间草丛见萤", route: "五岳寨", food: "山泉啤酒" },
        { name: "土润溽暑", taihang: "山土湿润蒸腾", route: "驼梁山", food: "凉拌豆角" },
        { name: "大雨时行", taihang: "山雨突至又骤停", route: "藤龙山", food: "瀑布旁吃刨冰" }
    ],
    "立秋": [
        { name: "凉风至", taihang: "夜风渐凉,山顶尤甚", route: "天桂山", food: "山楂糕" },
        { name: "白露降", taihang: "晨起见白露", route: "五岳寨", food: "腌肉炖菌" },
        { name: "寒蝉鸣", taihang: "蝉声转低", route: "苍岩山", food: "缸炉烧饼夹熟肉" }
    ],
    "处暑": [
        { name: "鹰乃祭鸟", taihang: "山鹰捕鸟陈列", route: "佛光山", food: "豆腐宴" },
        { name: "天地始肃", taihang: "天气转肃,云高山远", route: "驼梁山", food: "新核桃" },
        { name: "禾乃登", taihang: "山下五谷将成熟", route: "西柏坡", food: "小米饭" }
    ],
    "白露": [
        { name: "鸿雁来", taihang: "南雁列阵南飞", route: "抱犊寨", food: "新榨核桃油" },
        { name: "玄鸟归", taihang: "燕子开始南返", route: "西柏坡", food: "湖边鲜虾" },
        { name: "群鸟养羞", taihang: "百鸟储粮过冬", route: "五岳寨", food: "山菌炖鸡" }
    ],
    "秋分": [
        { name: "雷始收声", taihang: "夏雷渐止", route: "嶂石岩", food: "核桃宴" },
        { name: "蛰虫坯户", taihang: "山虫闭穴预备过冬", route: "天桂山", food: "板栗烧鸡" },
        { name: "水始涸", taihang: "山溪水量见减", route: "藤龙山", food: "枣木熏鸡" }
    ],
    "寒露": [
        { name: "鸿雁来宾", taihang: "雁群继续南下", route: "苍岩山", food: "山韭饺子" },
        { name: "雀入大水为蛤", taihang: "古意秋意深", route: "佛光山", food: "山泉热汤" },
        { name: "菊有黄华", taihang: "山菊初黄", route: "天桂山", food: "菊花酒" }
    ],
    "霜降": [
        { name: "豺乃祭兽", taihang: "豺狼储食过冬", route: "驼梁山", food: "高山羊汤" },
        { name: "草木黄落", taihang: "万山黄红遍野", route: "天桂山", food: "板栗烧鸡(秋限定)" },
        { name: "蛰虫咸俯", taihang: "百虫俯藏不出", route: "嶂石岩", food: "土窑烧饼" }
    ],
    "立冬": [
        { name: "水始冰", taihang: "山溪初结薄冰", route: "天桂山", food: "热乎油茶" },
        { name: "地始冻", taihang: "山地冻硬,登山小心", route: "抱犊寨", food: "石锅热菜" },
        { name: "雉入大水为蜃", taihang: "山雉隐迹", route: "佛光山", food: "石磨豆腐火锅" }
    ],
    "小雪": [
        { name: "虹藏不见", taihang: "晚秋雨少,虹难再现", route: "苍岩山", food: "羊汤抿须面" },
        { name: "天气上升", taihang: "山顶寒风始烈", route: "驼梁山", food: "驼梁羊肉锅" },
        { name: "闭塞而成冬", taihang: "山门寂静,游人渐少", route: "抱犊寨", food: "肉饼配热油茶" }
    ],
    "大雪": [
        { name: "鹖鴠不鸣", taihang: "寒禽缄默,山林寂静", route: "沕沕水(联游天桂山)", food: "冰瀑前的羊汤" },
        { name: "虎始交", taihang: "古时山虎交配,今唯传说", route: "抱犊寨", food: "暖手糖炒栗子" },
        { name: "荔挺出", taihang: "马蔺虽冻,根芽暗动", route: "苍岩山", food: "缸炉热饼" }
    ],
    "冬至": [
        { name: "蚯蚓结", taihang: "蚯蚓抱团御寒", route: "抱犊寨", food: "饺子(数九第一天)" },
        { name: "麋角解", taihang: "麋鹿角脱,雌雄换装", route: "西柏坡", food: "汤圆" },
        { name: "水泉动", taihang: "山泉表面冰下暗流", route: "藤龙山", food: "热汤底火锅" }
    ],
    "小寒": [
        { name: "雁北乡", taihang: "雁开始北返预备", route: "苍岩山", food: "热烧饼夹熏肉" },
        { name: "鹊始巢", taihang: "喜鹊衔枝筑巢", route: "抱犊寨", food: "羊肉饺子" },
        { name: "雉始雊", taihang: "山雉开始求偶", route: "天桂山", food: "热米酒" }
    ],
    "大寒": [
        { name: "鸡始乳", taihang: "母鸡开始抱窝", route: "西柏坡", food: "土鸡汤" },
        { name: "征鸟厉疾", taihang: "鹰隼急飞捕食", route: "驼梁山", food: "黑猪炖鸡" },
        { name: "水泽腹坚", taihang: "湖面结冰最厚", route: "西柏坡", food: "湖畔火锅" }
    ]
};

/* 当前候(每节气前 5/中 5/末 5 天) */
function getCurrentPentad() {
    const cur = getCurrentSolarTerm();
    const next = getNextSolarTerm();
    const now = new Date();
    const year = now.getFullYear();

    let curStart = new Date(year, cur.date[0] - 1, cur.date[1]);
    // 如果当前是 1 月初但 cur 是去年冬至,把 curStart 倒推一年
    if (curStart > now) curStart.setFullYear(year - 1);

    let nextStart = new Date(year, next.date[0] - 1, next.date[1]);
    if (nextStart <= curStart) nextStart.setFullYear(curStart.getFullYear() + 1);

    const total = (nextStart - curStart) / 86400000;
    const passed = (now - curStart) / 86400000;
    const idx = Math.max(0, Math.min(2, Math.floor(passed / (total / 3))));
    const pentads = PENTADS_BY_TERM[cur.name] || [];
    return { term: cur, idx, pentad: pentads[idx] || null };
}

/* ============================================================
   花信风 (24 番,小寒-谷雨之间)
   ============================================================ */
const FLOWER_WIND = {
    "小寒": ["梅花", "山茶", "水仙"],
    "大寒": ["瑞香", "兰花", "山矾"],
    "立春": ["迎春", "樱桃", "望春"],
    "雨水": ["菜花", "杏花", "李花"],
    "惊蛰": ["桃花", "棣棠", "蔷薇"],
    "春分": ["海棠", "梨花", "木兰"],
    "清明": ["桐花", "麦花", "柳花"],
    "谷雨": ["牡丹", "酴醾", "楝花"]
};

function getCurrentFlower() {
    const { term, idx } = getCurrentPentad();
    const arr = FLOWER_WIND[term.name];
    if (!arr) return null;
    return { name: arr[idx], term: term.name };
}

/* ============================================================
   传统节日
   ============================================================ */
const FESTIVALS = [
    { name: "春节",   monthDay: "正月初一", route: 3, theme: "新春祈福,登高纳福",       icon: "🧧" },
    { name: "元宵",   monthDay: "正月十五", route: 7, theme: "灯会团圆,湖光月圆",       icon: "🏮" },
    { name: "清明",   monthDay: "公历4月5", route: 1, theme: "怀古登高,寒食踏青",       icon: "🌿" },
    { name: "端午",   monthDay: "五月初五", route: 4, theme: "避瘟登高,悬崖探幽",       icon: "🎏" },
    { name: "七夕",   monthDay: "七月初七", route: 6, theme: "高山看星,双星渡河",       icon: "✨" },
    { name: "中秋",   monthDay: "八月十五", route: 3, theme: "月圆山顶,团圆赏月",       icon: "🌕" },
    { name: "重阳",   monthDay: "九月初九", route: 5, theme: "登高佩萸,赏菊红叶",       icon: "🍂" },
    { name: "冬至",   monthDay: "公历12月22",route: 5, theme: "数九登高,看冰瀑",         icon: "❄️" },
    { name: "除夕",   monthDay: "腊月廿九", route: 3, theme: "辞旧岁,看年终日落",       icon: "🎆" }
];

/* 简化:固定公历日期 + 农历主要节日近似(2026 数据) */
const FESTIVAL_DATES_2026 = {
    "春节": "2026-02-17",
    "元宵": "2026-03-03",
    "清明": "2026-04-05",
    "端午": "2026-06-19",
    "七夕": "2026-08-19",
    "中秋": "2026-09-25",
    "重阳": "2026-10-18",
    "冬至": "2026-12-22",
    "除夕": "2027-02-05"
};

function getUpcomingFestival() {
    const now = new Date();
    for (const f of FESTIVALS) {
        const dt = FESTIVAL_DATES_2026[f.name];
        if (!dt) continue;
        const target = new Date(dt);
        const diff = (target - now) / 86400000;
        if (diff >= -1 && diff <= 14) {
            return { ...f, date: dt, daysLeft: Math.ceil(diff) };
        }
    }
    return null;
}

/* ============================================================
   燕赵成语(古文短典)
   ============================================================ */
const YANZHAO_IDIOMS = [
    { id: "beishuiyizhan", word: "背水一战", origin: "韩信", route: 3, story: "韩信于井陉口背河列阵,以死战激士气,大破赵军。" },
    { id: "weiwiejiuzhao",  word: "围魏救赵", origin: "孙膑", route: 4, story: "齐救赵,不击魏军主力,反袭其国都,使魏自退。" },
    { id: "wanbiguizhao",   word: "完璧归赵", origin: "蔺相如", route: 6, story: "蔺相如奉璧使秦,机智周旋,完璧归赵。" },
    { id: "fujingqingzui",  word: "负荆请罪", origin: "廉颇", route: 6, story: "廉颇负荆登门,向蔺相如谢罪,将相和。" },
    { id: "handanxuebu",    word: "邯郸学步", origin: "庄子寓言", route: 7, story: "燕国少年至邯郸学步态,反忘己步,匍匐而归。" },
    { id: "yinuoqianjin",   word: "一诺千金", origin: "季布(楚汉)", route: 9, story: "季布信诺,得百金不如得季布一诺。" },
    { id: "maosuizijian",   word: "毛遂自荐", origin: "毛遂(赵)", route: 6, story: "平原君求士,毛遂自请同行,使楚立功。" },
    { id: "jingweitiantian", word: "精卫填海", origin: "山海经", route: 9, story: "炎帝幼女溺死东海,化精卫,衔木石填海。坚毅之喻。" },
    { id: "hufuqishe",      word: "胡服骑射", origin: "赵武灵王", route: 2, story: "武灵王变服改习,革新军制,成强国。" }
];

/* ============================================================
   五岳本地典故(非燕赵)· 与各地文化相结合
   ============================================================ */
const LOCAL_IDIOMS_BY_ROUTE = {
    // 10 东岳泰山 · 齐鲁
    10: [
        { word: "登泰山而小天下", origin: "孟子 · 尽心上", story: "孔子登东山而小鲁,登泰山而小天下。喻见识广博,胸襟开阔。" },
        { word: "泰山北斗",     origin: "新唐书 · 韩愈传", story: "学者仰之如泰山北斗。喻德高望重,为众人所瞻。" },
        { word: "重于泰山",     origin: "司马迁 · 报任安书", story: "人固有一死,或重于泰山,或轻于鸿毛。" }
    ],
    // 11 西岳华山 · 关中
    11: [
        { word: "自古华山一条路", origin: "民谚",       story: "华山险绝,登山仅一径可通。喻别无选择,唯有一途。" },
        { word: "华山论剑",      origin: "射雕英雄传 / 关中武林", story: "天下高手齐集华山,以剑较量。今喻顶尖较量。" },
        { word: "斧劈华山",      origin: "宝莲灯传说", story: "沉香救母,持神斧劈开华山。山水之险,皆入民间叙事。" }
    ],
    // 12 南岳衡山 · 湖湘
    12: [
        { word: "寿比南山",       origin: "诗经 · 小雅 · 天保", story: "南山,五岳之衡也。如南山之寿,不骞不崩。喻长寿绵长。" },
        { word: "衡阳雁去",       origin: "范仲淹 · 渔家傲", story: "衡阳雁去无留意。秋雁南飞至衡山回雁峰而止,湖湘秋意之极。" },
        { word: "马背得天下",     origin: "湖湘文化", story: "衡岳之南,船山阳明,经世致用。湖湘士人,马背读书,书剑兼修。" }
    ],
    // 13 北岳恒山 · 晋北
    13: [
        { word: "悬空寺险",       origin: "李白 · 北岳行", story: "壮观二字,李白题于悬空寺。半空木构,千载不坠,塞外奇观。" },
        { word: "雁门关锁",       origin: "杨家将", story: "恒山雁门,杨业守边,以一门忠烈拒辽。北岳之险,亦边塞之要。" },
        { word: "塞北江南",       origin: "晋北民谚", story: "恒山以南,水草丰美,虽在塞外,亦有江南之韵。" }
    ],
    // 14 中岳嵩山 · 中原
    14: [
        { word: "嵩山高",         origin: "诗经 · 大雅 · 嵩高", story: "嵩高维岳,峻极于天。喻人之德如山之峻。" },
        { word: "少林一脉",       origin: "禅宗", story: "达摩西来,面壁九年,中土禅宗自此立。少林武学,亦由此衍生。" },
        { word: "一苇渡江",       origin: "达摩传说", story: "达摩离梁渡江至嵩,折一苇为舟。喻方便法门,亦喻志之所至,水不能阻。" }
    ]
};

function getLocalIdiomsForRoute(routeId) {
    return LOCAL_IDIOMS_BY_ROUTE[routeId] || [];
}

function getIdiomForRoute(routeId) {
    return YANZHAO_IDIOMS.filter(i => i.route === routeId);
}

function randomIdiom() {
    return YANZHAO_IDIOMS[Math.floor(Math.random() * YANZHAO_IDIOMS.length)];
}

/* ============================================================
   河北方言山行词典
   ============================================================ */
const DIALECT_WORDS = [
    { mandarin: "爬山", local: "上岭 / 爬岭", area: "井陉/平山" },
    { mandarin: "凉快", local: "凉爽劲儿",     area: "石家庄" },
    { mandarin: "累了", local: "乏了 / 走不动了", area: "通用" },
    { mandarin: "山顶", local: "山尖儿 / 顶儿", area: "灵寿" },
    { mandarin: "小路", local: "小道儿 / 羊肠道", area: "通用" },
    { mandarin: "迷路", local: "瞎转悠 / 蒙了道", area: "井陉" },
    { mandarin: "天气真好", local: "今儿个天儿真亮堂", area: "平山" },
    { mandarin: "吃饭", local: "歇晌儿 / 揍嘛", area: "赞皇" },
    { mandarin: "你好", local: "吃了没?",       area: "石家庄通用" },
    { mandarin: "再见", local: "走啦哈 / 慢走儿", area: "通用" }
];

/* ============================================================
   山中三礼(出行仪式)
   ============================================================ */
const MOUNTAIN_RITES = {
    bow: {
        title: "辞山礼 · 出发前",
        text: "向山三鞠躬,默念:\n「不带走、不喧哗,敬山者得山。」\n愿此行平安,与山共美。",
        verse: "山有静气,人怀敬意"
    },
    thank: {
        title: "谢山帖 · 标记前",
        text: "执笔(心)题:\n「今日山行,得见 ____,得悟 ____。\n谢山一程,记此微行。」",
        verse: "登山归,人不空"
    },
    farewell: {
        title: "送山礼 · 离去时",
        text: "向虚处合掌:\n「明日有山,今日且休。」\n如离寺院,如别故人。",
        verse: "山在我心,我在山中"
    }
};

/* ============================================================
   农历近似(显示用,非精确,够用)
   ============================================================ */
const LUNAR_HINTS = [
    { ymd: "2026-05-22", hint: "四月初六 · 月渐圆 · 宜山行" },
    { ymd: "2026-05-31", hint: "四月十五 · 月圆 · 宜夜行抱犊" },
    { ymd: "2026-06-15", hint: "四月廿九 · 朔 · 宜观星驼梁" },
    { ymd: "2026-07-04", hint: "五月十九 · 入梅 · 山路湿滑" },
    { ymd: "2026-07-17", hint: "六月初三 · 入伏 · 宜避暑高山" },
    { ymd: "2026-09-25", hint: "八月十五 · 中秋 · 月圆山顶" },
    { ymd: "2026-10-18", hint: "九月初九 · 重阳 · 登高佩萸" }
];

function lunarHintToday() {
    const today = todayStr();
    const found = LUNAR_HINTS.find(l => l.ymd === today);
    if (found) return found.hint;
    // 默认按月份给提示
    const m = new Date().getMonth() + 1;
    const defaults = {
        1: "数九寒天 · 宜观冰瀑",
        2: "春寒料峭 · 宜半日轻徒步",
        3: "春风渐起 · 宜踏青寻芽",
        4: "清明谷雨 · 宜登高怀古",
        5: "立夏小满 · 宜入山纳凉",
        6: "芒种夏至 · 宜避暑高山",
        7: "三伏盛夏 · 宜瀑布戏水",
        8: "立秋处暑 · 宜山行观云",
        9: "白露秋分 · 宜赏初秋红叶",
        10: "寒露霜降 · 宜赏满山红枫",
        11: "立冬小雪 · 宜雪前最后远行",
        12: "大雪冬至 · 宜围炉夜话"
    };
    return defaults[m] || "山行有时,缘起则往";
}

/* ============================================================
   一山一画家 · 一山一字体 · 一山一琴曲
   ============================================================ */
const PAINTER_BY_ROUTE = {
    1: { painter: "范宽",  work: "溪山行旅图",   style: "雄壮浑厚,'高远'笔意",   era: "北宋" },
    2: { painter: "李唐",  work: "万壑松风图",   style: "万壑松涛,云海高山",     era: "南宋" },
    3: { painter: "倪瓒",  work: "容膝斋图",     style: "平远萧疏,'山顶平远'",   era: "元" },
    4: { painter: "黄公望",work: "富春山居图",   style: "丹砂赭石,层峦叠嶂",     era: "元" },
    5: { painter: "沈周",  work: "庐山高图",     style: "秋色苍郁,枫叶层染",     era: "明" },
    6: { painter: "王希孟",work: "千里江山图",   style: "青绿山水,五峰耸列",     era: "北宋" },
    7: { painter: "马远",  work: "踏歌图",       style: "南宋边角,湖光寺影",     era: "南宋" },
    8: { painter: "石涛",  work: "搜尽奇峰",     style: "瀑布飞泉,藤萝纵横",     era: "清初" },
    9: { painter: "八大山人",work: "山水图轴",   style: "孤峭冷逸,独行无依",     era: "明末清初" }
};

const CALLIGRAPHY_BY_ROUTE = {
    1: { master: "颜真卿", style: "楷书 · 古朴庄重", trait: "如怀古之山,字字端方" },
    2: { master: "怀素",   style: "草书 · 豪放奔泻", trait: "如瀑布飞流,一气呵成" },
    3: { master: "王羲之", style: "行书 · 飘逸俊朗", trait: "如山顶平远,清风自来" },
    4: { master: "张旭",   style: "狂草 · 雷霆万钧", trait: "如丹崖回响,惊天动地" },
    5: { master: "赵孟頫", style: "行楷 · 秋色斑斓", trait: "如红叶满山,雅而不繁" },
    6: { master: "苏轼",   style: "行书 · 浑厚潇洒", trait: "如众山并立,气象宏阔" },
    7: { master: "米芾",   style: "行书 · 八面出锋", trait: "如湖光波澜,变化多端" },
    8: { master: "黄庭坚", style: "行草 · 长枪大戟", trait: "如九瀑飞流,纵横恣肆" },
    9: { master: "八大山人", style: "草书 · 孤峭冷逸", trait: "如独行山脊,字如其人" }
};

const GUQIN_BY_ROUTE = {
    1: { song: "幽兰",        ref: "传 王羲之 友人之作", url: "https://www.bilibili.com/search?keyword=" },
    2: { song: "高山流水",    ref: "伯牙子期",          url: "https://www.bilibili.com/search?keyword=" },
    3: { song: "平沙落雁",    ref: "明 古曲",           url: "https://www.bilibili.com/search?keyword=" },
    4: { song: "广陵散",      ref: "嵇康刑前一曲",      url: "https://www.bilibili.com/search?keyword=" },
    5: { song: "梅花三弄",    ref: "晋 桓伊作",          url: "https://www.bilibili.com/search?keyword=" },
    6: { song: "阳关三叠",    ref: "唐 王维诗,后入琴",   url: "https://www.bilibili.com/search?keyword=" },
    7: { song: "渔樵问答",    ref: "明 古曲",           url: "https://www.bilibili.com/search?keyword=" },
    8: { song: "流水",        ref: "管平湖 演奏",       url: "https://www.bilibili.com/search?keyword=" },
    9: { song: "潇湘水云",    ref: "宋 郭楚望",         url: "https://www.bilibili.com/search?keyword=" }
};

/* ============================================================
   燕赵九风(性格印)
   ============================================================ */
const YANZHAO_SPIRIT_BY_ROUTE = {
    1: { name: "怀古", icon: "古", refPerson: "嵇康",    line: "山非山,是故人",     desc: "登苍岩,见悬空殿,似与古人对坐。" },
    2: { name: "任侠", icon: "侠", refPerson: "荆轲",    line: "风萧萧兮易水寒",       desc: "界峰之上,慷慨之心生。燕赵悲歌,自此开始。" },
    3: { name: "运筹", icon: "策", refPerson: "韩信",    line: "背水一战,置之死地而后生",desc: "山顶平阔,可见用兵之地形。韩信背水,即在此原野。" },
    4: { name: "磅礴", icon: "雄", refPerson: "乐毅",    line: "下齐七十二城",         desc: "丹崖三栈,有大将之气。" },
    5: { name: "遗韵", icon: "怀", refPerson: "崇祯",    line: "君王死社稷",           desc: "明末行宫遗址,皇家气息依存,亦有亡国之托。" },
    6: { name: "包容", icon: "和", refPerson: "蔺相如", line: "将相和",               desc: "五岳并立,如廉颇蔺相如,各有其位而不争。" },
    7: { name: "担当", icon: "担", refPerson: "毛主席", line: "敢教日月换新天",       desc: "新中国从此处出发,运筹之意延续千年。" },
    8: { name: "快意", icon: "义", refPerson: "聂政",   line: "士为知己者死",         desc: "藤龙飞拉达,有刺秦之快。" },
    9: { name: "孤勇", icon: "独", refPerson: "豫让",   line: "国士遇我,国士报之",   desc: "野山独行,无人共往,正合燕赵孤勇之风。" }
};

/* ============================================================
   远望志 · 各山地域气性印
   (五岳不属燕赵,故各按一方风物另立)
   ============================================================ */
const LOCAL_SPIRIT_BY_ROUTE = {
    10: { region: "齐鲁",   name: "至大",   icon: "岳", refPerson: "孔子",   line: "登泰山而小天下",     desc: "孔孟之乡,泰岱为尊。其气至大,可包山河,可服九州。" },
    11: { region: "关中",   name: "险绝",   icon: "险", refPerson: "李白",   line: "西岳峥嵘何壮哉",     desc: "三秦之地,华岳独尊。一线天梯,壁立千仞,刚烈孤直。" },
    12: { region: "湖湘",   name: "通达",   icon: "湘", refPerson: "朱熹",   line: "万古此寒泉,一杓何分别",  desc: "湖湘理学,经世致用。衡岳之南,书院鼎盛,文气磅礴。" },
    13: { region: "晋北",   name: "雄关",   icon: "塞", refPerson: "杨业",   line: "塞北神京,太行余脉",   desc: "雁门内外,忠烈不绝。北岳之险,亦边塞之雄。" },
    14: { region: "中原",   name: "厚载",   icon: "中", refPerson: "达摩",   line: "嵩高维岳,峻极于天",   desc: "天地之中,九州之腹。儒释并立,理学发源,百家归宗。" }
};

function getSpiritForRoute(routeId) {
    return YANZHAO_SPIRIT_BY_ROUTE[routeId] || LOCAL_SPIRIT_BY_ROUTE[routeId];
}

/* ============================================================
   五行山门
   ============================================================ */
const WUXING_BY_ROUTE = {
    1: { e: "木", desc: "山林苍翠,松柏古槐,属木" },
    2: { e: "土", desc: "高山界峰,稳如厚土" },
    3: { e: "金", desc: "山顶平如刀削,西望华北,属金" },
    4: { e: "火", desc: "丹崖赤壁,炽红如火" },
    5: { e: "火", desc: "秋叶红遍,如焰漫山" },
    6: { e: "木", desc: "森林氧吧,生气勃发,属木" },
    7: { e: "水", desc: "湖光潋滟,水库映山" },
    8: { e: "水", desc: "九瀑十八潭,水之灵动" },
    9: { e: "金", desc: "山脊孤立,锋利如刃" }
};

/* ============================================================
   节日推荐(根据日期返回)
   ============================================================ */
function todaySpecialOccasion() {
    const today = todayStr();
    const cur = new Date();
    // 节日
    for (const f of FESTIVALS) {
        const d = FESTIVAL_DATES_2026[f.name];
        if (!d) continue;
        const t = new Date(d);
        const diff = Math.floor((t - cur) / 86400000);
        if (diff === 0) return { kind: "festival", festival: f, days: 0 };
        if (diff > 0 && diff <= 7) return { kind: "festival", festival: f, days: diff };
    }
    return null;
}
