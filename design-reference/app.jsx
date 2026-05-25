// =====================================================================
// 夜读 v2 — App shell + nav + tweaks
// =====================================================================

const { useState, useEffect, useRef } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "mode": "paper",
  "grain": true,
  "accent": "#7a2a20",
  "fontScale": 100
}/*EDITMODE-END*/;

function App() {
  const [view, setView] = useState({ name: "home", id: null });
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  // Apply tweaks
  useEffect(() => {
    document.body.dataset.mode = t.mode;
    document.body.dataset.grain = t.grain ? "on" : "off";
    document.documentElement.style.setProperty("--accent", t.accent);
    document.documentElement.style.fontSize = (16 * t.fontScale / 100) + "px";
  }, [t.mode, t.grain, t.accent, t.fontScale]);

  // Topbar scrolled state
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Keyboard shortcut: / to search
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "/" && !searchOpen && document.activeElement.tagName !== "INPUT") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [searchOpen]);

  // Scroll to top on view change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [view.name, view.id]);

  const openArticle = (id) => setView({ name: "article", id });
  const goto = (name) => setView({ name, id: null });

  return (
    <div className="shell">
      <header className={"topbar" + (scrolled ? " scrolled" : "")}>
        <div className="brand" onClick={() => goto("home")}>
          <span className="glyph"><span className="accent">夜</span>读</span>
          <span className="sub">A reading room · since 2021</span>
        </div>
        <nav className="nav">
          <button className="link" data-active={view.name === "home"} onClick={() => goto("home")}>首页</button>
          <button className="link" data-active={view.name === "archive"} onClick={() => goto("archive")}>归档</button>
          <button className="link" data-active={view.name === "colophon"} onClick={() => goto("colophon")}>关于</button>
          <button className="link keep" onClick={() => setSearchOpen(true)} title="按 / 唤起">
            搜寻 <span style={{ marginLeft: 4, opacity: 0.6 }}>⌕</span>
          </button>
          <button className="icon" onClick={() => setTweak("mode", t.mode === "paper" ? "dim" : "paper")} title="切换模式">
            {t.mode === "paper" ? (
              <svg viewBox="0 0 18 18" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M14.5 10A5.5 5.5 0 1 1 8 3.5a4.5 4.5 0 0 0 6.5 6.5z"/>
              </svg>
            ) : (
              <svg viewBox="0 0 18 18" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="9" cy="9" r="3"/>
                <path d="M9 2v1.5M9 14.5V16M2 9h1.5M14.5 9H16M4.2 4.2l1 1M12.8 12.8l1 1M4.2 13.8l1-1M12.8 5.2l1-1"/>
              </svg>
            )}
          </button>
        </nav>
      </header>

      <main>
        {view.name === "home" && <HomeView onOpen={openArticle} onGoto={goto} />}
        {view.name === "archive" && <ArchiveView onOpen={openArticle} />}
        {view.name === "article" && <ArticleView id={view.id} onOpen={openArticle} onBack={() => goto("home")} />}
        {view.name === "colophon" && <ColophonView />}
      </main>

      <footer className="foot">
        <div className="left">
          夜读 · A private reading room · Set in Instrument Serif &amp; Newsreader<br />
          Bound by hand, kept in Shanghai, written for one reader.
        </div>
        <div className="right">
          № {ENTRIES[0].num.replace("Nº ", "")} / {ENTRIES.length} entries<br />
          MMXXVI
        </div>
      </footer>

      {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} onOpen={openArticle} />}

      <TweaksPanel title="Tweaks · 调整">
        <TweakSection label="模式 · Mode">
          <TweakRadio
            label="底色"
            value={t.mode}
            options={[
              { value: "paper", label: "Paper" },
              { value: "dim", label: "Dim" },
            ]}
            onChange={v => setTweak("mode", v)}
          />
        </TweakSection>

        <TweakSection label="点缀色 · Accent">
          <AccentPicker mode={t.mode} value={t.accent} onChange={v => setTweak("accent", v)} />
        </TweakSection>

        <TweakSection label="质感 · Texture">
          <TweakToggle label="纸张颗粒" value={t.grain} onChange={v => setTweak("grain", v)} />
          <TweakSlider label="字号比例" value={t.fontScale} min={85} max={120} step={5} unit="%" onChange={v => setTweak("fontScale", v)} />
        </TweakSection>

        <TweakSection label="跳转 · Jump">
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <TweakButton label="首页" onClick={() => goto("home")} />
            <TweakButton label="一篇文章" onClick={() => openArticle("001")} />
            <TweakButton label="归档" onClick={() => goto("archive")} />
            <TweakButton label="关于" onClick={() => goto("colophon")} />
            <TweakButton label="搜索" onClick={() => setSearchOpen(true)} />
          </div>
        </TweakSection>
      </TweaksPanel>
    </div>
  );
}

function AccentPicker({ mode, value, onChange }) {
  const opts = mode === "dim"
    ? [
        { v: "#d4a574", n: "amber" },
        { v: "#e8a87c", n: "peach" },
        { v: "#c9a875", n: "ochre" },
        { v: "#a8c0a0", n: "sage" },
        { v: "#b8a8c8", n: "lilac" },
        { v: "#e8c060", n: "honey" },
      ]
    : [
        { v: "#7a2a20", n: "oxblood" },
        { v: "#1f4a3a", n: "forest" },
        { v: "#3a3a7a", n: "ink-blue" },
        { v: "#6a3a8a", n: "plum" },
        { v: "#8a4a1a", n: "rust" },
        { v: "#1a1a1a", n: "ink" },
      ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 6 }}>
      {opts.map(o => {
        const active = value === o.v;
        return (
          <button
            key={o.v}
            onClick={() => onChange(o.v)}
            title={o.n}
            style={{
              aspectRatio: "1",
              borderRadius: "50%",
              background: o.v,
              border: active ? "2px solid currentColor" : "1px solid rgba(128,128,128,0.25)",
              boxShadow: active ? `0 0 0 2px ${o.v}55` : "none",
              cursor: "pointer",
              transition: "transform 0.15s",
            }}
          />
        );
      })}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
