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
      <div class="filter reveal">
        <span class="label">筛选 · Filter</span>
        {FILTERS.map((f) => (
          <button
            key={f}
            class="pill"
            data-active={active === f}
            onClick={() => setActive(f)}
          >
            {f}
          </button>
        ))}
      </div>

      {grouped.map(([year, items]: [string, CollectionEntry<'posts'>[]]) => (
        <div key={year} class="year-group">
          <div class="year reveal">{year}</div>
          <div class="list">
            {items.map((post: CollectionEntry<'posts'>) => (
              <a key={post.id} class="row reveal" href={`/posts/${post.id}`}>
                <div class="date">
                  {post.data.date.toISOString().slice(0, 10)}
                </div>
                <div class="title">
                  {post.data.title}
                  {post.data.titleEm && (
                    <>
                      {' '}
                      <span class="em">{post.data.titleEm}</span>
                    </>
                  )}
                </div>
                <div class="tag">{post.data.category}</div>
              </a>
            ))}
          </div>
        </div>
      ))}
    </>
  );
}
