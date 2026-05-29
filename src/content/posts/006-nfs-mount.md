---
title: 家庭数据中心 PVE
titleEm: NFS 文件挂载
date: 2025-06-17
category: 技术
series: ["家庭数据中心 PVE 系列"]
tags: [NFS, 文件挂载, LXC]
description: 将 UNRAID NAS 中的文件通过 NFS 挂载到 PVE 宿主机，再推送给各个 LXC 容器使用。
readTime: 4 min
words: 500
featured: false
num: "Nº 006"
---

> 总体思路：先将 UNRAID 中的文件挂载到 PVE 宿主机，再推送给每个 LXC 容器。

---

## 一、安装 NFS 客户端

```bash
dpkg -l | grep nfs-common
apt-get update
apt-get install nfs-common
```

---

## 二、在 PVE 宿主机挂载 NFS

在 PVE 的 WebUI 中操作：数据中心 → 存储 → 添加 → NFS。

![](https://cdn.nlark.com/yuque/0/2025/webp/55551868/1755970232153-8c81e702-0582-4c1f-a4fc-ae74beca0f9a.webp)

**注意**：挂载时目标必须为空文件夹，否则已有内容会被覆盖。

---

## 三、推送目录到 LXC 容器

```bash
pct set <VMID> -mp<编号> /NFSPath,mp=/MountPath
```

示例（将宿主机 `/mnt/pve/Share` 推送到 LXC 101 的 `/mnt/nfs/Share`）：

```bash
pct set 101 -mp0 /mnt/pve/Share,mp=/mnt/nfs/Share
```

---

## 四、注意事项

- LXC 容器内的挂载点路径必须预先创建好
- 多容器共享同一 NFS 目录时，注意文件权限一致性
- NFS 服务端（UNRAID NAS）必须比使用该挂载的 LXC 容器更早启动，否则 Docker 容器可能起不来。建议在 PVE 中设置 NAS 虚拟机的启动顺序为 0，延迟 30 秒后再启动其他容器
