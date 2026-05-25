# 终末诗篇的博客 — 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 Claude Design 原型（React SPA）迁移到 Astro 6 生产级静态博客，包含首页、归档、关于、文章详情 4 个页面。

**Architecture:** Astro 6.3.7 + React 19 Islands。静态页面用 `.astro` 组件预渲染为 HTML，交互组件（搜索框、归档筛选）用 React Island 按需加载。文章用 Astro Content Collections + Markdown 管理。暗色模式通过 CSS `prefers-color-scheme` 跟随系统。

**Tech Stack:** Astro 6.3.7, React 19.2.6, TypeScript (strict), CSS (prototype), Content Collections (glob loader)

---

## Task 1: CSS 迁移 — global.css

**Files:**
- Create: `src/styles/global.css`

复制 `design-reference/styles.css`，做以下 3 处改动：

### Step 1: 复制 CSS 文件

```bash
cp "d:/vs code projects/Personal blog/design-reference/styles.css" "d:/vs code projects/Personal blog/src/styles/global.css"
```

### Step 2: 替换暗色模式变量定义（第 27-39 行）

将：
```css
body[data-mode="dim"] {
  --bg: #15130f;
  --bg-deep: #0e0c09;
  --bg-card: #1c1a15;
  --ink: #ede4d3;
  --ink-soft: #b8ac95;
  --ink-faint: #7a715f;
  --ink-fainter: #4a4338;
  --rule: #2e2a25;
  --rule-soft: #221f1b;
  --accent: #d4a574;
  --accent-soft: #b08555;
}
```

改为：
```css
@media (prefers-color-scheme: dark) {
  :root {
    --bg: #15130f;
    --bg-deep: #0e0c09;
    --bg-card: #1c1a15;
    --ink: #ede4d3;
    --ink-soft: #b8ac95;
    --ink-faint: #7a715f;
    --ink-fainter: #4a4338;
    --rule: #2e2a25;
    --rule-soft: #221f1b;
    --accent: #d4a574;
    --accent-soft: #b08555;
  }
}
```

### Step 3: 替换暗色模式下的 7 处样式覆盖

将 `body[data-mode="dim"]` 开头的选择器全部改为 `@media (prefers-color-scheme: dark)` 包裹：

第 74-77 行 — 颗粒效果：
```css
/* 原来: body[data-mode="dim"][data-grain="on"]::before */
@media (prefers-color-scheme: dark) {
  body[data-grain="on"]::before {
    mix-blend-mode: screen;
    opacity: 0.3;
  }
}
```

第 488 行 — featured-card code-peek：
```css
/* 原来: body[data-mode="dim"] .featured-card .code-peek */
@media (prefers-color-scheme: dark) {
  .featured-card .code-peek { background: rgba(255,255,255,0.04); }
}
```

第 886 行 — article-body pre：
```css
/* 原来: body[data-mode="dim"] .article-body pre */
@media (prefers-color-scheme: dark) {
  .article-body pre { background: rgba(255,255,255,0.04); }
}
```

第 897 行 — code .s：
```css
@media (prefers-color-scheme: dark) {
  .article-body pre .s { color: #93e07f; }
}
```

第 900 行 — code .f：
```css
@media (prefers-color-scheme: dark) {
  .article-body pre .f { color: #82d4ff; }
}
```

第 911 行 — 行内 code：
```css
@media (prefers-color-scheme: dark) {
  .article-body code:not(pre code) { background: rgba(255,255,255,0.06); }
}
```

第 921 行 — callout：
```css
@media (prefers-color-scheme: dark) {
  .article-body .callout { background: rgba(212, 165, 116, 0.08); }
}
```

### Step 4: 确认改动

```bash
grep -c "body\[data-mode" "d:/vs code projects/Personal blog/src/styles/global.css"
```
预期：0（所有 `body[data-mode]` 都已替换）

### Step 5: Commit

```bash
git add src/styles/global.css
git commit -m "feat: 迁移原型 CSS，暗色模式改为 prefers-color-scheme"

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
```

---

## Task 2: BaseLayout — 全局布局框架

**Files:**
- Create: `src/layouts/BaseLayout.astro`

