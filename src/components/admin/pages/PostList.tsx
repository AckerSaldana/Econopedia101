import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, Eye } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import type { SupabasePost } from '../../../types/post';
import { pageTitle, labelBase, btnPrimary, btnSecondary, btnDanger, CATEGORY_COLORS } from '../adminStyles';

type FilterTab = 'all' | 'draft' | 'published';

const PAGE_SIZE = 20;
const SKELETON_WIDTHS = [75, 62, 88, 70, 55];

function formatDateShort(date: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
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

interface PostListProps {
  navigate: (to: string) => void;
}

export default function PostList({ navigate }: PostListProps) {
  const [posts, setPosts] = useState<SupabasePost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterTab>('all');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [counts, setCounts] = useState({ all: 0, draft: 0, published: 0 });
  const [latestDate, setLatestDate] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const fetchCounts = useCallback(async () => {
    const { count: allCount } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true });

    const { count: draftCount } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .eq('draft', true);

    const { count: publishedCount } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .eq('draft', false);

    setCounts({
      all: allCount ?? 0,
      draft: draftCount ?? 0,
      published: publishedCount ?? 0,
    });

    // Fetch latest post date
    const { data: latest } = await supabase
      .from('posts')
      .select('created_at')
      .order('created_at', { ascending: false })
      .limit(1);

    if (latest && latest.length > 0) {
      setLatestDate(latest[0].created_at);
    }
  }, []);

  const fetchPosts = useCallback(
    async (pageNum: number, append: boolean) => {
      setLoading(true);
      setError(null);

      try {
        let query = supabase
          .from('posts')
          .select('*')
          .order('created_at', { ascending: false })
          .range(pageNum * PAGE_SIZE, (pageNum + 1) * PAGE_SIZE - 1);

        if (filter === 'draft') {
          query = query.eq('draft', true);
        } else if (filter === 'published') {
          query = query.eq('draft', false);
        }

        const { data, error: fetchError } = await query;

        if (fetchError) {
          setError(fetchError.message);
          return;
        }

        const rows = (data ?? []) as SupabasePost[];

        if (append) {
          setPosts((prev) => [...prev, ...rows]);
        } else {
          setPosts(rows);
        }

        setHasMore(rows.length === PAGE_SIZE);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load posts');
      } finally {
        setLoading(false);
      }
    },
    [filter],
  );

  useEffect(() => {
    setPage(0);
    setHasMore(true);
    fetchPosts(0, false);
    fetchCounts();
  }, [filter, fetchPosts, fetchCounts]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPosts(nextPage, true);
  };

  const handleDelete = async (post: SupabasePost) => {
    setDeleting(post.id);
  };

  const confirmDelete = async () => {
    if (!deleting) return;

    try {
      const { error: deleteError } = await supabase
        .from('posts')
        .delete()
        .eq('id', deleting);

      if (deleteError) {
        setError(deleteError.message);
      } else {
        setPosts((prev) => prev.filter((p) => p.id !== deleting));
        setCounts((prev) => ({
          all: prev.all - 1,
          draft:
            posts.find((p) => p.id === deleting)?.draft
              ? prev.draft - 1
              : prev.draft,
          published:
            posts.find((p) => p.id === deleting)?.draft
              ? prev.published
              : prev.published - 1,
        }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete post');
    } finally {
      setDeleting(null);
    }
  };

  const cancelDelete = () => {
    setDeleting(null);
  };

  const deletingPost = deleting
    ? posts.find((p) => p.id === deleting)
    : null;

  const TABS: { key: FilterTab; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: counts.all },
    { key: 'draft', label: 'Drafts', count: counts.draft },
    { key: 'published', label: 'Published', count: counts.published },
  ];

  const thStyle: React.CSSProperties = {
    fontSize: '11px',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--color-text-muted)',
    fontWeight: 600,
    padding: '12px 16px',
    textAlign: 'left' as const,
    backgroundColor: 'transparent',
    borderBottom: '1px solid var(--color-border)',
  };

  const currentCount = filter === 'all' ? counts.all : filter === 'draft' ? counts.draft : counts.published;
  const allLoaded = !hasMore && posts.length > 0;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <span style={{ ...labelBase, marginBottom: '8px' }}>Content Management</span>
          <h1 style={pageTitle}>Posts</h1>
        </div>
        <button
          onClick={() => navigate('/admin/posts/new')}
          style={btnPrimary}
        >
          <Plus size={16} />
          New Post
        </button>
      </div>

      {/* Summary Bar */}
      <div
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderTop: '2px solid var(--color-accent)',
          padding: '20px 24px',
          marginBottom: 0,
        }}
      >
        <div className="flex items-baseline justify-between flex-wrap gap-4">
          <div className="flex items-baseline gap-8 flex-wrap">
            <div className="flex items-baseline gap-2">
              <span style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '28px',
                fontWeight: 600,
                color: 'var(--color-text-primary)',
                lineHeight: 1,
              }}>
                {counts.all}
              </span>
              <span style={{ ...labelBase, marginBottom: 0 }}>Total</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '28px',
                fontWeight: 600,
                color: 'var(--color-success)',
                lineHeight: 1,
              }}>
                {counts.published}
              </span>
              <span style={{ ...labelBase, marginBottom: 0 }}>Published</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '28px',
                fontWeight: 600,
                color: 'var(--color-warning)',
                lineHeight: 1,
              }}>
                {counts.draft}
              </span>
              <span style={{ ...labelBase, marginBottom: 0 }}>Drafts</span>
            </div>
          </div>
          {latestDate && (
            <span style={{
              fontSize: '12px',
              color: 'var(--color-text-muted)',
            }}>
              Latest: {timeAgo(latestDate)}
            </span>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div
        className="flex gap-0"
        style={{
          borderBottom: '1px solid var(--color-border)',
          backgroundColor: 'var(--color-surface)',
          borderLeft: '1px solid var(--color-border)',
          borderRight: '1px solid var(--color-border)',
        }}
      >
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            style={{
              ...labelBase,
              marginBottom: 0,
              padding: '10px 16px',
              color:
                filter === tab.key
                  ? 'var(--color-accent)'
                  : 'var(--color-text-muted)',
              backgroundColor: 'transparent',
              border: 'none',
              borderBottom:
                filter === tab.key
                  ? '2px solid var(--color-accent)'
                  : '2px solid transparent',
              marginBlockEnd: '-1px',
              cursor: 'pointer',
              transition: 'color 150ms ease',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            {tab.label}
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                opacity: 0.6,
              }}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div
          className="px-4 py-3 mt-4"
          style={{
            borderLeft: '2px solid var(--color-error)',
            backgroundColor: 'rgba(220, 38, 38, 0.04)',
            color: 'var(--color-error)',
            fontSize: '13px',
          }}
        >
          {error}
        </div>
      )}

      {/* Table */}
      <div className="mt-0" style={{ overflowX: 'auto' }}>
        <table className="w-full" style={{ borderCollapse: 'collapse', minWidth: '600px' }}>
          <thead>
            <tr>
              <th style={thStyle}>Title</th>
              <th style={{ ...thStyle, width: '90px' }}>Status</th>
              <th style={thStyle}>Categories</th>
              <th style={{ ...thStyle, width: '140px' }}>Date</th>
              <th style={{ ...thStyle, width: '100px' }} />
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr
                key={post.id}
                style={{ borderBottom: '1px solid var(--color-border-subtle, var(--color-border))' }}
                onMouseEnter={(e) => {
                  const row = e.currentTarget;
                  row.style.backgroundColor = 'var(--color-surface-elevated)';
                  const actions = row.querySelector('[data-actions]') as HTMLElement | null;
                  if (actions) actions.style.opacity = '1';
                }}
                onMouseLeave={(e) => {
                  const row = e.currentTarget;
                  row.style.backgroundColor = 'transparent';
                  const actions = row.querySelector('[data-actions]') as HTMLElement | null;
                  if (actions && !isMobile) actions.style.opacity = '0';
                }}
              >
                {/* Title */}
                <td style={{ padding: '14px 16px' }}>
                  <button
                    onClick={() => navigate(`/admin/posts/${post.id}`)}
                    style={{
                      textAlign: 'left',
                      color: 'var(--color-text-primary)',
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      cursor: 'pointer',
                      fontWeight: 500,
                      fontSize: '14px',
                      transition: 'color 150ms ease',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-accent)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-text-primary)';
                    }}
                  >
                    {post.title}
                  </button>
                  {post.description && (
                    <p
                      className="line-clamp-1"
                      style={{
                        color: 'var(--color-text-muted)',
                        fontSize: '12px',
                        marginTop: '2px',
                      }}
                    >
                      {post.description}
                    </p>
                  )}
                </td>

                {/* Status */}
                <td style={{ padding: '14px 16px' }}>
                  <div className="flex items-center gap-2">
                    <span
                      style={{
                        display: 'inline-block',
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        backgroundColor: post.draft ? 'var(--color-warning)' : 'var(--color-success)',
                        flexShrink: 0,
                      }}
                    />
                    <span
                      style={{
                        fontSize: '11px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        color: 'var(--color-text-secondary)',
                        fontWeight: 600,
                      }}
                    >
                      {post.draft ? 'Draft' : 'Live'}
                    </span>
                  </div>
                </td>

                {/* Categories */}
                <td style={{ padding: '14px 16px' }}>
                  {post.categories.length > 0 ? (
                    <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
                      {post.categories.map((cat, i) => (
                        <span key={cat}>
                          <span style={{ color: CATEGORY_COLORS[cat] || 'var(--color-accent)' }}>{cat}</span>
                          {i < post.categories.length - 1 && (
                            <span style={{ color: 'var(--color-text-muted)', margin: '0 4px' }}>/</span>
                          )}
                        </span>
                      ))}
                    </span>
                  ) : (
                    <span
                      style={{
                        fontSize: '12px',
                        color: 'var(--color-text-muted)',
                        fontStyle: 'italic',
                      }}
                    >
                      Uncategorised
                    </span>
                  )}
                </td>

                {/* Date */}
                <td
                  style={{
                    padding: '14px 16px',
                    fontSize: '12px',
                    color: 'var(--color-text-muted)',
                    fontFamily: 'var(--font-mono)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {post.published_at
                    ? formatDateShort(new Date(post.published_at))
                    : formatDateShort(new Date(post.created_at))}
                </td>

                {/* Actions */}
                <td style={{ padding: '14px 16px' }}>
                  <div
                    data-actions
                    className="flex items-center justify-end gap-1"
                    style={{
                      opacity: isMobile ? 1 : 0,
                      transition: 'opacity 150ms ease',
                    }}
                  >
                    {!post.draft && (
                      <a
                        href={`/${post.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '28px',
                          height: '28px',
                          color: 'var(--color-text-muted)',
                          transition: 'color 150ms ease',
                        }}
                        title="View"
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-accent)';
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-text-muted)';
                        }}
                      >
                        <Eye size={14} strokeWidth={1.5} />
                      </a>
                    )}
                    <button
                      onClick={() => navigate(`/admin/posts/${post.id}`)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '28px',
                        height: '28px',
                        color: 'var(--color-text-muted)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'color 150ms ease',
                      }}
                      title="Edit"
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-accent)';
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-text-muted)';
                      }}
                    >
                      <Pencil size={14} strokeWidth={1.5} />
                    </button>
                    <button
                      onClick={() => handleDelete(post)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '28px',
                        height: '28px',
                        color: 'var(--color-text-muted)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'color 150ms ease',
                      }}
                      title="Delete"
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-error)';
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-text-muted)';
                      }}
                    >
                      <Trash2 size={14} strokeWidth={1.5} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {/* Empty state */}
            {!loading && posts.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  style={{ padding: '48px 16px', textAlign: 'center' }}
                >
                  <div
                    style={{
                      width: '40px',
                      height: '1px',
                      backgroundColor: 'var(--color-border)',
                      margin: '0 auto 16px',
                    }}
                  />
                  <p style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '18px',
                    fontWeight: 600,
                    color: 'var(--color-text-primary)',
                    marginBottom: '6px',
                  }}>
                    {filter === 'all'
                      ? 'No posts yet'
                      : filter === 'draft'
                        ? 'No drafts'
                        : 'No published posts'}
                  </p>
                  <p style={{
                    fontSize: '13px',
                    color: 'var(--color-text-muted)',
                    marginBottom: filter === 'all' ? '16px' : '0',
                  }}>
                    {filter === 'all'
                      ? 'Create your first post to get started.'
                      : filter === 'draft'
                        ? 'All your posts are published.'
                        : 'Publish a draft to see it here.'}
                  </p>
                  {filter === 'all' && (
                    <button
                      onClick={() => navigate('/admin/posts/new')}
                      style={btnSecondary}
                    >
                      Create Post
                    </button>
                  )}
                </td>
              </tr>
            )}

            {/* Loading skeleton */}
            {loading &&
              posts.length === 0 &&
              SKELETON_WIDTHS.map((w, i) => (
                <tr
                  key={`skeleton-${i}`}
                  style={{ borderBottom: '1px solid var(--color-border-subtle, var(--color-border))' }}
                >
                  <td style={{ padding: '14px 16px' }}>
                    <div
                      className="animate-pulse"
                      style={{
                        height: '14px',
                        width: `${w}%`,
                        backgroundColor: 'var(--color-border)',
                        opacity: 0.5,
                      }}
                    />
                    <div
                      className="animate-pulse"
                      style={{
                        height: '10px',
                        width: `${w * 0.6}%`,
                        backgroundColor: 'var(--color-border)',
                        opacity: 0.3,
                        marginTop: '6px',
                      }}
                    />
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div className="flex items-center gap-2">
                      <div
                        className="animate-pulse"
                        style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--color-border)',
                          opacity: 0.5,
                        }}
                      />
                      <div
                        className="animate-pulse"
                        style={{
                          height: '10px',
                          width: '36px',
                          backgroundColor: 'var(--color-border)',
                          opacity: 0.5,
                        }}
                      />
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div
                      className="animate-pulse"
                      style={{
                        height: '10px',
                        width: '60px',
                        backgroundColor: 'var(--color-border)',
                        opacity: 0.5,
                      }}
                    />
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div
                      className="animate-pulse"
                      style={{
                        height: '10px',
                        width: '72px',
                        backgroundColor: 'var(--color-border)',
                        opacity: 0.5,
                      }}
                    />
                  </td>
                  <td style={{ padding: '14px 16px' }} />
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {posts.length > 0 && (
        <div
          className="flex items-center"
          style={{
            borderTop: '1px solid var(--color-border)',
            padding: '12px 16px',
            justifyContent: allLoaded ? 'center' : 'space-between',
          }}
        >
          {allLoaded ? (
            <span style={{
              fontSize: '12px',
              fontFamily: 'var(--font-mono)',
              color: 'var(--color-text-muted)',
            }}>
              {posts.length} posts total
            </span>
          ) : (
            <>
              <span style={{
                fontSize: '12px',
                fontFamily: 'var(--font-mono)',
                color: 'var(--color-text-muted)',
              }}>
                Showing {posts.length} of {currentCount} posts
              </span>
              {hasMore && (
                <button
                  onClick={loadMore}
                  disabled={loading}
                  style={{
                    ...btnSecondary,
                    fontSize: '12px',
                    padding: '8px 16px',
                    opacity: loading ? 0.5 : 1,
                  }}
                >
                  {loading ? 'Loading...' : 'Load more'}
                </button>
              )}
            </>
          )}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deletingPost && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) cancelDelete();
          }}
        >
          <div
            className="w-full max-w-sm"
            style={{
              backgroundColor: 'var(--color-background)',
              border: '1px solid var(--color-border)',
              borderTopWidth: '2px',
              borderTopColor: 'var(--color-error)',
              padding: '24px',
            }}
          >
            <h2 style={{ ...labelBase, marginBottom: '12px', color: 'var(--color-text-primary)' }}>
              Confirm Deletion
            </h2>
            <p
              style={{
                fontSize: '13px',
                color: 'var(--color-text-secondary)',
                marginBottom: '8px',
              }}
            >
              Are you sure you want to delete this post? This action cannot be
              undone.
            </p>
            <p
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '14px',
                fontWeight: 500,
                color: 'var(--color-text-primary)',
                borderLeft: '2px solid var(--color-accent)',
                paddingLeft: '12px',
                paddingBlock: '4px',
                marginBottom: '20px',
              }}
            >
              {deletingPost.title}
            </p>
            <div className="flex justify-end gap-2">
              <button onClick={cancelDelete} style={btnSecondary}>
                Cancel
              </button>
              <button onClick={confirmDelete} style={btnDanger}>
                Delete Post
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
