import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
  const posts = await getCollection('posts');
  const sorted = posts.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());

  return rss({
    title: '终末诗篇',
    description: '家庭数据中心 PVE 笔记',
    site: context.site,
    items: sorted.map((post) => ({
      title: `${post.data.title}${post.data.titleEm ? ' — ' + post.data.titleEm : ''}`,
      description: post.data.description,
      pubDate: post.data.date,
      link: `/posts/${post.id}`,
    })),
    customData: `<language>zh-CN</language>`,
  });
}
