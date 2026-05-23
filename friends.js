/* ============================================================
   太行徒步志 · 山社(山友帖)
   零后端,纯前端 base64 信物码
   ============================================================ */

const FRIENDS = (() => {
    const KEY_ME       = "th_me";          // 自己的山号
    const KEY_ROSTER   = "th_roster";      // 山友名册
    const KEY_POSTS    = "th_posts";       // 投帖(我发出/接收的)
    const KEY_REPLIES  = "th_replies";     // 答帖
    const KEY_VOWS     = "th_vows";        // 同心印进度

    function getJSON(k, d) {
        try { return JSON.parse(localStorage.getItem(k)) ?? d; }
        catch { return d; }
    }
    function setJSON(k, v) { localStorage.setItem(k, JSON.stringify(v)); }

    return {
        /* ---- 我 ---- */
        getMe: () => getJSON(KEY_ME, null),
        setMe: m  => setJSON(KEY_ME, m),
        clearMe: () => localStorage.removeItem(KEY_ME),
        hasMe: () => !!getJSON(KEY_ME, null),

        /* ---- 山友名册 ---- */
        getRoster: () => getJSON(KEY_ROSTER, []),
        addFriend: f => {
            const arr = getJSON(KEY_ROSTER, []);
            const idx = arr.findIndex(x => x.id === f.id);
            if (idx >= 0) arr[idx] = f; else arr.unshift(f);
            setJSON(KEY_ROSTER, arr.slice(0, 50));
        },
        removeFriend: id => {
            setJSON(KEY_ROSTER, getJSON(KEY_ROSTER, []).filter(x => x.id !== id));
        },

        /* ---- 投帖/答帖 ---- */
        getPosts:   () => getJSON(KEY_POSTS, []),
        addPost:    p  => {
            const arr = getJSON(KEY_POSTS, []);
            arr.unshift({ id: Date.now(), ...p });
            setJSON(KEY_POSTS, arr.slice(0, 30));
        },
        removePost: id => setJSON(KEY_POSTS, getJSON(KEY_POSTS, []).filter(p => p.id !== id)),
        getReplies: () => getJSON(KEY_REPLIES, []),
        addReply:   r  => {
            const arr = getJSON(KEY_REPLIES, []);
            arr.unshift({ id: Date.now(), ...r });
            setJSON(KEY_REPLIES, arr.slice(0, 30));
        },

        /* ---- 同心印进度(本地 vows ) ---- */
        getVows:   () => getJSON(KEY_VOWS, {}),
        setVows:   v  => setJSON(KEY_VOWS, v),

        clearAll: () => {
            [KEY_ME, KEY_ROSTER, KEY_POSTS, KEY_REPLIES, KEY_VOWS].forEach(k => localStorage.removeItem(k));
        }
    };
})();

/* ============================================================
   雅号 / 印章生成
   ============================================================ */
const SAGE_NAMES = [
    "松风客", "听瀑生", "白云子", "扪石翁", "采薇人", "煮茶生",
    "栖云客", "踏雪人", "拾秋客", "枕石子", "饮泉翁", "披月生",
    "携琴客", "拾叶人", "饮霞生", "倚松翁", "策杖客", "钓雪人"
];

function suggestSageName() {
    return SAGE_NAMES[Math.floor(Math.random() * SAGE_NAMES.length)];
}

const ASPIRATIONS = [
    "以山为友,以诗为伴",
    "行到水穷处,坐看云起时",
    "且向林间为乞身",
    "明月松间照,清泉石上流",
    "山林之乐,得之心而寓之酒",
    "我醉欲眠卿且去",
    "山中无历日,寒尽不知年",
    "采菊东篱下,悠然见南山"
];

function suggestAspiration() {
    return ASPIRATIONS[Math.floor(Math.random() * ASPIRATIONS.length)];
}

/* ============================================================
   信物码(base64 编码的 JSON)
   ============================================================ */
function encodeToken(payload) {
    // 中文字符需要先编码再 base64
    const json = JSON.stringify(payload);
    const utf8 = unescape(encodeURIComponent(json));
    return btoa(utf8);
}

function decodeToken(token) {
    try {
        const utf8 = atob(token.trim());
        const json = decodeURIComponent(escape(utf8));
        return JSON.parse(json);
    } catch (e) {
        return null;
    }
}

/* 构建我赠出的信物 */
function buildMyToken(depth) {
    const me = FRIENDS.getMe();
    if (!me) return null;
    const visited = [...STORE.getVisited()];
    const log = STORE.getVisitedLog();
    const now = Date.now();
    const expireAt = now + 30 * 86400 * 1000; // 30 天

    const payload = {
        v: 1,
        t: "th-token",
        id: me.id,
        name: me.name,
        seal: me.seal,
        joined: me.joined,
        aspire: me.aspire,
        depth, // 浅交 / 同道 / 挚友
        expireAt,
        sentAt: now
    };

    if (depth === "tongdao" || depth === "zhiyou") {
        payload.visited = visited;
        payload.visitedAt = {};
        visited.forEach(id => {
            const entries = log[id] || [];
            if (entries[0]) payload.visitedAt[id] = entries[0].date;
        });
    }

    if (depth === "zhiyou") {
        // 摘 3 条最近的日记摘要(各保留 80 字)
        const diaries = [];
        visited.forEach(id => {
            const arr = STORE.getDiary(id);
            arr.forEach(e => diaries.push({ rid: id, date: e.date, weather: e.weather, mood: e.mood, text: e.text.slice(0, 80) }));
        });
        diaries.sort((a, b) => b.date.localeCompare(a.date));
        payload.diary = diaries.slice(0, 3);

        // 加自己的最近一次/未来出行(若有计划)
        const plan = STORE.getPlan && STORE.getPlan();
        if (plan) payload.plan = plan;
    }

    return encodeToken(payload);
}

