# 代码框一键复制按钮 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为文章页所有代码块右上角注入 COPY 按钮，点击后复制代码，按钮短暂显示「✓ COPIED」后恢复。

**Architecture:** 两步：先在 `global.css` 加样式，再在 `[slug].astro` 加 `<script is:inline>`，JS 动态注入按钮并处理复制逻辑。CSS 和 JS 分离，互不依赖，顺序无关。

**Tech Stack:** 原生 CSS，原生 JS（Clipboard API + execCommand 回退），Astro `<script is:inline>`

---

## 文件结构

```
src/styles/global.css                 ← Task 1：新增 .code-actions / .copy-btn 样式
src/pages/posts/[slug].astro          ← Task 2：新增 <script is:inline> 注入逻辑
```

---

## Task 1: 新增复制按钮 CSS

**Files:**
- Modify: `src/styles/global.css`（在 `.article-body pre` 相关样式末尾追加，约第 910 行之后）

- [ ] **Step 1: 在 `global.css` 末尾的 `.article-body pre` 区域后追加以下样式**

找到文件中 `.article-body pre .c { ... }` 那一行（约第 907 行），在其后空一行追加：

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

- [ ] **Step 2: 验证样式无语法错误**

访问 `http://localhost:4321/posts/013-pve-homelab-basics`，DevTools Console 无红色报错，页面正常渲染（此时按钮还不存在，只确认 CSS 无误）。

---

## Task 2: 注入复制按钮 JS

**Files:**
- Modify: `src/pages/posts/[slug].astro`（在已有的进度条 `<script is:inline>` 之后，`</BaseLayout>` 之前追加新 script）

- [ ] **Step 1: 在 `[slug].astro` 末尾的 `</BaseLayout>` 前追加以下脚本**

当前文件末尾结构（已有进度条脚本）：
```astro
<script is:inline>
  /* 进度条脚本 */
</script>

</BaseLayout>
```

在 `</BaseLayout>` 前再追加一个独立的 script：

```astro
<script is:inline>
  (function () {
    function onCopied(btn) {
      btn.textContent = '✓ COPIED';
      btn.classList.add('copied');
      setTimeout(function () {
        btn.textContent = 'COPY';
        btn.classList.remove('copied');
      }, 1500);
    }

    document.querySelectorAll('.content pre').forEach(function (pre) {
      var lang = pre.querySelector('.lang');

      var actions = document.createElement('div');
      actions.className = 'code-actions';

      if (lang) {
        pre.removeChild(lang);
        actions.appendChild(lang);
        var sep = document.createElement('span');
        sep.className = 'sep';
        sep.textContent = '·';
        actions.appendChild(sep);
      }

      var btn = document.createElement('button');
      btn.className = 'copy-btn';
      btn.textContent = 'COPY';
      btn.addEventListener('click', function () {
        var code = pre.querySelector('code');
        var text = (code ? code.innerText : pre.innerText).trim();
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(function () { onCopied(btn); });
        } else {
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
  })();
</script>
```

- [ ] **Step 2: 在浏览器验证**

访问 `http://localhost:4321/posts/013-pve-homelab-basics`，检查：

- [ ] 每个代码框右上角出现「BASH · COPY」或单独「COPY」（无语言标签的代码框）
- [ ] COPY 文字颜色为淡色（`var(--ink-faint)`），与 BASH 标签风格一致
- [ ] 点击 COPY 后按钮变为绿色「✓ COPIED」
- [ ] 1.5 秒后按钮恢复「COPY」和原色
- [ ] 打开文本编辑器粘贴，确认内容正确（无多余空行）
- [ ] 悬停在 COPY 上颜色变深（`:hover` 效果）

- [ ] **Step 3: 提交**

```bash
git add src/styles/global.css src/pages/posts/[slug].astro
git commit -m "feat: 代码框右上角加入一键复制按钮"
git push
```

---

## 自检

**Spec 覆盖检查：**
- [x] `.code-actions` flex 容器（`position: absolute; top: 12px; right: 16px`）✓
- [x] `.sep` 分隔符样式（`·`，`var(--ink-fainter)`）✓
- [x] `.copy-btn` 样式（mono 字体，10px，uppercase，`var(--ink-faint)`）✓
- [x] `.copy-btn.copied` 状态（`var(--accent)`）✓
- [x] 无 `.lang` 时只显示 COPY，无分隔符 ✓
- [x] 复制成功 → 文字变「✓ COPIED」→ 1.5s 恢复 ✓
- [x] `.trim()` 处理尾部换行 ✓
- [x] Clipboard API 不可用时回退 `execCommand` ✓
- [x] 选择器限定 `.content pre`，不影响其他页面 ✓

**Placeholder 扫描：** 无 TBD / TODO，代码完整。

**一致性检查：**
- Task 1 的 `.code-actions`、`.sep`、`.copy-btn`、`.copied` 与 Task 2 JS 中的 className 完全一致
- `onCopied` 函数在 IIFE 内定义，在按钮 click 回调中调用，无作用域问题