```astro
---
export interface Props {
  title: string;
  description?: string;
}
const { title, description = '终末诗篇的博客 — 技术、工具、生活' } = Astro.props;
---
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="icon" href="/favicon.ico" />
    <meta name="theme-color" content="#efeae0" />
    <title>{title}</title>
    <meta name="description" content={description} />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Newsreader:ital,opsz,wght@0,6..72,300;0,6..72,400;0,6..72,500;0,6..72,600;1,6..72,300;1,6..72,400&family=JetBrains+Mono:wght@300;400;500&display=swap" />
    <style is:global>
      @import "/src/styles/global.css";
    </style>
  </head>
  <body data-grain="on">
    <div class="shell">
      <slot />
    </div>
    <script>
      // Scroll reveal — vanilla JS replacement for useReveal
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add('in');
              observer.unobserve(e.target);
            }
          });
        },
        { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
      );
      document.querySelectorAll('.reveal, .reveal-word').forEach((el) => observer.observe(el));
    </script>
  </body>
</html>
```

### Step 2: 验证

```bash
npx astro build
```
预期：构建成功。

### Step 3: Commit

---

## Task 3: TopBar — 导航组件

**Files:**
- Create: `src/components/TopBar.astro`

```astro
---
const currentPath = Astro.url.pathname;

const links = [
  { href: '/', label: '首页' },
  { href: '/archive', label: '归档' },
  { href: '/about', label: '关于' },
];
---
<header class="topbar">
  <a class="brand" href="/">
    <span class="glyph">终末诗篇</span>
    <span class="sub">A blog · since 2026</span>
  </a>
  <nav class="nav">
    {links.map(({ href, label }) => (
      <a
        class="link"
        href={href}
        data-active={currentPath === href ? 'true' : 'false'}
      >
        {label}
      </a>
    ))}
  </nav>
</header>
```

### Step 1: 验证

```bash
npx astro build
```

### Step 2: Commit

---

## Task 4: Footer — 页脚组件

**Files:**
- Create: `src/components/Footer.astro`

```astro
<footer class="foot">
  <div class="left">
    终末诗篇 · 一个开发者的笔记本 · Set in Instrument Serif &amp; Newsreader<br />
    从二〇二六开始，写给未来的自己。
  </div>
  <div class="right">
    MMXXVI
  </div>
</footer>
```

### Step 1: 验证

```bash
npx astro build
```

### Step 2: Commit

---

## Task 5: 首页 — index.astro

**Files:**
- Modify: `src/pages/index.astro`

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import TopBar from '../components/TopBar.astro';
import Footer from '../components/Footer.astro';
import { getCollection } from 'astro:content';

const allPosts = await getCollection('posts');
const sorted = allPosts.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
const featured = sorted.find(p => p.data.featured) || sorted[0];
const recent = sorted.filter(p => p.id !== featured.id).slice(0, 6);
---

