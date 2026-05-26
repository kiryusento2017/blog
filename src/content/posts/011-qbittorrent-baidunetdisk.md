---
title: 家庭数据中心 PVE
titleEm: qBittorrent + 百度网盘
date: 2025-10-05
category: 工具
tags: [qBittorrent, 百度网盘, PT, Docker]
description: 在 Docker 中部署 qBittorrent 和百度网盘，通过 macvlan 分配独立 IP，含 PT 优化设置与端口转发。
readTime: 8 min
words: 1000
featured: false
num: "Nº 011"
---

> 参考红茶海教程：[S2.05 PT下载软件的容器化部署](https://www.yuque.com/hongcha-6c6o6/klr1op/aegp0fev53b2k1vy?singleDoc#)

---

## 一、qBittorrent 部署

### 方案一：通用版（支持 macvlan + bridge）

```yaml
services:
  qbittorrent:
    image: lscr.io/linuxserver/qbittorrent:5.0.1
    container_name: qbittorrent
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Etc/GMT-8
      - WEBUI_PORT=8080
      - TORRENTING_PORT=6881
    volumes:
      - /docker固化路径/qbittorrent/appdata:/config:rw
      - /下载临时保存固化路径:/downloads/qbincomplete:rw
      - /下载保存固化路径/complete1:/downloads/complete1:rw
      - /下载保存固化路径/complete2:/downloads/complete2:rw
    ports:
      - 8080:8080
      - 6881:6881
      - 6881:6881/udp
    networks:
      macvlan:
        ipv4_address: A.B.C.D
    restart: unless-stopped

networks:
  macvlan:
    external: true
```

### 方案二：影音专用版（绑定 NFS 媒体目录）

```yaml
services:
  qbittorrent:
    image: lscr.io/linuxserver/qbittorrent:4.6.0
    container_name: qbittorrent-media
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Etc/GMT-8
    volumes:
      - /mnt/appdata/qbittorrent-media/config:/config
      - /mnt/nfs/media:/media
    networks:
      macvlan1:
        ipv4_address: 192.168.4.11
    restart: always

networks:
  macvlan1:
    external: true
```

### 方案三：下载专用版

```yaml
services:
  qbittorrent:
    image: lscr.io/linuxserver/qbittorrent:4.6.0
    container_name: qbittorrent-download
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Etc/GMT-8
    volumes:
      - /mnt/appdata/qbittorrent-download/config:/config
      - /mnt/nfs/download:/downloads
    networks:
      macvlan1:
        ipv4_address: 192.168.4.12
    restart: always

networks:
  macvlan1:
    external: true
```

---

## 二、qBittorrent 优化设置

- 最大连接数：200
- 每个种子最大连接数：20
- 全局上传数：20
- 每个种子上传数量：20
- 排序方式：推荐顺序写入

如果需要反向代理 qb，请在设置中勾选相应选项：

![](https://cdn.nlark.com/yuque/0/2025/png/55551868/1756470514928-2a7a8b08-f5ef-4836-bf4c-472709b7d50a.png)

---

## 三、端口转发

**务必在路由器中设置端口转发**，确保 qb 的连接状态显示为正常（地球图标）而非防火墙（火焰图标）。

连接正常：![](https://cdn.nlark.com/yuque/0/2025/png/55551868/1756611319225-74619fce-b275-447a-ba3c-1b4d19796a68.png)
有防火墙：![](https://cdn.nlark.com/yuque/0/2025/png/55551868/1756611346032-2eaa5429-56e3-46a6-bcff-a2f47001e902.png)

其他推荐配置截图：

![](https://cdn.nlark.com/yuque/0/2025/png/55551868/1756654701451-46ff1579-65a0-4f37-8ae9-fc67ec7c7d2f.png)
![](https://cdn.nlark.com/yuque/0/2025/png/55551868/1756635864123-6ac11fba-58b1-4ca8-a128-9dfa9dac325d.png)
![](https://cdn.nlark.com/yuque/0/2025/png/55551868/1756637977139-e25fa028-f124-4925-a4e7-e10fc38b9a18.png)

---

## 四、百度网盘部署

```yaml
services:
  baidunetdisk:
    image: johngong/baidunetdisk:latest
    container_name: baidunetdisk
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Etc/GMT-8
    volumes:
      - /mnt/appdata/baidunetdisk/config:/config
      - /mnt/nfs/media:/config/baidunetdiskdownload
    networks:
      macvlan1:
        ipv4_address: 192.168.4.17
    restart: always

networks:
  macvlan1:
    external: true
```

> **注意**：百度网盘通过 VNC 方式连接控制，因此操作设备的 IP 必须与容器在同一网段。
