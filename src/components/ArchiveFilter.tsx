import { useState, useMemo, useEffect } from 'react';
import type { CollectionEntry } from 'astro:content';

const SERIES_ORDER = ['家庭数据中心 PVE 系列', '物理 · Physics'];
const MISC_LABEL = '俗世杂记 life.md';

interface Props {
  posts: CollectionEntry<'posts'>[];
}

export default function ArchiveFilter({ posts }: Props) {
  const [active, setActive] = useState<string | null>(null);

  const buttons = useMemo(() => {
    const discovered = Array.from(new Set(posts.flatMap((p) => p.data.series ?? [])));
    const extra = discovered.filter((s) => !SERIES_ORDER.includes(s));
    return [...SERIES_ORDER, ...extra, MISC_LABEL];
  }, [posts]);

  const filtered = useMemo(() => {
    if (active === null) return posts;
    if (active === MISC_LABEL) return posts.filter((p) => !p.data.series?.length);
    return posts.filter((p) => p.data.series?.includes(active));
  }, [active, posts]);

  const grouped = useMemo(() => {
    const map: Record<number, CollectionEntry<'posts'>[]> = {};
    for (const post of filtered) {
      const year = post.data.date.getFullYear();
      (map[year] ||= []).push(post);
    }
    return Object.entries(map).sort((a, b) => Number(b[0]) - Number(a[0]));
  }, [filtered]);

  useEffect(() => {
    document.dispatchEvent(new CustomEvent('content-updated'));
  }, [grouped]);

  return (
    <>
      <div className="filter reveal">
        <span className="label">筛选 · Filter</span>
        {buttons.map((f) => (
          <button
            key={f}
            className="pill"
            data-active={active === f}
            onClick={() => setActive(active === f ? null : f)}
          >
            {f}
          </button>
        ))}
      </div>

      {grouped.map(([year, items]: [string, CollectionEntry<'posts'>[]]) => (
        <div key={year} className="year-group">
          <div className="year reveal">{year}</div>
          <div className="list">
            {items.map((post: CollectionEntry<'posts'>) => (
              <a key={post.id} className="row reveal" href={`/posts/${post.id}`}>
                <div className="date">
                  {post.data.date.toISOString().slice(0, 10)}
                </div>
                <div className="title">
                  {post.data.title}
                  {post.data.titleEm && (
                    <>
                      {' '}
                      <span className="em">{post.data.titleEm}</span>
                    </>
                  )}
                </div>
                <div className="tag">{post.data.category}</div>
              </a>
            ))}
          </div>
        </div>
      ))}
    </>
  );
}
