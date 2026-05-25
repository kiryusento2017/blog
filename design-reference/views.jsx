// =====================================================================
// 夜读 v2 — views (Home + Article + Archive + Colophon)
// =====================================================================

const { useState, useMemo, useEffect, useRef } = React;
const ENTRIES = window.ENTRIES;
const CATEGORIES = window.CATEGORIES;
const FILTERS = window.FILTERS;

// ----------------------------- Reveal hook -----------------------------
// Adds .in class to children when they scroll into view. Stagger delay
// via inline style.
function useReveal() {
  const rootRef = useRef(null);
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const targets = root.querySelectorAll(".reveal, .reveal-word");
    if (!targets.length) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -8% 0px" });
    targets.forEach(t => io.observe(t));
    return () => io.disconnect();
  }, []);
  return rootRef;
}

// Split a string into per-word reveal spans
function WordReveal({ text, baseDelay = 0, perWord = 50, className = "" }) {
  const words = String(text).split(/(\s+)/);
  return (
    <span className={className}>
      {words.map((w, i) =>
        /\s+/.test(w)
          ? <span key={i}>{w}</span>
          : (
            <span
              key={i}
              className="reveal-word"
              style={{ "--rev-delay": (baseDelay + i * perWord) + "ms" }}
            >{w}</span>
          )
      )}
    </span>
  );
}

