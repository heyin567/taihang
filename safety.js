/* ============================================================
   行山志 · 兜底层(safety.js)
   - 全局错误捕获
   - localStorage 备份与还原
   - 反馈入口
   ============================================================ */

(function () {
    "use strict";

    /* ---- 全局错误兜底 ---- */
    const ERR_LOG_KEY = "th_err_log";

    function logError(kind, info) {
        try {
            const arr = JSON.parse(sessionStorage.getItem(ERR_LOG_KEY) || "[]");
            arr.push({ ts: Date.now(), kind, info });
            sessionStorage.setItem(ERR_LOG_KEY, JSON.stringify(arr.slice(-30)));
        } catch {}
    }

    function showFatalIfNeeded() {
        // 启动 2 秒后,若关键元素还没渲染,提示用户
        setTimeout(() => {
            const grid = document.getElementById("routeGrid");
            if (grid && grid.children.length === 0) {
                showRecoveryBanner("⚠ 主页面未正常加载,可能是脚本错误或本地数据损坏。", true);
            }
        }, 2500);
    }

    window.addEventListener("error", e => {
        logError("error", { msg: e.message, src: e.filename, line: e.lineno });
        // 仅在初次出错时显示提示
        if (!sessionStorage.getItem("th_err_shown")) {
            sessionStorage.setItem("th_err_shown", "1");
            showRecoveryBanner("⚠ 页面遇到了一个错误。多数情况下不影响使用,可继续浏览,或尝试还原数据。", false);
        }
    });

    window.addEventListener("unhandledrejection", e => {
        const reason = e.reason && (e.reason.message || e.reason.toString());
        logError("reject", { reason });
    });

    /* ---- 显示恢复横幅 ---- */
    function showRecoveryBanner(msg, fatal) {
        if (document.getElementById("recoveryBanner")) return;
        const bar = document.createElement("div");
        bar.id = "recoveryBanner";
        bar.className = "recovery-banner";
        bar.innerHTML = `
            <span>${msg}</span>
            <div class="recovery-actions">
                <button class="recovery-btn" id="recoveryReload">刷新</button>
                <button class="recovery-btn" id="recoveryClean">清缓存重启</button>
                <button class="recovery-btn" id="recoveryShowLog">查看日志</button>
                <button class="recovery-close" id="recoveryClose">收</button>
            </div>`;
        if (document.body) document.body.appendChild(bar);
        else document.addEventListener("DOMContentLoaded", () => document.body.appendChild(bar));

        setTimeout(() => {
            const reload = document.getElementById("recoveryReload");
            const clean = document.getElementById("recoveryClean");
            const showLog = document.getElementById("recoveryShowLog");
            const close = document.getElementById("recoveryClose");
            if (reload) reload.onclick = () => location.reload();
            if (clean) clean.onclick = () => {
                if (!confirm("将清除所有本地数据(护照/日记/山友/草稿),网站会恢复到全新状态。继续?")) return;
                try { localStorage.clear(); sessionStorage.clear(); } catch {}
                location.reload();
            };
            if (showLog) showLog.onclick = () => {
                try {
                    const log = JSON.parse(sessionStorage.getItem(ERR_LOG_KEY) || "[]");
                    if (log.length === 0) { alert("无错误日志"); return; }
                    const text = log.map(e => `[${new Date(e.ts).toLocaleTimeString()}] ${e.kind}: ${JSON.stringify(e.info)}`).join("\n\n");
                    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url; a.download = "th-error-log.txt"; a.click();
                    setTimeout(() => URL.revokeObjectURL(url), 1000);
                } catch {}
            };
            if (close) close.onclick = () => bar.classList.add("hide");
        }, 0);
    }

    /* ---- localStorage 安全读写 ---- */
    // 包装 getItem,corrupt 时不抛错
    const _getItem = localStorage.getItem.bind(localStorage);
    localStorage.getItem = function (k) {
        try { return _getItem(k); }
        catch (e) { logError("storage_get", { k, e: String(e) }); return null; }
    };

    /* ---- 备份 / 还原 / 反馈 注入到安全侧栏 ---- */
    function injectIntoSafetyPanel() {
        const safetyBody = document.querySelector(".safety-body");
        if (!safetyBody) return;
        if (document.getElementById("backupBlock")) return;

        const block = document.createElement("div");
        block.id = "backupBlock";
        block.style.marginBottom = "12px";
        block.innerHTML = `<h4>🗂️ 数据备份</h4>
            <p style="font-size:0.85rem;color:var(--text-soft);line-height:1.6;margin-bottom:8px;">
                所有山行数据(护照/日记/山友/草稿)保存在本机浏览器。换设备或清缓存前建议导出备份。
            </p>
            <div style="display:flex;gap:6px;flex-wrap:wrap;">
                <button class="share-btn" id="backupExport" style="flex:1;">📥 导出备份</button>
                <button class="share-btn" id="backupImport" style="flex:1;">📤 还原备份</button>
            </div>
            <input type="file" id="backupFileInput" accept=".json" hidden>`;
        safetyBody.appendChild(block);

        const fb = document.createElement("div");
        fb.id = "feedbackBlock";
        fb.style.marginBottom = "12px";
        fb.innerHTML = `<h4>📮 反馈与建议</h4>
            <p style="font-size:0.85rem;color:var(--text-soft);line-height:1.6;margin-bottom:8px;">
                发现错的电话/价格?有想加的路线?或单纯想聊聊?
            </p>
            <div style="display:flex;gap:6px;flex-wrap:wrap;">
                <a class="share-btn" href="mailto:5738514@qq.com?subject=行山志%20反馈" style="flex:1;text-align:center;text-decoration:none;">✉️ 邮件反馈</a>
                <button class="share-btn" id="copyDebug" style="flex:1;">🐛 复制调试信息</button>
            </div>
            <p style="font-size:0.72rem;color:var(--text-mute);margin-top:6px;line-height:1.5;">
                注:反馈时附调试信息可帮助定位问题(包含错误日志,不含个人数据)。
            </p>`;
        safetyBody.appendChild(fb);

        document.getElementById("backupExport").onclick = exportBackup;
        document.getElementById("backupImport").onclick = () => document.getElementById("backupFileInput").click();
        document.getElementById("backupFileInput").onchange = importBackup;
        document.getElementById("copyDebug").onclick = copyDebugInfo;
    }

    function collectLocalStorage() {
        const out = {};
        for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (!k || !k.startsWith("th_")) continue;
            try { out[k] = localStorage.getItem(k); } catch {}
        }
        return out;
    }

    function exportBackup() {
        const data = {
            v: 1,
            t: "xingshan-backup",
            exportedAt: new Date().toISOString(),
            localStorage: collectLocalStorage()
        };
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        const stamp = new Date().toISOString().slice(0, 10);
        a.href = url; a.download = `xingshan-backup-${stamp}.json`; a.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        if (window.toast) toast("备份已导出,妥善保存");
    }

    function importBackup(e) {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = ev => {
            try {
                const data = JSON.parse(ev.target.result);
                if (data.t !== "xingshan-backup" && data.t !== "taihang-trails-backup") {
                    alert("文件格式不对,不是有效备份文件");
                    return;
                }
                if (!confirm(`确定还原?将用备份文件(${data.exportedAt && data.exportedAt.slice(0,10)})覆盖当前所有本地数据。`)) return;
                // 仅恢复 th_ 开头的键,避免覆盖其他网站
                Object.keys(data.localStorage || {}).forEach(k => {
                    if (k.startsWith("th_")) {
                        try { localStorage.setItem(k, data.localStorage[k]); } catch {}
                    }
                });
                alert("还原完成,网页将刷新");
                location.reload();
            } catch (err) {
                alert("还原失败:" + err.message);
            }
        };
        reader.readAsText(file);
        e.target.value = "";
    }

    function copyDebugInfo() {
        const info = {
            ua: navigator.userAgent,
            now: new Date().toISOString(),
            url: location.href,
            errors: (() => {
                try { return JSON.parse(sessionStorage.getItem(ERR_LOG_KEY) || "[]"); }
                catch { return []; }
            })(),
            storage: Object.keys(collectLocalStorage())
        };
        const text = "行山志 · 调试信息\n\n" + JSON.stringify(info, null, 2);
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => {
                if (window.toast) toast("调试信息已复制,可粘贴到邮件");
            }).catch(() => prompt("复制下方调试信息:", text));
        } else {
            prompt("复制下方调试信息:", text);
        }
    }

    /* ---- 页脚反馈链接 ---- */
    function injectFooterFeedback() {
        const footer = document.querySelector("footer");
        if (!footer) return;
        if (document.getElementById("footerFb")) return;
        const fb = document.createElement("div");
        fb.id = "footerFb";
        fb.style.cssText = "margin-top:10px;font-size:0.78rem;letter-spacing:0.15em;";
        fb.innerHTML = `
            <a href="mailto:5738514@qq.com?subject=行山志%20反馈" style="color:rgba(255,245,214,0.6);text-decoration:none;margin:0 8px;">📮 反馈</a>
            <span style="color:rgba(255,245,214,0.3);">|</span>
            <a href="https://github.com/heyin567/taihang" target="_blank" rel="noopener" style="color:rgba(255,245,214,0.6);text-decoration:none;margin:0 8px;">⌥ 源码</a>
            <span style="color:rgba(255,245,214,0.3);">|</span>
            <span style="color:rgba(255,245,214,0.45);margin:0 8px;">v1.0 · 2026</span>`;
        footer.appendChild(fb);
    }

    /* ---- 启动 ---- */
    document.addEventListener("DOMContentLoaded", () => {
        showFatalIfNeeded();
        // 延后注入到安全侧栏(等 app.js 跑完)
        setTimeout(injectIntoSafetyPanel, 500);
        setTimeout(injectFooterFeedback, 500);
    });
})();
