# PVE 家庭数据中心笔记迁移 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 `家庭数据中心PVE笔记 (1).md`（2085 行，24 章）拆分为 22 篇独立博客文章（slug 013–034），写入 `src/content/posts/`。

**Architecture:** 每个顶层章节（`# 章节名`）对应一篇文章，frontmatter 手写，正文从源文件提取并做格式清理。零+一两章合并为第一篇（013），五（已废弃）和二十（失败）跳过。

**Tech Stack:** Astro 6 Content Collections（glob loader），Markdown，frontmatter schema 见 `src/content.config.ts`

---

## 内容转换规则（所有文章通用）

每篇文章写入前，对从源文件提取的正文做以下处理：

1. **标题降级**：源文件中的 `# 章节名` → `## 章节名`（H1 已由文章模板渲染，body 里不应再有 H1）
2. **代码块内的 `#` 注释**：保持不动（在 ` ``` ` 栅栏内）
3. **剥离 `<font>` 标签**：`<font style="...">七、文件的挂载</font>` → `七、文件的挂载`
4. **删除 Yuque OCR 注释**：移除所有 `<!-- 这是一张图片，ocr 内容为：...-->` 注释块
5. **bullet 符号**：源文件用 `+` 作为列表项时，统一换成 `-`
6. **链接标题**：章节标题中含链接的（如 `[moviepilot-v2 的部署...](url)`），保留文字、去掉链接
7. **图片**：Yuque CDN 图片（`cdn.nlark.com`）保持原样，公开可访问性视情况而定

---

## 文件结构

```
src/content/posts/
  013-pve-homelab-basics.md          ← Task 1（验证文章，零+一章合并）
  014-immortalwrt-bypass-router.md   ← Task 2
  015-lxc-container-setup.md         ← Task 3
  016-mariadb-postgresql-lxc.md      ← Task 4
  017-pve-disk-passthrough.md        ← Task 5
  018-pve-nfs-mount.md               ← Task 6
  019-influxdb-grafana-monitor.md    ← Task 7
  020-ddns-go-nginx-proxy.md         ← Task 8
  021-unraid-nas-vm.md               ← Task 9
  022-sun-panel-hd-icons.md          ← Task 10
  023-qbittorrent-baidunetdisk.md    ← Task 11
  024-emby-moviepilot.md             ← Task 12
  025-windows-vm-pve.md              ← Task 13
  026-mariadb-docker.md              ← Task 14
  027-postgresql-docker.md           ← Task 15
  028-phpipam-ip-management.md       ← Task 16
  029-immich-photo-server.md         ← Task 17
  030-homeassistant-setup.md         ← Task 18
  031-iptv-live-source.md            ← Task 19
  032-oci-mariadb-migration.md       ← Task 20
  033-music-system-navidrome.md      ← Task 21
  034-proxy-node-setup.md            ← Task 22
```

跳过章节：
- `# ~~五、虚拟机OVM~~`（第 473 行，已废弃）
- `# 二十、核显的直通（失败）`（第 1695 行，实验失败）

---

## 源文件章节行号索引

| slug | 章节 | 源文件行范围 |
|------|------|-------------|
| 013 | 零+一（前言+基础操作） | 1–91 |
| 014 | 二（immortalwrt） | 92–112 |
| 015 | 三（LXC 容器） | 113–250 |
| 016 | 四（MariaDB+PostgreSQL LXC） | 251–472 |
| 017 | 六（硬盘直通） | 524–614 |
| 018 | 七（文件挂载） | 615–635 |
| 019 | 八（InfluxDB+Grafana） | 636–889 |
| 020 | 九（DDNS-GO+Nginx） | 890–963 |
| 021 | 十（UNRAID NAS） | 964–985 |
| 022 | 十一（Sun-Panel+HD-Icons） | 986–1044 |
| 023 | 十二（qBittorrent+百度网盘） | 1045–1170 |
| 024 | 十三（Emby+MoviePilot） | 1171–1233 |
| 025 | 十四（Windows VM） | 1234–1279 |
| 026 | 十五（MariaDB Docker） | 1280–1316 |
| 027 | 十六（PostgreSQL Docker） | 1317–1350 |
| 028 | 十七（phpIPAM） | 1351–1420 |
| 029 | 十八（Immich） | 1421–1626 |
| 030 | 十九（HomeAssistant） | 1627–1694 |
| 031 | 二十一（IPTV 直播源） | 1812–1920 |
| 032 | 第二十二（OCI MariaDB） | 1921–1939 |
| 033 | 第二十三（音乐系统） | 1940–1952 |
| 034 | 第二十四（节点搭建） | 1953–2085 |

