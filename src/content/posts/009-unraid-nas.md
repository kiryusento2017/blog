---
title: 家庭数据中心 PVE
titleEm: UNRAID NAS 虚拟机
date: 2025-08-26
category: 技术
series: ["家庭数据中心 PVE 系列"]
tags: [UNRAID, NAS, PVE]
description: 在 PVE 中部署 UNRAID 开心版虚拟机作为 NAS 存储系统，含 U 盘制作、虚拟机创建与硬盘直通。
readTime: 6 min
words: 700
featured: false
num: "Nº 009"
---

> 参考：[制作 Unraid 开心版启动盘_v6.12.11.pdf](https://www.yuque.com/attachments/yuque/0/2026/pdf/55551868/1771914824129-4ae93504-8975-4b1c-b243-fc2fa685b032.pdf)

---

## 一、前置条件

- 购买带有 GUID 的 U 盘（UNRAID 授权绑 GUID）
- 下载 UNRAID happy-version
- 下载 [UNRAID USB Creator 工具](https://unraid.net/download)

---

## 二、制作启动 U 盘

1. 使用 U 盘工具擦除 U 盘
2. 记录下 U 盘的 GUID
3. 将 U 盘重命名为 `UNRAID`
4. 复制文件进入 U 盘
5. 打开 `go` 文件，修改 GUID 为你的 U 盘 GUID
6. 以管理员权限执行 Windows 批量处理文件

---

## 三、创建 PVE 虚拟机

- 不使用任何安装介质
- 机型选择 **q35**（新机型）
- 取消预注册密钥
- BIOS 使用 **UEFI**（OVMF）
- 磁盘给 1G 即可
- CPU 可以使用 **host** 类型

![](https://cdn.nlark.com/yuque/0/2025/png/55551868/1756296656765-b587a3d4-43a9-4ebf-a07b-7c0077fec50c.png)

![](https://cdn.nlark.com/yuque/0/2025/png/55551868/1756296720383-14e659e5-bce6-4720-a8d1-c5c5e013d8d5.png)

![](https://cdn.nlark.com/yuque/0/2025/png/55551868/1756296768793-d7b13fe3-522c-407d-bab4-89aa1d506c2c.png)

---

## 四、挂载 U 盘与直通硬盘

1. 创建好虚拟机后，将 U 盘挂载上去
2. 按常规流程启动并登录 UNRAID
3. 参照硬盘直通篇（Nº 005），将数据硬盘直通给 UNRAID 虚拟机

---

## 五、注意事项

- **务必关闭直通硬盘的备份**：否则备份任务会把整个数据盘备份到宿主机，存储直接爆炸
- 建议设置 UNRAID 虚拟机的启动顺序为 0，确保它在所有依赖 NFS 的 LXC 容器之前启动
