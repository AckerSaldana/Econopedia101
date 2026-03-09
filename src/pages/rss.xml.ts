export const prerender = true;

import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { SITE } from '../lib/constants';

export async function GET(context: { site: string }) {
  const posts = (await getCollection('posts', ({ data }) => !data.draft))
    .sort((a, b) => b.data.publishedAt.valueOf() - a.data.publishedAt.valueOf());

  return rss({
    title: SITE.name,
    description: SITE.description,
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.publishedAt,
      description: post.data.description,
      link: `/blog/${post.slug}/`,
      categories: post.data.categories,
    })),
  });
}
