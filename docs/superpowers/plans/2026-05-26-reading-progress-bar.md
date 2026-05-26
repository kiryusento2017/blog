# 文章页阅读进度条 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在文章页右侧栏 TOC 下方加入阅读进度条，随页面滚动实时更新宽度和百分比文字。

**Architecture:** 只改 `src/pages/posts/[slug].astro` 一个文件：在右侧 `<aside class="article-rail right">` 末尾加进度条 HTML，再加一段 `<script is:inline>` 用原生 JS 监听 scroll 事件更新进度。CSS（`.progress`、`.bar`、`.fill`）已在 `src/styles/global.css` 第 954–980 行完整定义，无需改样式。

**Tech Stack:** Astro 6，原生 JS（无框架），`<script is:inline>`

---

## 设计参考

`design-reference/views.jsx` 第 361–370 行（scroll 逻辑）：
```js
const [pct, setPct] = useState(0);
const onScroll = () => {
  const h = document.documentElement;
  const max = h.scrollHeight - h.clientHeight;
  setPct(max > 0 ? Math.min(100, Math.round((h.scrollTop / max) * 100)) : 0);
};
window.addEventListener("scroll", onScroll, { passive: true });
```

`design-reference/views.jsx` 第 467–470 行（HTML 结构）：
```html
<div class="progress">
  <div class="bar"><div class="fill" style="width: {pct}%"></div></div>
  <div style="font-family: var(--f-mono); font-size: 10px; color: var(--ink-faint)">已读 {pct}%</div>
</div>
```

已有 CSS（`src/styles/global.css` 第 954–980 行）：
```css
.article-rail.right .progress {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid var(--rule);
}
.article-rail.right .progress .bar {
  height: 2px;
  background: var(--rule);
  margin-bottom: 8px;
  overflow: hidden;
}
.article-rail.right .progress .bar .fill {
  height: 100%;
  background: var(--accent);
  width: 0;
  transition: width 0.15s;
}
```

---

## 文件结构

```
src/pages/posts/[slug].astro   ← 唯一修改文件
src/styles/global.css          ← 只读，不改
```

---

## Task 1: 添加进度条 HTML 和滚动脚本

**Files:**
- Modify: `src/pages/posts/[slug].astro`

### 修改点 A — 右侧栏末尾加进度条 HTML

当前右侧栏结构（`src/pages/posts/[slug].astro` 末尾附近）：

```astro
<aside class="article-rail right">
  <div class="h">目录 · Contents</div>
  {headings.length > 0 ? headings.map(...) : (
    <div style="...">这篇较短，没有分节。</div>
  )}
</aside>
```

修改后（在 `</aside>` 前插入进度条）：

```astro
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
  <div class="progress">
    <div class="bar"><div class="fill" id="progress-fill"></div></div>
    <div id="progress-pct" style="font-family: var(--f-mono); font-size: 10px; color: var(--ink-faint)">已读 0%</div>
  </div>
</aside>
```

### 修改点 B — `</BaseLayout>` 前加滚动脚本

```astro
<script is:inline>
  (function () {
    var fill = document.getElementById('progress-fill');
    var pct = document.getElementById('progress-pct');
    if (!fill || !pct) return;
    function update() {
      var h = document.documentElement;
      var max = h.scrollHeight - h.clientHeight;
      var v = max > 0 ? Math.min(100, Math.round((h.scrollTop / max) * 100)) : 0;
      fill.style.width = v + '%';
      pct.textContent = '已读 ' + v + '%';
    }
    update();
    window.addEventListener('scroll', update, { passive: true });
  })();
</script>
```

**使用 IIFE + `var`（而非 `const`/`let`）** 是因为 `is:inline` 脚本不经过 Astro 打包，直接内联进 HTML，IIFE 避免污染全局作用域，`var` 兼容性最广。

---

- [ ] **Step 1: 在右侧栏末尾插入进度条 HTML**

定位 `src/pages/posts/[slug].astro` 中右侧 `</aside>` 的位置，在其前插入：

```astro
  <div class="progress">
    <div class="bar"><div class="fill" id="progress-fill"></div></div>
    <div id="progress-pct" style="font-family: var(--f-mono); font-size: 10px; color: var(--ink-faint)">已读 0%</div>
  </div>
```

- [ ] **Step 2: 在文件末尾 `</BaseLayout>` 前插入滚动脚本**

```astro
<script is:inline>
  (function () {
    var fill = document.getElementById('progress-fill');
    var pct = document.getElementById('progress-pct');
    if (!fill || !pct) return;
    function update() {
      var h = document.documentElement;
      var max = h.scrollHeight - h.clientHeight;
      var v = max > 0 ? Math.min(100, Math.round((h.scrollTop / max) * 100)) : 0;
      fill.style.width = v + '%';
      pct.textContent = '已读 ' + v + '%';
    }
    update();
    window.addEventListener('scroll', update, { passive: true });
  })();
</script>
```

- [ ] **Step 3: 在浏览器验证**

访问 `http://localhost:4321/posts/013-pve-homelab-basics`，检查：
- [ ] 右侧栏 TOC 下方出现细进度条轨道和"已读 0%"文字
- [ ] 向下滚动时进度条填充变宽，百分比数字随之更新
- [ ] 滚动到页面底部时显示"已读 100%"
- [ ] 移动端（< 980px）右侧栏隐藏，进度条不可见（CSS `display:none` 已处理）

- [ ] **Step 4: 提交**

```bash
git add src/pages/posts/[slug].astro
git commit -m "feat: 文章页右侧栏加入阅读进度条"
git push
```

---

## 自检

**Spec 覆盖检查：**
- [x] 进度条 HTML 结构与设计参考一致（`.progress > .bar > .fill` + 百分比文字）✓
- [x] 滚动逻辑与设计参考一致（`scrollTop / (scrollHeight - clientHeight)`）✓
- [x] `transition: width 0.15s` 动画依赖已有 CSS，无需新增 ✓
- [x] 移动端隐藏依赖已有 CSS `.article-rail { display: none }` ✓

**Placeholder 扫描：** 无 TBD / TODO，所有代码完整。

**风险说明：**
- `<script is:inline>` 在 Astro 静态页面中每次导航都会重新执行，无副作用（IIFE + `addEventListener` 被页面卸载自动清理）
- `id="progress-fill"` 和 `id="progress-pct"` 在单页中唯一，不会冲突
