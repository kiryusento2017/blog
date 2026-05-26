---
title: 家庭数据中心 PVE
titleEm: Navidrome 音乐系统
date: 2026-04-22
category: 工具
tags: [Navidrome, Music Assistant, 音乐, Docker]
description: 部署 Navidrome、Music Assistant、music-tag-web 打造专属音乐中心，含 AzuraCast 自建电台。
readTime: 5 min
words: 500
featured: false
num: "Nº 019"
---

> 参考红茶海教程：[Music Assistant](https://www.yuque.com/hongcha-6c6o6/klr1op/zd4wrqlgblqlwpdz?singleDoc#) · [打造自己的专属音乐中心](https://www.yuque.com/hongcha-6c6o6/klr1op/57b7bcc6f54f484ba4eb02dbfeaad06a?singleDoc#) · [AzuraCast](https://www.yuque.com/hongcha-6c6o6/klr1op/uf3w5un0nhe62638?singleDoc#)

---

## 一、整体架构

家庭音乐系统由三个组件构成：

| 组件 | 用途 |
|------|------|
| **Navidrome** | 音乐流媒体服务器，管理音乐库并提供 Web 播放器 |
| **Music Assistant** | 音乐集成中枢，连接各种音乐服务与智能音箱 |
| **music-tag-web** | 音乐标签管理，修正歌曲的元数据（封面、歌词等） |

另外可选部署 **AzuraCast** 搭建自己的网络电台。

---

## 二、前置条件

- 音乐文件存储在 NAS 上，通过 NFS 挂载到 LXC 容器（参见 Nº 006）
- 使用 Docker Compose 部署

---

## 三、部署步骤

参照红茶海教程中的 compose 文件进行部署。核心注意点：

1. **Navidrome** 需要挂载音乐目录为只读（`/music:ro`），避免误删
2. **Music Assistant** 需要挂载 Docker socket 和音频设备
3. **music-tag-web** 需要挂载音乐目录为读写模式，方便修改标签

---

## 四、使用建议

- 先用 music-tag-web 整理好音乐标签和封面，再导入 Navidrome
- 在 Music Assistant 中连接 Navidrome 作为音乐源
- 支持 Subsonic 协议的客户端（如 Symfonium、DSub）都可以连接 Navidrome
