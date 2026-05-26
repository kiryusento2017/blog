# 代码框一键复制按钮 Design Spec

## 目标

为文章页所有代码块右上角加入一键复制按钮，方便读者直接复制命令和代码。

## 视觉设计

### 布局

右上角注入一个 flex 容器 `.code-actions`，将现有 `.lang` 标签和新增复制按钮并排放置：

```
┌─────────────────────────────────────┐
│                      BASH · COPY    │  ← .code-actions（position: absolute）
│ apt update                          │
│ apt install tree                    │
└─────────────────────────────────────┘
```

- 容器：`position: absolute; top: 12px; right: 16px; display: flex; align-items: center; gap: 0`
- 中间分隔符：`·`（一个独立 `<span>`），颜色 `var(--ink-fainter)`，两侧 padding 各 8px
- 无 `.lang` 的代码块：只显示 COPY，无分隔符

### 按钮样式

```
font-family: var(--f-mono)
font-size: 10px
letter-spacing: 0.16em
text-transform: uppercase
color: var(--ink-faint)          ← 默认
color: var(--accent)             ← 复制成功后 1.5s
background: none
border: none
cursor: pointer
padding: 0
```

### 状态变化

| 状态 | 按钮文字 | 颜色 |
|------|----------|------|
| 默认 | COPY | `var(--ink-faint)` |
| 复制成功（1.5s） | ✓ COPIED | `var(--accent)` |
| 恢复 | COPY | `var(--ink-faint)` |

## 技术实现

### 修改文件

| 文件 | 改动 |
|------|------|
| `src/styles/global.css` | 新增 `.code-actions`、`.copy-btn` 样式 |
| `src/pages/posts/[slug].astro` | 新增 `<script is:inline>` 注入逻辑 |

### CSS（新增至 `global.css` `.article-body pre` 区域附近）

```css
.code-actions {
  position: absolute;
  top: 12px;
  right: 16px;
  display: flex;
  align-items: center;
}
.code-actions .sep {
  color: var(--ink-fainter);
  padding: 0 8px;
  font-family: var(--f-mono);
  font-size: 10px;
}
.copy-btn {
  font-family: var(--f-mono);
  font-size: 10px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--ink-faint);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  transition: color 0.2s;
}
.copy-btn:hover { color: var(--ink); }
.copy-btn.copied { color: var(--accent); }
```

### JS 逻辑（`<script is:inline>` in `[slug].astro`）

```js
(function () {
  document.querySelectorAll('.content pre').forEach(function (pre) {
    // 取出已有 .lang 节点（可能不存在）
    var lang = pre.querySelector('.lang');

    // 创建 flex 容器
    var actions = document.createElement('div');
    actions.className = 'code-actions';

    // 如果有 lang 标签，移入容器并加分隔符
    if (lang) {
      pre.removeChild(lang);
      actions.appendChild(lang);
      var sep = document.createElement('span');
      sep.className = 'sep';
      sep.textContent = '·';
      actions.appendChild(sep);
    }

    // 创建复制按钮
    var btn = document.createElement('button');
    btn.className = 'copy-btn';
    btn.textContent = 'COPY';
    btn.addEventListener('click', function () {
      var code = pre.querySelector('code');
      var text = (code ? code.innerText : pre.innerText).trim();
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () { onCopied(btn); });
      } else {
        // 回退方案
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        onCopied(btn);
      }
    });

    actions.appendChild(btn);
    pre.appendChild(actions);
  });

  function onCopied(btn) {
    btn.textContent = '✓ COPIED';
    btn.classList.add('copied');
    setTimeout(function () {
      btn.textContent = 'COPY';
      btn.classList.remove('copied');
    }, 1500);
  }
})();
```

## 潜在问题与对策

| 问题 | 对策 |
|------|------|
| 无 `.lang` 的代码块 | 检查节点是否存在，不存在则只放 COPY，无分隔符 |
| 复制内容含尾部换行 | `.trim()` 处理 |
| Clipboard API 不支持（非 HTTPS） | `execCommand('copy')` 回退 |
| 多代码块互相干扰 | 每个 `pre` 独立作用域，无共享状态 |

## 不在范围内

- 移动端（`< 980px`）：按钮仍然可见（用户要求始终可见）
- 语法高亮：不在本次范围
- 其他页面（首页、归档页）：无 `.content pre`，不受影响
