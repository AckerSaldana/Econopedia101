import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../../../lib/supabase';
import type { Block } from '../../../types/blocks';
import type { SupabasePost } from '../../../types/post';
import BlockEditor from '../editor/BlockEditor';
import MetadataSidebar from '../editor/MetadataSidebar';
import { ArrowLeft, Save, Eye, Loader2 } from 'lucide-react';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function countWords(blocks: Block[]): number {
  let count = 0;
  for (const block of blocks) {
    switch (block.type) {
      case 'paragraph':
      case 'blockquote':
      case 'callout':
        count += block.content.split(/\s+/).filter(Boolean).length;
        break;
      case 'heading':
        count += block.text.split(/\s+/).filter(Boolean).length;
        break;
      case 'bullet-list':
      case 'ordered-list':
        for (const item of block.items) {
          count += item.split(/\s+/).filter(Boolean).length;
        }
        break;
      case 'code':
        count += block.code.split(/\s+/).filter(Boolean).length;
        break;
      case 'table':
        for (const row of block.rows) {
          for (const cell of row) {
            count += cell.split(/\s+/).filter(Boolean).length;
          }
        }
        break;
    }
  }
  return count;
}

interface PostEditorProps {
  postId?: string;
  navigate: (to: string) => void;
}

export default function PostEditor({ postId, navigate }: PostEditorProps) {
  const [loading, setLoading] = useState(!!postId);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [currentId, setCurrentId] = useState<string | null>(postId || null);

  // Metadata
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [coverUrl, setCoverUrl] = useState('');
  const [coverAlt, setCoverAlt] = useState('');
  const [publishedAt, setPublishedAt] = useState('');
  const [featured, setFeatured] = useState(false);
  const [draft, setDraft] = useState(true);
  const [affiliateDisclosure, setAffiliateDisclosure] = useState(false);
  const [authorName, setAuthorName] = useState('Tasmin Angelina Houssein');
  const [authorSlug, setAuthorSlug] = useState('tasmin-angelina-houssein');
  const [leadMagnet, setLeadMagnet] = useState<{ title: string; description: string; file: string } | null>(null);

  // Blocks
  const [blocks, setBlocks] = useState<Block[]>([
    { id: crypto.randomUUID(), type: 'paragraph', content: '' },
  ]);

  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const slugManuallyEdited = useRef(false);

  // Load existing post
  useEffect(() => {
    if (!postId) return;
    supabase
      .from('posts')
      .select('*')
      .eq('id', postId)
      .single()
      .then(({ data, error }) => {
        if (error || !data) {
          navigate('/admin/posts');
          return;
        }
        const post = data as unknown as SupabasePost;
        setTitle(post.title);
        setSlug(post.slug);
        setDescription(post.description || '');
        setCategories(post.categories);
        setTags(post.tags);
        setCoverUrl(post.cover_url || '');
        setCoverAlt(post.cover_alt || '');
        setPublishedAt(post.published_at ? post.published_at.slice(0, 16) : '');
        setFeatured(post.featured);
        setDraft(post.draft);
        setAffiliateDisclosure(post.affiliate_disclosure);
        setAuthorName(post.author_name);
        setAuthorSlug(post.author_slug);
        setLeadMagnet(post.lead_magnet);
        setBlocks(post.blocks.length > 0 ? post.blocks : [{ id: crypto.randomUUID(), type: 'paragraph', content: '' }]);
        slugManuallyEdited.current = true;
        setLoading(false);
      });
  }, [postId]);

  // Auto-generate slug from title
  useEffect(() => {
    if (!slugManuallyEdited.current && title) {
      setSlug(slugify(title));
    }
  }, [title]);

  // Auto-save (debounced 3s)
  const triggerAutoSave = useCallback(() => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      if (currentId && title && slug) {
        doSave(true);
      }
    }, 3000);
  }, [currentId, title, slug, blocks, description, categories, tags, coverUrl, coverAlt, featured, draft, affiliateDisclosure, authorName, authorSlug, leadMagnet, publishedAt]);

  useEffect(() => {
    if (currentId) triggerAutoSave();
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  }, [blocks, title, description, categories, tags, coverUrl, coverAlt, featured, affiliateDisclosure, authorName, authorSlug, leadMagnet]);

  const buildPostData = () => ({
    slug,
    title,
    description: description || null,
    categories,
    tags,
    cover_url: coverUrl || null,
    cover_alt: coverAlt || null,
    featured,
    draft,
    affiliate_disclosure: affiliateDisclosure,
    author_name: authorName,
    author_slug: authorSlug,
    lead_magnet: leadMagnet,
    blocks: blocks as any,
    word_count: countWords(blocks),
    updated_at: new Date().toISOString(),
    published_at: publishedAt ? new Date(publishedAt).toISOString() : null,
  });

  const doSave = async (silent = false) => {
    if (!title || !slug) return;
    if (!silent) setSaving(true);
    setSaveStatus('saving');

    const data = buildPostData();

    if (currentId) {
      await supabase.from('posts').update(data).eq('id', currentId);
    } else {
      const { data: inserted } = await supabase.from('posts').insert(data).select('id').single();
      if (inserted) {
        setCurrentId(inserted.id);
        window.history.replaceState(null, '', `/admin/posts/${inserted.id}`);
      }
    }

    setSaveStatus('saved');
    if (!silent) setSaving(false);
    setTimeout(() => setSaveStatus('idle'), 2000);
  };

  const handleSaveDraft = async () => {
    setDraft(true);
    await doSave();
  };

  const handlePublish = async () => {
    setDraft(false);
    if (!publishedAt) {
      setPublishedAt(new Date().toISOString().slice(0, 16));
    }
    // Need to wait a tick for state to update
    setTimeout(() => doSave(), 0);
  };

  const handlePreview = () => {
    if (slug) window.open(`/blog/${slug}`, '_blank');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={24} className="animate-spin" style={{ color: 'var(--color-text-muted)' }} />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Top bar */}
      <div
        className="flex items-center justify-between px-6 py-3 border-b flex-shrink-0"
        style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/posts')}
            className="p-1 hover:opacity-70 transition-opacity"
            style={{ color: 'var(--color-text-muted)' }}
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            {postId ? 'Edit Post' : 'New Post'}
          </h1>
          {saveStatus === 'saving' && (
            <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              Saving...
            </span>
          )}
          {saveStatus === 'saved' && (
            <span className="text-xs" style={{ color: '#10B981' }}>
              Saved
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePreview}
            disabled={!slug}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border transition-opacity hover:opacity-80 disabled:opacity-40"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
          >
            <Eye size={14} />
            Preview
          </button>
          <button
            onClick={handleSaveDraft}
            disabled={saving || !title}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border transition-opacity hover:opacity-80 disabled:opacity-40"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
          >
            <Save size={14} />
            Save Draft
          </button>
          <button
            onClick={handlePublish}
            disabled={saving || !title}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: 'var(--color-accent)' }}
          >
            Publish
          </button>
        </div>
      </div>

      {/* Editor area */}
      <div className="flex flex-1 min-h-0">
        {/* Block editor */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl mx-auto">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Post title"
              className="w-full text-3xl font-semibold mb-6 border-none outline-none bg-transparent"
              style={{
                fontFamily: 'var(--font-serif)',
                color: 'var(--color-text-primary)',
              }}
            />
            <BlockEditor blocks={blocks} onChange={setBlocks} />
          </div>
        </div>

        {/* Metadata sidebar */}
        <div
          className="w-[320px] flex-shrink-0 border-l overflow-y-auto"
          style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
        >
          <MetadataSidebar
            title={title}
            setTitle={setTitle}
            slug={slug}
            setSlug={(v) => {
              slugManuallyEdited.current = true;
              setSlug(v);
            }}
            description={description}
            setDescription={setDescription}
            categories={categories}
            setCategories={setCategories}
            tags={tags}
            setTags={setTags}
            coverUrl={coverUrl}
            setCoverUrl={setCoverUrl}
            coverAlt={coverAlt}
            setCoverAlt={setCoverAlt}
            publishedAt={publishedAt}
            setPublishedAt={setPublishedAt}
            featured={featured}
            setFeatured={setFeatured}
            draft={draft}
            setDraft={setDraft}
            affiliateDisclosure={affiliateDisclosure}
            setAffiliateDisclosure={setAffiliateDisclosure}
            authorName={authorName}
            setAuthorName={setAuthorName}
            authorSlug={authorSlug}
            setAuthorSlug={setAuthorSlug}
            leadMagnet={leadMagnet}
            setLeadMagnet={setLeadMagnet}
          />
        </div>
      </div>
    </div>
  );
}
