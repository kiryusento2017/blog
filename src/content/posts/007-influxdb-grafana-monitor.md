---
title: 家庭数据中心 PVE
titleEm: InfluxDB + Grafana 电子看板
date: 2025-07-09
category: 技术
series: ["家庭数据中心 PVE 系列"]
tags: [InfluxDB, Grafana, 监控, Docker]
description: 部署 InfluxDB 和 Grafana 打造 PVE 性能监控面板，包含 PT 下载监控与仪表盘导入。
readTime: 12 min
words: 1600
featured: false
num: "Nº 007"
---

> 参考红茶海教程：[PVE 9.0 性能监控 v2.0](https://www.yuque.com/hongcha-6c6o6/klr1op/mfypd4ndutcaw7bd?singleDoc#) · [PT监控](https://www.yuque.com/hongcha-6c6o6/klr1op/sofkr4mqd6egg4if?singleDoc#)

---

## 一、二进制安装 InfluxDB + Grafana（旧版）

### 1. 安装 InfluxDB 1.8

```bash
wget https://download.influxdata.com/influxdb/releases/influxdb_1.8.10_amd64.deb
dpkg -i influxdb_1.8.10_amd64.deb
```

### 2. 安装 Grafana

```bash
apt-get install -y adduser libfontconfig1 musl
wget https://dl.grafana.com/oss/release/grafana_12.1.0_amd64.deb
dpkg -i grafana_12.1.0_amd64.deb
```

也可以使用 Docker Compose 部署 Grafana：

```yaml
version: '3'
services:
  grafana:
    image: grafana/grafana-oss
    container_name: Grafana
    hostname: Grafana
    ports:
      - '3000:3000'
    volumes:
      - /mnt/appdata/grafana/storage:/var/lib/grafana
      - /mnt/appdata/grafana/logs:/var/log/grafana
      - /mnt/appdata/grafana/plugins:/var/lib/grafana/plugins
      - /mnt/appdata/grafana/provisioning:/etc/grafana/provisioning
    environment:
      - PUID=0
      - PGID=0
      - TZ=Etc/GMT-8
    restart: always
```

**注意**：如果使用上述 compose 中删除了环境变量后仍无法部署，执行最后两行权限命令：

```bash
sudo chown -R 1000:1000 /mnt/appdata/grafana
sudo chmod -R 775 /mnt/appdata/grafana
```

---

### 3. 配置 InfluxDB UDP 接收

编辑 `/etc/influxdb/influxdb.conf`，在第 530 行附近找到并修改以下内容：

```bash
enabled = true
bind-address = "0.0.0.0:8089"
database = "proxmox"
batch-size = 1000
batch-timeout = "1s"
```

在 nano 中按 `Ctrl + _` 可跳转到指定行号。

### 4. 启动服务

```bash
systemctl start influxdb
systemctl enable influxdb
systemctl start grafana-server
systemctl enable grafana-server
```

### 5. 初始化账号和数据库

```sql
influx
> CREATE USER "admin" WITH PASSWORD '123456' WITH ALL PRIVILEGES
> CREATE DATABASE proxmox
> SHOW USERS
> SHOW DATABASES
> QUIT
```

### 6. PVE 对接 InfluxDB

数据中心 → 指标服务器 → 添加 → InfluxDB，填写数据库信息。

### 7. 访问 Grafana

浏览器访问 Grafana 默认端口 3000，默认用户名密码 `admin/admin`。

切换中文：连接 → 数据源 → InfluxDB。

**注意**：如果使用 macvlan 部署 Grafana，macvlan 与宿主机不互通，需改用 bridge 模式。

### 8. 导入仪表盘

仪表盘 → 创建 → 导入仪表盘 → 输入 `10048`。

---

## 二、Docker 方式升级为 InfluxDB v2（推荐）

### 1. 停用旧版 InfluxDB

```bash
sudo systemctl stop influxdb
sudo systemctl disable influxdb
```

### 2. Docker Compose 部署 InfluxDB v2

```bash
mkdir -p /mnt/appdata/InfluxDB2/data
mkdir -p /mnt/appdata/InfluxDB2/config
```

```yaml
services:
  influxdb:
    image: influxdb:latest
    container_name: influxdb2
    hostname: InfluxDB2
    ports:
      - 8086:8086
    environment:
      - TZ=Etc/GMT-8
      - DOCKER_INFLUXDB_INIT_MODE=setup
      - DOCKER_INFLUXDB_INIT_USERNAME=admin
      - DOCKER_INFLUXDB_INIT_PASSWORD=Password
      - DOCKER_INFLUXDB_INIT_ORG=Home
      - DOCKER_INFLUXDB_INIT_BUCKET=Proxmox
    volumes:
      - type: bind
        source: /mnt/appdata/InfluxDB2/data
        target: /var/lib/influxdb2
      - type: bind
        source: /mnt/appdata/InfluxDB2/config
        target: /etc/influxdb2
    restart: always
```

### 3. 创建 Bucket 和 API Token

登录 InfluxDB WebUI，创建 Bucket（如 `Proxmox`）。

![](https://cdn.nlark.com/yuque/0/2025/png/55551868/1757172920584-1352af6c-a668-47d1-bf3a-cb66ccf4bccd.png)

创建 API Token：

![](https://cdn.nlark.com/yuque/0/2025/png/55551868/1757172983973-5d4ddccb-c5c1-4bb1-a5c3-6694fd3ee7ba.png)

### 4. PVE 指标服务器配置

创建新的指标服务器，填入 InfluxDB v2 的连接信息。

![](https://cdn.nlark.com/yuque/0/2025/png/55551868/1757173101270-fc29fa2b-f926-486a-9edf-4616c97d0022.png)

### 5. Grafana 添加新连接

相比之前的二进制版本，v2 连接时填写的信息更少。

![](https://cdn.nlark.com/yuque/0/2025/png/55551868/1757173251441-9411bf4a-d7f9-455d-9b49-a33c26a9b8f6.png)

---

## 三、PT 监控部署

### 1. qBittorrent Exporter

镜像：`caseyscarborough/qbittorrent-exporter:latest`

```yaml
version: '3.8'

services:
  qbittorrent-exporter:
    image: caseyscarborough/qbittorrent-exporter:latest
    container_name: qBittorrent-exporter
    hostname: qB-exporter
    environment:
      - QBITTORRENT_USERNAME=username
      - QBITTORRENT_PASSWORD=password
      - QBITTORRENT_BASE_URL=http://192.168.4.11:8080
      - TZ=Etc/GMT-8
    ports:
      - "17871:17871"
```

验证探针：

```bash
curl http://localhost:17871/metrics
```

### 2. Prometheus

```yaml
version: '3.8'
services:
  prometheus:
    image: prom/prometheus
    container_name: Prometheus
    hostname: Prometheus
    ports:
      - 9090:9090
    environment:
      - TZ=Etc/GMT-8
    volumes:
      - /mnt/appdata/Prometheus/conf:/etc/prometheus
      - /mnt/appdata/Prometheus/confbak:/etc/prometheusbak
    restart: always
```

创建 prometheus.yml 配置文件：

```bash
sudo cat > /mnt/appdata/Prometheus/conf/prometheus.yml << 'EOF'
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'qbittorrent'
    static_configs:
      - targets: ['192.168.4.17:17871']
        labels:
          instance: 'qbittorrent-server'
EOF
```

进入 Prometheus 控制面板确认 qb 探针状态为 UP。

在 Grafana 中新增数据源（Prometheus），然后导入仪表盘 `15116` 即可监控 qb。

![](https://cdn.nlark.com/yuque/0/2025/png/55551868/1757178293509-bda0532f-1018-4433-9e78-56c425714b17.png)
