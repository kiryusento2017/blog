---
title: 家庭数据中心 PVE
titleEm: VPS 节点搭建
date: 2026-05-18
category: 技术
tags: [VPS, 节点, S-UI, VLESS, TUIC]
description: 使用 S-UI 面板在 VPS 上搭建 VLESS-Reality + TUIC 双协议节点，含 BBR 拥塞控制优化。
readTime: 12 min
words: 1500
featured: false
num: "Nº 020"
---

> 参考教程：[零基础 2026 最新保姆级节点搭建教程](https://bulianglin.com/archives/nicename.html)

---

## 零、防火墙管理方式

不同 VPS 服务商的防火墙管理方式不同：

- **类型一：安全组管控（云厂商层面）**：阿里云、腾讯云、AWS、Vultr、搬瓦工等。需在控制面板的「安全组」或「防火墙规则」中开放对应端口，VPS 系统内 ufw 可不开。
- **类型二：VPS 自身防火墙（系统层面）**：完全依赖系统内 ufw 管理端口。

安装完 S-UI 后如果不通，请自行开放端口。

---

## 一、安装 S-UI 面板

Windows 打开 CMD，SSH 连接到 VPS（以 `1.1.1.1` 为例）：

```bash
ssh root@1.1.1.1 -p 22
```

输入密码后，执行安装命令：

```bash
VERSION=1.2.2 && bash <(curl -Ls https://raw.githubusercontent.com/alireza0/s-ui/$VERSION/install.sh) $VERSION
```

静候几分钟，遇到 `[y/n]` 回车即可。

安装完成后会显示 S-UI 面板的账号、密码以及登录地址，**记录下来**。

---

## 二、测速选域名

Reality 协议需要借用一个真实网站的 TLS 证书来伪装流量。延迟越低，伪装效果越真实，抗封锁能力越强。

```bash
for d in lpcdn.lpsnmedia.net www.sony.com mscom.demdex.net cdn.bizible.com intelcorp.scene7.com cdn.userway.org github.gallerycdn.vsassets.io s.mp.marsflag.com ts3.tc.mm.bing.net www.bing.com ; do t1=$(date +%s%3N); timeout 1 openssl s_client -connect $d:443 -servername $d </dev/null &>/dev/null && t2=$(date +%s%3N) && echo "$d: $((t2 - t1)) ms" || echo "$d: timeout"; done
for d in iosapps.itunes.apple.com static.cloud.coveo.com github.gallerycdn.vsassets.io gsp-ssl.ls.apple.com aadcdn.msftauth.net c.s-microsoft.com api.company-target.com ms-vscode.gallerycdn.vsassets.io downloadmirror.intel.com logx.optimizely.com ; do t1=$(date +%s%3N); timeout 1 openssl s_client -connect $d:443 -servername $d </dev/null &>/dev/null && t2=$(date +%s%3N) && echo "$d: $((t2 - t1)) ms" || echo "$d: timeout"; done
```

记录延迟最低且没有 timeout 的域名，后续作为 SNI 填入。

---

## 三、SSH 隧道访问面板

关闭 CMD 重新打开，建立 SSH 隧道（保持此窗口最小化不要关闭）：

```bash
ssh -L 2095:127.0.0.1:2095 root@1.1.1.1 -p 22
```

然后浏览器访问 `http://127.0.0.1:2095/app`，输入安装时记录的账号密码。

---

## 四、配置 TLS

点击 TLS 设置，添加两个配置，域名填写第二步测出的延迟最低的域名。

![](https://cdn.nlark.com/yuque/0/2026/png/55551868/1777304792409-a9a94c88-8406-45ae-9801-1e2d8f8abca6.png)
![](https://cdn.nlark.com/yuque/0/2026/png/55551868/1777304809421-bfaabca0-26bb-4ed8-a5e4-ed4e242f0e70.png)

---

## 五、添加入站

进入入站管理，添加两个入站：

1. **VLESS-Reality**（稳定抗封锁）
2. **TUIC**（速度快，弱网表现好）

![](https://cdn.nlark.com/yuque/0/2026/png/55551868/1777304859455-febcae17-ecbd-4c6d-b99b-edd829e5ffc1.png)
![](https://cdn.nlark.com/yuque/0/2026/png/55551868/1777304874317-ac9aa352-ac8f-4b5f-adc4-910a1054fe26.png)

---

## 六、创建用户

进入用户管理，新建用户。你将获得两个二维码，导入客户端使用。**记得将 IP 地址改成 VPS 的地址**。

导入 v2rayN 进行测速验证。

---

## 七、开启 BBR 拥塞控制

BBR 是谷歌开发的 TCP 拥塞控制算法，在跨境高延迟、高丢包环境下显著提升传输速度。

```bash
# 写入 BBR 配置
sh -c 'echo "net.core.default_qdisc=fq" >> /etc/sysctl.conf'
sh -c 'echo "net.ipv4.tcp_congestion_control=bbr" >> /etc/sysctl.conf'

# 立即生效
sysctl -p

# 验证，有输出说明成功
lsmod | grep bbr
```

---

## 附录：协议简介

### VLESS-Reality

VLESS 是轻量级代理协议，没有多余加密开销。Reality 是其核心伪装技术：
- 握手阶段借用真实大厂（苹果、微软等）的 TLS 证书展示给防火墙
- 用公私钥机制区分真实用户和代理客户端
- 配合浏览器指纹模拟，让流量特征像真实浏览器

**优势**：抗封锁能力极强，不需要域名和证书，零成本。

### TUIC

基于 QUIC 协议（HTTP/3 的底层），核心优势是**多路复用无队头阻塞**：
- 传统 TCP：一个数据包丢了，后面所有包都要等重传
- QUIC：每个请求独立传输，互不影响

**优势**：弱网和高丢包环境下速度快、延迟低。缺点是 UDP 在某些网络下可能被运营商限速。

### 为什么同时使用两个协议？

| | VLESS-Reality | TUIC |
|------|------|------|
| 传输层 | TCP | UDP |
| 优势 | 稳定，抗封锁强 | 速度快，弱网表现好 |
| 劣势 | 弱网下有队头阻塞 | UDP 可能被运营商限速 |
| 适用 | 日常稳定使用 | 追求速度，网络条件好时 |

客户端（如 Mihomo）可以配置自动测速，谁延迟低用谁，两个协议互为备份。
