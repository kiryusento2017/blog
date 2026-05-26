---
title: 家庭数据中心 PVE
titleEm: 数据库：MariaDB + PostgreSQL
date: 2025-05-03
category: 技术
tags: [MariaDB, PostgreSQL, 数据库]
description: 在 LXC 容器中部署 MariaDB 和 PostgreSQL，涵盖安装、字符集配置、远程访问、用户权限管理与 Navicat 免费连接。
readTime: 12 min
words: 1400
featured: false
num: "Nº 004"
---

> 参考红茶海教程：[DB.01 MariaDB 部署](https://www.yuque.com/hongcha-6c6o6/klr1op/psgzxd8s9nsddhwz?singleDoc#) · [DB.02 PostgreSQL 部署](https://www.yuque.com/hongcha-6c6o6/klr1op/ps4ugmwl7g9l9z1w?singleDoc#)

也可以直接使用红茶海的 LXC 模板：[家庭数据中心教程汇总](https://www.yuque.com/hongcha-6c6o6/klr1op/xqao5sggi82efuet?singleDoc#)

---

## 一、MariaDB 安装与配置

### 1. 安装

```bash
apt update
apt install curl apt-transport-https
mkdir -p /home/MariaDB
cd /home/MariaDB
curl -LsSO https://r.mariadb.com/downloads/mariadb_repo_setup
chmod +x mariadb_repo_setup
./mariadb_repo_setup
```

```bash
apt update
apt-get install mariadb-server mariadb-client mariadb-backup
```

### 2. 验证安装

```sql
mysql

SELECT VERSION();
-- 输出示例：12.0.2-MariaDB-ubu2404

SHOW VARIABLES LIKE 'collation%';
SHOW VARIABLES LIKE 'character%';
```

### 3. 开启远程访问

编辑配置文件，将 `bind-address` 改为 `0.0.0.0`：

```bash
vi /etc/mysql/mariadb.conf.d/50-server.cnf
```

![](https://cdn.nlark.com/yuque/0/2025/png/50073755/1758027116261-4954bd9b-af3e-42e6-a8c4-8da076700985.png?x-oss-process=image%2Fwatermark%2Ctype_d3F5LW1pY3JvaGVp%2Csize_26%2Ctext_5Zad57qi6Iy26IGK5oqA5pyv%2Ccolor_FFFFFF%2Cshadow_50%2Ct_80%2Cg_se%2Cx_10%2Cy_10%2Fformat%2Cwebp)

### 4. 创建数据库与用户

```sql
mariadb -u root -p

SHOW DATABASES;
SELECT user, host FROM mysql.user;

-- 创建数据库、用户并授权（以 phpipam 为例）
CREATE DATABASE phpipam;
CREATE USER 'phpipam'@'%' IDENTIFIED BY 'phpipampassword';
GRANT ALL PRIVILEGES ON phpipam.* TO 'phpipam'@'%';
GRANT SELECT ON mysql.user TO 'phpipam'@'%';
FLUSH PRIVILEGES;

-- 通用模板
CREATE USER 'myAdmin'@'%' IDENTIFIED BY 'myPassword';
CREATE DATABASE mydb;
GRANT ALL PRIVILEGES ON mydb.* TO 'myAdmin'@'%';
FLUSH PRIVILEGES;
```

### 5. 注意：MariaDB 12 移除的历史变量

升级到 MariaDB 12 时，以下三个变量已从源码中删除，若配置文件中仍保留会报错：

- **`big_tables`**：10.5 起忽略，12.0 删除。从 `my.cnf` 删掉即可。
- **`large_page_size`**：10.5 起代码固定 16k 页，12.0 删除。
- **`storage_engine`**：改用 `default_storage_engine`，或直接删掉（默认 InnoDB）。

---

## 二、PostgreSQL 安装与配置

### 1. 安装

```bash
sudo apt update
sudo apt install -y postgresql-common
sudo /usr/share/postgresql-common/pgdg/apt.postgresql.org.sh
```

```bash
sudo apt update
sudo apt -y install postgresql-16    # 安装 16 版
sudo apt -y install postgresql-17    # 或安装 17 版，二选一
```

### 2. 修改监听 IP

编辑以下文件，将 `listen_addresses` 改为 `'*'`：

```
/etc/postgresql/16/main/postgresql.conf
/etc/postgresql/17/main/postgresql.conf
```

![](https://cdn.nlark.com/yuque/0/2024/png/50073755/1732149480645-db82c2f7-24a3-4127-93b7-1351ad6734d3.png?x-oss-process=image%2Fformat%2Cwebp%2Fwatermark%2Ctype_d3F5LW1pY3JvaGVp%2Csize_38%2Ctext_5Zad57qi6Iy26IGK5oqA5pyv%2Ccolor_FFFFFF%2Cshadow_50%2Ct_80%2Cg_se%2Cx_10%2Cy_10)

### 3. 修改可连接 IP 网段

编辑 `pg_hba.conf`，添加允许的客户端 IP 段：

```
/etc/postgresql/16/main/pg_hba.conf
/etc/postgresql/17/main/pg_hba.conf
```

![](https://cdn.nlark.com/yuque/0/2025/png/50073755/1757489787214-32971fb7-e979-4bdd-b285-16fbacae9c36.png?x-oss-process=image%2Fwatermark%2Ctype_d3F5LW1pY3JvaGVp%2Csize_19%2Ctext_5Zad57qi6Iy26IGK5oqA5pyv%2Ccolor_FFFFFF%2Cshadow_50%2Ct_80%2Cg_se%2Cx_10%2Cy_10%2Fformat%2Cwebp)

![](https://cdn.nlark.com/yuque/0/2025/png/50073755/1758028738931-21d6e208-a422-4a6e-8b2d-c6822a5c5e08.png?x-oss-process=image%2Fwatermark%2Ctype_d3F5LW1pY3JvaGVp%2Csize_20%2Ctext_5Zad57qi6Iy26IGK5oqA5pyv%2Ccolor_FFFFFF%2Cshadow_50%2Ct_80%2Cg_se%2Cx_10%2Cy_10%2Fformat%2Cwebp)

### 4. 重启并进入 psql

```bash
systemctl restart postgresql
su postgres
psql
```

![](https://cdn.nlark.com/yuque/0/2025/png/50073755/1757490812332-712def12-7450-48a2-bfb9-d732b8fca44c.png?x-oss-process=image%2Fwatermark%2Ctype_d3F5LW1pY3JvaGVp%2Csize_16%2Ctext_5Zad57qi6Iy26IGK5oqA5pyv%2Ccolor_FFFFFF%2Cshadow_50%2Ct_80%2Cg_se%2Cx_10%2Cy_10)

### 5. 修复 template1 字符集（重要）

默认 `template1` 为 ASCII 编码，需重建为 UTF8，否则后续创建的数据库可能出现乱码：

```sql
UPDATE pg_database SET datistemplate = false WHERE datname = 'template1';
DROP DATABASE template1;
CREATE DATABASE template1
  WITH TEMPLATE = template0
  ENCODING = 'UTF8'
  LC_COLLATE = 'C.utf8'
  LC_CTYPE = 'C.utf8';
UPDATE pg_database SET datistemplate = true WHERE datname = 'template1';
\l
```

### 6. 创建用户与数据库

```sql
-- 创建管理员用户和数据库（通用模板）
CREATE USER "MPAdmin" WITH PASSWORD 'MPAdminPassword';
CREATE DATABASE "MPDB";
ALTER DATABASE "MPDB" OWNER TO "MPAdmin";
GRANT ALL PRIVILEGES ON DATABASE "MPDB" TO "MPAdmin";

-- 创建 DBA 备用账号（忘记用户名时救命）
CREATE USER "DBA" WITH PASSWORD 'DBAPassword';
GRANT ALL PRIVILEGES ON DATABASE "MPDB" TO "DBA";
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO "DBA";

-- 删除数据库前先断开所有连接
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE datname = '数据库名称'
  AND pid <> pg_backend_pid();
DROP DATABASE 数据库名称;
DROP USER 数据库使用者;
```

> OCI 镜像方式部署 PostgreSQL 17 请参见 Immich 部署篇（Nº 017）。

---

## 三、Navicat 免费连接

直接下载 Navicat Premium Lite（免费版，支持 MariaDB、PostgreSQL 等多种数据库）：

[直接下载 Navicat Premium Lite](https://www.navicat.com.cn/download/direct-download?product=navicat170_premium_lite_cs_x64.exe&location=1)
