# 设计规格：复制按钮修复 + 响应式全面适配

**日期：** 2026-05-26  
**状态：** 待实施  
**影响范围：** `global.css`、`[slug].astro`、`Footer.astro`、`SearchBox.tsx`

---

## 背景与问题

两个已确认的用户体验缺陷：

1. **复制按钮漂移**：`.code-actions` 用 `position: absolute` 挂在有 `overflow-x: auto` 的 `pre` 元素内，横向滚动时按钮跟着内容移动而非固定在右上角。

2. **响应式适配不足**：以下设备区间存在明确破损：
   - 平板横屏（≤980px）：无汉堡菜单，导航链接+搜索框挤在一行
   - 平板竖屏（≤768px）：无样式断点，完全空白
   - 手机（≤640px）：多处字号过大、上下篇布局内联样式无法被 CSS 覆盖、footer class 与卡片 class 同名导致误伤、复制按钮触摸区域过小

---

## 一、复制按钮修复

### 根因

`.code-actions`（`position: absolute`）挂在 `pre`（`position: relative; overflow-x: auto`）内部。`overflow: auto` 容器横向滚动时，绝对定位子元素随之滚动，因为其定位参照系（`pre`）本身在移动。

祖先链（`article-body → article → shell → body`）均无 `overflow` 限制，`code-wrap` 方案不会被祖先截断。

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

#### `src/pages/posts/[slug].astro` — JS 注入脚本（完整替换）

将第 146 行起的整个 `(function () { ... })();` 代码块中的 `document.querySelectorAll` 部分替换为以下完整代码：

```js
document.querySelectorAll('.content pre').forEach(function (pre) {
  // 1. 创建 code-wrap 并插入 DOM（占据 pre 原来的位置）
  var wrap = document.createElement('div');
  wrap.className = 'code-wrap';
  pre.parentNode.insertBefore(wrap, pre);
  wrap.appendChild(pre);

  // 2. 创建 .code-actions，lang 移动逻辑保持不变
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
  // 3. actions 挂到 wrap，而非 pre（这是关键改动）
  wrap.appendChild(actions);
});
```

`onCopied(btn)` 函数定义在外层，闭包仍然可访问，无需修改。

#### `src/styles/global.css`

- 新增 `.code-wrap { position: relative; }` 样式（插入在 `.code-actions` 规则之前）
- 将 `.article-body pre` 规则块（第 719 行）中的 `position: relative;` **这一行**删除，其余属性（`overflow-x: auto`、`padding`、`background` 等）保持不变
- `.code-actions` 的 CSS 保持不变（`position: absolute; top: 12px; right: 16px`，现在锚定在 `code-wrap` 上生效）

**注意**：`.article-body pre .lang` 的 CSS 规则在 JS 把 `.lang` 移走后已是死规则，保持不动（项目原则：不删先前存在的死代码）。

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

**问题：** 导航栏在平板上无汉堡菜单，链接挤成一行；SearchBox 无法自适应宽度；归档列表四列溢出。

**新增规则：**

```css
/* 汉堡菜单显示 */
.hamburger { display: flex; }

/* topbar 必须有定位，nav 的 absolute top:100% 才能相对它定位 */
.topbar { position: relative; }

/* nav 下拉状态机（完整复制自 640px 断点逻辑） */
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

/* SearchBox 在移动端展开菜单里自适应宽度 */
.nav .search-box-wrap { width: 100%; }
.nav .search-box-wrap input[type="search"] { width: 100% !important; }
.nav .search-box-wrap > div { width: 100% !important; right: 0; left: 0; }

/* 归档列表三列（去掉最后一列空列） */
.list .row { grid-template-columns: 110px 1fr 140px; }
```

---

### 2b. `@media (max-width: 768px)` 新增

**问题：** 768px~980px 区间完全无样式覆盖，平板竖屏体验空白。归档年份字号在此区间仍过大。

**新增规则（插入在 640px 断点之前）：**

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

/* 归档年份字号（768px-980px 区间原本未处理，仍在 80px+） */
.year-group .year { font-size: clamp(56px, 10vw, 120px); }

/* 归档列表两列，隐藏 tag 列，日期列 90px（10 字符等宽字体安全宽度） */
.list .row { grid-template-columns: 90px 1fr; }
.list .row .tag { display: none; }
```

---

### 2c. `@media (max-width: 640px)` 补强

**问题：** 多处字号过大；上下篇布局内联样式无法覆盖；footer class 误伤；copy-btn 触摸区域过小；上下篇"下一篇"右对齐在单列下不协调；colophon padding 过松；pill 触摸区域小。

**新增规则（追加在现有 640px 断点末尾）：**

```css
/* 超大标题压缩 */
.hero h1 { font-size: clamp(40px, 10vw, 72px); }
.colophon h1 { font-size: clamp(48px, 12vw, 100px); }
.year-group .year { font-size: clamp(48px, 12vw, 80px); }

