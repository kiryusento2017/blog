---
title: 家庭数据中心 PVE
titleEm: 前言与基础操作
date: 2025-03-07
category: 技术
series: ["家庭数据中心 PVE 系列"]
tags: [Proxmox, 家庭服务器, Linux]
description: 搭建家庭数据中心的起点：PVE 初始化、换源、内核管理与基础网络配置。
readTime: 8 min
words: 900
featured: false
num: "Nº 001"
---

> 网络核心思想：存算分离。如有错误，请评论告知我，我非圣贤，孰能无过？

参考教程（红茶海）：[家庭数据中心教程汇总](https://www.yuque.com/hongcha-6c6o6/klr1op/xqao5sggi82efuet?singleDoc#)

## 零、前言

1. 操作均使用红茶海的 ubuntu24.04LTS 模板 [夸克网盘分享](https://pan.quark.cn/s/6799e4254f27?pwd=P6kc#/list/share)，您亦可以使用其他模板，但是请注意切换控制台。

2. 若与我使用同一款操作台，请记得安装语言包。

3. 建议平时备份几个 PVE 的内核，以备不时之需，万一一个内核在设置中出了问题，无法启动，还可以有其他内核选择。

```bash
# 更新软件包列表
apt update
# 搜索可用的 PVE 内核
apt search proxmox-kernel | grep pve-signed
# 安装特定版本（如 6.8.12-17）
apt install proxmox-kernel-6.8.12-17-pve-signed
# 安装特定版本的头文件
wget http://mirrors.nju.edu.cn/proxmox/debian/dists/bookworm/pve-no-subscription/binary-amd64/proxmox-headers-6.8.12-17-pve_6.8.12-13_amd64.deb
dpkg -i proxmox-headers-6.8.12-17-pve_6.8.12-17_amd64.deb
# 检查内核完整度
ls -la /boot/*6.8.12-17-pve*
proxmox-boot-tool kernel add 6.8.12-17-pve
# 将内核手动添加到引导项
update-grub
proxmox-boot-tool refresh
# 刷新引导配置
```

> 机器连上 HDMI 线开机重启，确认能在启动菜单选择到该内核。

## 一、换源与订阅清理

### 1. 换源

进入 Proxmox VE 后先禁用企业级 enterprise 订阅源，然后换源（推荐南京大学源，软件包最全）：

```bash
bash <(curl -sSL https://linuxmirrors.cn/main.sh)
```

### 2. 删除订阅弹窗

```bash
sed -i_orig "s/data.status === 'Active'/true/g" /usr/share/pve-manager/js/pvemanagerlib.js
sed -i_orig "s/if (res === null || res === undefined || \!res || res/if(/g" /usr/share/javascript/proxmox-widget-toolkit/proxmoxlib.js
sed -i_orig "s/.data.status.toLowerCase() !== 'active'/false/g" /usr/share/javascript/proxmox-widget-toolkit/proxmoxlib.js
systemctl restart pveproxy
```

## 二、网卡绑定

防止因增减 PCIe 设备导致网卡名称变动。原理：创建 systemd link 文件，将 MAC 地址绑定到固定网口名称。

首先用 `ip a` 查看网卡 MAC 地址，然后创建配置文件：

```bash
nano /usr/lib/systemd/network/50-custom-net0.link
```

填写以下内容（修改为自己的 MAC 地址和网口名称）：

```
[Match]
MACAddress=50:e9:71:01:e0:16

[Link]
Name=enp4s0
```

常用查询命令：

```bash
ip a      # 查看网卡信息
lspci     # 查看 PCIe 设备
```

## 三、SSH 与初始化

### 1. 确认 SSH 状态

```bash
systemctl status ssh
```

默认应已开启。

### 2. 安装目录树（可选）

```bash
apt update && apt install tree
```

### 3. 其他初始化建议

- 创建 ZFS 池专门用于存储虚拟机
- 创建资源池
- 开启彩色标签，方便区分不同类型的虚拟机
- **DNS 地址千万不要填自己家的路由器 IP**，推荐使用 `114.114.114.114` 或运营商 DNS
