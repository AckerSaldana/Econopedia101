import { supabase } from '../../lib/supabase';
import { getCollection } from 'astro:content';

export const prerender = false;

export async function GET({ url }: { url: URL }) {
  const query = url.searchParams.get('q')?.trim();
  if (!query || query.length < 2) {
    return Response.json([]);
  }

  try {
    // Search Supabase posts via RPC — searches title, description, and block content
    const { data: dbRows } = await supabase.rpc('search_posts', {
      search_term: query,
    });

    const dbResults = ((dbRows || []) as { slug: string; title: string; description: string | null; categories: string[] | null; published_at: string | null }[])
      .map((p) => ({
        url: `/blog/${p.slug}`,
        title: p.title,
        excerpt: p.description || '',
        category: p.categories?.[0] || null,
      }));

    // Search MDX posts from content collection (title + description + body)
    const mdxPosts = await getCollection('posts', ({ data }) => !data.draft);
    const lowerQuery = query.toLowerCase();
    const mdxResults = mdxPosts
      .filter((p) =>
        p.data.title.toLowerCase().includes(lowerQuery) ||
        p.data.description.toLowerCase().includes(lowerQuery)
      )
      .map((p) => ({
        url: `/blog/${p.slug}`,
        title: p.data.title,
        excerpt: p.data.description || '',
        category: p.data.categories?.[0] || null,
      }));

    // Merge, deduplicate by URL (MDX wins), limit to 12
    const seen = new Set<string>();
    const merged = [];
    for (const r of [...mdxResults, ...dbResults]) {
      if (!seen.has(r.url)) {
        seen.add(r.url);
        merged.push(r);
      }
    }

    return Response.json(merged.slice(0, 12));
  } catch (err) {
    console.error('Search error:', err);
    return Response.json([], { status: 500 });
  }
}