<BaseLayout title="终末诗篇的博客">
  <TopBar />

  <main>
    <!-- Hero -->
    <section class="hero">
      <div class="eyebrow">
        <span class="pulse"></span>
        <span>终末诗篇</span>
        <span class="dash"></span>
        <span>2026 至今</span>
      </div>
      <h1>
        一个技术人<br />
        <span class="em">的笔记本</span>
      </h1>
      <p class="dek">
        代码、工具、生活。一个公开的笔记本，更像是写给一年后的自己看。
      </p>
    </section>

    <!-- Featured -->
    <section class="section">
      <div class="section-head">
        <div class="left">
          <span class="num">/ 01</span>
          <h2>最新一篇 <span class="em">· latest</span></h2>
        </div>
        <a class="right" href={`/posts/${featured.id}`}>
          <span>开始阅读</span>
          <span class="arrow"></span>
        </a>
      </div>

      <div class="featured">
        <a class="featured-card" href={`/posts/${featured.id}`}>
          <div class="left-col">
            <div class="cat-row">
              <span>{featured.data.category}</span>
              <span>·</span>
              <span>{featured.data.tags.join(' / ')}</span>
            </div>
            <h3>
              {featured.data.title}
              {featured.data.titleEm && <><br /><span class="em">{featured.data.titleEm}</span></>}
            </h3>
            <p class="dek">{featured.data.description}</p>
            <div class="read">
              <span>阅读全文</span>
              <span class="arr"></span>
            </div>
          </div>
          <div class="meta-side">
            <div class="row">
              <div class="k">阅读时间</div>
              <div class="v">{featured.data.readTime || '—'}</div>
            </div>
            <div class="row">
              <div class="k">字数</div>
              <div class="v mono">{featured.data.words?.toLocaleString() || '—'}</div>
            </div>
          </div>
        </a>
      </div>
    </section>

    <!-- Recent grid -->
    <section class="section">
      <div class="section-head">
        <div class="left">
          <span class="num">/ 02</span>
          <h2>近期 <span class="em">· recent</span></h2>
        </div>
        <a class="right" href="/archive">
          <span>所有 {sorted.length} 篇</span>
          <span class="arrow"></span>
        </a>
      </div>

      <div class="grid">
        {recent.map((post) => (
          <a class="grid-item" href={`/posts/${post.id}`}>
            <div class="top">
              <span class="date">{post.data.date.toISOString().slice(0, 10)}</span>
            </div>
            <h4>
              {post.data.title}
              {post.data.titleEm && <> <span class="em">{post.data.titleEm}</span></>}
            </h4>
            <div class="exc">{post.data.description}</div>
            <div class="foot">
              <span>{post.data.category}</span>
              <span>{post.data.readTime || ''}</span>
            </div>
          </a>
        ))}
      </div>
    </section>
  </main>

  <Footer />
</BaseLayout>
```

### Step 1: 验证

```bash
npx astro build
```

### Step 2: Commit

---

## Task 6: 关于我 — about.astro

**Files:**
- Create: `src/pages/about.astro`

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import TopBar from '../components/TopBar.astro';
import Footer from '../components/Footer.astro';
---

<BaseLayout title="关于 — 终末诗篇">
  <TopBar />

  <main class="colophon">
    <h1>
      关 <span class="em">于</span>
    </h1>
    <div class="col-body">
      <p>
        这是一个开发者写给自己看的地方。大部分文字都是在夜里写下的。
        我不打算把它做成任何意义上的"内容"，它更像一间私人的书房。
      </p>
      <p>
        白天写 TypeScript，晚上写中文。这两件事看起来不一样，但其实都是在练习同一件事——把混乱的东西想清楚，并且写下来。
      </p>
    </div>
  </main>

  <Footer />
</BaseLayout>
```

### Step 1: 验证

```bash
npx astro build
```
确认 `/about/index.html` 生成。

### Step 2: Commit

---

## Task 7: 第一篇文章 — Content Collections 验证

**Files:**
- Create: `src/content/posts/001-rsc-after-half-year.md`

```markdown
---
title: 用了半年 RSC
titleEm: 之后
date: 2026-05-21
category: 技术
tags: [React, Next.js, 架构]
description: Server Components 不是银弹，但它确实改变了我思考前端边界的方式。
readTime: 12 min
words: 4280
featured: true
num: "Nº 047"
---

去年十一月，我把一个中型 dashboard 迁移到 App Router，全量启用 RSC。半年过去了，团队从最初的怀疑变成了基本依赖。但这条路远不像官方文档里那么平滑——这篇是把踩过的坑和真正赚到的东西一起写下来。


**经验值**：能不能直接 await 取数，往往是判断「需不需要 use client」的最有用启发式。


## 01 心智模型的转变

我以前会下意识地问：「这个组件要不要 useEffect 去拉数据？」现在我会先问：「这个组件能不能不变成 client component？」这两个问题的方向是反的。

> "RSC 真正的价值不在性能，而在于它让数据获取和组件树第一次成为同一件事。"

## 02 三个用得最顺手的模式

经过几次重构，下面三个模式在我手上沉淀下来：

```
// 模式 1：把 client component 当作 "shell"
<UploadProvider>           // 'use client'
  <UploadList items={...} /> // server
