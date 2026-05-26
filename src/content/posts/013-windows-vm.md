---
title: 家庭数据中心 PVE
titleEm: Windows 虚拟机
date: 2025-11-20
category: 技术
tags: [Windows, 虚拟机, VirtIO, PVE]
description: 在 PVE 中安装 Windows 虚拟机，含 VirtIO 驱动加载与 ToDesk 远程控制。
readTime: 5 min
words: 600
featured: false
num: "Nº 013"
---

---

## 一、下载所需文件

- **Windows ISO**：[next.itellyou.cn](https://next.itellyou.cn/Original/Index#cbp=Product?ID=f905b2d9-11e7-4ee3-8b52-407a8befe8d1)
- **VirtIO 驱动 ISO**：[virtio-win.iso](https://fedorapeople.org/groups/virt/virtio-win/direct-downloads/stable-virtio/virtio-win.iso)（下载较慢，可自行搜索镜像）

将两个 ISO 上传到 PVE。

---

## 二、创建虚拟机

创建时按需配置即可，不用太纠结细节。以下为参考截图：

![](https://cdn.nlark.com/yuque/0/2025/png/55551868/1756733895025-94204f5a-be95-4b3e-a056-e86145cd68c9.png)
![](https://cdn.nlark.com/yuque/0/2025/png/55551868/1756733906589-710b8546-162e-4ebe-a2e0-eb7d70f31090.png)

选择 SCSI 控制器和 VirtIO 磁盘：

![](https://cdn.nlark.com/yuque/0/2025/png/55551868/1756778221553-063a1911-9d2c-41d6-9164-b59a8c472c85.png)
![](https://cdn.nlark.com/yuque/0/2025/png/55551868/1756778325564-c8eb6b23-cb85-468c-bbb3-78f9ada0d3bc.png)
![](https://cdn.nlark.com/yuque/0/2025/png/55551868/1756778348955-6ec9e677-0d8f-4655-992a-9e9c0045433b.png)

之后常规分配即可，启动！

---

## 三、安装驱动

安装过程中先选择磁盘：

![](https://cdn.nlark.com/yuque/0/2025/png/55551868/1756734077448-59d38ae5-e97d-4bd1-83ef-df9f23423860.png)

安装完成后，打开设备管理器，找到有感叹号的未知设备：

![](https://cdn.nlark.com/yuque/0/2025/png/55551868/1756734727034-fc962c7b-d77c-45fa-b17e-62af9b1ba6d4.png)

浏览电脑以安装驱动：

![](https://cdn.nlark.com/yuque/0/2025/png/55551868/1756734755178-4a6af112-bf37-4f43-a60b-0cfcc0b89ab4.png)

选择 VirtIO 驱动目录安装：

![](https://cdn.nlark.com/yuque/0/2025/png/55551868/1756734815556-be4171f5-90cd-4dbf-a5ff-948a652768d9.png)

---

## 四、使用场景

我装 Windows 虚拟机的主要用途就是运行 ToDesk，方便在网络不通畅时远程控制 NAS。

正常联网即可使用，不需要额外配置。
