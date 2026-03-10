import { getCollection } from 'astro:content';
import { supabase } from './supabase';
import type { SupabasePost } from '../types/post';

export type NormalizedPost = {
  slug: string;
  data: {
    title: string;
    description: string;
    cover: ImageMetadata | string;
    coverAlt: string;
    coverIsUrl?: boolean;
    categories: string[];
    publishedAt: Date;
    featured?: boolean;
    author: { id: string };
  };
};

export async function getAllPosts(category?: string): Promise<NormalizedPost[]> {
  // 1. MDX posts from content collection
  const mdxPosts = await getCollection('posts', ({ data }) => {
    if (data.draft) return false;
    if (category && !data.categories.includes(category)) return false;
    return true;
  });

  // 2. Supabase posts
  let query = supabase
    .from('posts')
    .select('*')
    .eq('draft', false)
    .lte('published_at', new Date().toISOString())
    .order('published_at', { ascending: false });

  if (category) {
    query = query.contains('categories', [category]);
  }

  const { data: dbRows } = await query;
  const dbPosts = (dbRows || []) as SupabasePost[];

  // 3. Normalize MDX
  const mdxSlugs = new Set(mdxPosts.map((p) => p.slug));

  const normalizedMdx: NormalizedPost[] = mdxPosts.map((p) => ({
    slug: p.slug,
    data: {
      title: p.data.title,
      description: p.data.description,
      cover: p.data.cover,
      coverAlt: p.data.coverAlt,
      categories: p.data.categories,
      publishedAt: p.data.publishedAt,
      featured: p.data.featured,
      author: p.data.author,
    },
  }));

  // 4. Normalize Supabase (skip duplicates — MDX wins)
  const normalizedDb: NormalizedPost[] = dbPosts
    .filter((p) => !mdxSlugs.has(p.slug))
    .map((p) => ({
      slug: p.slug,
      data: {
        title: p.title,
        description: p.description || '',
        cover: p.cover_url || '',
        coverAlt: p.cover_alt || p.title,
        coverIsUrl: true,
        categories: p.categories || [],
        publishedAt: p.published_at ? new Date(p.published_at) : new Date(),
        featured: p.featured,
        author: { id: p.author_slug },
      },
    }));

  // 5. Merge & sort by date descending
  const allPosts = [...normalizedMdx, ...normalizedDb];
  allPosts.sort(
    (a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime(),
  );

  return allPosts;
}
