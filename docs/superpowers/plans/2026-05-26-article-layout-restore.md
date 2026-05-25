# 文章页三栏布局还原 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 `[slug].astro` 文章页恢复为原始设计的三栏布局（左侧元数据栏 + 中间正文 + 右侧目录栏），并补全上一篇 / 下一篇导航。

**Architecture:** 只改 `src/pages/posts/[slug].astro` 一个文件。左侧栏渲染 frontmatter 元数据，右侧栏从 `post.rendered.metadata.headings` 提取 H2 作为 TOC，所有 CSS（`.article-rail`、`.toc-item` 等）已在 `src/styles/global.css` 中定义完毕，无需动样式文件。

**Tech Stack:** Astro 6（content layer，glob loader），`post.rendered.metadata.headings`（MarkdownHeading[]），内联样式做上一篇 / 下一篇（与原始设计保持一致）

---

## 文件结构

```
src/pages/posts/[slug].astro   ← 唯一修改文件
src/styles/global.css          ← 只读参考，不改
design-reference/views.jsx     ← 只读参考，不改（ArticleView 第 374–470 行为设计原型）
```

---

## Task 1: 替换 [slug].astro 为完整三栏布局

**Files:**
- Modify: `src/pages/posts/[slug].astro`（全文替换）

**当前问题：**
- `<main class="article">` 内只有 `<article class="article-body">`，无左右 `<aside>`
- 三列网格 `minmax(200px,1fr) minmax(0,62ch) minmax(200px,1fr)` 中正文落入第一列，显示偏左
- 缺少上一篇 / 下一篇导航

- [ ] **Step 1: 全量替换文件内容**

将 `src/pages/posts/[slug].astro` 的完整内容替换为以下代码：

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import TopBar from '../../components/TopBar.astro';
import Footer from '../../components/Footer.astro';
import { getCollection } from 'astro:content';

export async function getStaticPaths() {
  const posts = await getCollection('posts');
  return posts.map((post) => ({
    params: { slug: post.id },
    props: { post },
  }));
}

const { post } = Astro.props;

const allPosts = await getCollection('posts');
const sorted = allPosts.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());

const { title, titleEm, date, category, tags, readTime, words, description, num } = post.data;

const idx = sorted.findIndex(p => p.id === post.id);
const prev = sorted[idx + 1];
const next = sorted[idx - 1];

const headings = (post.rendered?.metadata?.headings ?? []).filter(
  (h: { depth: number }) => h.depth === 2
);
const dateLong = date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
---

