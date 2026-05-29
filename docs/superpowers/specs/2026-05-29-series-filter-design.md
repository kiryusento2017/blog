# 系列筛选重设计

**日期：** 2026-05-29

## 背景

当前筛选栏硬编码五个按钮（全部/技术/工具/生活/阅读），存在两个问题：
1. 点击无文章的分类（生活/阅读）后再切回其他分类，列表内容消失（IntersectionObserver bug）
2. 无法支持"系列"概念，扩展性差

## 设计决策

### 数据模型
- `src/content.config.ts` 新增 `series: z.array(z.string()).optional()`
- `category` enum 扩展：`['技术', '工具', '生活', '阅读', '物理']`
- 现有 20 篇文章全部加 `series: ["家庭数据中心 PVE 系列"]`

### 筛选组件（ArchiveFilter.tsx）
- 删除硬编码 `FILTERS`
- 新增 `SERIES_ORDER: string[]` 手动定义系列排列顺序
- 状态从 `string` 改为 `string | null`（`null` = 全部，无按钮高亮）
- 单选 + 点当前选中取消（回到全部）
- 无系列文章自动归入"俗世杂记 life.md"按钮（追加在末尾）

**筛选逻辑：**
- `null` → 全部文章
- `"俗世杂记 life.md"` → `series` 为空或未填的文章
- 其他 → `post.data.series?.includes(active)` 为 true 的文章

### Bug 修复：IntersectionObserver 失效
- `ArchiveFilter.tsx` 加 `useEffect`，`grouped` 变化时 dispatch `content-updated` 事件
- `BaseLayout.astro` 监听该事件，重新 observe `.reveal:not(.in)` 元素
