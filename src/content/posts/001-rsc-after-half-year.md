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

## 01 心智模型的转变

我以前会下意识地问：「这个组件要不要 useEffect 去拉数据？」现在我会先问：「这个组件能不能不变成 client component？」这两个问题的方向是反的。

一旦你接受了「服务端是默认值」，整个文件夹的设计都会改变。我现在通常一个路由下只有 1-2 个标 `use client` 的叶子组件，其余都是 server-only。

> RSC 真正的价值不在性能，而在于它让数据获取和组件树第一次成为同一件事。

## 02 三个用得最顺手的模式

经过几次重构，下面三个模式在我手上沉淀下来：

客户端组件做交互、状态、表单；服务端组件喂数据。这种 shell-and-slot 结构非常清晰。

## 03 踩过的真坑

Server Actions 的 revalidation 行为非常依赖你对缓存层的理解。在 Next.js 里 cache 不是一层而是四层（fetch、Router、Full Route、Data），错位调试会让你怀疑人生。

另一个反复掉进去的是 hydration mismatch。任何在 server / client 都执行的逻辑都要假设两边的时钟、locale、随机数源都可能不同。

## 04 如果让我再选一次

会。即便有一切折腾，最终代码量减少了大概 30%。但我不会建议任何团队为了「跟上潮流」迁。RSC 真正适合的是数据驱动密度高的场景。

---

下一篇我准备写写 Server Actions 和表单的具体配方。
