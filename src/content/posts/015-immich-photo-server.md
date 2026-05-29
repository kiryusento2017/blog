---
title: 家庭数据中心 PVE
titleEm: Immich 照片管理
date: 2026-01-08
category: 工具
series: ["家庭数据中心 PVE 系列"]
tags: [Immich, 照片管理, PostgreSQL, OCI, Docker]
description: 部署 Immich 照片管理服务，使用 OCI 外挂 PostgreSQL 17 数据库，含向量扩展安装与外挂图库配置。
readTime: 14 min
words: 1800
featured: false
num: "Nº 015"
---

> Immich 是一个自托管的照片和视频管理平台，可替代 Google Photos。

---

## 一、创建 OCI PostgreSQL 17 数据库

在 Oracle Cloud 上创建 PostgreSQL 17 实例。

![](https://cdn.nlark.com/yuque/0/2026/png/55551868/1771082151707-8a59c4a8-a4b3-4b3b-9520-a0fb0945d3c0.png)
![](https://cdn.nlark.com/yuque/0/2026/png/55551868/1771082483697-e9c84222-1287-4f0b-93c3-f78b6c6d0a71.png)

创建时记录下连接信息（主机、端口、用户名、密码）。

![](https://cdn.nlark.com/yuque/0/2026/png/55551868/1771082671270-80a8ca58-480b-4d82-81e8-67c74f020c85.png)

---

## 二、安装向量扩展插件

Immich 需要 pgvector 扩展支持智能搜索。

```bash
apt update
apt install postgresql-17-pgvector
```

---

## 三、修复 template1 字符集

全新数据库需要先删除原模板，创建 UTF-8 编码的新模板：

```sql
su postgres
psql

UPDATE pg_database SET datistemplate = false WHERE datname = 'template1';
DROP DATABASE template1;
CREATE DATABASE template1
  WITH TEMPLATE = template0
  ENCODING = 'UTF8'
  LC_COLLATE = 'C.utf8'
  LC_CTYPE = 'C.utf8';
UPDATE pg_database SET datistemplate = true WHERE datname = 'template1';
```

验证：

![](https://cdn.nlark.com/yuque/0/2026/png/55551868/1771083729029-7bc04ff4-2eec-477a-a14f-7a4780136b7b.png)

---

## 四、创建向量扩展

```sql
CREATE EXTENSION vector;
SELECT * FROM pg_extension WHERE extname = 'vector';
```

---

## 五、创建数据库与用户

```sql
CREATE USER "immich" WITH PASSWORD 'Password';
CREATE DATABASE "immich";
ALTER DATABASE "immich" OWNER TO "immich";
GRANT ALL PRIVILEGES ON DATABASE "immich" TO "immich";

-- DBA 备用账号（忘记用户名时救命）
CREATE USER "DBA" WITH PASSWORD 'Password';
GRANT ALL PRIVILEGES ON DATABASE "immich" TO "DBA";
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO "DBA";

CREATE EXTENSION IF NOT EXISTS vector CASCADE;
ALTER USER "immich" WITH SUPERUSER;
GRANT CREATE ON DATABASE "immich" TO "immich";
```

数据库层面操作到此结束。

---

## 六、拉取镜像

```bash
docker pull ghcr.io/imagegenius/immich:latest
docker pull redis
```

同时确保 NFS 媒体目录已推送到容器（参见 Nº 006）。

---

## 七、我的 Compose（外挂 OCI PostgreSQL）

```yaml
version: '3.8'
services:
  immich:
    image: ghcr.io/imagegenius/immich:latest
    container_name: immich
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Etc/GMT-8
      - DB_HOSTNAME=192.168.4.19
      - DB_USERNAME=immich
      - DB_PASSWORD=Password
      - DB_DATABASE_NAME=immich
      - DB_PORT=5432
      - REDIS_HOSTNAME=redis
      - REDIS_PORT=6379
      - REDIS_PASSWORD=
      - MACHINE_LEARNING_HOST=0.0.0.0
      - MACHINE_LEARNING_PORT=3003
      - MACHINE_LEARNING_WORKERS=1
      - MACHINE_LEARNING_WORKER_TIMEOUT=120
    volumes:
      - /mnt/appdata/immich/config:/config
      - /mnt/appdata/immich/photos:/photos
      - /mnt/appdata/immich/libraries:/libraries
      - /mnt/nfs/photos/immich-photo:/mnt/photos:ro
    ports:
      - 8080:8080
      - 3003:3003
    restart: always

  redis:
    image: redis
    ports:
      - 6379:6379
    container_name: redis
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Etc/GMT-8
    volumes:
      - /mnt/appdata/immich/redis/data:/data
```

> 这里将 PostgreSQL 数据库外挂在 OCI 上，不使用 compose 内置的 postgres 容器。

---

## 八、部署后操作

1. 登录 Immich WebUI，可修改 AI 模型提高识别精度
2. 使用 PhotoSync 将照片上传到外挂目录
3. 在系统管理中设置外部资产管理，导入已有照片库
