# 终末诗篇

个人技术博客，记录家庭数据中心搭建全过程。基于 Astro 6 构建，纸张质感排版，支持明暗模式。

## 内容

20 篇文章，主题涵盖 PVE 虚拟化、LXC 容器、数据库、NAS、家庭影音、智能家居、IPTV、VPS 节点等。

## 技术栈

- [Astro 6](https://astro.build) — 静态站点框架，Content Collections 管理文章
- React 19 — 归档页筛选 + 搜索组件（Islands 架构，`client:load`）
- 纯 CSS — 手写样式，自定义属性驱动，纸张 + 墨水质感
- TypeScript

## 功能

- 文章页：阅读进度条、代码块复制按钮、目录导航
- 归档页：分类筛选 + 按年分组 + 搜索
- SEO：sitemap、RSS、OG 社交分享图、robots.txt
- 移动端：汉堡菜单导航
- 明暗模式自动切换

## 项目结构

```
src/
├── content/posts/     # 文章 Markdown（001-020）
├── components/        # Astro & React 组件
├── layouts/           # 页面布局
├── pages/             # 路由页面
└── styles/            # 全局样式
public/                # 静态资源（favicon、OG 图、apple-touch-icon）
```

## 本地开发

```sh
npm install
npm run dev -- --host 0.0.0.0    # Windows 需显式绑定 IPv4
npm run build                    # 构建到 ./dist/
npm run preview                  # 本地预览构建结果
```

## 写文章

在 `src/content/posts/` 下新建 Markdown 文件：

```yaml
---
title: 家庭数据中心 PVE
titleEm: 副标题
date: 2026-05-26
category: 技术        # 技术 / 工具 / 生活 / 阅读
tags: [PVE, Docker]
description: 一句话简介
readTime: 8 min
words: 1200
featured: false
num: "Nº 021"
---
```

## 部署

```powershell
# 1. 构建
npm run build

# 2. 推到 deploy 分支
$tmp = "$env:TEMP\blog-deploy"
Remove-Item -Recurse -Force $tmp -ErrorAction SilentlyContinue
New-Item -ItemType Directory $tmp | Out-Null
Copy-Item -Recurse "dist\*" $tmp
cd $tmp
git init
git add -A
git commit -m "deploy"
git remote add origin https://github.com/kiryusento2017/blog.git
git push --force origin HEAD:deploy
```

```bash
# 服务器更新
cd /var/www/blog && git fetch origin && git reset --hard origin/deploy
```