---

## Task 1: 创建验证文章 013（零+一章）

> **⚠️ 暂停点**：完成本 Task 后必须等用户在浏览器确认效果，再继续 Task 2。

**Files:**
- Create: `src/content/posts/013-pve-homelab-basics.md`

- [ ] **Step 1: 创建文章文件**

创建 `src/content/posts/013-pve-homelab-basics.md`，完整内容如下：

````markdown
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
````

- [ ] **Step 2: 在浏览器验证**

启动开发服务器（若未启动）：
```bash
npm run dev
```

打开 `http://localhost:4321/posts/013-pve-homelab-basics`，检查：
- [ ] 标题 "家庭数据中心 PVE" + em "前言与基础操作" 正常显示
- [ ] 代码块正常渲染（有语法高亮或至少等宽字体）
- [ ] `## 零、前言` 和 `## 一、基础操作` 作为 H2 渲染，**不是**原始 `##` 文字
- [ ] 文章出现在 `http://localhost:4321/archive` 的列表中

**如果正文显示的是原始 markdown 符号（`## ` 没有变成标题，代码块显示 ` ``` ` 文字），说明 `[slug].astro` 需要修复**：将 `set:html={post.body}` 改为使用 Astro 的 `render()` 方法。修复方法见下方备注。

> **备注 — 如需修复渲染**：
> 在 `src/pages/posts/[slug].astro` 的 frontmatter 区域加：
> ```js
> const { Content } = await post.render();
> ```
> 然后将 `<div class="content" set:html={post.body} />` 改为：
> ```astro
> <div class="content"><Content /></div>
> ```

- [ ] **Step 3: ⚠️ 暂停，等用户确认**

将截图或 URL 展示给用户确认文章渲染效果无误，再继续 Task 2。

---

## Task 2: 014 — immortalwrt 旁路由

> 继续前请确认 Task 1 已获用户确认。

**Files:**
- Create: `src/content/posts/014-immortalwrt-bypass-router.md`

- [ ] **Step 1: 创建文章文件**

从源文件 `家庭数据中心PVE笔记 (1).md` 第 92–112 行提取正文（章节 `# 二、虚拟机immortalwrt的安装（旁路由）`），按通用规则转换后，创建文件，frontmatter 如下：

```markdown
---
title: immortalwrt 旁路由
titleEm: 安装与配置
date: 2026-05-26
category: 技术
tags: [immortalwrt, 旁路由, 网络, Proxmox]
description: 在 PVE 中部署 immortalwrt x86 虚拟机，配置为旁路由实现透明代理。
readTime: 5 min
words: 350
featured: false
num: "Nº 014"
---
```

正文为源文件第 93–112 行内容，去掉第 92 行的 `# 二、...` 标题行（frontmatter 的 title 已包含该信息），或将其降级为 `## 二、虚拟机 immortalwrt 的安装（旁路由）`。

- [ ] **Step 2: 验证**

访问 `http://localhost:4321/posts/014-immortalwrt-bypass-router`，确认页面正常加载。

---

## Task 3: 015 — LXC 容器模板部署

**Files:**
- Create: `src/content/posts/015-lxc-container-setup.md`

- [ ] **Step 1: 创建文章文件**

源文件第 113–250 行（章节 `# 三、lxc容器的模板部署`）。Frontmatter：

```markdown
---
title: LXC 容器
titleEm: 模板部署
date: 2026-05-26
category: 技术
tags: [LXC, 容器, Proxmox, Ubuntu]
description: 使用红茶海 Ubuntu 24.04 LTS 模板创建 LXC 容器，覆盖常见初始化流程。
readTime: 15 min
words: 1800
featured: false
num: "Nº 015"
---
```

- [ ] **Step 2: 验证**

访问 `http://localhost:4321/posts/015-lxc-container-setup`，确认页面正常加载。

---

## Task 4: 016 — MariaDB 与 PostgreSQL LXC 裸机部署

**Files:**
- Create: `src/content/posts/016-mariadb-postgresql-lxc.md`

- [ ] **Step 1: 创建文章文件**