</UploadProvider>
```

客户端组件做交互、状态、表单；服务端组件喂数据。

## 03 踩过的真坑

Server Actions 的 revalidation 行为非常依赖你对缓存层的理解。在 Next.js 里 cache 不是一层而是四层（fetch、Router、Full Route、Data），错位调试会让你怀疑人生。

## 04 如果让我再选一次

会。即便有一切折腾，最终代码量减少了大概 30%。但我不会建议任何团队为了「跟上潮流」迁。RSC 真正适合的是数据驱动密度高的场景。
```

### Step 1: 验证构建

```bash
npx astro build
```
预期：`/posts/001-rsc-after-half-year/` 页面生成（需先有 posts/[slug].astro，此时暂无，仅验证内容同步无误）

### Step 2: 确认内容同步

```bash
npx astro check
```
预期：0 errors, 0 warnings

### Step 3: Commit

---

## Task 8: 文章详情页 — [slug].astro

**Files:**
- Create: `src/pages/posts/[slug].astro`

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
const { title, titleEm, date, category, tags, readTime, num } = post.data;
const dateFormatted = date.toLocaleDateString('zh-CN', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});
---

<BaseLayout title={`${title}${titleEm || ''} — 终末诗篇`}>
  <TopBar />

  <main class="article">
    <article class="article-body">
      <div class="eyebrow">
        <span class="dot"></span>
        <span>{category}</span>
        <span>·</span>
        <span>{readTime} 阅读</span>
      </div>

      <h1>
        {title}
        {titleEm && <><br /><span class="em">{titleEm}</span></>}
      </h1>

      <p class="dek">{post.data.description}</p>

      <div class="meta-strip">
        {tags.map((t: string) => (
          <span key={t} class="pill">{t}</span>
        ))}
      </div>

      <div class="content" set:html={post.body} />

      <div class="article-end">· · ·</div>
    </article>
  </main>

  <Footer />
</BaseLayout>
```

### Step 1: 验证

```bash
npx astro build
```
预期：`/posts/001-rsc-after-half-year/index.html` 生成。

### Step 2: 启动预览

```bash
npx astro dev
```
浏览器访问 `http://localhost:4321/posts/001-rsc-after-half-year`，确认文章内容正常渲染。

### Step 3: Commit

---

## Task 9: 归档页 — archive.astro

**Files:**
- Create: `src/pages/archive.astro`

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import TopBar from '../components/TopBar.astro';
import Footer from '../components/Footer.astro';
import ArchiveFilter from '../components/ArchiveFilter';
import { getCollection } from 'astro:content';

const allPosts = await getCollection('posts');
const sorted = allPosts.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());

// Group by year
const grouped: Record<number, typeof sorted> = {};
for (const post of sorted) {
  const year = post.data.date.getFullYear();
  (grouped[year] ||= []).push(post);
}
---

<BaseLayout title="归档 — 终末诗篇">
  <TopBar />

  <main>
    <section class="hero" style="padding-top: 12vh; padding-bottom: 8vh;">
      <div class="eyebrow">
        <span class="dash"></span>
        <span>Archive · 归档</span>
        <span class="dash"></span>
      </div>
      <h1>所有<br /><span class="em">写过的</span></h1>
      <p class="dek">一共 {sorted.length} 篇。</p>
    </section>

    <section class="section">
      <ArchiveFilter posts={sorted} client:load />

      {Object.entries(grouped).map(([year, items]) => (
        <div class="year-group">
          <div class="year">{year}</div>
          <div class="list">
            {items.map((post) => (
              <a class="row" href={`/posts/${post.id}`}>
                <div class="date">
                  {post.data.date.toISOString().slice(0, 10)}
                </div>
                <div class="title">
                  {post.data.title}
                  {post.data.titleEm && <> <span class="em">{post.data.titleEm}</span></>}
                </div>
                <div class="tag">{post.data.category}</div>
              </a>
            ))}
          </div>
        </div>
      ))}
    </section>
  </main>

  <Footer />
</BaseLayout>
```

### Step 1: 验证

```bash
npx astro build
```
预期：`/archive/index.html` 生成。

### Step 2: Commit

---

## Task 10: ArchiveFilter — React Island

**Files:**
- Create: `src/components/ArchiveFilter.tsx`

```tsx
import { useState, useMemo } from 'react';
import type { CollectionEntry } from 'astro:content';

