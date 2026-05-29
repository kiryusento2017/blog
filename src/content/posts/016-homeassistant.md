---
title: 家庭数据中心 PVE
titleEm: HomeAssistant 智能家居
date: 2026-02-03
category: 工具
series: ["家庭数据中心 PVE 系列"]
tags: [HomeAssistant, 智能家居, HACS, 小米]
description: 在 PVE 虚拟机中安装 HomeAssistant，包括 HACS 安装、反向代理配置与小米 Home 接入。
readTime: 8 min
words: 900
featured: false
num: "Nº 016"
---

---

## 一、前置条件

- 自备科学上网环境（HACS 安装需要）
- 在 PVE 中使用虚拟机方式安装（非 Docker）

---

## 二、下载 HAOS 镜像

从 [Home Assistant 官方 Alternative 页面](https://www.home-assistant.io/installation/alternative/) 下载 qcow2 格式镜像，解压。

---

## 三、导入镜像到 PVE

将解压后的 qcow2 文件上传到 PVE 的 `/var/lib/vz/import/` 目录。

![](https://cdn.nlark.com/yuque/0/2025/png/55551868/1767091369198-6dd8459e-eecd-430f-9e42-93c0613b6021.png)

---

## 四、创建虚拟机

创建虚拟机时参考以下配置：

![](https://cdn.nlark.com/yuque/0/2025/png/55551868/1767094337078-41e176af-8bad-49e5-9dd4-de1727570ea3.png)
![](https://cdn.nlark.com/yuque/0/2025/png/55551868/1767094353274-f3d0a2ad-eb15-401a-b569-43c69fbe0332.png)

选择 BIOS 和磁盘类型：

![](https://cdn.nlark.com/yuque/0/2025/png/55551868/1767094382723-a459ae3c-a213-40eb-88c0-c64c455aa5b1.png)
![](https://cdn.nlark.com/yuque/0/2025/png/55551868/1767094427868-f410a2a1-2232-4a75-b451-76e306a9bd77.png)

确认配置：

![](https://cdn.nlark.com/yuque/0/2025/png/55551868/1767094454358-4bc020f6-86c0-49d3-8483-09761bb68f9c.png)
![](https://cdn.nlark.com/yuque/0/2025/png/55551868/1767094508814-d1bc807d-04db-4218-9eff-1cba3b866b69.png)

---

## 五、导入磁盘并启动

```bash
qm importdisk 907 /var/lib/vz/import/haos_ova-16.3.qcow2 vm-pool
```

添加磁盘后，调整启动顺序，启动虚拟机。

![](https://cdn.nlark.com/yuque/0/2025/png/55551868/1767094572057-a0783dcd-a9e0-45a1-ad98-c59b5292b3f9.png)

---

## 六、初始配置

1. 进入路由器查看 HA 的 IP 地址，设为静态地址
2. 指定通过科学上网联网（否则 HACS 无法安装）
3. 重启虚拟机，耐心等待初始化完成

---

## 七、反向代理配置

安装 File Editor 插件，编辑 `configuration.yaml`：

![](https://cdn.nlark.com/yuque/0/2025/png/55551868/1767098211774-d7408a6c-6b18-4be9-bcf6-ce05d97dc421.png)

添加以下内容：

```yaml
http:
  use_x_forwarded_for: true
  trusted_proxies:
    - 192.168.4.0/23
```

保存后重启 HA。

![](https://cdn.nlark.com/yuque/0/2025/png/55551868/1767098777304-e6c643ba-e7eb-468b-8990-9d220da8d015.png)

---

## 八、安装 HACS

1. 在 HA 中开启高级模式
2. 完全重启整个系统
3. 安装 `Terminal & SSH` 插件
4. 在终端中运行：

```bash
wget -O - https://get.hacs.xyz | bash -
```

5. 回到页面按 `Ctrl + Shift + V` 刷新，再次重启系统

---

## 九、接入小米 Home

安装小米 Home 插件后，登录小米账号。**注意**：登录后要手动把 `homeassistant.local` 那段地址改成你的 IP 地址。
