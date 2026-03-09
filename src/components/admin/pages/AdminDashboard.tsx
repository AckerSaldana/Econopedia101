import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { Plus, FileText, HelpCircle } from 'lucide-react';

interface AdminDashboardProps {
  navigate: (to: string) => void;
}

interface Stats {
  totalPosts: number;
  draftPosts: number;
  publishedPosts: number;
  featuredPosts: number;
  totalQuizzes: number;
  publishedQuizzes: number;
}

interface RecentPost {
  id: string;
  title: string;
  draft: boolean;
  updated_at: string;
}

export default function AdminDashboard({ navigate }: AdminDashboardProps) {
  const [stats, setStats] = useState<Stats>({
    totalPosts: 0,
    draftPosts: 0,
    publishedPosts: 0,
    featuredPosts: 0,
    totalQuizzes: 0,
    publishedQuizzes: 0,
  });
  const [recentPosts, setRecentPosts] = useState<RecentPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [postsRes, quizzesRes, recentRes] = await Promise.all([
        supabase.from('posts').select('draft, featured', { count: 'exact' }),
        supabase.from('quizzes').select('published', { count: 'exact' }),
        supabase
          .from('posts')
          .select('id, title, draft, updated_at')
          .order('updated_at', { ascending: false })
          .limit(5),
      ]);

      const posts = postsRes.data || [];
      const quizzes = quizzesRes.data || [];

      setStats({
        totalPosts: posts.length,
        draftPosts: posts.filter((p: any) => p.draft).length,
        publishedPosts: posts.filter((p: any) => !p.draft).length,
        featuredPosts: posts.filter((p: any) => p.featured).length,
        totalQuizzes: quizzes.length,
        publishedQuizzes: quizzes.filter((q: any) => q.published).length,
      });

      setRecentPosts((recentRes.data || []) as RecentPost[]);
      setLoading(false);
    }
    load();
  }, []);

  const formatDate = (d: string) =>
    new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(
      new Date(d),
    );

  const StatCard = ({ label, value }: { label: string; value: number }) => (
    <div
      className="border p-5"
      style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
    >
      <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--color-text-muted)' }}>
        {label}
      </p>
      <p className="text-2xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
        {value}
      </p>
    </div>
  );

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-gray-200" />
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-200" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <h1
          className="text-2xl font-semibold"
          style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-text-primary)' }}
        >
          Dashboard
        </h1>
        <button
          onClick={() => navigate('/admin/posts/new')}
          className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: 'var(--color-accent)' }}
        >
          <Plus size={16} />
          New Post
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Posts" value={stats.totalPosts} />
        <StatCard label="Published" value={stats.publishedPosts} />
        <StatCard label="Drafts" value={stats.draftPosts} />
        <StatCard label="Featured" value={stats.featuredPosts} />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <StatCard label="Total Quizzes" value={stats.totalQuizzes} />
        <StatCard label="Published Quizzes" value={stats.publishedQuizzes} />
      </div>

      {/* Recent posts */}
      <div className="border" style={{ borderColor: 'var(--color-border)' }}>
        <div
          className="px-5 py-3 border-b"
          style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
        >
          <h2 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            Recent Activity
          </h2>
        </div>
        {recentPosts.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              No posts yet. Create your first post to get started.
            </p>
          </div>
        ) : (
          <div>
            {recentPosts.map((post) => (
              <button
                key={post.id}
                onClick={() => navigate(`/admin/posts/${post.id}`)}
                className="w-full flex items-center justify-between px-5 py-3 border-b last:border-b-0 text-left hover:bg-black/[0.02] transition-colors"
                style={{ borderColor: 'var(--color-border)' }}
              >
                <div className="flex items-center gap-3">
                  <FileText size={14} style={{ color: 'var(--color-text-muted)' }} />
                  <span className="text-sm" style={{ color: 'var(--color-text-primary)' }}>
                    {post.title || 'Untitled'}
                  </span>
                  <span
                    className="text-xs px-1.5 py-0.5"
                    style={{
                      backgroundColor: post.draft ? 'var(--color-accent-light)' : '#D1FAE5',
                      color: post.draft ? 'var(--color-accent)' : '#059669',
                    }}
                  >
                    {post.draft ? 'Draft' : 'Published'}
                  </span>
                </div>
                <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  {formatDate(post.updated_at)}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
