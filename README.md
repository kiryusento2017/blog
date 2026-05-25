# 终末诗篇

个人博客，基于 Astro 6 构建。白天写 TypeScript，晚上写中文。

## 技术栈

- [Astro 6](https://astro.build) — 静态站点框架，Content Collections 管理文章
- React 19 — 归档页筛选等交互组件（Islands 架构）
- 纯 CSS — 无 Tailwind，手写样式，纸张质感排版
- TypeScript

## 项目结构

```
src/
├── content/posts/     # 文章 Markdown 文件
├── components/        # Astro & React 组件
├── layouts/           # 页面布局
├── pages/             # 路由页面
└── styles/            # 全局样式
design-reference/      # 原始 React SPA 设计稿（参考用）
```

## 本地开发

```sh
npm install
npm run dev       # 开发服务器 localhost:4321
npm run build     # 构建生产版本到 ./dist/
npm run preview   # 本地预览构建结果
```

## 写文章

在 `src/content/posts/` 下新建 Markdown 文件，frontmatter 格式：

```yaml
---
title: 文章主标题
titleEm: 斜体副标题（可选）
date: 2026-05-26
category: 技术        # 技术 / 工具 / 生活 / 阅读
tags: [标签一, 标签二]
description: 一句话简介
readTime: 8 min
words: 1200
featured: false
num: "Nº 001"
---
```
