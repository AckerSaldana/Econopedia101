import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../../../lib/supabase';
import type { Block } from '../../../types/blocks';
import type { SupabasePost } from '../../../types/post';
import BlockEditor from '../editor/BlockEditor';
import MetadataSidebar from '../editor/MetadataSidebar';
import BlockRenderer from '../../../components/blog/BlockRenderer';
import { ArrowLeft, Eye, EyeOff, Loader2, Send } from 'lucide-react';

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
  const [previewing, setPreviewing] = useState(false);
  const [notifying, setNotifying] = useState(false);
  const [notifyResult, setNotifyResult] = useState<'idle' | 'sent' | 'error'>('idle');

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
        const parsedBlocks = typeof post.blocks === 'string' ? JSON.parse(post.blocks) : post.blocks;
        setBlocks(parsedBlocks.length > 0 ? parsedBlocks : [{ id: crypto.randomUUID(), type: 'paragraph', content: '' }]);
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
    const pubDate = publishedAt || new Date().toISOString().slice(0, 16);
    const finalAuthorName = authorSlug === 'econopedia-ai' ? 'Tasmin Angelina Houssein' : authorName;
    const finalAuthorSlug = authorSlug === 'econopedia-ai' ? 'tasmin-angelina-houssein' : authorSlug;

    // Update UI state
    setDraft(false);
    setPublishedAt(pubDate);
    setAuthorName(finalAuthorName);
    setAuthorSlug(finalAuthorSlug);

    // Save directly with correct values (don't rely on state update timing)
    setSaving(true);
    setSaveStatus('saving');

    const data = {
      ...buildPostData(),
      draft: false,
      published_at: new Date(pubDate).toISOString(),
      author_name: finalAuthorName,
      author_slug: finalAuthorSlug,
    };

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
    setSaving(false);
    setTimeout(() => setSaveStatus('idle'), 2000);
  };

  const handlePreview = () => {
    setPreviewing((prev) => !prev);
  };

  const handleNotifySubscribers = async () => {
    if (notifying || !title || !slug) return;
    setNotifying(true);
    setNotifyResult('idle');
    try {
      const res = await fetch('/api/newsletter/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          slug,
          description,
          coverUrl,
        }),
      });
      if (res.ok) {
        setNotifyResult('sent');
      } else {
        setNotifyResult('error');
      }
    } catch {
      setNotifyResult('error');
    } finally {
      setNotifying(false);
      setTimeout(() => setNotifyResult('idle'), 4000);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '256px' }}>
        <Loader2 size={24} className="animate-spin" style={{ color: 'var(--color-text-muted)' }} />
      </div>
    );
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Top bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 32px',
          borderBottom: '1px solid var(--color-border)',
          backgroundColor: 'var(--color-surface)',
          flexShrink: 0,
        }}
      >
        {/* Left side: back + title + status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            className="admin-btn-ghost admin-btn-ghost--accent"
            onClick={() => navigate('/admin/posts')}
            style={{ padding: '4px' }}
          >
            <ArrowLeft size={20} />
          </button>

          <div style={{ width: '1px', height: '20px', backgroundColor: 'var(--color-border)' }} />

          <h1 style={{
            fontSize: '14px',
            fontFamily: 'var(--font-sans)',
            fontWeight: 600,
            color: 'var(--color-text-primary)',
          }}>
            {postId ? 'Edit Post' : 'New Post'}
          </h1>

          {/* Save status indicator */}
          {saveStatus === 'saving' && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--color-text-muted)' }}>
              <span style={{
                display: 'inline-block',
                width: '8px',
                height: '8px',
                backgroundColor: 'var(--color-accent)',
                borderRadius: '50%',
                animation: 'admin-save-pulse 1.2s ease-in-out infinite',
              }} />
              Saving...
            </span>
          )}
          {saveStatus === 'saved' && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--color-success)' }}>
              <span style={{
                display: 'inline-block',
                width: '8px',
                height: '8px',
                backgroundColor: 'var(--color-success)',
                borderRadius: '50%',
              }} />
              Saved
            </span>
          )}
        </div>

        {/* Right side: action buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Preview toggle */}
          <button
            className={previewing ? 'admin-btn-primary' : 'admin-btn-secondary'}
            onClick={handlePreview}
            style={{ padding: '8px 16px', fontSize: '12px' }}
          >
            {previewing ? <EyeOff size={14} /> : <Eye size={14} />}
            {previewing ? 'Edit' : 'Preview'}
          </button>

          <div style={{ width: '1px', height: '20px', backgroundColor: 'var(--color-border)' }} />

          {/* Save / Publish */}
          <button
            className="admin-btn-secondary"
            onClick={handleSaveDraft}
            disabled={saving || !title}
            style={{ padding: '8px 16px', fontSize: '12px' }}
          >
            Save Draft
          </button>
          <button
            className="admin-btn-primary"
            onClick={handlePublish}
            disabled={saving || !title}
            style={{ padding: '8px 16px', fontSize: '12px' }}
          >
            Publish
          </button>

          {/* Notify subscribers */}
          {!draft && currentId && (
            <>
              <div style={{ width: '1px', height: '20px', backgroundColor: 'var(--color-border)' }} />
              <button
                className="admin-btn-secondary"
                onClick={handleNotifySubscribers}
                disabled={notifying}
                style={{
                  padding: '8px 16px',
                  fontSize: '12px',
                  borderColor: notifyResult === 'sent' ? 'var(--color-success)' : notifyResult === 'error' ? 'var(--color-error)' : undefined,
                  color: notifyResult === 'sent' ? 'var(--color-success)' : notifyResult === 'error' ? 'var(--color-error)' : undefined,
                }}
              >
                {notifying ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                {notifying ? 'Sending...' : notifyResult === 'sent' ? 'Sent!' : notifyResult === 'error' ? 'Failed' : 'Notify Subscribers'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Editor area */}
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        {/* Block editor / Preview */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
          <div style={{ maxWidth: '768px', margin: '0 auto' }}>
            {previewing ? (
              <>
                <h1 style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '36px',
                  fontWeight: 600,
                  letterSpacing: '-0.02em',
                  color: 'var(--color-text-primary)',
                  lineHeight: 1.2,
                  marginBottom: '2rem',
                }}>
                  {title || 'Untitled'}
                </h1>
                <BlockRenderer blocks={blocks} />
              </>
            ) : (
              <>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Post title"
                  style={{
                    width: '100%',
                    marginBottom: '32px',
                    border: 'none',
                    outline: 'none',
                    backgroundColor: 'transparent',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '36px',
                    fontWeight: 600,
                    letterSpacing: '-0.02em',
                    color: 'var(--color-text-primary)',
                    lineHeight: 1.2,
                  }}
                />
                <BlockEditor blocks={blocks} onChange={setBlocks} categories={categories} />
              </>
            )}
          </div>
        </div>

        {/* Metadata sidebar */}
        <div style={{
          width: '320px',
          flexShrink: 0,
          borderLeft: '1px solid var(--color-border)',
          backgroundColor: 'var(--color-surface)',
          overflowY: 'auto',
        }}>
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
