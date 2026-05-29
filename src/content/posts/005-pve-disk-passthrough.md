---
title: 家庭数据中心 PVE
titleEm: 硬盘直通
date: 2025-05-28
category: 技术
series: ["家庭数据中心 PVE 系列"]
tags: [PVE, 硬盘直通, IOMMU]
description: 在 PVE 中配置硬盘直通，涵盖 VT-D/IOMMU 开启、内核参数修改、模块加载与验证。
readTime: 6 min
words: 800
featured: false
num: "Nº 005"
---

> 参考红茶海教程：[PVE下硬盘直通](https://www.bilibili.com/read/cv39571871/?opus_fallback=1)（B站）

---

## 一、前置条件

- 主板支持 VT-D（Intel）/ IOMMU（AMD）
- 已进入 BIOS 开启相关选项（可能标注为 "Virtualization Support"、"VT for Direct I/O"、"Trusted Execution"）

---

## 二、修改内核参数

编辑 `/etc/default/grub`，找到 `GRUB_CMDLINE_LINUX_DEFAULT` 变量，追加参数：

```
GRUB_CMDLINE_LINUX_DEFAULT="quiet intel_iommu=on iommu=pt"
```

保存后更新 GRUB 配置：

```bash
update-grub
```

**注意**：PVE 系统通过 `proxmox-boot-tool` 引导时，`update-grub` 会自动转为 `proxmox-boot-tool refresh`，这是正常行为。

---

## 三、加载 IOMMU 模块

编辑 `/etc/modules`，添加以下模块：

```bash
vfio
vfio_iommu_type1
vfio_pci
vfio_virqfd
```

保存后重启系统。

---

## 四、验证 IOMMU

重启后执行：

```bash
dmesg | grep -e DMAR -e IOMMU
```

若看到 `DMAR: Intel(R) Virtualization Technology for Directed I/O` 或类似输出，说明 IOMMU 已启用。

---

### 实际输出示例

```
root@pve:~# dmesg | grep -e DMAR -e IOMMU
[    0.161227] DMAR: Host address width 39
[    0.161228] DMAR: DRHD base: 0x000000fed90000 flags: 0x0
[    0.435977] DMAR: Intel(R) Virtualization Technology for Directed I/O
```

---

## 五、直通硬盘到虚拟机

先列出磁盘 ID：

```bash
ls -l /dev/disk/by-id/
```

然后使用 `qm set` 将硬盘分配给虚拟机：

```bash
qm set <VM ID> --<磁盘类型> /dev/disk/by-id/<磁盘标识>
```

示例（VM ID 为 902，使用 SATA 直通三块西数红盘）：

```bash
qm set 902 --sata0 /dev/disk/by-id/ata-WDC_WD80EFPX-6XXXXXX_WD-XXXXXXXX
qm set 902 --sata1 /dev/disk/by-id/ata-WDC_WD80EFPX-6XXXXXX_WD-XXXXXXXX
qm set 902 --sata2 /dev/disk/by-id/ata-WDC_WD80EFPX-6XXXXXX_WD-XXXXXXXX
```

---

## 注意事项

- 直通后的硬盘不要对虚拟机做备份（磁盘内容可能极大，会撑爆宿主机存储）
- 如果有多条内核，建议保留至少一个备用内核，方便出问题时切换
