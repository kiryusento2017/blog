# 设计规格：复制按钮修复 + 响应式全面适配

**日期：** 2026-05-26  
**状态：** 待实施  
**影响范围：** `global.css`、`[slug].astro`、`Footer.astro`

---

## 背景与问题

两个已确认的用户体验缺陷：

1. **复制按钮漂移**：`.code-actions` 用 `position: absolute` 挂在有 `overflow-x: auto` 的 `pre` 元素内，横向滚动时按钮跟着内容移动而非固定在右上角。

2. **响应式适配不足**：以下设备区间存在明确破损：
   - 平板横屏（≤980px）：无汉堡菜单，导航链接+搜索框挤在一行
   - 平板竖屏（≤768px）：无样式断点，完全空白
   - 手机（≤640px）：多处字号过大、上下篇布局使用内联样式无法覆盖、footer class 与卡片 class 同名导致误伤

---

## 一、复制按钮修复

### 根因

`.code-actions`（`position: absolute`）挂在 `pre`（`position: relative; overflow-x: auto`）内部。`overflow: auto` 容器横向滚动时，绝对定位子元素随之滚动，因为其定位参照系（`pre`）本身在移动。

### 结构变更

```
修复前：
<pre>  ← position: relative; overflow-x: auto
  <code>...</code>
  <div class="code-actions">  ← position: absolute，随内容滚动

修复后：
<div class="code-wrap">        ← position: relative（新锚点，不滚动）
  <div class="code-actions">  ← position: absolute，锚定在 wrap，不受滚动影响
    <span class="lang">
    <button class="copy-btn">
  <pre>                         ← 去掉 position: relative，保留 overflow-x: auto
    <code>...</code>
```

### 改动清单

#### `src/pages/posts/[slug].astro` — JS 注入脚本

将第 146 行起的 `document.querySelectorAll('.content pre').forEach` 函数体改为：
1. 创建 `div.code-wrap`
2. `pre.parentNode.insertBefore(wrap, pre)`
3. `wrap.appendChild(pre)`
4. 创建 `.code-actions` 并执行现有的 lang 移动 + copy-btn 创建逻辑
5. `wrap.appendChild(actions)`（原来是 `pre.appendChild(actions)`，这是关键改动）

#### `src/styles/global.css`

- 新增 `.code-wrap { position: relative; }` 样式
- 从 `.article-body pre { ... }` 中去掉 `position: relative`（第 730 行附近）
- `.code-actions` 的 CSS 保持不变（`position: absolute; top: 12px; right: 16px`，锚定在 `code-wrap` 上生效）

**注意**：`.article-body pre .lang` 的 CSS 规则（`position: absolute; top: 12px; right: 16px`）在 JS 把 `.lang` 移走后已成死规则，实施后继续作为死规则存在，不删除。

---

## 二、响应式修复

### 断点结构

```
基础样式（桌面，>980px）
@media (max-width: 980px)   ← 平板横屏，已有，本次补强
@media (max-width: 768px)   ← 平板竖屏，本次新增（必须插在 640px 之前）
@media (max-width: 640px)   ← 手机，已有，本次补强
```

---

### 2a. `@media (max-width: 980px)` 补强

**问题：** 导航栏在平板上无汉堡菜单，链接挤成一行；归档列表四列溢出。

**新增规则：**

```css
/* 汉堡菜单显示 */
.hamburger { display: flex; }

/* topbar 必须有定位，nav 的 absolute top:100% 才能相对它定位 */
.topbar { position: relative; }

/* nav 下拉状态机（完整复制自 640px 断点） */
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
/* dark mode 阴影（必须在 980px 断点内嵌套，否则深色背景下阴影不可见） */
@media (prefers-color-scheme: dark) {
  .nav { box-shadow: 0 8px 24px rgba(0,0,0,0.3); }
}
.nav.mobile-open { opacity: 1; transform: translateY(0); pointer-events: auto; }
.nav .link { padding: 14px 4px; font-size: 13px; border-bottom: 1px solid var(--rule-soft); }

/* 归档列表三列（去掉 readtime 列） */
.list .row { grid-template-columns: 110px 1fr 140px; }
```