/* about 页上下 padding 压缩（手机上 80px/120px 过松） */
.colophon { padding: 48px var(--gutter) 80px; }

/* section-head 竖向排列（防御性重复，与 768px 值一致） */
.section-head { flex-direction: column; gap: 8px; }

/* 上下篇导航单列（需配合 [slug].astro 模板改动，见三） */
.post-nav { grid-template-columns: 1fr; }
/* 单列后两个链接统一左对齐（"下一篇" <a> 有内联 text-align:right，需覆盖） */
.post-nav a { text-align: left !important; }

/* footer 竖向排列（用 .site-foot 避免误伤 .grid-item .foot） */
.site-foot { flex-direction: column; align-items: flex-start; gap: 12px; }
.site-foot .right { text-align: left; }

/* about 页首字下沉在手机上过大（4.2em ≈ 80px，旁边只能放 2-3 个汉字） */
.colophon .col-body p:first-of-type::first-letter { font-size: 3em; }

/* copy-btn 触摸区域扩大（原 padding:0，触摸区域仅 10px，手机上无法点击） */
.copy-btn { padding: 8px 0 8px 8px; }

/* pill 触摸区域扩大（原 7px 13px，约 25px 高，低于 44px 推荐值） */
.pill { padding: 10px 16px; }
```

**注意：** `global.css` 640px 断点里已有 `.list .row { grid-template-columns: 70px 1fr; gap: 14px; }` 和 `.list .row .tag { display: none; }`（第 924-925 行），**无需重复添加**。

---

### 2d. 全局基础样式补充（非断点内）

**`.post-nav` 基础样式（桌面端两列，插入位置：`.article-end` 规则之后、`@media (max-width: 980px)` 之前）：**

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

## 三、模板/组件改动

### `src/pages/posts/[slug].astro` 第 81 行

将：
```html
<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-top: 56px; padding-top: 28px; border-top: 1px solid var(--rule)">
```
改为：
```html
<div class="post-nav">
```
所有内联样式全部移入 CSS `.post-nav` 规则（见 2d）。两个子元素 `<a>` 的内联样式（`text-decoration: none; color: inherit` 等）保持不动。

### `src/components/Footer.astro`

将 `<footer class="foot">` 改为 `<footer class="foot site-foot">`。

### `src/components/SearchBox.tsx`

将根 div：
```jsx
<div ref={ref} style={{ position: 'relative' }}>
```
改为：
```jsx
<div ref={ref} className="search-box-wrap" style={{ position: 'relative' }}>
```
`style` 属性保留不变，`className` 追加。弹出层是根 div 的直接子 div，CSS 选择器 `.nav .search-box-wrap > div` 能正确命中。

---

## 改动文件汇总

| 文件 | 改动性质 |
|------|----------|
| `src/styles/global.css` | 新增 `.code-wrap`、`.post-nav` 基础样式；补强 980px（含 SearchBox + dark nav shadow）；新增 768px（含年份字号）；补强 640px（含触摸区域、对齐、padding 修复） |
| `src/pages/posts/[slug].astro` | JS 脚本完整替换为 code-wrap 版本；模板第 81 行去内联样式加 `.post-nav` class |
| `src/components/Footer.astro` | `<footer>` 追加 `site-foot` class |
| `src/components/SearchBox.tsx` | 根 div 追加 `className="search-box-wrap"` |

---

## 实施注意事项

1. **断点顺序**：768px 断点必须插入在 640px 断点之前，否则 cascade 顺序错误。
2. **SearchBox 验证**：实施后在 980px 汉堡菜单展开状态下目测验证 input 和弹出层宽度是否铺满。
3. **死规则**：`.article-body pre .lang { position: absolute; ... }` 在 JS 把 `.lang` 移走后成为死规则，按项目原则保留不动。
4. **已存在规则**：640px 断点里 `.list .row { grid-template-columns: 70px 1fr; gap: 14px; }` 和 `.list .row .tag { display: none; }` 已存在（第 924-925 行），不重复添加。
5. **class 隔离**：`.site-foot` 只命中 footer，`.grid-item .foot`（卡片底部）不受影响。
6. **已知降级**：手机端文章目录（`article-rail`）在 980px 以下 `display: none`，当前版本无替代方案，属有意降级。