源文件第 251–472 行（章节 `# 四、MariaDB和PostgreSQL的模板部署`）。Frontmatter：

```markdown
---
title: MariaDB 与 PostgreSQL
titleEm: LXC 裸机部署
date: 2026-05-26
category: 技术
tags: [MariaDB, PostgreSQL, 数据库, LXC]
description: 在 LXC 容器中直接安装 MariaDB 和 PostgreSQL，配置远程访问与基础权限。
readTime: 20 min
words: 2400
featured: false
num: "Nº 016"
---
```

- [ ] **Step 2: 验证**

访问 `http://localhost:4321/posts/016-mariadb-postgresql-lxc`，确认页面正常加载。

---

## Task 5: 017 — PVE 硬盘直通

**Files:**
- Create: `src/content/posts/017-pve-disk-passthrough.md`

- [ ] **Step 1: 创建文章文件**

源文件第 524–614 行（章节 `# 六、硬盘的直通`，跳过第 473–523 行的废弃章节五）。Frontmatter：

```markdown
---
title: PVE 硬盘
titleEm: 直通配置
date: 2026-05-26
category: 技术
tags: [Proxmox, 硬盘直通, 存储]
description: 将宿主机硬盘或整个 HBA 控制器直通给虚拟机，实现 NAS 原生磁盘访问。
readTime: 8 min
words: 1000
featured: false
num: "Nº 017"
---
```

- [ ] **Step 2: 验证**

访问 `http://localhost:4321/posts/017-pve-disk-passthrough`，确认页面正常加载。

---

## Task 6: 018 — PVE 文件 NFS 挂载

**Files:**
- Create: `src/content/posts/018-pve-nfs-mount.md`

- [ ] **Step 1: 创建文章文件**

源文件第 615–635 行（章节 `# <font style="color:rgb(0, 0, 0);">七、文件的挂载</font>`，去掉 `<font>` 标签）。Frontmatter：

```markdown
---
title: PVE 文件
titleEm: NFS 挂载
date: 2026-05-26
category: 技术
tags: [NFS, Proxmox, 存储]
description: 在 PVE 中配置 NFS 挂载，将共享存储路径映射到容器与虚拟机。
readTime: 3 min
words: 300
featured: false
num: "Nº 018"
---
```

- [ ] **Step 2: 验证**

访问 `http://localhost:4321/posts/018-pve-nfs-mount`，确认页面正常加载。

---

## Task 7: 019 — InfluxDB + Grafana 电子看板

**Files:**
- Create: `src/content/posts/019-influxdb-grafana-monitor.md`

- [ ] **Step 1: 创建文章文件**

源文件第 636–889 行（章节 `# 八、电子看板的部署`）。注意第 749、752 行是代码注释中的 `# ` 行，保持不变。Frontmatter：

```markdown
---
title: InfluxDB + Grafana
titleEm: 电子看板部署
date: 2026-05-26
category: 技术
tags: [InfluxDB, Grafana, 监控, Docker]
description: 搭建时序数据库 InfluxDB 与可视化面板 Grafana，实现家庭服务器的实时监控看板。
readTime: 20 min
words: 2400
featured: false
num: "Nº 019"
---
```

- [ ] **Step 2: 验证**

访问 `http://localhost:4321/posts/019-influxdb-grafana-monitor`，确认页面正常加载。

---

## Task 8: 020 — DDNS-GO + Nginx Proxy Manager

**Files:**
- Create: `src/content/posts/020-ddns-go-nginx-proxy.md`

- [ ] **Step 1: 创建文章文件**

源文件第 890–963 行（章节 `# 九、DDNS-GO以及Nginx-Proxy-Manager的部署`）。Frontmatter：

```markdown
---
title: DDNS-GO + Nginx Proxy Manager
titleEm: 公网穿透与反代
date: 2026-05-26
category: 技术
tags: [DDNS, Nginx, 反向代理, 网络]
description: 用 DDNS-GO 自动更新动态公网 IP，配合 Nginx Proxy Manager 实现 HTTPS 反向代理。
readTime: 10 min
words: 1200
featured: false
num: "Nº 020"
---
```

- [ ] **Step 2: 验证**

访问 `http://localhost:4321/posts/020-ddns-go-nginx-proxy`，确认页面正常加载。

---

## Task 9: 021 — UNRAID NAS 虚拟机

