/* ============================================================
   行山志 · 管理后台(档 A · 极简编辑器)
   - URL 加 ?admin=1 触发
   - 纯前端,改完导出 data.js / JSON 替换源文件后提交即生效
   - localStorage 存最近 10 次草稿,Ctrl+Z 撤销
   ============================================================ */

const ADMIN = (() => {
    const params = new URLSearchParams(location.search);
    const ENABLED = params.get("admin") === "1";

    const HISTORY_KEY = "th_admin_history";
    const DRAFT_KEY = "th_admin_draft";

    let workingRoutes = null;  // 当前工作副本
    let history = [];          // 撤销栈(最多 10 步)
    let dirty = false;         // 是否有未保存改动
    let editingId = null;

    function init() {
        if (!ENABLED) return;
        loadDraftIfAny();
        injectBar();
        attachGlobalKeys();
        markDirtyOnUnload();
    }

    /* ---- 草稿管理 ---- */
    function loadDraftIfAny() {
        const draft = localStorage.getItem(DRAFT_KEY);
        if (draft) {
            try {
                workingRoutes = JSON.parse(draft);
                if (Array.isArray(workingRoutes)) {
                    routes.length = 0;
                    workingRoutes.forEach(r => routes.push(r));
                    return;
                }
            } catch {}
        }
        workingRoutes = JSON.parse(JSON.stringify(routes));
    }

    function saveDraft() {
        try { localStorage.setItem(DRAFT_KEY, JSON.stringify(workingRoutes)); }
        catch (e) { console.warn("草稿保存失败,可能超出 localStorage 限额", e); }
    }

    function pushHistory(label) {
        history.push({ label, ts: Date.now(), data: JSON.stringify(workingRoutes) });
        if (history.length > 20) history.shift();
    }

    function undo() {
        if (history.length === 0) { toast("没有可撤销的改动"); return; }
        const last = history.pop();
        workingRoutes = JSON.parse(last.data);
        applyToRuntime();
        saveDraft();
        toast("已撤销:" + last.label);
        if (editingId !== null) openEditor(editingId);
    }

    function applyToRuntime() {
        routes.length = 0;
        workingRoutes.forEach(r => routes.push(r));
        if (typeof render === "function") render();
        if (typeof renderSeasonBand === "function") renderSeasonBand();
        refreshBar();
    }

    function markDirty(label) {
        dirty = true;
        pushHistory(label || "改动");
        saveDraft();
        applyToRuntime();
    }

    function markDirtyOnUnload() {
        window.addEventListener("beforeunload", e => {
            if (!dirty) return;
            e.preventDefault();
            e.returnValue = "有未导出的草稿,确定离开?";
        });
    }

    /* ---- 顶部管理栏 ---- */
    function injectBar() {
        const bar = document.createElement("div");
        bar.id = "adminBar";
        bar.className = "admin-bar";
        bar.innerHTML = `
            <div class="admin-left">
                <span class="admin-mark">✎ 编辑模式</span>
                <span class="admin-stats" id="adminStats"></span>
            </div>
            <div class="admin-actions">
                <button class="admin-btn" id="adminAdd">+ 新增路线</button>
                <button class="admin-btn" id="adminAudit">🔎 校对</button>
                <button class="admin-btn" id="adminUndo" title="Ctrl+Z">↶ 撤销</button>
                <button class="admin-btn" id="adminImport">📥 导入</button>
                <button class="admin-btn primary" id="adminExport">📤 导出 data.js</button>
                <button class="admin-btn" id="adminExportJson">JSON</button>
                <button class="admin-btn warn" id="adminReset">⟲ 弃稿</button>
                <button class="admin-btn" id="adminExit">关</button>
            </div>
            <input type="file" id="adminImportFile" accept=".js,.json" hidden>
        `;
        document.body.prepend(bar);
        document.body.classList.add("admin-on");

        document.getElementById("adminAdd").onclick = createRoute;
        document.getElementById("adminAudit").onclick = openAudit;
        document.getElementById("adminUndo").onclick = undo;
        document.getElementById("adminImport").onclick = () => document.getElementById("adminImportFile").click();
        document.getElementById("adminImportFile").onchange = importFile;
        document.getElementById("adminExport").onclick = () => exportFile("js");
        document.getElementById("adminExportJson").onclick = () => exportFile("json");
        document.getElementById("adminReset").onclick = resetDraft;
        document.getElementById("adminExit").onclick = exitAdmin;

        refreshBar();
        injectCardEditButtons();
        attachCardObserver();
    }

    function refreshBar() {
        const stats = document.getElementById("adminStats");
        if (!stats) return;
        const n = workingRoutes.length;
        const audit = quickAudit();
        stats.innerHTML = `· ${n} 条路线 · ${audit.warnings.length > 0 ? `<span class="warn-count">${audit.warnings.length} 处提示</span>` : "无异常"}${dirty ? ' · <span class="dirty-flag">未导出</span>' : ""}`;
    }

    function attachCardObserver() {
        // 路线卡片是动态生成的,监听 grid 内容变化,补"编辑"按钮
        const grid = document.getElementById("routeGrid");
        if (!grid) return;
        const observer = new MutationObserver(() => injectCardEditButtons());
        observer.observe(grid, { childList: true });
    }

    function injectCardEditButtons() {
        document.querySelectorAll(".route-card").forEach(card => {
            if (card.querySelector(".admin-card-tools")) return;
            const id = parseInt(card.dataset.id);
            const tools = document.createElement("div");
            tools.className = "admin-card-tools";
            tools.onclick = e => e.stopPropagation();
            tools.innerHTML = `
                <button class="admin-icon" title="编辑" data-act="edit">✎</button>
                <button class="admin-icon" title="复制" data-act="dup">⎘</button>
                <button class="admin-icon warn" title="删除" data-act="del">×</button>
            `;
            tools.querySelector('[data-act="edit"]').onclick = () => openEditor(id);
            tools.querySelector('[data-act="dup"]').onclick = () => duplicateRoute(id);
            tools.querySelector('[data-act="del"]').onclick = () => deleteRoute(id);
            card.appendChild(tools);
        });
    }

    function attachGlobalKeys() {
        document.addEventListener("keydown", e => {
            if (!ENABLED) return;
            if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
                if (document.activeElement && /INPUT|TEXTAREA/.test(document.activeElement.tagName)) return;
                e.preventDefault();
                undo();
            }
        });
    }

    /* ---- CRUD ---- */
    function nextId() {
        return Math.max(0, ...workingRoutes.map(r => r.id || 0)) + 1;
    }

    function createRoute() {
        const tpl = {
            id: nextId(),
            name: "新路线",
            location: "石家庄",
            difficulty: "easy",
            difficultyLabel: "轻松",
            duration: "half",
            durationLabel: "半日",
            distance: "5 km",
            elevation: "约 200 m",
            bestSeason: "全年适宜",
            seasonTags: ["spring", "summer", "autumn", "winter"],
            theme: { sky: ["#d4e8d8", "#8bb89e"], far: "#7ea88e", mid: "#5a8c70", near: "#3a6e50", accent: "flat", sun: "warm", primary: "#5a8c70", soft: "#e3ede5" },
            ratings: { stamina: 1, technical: 1, exposure: 1, retreat: 5, signal: 5 },
            techGrade: "T1",
            epithet: "新山",
            description: "新路线简介(请编辑)",
            features: ["特点 1", "特点 2"],
            waypoints: [
                { time: "09:00", name: "起点", elev: "100m", scene: "🚪", vista: "起点景色", note: "起点说明" }
            ],
            hiddenSpots: ["隐藏玩法 1"],
            photography: "",
            food: "",
            cuisine: null,
            poem: null,
            route: "起点 → 终点",
            access: "交通方式",
            tips: "出行提示",
            gear: ["登山鞋", "1L 饮水"],
            emergency: { local: "当地文旅局 ", rescue: "景区救援 ", general: "110 / 120" },
            gpxNote: "暂无",
            soundscape: { name: "山风", search: "mountain wind" },
            lastUpdated: todayStr ? todayStr() : new Date().toISOString().slice(0, 10)
        };
        workingRoutes.push(tpl);
        markDirty("新增路线");
        toast("已新增路线,请编辑");
        openEditor(tpl.id);
    }

    function duplicateRoute(id) {
        const orig = workingRoutes.find(r => r.id === id);
        if (!orig) return;
        const copy = JSON.parse(JSON.stringify(orig));
        copy.id = nextId();
        copy.name = orig.name + " 副本";
        workingRoutes.push(copy);
        markDirty("复制路线 " + orig.name);
        toast("已复制");
    }

    function deleteRoute(id) {
        const r = workingRoutes.find(x => x.id === id);
        if (!r) return;
        if (!confirm(`确定删除「${r.name}」?可用 Ctrl+Z 撤销。`)) return;
        workingRoutes = workingRoutes.filter(x => x.id !== id);
        markDirty("删除路线 " + r.name);
        toast("已删除,Ctrl+Z 撤销");
    }

    /* ---- 编辑器 ---- */
    function openEditor(id) {
        const r = workingRoutes.find(x => x.id === id);
        if (!r) return;
        editingId = id;

        const html = `
            <div class="admin-edit-shell">
                <div class="admin-edit-head">
                    <h3>✎ 编辑路线 · #${r.id}</h3>
                    <div>
                        <button class="admin-btn" id="editPrev">← 上一条</button>
                        <button class="admin-btn" id="editNext">下一条 →</button>
                        <button class="admin-btn" id="editClose">关</button>
                    </div>
                </div>
                <div class="admin-edit-body">
                    ${renderFields(r)}
                </div>
                <div class="admin-edit-foot">
                    <span style="color:#888;font-size:0.78rem;">改动会自动存草稿,导出 data.js 后提交 git 即正式生效</span>
                    <button class="admin-btn primary" id="editDone">完成</button>
                </div>
            </div>`;

        let panel = document.getElementById("adminEditPanel");
        if (!panel) {
            panel = document.createElement("div");
            panel.id = "adminEditPanel";
            panel.className = "admin-edit-panel";
            document.body.appendChild(panel);
        }
        panel.innerHTML = html;
        panel.classList.add("show");

        bindEditorFields(r);

        document.getElementById("editClose").onclick = closeEditor;
        document.getElementById("editDone").onclick = closeEditor;
        document.getElementById("editPrev").onclick = () => navigateRoute(-1);
        document.getElementById("editNext").onclick = () => navigateRoute(1);
    }

    function navigateRoute(dir) {
        const idx = workingRoutes.findIndex(r => r.id === editingId);
        const next = (idx + dir + workingRoutes.length) % workingRoutes.length;
        openEditor(workingRoutes[next].id);
    }

    function closeEditor() {
        const panel = document.getElementById("adminEditPanel");
        if (panel) panel.classList.remove("show");
        editingId = null;
    }

    /* ---- 字段渲染 ---- */
    function field(label, key, val, hint) {
        const safe = val == null ? "" : String(val).replace(/"/g, "&quot;");
        return `<label class="ed-field">
            <span class="ed-label">${label}</span>
            <input type="text" data-k="${key}" value="${safe}">
            ${hint ? `<small>${hint}</small>` : ""}
        </label>`;
    }

    function fieldArea(label, key, val, hint) {
        const safe = val == null ? "" : String(val);
        return `<label class="ed-field">
            <span class="ed-label">${label}</span>
            <textarea data-k="${key}" rows="3">${safe.replace(/</g, "&lt;")}</textarea>
            ${hint ? `<small>${hint}</small>` : ""}
        </label>`;
    }

    function fieldSelect(label, key, val, opts) {
        const options = opts.map(o => {
            const [v, lbl] = Array.isArray(o) ? o : [o, o];
            return `<option value="${v}" ${v === val ? "selected" : ""}>${lbl}</option>`;
        }).join("");
        return `<label class="ed-field">
            <span class="ed-label">${label}</span>
            <select data-k="${key}">${options}</select>
        </label>`;
    }

    function fieldArr(label, key, arr, hint) {
        const text = (arr || []).join("\n");
        return `<label class="ed-field">
            <span class="ed-label">${label}</span>
            <textarea data-k="${key}" data-type="lines" rows="${Math.max(3, (arr || []).length)}">${text.replace(/</g, "&lt;")}</textarea>
            ${hint ? `<small>${hint}</small>` : '<small>每行一项</small>'}
        </label>`;
    }

    function renderFields(r) {
        const seasonChecks = ["spring", "summer", "autumn", "winter"].map(s => {
            const checked = (r.seasonTags || []).includes(s);
            const label = { spring: "春", summer: "夏", autumn: "秋", winter: "冬" }[s];
            return `<label class="ed-check"><input type="checkbox" data-k="seasonTags" data-val="${s}" ${checked ? "checked" : ""}>${label}</label>`;
        }).join("");

        return `
            <fieldset>
                <legend>基本</legend>
                <div class="ed-row">
                    ${field("名称", "name", r.name)}
                    ${field("地点", "location", r.location)}
                </div>
                <div class="ed-row">
                    ${fieldSelect("难度", "difficulty", r.difficulty, [["easy","轻松"],["medium","中等"],["hard","困难"]])}
                    ${field("难度标签", "difficultyLabel", r.difficultyLabel)}
                    ${fieldSelect("时长", "duration", r.duration, [["half","半日"],["full","一日"],["multi","多日"]])}
                    ${field("时长标签", "durationLabel", r.durationLabel)}
                </div>
                <div class="ed-row">
                    ${field("距离", "distance", r.distance)}
                    ${field("海拔差", "elevation", r.elevation)}
                    ${field("最佳季节", "bestSeason", r.bestSeason)}
                    ${field("技术等级", "techGrade", r.techGrade)}
                </div>
                <div class="ed-row">
                    ${field("雅号", "epithet", r.epithet)}
                    ${field("更新日期", "lastUpdated", r.lastUpdated)}
                </div>
                <div class="ed-field">
                    <span class="ed-label">季节标签</span>
                    <div class="ed-checks">${seasonChecks}</div>
                </div>
                ${fieldArea("简介 description", "description", r.description)}
                ${fieldArr("路线特点 features", "features", r.features)}
                ${fieldArr("隐藏玩法 hiddenSpots", "hiddenSpots", r.hiddenSpots)}
                ${fieldArr("装备 gear", "gear", r.gear)}
                ${fieldArea("摄影建议 photography", "photography", r.photography)}
                ${fieldArea("交通 access", "access", r.access)}
                ${fieldArea("出行提示 tips", "tips", r.tips)}
                ${fieldArea("路线串联 route", "route", r.route)}
                ${fieldArea("地图说明 gpxNote", "gpxNote", r.gpxNote)}
            </fieldset>

            <fieldset>
                <legend>评分(1-5)</legend>
                <div class="ed-row">
                    ${field("体力 stamina", "ratings.stamina", r.ratings ? r.ratings.stamina : "")}
                    ${field("技术 technical", "ratings.technical", r.ratings ? r.ratings.technical : "")}
                    ${field("暴露 exposure", "ratings.exposure", r.ratings ? r.ratings.exposure : "")}
                    ${field("撤退 retreat", "ratings.retreat", r.ratings ? r.ratings.retreat : "")}
                    ${field("信号 signal", "ratings.signal", r.ratings ? r.ratings.signal : "")}
                </div>
            </fieldset>

            <fieldset>
                <legend>主题色 theme</legend>
                <div class="ed-row">
                    ${field("天空色 sky[0]", "theme.sky.0", r.theme ? r.theme.sky[0] : "")}
                    ${field("天空色 sky[1]", "theme.sky.1", r.theme ? r.theme.sky[1] : "")}
                    ${field("远山 far", "theme.far", r.theme && r.theme.far)}
                    ${field("中山 mid", "theme.mid", r.theme && r.theme.mid)}
                    ${field("近山 near", "theme.near", r.theme && r.theme.near)}
                </div>
                <div class="ed-row">
                    ${fieldSelect("装饰 accent", "theme.accent", r.theme && r.theme.accent, ["temple","snow","cliff","maple","five","lake","waterfall","flat","ridge"])}
                    ${fieldSelect("光照 sun", "theme.sun", r.theme && r.theme.sun, ["warm","cool","sunset"])}
                    ${field("主色 primary", "theme.primary", r.theme && r.theme.primary)}
                    ${field("浅色 soft", "theme.soft", r.theme && r.theme.soft)}
                </div>
            </fieldset>

            <fieldset>
                <legend>诗 poem</legend>
                <div class="ed-row">
                    ${field("题目", "poem.title", r.poem && r.poem.title)}
                    ${field("作者", "poem.author", r.poem && r.poem.author)}
                    ${field("朝代", "poem.dynasty", r.poem && r.poem.dynasty)}
                </div>
                ${fieldArr("诗句 lines(每行一句)", "poem.lines", r.poem && r.poem.lines)}
                ${fieldArea("注解 note", "poem.note", r.poem && r.poem.note)}
            </fieldset>

            <fieldset>
                <legend>打卡点 waypoints</legend>
                <div id="wpEditor"></div>
                <button class="admin-btn" id="addWp" type="button">+ 增加打卡点</button>
            </fieldset>

            <fieldset>
                <legend>山行三餐 cuisine</legend>
                ${field("点睛 tagline", "cuisine.tagline", r.cuisine && r.cuisine.tagline)}
                <div class="ed-row">
                    ${field("招牌名", "cuisine.signature.name", r.cuisine && r.cuisine.signature && r.cuisine.signature.name)}
                    ${field("招牌图标", "cuisine.signature.icon", r.cuisine && r.cuisine.signature && r.cuisine.signature.icon)}
                    ${field("招牌价格", "cuisine.signature.price", r.cuisine && r.cuisine.signature && r.cuisine.signature.price)}
                </div>
                ${fieldArea("招牌描述", "cuisine.signature.desc", r.cuisine && r.cuisine.signature && r.cuisine.signature.desc)}
                <div class="ed-row">
                    ${field("小食名", "cuisine.snack.name", r.cuisine && r.cuisine.snack && r.cuisine.snack.name)}
                    ${field("小食图标", "cuisine.snack.icon", r.cuisine && r.cuisine.snack && r.cuisine.snack.icon)}
                    ${field("小食价格", "cuisine.snack.price", r.cuisine && r.cuisine.snack && r.cuisine.snack.price)}
                </div>
                ${fieldArea("小食描述", "cuisine.snack.desc", r.cuisine && r.cuisine.snack && r.cuisine.snack.desc)}
                <div class="ed-row">
                    ${field("配饮名", "cuisine.drink.name", r.cuisine && r.cuisine.drink && r.cuisine.drink.name)}
                    ${field("配饮图标", "cuisine.drink.icon", r.cuisine && r.cuisine.drink && r.cuisine.drink.icon)}
                    ${field("配饮价格", "cuisine.drink.price", r.cuisine && r.cuisine.drink && r.cuisine.drink.price)}
                </div>
                ${fieldArea("配饮描述", "cuisine.drink.desc", r.cuisine && r.cuisine.drink && r.cuisine.drink.desc)}
                ${fieldArea("店家", "cuisine.shop", r.cuisine && r.cuisine.shop)}
                ${fieldArea("茶寮", "cuisine.tea", r.cuisine && r.cuisine.tea)}
                ${fieldArea("呼应诗", "cuisine.verse", r.cuisine && r.cuisine.verse)}
                <div class="ed-row">
                    ${field("春令", "cuisine.seasonal.spring", r.cuisine && r.cuisine.seasonal && r.cuisine.seasonal.spring)}
                    ${field("夏令", "cuisine.seasonal.summer", r.cuisine && r.cuisine.seasonal && r.cuisine.seasonal.summer)}
                    ${field("秋令", "cuisine.seasonal.autumn", r.cuisine && r.cuisine.seasonal && r.cuisine.seasonal.autumn)}
                    ${field("冬令", "cuisine.seasonal.winter", r.cuisine && r.cuisine.seasonal && r.cuisine.seasonal.winter)}
                </div>
            </fieldset>

            <fieldset>
                <legend>应急 emergency</legend>
                <div class="ed-row">
                    ${field("当地", "emergency.local", r.emergency && r.emergency.local)}
                    ${field("救援", "emergency.rescue", r.emergency && r.emergency.rescue)}
                    ${field("通用", "emergency.general", r.emergency && r.emergency.general)}
                </div>
            </fieldset>

            <fieldset>
                <legend>坐标 coords(用于真实天气)</legend>
                <div class="ed-row">
                    ${field("经度 lon", "coords.lon", r.coords && r.coords.lon)}
                    ${field("纬度 lat", "coords.lat", r.coords && r.coords.lat)}
                </div>
                <div class="ed-row" style="align-items:flex-end;">
                    <input type="text" id="geoLookupInput" placeholder="输入地名(如 苍岩山 / 井陉)" style="flex:1;padding:6px 10px;border:1px solid var(--line);border-radius:6px;background:var(--bg);color:var(--text);font-family:inherit;font-size:0.85rem;">
                    <button class="admin-btn" id="geoLookupBtn" type="button">🔎 查坐标</button>
                </div>
                <div id="geoLookupResult" style="margin-top:6px;font-size:0.82rem;"></div>
            </fieldset>

            <fieldset>
                <legend>音景 soundscape</legend>
                <div class="ed-row">
                    ${field("名称", "soundscape.name", r.soundscape && r.soundscape.name)}
                    ${field("英文搜索词", "soundscape.search", r.soundscape && r.soundscape.search)}
                </div>
            </fieldset>
        `;
    }

    function bindEditorFields(r) {
        // 路点专门处理
        renderWaypoints(r);

        document.querySelectorAll("#adminEditPanel [data-k]").forEach(el => {
            const onChange = () => {
                const k = el.dataset.k;
                if (k === "seasonTags" && el.type === "checkbox") {
                    const arr = Array.from(document.querySelectorAll('[data-k="seasonTags"]'))
                        .filter(c => c.checked).map(c => c.dataset.val);
                    setByPath(r, "seasonTags", arr);
                } else if (el.dataset.type === "lines") {
                    const arr = el.value.split("\n").map(s => s.trim()).filter(Boolean);
                    setByPath(r, k, arr);
                } else {
                    let v = el.value;
                    if (/^ratings\./.test(k)) v = parseInt(v) || 0;
                    setByPath(r, k, v);
                }
                markDirty("编辑 " + r.name);
            };
            el.addEventListener("change", onChange);
            if (el.tagName === "TEXTAREA" || el.type === "text") {
                el.addEventListener("blur", onChange);
            }
        });

        document.getElementById("addWp").onclick = () => {
            r.waypoints = r.waypoints || [];
            r.waypoints.push({ time: "12:00", name: "新打卡点", elev: "500m", scene: "📍", vista: "", note: "" });
            markDirty("增加打卡点");
            renderWaypoints(r);
        };

        // GeoAPI 地名 → 坐标
        const geoBtn = document.getElementById("geoLookupBtn");
        if (geoBtn) {
            geoBtn.onclick = async () => {
                const q = (document.getElementById("geoLookupInput").value || r.name || r.location || "").trim();
                const box = document.getElementById("geoLookupResult");
                if (!q) { box.innerHTML = '<span style="color:#a00;">请输入地名</span>'; return; }
                if (!window.WEATHER || !WEATHER.hasKey()) {
                    box.innerHTML = '<span style="color:#a00;">需先在 🛡️ 安全侧栏配置和风 API key</span>';
                    return;
                }
                box.innerHTML = '<span style="color:#888;">正在查询...</span>';
                const res = await WEATHER.lookupCity(q);
                if (!res || res.error) {
                    box.innerHTML = '<span style="color:#a00;">查询失败:' + (res && res.error ? res.error : "网络错误") + '</span>';
                    return;
                }
                if (res.length === 0) { box.innerHTML = '<span style="color:#888;">未找到匹配</span>'; return; }
                box.innerHTML = '<div style="display:flex;flex-direction:column;gap:4px;">' +
                    res.slice(0, 5).map((c, i) => `<button class="admin-btn" type="button" data-pick="${i}" style="text-align:left;">
                        ${c.name} · ${c.adm2 || ""} ${c.adm1 || ""} · 经 ${c.lon} 纬 ${c.lat}
                    </button>`).join("") + '</div>';
                box.querySelectorAll("[data-pick]").forEach(b => {
                    b.onclick = () => {
                        const idx = parseInt(b.dataset.pick);
                        const c = res[idx];
                        setByPath(r, "coords.lon", parseFloat(c.lon));
                        setByPath(r, "coords.lat", parseFloat(c.lat));
                        // 同步到输入框
                        const lonInput = document.querySelector('[data-k="coords.lon"]');
                        const latInput = document.querySelector('[data-k="coords.lat"]');
                        if (lonInput) lonInput.value = c.lon;
                        if (latInput) latInput.value = c.lat;
                        markDirty("更新坐标 " + r.name);
                        box.innerHTML = `<span style="color:#3a7;">✓ 已应用:${c.name} (${c.lon}, ${c.lat})</span>`;
                    };
                });
            };
        }
    }

    function renderWaypoints(r) {
        const box = document.getElementById("wpEditor");
        if (!box) return;
        const html = (r.waypoints || []).map((w, i) => `
            <div class="ed-wp" data-idx="${i}">
                <div class="ed-row">
                    <input type="text" placeholder="时间" data-wpk="time" value="${w.time || ""}" style="width:100px;">
                    <input type="text" placeholder="名称" data-wpk="name" value="${(w.name||"").replace(/"/g,'&quot;')}" style="flex:1;">
                    <input type="text" placeholder="海拔" data-wpk="elev" value="${w.elev || ""}" style="width:90px;">
                    <input type="text" placeholder="emoji" data-wpk="scene" value="${w.scene || ""}" style="width:60px;">
                    <button class="admin-icon warn" type="button" data-wpdel>×</button>
                </div>
                <input type="text" placeholder="景色描述" data-wpk="vista" value="${(w.vista||"").replace(/"/g,'&quot;')}" style="width:100%;margin-top:4px;">
                <input type="text" placeholder="路况提示" data-wpk="note" value="${(w.note||"").replace(/"/g,'&quot;')}" style="width:100%;margin-top:4px;">
            </div>`).join("");
        box.innerHTML = html;

        box.querySelectorAll(".ed-wp").forEach((wpEl, i) => {
            wpEl.querySelectorAll("[data-wpk]").forEach(inp => {
                inp.addEventListener("change", () => {
                    r.waypoints[i][inp.dataset.wpk] = inp.value;
                    markDirty("编辑打卡点");
                });
            });
            const delBtn = wpEl.querySelector("[data-wpdel]");
            if (delBtn) delBtn.onclick = () => {
                r.waypoints.splice(i, 1);
                markDirty("删除打卡点");
                renderWaypoints(r);
            };
        });
    }

    function setByPath(obj, path, val) {
        const keys = path.split(".");
        let cur = obj;
        for (let i = 0; i < keys.length - 1; i++) {
            const k = keys[i];
            if (cur[k] == null) cur[k] = isNaN(parseInt(keys[i+1])) ? {} : [];
            cur = cur[k];
        }
        cur[keys[keys.length - 1]] = val;
    }

    /* ---- 校对 ---- */
    function quickAudit() {
        const warnings = [];
        workingRoutes.forEach(r => {
            const id = `#${r.id} ${r.name}`;
            if (!r.name) warnings.push(`${id} 缺少名称`);
            if (!r.description) warnings.push(`${id} 缺少 description`);
            if (!r.features || r.features.length === 0) warnings.push(`${id} 缺少 features`);
            if (!r.waypoints || r.waypoints.length < 2) warnings.push(`${id} 打卡点少于 2 个`);
            if (!r.poem) warnings.push(`${id} 未配诗`);
            if (!r.cuisine) warnings.push(`${id} 未配山行三餐`);
            if (!r.epithet) warnings.push(`${id} 缺少雅号`);
            if (!r.emergency || !r.emergency.local) warnings.push(`${id} 缺少应急联系`);
            if (r.ratings) {
                ["stamina","technical","exposure","retreat","signal"].forEach(k => {
                    const v = r.ratings[k];
                    if (v == null || v < 1 || v > 5) warnings.push(`${id} ratings.${k} 应在 1-5`);
                });
            }
        });
        return { warnings };
    }

    function openAudit() {
        const { warnings } = quickAudit();
        const list = warnings.length === 0
            ? '<p style="color:#5a8c4a;">✓ 全部通过,无遗漏字段</p>'
            : `<ul>${warnings.map(w => `<li>${w}</li>`).join("")}</ul>`;
        alert("校对结果\n\n" + (warnings.length === 0 ? "✓ 全部通过" : warnings.join("\n")));
    }

    /* ---- 导入 / 导出 ---- */
    function exportFile(kind) {
        const json = JSON.stringify(workingRoutes, null, 4);
        const content = kind === "js"
            ? `const routes = ${json};\n`
            : json;
        const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = kind === "js" ? "data.js" : "routes.json";
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        dirty = false;
        refreshBar();
        toast(`已导出 ${a.download},替换源文件后 git commit + push 即生效`);
    }

    function importFile(e) {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = ev => {
            try {
                let txt = ev.target.result;
                // 兼容 data.js:剥掉 "const routes = " 与结尾 ";"
                txt = txt.replace(/^\s*const\s+routes\s*=\s*/, "").replace(/;\s*$/, "").trim();
                const arr = JSON.parse(txt);
                if (!Array.isArray(arr)) { toast("导入失败:不是数组"); return; }
                if (!confirm(`检测到 ${arr.length} 条路线,导入将覆盖当前草稿,确定?`)) return;
                pushHistory("导入文件");
                workingRoutes = arr;
                applyToRuntime();
                saveDraft();
                toast(`已导入 ${arr.length} 条路线`);
            } catch (err) {
                toast("导入失败:" + err.message);
            }
        };
        reader.readAsText(file);
        e.target.value = "";
    }

    function resetDraft() {
        if (!confirm("弃稿:清除所有未导出改动,恢复到 data.js 原始内容。继续?")) return;
        localStorage.removeItem(DRAFT_KEY);
        location.reload();
    }

    function exitAdmin() {
        if (dirty && !confirm("有未导出改动,确定退出?草稿仍会保留下次进入。")) return;
        const url = new URL(location.href);
        url.searchParams.delete("admin");
        location.href = url.toString();
    }

    return { init, ENABLED };
})();

document.addEventListener("DOMContentLoaded", () => ADMIN.init());
