# 部署说明 · 跨环境通用 TVBox 静态订阅

生成的 `tvbox-dist/` 目录是一套**纯静态文件**，不依赖任何服务器。
把它上传到任意静态托管，拿到一个 `https://...` 地址即可。

> **海报说明**：包内的 `images/` 目录是本工具自动随包发布的本地海报图库。
> 订阅 JSON 里的海报地址已改写为你自己的托管域名（如 `https://user.github.io/repo/images/xxx.jpg`），
> 电视/手机加载海报时直接读你自己的仓库，不再依赖第三方图床 / CDN / 防盗链。
> 请务必把 `images/` 整个目录一起上传，否则海报会 404。

## 发布时指定 BASE（重要）

生成包时请用 `--base` 指明你最终的托管根地址（决定爬虫与订阅里写死的地址）：

```bash
python -m backend.core.publisher --source demo --base https://你的用户名.github.io/FilmCollector --out tvbox-dist
```

`--base` 只需改这一处，代码与数据无需任何改动即可换到 GitHub / Codeberg / Gitee。

## 方式一：GitHub Pages（推荐，免费）

1. 在 GitHub 新建一个仓库，例如 `FilmCollector`。
2. 把 `tvbox-dist/` 里的**所有文件**推到仓库（可直接放根目录，或放 `docs/` 并开 Pages 指向 docs）。
3. 仓库 Settings → Pages → 选分支与目录 → Save。
4. 几分钟后得到地址 `https://你的用户名.github.io/FilmCollector/`。
5. 订阅地址即：`https://你的用户名.github.io/FilmCollector/subscribe.json`

## 方式二：Codeberg Pages

1. 新建仓库，把 `tvbox-dist/` 全部文件推上去。
2. 仓库 Settings → Pages → 选分支（如 `main`）→ Save。
3. 地址形如 `https://你的用户名.codeberg.page/仓库名/`。

## 方式三：Gitee Pages

1. 新建仓库，推送文件。
2. 服务 → Gitee Pages → 部署分支 → 启动。
3. 地址形如 `https://你的用户名.gitee.io/仓库名/`。

## 在电视端使用

- 打开任意 TVBox 基底软件（影视仓 / 猫影视 / TvBox / OK影视 / ZYPlayer 等）。
- 找到「订阅」或「配置」→ 添加订阅 → 粘贴上面的 `subscribe.json` 地址 → 确认。
- 也可在软件的「源管理 / 自定义接口」里直接填写 `api.js` 或 `data.json` 地址（见落地页）。
- **无需开你电脑、无需连你家 WiFi**，全球有网即可观看。

## 更新片库

重新在你电脑的采集工具里抓取 / 生成后，再跑一次上面的发布命令，
把新的 `tvbox-dist/` 重新上传覆盖即可（建议开启 Pages 的强制刷新 / 等几分钟 CDN 生效）。
