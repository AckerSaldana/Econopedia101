import type { Block } from './blocks';

export interface SupabasePost {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  published_at: string | null;
  updated_at: string | null;
  author_name: string;
  author_slug: string;
  categories: string[];
  tags: string[];
  featured: boolean;
  draft: boolean;
  cover_url: string | null;
  cover_alt: string | null;
  og_image_url: string | null;
  canonical_url: string | null;
  affiliate_disclosure: boolean;
  lead_magnet: { title: string; description: string; file: string } | null;
  blocks: Block[];
  word_count: number;
  created_at: string;
}