const FILTERS = ['全部', '技术', '工具', '生活', '阅读'];

interface Props {
  posts: CollectionEntry<'posts'>[];
}

export default function ArchiveFilter({ posts }: Props) {
  const [active, setActive] = useState('全部');

  const filtered = useMemo(() => {
    if (active === '全部') return posts;
    return posts.filter(p => p.data.category === active);
  }, [active, posts]);

  const grouped = useMemo(() => {
    const map: Record<number, CollectionEntry<'posts'>[]> = {};
    for (const post of filtered) {
      const year = post.data.date.getFullYear();
      (map[year] ||= []).push(post);
    }
    return Object.entries(map).sort((a, b) => Number(b[0]) - Number(a[0]));
  }, [filtered]);

  return (
    <>
      <div class="filter">
        <span class="label">筛选 · Filter</span>
        {FILTERS.map((f) => (
          <button
            key={f}
            class={`pill ${active === f ? 'active' : ''}`}
            data-active={active === f}
            onClick={() => setActive(f)}
          >
            {f}
          </button>
        ))}
      </div>

      {grouped.map(([year, items]) => (
        <div key={year} class="year-group">
          <div class="year">{year}</div>
          <div class="list">
            {items.map((post) => (
              <a key={post.id} class="row" href={`/posts/${post.id}`}>
                <div class="date">
                  {post.data.date.toISOString().slice(0, 10)}
                </div>
                <div class="title">
                  {post.data.title}
                  {post.data.titleEm && <> <span class="em">{post.data.titleEm}</span></>}
                </div>
                <div class="tag">{post.data.category}</div>
              </a>
            ))}
          </div>
        </div>
      ))}
    </>
  );
}
```

### Step 1: 修复 archive.astro — 移除重复的列表渲染

归档页现在完全交给 `ArchiveFilter` 渲染列表，移除 `archive.astro` 中的 `year-group` 部分。

### Step 2: 验证

```bash
npx astro build
```
预期：构建成功，React Island 在客户端水合。

### Step 3: Commit

---

## Task 11: SearchBox — React Island

**Files:**
- Create: `src/components/SearchBox.tsx`

```tsx
import { useState, useMemo } from 'react';
import type { CollectionEntry } from 'astro:content';

interface Props {
  posts: CollectionEntry<'posts'>[];
}