/* 解析对方的信物 */
function parseFriendToken(token) {
    const data = decodeToken(token);
    if (!data || data.t !== "th-token") return { ok: false, err: "信物无法识别,请确认完整复制。" };
    if (!data.id || !data.name) return { ok: false, err: "信物缺少必要信息。" };
    if (data.expireAt && Date.now() > data.expireAt) return { ok: false, err: "信物已过期,可请对方再赠新信物。" };
    return { ok: true, friend: data };
}

/* ============================================================
   同行印 / 同心结
   ============================================================ */
function computeIntersections(friendId) {
    const me = [...STORE.getVisited()];
    const friend = FRIENDS.getRoster().find(f => f.id === friendId);
    if (!friend || !friend.visited) return [];
    return me.filter(id => friend.visited.includes(id));
}

function shouldHaveTongxinSeal(friendId) {
    // 双方在 3 条以上山有交集,或者共同写过日记 ≥ 3 条
    const inter = computeIntersections(friendId);
    return inter.length >= 3;
}

/* ============================================================
   山社成就
   ============================================================ */
const SOCIETY_ACHIEVEMENTS = [
    { id: "friend_1", count: 1, name: "得友",       desc: "初识山中人" },
    { id: "friend_3", count: 3, name: "山中三客",   desc: "三人成众" },
    { id: "friend_5", count: 5, name: "竹林",       desc: "如阮籍嵇康之徒" },
    { id: "friend_7", count: 7, name: "七贤",       desc: "竹林七贤之约" }
];

function getCurrentSocietyAch(count) {
    let cur = null;
    for (const a of SOCIETY_ACHIEVEMENTS) if (count >= a.count) cur = a;
    return cur;
}

function nextSocietyAch(count) {
    return SOCIETY_ACHIEVEMENTS.find(a => count < a.count);
}

/* ============================================================
   命定相遇:从信物里读出朋友的"plan",看是否撞期
   ============================================================ */
function checkSerendipity() {
    const myPlan = STORE.getPlan && STORE.getPlan();
    const roster = FRIENDS.getRoster();
    const matches = [];
    roster.forEach(f => {
        if (!f.plan || !f.plan.routeId || !f.plan.date) return;
        if (myPlan && myPlan.date === f.plan.date && myPlan.routeId === f.plan.routeId) {
            matches.push({ kind: "same", friend: f });
        } else if (myPlan && myPlan.date === f.plan.date) {
            matches.push({ kind: "sameDay", friend: f });
        }
    });
    return matches;
}

/* ============================================================
   雅集图:将所有朋友 + 我 绘成 SVG 拓本
   ============================================================ */
function buildSocietyMap() {
    const me = FRIENDS.getMe();
    const roster = FRIENDS.getRoster();
    if (!me) return "";

    const W = 600, H = 420;
    const cx = W / 2, cy = H / 2;
    const N = roster.length;

    // 中心:自己
    let nodes = `
        <g class="me-node">
            <circle cx="${cx}" cy="${cy}" r="38" fill="#b73228" />
            <circle cx="${cx}" cy="${cy}" r="34" fill="none" stroke="#fff5d6" stroke-width="1.5"/>
            <text x="${cx}" y="${cy + 5}" text-anchor="middle" fill="#fff5d6"
                  font-size="18" font-family="LXGW WenKai Screen, serif" font-weight="700">${(me.seal || me.name).slice(0, 2)}</text>
        </g>`;

    let lines = "";
    // 朋友环绕
    roster.forEach((f, i) => {
        const angle = -Math.PI / 2 + (i / Math.max(N, 1)) * Math.PI * 2;
        const r = 150 + (i % 2 === 0 ? 0 : 20);
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;
        const inter = computeIntersections(f.id);
        const intimacy = Math.min(inter.length / 3, 1);
        const stroke = intimacy >= 1 ? "#b73228" : "#8a7c5c";
        const lineDash = intimacy >= 1 ? "" : "4 4";

        lines += `<line x1="${cx}" y1="${cy}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}"
                       stroke="${stroke}" stroke-width="${1 + intimacy * 1.5}"
                       stroke-dasharray="${lineDash}" opacity="${0.4 + intimacy * 0.5}"/>`;

        nodes += `
            <g>
                <circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="26" fill="#3d6e5a" opacity="0.92"/>
                <circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="23" fill="none" stroke="#fff5d6" stroke-width="1"/>
                <text x="${x.toFixed(1)}" y="${(y + 4).toFixed(1)}" text-anchor="middle" fill="#fff5d6"
                      font-size="13" font-family="LXGW WenKai Screen, serif" font-weight="600">${(f.seal || f.name).slice(0, 2)}</text>
                ${inter.length > 0 ? `<text x="${x.toFixed(1)}" y="${(y + 42).toFixed(1)}" text-anchor="middle"
                    font-size="10" fill="#b73228" font-family="LXGW WenKai Screen, serif">共${inter.length}山</text>` : ""}
            </g>`;
    });

    // 标题
    const header = `
        <text x="${cx}" y="32" text-anchor="middle" font-size="20" fill="#b73228"
              font-family="LXGW WenKai Screen, serif" font-weight="700" letter-spacing="6">山 社 雅 集</text>
        <text x="${cx}" y="56" text-anchor="middle" font-size="12" fill="#8a7c5c"
              font-family="LXGW WenKai Screen, serif">— ${me.name} 与 ${N} 山友 —</text>`;

    return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;background:linear-gradient(160deg,#f5ecd9,#e8d8b8);border-radius:12px;">
        ${header}
        ${lines}
        ${nodes}
    </svg>`;
}
