# PagePreview Theme Manager

该仓库用于快速创建和验收主题配色预览页面。当前以 **Vue 3 + Vite + TypeScript** 搭建，适合在独立分支中沉淀一套主题方案，再按需集成到 `main` 分支的主题管理器中。

## 当前内容

- 内置两套 Launcher 主题：浅色主题与深色主题。
- 复用同一组组件结构展示主题，方便确认「结构一致、体验一致」。
- 提供色板、组件按钮、卡片、底部导航和主题切换高亮，用于观察颜色层级、文字可读性、边框与强调色表现。
- 主题数据集中存放，后续新增主题只需补充 token 与预览说明。

## 技术栈

- [Vue 3](https://vuejs.org/)：预览页面组件化。
- [Vite](https://vite.dev/)：本地开发与构建。
- TypeScript：主题数据和组件 props 类型约束。

## 目录结构

```text
.
├── src
│   ├── components
│   │   ├── PalettePanel.vue     # 主题色板与说明
│   │   └── ThemePhone.vue       # Launcher 手机预览壳
│   ├── data
│   │   └── themes.ts            # 主题 token 与展示数据
│   ├── styles
│   │   └── base.css             # 全局布局与预览样式
│   ├── App.vue                  # 主题管理器与对比页面
│   └── main.ts                  # 应用入口
├── index.html
├── package.json
└── vite.config.ts
```

## 快速开始

```bash
npm install
npm run dev
```

默认开发服务会由 Vite 启动，可在终端输出的本地地址中查看页面。


## 新增：捕鱼达人路由 Demo

- 新增 `#/fish-hunter` 路由（Hash 路由方式，无需额外依赖），用于承载捕鱼达人玩法规划。
- 画布点击可发射捕鱼网弹体，弹体使用初速度 + 加速度更新轨迹，体现导弹式飞行。
- 海洋生物包含小丑鱼、海龟、鲨鱼三类，血量各不相同。
- 炮弹命中后按目标物种应用不同伤害值，并根据击杀目标累计分数。
- 继续沿用现有 GitHub Actions 工作流，可直接构建并部署到 GitHub Pages。
- 支持开始游戏、关卡推进、失败/通关状态、以及本地积分排行榜。
- 支持用户首次填写昵称（支持中文），并可将当前积分上传到 GitHub：自动创建新分支 `scores/<nickname>`，写入新路径新文件 `scores/<nickname>/latest-score.json`。

## 可用命令

```bash
npm run dev         # 启动本地开发预览
npm run build       # 生产构建
npm run preview     # 预览生产构建结果
npm run type-check  # TypeScript / Vue 类型检查
```

## GitHub Pages 自动发布

仓库已补充 GitHub Actions 工作流：`.github/workflows/github-pages.yml`。

- 当 `main` 分支有新的 push 时，会自动安装依赖、执行类型检查、构建 Vite 站点，并将 `dist` 发布到 GitHub Pages。
- 也可以在 GitHub Actions 页面通过 `workflow_dispatch` 手动触发发布。
- 工作流构建时会设置 `GITHUB_PAGES=true`，`vite.config.ts` 会据此自动将 `base` 调整为仓库名路径，避免项目 Pages 场景下静态资源路径错误。

> 使用前请在 GitHub 仓库设置中启用 Pages，并将 Source 设置为 **GitHub Actions**。

## 新增主题建议流程

1. 从 `main` 创建主题分支，例如：`theme/brand-spring`。
2. 在 `src/data/themes.ts` 中新增主题对象，至少包含：
   - `id`：唯一标识。
   - `name` / `label`：展示名称。
   - `cssVars`：预览组件使用的 CSS token。
   - `palette`：色板中展示的颜色 token。
3. 如需验证更多页面状态，可在 `src/components/ThemePhone.vue` 中增加对应组件片段，或新增独立预览组件。
4. 运行 `npm run type-check` 和 `npm run build`，确认类型与构建通过。
5. 与需求方确认截图或在线预览效果，再合并回 `main`。

## 主题 token 约定

当前手机预览组件使用以下 CSS 变量：

| Token | 用途 |
| --- | --- |
| `--background` | 手机屏幕背景 |
| `--card` | 卡片与容器底色 |
| `--button` | 按钮底色 |
| `--accent` | 强调色、图标色、选中态 |
| `--text` | 主文字颜色 |
| `--muted` | 次级文字颜色 |
| `--border` | 卡片与按钮边框 |
| `--phone-shell` | 手机外壳颜色 |
| `--soft-shadow` | 投影颜色 |
| `--button-shadow` | 按钮内阴影颜色 |

## 当前主题色值

### 浅色主题

| 名称 | 色值 |
| --- | --- |
| Background | `#F2F0EB` |
| Card | `#F8F6F1` |
| Button | `#F3E1C7` |
| Accent | `#E89A3C` |
| Text | `#2B2A29` |
| Muted | `#8A867F` |

### 深色主题

| 名称 | 色值 |
| --- | --- |
| Background | `#1B1916` |
| Card | `#24211E` |
| Button | `#342A20` |
| Accent | `#E89A3C` |
| Text | `#F3EFF8` |
| Muted | `#A49E95` |
