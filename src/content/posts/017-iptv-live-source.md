---
title: 家庭数据中心 PVE
titleEm: 自家 IPTV 直播源
date: 2026-03-01
category: 技术
series: ["家庭数据中心 PVE 系列"]
tags: [IPTV, 抓包, Wireshark, ImmortalWrt]
description: 通过 ImmortalWrt + Wireshark 抓包获取 IPTV 组播地址，制作 M3U 直播源，实现全屋任意设备观看 IPTV。
readTime: 14 min
words: 1600
featured: false
num: "Nº 017"
---

> 本教程以江苏无锡电信为例，其他运营商可能更简单。

---

## 一、前置条件

- 光猫超级管理员密码
- 小主机至少有两个网口
- 能够正常观看运营商提供的 IPTV
- 电脑安装 Wireshark
- 已安装 ImmortalWrt（参见 Nº 002）

---

## 二、网口配置

我的小主机有四个网口：
- `enp1s0` — 接普通网络，连接虚拟交换机 `vmbr0`
- `enp4s0` — 直连光猫的 IPTV 接口，负责转播数据

![](https://cdn.nlark.com/yuque/0/2026/png/55551868/1771263719765-eeffa4d6-1755-4e7b-8f1b-e2e8c04b79a0.png)

---

## 三、配置 ImmortalWrt

### 1. 安装与初始设置

参照 Nº 002 安装 ImmortalWrt，记得添加两个 vmbr 网桥。

### 2. 删除 WAN 接口

网络 → 接口 → 删除 WAN 和 WAN6 → 保存并应用。

![](https://cdn.nlark.com/yuque/0/2026/png/55551868/1771264411530-78c2683d-be69-4706-a5a7-b75bcf29b6e7.png)

### 3. LAN 口设置

填写网关，DNS 指向主路由，**不在此接口进行 DHCP**。

![](https://cdn.nlark.com/yuque/0/2026/png/55551868/1771264540847-d3257251-9760-4a62-9593-3e32cb1e578e.png)
![](https://cdn.nlark.com/yuque/0/2026/png/55551868/1771264569297-cd388ce7-f189-4d41-9ebb-1db490957ea1.png)

### 4. 创建 IPTV 防火墙

网络 → 防火墙 → 添加 IPTV。

![](https://cdn.nlark.com/yuque/0/2026/png/55551868/1771265036905-a56d5029-7a0d-47f0-9a81-909b47169c09.png)

### 5. 新增 IPTV 接口

- 静态 IP，地址必须设为光猫麾下的地址（如 `192.168.1.x`）
- 网关指向光猫
- 取消"使用默认网关"，设置度量值为 100
- 防火墙选择刚创建的 IPTV
- 忽略 DHCP

![](https://cdn.nlark.com/yuque/0/2026/png/55551868/1771264649183-5bfa3262-3717-46f0-b377-abb508b76433.png)
![](https://cdn.nlark.com/yuque/0/2026/png/55551868/1771264679524-1034717b-806a-4757-9344-4af00199d377.png)
![](https://cdn.nlark.com/yuque/0/2026/png/55551868/1771264762262-1cb9249e-1a7b-4ca5-81cd-82e54ad7c489.png)
![](https://cdn.nlark.com/yuque/0/2026/png/55551868/1771265086421-854cae78-a6d5-4f2f-8639-6a636aed2e12.png)
![](https://cdn.nlark.com/yuque/0/2026/png/55551868/1771264904925-341df90b-ce89-4770-aab8-aa7f5bb399da.png)

### 6. 修改 MAC 地址

接口 → 网络 → 设备，将 `eth1`（IPTV 所在接口）的 MAC 地址**强制修改为真实机顶盒的地址**，MTU 设为 1500，禁用 IPv6。

---

## 四、安装组播转换工具

更新软件包后搜索 `msd`，安装前三个包。

![](https://cdn.nlark.com/yuque/0/2026/png/55551868/1771265416606-a471d194-acf2-4f65-b24a-947fe245077b.png)

---

## 五、测试播放

直接启用组播转换。如果已有组播地址（例如 CCTV-1 为 `239.49.0.1:8000`，ImmortalWrt 地址为 `192.168.4.27`），用 PotPlayer 测试：

```
http://192.168.4.27:7088/rtp/239.49.0.1:8000
```

播放正常说明配置成功。

**江苏无锡电信 M3U 源文件**：[江苏无锡电信m3u格式源.txt](https://www.yuque.com/attachments/yuque/0/2026/txt/55551868/1771265740639-61a06bfa-eb68-4499-86df-8d1fefd6b0b5.txt)

将 M3U 文件中的 IP 地址修改为自己的 ImmortalWrt 地址后，导入 IPTV 播放器即可。

---

## 六、创建订阅链接

1. 在 ImmortalWrt 中安装 `ttyd` 终端

    ![](https://cdn.nlark.com/yuque/0/2026/png/55551868/1771268149072-fdcde4ab-ecee-4f57-9041-c1e967928d98.png)

2. 在 `/www` 目录下创建 `1.m3u`，粘贴 M3U 内容

    ![](https://cdn.nlark.com/yuque/0/2026/png/55551868/1771268216708-a6b89653-9b39-488f-bb65-0fce3fc40cb0.png)

3. IPTV 播放器访问 `http://192.168.4.27/1.m3u` 即可订阅

---

## 七、反向代理

需要代理两个地址：
- `immortaliptv.domain.com` → ImmortalWrt 的 IP 80 端口
- `iptv.domain.com` → ImmortalWrt 的 IP 7088 端口

将 M3U 文件中的内网地址替换为 `immortaliptv.domain.com`。

---

## 八、（附加）Wireshark 抓包获取直播源

如果无法直接获取到所在地区的 IP 直播源，需要手动抓包。

### 所需工具
- 笔记本电脑
- 足量的网线
- 光猫超级管理员密码
- Wireshark

### 步骤

1. 电脑连接光猫的千兆口（非 IPTV 口），进入超管后台
2. 诊断 → 业务诊断 → 镜像功能，将 IPTV 流量镜像到另一个空闲网口

    ![](https://cdn.nlark.com/yuque/0/2026/png/55551868/1771266565734-7d893dd5-fa8f-4c7b-92f1-7b16c40b0986.png)

3. 将电脑网线插入被镜像的网口，打开 Wireshark
4. 光猫 IPTV 口连接运营商机顶盒，播放 CCTV-1

    Wireshark 将捕获到类似数据包：

    ![](https://cdn.nlark.com/yuque/0/2026/png/55551868/1771267305265-a6154a80-f784-45a6-9764-c1624d0983e3.png)

5. 切换到 CCTV-2，再次捕获：

    ![](https://cdn.nlark.com/yuque/0/2026/png/55551868/1771267352774-b83b37cd-a899-4ecb-b701-56be81c3f1aa.png)

6. 发现规律：CCTV-1 地址为 `239.49.0.1:8000`，CCTV-2 为 `239.49.0.2:8008`。逐个录制，整理成 M3U 格式

7. **完成后记得回光猫删除镜像配置**
