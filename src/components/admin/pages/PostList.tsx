import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, Eye } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import type { SupabasePost } from '../../../types/post';
import { CATEGORY_COLORS } from '../adminStyles';

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

  const currentCount = filter === 'all' ? counts.all : filter === 'draft' ? counts.draft : counts.published;
  const allLoaded = !hasMore && posts.length > 0;

  return (
    <div style={{ padding: '32px', maxWidth: '960px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '32px' }}>
        <div>
          <span className="admin-label" style={{ marginBottom: '8px' }}>Content Management</span>
          <h1 className="admin-page-title">Posts</h1>
        </div>
        <button
          className="admin-btn-primary"
          onClick={() => navigate('/admin/posts/new')}
        >
          <Plus size={16} />
          New Post
        </button>
      </div>

      {/* Summary Bar */}
      <div className="admin-card-accent" style={{ padding: '20px 24px', marginBottom: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '32px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '28px',
                fontWeight: 600,
                color: 'var(--color-text-primary)',
                lineHeight: 1,
              }}>
                {counts.all}
              </span>
              <span className="admin-label" style={{ marginBottom: 0 }}>Total</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '28px',
                fontWeight: 600,
                color: 'var(--color-success)',
                lineHeight: 1,
              }}>
                {counts.published}
              </span>
              <span className="admin-label" style={{ marginBottom: 0 }}>Published</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '28px',
                fontWeight: 600,
                color: 'var(--color-warning)',
                lineHeight: 1,
              }}>
                {counts.draft}
              </span>
              <span className="admin-label" style={{ marginBottom: 0 }}>Drafts</span>
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
      <div className="admin-tabs--bordered">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`admin-tab${filter === tab.key ? ' active' : ''}`}
          >
            {tab.label}
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              opacity: 0.6,
            }}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div
          style={{
            padding: '12px 16px',
            marginTop: '16px',
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
      <div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th className="admin-label" style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid var(--color-border)', marginBottom: 0 }}>Title</th>
              <th className="admin-label" style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid var(--color-border)', marginBottom: 0, whiteSpace: 'nowrap' }}>Status</th>
              <th className="admin-label" style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid var(--color-border)', marginBottom: 0, whiteSpace: 'nowrap' }}>Categories</th>
              <th className="admin-label" style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid var(--color-border)', marginBottom: 0, whiteSpace: 'nowrap' }}>Date</th>
              <th style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-border)', width: '80px' }} />
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.id} className="admin-row-bordered">
                {/* Title */}
                <td style={{ padding: '14px 16px' }}>
                  <button
                    className="admin-row-title"
                    onClick={() => navigate(`/admin/posts/${post.id}`)}
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
                  <span className={post.draft ? 'admin-status-draft' : 'admin-status-live'}>
                    {post.draft ? 'Draft' : 'Live'}
                  </span>
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
                    <span style={{
                      fontSize: '12px',
                      color: 'var(--color-text-muted)',
                      fontStyle: 'italic',
                    }}>
                      Uncategorised
                    </span>
                  )}
                </td>

                {/* Date */}
                <td style={{
                  padding: '14px 16px',
                  fontSize: '12px',
                  color: 'var(--color-text-muted)',
                  fontFamily: 'var(--font-mono)',
                  whiteSpace: 'nowrap',
                }}>
                  {post.published_at
                    ? formatDateShort(new Date(post.published_at))
                    : formatDateShort(new Date(post.created_at))}
                </td>

                {/* Actions */}
                <td style={{ padding: '14px 16px' }}>
                  <div
                    className="admin-row-actions"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}
                  >
                    {!post.draft && (
                      <a
                        href={`/${post.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="admin-icon-btn"
                        title="View"
                      >
                        <Eye size={14} strokeWidth={1.5} />
                      </a>
                    )}
                    <button
                      className="admin-icon-btn"
                      onClick={() => navigate(`/admin/posts/${post.id}`)}
                      title="Edit"
                    >
                      <Pencil size={14} strokeWidth={1.5} />
                    </button>
                    <button
                      className="admin-icon-btn admin-icon-btn--error"
                      onClick={() => handleDelete(post)}
                      title="Delete"
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
                  style={{ padding: '64px 16px', textAlign: 'center' }}
                >
                  <div style={{
                    width: '40px',
                    height: '1px',
                    backgroundColor: 'var(--color-border)',
                    margin: '0 auto 20px',
                  }} />
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
                    marginBottom: filter === 'all' ? '20px' : '0',
                  }}>
                    {filter === 'all'
                      ? 'Create your first post to get started.'
                      : filter === 'draft'
                        ? 'All your posts are published.'
                        : 'Publish a draft to see it here.'}
                  </p>
                  {filter === 'all' && (
                    <button
                      className="admin-btn-secondary"
                      onClick={() => navigate('/admin/posts/new')}
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
                  style={{ borderBottom: '1px solid var(--color-border)' }}
                >
                  <td style={{ padding: '14px 16px' }}>
                    <div className="admin-skeleton" style={{ height: '14px', width: `${w}%`, opacity: 0.5 }} />
                    <div className="admin-skeleton" style={{ height: '10px', width: `${w * 0.6}%`, opacity: 0.3, marginTop: '6px' }} />
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div className="admin-skeleton" style={{ width: '6px', height: '6px', borderRadius: '50%', opacity: 0.5 }} />
                      <div className="admin-skeleton" style={{ height: '10px', width: '36px', opacity: 0.5 }} />
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div className="admin-skeleton" style={{ height: '10px', width: '60px', opacity: 0.5 }} />
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div className="admin-skeleton" style={{ height: '10px', width: '72px', opacity: 0.5 }} />
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
          style={{
            borderTop: '1px solid var(--color-border)',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
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
                  className="admin-btn-secondary"
                  onClick={loadMore}
                  disabled={loading}
                  style={{ fontSize: '12px', padding: '8px 16px' }}
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
          className="admin-modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) cancelDelete();
          }}
        >
          <div className="admin-modal">
            <h2 className="admin-label" style={{ marginBottom: '12px', color: 'var(--color-text-primary)' }}>
              Confirm Deletion
            </h2>
            <p style={{
              fontSize: '13px',
              color: 'var(--color-text-secondary)',
              marginBottom: '8px',
            }}>
              Are you sure you want to delete this post? This action cannot be
              undone.
            </p>
            <p style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '14px',
              fontWeight: 500,
              color: 'var(--color-text-primary)',
              borderLeft: '2px solid var(--color-accent)',
              paddingLeft: '12px',
              paddingBlock: '4px',
              marginBottom: '20px',
            }}>
              {deletingPost.title}
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button className="admin-btn-secondary" onClick={cancelDelete}>
                Cancel
              </button>
              <button className="admin-btn-danger" onClick={confirmDelete}>
                Delete Post
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
