import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const posts = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    titleEm: z.string().optional(),
    date: z.coerce.date(),
    category: z.enum(['技术', '工具', '生活', '阅读', '物理']),
    tags: z.array(z.string()).optional().default([]),
    series: z.array(z.string()).optional(),
    description: z.string(),
    readTime: z.string().optional(),
    words: z.number().optional(),
    featured: z.boolean().optional().default(false),
    num: z.string().optional(),
  }),
});

export const collections = { posts };