---

### 2b. `@media (max-width: 768px)` 新增

**问题：** 768px~980px 区间完全无样式覆盖，平板竖屏体验空白。

**新增规则：**

```css
/* hero 标题缩小 */
.hero h1 { font-size: clamp(48px, 12vw, 140px); }

/* section-head 改竖向排列，避免 h2 与右侧链接挤压 */
.section-head { flex-direction: column; gap: 8px; }

/* featured-card padding 缩小 */
.featured-card { padding: clamp(20px, 4vw, 36px); }

/* grid 卡片内外 padding 同步缩小（内层子元素 padding-left 与外层右 padding 对齐） */
.grid-item { padding: 24px 20px 28px 0; }
.grid-item .top,
.grid-item h4,
.grid-item .exc,
.grid-item .foot { padding-left: 20px; }
/* hover 态同步 */
.grid-item:hover .top,
.grid-item:hover h4,
.grid-item:hover .exc,
.grid-item:hover .foot { padding-left: 10px; }

/* 归档列表两列，隐藏 tag 列，日期列 90px（10 字符等宽字体最小安全宽度） */
.list .row { grid-template-columns: 90px 1fr; }
.list .row .tag { display: none; }
```

---

### 2c. `@media (max-width: 640px)` 补强

**问题：** 多处字号过大；上下篇布局内联样式无法用 CSS 覆盖；footer class 误伤卡片。

**新增/修改 CSS 规则：**

```css
/* 超大标题压缩 */
.hero h1 { font-size: clamp(40px, 10vw, 72px); }
.colophon h1 { font-size: clamp(48px, 12vw, 100px); }
.year-group .year { font-size: clamp(48px, 12vw, 80px); }

/* section-head 竖向排列（640px 以下同样需要，与 768px 一致） */
.section-head { flex-direction: column; gap: 8px; }

/* 上下篇导航单列（需配合 [slug].astro 模板改动，见下） */
.post-nav { grid-template-columns: 1fr; }

/* footer 竖向排列（用 .site-foot 避免误伤 .grid-item .foot） */
.site-foot { flex-direction: column; align-items: flex-start; gap: 12px; }
.site-foot .right { text-align: left; }
```

---

### 2d. 全局基础样式补充

**`.post-nav` 基础样式（非断点内，桌面端两列）：**

`[slug].astro` 第 81 行 div 的所有内联样式全部移入全局 CSS：

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

---

### 三、模板/组件改动

#### `src/pages/posts/[slug].astro` 第 81 行

将：
```html
<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-top: 56px; padding-top: 28px; border-top: 1px solid var(--rule)">
```
改为：
```html
<div class="post-nav">
```
所有内联样式全部移入 CSS `.post-nav` 规则（见 2d）。

#### `src/components/Footer.astro`

将 footer 元素的 `class="foot"` 改为 `class="foot site-foot"`，以便 640px 断点的 `.site-foot` 规则能精准命中 footer 而不误伤 `.grid-item .foot`。

---

## 改动文件汇总

| 文件 | 改动性质 |
|------|----------|
| `src/styles/global.css` | 新增 `.code-wrap`；补 `.post-nav` 基础样式；补强 980px；新增 768px；补强 640px |
| `src/pages/posts/[slug].astro` | JS 脚本改 code-wrap 注入；模板第 81 行去内联样式加 `.post-nav` class |
| `src/components/Footer.astro` | `.foot` 追加 `site-foot` class |

---

## 实施注意事项

1. 768px 断点必须插入在 640px 断点之前，否则 cascade 顺序错误导致规则被覆盖。
2. SearchBox 在 980px 汉堡菜单展开后需目测验证宽度/弹出层是否正常，若有溢出则补 `width: 100%`。
3. `.article-body pre .lang` CSS 规则在 JS 移走 `.lang` 后已是死规则，不删除（按项目原则：先前就存在的死代码不动）。
4. `grid-item .foot`（卡片底部）和 `.site-foot`（页面 footer）是两个不同元素，修改 `.site-foot` 不影响卡片底部。
