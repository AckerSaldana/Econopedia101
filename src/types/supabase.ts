export interface Database {
  public: {
    Tables: {
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
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
