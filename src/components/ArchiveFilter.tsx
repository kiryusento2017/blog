import { useState, useMemo } from 'react';
import type { CollectionEntry } from 'astro:content';

const FILTERS = ['全部', '技术', '工具', '生活', '阅读'];

interface Props {
  posts: CollectionEntry<'posts'>[];
}

export default function ArchiveFilter({ posts }: Props) {
  const [active, setActive] = useState('全部');

  const filtered = useMemo(() => {
    if (active === '全部') return posts;
    return posts.filter((p) => p.data.category === active);
  }, [active, posts]);

  const grouped = useMemo(() => {
    const map: Record<number, CollectionEntry<'posts'>[]> = {};
    for (const post of filtered) {
      const year = post.data.date.getFullYear();
      (map[year] ||= []).push(post);
    }
    return Object.entries(map).sort((a, b) => Number(b[0]) - Number(a[0]));
  }, [filtered]);

  return (
    <>
      <div className="filter reveal">
        <span className="label">筛选 · Filter</span>
        {FILTERS.map((f) => (
          <button
            key={f}
            className="pill"
            data-active={active === f}
            onClick={() => setActive(f)}
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
