# 复制按钮修复 + 响应式全面适配 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 修复代码框复制按钮随横向滚动漂移的问题，并对手机/平板进行全面响应式适配。

**Architecture:** 四个文件改动——`global.css` 追加 CSS 规则（不改已有规则结构）；`[slug].astro` 替换 JS 注入脚本并修改一行模板；`Footer.astro` 和 `SearchBox.tsx` 各做一行 class 追加。

**Tech Stack:** Astro 6、纯 CSS（无框架）、React（SearchBox）、内联 `<script is:inline>`

---

## 文件改动地图

| 文件 | 改动性质 |
|------|----------|
| `src/styles/global.css` | 新增 `.code-wrap`；新增 `.post-nav` + `ul/ol/li`；补强 980px；新增 768px；补强 640px |
| `src/pages/posts/[slug].astro` | 替换第二个 `<script is:inline>` 的 forEach 函数体；第 81 行模板改 class |
| `src/components/Footer.astro` | `<footer>` 追加 `site-foot` class |
| `src/components/SearchBox.tsx` | 根 div 追加 `className="search-box-wrap"` |

---

## Task 1：组件层改动（Footer + SearchBox）

**Files:**
- Modify: `src/components/Footer.astro`
- Modify: `src/components/SearchBox.tsx`

- [ ] **Step 1：修改 Footer.astro**

将 `src/components/Footer.astro` 第 1 行：
```html
<footer class="foot">
```
改为：
```html
<footer class="foot site-foot">
```

- [ ] **Step 2：修改 SearchBox.tsx**

将 `src/components/SearchBox.tsx` 第 52 行：
```jsx
<div ref={ref} style={{ position: 'relative' }}>
```
改为：
```jsx
<div ref={ref} className="search-box-wrap" style={{ position: 'relative' }}>
```

- [ ] **Step 3：提交**

```bash
git add src/components/Footer.astro src/components/SearchBox.tsx
git commit -m "fix: Footer 追加 site-foot class，SearchBox 追加 search-box-wrap class"
```

---

## Task 2：[slug].astro — 模板改动（post-nav）

**Files:**
- Modify: `src/pages/posts/[slug].astro:81`

- [ ] **Step 1：替换上下篇导航容器**

将第 81 行：
```html
<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-top: 56px; padding-top: 28px; border-top: 1px solid var(--rule)">
```
改为：
```html
<div class="post-nav">
```
内层两个 `<a>` 子元素的内联样式（`text-decoration: none; color: inherit` 等）**保持不动**。

- [ ] **Step 2：提交**

```bash
git add src/pages/posts/[slug].astro
git commit -m "fix: 上下篇导航容器内联样式移入 CSS class"
```

---

## Task 3：[slug].astro — JS 脚本替换（code-wrap）

**Files:**
- Modify: `src/pages/posts/[slug].astro:135-194`

- [ ] **Step 1：替换第二个 script is:inline 里的 forEach 函数体**

找到文件中第二个 `<script is:inline>` 块（约第 135 行），将其中 `document.querySelectorAll('.content pre').forEach(function (pre) {` 到最后 `});` 的整段内容替换为：

```js
document.querySelectorAll('.content pre').forEach(function (pre) {
  var wrap = document.createElement('div');
  wrap.className = 'code-wrap';
  pre.parentNode.insertBefore(wrap, pre);
  wrap.appendChild(pre);

  var lang = pre.querySelector('.lang');
  var actions = document.createElement('div');
  actions.className = 'code-actions';

  if (lang) {
    pre.removeChild(lang);
    actions.appendChild(lang);
    var sep = document.createElement('span');
    sep.className = 'sep';
    sep.textContent = '·';
    actions.appendChild(sep);
  }

  var btn = document.createElement('button');
  btn.className = 'copy-btn';
  btn.textContent = 'COPY';
  btn.addEventListener('click', function () {
    var code = pre.querySelector('code');
    var text = (code ? code.innerText : pre.innerText).trim();

    function fallbackCopy() {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      if (document.execCommand('copy')) { onCopied(btn); }
      document.body.removeChild(ta);
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        onCopied(btn);
      }, function () {
        fallbackCopy();
      });
    } else {
      fallbackCopy();
    }
  });

  actions.appendChild(btn);
  wrap.appendChild(actions);
});
```

