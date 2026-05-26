---
title: 家庭数据中心 PVE
titleEm: DDNS + Nginx 反向代理
date: 2025-08-02
category: 技术
tags: [DDNS, Nginx, 反向代理, Cloudflare]
description: 使用 DDNS-GO + Nginx Proxy Manager 实现动态域名与反向代理，配合 Cloudflare 托管域名。
readTime: 6 min
words: 800
featured: false
num: "Nº 008"
---

> 参考教程：[SP.05 反向代理 Nginx](https://www.bilibili.com/video/BV1HKkZYVEBR/) · [反向代理 Nginx（文本版）](https://www.yuque.com/hongcha-6c6o6/phdu9c/upu31c6df3mug6ur?singleDoc#)

---

## 一、前置条件

- 新开一个 LXC 容器
- 已有域名（推荐 [us.kg](https://domain.digitalplat.org/) 免费域名）
- Cloudflare 账号

---

## 二、拉取镜像

```bash
docker pull jlesage/nginx-proxy-manager:v25.06.1
docker pull jeessy/ddns-go
```

---

## 三、Docker Compose 部署

### DDNS-GO

```yaml
version: '3.8'
services:
  ddns-go:
    image: jeessy/ddns-go
    container_name: ddns-go
    restart: always
    network_mode: host
    volumes:
      - /mnt/appdata/ddns-go:/config
```

### Nginx Proxy Manager

```yaml
version: '3'
services:
  nginx-proxy-manager:
    image: jlesage/nginx-proxy-manager:v25.06.1
    container_name: nginx-proxy-manager
    network_mode: host
    volumes:
      - /mnt/appdata/nginx-proxy-manager/config:/config
    restart: always
```

> 映射 `/config` 这一个目录就够了，里面包含了所有配置信息。

---

## 四、配置流程

1. 将域名托管到 Cloudflare
2. 用 DDNS-GO 监听域名，自动更新 DNS 记录
3. 用 Nginx Proxy Manager 实现反向代理

---

## 五、友情提示

- **DNS 地址不要用自己家路由器 IP**，建议使用 `114.114.114.114` 或本地运营商 DNS
- 当 iKuai 做主路由时，为获取 IPv6 地址，需要配置 IPv6 和内网 ACL 规则

![](https://cdn.nlark.com/yuque/0/2025/png/55551868/1756555017326-45c783b6-840e-48c1-9b86-d64a2a765374.png)

![](https://cdn.nlark.com/yuque/0/2025/png/55551868/1756555091306-188ad652-c156-4598-9b7e-448cd73b6461.png)

在配置允许进入的 IPv6 地址时，可以使用 `::aaaa:aaaa:aaaa:aaaa/::ffff` 的写法来固定 IPv6 地址后面的 EUI-64。

---

## 参考资料

- [Cloudflare 官网](https://www.cloudflare.com/zh-cn/)
- [域名申请](https://domain.digitalplat.org/)
