---
title: 家庭数据中心 PVE
titleEm: OCI MariaDB 数据库迁移
date: 2026-03-28
category: 技术
tags: [MariaDB, OCI, 数据库迁移, mysqldump]
description: 在 OCI 上部署 MariaDB，使用 mysqldump 将旧数据库迁移到新实例。
readTime: 5 min
words: 500
featured: false
num: "Nº 018"
---

> 参考红茶海教程：[容器 OCI 部署推荐——MariaDB](https://www.yuque.com/hongcha-6c6o6/klr1op/rkdk1n2661506mwt?singleDoc#)

---

## 一、OCI MariaDB 部署

OCI 上部署 MariaDB 与 LXC 中部署（Nº 004）操作几乎一样，唯一区别是需要手动添加两个环境变量。参照教程部署即可。

---

## 二、数据库迁移

将旧的 MariaDB 数据库迁移到新数据库。前提是两个 LXC 都挂载了相同的 NFS 目录（方便传输备份文件）。

### 1. 导出旧数据库

```bash
mysqldump -u root -p \
  --default-character-set=utf8mb4 \
  --single-transaction \
  --routines \
  --triggers \
  --events \
  --databases phpipam \
  > /mnt/nfs/test/phpipam_backup.sql
```

### 2. 在新数据库中创建用户和库

```sql
CREATE USER 'phpipam'@'%' IDENTIFIED BY 'phpipampassword';
CREATE DATABASE phpipam;
GRANT ALL PRIVILEGES ON phpipam.* TO 'phpipam'@'%';
GRANT SELECT ON mysql.user TO 'phpipam'@'%';
FLUSH PRIVILEGES;
```

### 3. 导入到新数据库

```bash
mysql -u root -p --default-character-set=utf8mb4 < /mnt/nfs/test/phpipam_backup.sql
```

---

## 三、验证

导入完成后，登录 MariaDB 确认数据库和表已完整迁移：

```sql
SHOW DATABASES;
USE phpipam;
SHOW TABLES;
```