<BaseLayout title={`${title}${titleEm || ''} — 终末诗篇`}>
  <TopBar posts={sorted} />

  <main class="article">
    <aside class="article-rail left">
      {num && <div class="item"><div class="k">编号</div><div class="v">{num}</div></div>}
      <div class="item"><div class="k">日期</div><div class="v">{dateLong}</div></div>
      <div class="item"><div class="k">类目</div><div class="v">{category}</div></div>
      {words && <div class="item"><div class="k">字数</div><div class="v">{words.toLocaleString()}</div></div>}
      {readTime && <div class="item"><div class="k">阅读</div><div class="v">{readTime}</div></div>}
      {tags.length > 0 && (
        <div class="item" style="margin-top: 18px">
          <div class="k">标签</div>
          <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-top: 6px">
            {tags.map((t: string) => (
              <span class="pill" style="font-size: 9px; padding: 4px 8px">{t}</span>
            ))}
          </div>
        </div>
      )}
    </aside>

    <article class="article-body">
      <div class="eyebrow reveal">
        <span class="dot"></span>
        <span>{category}</span>
        <span>·</span>
        <span>{readTime} 阅读</span>
      </div>

      <h1 class="reveal" style="--rev-delay: 120ms">
        {title}
        {titleEm && <><br /><span class="em">{titleEm}</span></>}
      </h1>

      <p class="dek reveal" style="--rev-delay: 240ms">{description}</p>

      <div class="meta-strip reveal" style="--rev-delay: 360ms">
        {tags.map((tag: string) => (
          <span class="pill">{tag}</span>
        ))}
      </div>

      <div class="content" set:html={post.rendered?.html} />

      <div class="article-end reveal">· · ·</div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-top: 56px; padding-top: 28px; border-top: 1px solid var(--rule)">
        {prev ? (
          <a class="reveal" href={`/posts/${prev.id}`} style="text-decoration: none; color: inherit">
            <div style="font-family: var(--f-mono); font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--ink-faint); margin-bottom: 8px">← 上一篇</div>
            <div style="font-family: var(--f-display); font-size: 22px; line-height: 1.2">{prev.data.title}{prev.data.titleEm ? ` · ${prev.data.titleEm}` : ''}</div>
          </a>
        ) : <div />}
        {next ? (
          <a class="reveal" href={`/posts/${next.id}`} style="text-decoration: none; color: inherit; text-align: right">
            <div style="font-family: var(--f-mono); font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--ink-faint); margin-bottom: 8px">下一篇 →</div>
            <div style="font-family: var(--f-display); font-size: 22px; line-height: 1.2">{next.data.title}{next.data.titleEm ? ` · ${next.data.titleEm}` : ''}</div>
          </a>
        ) : <div />}
      </div>
    </article>

    <aside class="article-rail right">
      <div class="h">目录 · Contents</div>
      {headings.length > 0 ? headings.map((h: { slug: string; text: string }) => (
        <a class="toc-item" href={`#${h.slug}`}>
          <span class="n">/</span>
          <span>{h.text}</span>
        </a>
      )) : (
        <div style="font-size: 12px; color: var(--ink-faint); line-height: 1.6">
          这篇较短，没有分节。
        </div>
      )}
    </aside>
  </main>

  <Footer />
</BaseLayout>
```

- [ ] **Step 2: 在浏览器验证桌面端（宽屏 > 980px）**

访问 `http://localhost:4321/posts/013-pve-homelab-basics`，检查：
- [ ] 页面呈三栏结构：左侧元数据 | 中间正文 | 右侧目录
- [ ] 左栏显示：编号 Nº 013、日期、类目 技术、字数、阅读时长、标签（小 pill）
- [ ] 右栏显示 "目录 · Contents" + H2 列表（`## 零、前言` 和 `## 一、基础操作`）
- [ ] 正文居中、宽度约 62ch，不再偏左
- [ ] 底部显示上一篇 / 下一篇导航（013 是最新文章，"下一篇"一侧为空）

- [ ] **Step 3: 在浏览器验证移动端（< 980px）**

DevTools 切换到手机尺寸（如 iPhone 375px），检查：
- [ ] 左右侧边栏隐藏（CSS `display: none`）
- [ ] 正文独占全宽，无挤压

- [ ] **Step 4: 验证其他文章页正常**

访问 `http://localhost:4321/posts/001-rsc-after-half-year`，确认：
- [ ] 三栏结构同样正常
- [ ] 右侧目录栏若无 H2 则显示"这篇较短，没有分节。"

---

## 自检

**Spec 覆盖检查：**
- [x] 左侧栏：编号、日期、类目、字数、阅读、标签 ✓
- [x] 中间正文：eyebrow、h1、dek、meta-strip、content、article-end ✓
- [x] 右侧栏：TOC（H2 列表）或无分节提示 ✓
- [x] 上一篇 / 下一篇导航 ✓
- [x] 移动端侧边栏隐藏（依赖已有 CSS，无需新增）✓

**Placeholder 扫描：** 无 TBD / TODO，所有代码完整。

**一致性检查：**
- `post.rendered?.metadata?.headings` 类型为 `{ depth: number, slug: string, text: string }[]`，Task 1 中 filter 和 map 的类型标注一致
- `sorted` 在 `getStaticPaths` 外重新获取（Astro 静态生成限制），与原文件保持一致