**Files:**
- Create: `src/content/posts/021-unraid-nas-vm.md`

- [ ] **Step 1: 创建文章文件**

源文件第 964–985 行（章节 `# 十、PVE中的NAS虚拟机UNRAID的部署`）。Frontmatter：

```markdown
---
title: UNRAID NAS 虚拟机
titleEm: PVE 部署
date: 2026-05-26
category: 技术
tags: [UNRAID, NAS, 虚拟机, Proxmox]
description: 在 PVE 中部署 UNRAID 虚拟机，配合硬盘直通构建家庭 NAS 存储系统。
readTime: 5 min
words: 400
featured: false
num: "Nº 021"
---
```

- [ ] **Step 2: 验证**

访问 `http://localhost:4321/posts/021-unraid-nas-vm`，确认页面正常加载。

---

## Task 10: 022 — Sun-Panel + HD-Icons 导航面板

**Files:**
- Create: `src/content/posts/022-sun-panel-hd-icons.md`

- [ ] **Step 1: 创建文章文件**

源文件第 986–1044 行（章节 `# 十一、导航面板sun-panel和HD-icons的部署`）。Frontmatter：

```markdown
---
title: Sun-Panel + HD-Icons
titleEm: 导航面板搭建
date: 2026-05-26
category: 技术
tags: [Sun-Panel, 导航页, Docker]
description: 部署 Sun-Panel 作为家庭服务导航面板，配合 HD-Icons 实现精美图标管理。
readTime: 8 min
words: 800
featured: false
num: "Nº 022"
---
```

- [ ] **Step 2: 验证**

访问 `http://localhost:4321/posts/022-sun-panel-hd-icons`，确认页面正常加载。

---

## Task 11: 023 — qBittorrent + 百度网盘下载系统

**Files:**
- Create: `src/content/posts/023-qbittorrent-baidunetdisk.md`

- [ ] **Step 1: 创建文章文件**

源文件第 1045–1170 行（章节 `# 十二、qbittorrent和百度网盘下载的部署`）。Frontmatter：

```markdown
---
title: qBittorrent + 百度网盘
titleEm: 下载系统部署
date: 2026-05-26
category: 技术
tags: [qBittorrent, 百度网盘, Docker, 下载]
description: 用 Docker 部署 qBittorrent 和百度网盘客户端，实现自动化下载管理。
readTime: 12 min
words: 1500
featured: false
num: "Nº 023"
---
```

- [ ] **Step 2: 验证**

访问 `http://localhost:4321/posts/023-qbittorrent-baidunetdisk`，确认页面正常加载。

---

## Task 12: 024 — Emby + MoviePilot 媒体库

**Files:**
- Create: `src/content/posts/024-emby-moviepilot.md`

- [ ] **Step 1: 创建文章文件**

源文件第 1171–1233 行（章节 `# 十三、emby和moviepilot-v2的部署配置`，链接标题去掉 URL 保留文字）。Frontmatter：

```markdown
---
title: Emby + MoviePilot
titleEm: 媒体库与自动刮削
date: 2026-05-26
category: 技术
tags: [Emby, MoviePilot, 媒体服务器, Docker]
description: 部署 Emby 媒体服务器并接入 MoviePilot v2 实现影视资源自动整理与元数据刮削。
readTime: 10 min
words: 1000
featured: false
num: "Nº 024"
---
```

- [ ] **Step 2: 验证**

访问 `http://localhost:4321/posts/024-emby-moviepilot`，确认页面正常加载。

---

## Task 13: 025 — Windows 虚拟机

**Files:**
- Create: `src/content/posts/025-windows-vm-pve.md`

- [ ] **Step 1: 创建文章文件**

源文件第 1234–1279 行（章节 `# 十四、windows虚拟机的部署`）。Frontmatter：

```markdown
---
title: Windows 虚拟机
titleEm: PVE 部署
date: 2026-05-26
category: 技术
tags: [Windows, 虚拟机, Proxmox, VirtIO]
description: 在 PVE 中创建 Windows 虚拟机，配置 VirtIO 驱动与远程桌面访问。
readTime: 8 min
words: 800
featured: false
num: "Nº 025"
---
```

- [ ] **Step 2: 验证**

访问 `http://localhost:4321/posts/025-windows-vm-pve`，确认页面正常加载。

---

## Task 14: 026 — MariaDB Docker 部署

