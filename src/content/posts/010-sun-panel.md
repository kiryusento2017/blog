---
title: 家庭数据中心 PVE
titleEm: Sun-Panel 导航面板
date: 2025-09-14
category: 工具
series: ["家庭数据中心 PVE 系列"]
tags: [Sun-Panel, 导航, Docker, HD-Icons]
description: 部署 Sun-Panel 导航面板和 HD-Icons 图标库，通过 macvlan 分配固定 IP，打造家庭数据中心统一入口。
readTime: 5 min
words: 600
featured: false
num: "Nº 010"
---

> 只提供 compose，镜像自己拉。记得定期备份配置。

---

## 一、Sun-Panel 导航面板

```yaml
version: "3.2"
services:
  sun-panel:
    image: 'hslr/sun-panel:latest'
    container_name: sun-panel
    hostname: Sun-Panel
    volumes:
      - /mnt/appdata/sun-panel/conf:/app/conf
      - /mnt/appdata/sun-panel/uploads:/app/uploads
      - /mnt/appdata/sun-panel/database:/app/database
      - /var/run/docker.sock:/var/run/docker.sock
      - /mnt/appdata/sun-panel/runtime:/app/runtime
    ports:
      - 3002:3002
    environment:
      TZ: Etc/GMT-8
    networks:
      macvlan1:
        ipv4_address: 192.168.4.8
    restart: always

networks:
  macvlan1:
    external: true
```

---

## 二、HD-Icons 图标库

```yaml
version: "3.8"
services:
  hd-icons:
    image: xushier/hd-icons:latest
    container_name: HD-Icons
    ports:
      - 50560:50560
    volumes:
      - /mnt/appdata/HD-Icons/icons:/app/icons
    networks:
      macvlan2:
        ipv4_address: 192.168.4.9
    restart: unless-stopped

networks:
  macvlan2:
    external: true
```

可选的额外配置：

```yaml
# 如果首次使用日志一直显示卡在 git clone，可添加代理变量
# environment:
#   - ALL_PROXY=http://192.168.1.2:7890
#   - CUSTOM_URL=http://xxx.xxx.xxx/icons/HD-Icons
#   - TITLE=小迪的图标库
```

---

## 三、部署后操作

1. 访问 Sun-Panel 面板，按需添加各服务的链接
2. 配合 HD-Icons 图标库，为每个服务配置专属图标
3. 后续可通过 Nginx Proxy Manager（Nº 008）为面板配置域名反向代理

---

## 四、注意事项

- 记得备份 `/mnt/appdata/sun-panel/` 下的配置，避免重新配置的麻烦
- 首次使用 HD-Icons 时若卡在 git clone，说明网络无法连接 GitHub，可添加 `ALL_PROXY` 环境变量设置代理
