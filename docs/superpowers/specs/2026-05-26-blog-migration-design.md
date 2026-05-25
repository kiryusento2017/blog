# 终末诗篇的博客 — 迁移设计方案

## 目标

将 Claude Design 生成的 React SPA 原型（`design-reference/`）迁移到生产级 Astro 静态博客，保留视觉设计，提升加载速度和可维护性。

## 技术栈

- **框架：** Astro 6.3.7 + `@astrojs/react` 5.0.5
- **内容管理：** Astro Content Collections（Markdown）
- **交互组件：** React 19 Islands（搜索框、归档筛选）
- **样式：** 原型 CSS 改造版
- **暗色模式：** CSS `@media (prefers-color-scheme: dark)` 跟随系统

## 页面清单（4 个）

| 页面 | 路由 | 说明 |
|------|------|------|
| 首页 | `/` | 展示文章列表、分类导航 |
| 归档 | `/archive` | 按年份分组，支持分类筛选 |
| 关于我 | `/about` | 个人简介 |
| 文章详情 | `/posts/[slug]` | 单篇正文，含目录与进度条 |

## 文件结构

```
Personal blog/
├── src/
│   ├── content.config.ts     ← Content Collections schema
│   ├── content/
│   │   └── posts/             ← 文章 Markdown 文件
│   ├── components/
│   │   ├── TopBar.astro       ← 顶部导航
│   │   ├── Footer.astro       ← 页脚
│   │   ├── SearchBox.tsx      ← 搜索框（React Island）
│   │   └── ArchiveFilter.tsx  ← 归档筛选（React Island）
│   ├── layouts/
│   │   └── BaseLayout.astro   ← 全局布局（head、字体、CSS）
│   ├── pages/
│   │   ├── index.astro        ← 首页
│   │   ├── archive.astro      ← 归档
│   │   ├── about.astro        ← 关于
│   │   └── posts/
│   │       └── [slug].astro   ← 文章详情（动态路由）
│   └── styles/
│       └── global.css         ← 原型 CSS 改造版
├── design-reference/          ← 原型参考（不动）
├── public/                    ← 静态资源
├── astro.config.mjs           ← 已配 react()
├── package.json               ← 已改名为 zhongmo-shijian
└── tsconfig.json              ← 已配 jsx: "react-jsx"
```

## CSS 迁移方案

原型中 8 处 `body[data-mode="dim"]` 替换为 `@media (prefers-color-scheme: dark)`：

| 行号（styles.css） | 内容 |
|----|------|
| 27-39 | `:root` 暗色变量定义 |
| 74-77 | 颗粒效果混合模式 |
| 488 | featured-card code-peek 背景 |
| 886 | article-body pre 背景 |
| 897 | code .s 颜色（字符串） |
| 900 | code .f 颜色（函数） |
| 911 | 行内 code 背景 |
| 921 | callout 背景 |

纸张颗粒 `body[data-grain="on"]` 保留，改为默认开启。

## 数据流

1. 文章存为 `src/content/posts/*.md`，frontmatter 按照 `config.ts` schema
2. Astro Content Collections 提供 `getCollection('posts')` 查询
3. 静态页面（首页、归档列表）在构建时获取数据
4. React Islands 通过 props 接收过滤后的数据，不再使用 `window.ENTRIES`

## 交互组件清单

### 需保留（改为 React Islands）

- **ArchiveFilter**：分类筛选 tab + 列表（传递 `entries` props 替代 `window.ENTRIES`）
- **SearchBox**：搜索框（传递 `entries` props 替代 `window.ENTRIES`）

### 需完全删除

- `tweaks-panel.jsx` 全部
- `SearchOverlay` 组件
- `AccentPicker` 组件
- `ReactDOM.createRoot` 直接挂载
- `App` 组件的 SPA 路由逻辑

### 改为原生 JS

- `useReveal`（IntersectionObserver 动画）— 移入 BaseLayout `<script>`
- `WordReveal`（逐字渐入）— Astro 模板替代
- 阅读进度条 — 原生 JS 监听 scroll

## 文章 Markdown 格式

每篇文章一个 `.md` 文件：

```markdown
---
title: 用了半年 RSC
titleEm: 之后
date: 2026-05-21
category: 技术
tags: [React, Next.js, 架构]
description: Server Components 不是银弹，但...
readTime: 12 min
words: 4280
featured: true
num: "Nº 047"
---

正文内容...

> 引用内容

> TIP：提示内容

## 01 章节标题
```

## 风险与应对

| 风险 | 应对 |
|------|------|
| 文章 callout 格式 | Markdown 引用 `> TIP:` 配合 CSS 特殊样式 |
| 首字下沉 | CSS `:first-of-type::first-letter` 自动处理（样式已存在） |
| 标题斜体分段 | frontmatter `title` + `titleEm` 拼接渲染 |
| 严格 TypeScript | React 组件需显式 props 接口 |

## 分步实施顺序

1. CSS 搬入 → 暗色模式改造
2. 创建 BaseLayout 框架（head、字体、导航、页脚）
3. 搭建首页（静态内容，不依赖 React）
4. 搭建关于我页面
5. 迁移 1 篇文章做 Content Collections 验证
6. 搭建文章详情页（动态路由 + MD 渲染）
7. 搭建归档页（Astro 部分）
8. 写 ArchiveFilter React Island
9. 写 SearchBox React Island
10. 迁移剩余所有文章
11. 构建测试（`astro build`）
