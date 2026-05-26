---
title: 家庭数据中心 PVE
titleEm: Emby + MoviePilot 影视服务
date: 2025-10-29
category: 工具
tags: [Emby, MoviePilot, 影视, Docker]
description: 部署 Emby 媒体服务器与神医助手，实现片头片尾自动标记与追更，打造家庭影音中心。
readTime: 7 min
words: 900
featured: false
num: "Nº 012"
---

> 参考：[MoviePilot-v2 部署配置](https://www.yuque.com/kiryusento/unmhad/cifkzsybl4zefym2) · [IPTV-AIO 肥羊版](https://www.yuque.com/hongcha-6c6o6/klr1op/slkgfsikr03mvq1c?singleDoc#)

---

## 一、前置条件

- 已创建 macvlan 网络
- 已通过 NFS 挂载媒体目录到容器

---

## 二、Emby Server 部署

```yaml
services:
  emby:
    image: amilys/embyserver:latest
    container_name: embyserver
    hostname: EmbyServer
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Etc/GMT-8
    volumes:
      - /mnt/appdata/emby/config:/config
      - /mnt/nfs/media:/data/tvshows
    networks:
      macvlan2:
        ipv4_address: 192.168.4.14
    restart: always

networks:
  macvlan2:
    external: true
    name: macvlan2
```

> 部署完成后去 WebUI 重启一下 Emby 服务。如果使用 LXC 容器，无法直通核显，`/dev/dri` 设备映射需注释掉。

---

## 三、安装神医助手

如需更换神医助手版本，前往 [Strm Assistant](https://github.com/) 的 GitHub 下载对应版本，然后移动到 Emby 的插件目录中。

---

## 四、配置片头片尾标记

### 第一步：Emby 中开启片头标记

![](https://cdn.nlark.com/yuque/0/2025/png/55551868/1756728060917-8a6a4f02-b496-4260-a425-c32321f2f566.png)

### 第二步：追更模式中启用原生片头探测

将主线控制调整到 20，可加快原生片头探测速度。

![](https://cdn.nlark.com/yuque/0/2025/png/55551868/1756728075260-0e467420-927e-4f0e-9d87-9b698836f776.png)

### 第三步：片头片尾探测中开启原生探测增强

开启后扫描媒体库即可。

![](https://cdn.nlark.com/yuque/0/2025/png/55551868/1756728086125-4a8b5938-11c8-4ec2-b9e7-75ec7b396f1a.png)

---

## 五、查看日志

实时监控扫描日志：

```bash
tail -f embyserver.txt
```

正常扫描时会显示类似的日志输出：

![](https://cdn.nlark.com/yuque/0/2025/png/55551868/1756728597652-e2346c22-43fe-41b1-83cf-37ab006e86f2.png)
