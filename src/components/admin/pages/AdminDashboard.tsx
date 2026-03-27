import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { Plus, Star, Puzzle, ExternalLink, ChevronRight } from 'lucide-react';

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

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

function timeAgo(dateString: string): string {
  const now = Date.now();
  const then = new Date(dateString).getTime();
  const diff = now - then;
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} minute${mins === 1 ? '' : 's'} ago`;
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  if (hours < 48) return 'yesterday';
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateString));
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
          .limit(7),
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

  if (loading) {
    return (
      <div className="p-10 max-w-5xl mx-auto">
        <div className="space-y-6">
          <div className="admin-skeleton" style={{ height: '32px', width: '180px' }} />
          <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-8">
            <div className="space-y-6">
              <div className="admin-skeleton" style={{ height: '160px' }} />
              <div className="admin-skeleton" style={{ height: '280px' }} />
            </div>
            <div className="space-y-6">
              <div className="admin-skeleton" style={{ height: '140px' }} />
              <div className="admin-skeleton" style={{ height: '160px' }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const maxBarValue = Math.max(
    stats.publishedPosts,
    stats.draftPosts,
    stats.featuredPosts,
    stats.totalQuizzes,
    1,
  );

  const breakdownItems = [
    {
      label: 'Published',
      value: stats.publishedPosts,
      color: 'var(--color-accent)',
    },
    {
      label: 'Drafts',
      value: stats.draftPosts,
      color: 'var(--color-warning)',
    },
    {
      label: 'Featured',
      value: stats.featuredPosts,
      color: 'var(--color-success)',
    },
    {
      label: 'Quizzes',
      value: stats.totalQuizzes,
      color: 'var(--color-info)',
    },
  ];

  const quickActions = [
    {
      label: 'New Post',
      icon: Plus,
      action: () => navigate('/admin/posts/new'),
    },
    {
      label: 'New Quiz',
      icon: Plus,
      action: () => navigate('/admin/quizzes/new'),
    },
    {
      label: 'View Site',
      icon: ExternalLink,
      action: () => window.open('/', '_blank'),
    },
  ];

  return (
    <div className="p-10 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-10">
        <div>
          <p className="admin-label" style={{ marginBottom: '4px' }}>
            {getGreeting()}
          </p>
          <h1 className="admin-page-title">Dashboard</h1>
        </div>
        <button
          className="admin-btn-primary"
          onClick={() => navigate('/admin/posts/new')}
        >
          <Plus size={16} />
          New Post
        </button>
      </div>

      {/* 2-Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-8">
        {/* LEFT COLUMN */}
        <div className="space-y-8 min-w-0">
          {/* Overview Card */}
          <div className="admin-card-accent">
            <div className="flex justify-between">
              {[
                {
                  value: stats.totalPosts,
                  label: 'Total Posts',
                  color: 'var(--color-text-primary)',
                },
                {
                  value: stats.publishedPosts,
                  label: 'Published',
                  color: 'var(--color-success)',
                },
                {
                  value: stats.draftPosts,
                  label: 'Drafts',
                  color: 'var(--color-warning)',
                },
              ].map((item) => (
                <div key={item.label} className="text-center flex-1">
                  <p className="admin-stat-value" style={{ color: item.color }}>
                    {item.value}
                  </p>
                  <p className="admin-stat-label">{item.label}</p>
                </div>
              ))}
            </div>

            <hr className="admin-divider" style={{ margin: '20px 0' }} />

            <div
              className="flex items-center gap-6"
              style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}
            >
              <span className="flex items-center gap-1.5">
                <Star size={14} />
                <span className="admin-mono">{stats.featuredPosts}</span>{' '}
                featured
              </span>
              <span className="flex items-center gap-1.5">
                <Puzzle size={14} />
                <span className="admin-mono">{stats.totalQuizzes}</span>{' '}
                quizzes{' '}
                <span style={{ color: 'var(--color-text-muted)' }}>
                  &middot; {stats.publishedQuizzes} published
                </span>
              </span>
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <div className="mb-5">
              <h2 className="admin-section-title">Recent Activity</h2>
            </div>

            {recentPosts.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                  No posts yet. Create your first post to get started.
                </p>
              </div>
            ) : (
              <>
                <div>
                  {recentPosts.map((post) => (
                    <button
                      key={post.id}
                      onClick={() => navigate(`/admin/posts/${post.id}`)}
                      className="admin-row-bordered"
                      style={{ justifyContent: 'space-between' }}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`admin-dot ${post.draft ? 'admin-dot-draft' : 'admin-dot-live'}`}
                          />
                          <span
                            className="truncate"
                            style={{
                              fontSize: '14px',
                              fontWeight: 500,
                              color: 'var(--color-text-primary)',
                            }}
                          >
                            {post.title || 'Untitled'}
                          </span>
                        </div>
                        <p
                          className="mt-0.5"
                          style={{
                            fontSize: '12px',
                            color: 'var(--color-text-muted)',
                            marginLeft: '18px',
                          }}
                        >
                          {timeAgo(post.updated_at)}
                        </p>
                      </div>
                      <span
                        className={`admin-status ${post.draft ? 'admin-status-draft' : 'admin-status-live'}`}
                      >
                        {post.draft ? 'Draft' : 'Published'}
                      </span>
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => navigate('/admin/posts')}
                  className="admin-link mt-4"
                >
                  View all posts
                  <ChevronRight size={14} />
                </button>
              </>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">
          {/* Quick Actions Card */}
          <div className="admin-card" style={{ padding: '20px' }}>
            <p className="admin-label" style={{ marginBottom: '14px' }}>
              Quick Actions
            </p>
            {quickActions.map((action) => (
              <button
                key={action.label}
                onClick={action.action}
                className="admin-action-row"
              >
                <span>{action.label}</span>
                <action.icon size={14} />
              </button>
            ))}
          </div>

          {/* Content Breakdown Card */}
          <div className="admin-card" style={{ padding: '20px' }}>
            <p className="admin-label" style={{ marginBottom: '14px' }}>
              Content
            </p>
            <div className="space-y-3">
              {breakdownItems.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-3"
                  style={{ fontSize: '12px' }}
                >
                  <span
                    className="shrink-0"
                    style={{
                      width: '64px',
                      color: 'var(--color-text-secondary)',
                    }}
                  >
                    {item.label}
                  </span>
                  <div
                    className="flex-1"
                    style={{
                      height: '6px',
                      backgroundColor: 'var(--color-border)',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        backgroundColor: item.color,
                        width: `${Math.max((item.value / maxBarValue) * 100, item.value > 0 ? 8 : 0)}%`,
                        minWidth: item.value > 0 ? '8px' : '0',
                        transition: 'width 300ms ease',
                      }}
                    />
                  </div>
                  <span
                    className="shrink-0 admin-mono"
                    style={{
                      color: 'var(--color-text-secondary)',
                      width: '20px',
                      textAlign: 'right',
                    }}
                  >
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
