export const prerender = false;

import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getAllPosts } from '../lib/posts';
import { SITE } from '../lib/constants';

export async function GET(context: APIContext) {
  const posts = await getAllPosts();

  const response = await rss({
    title: SITE.name,
    description: SITE.description,
    site: context.site!.toString(),
    items: posts.slice(0, 50).map((post) => ({
      title: post.data.title,
      pubDate: post.data.publishedAt,
      description: post.data.description,
      link: `/blog/${post.slug}/`,
      categories: post.data.categories,
    })),
    customData: `<language>${SITE.lang}</language>`,
  });

  response.headers.set('Cache-Control', 'public, max-age=3600, s-maxage=3600');
  return response;
}