export default function SearchBox({ posts }: Props) {
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return posts.filter(
      (p) =>
        p.data.title.toLowerCase().includes(q) ||
        (p.data.titleEm?.toLowerCase().includes(q)) ||
        p.data.description.toLowerCase().includes(q) ||
        p.data.tags.some((t) => t.toLowerCase().includes(q))
    ).slice(0, 8);
  }, [query, posts]);

  return (
    <div class="search-container" style={{ position: 'relative' }}>
      <input
        type="search"
        class="search-input"
        placeholder="搜索文章..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{
          font: 'var(--f-body)',
          padding: '8px 14px',
          border: '1px solid var(--rule)',
          borderRadius: 4,
          background: 'var(--bg-card)',
          color: 'var(--ink)',
          width: '200px',
        }}
      />
      {results.length > 0 && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            width: '360px',
            background: 'var(--bg)',
            border: '1px solid var(--rule)',
            borderRadius: 4,
            marginTop: 4,
            zIndex: 50,
            maxHeight: '60vh',
            overflowY: 'auto',
          }}
        >
          {results.map((p) => (
            <a
              key={p.id}
              href={`/posts/${p.id}`}
              style={{
                display: 'block',
                padding: '12px 16px',
                borderBottom: '1px solid var(--rule)',
                color: 'var(--ink)',
                textDecoration: 'none',
              }}
            >
              <div style={{ fontFamily: 'var(--f-display)', fontSize: 18 }}>
                {p.data.title}
                {p.data.titleEm && <> · {p.data.titleEm}</>}
              </div>
              <div style={{
                fontFamily: 'var(--f-mono)',
                fontSize: 10,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: 'var(--ink-faint)',
                marginTop: 4,
              }}>
                {p.data.category} · {p.data.date.toISOString().slice(0, 10)}
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
```

### Step 1: 在 TopBar 中插入 SearchBox

修改 `src/components/TopBar.astro`，在 nav 结束标签前添加：

```astro
<SearchBox posts={allPosts} client:load />
```

同时 TopBar 需要接收 `posts` prop 并传给 SearchBox。更新 TopBar.astro：

```astro
---
import SearchBox from './SearchBox';
import type { CollectionEntry } from 'astro:content';

interface Props {
  posts: CollectionEntry<'posts'>[];
}

const { posts } = Astro.props;
const currentPath = Astro.url.pathname;
// ... 其余不变
---
<!-- 在 nav 内添加 -->
<SearchBox posts={posts} client:load />
```

### Step 2: 更新所有使用 TopBar 的页面传入 posts prop

- `src/pages/index.astro`：`<TopBar posts={sorted} />`
- `src/pages/archive.astro`：`<TopBar posts={sorted} />`
- `src/pages/about.astro`：无需 posts（about 传递空数组或设为可选）
- `src/pages/posts/[slug].astro`：页面内获取 posts 后传入

### Step 3: 验证

```bash
npx astro build
```
预期：构建成功。

### Step 4: Commit

---

## Task 12: 迁移剩余 11 篇文章

**Files:**
- Create: `src/content/posts/002-cloudflare-workers-rss.md`
- Create: `src/content/posts/003-why-i-switched-back-to-vim.md`
- Create: `src/content/posts/004-debugging-at-coffee-shop.md`
- Create: `src/content/posts/005-vscode-workflow-extensions.md`
- Create: `src/content/posts/006-two-weeks-in-kyoto.md`
- Create: `src/content/posts/007-claude-haiku-experience.md`
- Create: `src/content/posts/008-type-safe-env-vars.md`
- Create: `src/content/posts/009-morning-journal.md`
- Create: `src/content/posts/010-last-train-christmas-eve.md`
- Create: `src/content/posts/011-rereading-proust.md`
- Create: `src/content/posts/012-after-frost-descent.md`

每篇文章格式参照 Task 7 的 `001`，从 `design-reference/entries.jsx` 提取数据。slug 用 id + 简短英文描述。

### Step 1: 验证所有文章通过类型检查

```bash
npx astro check
```
预期：0 errors, 0 warnings

### Step 2: 验证完整构建

```bash
npx astro build
```
预期：所有 12 篇文章页面 + 首页 + 归档 + 关于 = 15 个静态页面。

### Step 3: Commit

---

## Task 13: 最终验证 — 启动开发服务器全流程测试

### Step 1: 启动 dev server

```bash
npm run dev
```

### Step 2: 在浏览器中依次确认：
1. `http://localhost:4321/` — 首页正常，featured + grid 显示
2. `http://localhost:4321/archive` — 归档页正常，筛选可用
3. `http://localhost:4321/about` — 关于页正常
4. `http://localhost:4321/posts/001-rsc-after-half-year` — 文章页正常，Markdown 渲染正确
5. 搜索框可输入并显示结果

### Step 3: 验证暗色模式

切换系统暗色模式（或浏览器 DevTools → 模拟 `prefers-color-scheme: dark`），确认页面自动切换。

### Step 4: 运行最终构建

```bash
npm run build
```
确认 dist/ 目录包含所有静态 HTML 和 CSS。

### Step 5: Commit

```bash
git add .
git commit -m "feat: 完成全部文章迁移，博客可投产

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## 文件创建/修改清单

| 文件 | 操作 |
|------|------|
| `src/styles/global.css` | 创建（从 design-reference 复制 + 改造） |
| `src/layouts/BaseLayout.astro` | 创建 |
| `src/components/TopBar.astro` | 创建 |
| `src/components/Footer.astro` | 创建 |
| `src/pages/index.astro` | 覆盖 |
| `src/pages/about.astro` | 创建 |
| `src/pages/archive.astro` | 创建 |
| `src/pages/posts/[slug].astro` | 创建 |
| `src/components/ArchiveFilter.tsx` | 创建 |
| `src/components/SearchBox.tsx` | 创建 |
| `src/content/posts/001-012` | 创建 12 个 md 文件 |
