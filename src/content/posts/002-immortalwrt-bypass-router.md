---
title: 家庭数据中心 PVE
titleEm: ImmortalWrt 旁路由虚拟机
date: 2025-03-25
category: 技术
tags: [Proxmox, 网络, 旁路由]
description: 在 PVE 中部署 ImmortalWrt 作为旁路由，实现透明代理与网络分流。
readTime: 5 min
words: 500
featured: false
num: "Nº 002"
---

> ImmortalWrt 是 OpenWrt 的一个分支，常用于旁路由场景。本篇记录在 PVE 中以虚拟机方式部署的完整流程。

## 前置条件

- PVE 已完成基础初始化（见 Nº 001）
- 已创建 ZFS 存储池（或其他目标存储）
- 本机可正常访问互联网

## 一、下载与导入固件

### 1. 下载固件

[单独下载 immortalwrt-24.10.0-x86-64-generic-squashfs-combined-efi.img.gz](https://downloads.immortalwrt.org/releases/24.10.0/targets/x86/64/immortalwrt-24.10.0-x86-64-generic-squashfs-combined-efi.img.gz)

下载完成后解压，得到 `.img` 文件。

### 2. 上传并导入磁盘

将 `.img` 文件上传到 PVE，文件会被放置在 `/var/lib/vz/template/iso/` 中。

执行以下命令将镜像导入虚拟机（我的虚拟机 ID 为 901，存储位置为 `vm-zfs-M2`，按实际情况修改）：

```bash
qm importdisk 901 /var/lib/vz/template/iso/immortalwrt-24.10.0-x86-64-generic-squashfs-combined-efi.img vm-zfs-M2
```

## 二、虚拟机配置

### 1. 创建虚拟机

正常流程创建虚拟机，在磁盘选择步骤选择**不使用介质**（即不挂载 ISO，磁盘留空）。

### 2. 调整启动顺序

进入虚拟机的 **Options → Boot Order**，将上一步导入的新磁盘设置为首选启动项，其余项禁用。

## 三、网络与 IP 设定

启动虚拟机后进入控制台，编辑网络配置文件：

```bash
vi /etc/config/network
```

修改 `lan` 接口的 IP 地址为你规划的旁路由地址，保存后重启：

```bash
reboot
```

## 四、OpenClash 配置

重启后通过浏览器访问 ImmortalWrt 的 Web 界面：

1. 进入 **网络 → 接口**，完成接口配置
2. 安装并配置 **OpenClash** 插件，实现透明代理与分流

> OpenClash 的具体配置取决于你的代理节点和规则，此处不再展开。
