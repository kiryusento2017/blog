---
title: 家庭数据中心 PVE
titleEm: 前言与基础操作
date: 2026-05-26
category: 技术
tags: [Proxmox, 家庭服务器, Linux]
description: 搭建家庭数据中心的起点：PVE 初始化、换源、内核管理与基础网络配置。
readTime: 8 min
words: 900
featured: false
num: "Nº 013"
---

网络核心思想：存算分离

如有错误，请评论告知我，我非圣贤，孰能无过？

参考教程（红茶海）： [家庭数据中心教程汇总](https://www.yuque.com/hongcha-6c6o6/klr1op/xqao5sggi82efuet?singleDoc#)

## 零、前言

1. 操作均使用红茶海的 ubuntu24.04LTS 模板[夸克网盘分享](https://pan.quark.cn/s/6799e4254f27?pwd=P6kc#/list/share)，您亦可以使用其他模板，但是请注意切换控制台。

2. 若与我使用同一款操作台，请记得安装语言包。

3. 建议平时备份几个 pve 的内核，以备不时之需，万一一个内核在设置中出了问题，无法启动，还可以有其他内核选择

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
# 安装头文件
ls -la /boot/*6.8.12-17-pve*
# 检查内核完整度
proxmox-boot-tool kernel add 6.8.12-17-pve
# 将内核手动添加到引导项
update-grub
# 更新 grub 选项
proxmox-boot-tool refresh
# 刷新引导配置
然后机器连上 hdmi 线开机重启试试看能不能选择这个内核
```

## 一、基础操作

1. 进入 Proxmox VE 后先禁用企业级 enterprise，然后进行换源，命令（选择南京大学源）

```bash
bash <(curl -sSL https://linuxmirrors.cn/main.sh)
# 发现使用南京大学源的时候，存储库里面的东西会很全
```

2. 此后删除订阅弹窗提示

```bash
sed -i_orig "s/data.status === 'Active'/true/g" /usr/share/pve-manager/js/pvemanagerlib.js
sed -i_orig "s/if (res === null || res === undefined || \!res || res/if(/g" /usr/share/javascript/proxmox-widget-toolkit/proxmoxlib.js
sed -i_orig "s/.data.status.toLowerCase() !== 'active'/false/g" /usr/share/javascript/proxmox-widget-toolkit/proxmoxlib.js
systemctl restart pveproxy
```

3. 绑定网卡，防止因为增减 PCIe 设备而发生变动。原理：创建一个文件以此绑定，首先使用 `ip a` 查看你的网卡 MAC 地址，然后使用以下命令创建并填写文件

```bash
nano /usr/lib/systemd/network/50-custom-net0.link
# 创建一个文件用于绑定 mac 地址和物理网口
# 复制以下文字进去，注意修改为自己的 MAC 地址
[Match]
MACAddress=50:e9:71:01:e0:16

[Link]
Name=enp4s0

# 额外代码
ip a
# 查看网卡
lspci
# 查看 PCIe 设备
```

4. 查看有没有开启 SSH（默认应该是开启的）

```bash
systemctl status ssh
```

5. 安装目录树（方便看，可以不安装）

```bash
apt update
apt install tree
```

6. 我还会创建一下 ZFS 池专门用于存储虚拟机

7. 创建资源池

8. 开启彩色标签

9. DNS 地址千万千万不要放自己家的路由器 IP
