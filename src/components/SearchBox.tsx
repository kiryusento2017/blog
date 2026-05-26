import { useState, useMemo, useEffect, useRef } from 'react';
import type { CollectionEntry } from 'astro:content';

interface Props {
  posts: CollectionEntry<'posts'>[];
}

export default function SearchBox({ posts }: Props) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return posts
      .filter(
        (p) =>
          p.data.title.toLowerCase().includes(q) ||
          (p.data.titleEm?.toLowerCase().includes(q)) ||
          p.data.description.toLowerCase().includes(q) ||
          p.data.tags.some((t: string) => t.toLowerCase().includes(q))
      )
      .slice(0, 8);
  }, [query, posts]);

  useEffect(() => {
    setOpen(results.length > 0);
  }, [results]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        setQuery('');
      }
    };
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('click', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('click', onClick);
    };
  }, []);

  return (
    <div ref={ref} className="search-box-wrap" style={{ position: 'relative' }}>
      <input
        type="search"
        placeholder="搜索文章..."
        value={query}
        onChange={(e) => setQuery((e.target as HTMLInputElement).value)}
        style={{
          fontFamily: 'var(--f-body)',
          fontSize: '14px',
          padding: '6px 12px',
          border: '1px solid var(--rule)',
          borderRadius: '4px',
          background: 'var(--bg-card)',
          color: 'var(--ink)',
          width: '180px',
          outline: 'none',
        }}
      />
      {open && results.length > 0 && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            width: '360px',
            background: 'var(--bg)',
            border: '1px solid var(--rule)',
            borderRadius: '4px',
            marginTop: '4px',
            zIndex: 50,
            maxHeight: '60vh',
            overflowY: 'auto',
          }}
        >
          {results.map((p) => (
            <a
              key={p.id}
              href={`/posts/${p.id}`}
              style={{
                display: 'block',
                padding: '12px 16px',
                borderBottom: '1px solid var(--rule)',
                color: 'var(--ink)',
                textDecoration: 'none',
              }}
            >
              <div style={{ fontFamily: 'var(--f-display)', fontSize: '18px' }}>
                {p.data.title}
                {p.data.titleEm && <> · {p.data.titleEm}</>}
              </div>
              <div
                style={{
                  fontFamily: 'var(--f-mono)',
                  fontSize: '10px',
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  color: 'var(--ink-faint)',
                  marginTop: '4px',
                }}
              >
                {p.data.category} · {p.data.date.toISOString().slice(0, 10)}
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