// =====================================================================
// HOME
// =====================================================================
function HomeView({ onOpen, onGoto }) {
  const rootRef = useReveal();

  const featured = useMemo(() => ENTRIES.find(e => e.featured) || ENTRIES[0], []);
  const recent = useMemo(() => ENTRIES.filter(e => e.id !== featured.id).slice(0, 6), [featured]);

  // Per-category last article for cat strip
  const catLatest = useMemo(() => {
    const m = {};
    ENTRIES.forEach(e => { if (!m[e.cat]) m[e.cat] = e; });
    return m;
  }, []);

  return (
    <div ref={rootRef} data-screen-label="01 Home">
      {/* Hero — pitch.com-style giant headline */}
      <section className="hero">
        <div className="eyebrow reveal">
          <span className="pulse"></span>
          <span>Issue No. 047</span>
          <span className="dash"></span>
          <span>2026 · 上海</span>
          <span className="dash"></span>
          <span>仅 你 可 见</span>
        </div>

        <h1>
          <WordReveal text="把混乱" baseDelay={0} perWord={120} />
          <span className="reveal-word" style={{ "--rev-delay": "240ms" }}>{" "}</span>
          <span className="reveal-word em" style={{ "--rev-delay": "360ms" }}>想清楚</span>
          <br />
          <span className="reveal-word light" style={{ "--rev-delay": "560ms" }}>的</span>
          <span className="reveal-word light" style={{ "--rev-delay": "660ms" }}>{" "}笔</span>
          <span className="reveal-word light" style={{ "--rev-delay": "760ms" }}>记</span>
          <span className="reveal-word" style={{ "--rev-delay": "860ms" }}>。</span>
        </h1>

        <p className="dek reveal" style={{ "--rev-delay": "1100ms" }}>
          代码、工具、生活，以及那些不容易被算法推荐到你面前的东西。
          一个公开的笔记本，更像是写给一年后的自己看。
        </p>

        <div className="meta-strip reveal" style={{ "--rev-delay": "1400ms" }}>
          <div className="item">
            <div className="k">条目</div>
            <div className="v">{String(ENTRIES.length).padStart(3, "0")}<span className="small">/ 自二〇二一</span></div>
          </div>
          <div className="item">
            <div className="k">最近</div>
            <div className="v">{featured.date}<span className="small">· {featured.cat}</span></div>
          </div>
          <div className="item">
            <div className="k">本月在做</div>
            <div className="v">RSC<span className="small">+ Zustand → Jotai</span></div>
          </div>
          <div className="item">
            <div className="k">在读</div>
            <div className="v"><em>Data-Intensive</em><span className="small">Designing</span></div>
          </div>
        </div>

        <div className="cue">
          <span>SCROLL</span>
          <span className="line"></span>
        </div>
      </section>

      {/* Featured */}
      <section className="section">
        <div className="section-head reveal">
          <div className="left">
            <span className="num">/ 01</span>
            <h2>最新一篇 <span className="em">· latest</span></h2>
          </div>
          <span className="right" onClick={() => onOpen(featured.id)}>
            <span>开始阅读</span>
            <span className="arrow"></span>
          </span>
        </div>

        <div className="featured reveal">
          <div className="featured-card" onClick={() => onOpen(featured.id)}>
            <div className="left-col">
              <div className="cat-row">
                <span>{featured.cat}</span>
                <span>·</span>
                <span>{(featured.tags || []).join(" / ")}</span>
                <span className="num">— {featured.num}</span>
              </div>
              <h3>
                {featured.title}<br />
                <span className="em">{featured.titleEm}</span>
              </h3>
              <p className="dek">{featured.dek}</p>
              <div className="read">
                <span>阅读全文</span>
                <span className="arr"></span>
              </div>
            </div>

            <div className="meta-side">
              <div className="row">
                <div className="k">日期</div>
                <div className="v">{featured.dateLong}</div>
              </div>
              <div className="row">
                <div className="k">阅读时间</div>
                <div className="v">{featured.reads}</div>
              </div>
              <div className="row">
                <div className="k">字数</div>
                <div className="v mono">{featured.words ? featured.words.toLocaleString() : "—"}</div>
              </div>
              {featured.codePeek && (
                <div className="code-peek">
                  <span className="c">{featured.codePeek.c}</span><br />
                  <span className="k">{featured.codePeek.k}</span>{" "}{featured.codePeek.f}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Category strip */}
      <section className="section">
        <div className="section-head reveal">
          <div className="left">
            <span className="num">/ 02</span>
            <h2>按类别 <span className="em">· by category</span></h2>
          </div>
          <span className="right" onClick={() => onGoto("archive")}>
            <span>查看归档</span>
            <span className="arrow"></span>
          </span>
        </div>

        <div className="cats">
          {CATEGORIES.map((c, i) => {
            const latest = catLatest[c.key];
            return (
              <div
                key={c.key}
                className="cat-card reveal"
                style={{ "--rev-delay": (i * 100) + "ms" }}
                onClick={() => latest && onOpen(latest.id)}
              >
                <div className="cat-num">
                  {String(c.count).padStart(2, "0")}
                  <span className="of">/ 篇</span>
                </div>
                <h4>{c.key} <span className="em">· {c.desc.split(" / ")[0]}</span></h4>
                <div style={{ fontFamily: "var(--f-body)", fontSize: 13, color: "var(--ink-soft)", fontStyle: "italic", lineHeight: 1.5 }}>
                  {c.desc}
                </div>
                {latest && (
                  <div className="latest">
                    最新 · {latest.date}
                    <span className="t">{latest.title}{latest.titleEm ? ` · ${latest.titleEm}` : ""}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Recent grid */}
      <section className="section">
        <div className="section-head reveal">
          <div className="left">
            <span className="num">/ 03</span>
            <h2>近期 <span className="em">· recent</span></h2>
          </div>
          <span className="right" onClick={() => onGoto("archive")}>
            <span>所有 {ENTRIES.length} 篇</span>
            <span className="arrow"></span>
          </span>
        </div>

        <div className="grid">
          {recent.map((e, i) => (
            <div
              key={e.id}
              className="grid-item reveal"
              style={{ "--rev-delay": (i * 80) + "ms" }}
              onClick={() => onOpen(e.id)}
            >
              <div className="top">
                <span className="num">— {e.num}</span>
                <span className="date">{e.date}</span>
              </div>
              <h4>
                {e.title}
                {e.titleEm && <> <span className="em">{e.titleEm}</span></>}
              </h4>
              <div className="exc">{e.dek}</div>
              <div className="foot">
                <span>{e.cat}</span>
                <span>{e.reads}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

// =====================================================================
// ARCHIVE
// =====================================================================
function ArchiveView({ onOpen }) {
  const rootRef = useReveal();
  const [active, setActive] = useState("全部");

  const filtered = useMemo(() => {
    if (active === "全部") return ENTRIES;
    return ENTRIES.filter(e => e.cat === active);
  }, [active]);

  const grouped = useMemo(() => {
    const m = {};
    filtered.forEach(e => { (m[e.year] = m[e.year] || []).push(e); });
    return Object.entries(m).sort((a, b) => b[0] - a[0]);
  }, [filtered]);

  return (
    <div ref={rootRef} data-screen-label="02 Archive">
      <section className="hero" style={{ paddingTop: "12vh", paddingBottom: "8vh" }}>
        <div className="eyebrow reveal">
          <span className="dash"></span>
          <span>Archive · 归档</span>
          <span className="dash"></span>
        </div>
        <h1 className="reveal">
          所有<br /><span className="em">写过的</span>
        </h1>
        <p className="dek reveal" style={{ "--rev-delay": "300ms" }}>
          一共 {ENTRIES.length} 篇。没有删除的，仍然记得的，仍然愿意被读到的。
        </p>
      </section>

      <section className="section">
        <div className="filter reveal">
          <span className="label">筛选 · Filter</span>
          {FILTERS.map(f => (
            <button
              key={f}
              className="pill"
              data-active={active === f}
              onClick={() => setActive(f)}
            >
              {f}
              {f !== "全部" && <span className="count">{ENTRIES.filter(e => e.cat === f).length}</span>}
            </button>
          ))}
        </div>

        {grouped.map(([year, items]) => (
          <div key={year} className="year-group">
            <div className="year reveal">{year}</div>
            <div className="list">
              {items.map((e, i) => (
                <div
                  key={e.id}
                  className="row reveal"
                  style={{ "--rev-delay": (i * 60) + "ms" }}
                  onClick={() => onOpen(e.id)}
                >
                  <div className="date">{e.date}</div>
                  <div className="title">
                    {e.title}
                    {e.titleEm && <> <span className="em">{e.titleEm}</span></>}
                  </div>
                  <div className="tag">{e.cat}</div>
                  <div className="reads">{e.reads}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}

// =====================================================================
// ARTICLE
// =====================================================================
function ArticleView({ id, onOpen, onBack }) {
  const rootRef = useReveal();
  const entry = ENTRIES.find(e => e.id === id) || ENTRIES[0];
  const idx = ENTRIES.findIndex(e => e.id === entry.id);
  const prev = ENTRIES[idx + 1];
  const next = ENTRIES[idx - 1];

  const body = entry.body || [
    { type: "lead", text: entry.dek },
    { type: "p", text: "这一篇还没写完，先放个开头在这里——但读者已经能看到样式了。" },
  ];

  const headings = body.filter(b => b.type === "h2");

  const [pct, setPct] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      setPct(max > 0 ? Math.min(100, Math.round((h.scrollTop / max) * 100)) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [id]);

  return (
    <div ref={rootRef} className="article" data-screen-label="03 Article">
      <aside className="article-rail left">
        <div className="item"><div className="k">编号</div><div className="v">{entry.num}</div></div>
        <div className="item"><div className="k">日期</div><div className="v">{entry.dateLong}</div></div>
        <div className="item"><div className="k">类目</div><div className="v">{entry.cat}</div></div>
        <div className="item"><div className="k">字数</div><div className="v">{entry.words ? entry.words.toLocaleString() : "—"}</div></div>
        <div className="item"><div className="k">阅读</div><div className="v">{entry.reads}</div></div>
        <div className="item" style={{ marginTop: 18 }}>
          <div className="k">标签</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 6 }}>
            {(entry.tags || []).map(t => (
              <span key={t} className="pill" style={{ fontSize: 9, padding: "4px 8px" }}>{t}</span>
            ))}
          </div>
        </div>
      </aside>

      <main className="article-body">
        <div className="eyebrow reveal">
          <span className="dot"></span>
          <span>{entry.cat}</span>
          <span>·</span>
          <span>{entry.reads} 阅读</span>
        </div>

        <h1 className="reveal">
          {entry.title}
          {entry.titleEm && <><br /><span className="em">{entry.titleEm}</span></>}
        </h1>

        <p className="dek reveal" style={{ "--rev-delay": "200ms" }}>{entry.dek}</p>

        <div className="meta-strip reveal" style={{ "--rev-delay": "300ms" }}>
          <span>记 / <span className="v">独自</span></span>
          <span>页 / <span className="v">001 — 004</span></span>
          <span>字数 / <span className="v">{entry.words ? entry.words.toLocaleString() : "—"}</span></span>
          <span>状态 / <span className="v">已发布</span></span>
        </div>

        {body.map((b, i) => {
          const cls = "reveal";
          const style = { "--rev-delay": (i * 30) + "ms" };
          if (b.type === "lead") return <p key={i} className={`lead ${cls}`} style={style}>{b.text}</p>;
          if (b.type === "p") return <p key={i} className={cls} style={style}>{b.text}</p>;
          if (b.type === "h2") return <h2 key={i} className={cls} style={style}>{b.num && <span className="num">/ {b.num}</span>}{b.text}</h2>;
          if (b.type === "quote") return <blockquote key={i} className={cls} style={style}>"{b.text}"</blockquote>;
          if (b.type === "callout") return (
            <div key={i} className={`callout ${cls}`} style={style}>
              <div className="ic">{b.icon}</div>
              <div className="b" dangerouslySetInnerHTML={{ __html: b.text.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>") }} />
            </div>
          );
          if (b.type === "code") return (
            <pre key={i} className={cls} style={style}>
              {b.lang && <span className="lang">{b.lang}</span>}
              <code dangerouslySetInnerHTML={{ __html: hl(b.code) }} />
            </pre>
          );
          if (b.type === "hr") return <hr key={i} className={cls} style={style} />;
          return null;
        })}

        <div className="article-end reveal">· · ·</div>

        {/* Prev / next */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginTop: 56, paddingTop: 28, borderTop: "1px solid var(--rule)" }}>
          {prev ? (
            <div className="reveal" style={{ cursor: "pointer" }} onClick={() => onOpen(prev.id)}>
              <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--ink-faint)", marginBottom: 8 }}>← 上一篇</div>
              <div style={{ fontFamily: "var(--f-display)", fontSize: 22, lineHeight: 1.2 }}>{prev.title}{prev.titleEm ? ` · ${prev.titleEm}` : ""}</div>
            </div>
          ) : <div />}
          {next ? (
            <div className="reveal" style={{ cursor: "pointer", textAlign: "right" }} onClick={() => onOpen(next.id)}>
              <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--ink-faint)", marginBottom: 8 }}>下一篇 →</div>
              <div style={{ fontFamily: "var(--f-display)", fontSize: 22, lineHeight: 1.2 }}>{next.title}{next.titleEm ? ` · ${next.titleEm}` : ""}</div>
            </div>
          ) : <div />}
        </div>
      </main>

      <aside className="article-rail right">
        <div className="h">目录 · Contents</div>
        {headings.length ? headings.map((h, i) => (
          <div key={i} className="toc-item">
            <span className="n">{h.num}</span>
            <span>{h.text}</span>
          </div>
        )) : (
          <div style={{ fontSize: 12, color: "var(--ink-faint)", lineHeight: 1.6 }}>
            这篇较短，没有分节。
          </div>
        )}
        <div className="progress">
          <div className="bar"><div className="fill" style={{ width: pct + "%" }}></div></div>
          <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--ink-faint)" }}>已读 {pct}%</div>
        </div>
      </aside>
    </div>
  );
}

// Minimal token coloring
function hl(code) {
  return String(code)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/(\/\/[^\n]*)/g, '<span class="c">$1</span>')
    .replace(/(['"`])(.*?)\1/g, '<span class="s">$1$2$1</span>')
    .replace(/\b(async|await|function|const|let|var|return|import|export|from|default|if|else|new|class|extends|interface|type|true|false)\b/g, '<span class="k">$1</span>')
    .replace(/\b([a-zA-Z_$][\w$]*)(?=\s*\()/g, '<span class="f">$1</span>');
}

// =====================================================================
// COLOPHON (about)
// =====================================================================
function ColophonView() {
  const rootRef = useReveal();
  return (
    <div ref={rootRef} className="colophon" data-screen-label="04 Colophon">
      <h1 className="reveal">
        关 <span className="em">于</span>
      </h1>
      <div className="col-body">
        <p className="reveal">
          这是一个只给自己看的地方。我把它叫做《夜读》——因为大部分文字都是在夜里写下的，而它们也只在夜里被人翻开。我不打算把它做成任何意义上的"内容"，它更像一间私人的书房：纸张会变黄，墨水会渗开，桌子上永远摆着一杯凉了的茶。
        </p>
        <p className="reveal" style={{ "--rev-delay": "100ms" }}>
          白天我写 TypeScript，做开发者工具方向的产品。晚上有时候写中文。这两件事看起来不一样，但其实都是在练习同一件事——把混乱的东西想清楚，并且写下来。
        </p>
        <p className="reveal" style={{ "--rev-delay": "200ms" }}>
          从二〇二一年五月的一个失眠的晚上开始，到今天大概写了一百三十七篇，删掉了其中的九十篇。剩下的这些不是写得最好的，只是没有删的。我不再相信"好"这件事，我更相信"留下"。
        </p>
        <p className="reveal" style={{ "--rev-delay": "300ms" }}>
          如果有人不小心闯了进来，请保持安静，像走进一间空着的图书馆。可以坐下读一会儿，但不要拍照，不要带走。
        </p>
      </div>

      <div className="meta-block reveal" style={{ "--rev-delay": "400ms" }}>
        <div className="item">
          <div className="k">条目 — Entries</div>
          <div className="v">{ENTRIES.length} 篇</div>
        </div>
        <div className="item">
          <div className="k">起始 — Since</div>
          <div className="v">二〇二一</div>
        </div>
        <div className="item">
          <div className="k">字数 — Words</div>
          <div className="v">约 84,000</div>
        </div>
        <div className="item">
          <div className="k">字体 — Set in</div>
          <div className="v">Instrument / Newsreader</div>
        </div>
        <div className="item">
          <div className="k">坐标 — Location</div>
          <div className="v">上海</div>
        </div>
        <div className="item">
          <div className="k">状态 — Status</div>
          <div className="v">在写</div>
        </div>
      </div>
    </div>
  );
}

// =====================================================================
// SEARCH
// =====================================================================
function SearchOverlay({ onClose, onOpen }) {
  const [q, setQ] = useState("");
  const results = useMemo(() => {
    if (!q.trim()) return ENTRIES.slice(0, 6);
    return ENTRIES.filter(e =>
      e.title.includes(q) ||
      (e.titleEm && e.titleEm.includes(q)) ||
      (e.dek && e.dek.includes(q)) ||
      (e.tags && e.tags.some(t => t.toLowerCase().includes(q.toLowerCase())))
    );
  }, [q]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="search-overlay" onClick={onClose}>
      <div className="search-box" onClick={e => e.stopPropagation()}>
        <input
          autoFocus
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="搜寻一篇还记得几个字的⋯⋯"
        />
        <div className="search-results">
          {results.length === 0 && (
            <div className="r"><div className="t" style={{ fontStyle: "italic", color: "var(--ink-faint)" }}>没有找到。也许它还没有被写下来。</div></div>
          )}
          {results.map(e => (
            <div key={e.id} className="r" onClick={() => { onOpen(e.id); onClose(); }}>
              <div className="t">{e.title}{e.titleEm ? ` · ${e.titleEm}` : ""}</div>
              <div className="d">{e.cat} · {e.date}</div>
            </div>
          ))}
        </div>
        <div className="search-foot">
          <span>{results.length} 篇</span>
          <span><kbd>esc</kbd> 关闭 · <kbd>/</kbd> 唤起</span>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { HomeView, ArchiveView, ArticleView, ColophonView, SearchOverlay });