**Files:**
- Create: `src/content/posts/026-mariadb-docker.md`

- [ ] **Step 1: 创建文章文件**

源文件第 1280–1316 行（章节 `# 十五、mariaDB的部署`）。Frontmatter：

```markdown
---
title: MariaDB
titleEm: Docker 部署
date: 2026-05-26
category: 技术
tags: [MariaDB, Docker, 数据库]
description: 用 Docker Compose 部署 MariaDB，配置持久化存储与远程访问权限。
readTime: 5 min
words: 500
featured: false
num: "Nº 026"
---
```

- [ ] **Step 2: 验证**

访问 `http://localhost:4321/posts/026-mariadb-docker`，确认页面正常加载。

---

## Task 15: 027 — PostgreSQL Docker 部署

**Files:**
- Create: `src/content/posts/027-postgresql-docker.md`

- [ ] **Step 1: 创建文章文件**

源文件第 1317–1350 行（章节 `# 十六、postgresql的部署`）。Frontmatter：

```markdown
---
title: PostgreSQL
titleEm: Docker 部署
date: 2026-05-26
category: 技术
tags: [PostgreSQL, Docker, 数据库]
description: 用 Docker Compose 部署 PostgreSQL，支持外部数据目录挂载与多库管理。
readTime: 5 min
words: 500
featured: false
num: "Nº 027"
---
```

- [ ] **Step 2: 验证**

访问 `http://localhost:4321/posts/027-postgresql-docker`，确认页面正常加载。

---

## Task 16: 028 — phpIPAM IP 地址管理

**Files:**
- Create: `src/content/posts/028-phpipam-ip-management.md`

- [ ] **Step 1: 创建文章文件**

源文件第 1351–1420 行（章节 `# 十七、phpipam地址管理与规划`）。注意第 1409 行的 `# 注意：...` 是正文注释，不是章节标题，降级处理为普通段落或保持为 `>` 引用块。Frontmatter：

```markdown
---
title: phpIPAM
titleEm: IP 地址管理
date: 2026-05-26
category: 技术
tags: [phpIPAM, IP管理, Docker, MariaDB]
description: 部署 phpIPAM 实现家庭网络 IP 地址规划与子网管理，使用外部 MariaDB 存储数据。
readTime: 8 min
words: 1000
featured: false
num: "Nº 028"
---
```

- [ ] **Step 2: 验证**

访问 `http://localhost:4321/posts/028-phpipam-ip-management`，确认页面正常加载。

---

## Task 17: 029 — Immich 家庭相册服务器

**Files:**
- Create: `src/content/posts/029-immich-photo-server.md`

- [ ] **Step 1: 创建文章文件**

源文件第 1421–1626 行（章节 `# 十八、immich的安装与部署全流程`）。内容最长，约 200 行，注意清理所有 `<font>` 标签和 OCR 注释。Frontmatter：

```markdown
---
title: Immich
titleEm: 家庭相册服务器
date: 2026-05-26
category: 技术
tags: [Immich, 相册, Docker, PostgreSQL]
description: 全流程部署 Immich 私有相册服务，含 PostgreSQL 17 OCI 镜像与外挂数据目录配置。
readTime: 20 min
words: 2400
featured: false
num: "Nº 029"
---
```

- [ ] **Step 2: 验证**

访问 `http://localhost:4321/posts/029-immich-photo-server`，确认页面正常加载。

---

## Task 18: 030 — Home Assistant 部署

**Files:**
- Create: `src/content/posts/030-homeassistant-setup.md`

- [ ] **Step 1: 创建文章文件**

源文件第 1627–1694 行（章节 `# 十九、HomeAssistant的部署以及调试`）。Frontmatter：

```markdown
---
title: Home Assistant
titleEm: 部署与调试
date: 2026-05-26
category: 技术
tags: [HomeAssistant, 智能家居, Docker]
description: 部署 Home Assistant 智能家居平台，接入局域网设备并完成基础自动化配置。
readTime: 10 min
words: 1200
featured: false
num: "Nº 030"
---
```

- [ ] **Step 2: 验证**

访问 `http://localhost:4321/posts/030-homeassistant-setup`，确认页面正常加载。

> **注意**：第 1695–1811 行的 `# 二十、核显的直通（失败）` 章节直接跳过，不创建文章。

---

## Task 19: 031 — IPTV 直播源抓包

