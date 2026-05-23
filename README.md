# 行山志 · Xingshan · Walking the Mountains

> 行到水穷处,坐看云起时
> —— 王摩诘

石家庄周边徒步路线指南。一个零后端、纯静态、人文向的徒步志网站。

## 特色

- **9 条精选路线**:苍岩山、驼梁山、抱犊寨、嶂石岩、天桂山、五岳寨、西柏坡-天台山、藤龙山、佛光山
- **诗书画琴四艺**:每山配唐宋诗一首,绘宋元画家笔意,落朱砂红印
- **燕赵九风**:每条路线一枚性格印(怀古/任侠/运筹/磅礴/遗韵/包容/担当/快意/孤勇)
- **二十四节气 + 七十二候**:实时显示物候,推荐应季路线
- **山行三餐**:山下烟火,招牌菜+小食+配饮+茶寮+四季令
- **山社山友帖**:零后端朋友系统,信物码即名帖,雅集图见同心
- **真实天气**:接入和风天气 API(免费),含未来 7 日预报、实时、生活指数、灾害预警
- **气象预警推送**:浏览器原生通知,出门前自动提醒
- **徒步护照**:盖印记录,雅号成就(初入山门→樵夫→山客→云游→徐霞客)
- **山中三礼**:辞山 / 谢山 / 送山,出行仪式
- **明信片生成器**:一键 Canvas 合成水墨明信片下载分享
- **山行抽签**:山野神签,随机推路线 + 节气签语 + 古诗签 + 食签 + 成语签
- **极简后台**:`?admin=1` 即开,所见即所得编辑,导出 data.js 提交即生效

## 技术栈

- **零依赖纯前端** — HTML + CSS + JS,无构建工具,无 npm
- **localStorage** 持久化所有用户数据(护照、日记、约伴、山友)
- **和风天气 API**(用户自带 key,免费档够用)
- **LXGW 文楷字体**(从 jsdelivr CDN 加载,可改本地)
- **可部署到任何静态托管**:GitHub Pages / Netlify / Vercel / 自建 nginx

## 文件结构

```
codex/
├── index.html         主页面
├── style.css          全部样式(含暗黑模式)
├── data.js            9 条路线数据(诗/餐/坐标/打卡点等)
├── store.js           localStorage 数据层
├── culture.js         文化数据(节气候/花信/节日/成语/三礼/画家/字体/古琴/燕赵九风)
├── friends.js         山社系统(山号/信物码/名册/同心结)
├── weather.js         和风天气封装(预报/实时/预警/指数/GeoAPI)
├── app.js             主逻辑(渲染/弹窗/抽签/抽屉/雅集图...)
├── admin.js           管理后台(?admin=1 触发)
└── photos/            自定义打卡点照片(可选)
    └── 路线名/打卡点名.jpg
```

## 快速开始

### 本地预览

直接双击 `index.html` 即可。或用任意静态服务器:

```bash
# Python
python -m http.server 8000

# Node
npx serve .
```

### 配置真实天气(可选)

1. 去 [https://dev.qweather.com](https://dev.qweather.com) 注册免费账号
2. 控制台 → 应用管理 → 创建应用 → 选 Web API
3. 获得 API Key 与 API Host
4. 网站右上 🛡️ → ⚙ 配置和风天气 → 粘贴并测试

## 编辑内容(管理员)

地址栏加 `?admin=1` 进入编辑模式:

```
https://your-site.com/?admin=1
```

- 顶部黑色管理栏:统计 / 校对 / 撤销 / 导入 / 导出 / 新增 / 弃稿
- 路线卡右上角悬浮 ✎/⎘/× 三键
- 弹窗右侧抽屉编辑全部字段
- **改完点 📤 导出 data.js** → 下载文件 → 替换源 → git push → 上线

## 部署

### Netlify Drop(最快,30 秒)

打开 [https://app.netlify.com/drop](https://app.netlify.com/drop),把整个 `codex/` 文件夹拖进去。

### GitHub Pages(适合长期维护)

```bash
git init
git add .
git commit -m "init"
git remote add origin https://github.com/heyin567/taihang.git
git push -u origin main
```

仓库 Settings → Pages → Source: main → Save。

### Vercel(适合自定义域名)

直接 Import 仓库,Deploy。免费版即够用。

## 致谢

- 字体:[LXGW 霞鹜文楷](https://github.com/lxgw/LxgwWenKai)(开源,文楷之美)
- 天气:[和风天气](https://dev.qweather.com)(开发版免费 1000 次/日)
- 灵感:王维、苏轼、李白、杜甫、陶渊明诸位

## 许可

MIT — 你可以自由使用、修改、再分发,只需保留版权说明。

---

**山林之乐 · 林泉之约**

> 且放白鹿青崖间 · 须行即骑访名山
