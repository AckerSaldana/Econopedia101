import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { Plus, Star, Puzzle, ExternalLink, ChevronRight } from 'lucide-react';
import { pageTitle, sectionTitle, labelBase, btnPrimary } from '../adminStyles';

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
      <div className="p-8 max-w-5xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div
            className="h-8 w-48"
            style={{ backgroundColor: 'var(--color-border)', opacity: 0.5 }}
          />
          <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-6">
            <div className="space-y-6">
              <div
                className="h-40"
                style={{
                  backgroundColor: 'var(--color-border)',
                  opacity: 0.3,
                }}
              />
              <div
                className="h-56"
                style={{
                  backgroundColor: 'var(--color-border)',
                  opacity: 0.3,
                }}
              />
            </div>
            <div className="space-y-6">
              <div
                className="h-36"
                style={{
                  backgroundColor: 'var(--color-border)',
                  opacity: 0.3,
                }}
              />
              <div
                className="h-36"
                style={{
                  backgroundColor: 'var(--color-border)',
                  opacity: 0.3,
                }}
              />
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
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p
            className="text-xs uppercase mb-1"
            style={{
              letterSpacing: '0.06em',
              color: 'var(--color-text-muted)',
              fontWeight: 600,
            }}
          >
            {getGreeting()}
          </p>
          <h1 style={pageTitle}>Dashboard</h1>
        </div>
        <button onClick={() => navigate('/admin/posts/new')} style={btnPrimary}>
          <Plus size={16} />
          New Post
        </button>
      </div>

      {/* 2-Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-6">
        {/* LEFT COLUMN */}
        <div className="space-y-6 min-w-0">
          {/* Overview Card */}
          <div
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderTop: '2px solid var(--color-accent)',
              padding: '24px',
            }}
          >
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
                  <p
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: '36px',
                      fontWeight: 600,
                      lineHeight: 1,
                      color: item.color,
                    }}
                  >
                    {item.value}
                  </p>
                  <p
                    className="mt-2"
                    style={{
                      fontSize: '11px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      color: 'var(--color-text-muted)',
                      fontWeight: 600,
                    }}
                  >
                    {item.label}
                  </p>
                </div>
              ))}
            </div>

            <div
              className="my-4"
              style={{
                height: '1px',
                backgroundColor: 'var(--color-border)',
              }}
            />

            <div
              className="flex items-center gap-6"
              style={{
                fontSize: '13px',
                color: 'var(--color-text-secondary)',
              }}
            >
              <span className="flex items-center gap-1.5">
                <Star size={14} />
                <span style={{ fontFamily: 'var(--font-mono)' }}>
                  {stats.featuredPosts}
                </span>{' '}
                featured
              </span>
              <span className="flex items-center gap-1.5">
                <Puzzle size={14} />
                <span style={{ fontFamily: 'var(--font-mono)' }}>
                  {stats.totalQuizzes}
                </span>{' '}
                quizzes{' '}
                <span style={{ color: 'var(--color-text-muted)' }}>
                  &middot; {stats.publishedQuizzes} published
                </span>
              </span>
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <div className="mb-4">
              <h2 style={sectionTitle}>Recent Activity</h2>
              <div
                className="mt-1"
                style={{
                  width: '48px',
                  height: '2px',
                  backgroundColor: 'var(--color-accent)',
                }}
              />
            </div>

            {recentPosts.length === 0 ? (
              <div className="py-8 text-center">
                <p
                  className="text-sm"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  No posts yet. Create your first post to get started.
                </p>
              </div>
            ) : (
              <>
                <div>
                  {recentPosts.map((post, i) => (
                    <button
                      key={post.id}
                      onClick={() => navigate(`/admin/posts/${post.id}`)}
                      className="w-full flex items-center justify-between text-left"
                      style={{
                        padding: '12px 8px',
                        borderBottom:
                          i < recentPosts.length - 1
                            ? '1px solid var(--color-border)'
                            : 'none',
                        background: 'transparent',
                        cursor: 'pointer',
                        transition: 'background-color 150ms ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor =
                          'var(--color-surface-elevated)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2.5">
                          <span
                            className="shrink-0"
                            style={{
                              width: '8px',
                              height: '8px',
                              borderRadius: '50%',
                              backgroundColor: post.draft
                                ? 'var(--color-warning)'
                                : 'var(--color-accent)',
                            }}
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
                          className="ml-[18px] mt-0.5"
                          style={{
                            fontSize: '12px',
                            color: 'var(--color-text-muted)',
                          }}
                        >
                          {timeAgo(post.updated_at)}
                        </p>
                      </div>
                      <span
                        style={{
                          fontSize: '11px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.06em',
                          fontWeight: 600,
                          color: post.draft
                            ? 'var(--color-warning)'
                            : 'var(--color-success)',
                        }}
                      >
                        {post.draft ? 'Draft' : 'Published'}
                      </span>
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => navigate('/admin/posts')}
                  className="flex items-center gap-1 mt-3"
                  style={{
                    fontSize: '13px',
                    color: 'var(--color-accent)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 500,
                    padding: 0,
                  }}
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
          <div
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              padding: '16px',
            }}
          >
            <p style={{ ...labelBase, marginBottom: '12px' }}>Quick Actions</p>
            {quickActions.map((action, i) => (
              <button
                key={action.label}
                onClick={action.action}
                className="w-full flex items-center justify-between"
                style={{
                  fontSize: '13px',
                  color: 'var(--color-text-secondary)',
                  padding: '10px 0',
                  borderBottom:
                    i < quickActions.length - 1
                      ? '1px solid var(--color-border)'
                      : 'none',
                  background: 'none',
                  border: 'none',
                  borderBottomWidth:
                    i < quickActions.length - 1 ? '1px' : undefined,
                  borderBottomStyle:
                    i < quickActions.length - 1 ? 'solid' : undefined,
                  borderBottomColor:
                    i < quickActions.length - 1
                      ? 'var(--color-border)'
                      : undefined,
                  cursor: 'pointer',
                  transition: 'color 150ms ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--color-accent)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--color-text-secondary)';
                }}
              >
                <span>{action.label}</span>
                <action.icon size={14} />
              </button>
            ))}
          </div>

          {/* Content Breakdown Card */}
          <div
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              padding: '16px',
            }}
          >
            <p style={{ ...labelBase, marginBottom: '12px' }}>Content</p>
            <div className="space-y-2.5">
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
                    className="shrink-0"
                    style={{
                      fontFamily: 'var(--font-mono)',
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