`onCopied(btn)` 函数定义在同一个 `(function () { ... })();` 的上方，闭包可访问，不需要改动。

- [ ] **Step 2：提交**

```bash
git add src/pages/posts/[slug].astro
git commit -m "fix: 复制按钮改用 code-wrap 包装层，修复横向滚动漂移"
```

---

## Task 4：global.css — 基础样式新增（code-wrap + post-nav + ul/ol/li）

**Files:**
- Modify: `src/styles/global.css`

- [ ] **Step 1：在 `.code-actions` 规则前新增 `.code-wrap`**

找到 global.css 中 `.code-actions {` 规则（约第 754 行），在其**正上方**插入：

```css
.code-wrap { position: relative; }
```

- [ ] **Step 2：从 `.article-body pre` 规则块删除 `position: relative`**

找到 `.article-body pre {` 规则块（第 719 行），将其中的 `position: relative;` 这一行**单独删除**，其余属性保持不变。

- [ ] **Step 3：在 `.article-end` 规则后新增 `.post-nav` 基础样式**

找到 `.article-end {` 规则（约第 853 行），在其**正下方**（`}` 闭合后）插入：

```css
.post-nav {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-top: 56px;
  padding-top: 28px;
  border-top: 1px solid var(--rule);
}
```

- [ ] **Step 4：在 `.post-nav` 规则后新增文章列表样式**

紧接 `.post-nav` 规则之后插入：

```css
.article-body ul,
.article-body ol { padding-left: 1.5em; margin: 1em 0 1.3em; }
.article-body li { margin-bottom: 0.35em; }
```

- [ ] **Step 5：提交**

```bash
git add src/styles/global.css
git commit -m "fix: 新增 code-wrap 定位、post-nav 基础样式、文章列表样式"
```

---

## Task 5：global.css — 980px 断点补强

**Files:**
- Modify: `src/styles/global.css` 中的 `@media (max-width: 980px)` 块

- [ ] **Step 1：在现有 980px 断点块末尾追加规则**

找到 `@media (max-width: 980px) {` 块（约第 912 行），在其末尾 `}` **之前**追加：

```css
  /* 汉堡菜单与导航下拉 */
  .hamburger { display: flex; }
  .topbar { position: relative; }
  .nav {
    position: absolute; top: 100%; left: 0; right: 0;
    flex-direction: column; align-items: stretch; gap: 0;
    background: var(--bg);
    border-bottom: 1px solid var(--rule-soft);
    box-shadow: 0 8px 24px rgba(0,0,0,0.08);
    padding: 8px var(--gutter) 16px;
    opacity: 0; transform: translateY(-8px);
    pointer-events: none;
    transition: opacity 0.2s, transform 0.2s;
    z-index: 99;
  }
  @media (prefers-color-scheme: dark) {
    .nav { box-shadow: 0 8px 24px rgba(0,0,0,0.3); }
  }
  .nav.mobile-open { opacity: 1; transform: translateY(0); pointer-events: auto; }
  .nav .link { padding: 14px 4px; font-size: 13px; border-bottom: 1px solid var(--rule-soft); }

  /* SearchBox 自适应宽度 */
  .nav .search-box-wrap { width: 100%; }
  .nav .search-box-wrap input[type="search"] { width: 100% !important; }
  .nav .search-box-wrap > div { width: 100% !important; right: 0; left: 0; }

  /* 归档列表三列 */
  .list .row { grid-template-columns: 110px 1fr 140px; }
```

- [ ] **Step 2：提交**

```bash
git add src/styles/global.css
git commit -m "fix: 980px 断点补强汉堡菜单、SearchBox 自适应、归档列表三列"
```

---

## Task 6：global.css — 768px 新断点

**Files:**
- Modify: `src/styles/global.css`

