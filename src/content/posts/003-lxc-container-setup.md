---
title: 家庭数据中心 PVE
titleEm: LXC 容器模板部署
date: 2025-04-12
category: 技术
tags: [Proxmox, LXC, Docker]
description: LXC 容器的初始化配置全流程：时区、SSH、换源、Docker 安装、Portainer 部署、乱码修复与 Macvlan 网络。
readTime: 10 min
words: 1100
featured: false
num: "Nº 003"
---

> 可直接使用红茶海的 LXC 模板，也可从 PVE 官方下载。本篇记录从零开始完整初始化一个 LXC 容器的全过程。

参考教程（红茶海）：[家庭数据中心教程汇总](https://www.yuque.com/hongcha-6c6o6/klr1op/xqao5sggi82efuet?singleDoc#)

- PVE 官方模板镜像：[http://download.proxmox.com/](http://download.proxmox.com/)
- LXC 容器模板列表：[http://download.proxmox.com/images/system/](http://download.proxmox.com/images/system/)

## 注意事项

**控制台无法跳出的问题：**

LXC 容器控制台默认使用 tty，要求路径为 `/dev/ttyx`：

- **ubuntu24.04** 下，`ttyx` 确实位于 `/dev/ttyx`，正常
- **ubuntu24.10** 下，`tty` 不再位于 `/dev/ttyx`，此时请切换控制台为 **shell**

**Docker 容器无法运行的问题：**

使用红茶海的 **ubuntu24.04** LXC 模板时，若 Docker 容器无法运行，原因通常是没有开启 LXC 的**嵌套**功能，请在容器选项中开启嵌套与按键。

## 一、时区与 SSH

### 1. 修改时区

```bash
sudo timedatectl set-timezone Asia/Shanghai
```

### 2. 确认 SSH 状态

```bash
sudo systemctl status ssh
```

如果 SSH 未开启，执行以下命令强制允许密码登录与 root 远程登录：

```bash
echo -e "PasswordAuthentication yes\nPermitRootLogin yes" > /etc/ssh/sshd_config.d/edit.conf
```

SSH 管理命令（按需使用）：

```bash
sudo systemctl start ssh    # 开启 SSH
sudo systemctl stop ssh     # 停用 SSH
sudo systemctl enable ssh   # 设置开机自启
```

## 二、换源与 Docker 安装

建议看懂后分步执行：

```bash
sudo apt update -y                                          # 刷新软件源列表
sudo apt upgrade -y                                         # 升级已安装软件包
apt install curl -y                                         # 安装 curl
bash <(curl -sSL https://linuxmirrors.cn/main.sh)           # 系统换源
bash <(curl -sSL https://linuxmirrors.cn/docker.sh)         # Docker 换源并安装
sudo apt install net-tools -y                               # 安装 net-tools
```

### 加速镜像地址更换（特别鸣谢：红茶海）

```bash
bash <(curl -sSL https://raw.githubusercontent.com/GoGoBlacktea/Home.Data.Center/main/docker.speeder.sh)
```

## 三、Portainer 部署

```bash
sudo docker volume create portainer_data
sudo docker run -d -p 8000:8000 \
  -p 9443:9443 \
  --name portainer \
  --restart=always \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v portainer_data:/data \
  6053537/portainer-ce:2.24.1
```

部署完成后访问 `https://<容器IP>:9443` 进入 Portainer 管理界面。

## 四、解决 LXC 容器乱码问题

首先查询当前语言包：

```bash
locale
```

![](https://cdn.nlark.com/yuque/0/2025/webp/55551868/1755970231447-7a4c773a-52ae-48b5-b59b-3ebf116dd4cd.webp)

安装中文语言包（pgUp / pgDn 可快速翻页）：

```bash
sudo dpkg-reconfigure locales
```

![](https://cdn.nlark.com/yuque/0/2025/webp/55551868/1755970231491-00e566f6-e8c1-4523-af88-76d7436cf020.webp)

在界面中找到以下两项，按空格选中，回车两次确认安装：

- **zh_CN.UTF-8 UTF-8**
- **en_US.UTF-8 UTF-8**

![](https://cdn.nlark.com/yuque/0/2025/webp/55551868/1755970231459-39d0ba00-d2be-4805-8db0-13a5a5336141.webp)

切换语言包为中文：

```bash
LANG=zh_CN.UTF-8
LC_ALL=zh_CN.UTF-8
```

再次执行 `locale` 确认已切换：

![](https://cdn.nlark.com/yuque/0/2025/webp/55551868/1755970231493-167076af-cc2e-40da-bccb-94cb52815cf5.webp)

## 五、添加 Macvlan 网络

> Macvlan 的特性决定了使用该网络的容器将与宿主机网络隔离，容器可直接获得独立 IP。

```bash
sudo docker network create -d macvlan \
  --subnet=192.168.4.0/23 \
  --ip-range=192.168.4.0/24 \
  --gateway=192.168.5.1 \
  -o parent=eth0 \
  macvlan1

sudo docker network create -d macvlan \
  --subnet=192.168.4.0/23 \
  --ip-range=192.168.5.0/24 \
  --gateway=192.168.4.2 \
  -o parent=eth0 \
  macvlan2
```

> 如果你使用 DHCP，请务必限制好 `ip-range`；如果使用静态地址，`ip-range` 可以随意设置。

至此，这套配置可以作为 LXC 容器的标准模板保存使用。