**Files:**
- Create: `src/content/posts/031-iptv-live-source.md`

- [ ] **Step 1: 创建文章文件**

源文件第 1812–1920 行（章节 `# 二十一、自家iptv的抓包，制作直播源`）。Frontmatter：

```markdown
---
title: IPTV 直播源
titleEm: 自家抓包制作
date: 2026-05-26
category: 技术
tags: [IPTV, 抓包, 直播源, 组播]
description: 抓取运营商 IPTV 组播流，制作可在家庭局域网内使用的 m3u 直播源文件。
readTime: 12 min
words: 1400
featured: false
num: "Nº 031"
---
```

- [ ] **Step 2: 验证**

访问 `http://localhost:4321/posts/031-iptv-live-source`，确认页面正常加载。

---

## Task 20: 032 — OCI MariaDB 部署与迁移

**Files:**
- Create: `src/content/posts/032-oci-mariadb-migration.md`

- [ ] **Step 1: 创建文章文件**

源文件第 1921–1939 行（章节 `# 第二十二、OCI.MariaDB的部署以及数据库迁移`）。Frontmatter：

```markdown
---
title: OCI MariaDB
titleEm: 部署与数据库迁移
date: 2026-05-26
category: 技术
tags: [OCI, MariaDB, 数据库迁移, 云服务器]
description: 在 Oracle Cloud Infrastructure 上部署 MariaDB 并完成数据库迁移，实现云端备份。
readTime: 3 min
words: 300
featured: false
num: "Nº 032"
---
```

- [ ] **Step 2: 验证**

访问 `http://localhost:4321/posts/032-oci-mariadb-migration`，确认页面正常加载。

---

## Task 21: 033 — 音乐系统 Navidrome 部署

**Files:**
- Create: `src/content/posts/033-music-system-navidrome.md`

- [ ] **Step 1: 创建文章文件**

源文件第 1940–1952 行（章节 `# 第二十三、音乐系统的部署`）。Frontmatter：

```markdown
---
title: 音乐系统
titleEm: Navidrome 部署
date: 2026-05-26
category: 技术
tags: [Navidrome, 音乐服务器, Docker]
description: 部署 Navidrome 自托管音乐服务，管理本地音乐库并支持 Subsonic 协议客户端。
readTime: 3 min
words: 250
featured: false
num: "Nº 033"
---
```

- [ ] **Step 2: 验证**

访问 `http://localhost:4321/posts/033-music-system-navidrome`，确认页面正常加载。

---

## Task 22: 034 — 节点搭建

**Files:**
- Create: `src/content/posts/034-proxy-node-setup.md`

- [ ] **Step 1: 创建文章文件**

源文件第 1953–2085 行（章节 `# 第二十四、节点搭建`）。注意 2030、2034、2037 行的 `# 写入BBR配置` 等行是代码块内注释，保持不动。Frontmatter：

```markdown
---
title: 节点搭建
titleEm: VPS 配置全记录
date: 2026-05-26
category: 技术
tags: [代理, VPS, 节点, 网络, BBR]
description: VPS 节点搭建全流程：系统初始化、BBR 加速、防火墙配置与代理协议部署。
readTime: 12 min
words: 1400
featured: false
num: "Nº 034"
---
```

- [ ] **Step 2: 验证**

访问 `http://localhost:4321/posts/034-proxy-node-setup`，确认页面正常加载。

- [ ] **Step 3: 验证归档页**

访问 `http://localhost:4321/archive`，确认所有 22 篇新文章（013–034）都出现在列表中，分类筛选"技术"正常工作。

---

## 自检

**Spec 覆盖检查：**
- [x] 22 篇文章全部列入任务（013–034）
- [x] 五（废弃）和二十（失败）已明确跳过
- [x] 零+一合并为 013 的决策已记录
- [x] 内容转换规则集中定义，无遗漏
- [x] Task 1 之后有明确暂停点

**Placeholder 扫描：**
- 无 TBD / TODO / "类似 Task N" 的引用
- Tasks 2–22 均有精确行号范围和完整 frontmatter

**一致性检查：**
- frontmatter 字段与 `src/content.config.ts` schema 一致（title, titleEm?, date, category, tags, description, readTime?, words?, featured?, num?）
- category 统一为 `技术`（schema enum 之一）
- num 格式统一为 `"Nº 0XX"`

---

*计划完成。Task 1 可立即执行。*
