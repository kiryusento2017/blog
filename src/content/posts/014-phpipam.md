---
title: 家庭数据中心 PVE
titleEm: phpIPAM 地址管理
date: 2025-12-11
category: 工具
tags: [phpIPAM, IP管理, MariaDB, Docker]
description: 部署 phpIPAM 进行 IP 地址规划与管理，使用外部 MariaDB 数据库，告别 IP 冲突。
readTime: 6 min
words: 700
featured: false
num: "Nº 014"
---

> 参考红茶海教程：[04. IP地址规划和管理](https://www.yuque.com/hongcha-6c6o6/phdu9c/knittmn6gs1f5usw?singleDoc#)

---

## 一、数据库准备

先在 MariaDB（参见 Nº 004）中创建 phpIPAM 所需的数据库和用户：

```sql
mariadb -u root -p

SHOW DATABASES;
SELECT user, host FROM mysql.user;

CREATE DATABASE phpipam;
CREATE USER 'phpipam'@'%' IDENTIFIED BY 'phpipampassword';
GRANT ALL PRIVILEGES ON phpipam.* TO 'phpipam'@'%';
GRANT SELECT ON mysql.user TO 'phpipam'@'%';
FLUSH PRIVILEGES;
```

---

## 二、Docker Compose 部署

```yaml
version: '3'

services:
  phpipam-web:
    image: phpipam/phpipam-www:latest
    container_name: phpipam-www
    ports:
      - "80:80"
    environment:
      - TZ=Asia/Shanghai
      - IPAM_DATABASE_USER=phpipam
      - IPAM_DATABASE_HOST=192.168.4.20
      - IPAM_DATABASE_PASS=phpipampassword
      - IPAM_DATABASE_NAME=phpipam
      - IPAM_DATABASE_PORT=3306
      - IPAM_DATABASE_WEBHOST=%
    restart: always
    volumes:
      - /mnt/appdata/phpipam/phpipam-logo:/phpipam/css/images/logo
      - /mnt/appdata/phpipam/phpipam-ca:/usr/local/share/ca-certificates:ro
    networks:
      - phpipam-network

  phpipam-cron:
    image: phpipam/phpipam-cron:latest
    container_name: phpipam-cron
    environment:
      - TZ=Asia/Shanghai
      - IPAM_DATABASE_USER=phpipam
      - IPAM_DATABASE_HOST=192.168.4.20
      - IPAM_DATABASE_PASS=CYX19991229!@#
      - IPAM_DATABASE_NAME=phpipam
      - IPAM_DATABASE_PORT=3306
      - SCAN_INTERVAL=1h
    restart: always
    volumes:
      - /mnt/appdata/phpipam-ca:/usr/local/share/ca-certificates:ro
    networks:
      - phpipam-network

networks:
  phpipam-network:
    driver: bridge

volumes:
  phpipam-logo:
  phpipam-ca:
```

> 此处使用外部 MariaDB 数据库，移除了 compose 中自带的 `phpipam-mariadb` 服务。

---

## 三、登录使用

1. 浏览器访问 phpIPAM 的 IP 地址（默认端口 80）
2. 首次进入后按需创建子网、IP 段
3. 记录各虚拟机和服务占用的 IP，避免冲突
