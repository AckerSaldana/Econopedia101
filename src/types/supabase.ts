import type { Block } from './blocks';

export interface Database {
  public: {
    Tables: {
      admin_allowlist: {
        Row: {
          email: string;
        };
        Insert: {
          email: string;
        };
        Update: {
          email?: string;
        };
      };
      posts: {
        Row: {
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
        };
        Insert: {
          slug: string;
          title: string;
          description?: string | null;
          published_at?: string | null;
          author_name?: string;
          author_slug?: string;
          categories?: string[];
          tags?: string[];
          featured?: boolean;
          draft?: boolean;
          cover_url?: string | null;
          cover_alt?: string | null;
          og_image_url?: string | null;
          canonical_url?: string | null;
          affiliate_disclosure?: boolean;
          lead_magnet?: { title: string; description: string; file: string } | null;
          blocks?: Block[];
          word_count?: number;
        };
        Update: {
          slug?: string;
          title?: string;
          description?: string | null;
          published_at?: string | null;
          updated_at?: string | null;
          author_name?: string;
          author_slug?: string;
          categories?: string[];
          tags?: string[];
          featured?: boolean;
          draft?: boolean;
          cover_url?: string | null;
          cover_alt?: string | null;
          og_image_url?: string | null;
          canonical_url?: string | null;
          affiliate_disclosure?: boolean;
          lead_magnet?: { title: string; description: string; file: string } | null;
          blocks?: Block[];
          word_count?: number;
        };
      };
      likes: {
        Row: {
          id: number;
          post_slug: string;
          created_at: string;
        };
        Insert: {
          post_slug: string;
        };
        Update: never;
      };
      comments: {
        Row: {
          id: number;
          post_slug: string;
          user_id: string;
          user_name: string;
          user_avatar_url: string | null;
          body: string;
          created_at: string;
        };
        Insert: {
          post_slug: string;
          user_id: string;
          user_name: string;
          user_avatar_url?: string | null;
          body: string;
        };
        Update: never;
      };
      quizzes: {
        Row: {
          id: string;
          slug: string;
          title: string;
          description: string;
          category: string;
          related_post_slugs: string[];
          questions: import('../lib/quiz/types').Question[];
          passing_score: number;
          published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          slug: string;
          title: string;
          description?: string;
          category?: string;
          related_post_slugs?: string[];
          questions: import('../lib/quiz/types').Question[];
          passing_score?: number;
          published?: boolean;
        };
        Update: {
          slug?: string;
          title?: string;
          description?: string;
          category?: string;
          related_post_slugs?: string[];
          questions?: import('../lib/quiz/types').Question[];
          passing_score?: number;
          published?: boolean;
        };
      };
      quiz_attempts: {
        Row: {
          id: string;
          quiz_id: string;
          score: number;
          total: number;
          created_at: string;
        };
        Insert: {
          quiz_id: string;
          score: number;
          total: number;
        };
        Update: never;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