- [ ] **Step 1：在 `@media (max-width: 640px)` 之前插入新断点**

找到 `@media (max-width: 640px) {`（约第 921 行），在其**正上方**插入整段新断点：

```css
@media (max-width: 768px) {
  .hero h1 { font-size: clamp(48px, 12vw, 140px); }
  .section-head { flex-direction: column; gap: 8px; }
  .featured-card { padding: clamp(20px, 4vw, 36px); }
  .grid-item { padding: 24px 20px 28px 0; }
  .grid-item .top,
  .grid-item h4,
  .grid-item .exc,
  .grid-item .foot { padding-left: 20px; }
  .grid-item:hover { padding-left: 10px; }
  .grid-item:hover .top,
  .grid-item:hover h4,
  .grid-item:hover .exc,
  .grid-item:hover .foot { padding-left: 10px; }
  .year-group .year { font-size: clamp(56px, 10vw, 120px); }
  .list .row { grid-template-columns: 90px 1fr; }
  .list .row .tag { display: none; }
}
```

- [ ] **Step 2：提交**

```bash
git add src/styles/global.css
git commit -m "fix: 新增 768px 断点，覆盖平板竖屏空白区间"
```

---

## Task 7：global.css — 640px 断点补强

**Files:**
- Modify: `src/styles/global.css` 中的 `@media (max-width: 640px)` 块

- [ ] **Step 1：在现有 640px 断点块末尾追加规则**

找到 `@media (max-width: 640px) {` 块，在其末尾 `}` **之前**追加：

```css
  /* 超大标题压缩 */
  .hero h1 { font-size: clamp(40px, 10vw, 72px); }
  .colophon h1 { font-size: clamp(48px, 12vw, 100px); }
  .year-group .year { font-size: clamp(48px, 12vw, 80px); }

  /* about 页上下 padding 压缩 */
  .colophon { padding: 48px var(--gutter) 80px; }

  /* section-head 竖向排列 */
  .section-head { flex-direction: column; gap: 8px; }

  /* 上下篇导航单列 */
  .post-nav { grid-template-columns: 1fr; }
  .post-nav a { text-align: left !important; }

  /* footer 竖向排列 */
  .site-foot { flex-direction: column; align-items: flex-start; gap: 12px; }
  .site-foot .right { text-align: left; }

  /* about 页首字下沉压缩 */
  .colophon .col-body p:first-of-type::first-letter { font-size: 3em; }

  /* copy-btn 触摸区域扩大 */
  .copy-btn { padding: 8px 0 8px 8px; }

  /* pill 触摸区域扩大 */
  .pill { padding: 10px 16px; }
```

**注意**：640px 断点里已有 `.list .row { grid-template-columns: 70px 1fr; gap: 14px; }` 和 `.list .row .tag { display: none; }`，**不要重复添加**。

- [ ] **Step 2：提交**

```bash
git add src/styles/global.css
git commit -m "fix: 640px 断点补强——字号、触摸区域、导航单列、footer 竖排"
```

---

## Task 8：构建验证

- [ ] **Step 1：运行 dev server**

```bash
npm run dev -- --host 0.0.0.0
```

- [ ] **Step 2：验证清单**

打开浏览器，用 DevTools 切换以下视口逐一确认：

| 视口 | 检查项 |
|------|--------|
| 1200px（桌面） | 代码块 copy 按钮固定右上角，横向滚动不移动；上下篇两列；footer 横排 |
| 980px（平板横屏） | 汉堡菜单出现；点击展开 nav；SearchBox 宽度铺满；归档列表三列 |
| 768px（平板竖屏） | hero 标题缩小；section-head 竖排；grid 卡片 padding 缩小；年份字号缩小 |
| 640px（手机） | hero/colophon/年份字号均合理；上下篇单列且左对齐；footer 竖排；pill 更大更好点 |
| 360px（小屏手机） | 无横向溢出；字号不超宽；copy-btn 可点击 |

- [ ] **Step 3：验证通过后最终提交**

```bash
git add -A
git commit -m "fix: 复制按钮修复 + 响应式全面适配完成"
```
