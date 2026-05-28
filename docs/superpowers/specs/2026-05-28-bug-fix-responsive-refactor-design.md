# 设计规格：Bug 修复 + 响应式重构

**日期**：2026-05-28  
**项目**：终末诗篇个人博客（Astro 6）  
**范围**：Bug 修复 × 4，图片显示修复，横向溢出修复，CSS 去重，顶栏稳定

---

## 背景与目标

当前博客存在以下问题：

1. 手机端页面需要左右滑动才能看到完整内容（横向溢出）
2. 文章正文中的图片在桌面端看不到（溢出三列 grid 侧栏区域被遮盖）
3. 导航栏在窗口缩小时高度不稳定（topbar 内容换行）
4. 四处代码 Bug（OG 域名、未用变量、RSS 描述、CSS 命名碰撞）
5. CSS 维护隐患（640px 断点大量重复 980px 的样式）

**成功标准**：
- 所有设备宽度（320px–2560px）无横向滚动条
- 文章图片在桌面三列布局中正确约束于文章体宽度
- 顶栏高度在任意宽度下保持单行稳定
- CSS 去掉重复声明后可正常工作
- 四处 Bug 消除，构建无报错

---

## 架构与约束

- **不改变任何功能逻辑**：只动样式、删未用代码、修错误值
- **不引入新依赖**
- **不拆分文件**：`global.css` 保持单文件，仅在现有结构内增删改
- **SearchBox** 仅改一处 inline style → CSS class，不重构组件逻辑

---

## 详细设计

### A. Bug 修复

#### A1. OG / Twitter 图片域名错误
- **文件**：`src/layouts/BaseLayout.astro`，第 23、27 行
- **现状**：`https://zhongmo-shijian.example.com/og-image.png`
- **修复**：改为 `https://zmspblog.us.kg/og-image.png`

#### A2. 未使用变量 `idx`
- **文件**：`src/pages/posts/[slug].astro`，第 25 行
- **现状**：`const idx = sorted.findIndex(p => p.id === post.id);`
- **修复**：删除该行

#### A3. RSS 描述内容错误
- **文件**：`src/pages/rss.xml.js`，第 9 行
- **现状**：`description: '家庭数据中心 PVE 笔记'`（过于具体且非博客通用描述）
- **修复**：改为 `description: '终末诗篇 — 代码、工具、生活'`

#### A4. `.foot` CSS 命名碰撞
- **文件**：`src/styles/global.css`
- **现状**：`.foot` 选择器同时命中页面 Footer（`<footer class="foot site-foot">`）
  和 grid-item 卡片底部（`<div class="foot">`），导致页面 Footer 的
  `padding: 40px var(--gutter) 32px` 以低特异性「渗入」卡片底部，
  使卡片出现多余的右/下 padding。
- **修复**：
  - CSS 中将页面 Footer 的基础样式选择器由 `.foot` 改为 `.site-foot`
  - 640px 断点中已有 `.site-foot` 规则，保持不变
  - `Footer.astro` HTML 结构已有 `class="foot site-foot"`，无需改动
  - `grid-item .foot` 规则完全不受影响

---

### B. 图片 & 横向溢出修复

#### B1. 文章正文图片约束
- **文件**：`src/styles/global.css`
- **位置**：在 `/* =================== Article view ===================*/` 区块内，
  `.article-body` 相关规则之后新增
- **新增规则**：
  ```css
  .article-body img {
    max-width: 100%;
    height: auto;
    display: block;
    margin: 1.5em auto;
    border-radius: 4px;
  }
  ```
- **效果**：图片在桌面三列布局的文章体列内（`minmax(0, 1fr)`）严格约束宽度，
  不再溢出到侧栏区域；手机端同样适用

#### B2. HTML 横向溢出保护
- **文件**：`src/styles/global.css`
- **位置**：`html, body { ... }` 规则块内追加
- **新增**：`overflow-x: hidden;`
- **说明**：兜底防止代码块、表格等宽元素产生全局横向滚动条

#### B3. SearchBox 下拉宽度响应式
- **文件**：`src/components/SearchBox.tsx` + `src/styles/global.css`
- **现状**：下拉框有 `width: '360px'` 内联样式，在窄屏上溢出视口
- **修复**：
  - `SearchBox.tsx`：删除下拉 div 的 `width: '360px'` 内联样式，
    为其加 `className="search-dropdown"`
  - `global.css` 新增：
    ```css
    .search-dropdown {
      width: min(360px, calc(100vw - 2 * var(--gutter)));
    }
    ```

---

### C. CSS 去重 & 顶栏稳定

#### C1. 640px 断点去除重复的汉堡/导航样式
- **文件**：`src/styles/global.css`
- **现状**：`@media (max-width: 640px)` 中完整重复了 `@media (max-width: 980px)`
  中的以下规则（约 30 行）：
  - `.hamburger { display: flex; }`
  - `.topbar { position: relative; }`
  - `.nav`（绝对定位、opacity/transform 收起）
  - `.nav.mobile-open`
  - `.nav .link`（padding、font-size、border-bottom）
  - `@media (prefers-color-scheme: dark) .nav` 阴影
- **修复**：从 640px 断点中删除上述全部重复声明，仅保留 640px 专属的样式
  （字号压缩、article padding、超大标题压缩、上下篇单列、footer 竖排等）

#### C2. 顶栏高度稳定
- **文件**：`src/styles/global.css`
- **现状**：`.nav` 内的 SearchBox input 宽 `180px`，flex 容器在 980–1200px
  宽度范围内压缩时可能导致 topbar 内容折行、高度跳变
- **修复**：为 SearchBox input 在 CSS 中加 `min-width: 0; flex-shrink: 1`，
  允许其在压力下收缩而不折行；同时在 980px 断点生效前的桌面样式里加
  `white-space: nowrap` 保护 nav 链接文字

---

## 变更文件清单

| 文件 | 改动性质 | 风险 |
|------|----------|------|
| `src/styles/global.css` | 新增 img 规则、改选择器、删重复块、加 overflow 保护 | 低 |
| `src/components/SearchBox.tsx` | 删一处 inline style、加 className | 极低 |
| `src/layouts/BaseLayout.astro` | 改两处 URL 字符串 | 极低 |
| `src/pages/posts/[slug].astro` | 删一行未用变量 | 极低 |
| `src/pages/rss.xml.js` | 改一处字符串 | 极低 |

---

## 不在此次范围内

- SearchBox 全部 inline style 迁移（仅改下拉宽度）
- ArchiveFilter 分类动态化
- CSS 文件拆分
- 任何功能新增

---

## 测试验证

1. 构建无报错：`npm run build`
2. 桌面（1280px+）打开文章页，图片正常显示在文章体内
3. 手机（375px）竖屏，无横向滚动条
4. 窗口从 1400px 拖动到 320px，topbar 全程保持单行
5. 手机打开导航菜单，SearchBox 下拉不溢出屏幕
6. RSS feed 响应正常，描述字段正确
