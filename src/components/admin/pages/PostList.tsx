import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, Eye } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import type { SupabasePost } from '../../../types/post';

type FilterTab = 'all' | 'draft' | 'published';

const PAGE_SIZE = 20;

function formatDateShort(date: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
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

  // Reset and fetch when filter changes
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

  return (
    <div className="p-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1
            className="text-2xl font-semibold"
            style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-heading, serif)' }}
          >
            Posts
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
            Manage articles and blog posts
          </p>
        </div>
        <button
          onClick={() => navigate('/admin/posts/new')}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium transition-opacity hover:opacity-80"
          style={{
            backgroundColor: 'var(--color-accent)',
            color: '#fff',
            border: 'none',
          }}
        >
          <Plus size={16} />
          New Post
        </button>
      </div>

      {/* Filter Tabs */}
      <div
        className="flex gap-0 border-b mb-0"
        style={{ borderColor: 'var(--color-border)' }}
      >
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className="px-4 py-2.5 text-sm font-medium transition-colors relative"
            style={{
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
              marginBottom: '-1px',
            }}
          >
            {tab.label}
            <span
              className="ml-1.5 text-xs"
              style={{
                color:
                  filter === tab.key
                    ? 'var(--color-accent)'
                    : 'var(--color-text-muted)',
                opacity: 0.7,
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
          className="px-4 py-3 text-sm mt-4 border"
          style={{
            color: '#b91c1c',
            backgroundColor: '#fef2f2',
            borderColor: '#fecaca',
          }}
        >
          {error}
        </div>
      )}

      {/* Table */}
      <div className="mt-0">
        <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr
              style={{
                borderBottom: '1px solid var(--color-border)',
              }}
            >
              <th
                className="text-left py-3 px-3 font-medium text-xs uppercase tracking-wider"
                style={{ color: 'var(--color-text-muted)' }}
              >
                Title
              </th>
              <th
                className="text-left py-3 px-3 font-medium text-xs uppercase tracking-wider"
                style={{ color: 'var(--color-text-muted)', width: '100px' }}
              >
                Status
              </th>
              <th
                className="text-left py-3 px-3 font-medium text-xs uppercase tracking-wider"
                style={{ color: 'var(--color-text-muted)' }}
              >
                Categories
              </th>
              <th
                className="text-left py-3 px-3 font-medium text-xs uppercase tracking-wider"
                style={{ color: 'var(--color-text-muted)', width: '130px' }}
              >
                Date
              </th>
              <th
                className="text-right py-3 px-3 font-medium text-xs uppercase tracking-wider"
                style={{ color: 'var(--color-text-muted)', width: '120px' }}
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr
                key={post.id}
                className="group"
                style={{ borderBottom: '1px solid var(--color-border)' }}
              >
                {/* Title */}
                <td className="py-3 px-3">
                  <button
                    onClick={() => navigate(`/admin/posts/${post.id}`)}
                    className="text-left font-medium hover:underline"
                    style={{
                      color: 'var(--color-text-primary)',
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      cursor: 'pointer',
                    }}
                  >
                    {post.title}
                  </button>
                  {post.description && (
                    <p
                      className="text-xs mt-0.5 line-clamp-1"
                      style={{ color: 'var(--color-text-muted)' }}
                    >
                      {post.description}
                    </p>
                  )}
                </td>

                {/* Status */}
                <td className="py-3 px-3">
                  <span
                    className="text-xs font-semibold uppercase tracking-wider"
                    style={{
                      color: post.draft ? '#b45309' : '#15803d',
                    }}
                  >
                    {post.draft ? 'Draft' : 'Published'}
                  </span>
                </td>

                {/* Categories */}
                <td className="py-3 px-3">
                  <div className="flex flex-wrap gap-1.5">
                    {post.categories.length > 0 ? (
                      post.categories.map((cat) => (
                        <span
                          key={cat}
                          className="text-xs uppercase tracking-wider font-medium"
                          style={{ color: 'var(--color-accent)' }}
                        >
                          {cat}
                        </span>
                      ))
                    ) : (
                      <span
                        className="text-xs"
                        style={{ color: 'var(--color-text-muted)' }}
                      >
                        --
                      </span>
                    )}
                  </div>
                </td>

                {/* Date */}
                <td
                  className="py-3 px-3 text-xs"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  {post.published_at
                    ? formatDateShort(new Date(post.published_at))
                    : formatDateShort(new Date(post.created_at))}
                </td>

                {/* Actions */}
                <td className="py-3 px-3">
                  <div className="flex items-center justify-end gap-1">
                    {!post.draft && (
                      <a
                        href={`/${post.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 transition-opacity hover:opacity-70"
                        style={{ color: 'var(--color-text-muted)' }}
                        title="View"
                      >
                        <Eye size={15} />
                      </a>
                    )}
                    <button
                      onClick={() => navigate(`/admin/posts/${post.id}`)}
                      className="p-1.5 transition-opacity hover:opacity-70"
                      style={{
                        color: 'var(--color-text-muted)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                      title="Edit"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(post)}
                      className="p-1.5 transition-opacity hover:opacity-70"
                      style={{
                        color: '#b91c1c',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                      title="Delete"
                    >
                      <Trash2 size={15} />
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
                  className="py-12 text-center text-sm"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  {filter === 'all'
                    ? 'No posts yet. Create your first post to get started.'
                    : filter === 'draft'
                      ? 'No drafts found.'
                      : 'No published posts found.'}
                </td>
              </tr>
            )}

            {/* Loading rows */}
            {loading &&
              posts.length === 0 &&
              Array.from({ length: 5 }).map((_, i) => (
                <tr
                  key={`skeleton-${i}`}
                  style={{ borderBottom: '1px solid var(--color-border)' }}
                >
                  <td className="py-3 px-3">
                    <div
                      className="h-4 w-3/4"
                      style={{
                        backgroundColor: 'var(--color-border)',
                        opacity: 0.5,
                      }}
                    />
                    <div
                      className="h-3 w-1/2 mt-1.5"
                      style={{
                        backgroundColor: 'var(--color-border)',
                        opacity: 0.3,
                      }}
                    />
                  </td>
                  <td className="py-3 px-3">
                    <div
                      className="h-3 w-12"
                      style={{
                        backgroundColor: 'var(--color-border)',
                        opacity: 0.5,
                      }}
                    />
                  </td>
                  <td className="py-3 px-3">
                    <div
                      className="h-3 w-16"
                      style={{
                        backgroundColor: 'var(--color-border)',
                        opacity: 0.5,
                      }}
                    />
                  </td>
                  <td className="py-3 px-3">
                    <div
                      className="h-3 w-20"
                      style={{
                        backgroundColor: 'var(--color-border)',
                        opacity: 0.5,
                      }}
                    />
                  </td>
                  <td className="py-3 px-3">
                    <div
                      className="h-3 w-16 ml-auto"
                      style={{
                        backgroundColor: 'var(--color-border)',
                        opacity: 0.5,
                      }}
                    />
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Load More */}
      {hasMore && posts.length > 0 && (
        <div className="flex justify-center mt-6">
          <button
            onClick={loadMore}
            disabled={loading}
            className="px-5 py-2 text-sm font-medium border transition-opacity hover:opacity-80 disabled:opacity-50"
            style={{
              borderColor: 'var(--color-border)',
              color: 'var(--color-text-secondary)',
              backgroundColor: 'var(--color-surface)',
            }}
          >
            {loading ? 'Loading...' : 'Load more'}
          </button>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deletingPost && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
        >
          <div
            className="w-full max-w-md p-6 border"
            style={{
              backgroundColor: 'var(--color-background)',
              borderColor: 'var(--color-border)',
            }}
          >
            <h2
              className="text-lg font-semibold mb-2"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Delete Post
            </h2>
            <p
              className="text-sm mb-1"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Are you sure you want to delete this post? This action cannot be
              undone.
            </p>
            <p
              className="text-sm font-medium mb-5 border-l-2 pl-3 py-1"
              style={{
                color: 'var(--color-text-primary)',
                borderColor: 'var(--color-accent)',
              }}
            >
              {deletingPost.title}
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 text-sm font-medium border transition-opacity hover:opacity-80"
                style={{
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text-secondary)',
                  backgroundColor: 'var(--color-surface)',
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-medium transition-opacity hover:opacity-80"
                style={{
                  backgroundColor: '#b91c1c',
                  color: '#fff',
                  border: 'none',
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
