/* ============================================================
   太行徒步志 · 天气层(weather.js)
   - 和风天气 API 封装(免费档,需用户自带 key)
   - 30 分钟 localStorage 缓存,减少 API 用量
   - 无 key 时降级为伪随机(开发与 demo 仍可看)
   ============================================================ */

const WEATHER = (() => {
    const KEY_STORAGE  = "th_weather_key";
    const KEY_HOST     = "th_weather_host";       // 和风开发版 host(可选)
    const KEY_CACHE    = "th_weather_cache";      // { "lon,lat:7d": { ts, data } }
    const KEY_CITY     = "th_weather_city";       // 上次解析的城市坐标
    const TTL_MS       = 30 * 60 * 1000;          // 30 分钟
    const DEFAULT_HOST = "https://devapi.qweather.com";

    function getKey() { return localStorage.getItem(KEY_STORAGE) || ""; }
    function setKey(k) { localStorage.setItem(KEY_STORAGE, k.trim()); }
    function clearKey() { localStorage.removeItem(KEY_STORAGE); }
    function hasKey() { return !!getKey(); }

    function getHost() { return localStorage.getItem(KEY_HOST) || DEFAULT_HOST; }
    function setHost(h) { localStorage.setItem(KEY_HOST, h.trim().replace(/\/+$/, "")); }

    /* 缓存 */
    function readCache(key) {
        try {
            const raw = localStorage.getItem(KEY_CACHE);
            if (!raw) return null;
            const map = JSON.parse(raw);
            const item = map[key];
            if (!item) return null;
            if (Date.now() - item.ts > TTL_MS) return null;
            return item.data;
        } catch { return null; }
    }
    function writeCache(key, data) {
        try {
            const raw = localStorage.getItem(KEY_CACHE);
            const map = raw ? JSON.parse(raw) : {};
            map[key] = { ts: Date.now(), data };
            localStorage.setItem(KEY_CACHE, JSON.stringify(map));
        } catch {}
    }

    /* 真实 API:7 天预报 */
    async function fetch7d(lon, lat) {
        const key = getKey();
        if (!key) return null;
        const cacheKey = `${lon.toFixed(2)},${lat.toFixed(2)}:7d`;
        const cached = readCache(cacheKey);
        if (cached) return cached;

        const host = getHost();
        const url = `${host}/v7/weather/7d?location=${lon.toFixed(2)},${lat.toFixed(2)}&key=${encodeURIComponent(key)}`;
        try {
            const r = await fetch(url);
            const j = await r.json();
            if (j.code !== "200") {
                console.warn("和风返回:", j);
                return null;
            }
            writeCache(cacheKey, j.daily);
            return j.daily;
        } catch (err) {
            console.warn("和风请求失败:", err);
            return null;
        }
    }

    /* 真实 API:实时 */
    async function fetchNow(lon, lat) {
        const key = getKey();
        if (!key) return null;
        const cacheKey = `${lon.toFixed(2)},${lat.toFixed(2)}:now`;
        const cached = readCache(cacheKey);
        if (cached) return cached;

        const host = getHost();
        const url = `${host}/v7/weather/now?location=${lon.toFixed(2)},${lat.toFixed(2)}&key=${encodeURIComponent(key)}`;
        try {
            const r = await fetch(url);
            const j = await r.json();
            if (j.code !== "200") return null;
            writeCache(cacheKey, j.now);
            return j.now;
        } catch { return null; }
    }

    /* 真实 API:气象灾害预警 */
    async function fetchWarning(lon, lat) {
        const key = getKey();
        if (!key) return null;
        const host = getHost();
        const url = `${host}/v7/warning/now?location=${lon.toFixed(2)},${lat.toFixed(2)}&key=${encodeURIComponent(key)}`;
        try {
            const r = await fetch(url);
            const j = await r.json();
            if (j.code !== "200") return null;
            return j.warning || [];
        } catch { return null; }
    }

    /* 真实 API:生活指数(免费档支持的 type 列表) */
    /* type: 1运动 2洗车 3穿衣 5紫外线 6钓鱼 9感冒 14过敏 15旅游 16空气污染扩散 */
    const INDICES_FREE = ["1", "3", "5", "6", "9", "15"];
    async function fetchIndices(lon, lat) {
        const key = getKey();
        if (!key) return null;
        const cacheKey = `${lon.toFixed(2)},${lat.toFixed(2)}:idx`;
        const cached = readCache(cacheKey);
        if (cached) return cached;

        const host = getHost();
        const url = `${host}/v7/indices/1d?type=${INDICES_FREE.join(",")}&location=${lon.toFixed(2)},${lat.toFixed(2)}&key=${encodeURIComponent(key)}`;
        try {
            const r = await fetch(url);
            const j = await r.json();
            if (j.code !== "200") return null;
            writeCache(cacheKey, j.daily);
            return j.daily;
        } catch (err) {
            console.warn("生活指数失败:", err);
            return null;
        }
    }

    /* GeoAPI:从地名查坐标 */
    async function lookupCity(query) {
        const key = getKey();
        if (!key) return null;
        const host = getHost();
        // GeoAPI 路径与天气路径相同 host(开发版自定义 host 也通用)
        const url = `${host.replace("/v7", "")}/geo/v2/city/lookup?location=${encodeURIComponent(query)}&range=cn&number=10&key=${encodeURIComponent(key)}`;
        try {
            const r = await fetch(url);
            const j = await r.json();
            if (j.code !== "200") return { error: j.code };
            return j.location || [];
        } catch (err) {
            return { error: "network" };
        }
    }

    /* 把和风 textDay 文字映射到 emoji + 评分 */
    const ICON_MAP = {
        晴: { i: "☀️", good: 5 },
        多云: { i: "🌤", good: 4 },
        少云: { i: "🌤", good: 4 },
        晴间多云: { i: "🌤", good: 4 },
        阴: { i: "⛅", good: 3 },
        雷阵雨: { i: "⛈", good: 1 },
        阵雨: { i: "🌦", good: 2 },
        小雨: { i: "🌧", good: 2 },
        中雨: { i: "🌧", good: 1 },
        大雨: { i: "🌧", good: 1 },
        暴雨: { i: "⛈", good: 0 },
        雪: { i: "🌨", good: 1 },
        小雪: { i: "🌨", good: 2 },
        中雪: { i: "🌨", good: 1 },
        大雪: { i: "❄️", good: 1 },
        雾: { i: "🌫", good: 2 },
        霾: { i: "😷", good: 1 }
    };

    function iconFor(text) {
        if (!text) return { i: "🌤", good: 3, name: "—" };
        for (const k of Object.keys(ICON_MAP)) {
            if (text.includes(k)) return { ...ICON_MAP[k], name: text };
        }
        return { i: "🌤", good: 3, name: text };
    }

    /* 转换为内部格式(与 mockWeekWeather 同结构) */
    function normalizeDaily(daily) {
        if (!Array.isArray(daily)) return [];
        return daily.map((d, i) => {
            const icon = iconFor(d.textDay);
            const date = new Date(d.fxDate + "T08:00:00");
            return {
                date,
                ymd: `${date.getFullYear()}.${date.getMonth()+1}.${date.getDate()}`,
                label: i === 0 ? "今" : i === 1 ? "明" : "周" + "日一二三四五六"[date.getDay()],
                icon: icon.i,
                name: icon.name,
                good: icon.good,
                temp: `${d.tempMin}~${d.tempMax}°C`,
                wind: `${d.windDirDay} ${d.windScaleDay}级`,
                humidity: d.humidity,
                source: "qweather"
            };
        });
    }

    /* 主入口:7 天天气(优先真实,无则降级) */
    async function week7d(lon, lat) {
        if (hasKey() && lon != null && lat != null) {
            const daily = await fetch7d(lon, lat);
            if (daily) return normalizeDaily(daily);
        }
        // 降级:伪随机(原 mockWeekWeather 实现)
        if (typeof mockWeekWeather === "function") {
            return mockWeekWeather().map(w => ({ ...w, source: "mock" }));
        }
        return [];
    }

    /* 当日天气一句话 */
    async function todayBrief(lon, lat) {
        if (!hasKey() || lon == null || lat == null) return null;
        const now = await fetchNow(lon, lat);
        if (!now) return null;
        const ic = iconFor(now.text);
        return {
            icon: ic.i,
            text: now.text,
            temp: now.temp + "°C",
            feels: now.feelsLike + "°C",
            wind: `${now.windDir} ${now.windScale}级`,
            humidity: now.humidity + "%",
            obsTime: now.obsTime
        };
    }

    /* 预警(暴雨、大风、雷电…),用于详情页风险提示 */
    async function warningFor(lon, lat) {
        if (!hasKey() || lon == null || lat == null) return [];
        const w = await fetchWarning(lon, lat);
        return w || [];
    }

    /* 生活指数 */
    async function indicesFor(lon, lat) {
        if (!hasKey() || lon == null || lat == null) return [];
        const arr = await fetchIndices(lon, lat);
        return arr || [];
    }

    /* 天气 → 应季签子(给抽签和签文用) */
    function dayAdvice(w) {
        if (!w) return "";
        if (w.good >= 4) return "天朗气清,正合远行";
        if (w.good === 3) return "天色平平,短线为佳";
        if (w.good === 2) return "有雨慎行,推索道线 / 平易山";
        return "暴雨/大雪在即,改日为妙";
    }

    return {
        getKey, setKey, clearKey, hasKey,
        getHost, setHost,
        week7d, todayBrief, warningFor, indicesFor, lookupCity,
        dayAdvice, iconFor,
        clearCache: () => localStorage.removeItem(KEY_CACHE)
    };
})();
