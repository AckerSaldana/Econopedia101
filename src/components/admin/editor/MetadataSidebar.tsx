import { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, ChevronRight, Upload, X } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { inputBase, labelBase, sectionBase, CATEGORY_COLORS } from '../adminStyles';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const CATEGORIES = [
  { value: 'trading', label: 'Trading' },
  { value: 'economics', label: 'Economics' },
  { value: 'finance', label: 'Finance' },
  { value: 'business', label: 'Business' },
  { value: 'banking-insurance', label: 'Banking & Insurance' },
  { value: 'education', label: 'Education' },
] as const;

/* ---------- Props ---------- */

interface MetadataSidebarProps {
  title: string;
  setTitle: (v: string) => void;
  slug: string;
  setSlug: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  categories: string[];
  setCategories: (v: string[]) => void;
  tags: string[];
  setTags: (v: string[]) => void;
  coverUrl: string;
  setCoverUrl: (v: string) => void;
  coverAlt: string;
  setCoverAlt: (v: string) => void;
  publishedAt: string;
  setPublishedAt: (v: string) => void;
  featured: boolean;
  setFeatured: (v: boolean) => void;
  draft: boolean;
  setDraft: (v: boolean) => void;
  affiliateDisclosure: boolean;
  setAffiliateDisclosure: (v: boolean) => void;
  authorName: string;
  setAuthorName: (v: string) => void;
  authorSlug: string;
  setAuthorSlug: (v: string) => void;
  leadMagnet: { title: string; description: string; file: string } | null;
  setLeadMagnet: (
    v: { title: string; description: string; file: string } | null
  ) => void;
}

/* ---------- Component ---------- */

export default function MetadataSidebar(props: MetadataSidebarProps) {
  const {
    title,
    setTitle,
    slug,
    setSlug,
    description,
    setDescription,
    categories,
    setCategories,
    tags,
    setTags,
    coverUrl,
    setCoverUrl,
    coverAlt,
    setCoverAlt,
    publishedAt,
    setPublishedAt,
    featured,
    setFeatured,
    draft,
    setDraft,
    affiliateDisclosure,
    setAffiliateDisclosure,
    authorName,
    setAuthorName,
    authorSlug,
    setAuthorSlug,
    leadMagnet,
    setLeadMagnet,
  } = props;

  const [slugManual, setSlugManual] = useState(false);
  const [slugError, setSlugError] = useState<string | null>(null);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [leadMagnetOpen, setLeadMagnetOpen] = useState(!!leadMagnet);
  const [tagInput, setTagInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* Auto-generate slug from title unless manually edited */
  useEffect(() => {
    if (!slugManual) {
      setSlug(slugify(title));
    }
  }, [title, slugManual, setSlug]);

  /* Validate slug uniqueness on blur */
  const validateSlug = useCallback(
    async (value: string) => {
      if (!value) {
        setSlugError(null);
        return;
      }
      const { data, error } = await supabase
        .from('posts')
        .select('id')
        .eq('slug', value)
        .maybeSingle();

      if (error) {
        setSlugError('Could not validate slug');
        return;
      }
      if (data) {
        setSlugError('Slug already in use');
      } else {
        setSlugError(null);
      }
    },
    []
  );

  /* Cover image upload */
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCover(true);
    const ext = file.name.split('.').pop();
    const path = `covers/${crypto.randomUUID()}.${ext}`;

    const { error } = await supabase.storage
      .from('article-images')
      .upload(path, file, { cacheControl: '3600', upsert: false });

    if (error) {
      console.error('Cover upload failed:', error.message);
      setUploadingCover(false);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from('article-images').getPublicUrl(path);

    setCoverUrl(publicUrl);
    setUploadingCover(false);
  };

  /* Category toggle */
  const toggleCategory = (cat: string) => {
    if (categories.includes(cat)) {
      setCategories(categories.filter((c) => c !== cat));
    } else {
      setCategories([...categories, cat]);
    }
  };

  /* Tags management */
  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().replace(/,/g, '');
      if (newTag && !tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  return (
    <aside
      style={{
        width: '320px',
        flexShrink: 0,
        borderLeft: '1px solid var(--color-border)',
        background: 'var(--color-background)',
        overflowY: 'auto',
        height: '100%',
      }}
    >
      <div style={{ padding: '24px 20px' }}>
        <h2
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '16px',
            fontWeight: 600,
            color: 'var(--color-text-primary)',
            margin: '0 0 16px',
            paddingBottom: '12px',
            borderBottom: '2px solid var(--color-accent)',
          }}
        >
          Post Metadata
        </h2>

        {/* Title */}
        <div style={sectionBase}>
          <label style={labelBase}>Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Post title..."
            style={inputBase}
            onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = 'var(--color-accent)'; }}
            onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = 'var(--color-border)'; }}
          />
        </div>

        {/* Slug */}
        <div style={sectionBase}>
          <label style={labelBase}>Slug</label>
          <input
            type="text"
            value={slug}
            onChange={(e) => {
              setSlugManual(true);
              setSlug(slugify(e.target.value));
            }}
            onBlur={() => validateSlug(slug)}
            placeholder="post-slug"
            style={{
              ...inputBase,
              fontFamily: 'var(--font-mono)',
              fontSize: '13px',
              borderColor: slugError ? 'var(--color-error)' : 'var(--color-border)',
            }}
            onFocus={(e) => {
              if (!slugError) (e.target as HTMLInputElement).style.borderColor = 'var(--color-accent)';
            }}
          />
          {slugError && (
            <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--color-error)' }}>
              {slugError}
            </p>
          )}
        </div>

        {/* Description */}
        <div style={sectionBase}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <label style={labelBase}>Description</label>
            <span
              style={{
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                color: description.length > 160 ? 'var(--color-error)' : 'var(--color-text-muted)',
                padding: description.length > 160 ? '1px 6px' : undefined,
                backgroundColor: description.length > 160 ? 'rgba(220, 38, 38, 0.08)' : undefined,
              }}
            >
              {description.length}/160
            </span>
          </div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="A brief description for SEO..."
            rows={3}
            style={{ ...inputBase, resize: 'vertical' as const }}
            onFocus={(e) => { (e.target as HTMLTextAreaElement).style.borderColor = 'var(--color-accent)'; }}
            onBlur={(e) => { (e.target as HTMLTextAreaElement).style.borderColor = 'var(--color-border)'; }}
          />
        </div>

        {/* Categories */}
        <div style={{ ...sectionBase, marginBottom: '8px' }}>
          <label style={{ ...labelBase, marginBottom: '10px' }}>Categories</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {CATEGORIES.map((cat) => {
              const selected = categories.includes(cat.value);
              const catColor = CATEGORY_COLORS[cat.value] || 'var(--color-accent)';
              return (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => toggleCategory(cat.value)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 12px',
                    border: 'none',
                    borderLeft: `3px solid ${selected ? catColor : 'transparent'}`,
                    backgroundColor: selected ? 'var(--color-surface-elevated)' : 'transparent',
                    color: selected ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: selected ? 500 : 400,
                    textAlign: 'left' as const,
                    transition: 'all 150ms ease',
                  }}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tags */}
        <div style={sectionBase}>
          <label style={labelBase}>Tags</label>
          {tags.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
              {tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '3px 8px',
                    border: '1px solid var(--color-border)',
                    fontSize: '11px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    color: 'var(--color-text-secondary)',
                    fontWeight: 500,
                  }}
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      cursor: 'pointer',
                      color: 'var(--color-text-muted)',
                      display: 'flex',
                    }}
                  >
                    <X size={10} />
                  </button>
                </span>
              ))}
            </div>
          )}
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
            placeholder="Type and press Enter..."
            style={{ ...inputBase, fontSize: '13px' }}
            onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = 'var(--color-accent)'; }}
            onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = 'var(--color-border)'; }}
          />
        </div>

        {/* Cover Image */}
        <div style={sectionBase}>
          <label style={labelBase}>Cover Image</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {coverUrl && (
              <div>
                <div
                  style={{
                    borderTop: '2px solid var(--color-accent)',
                    border: '1px solid var(--color-border)',
                    borderTopWidth: '2px',
                    borderTopColor: 'var(--color-accent)',
                    overflow: 'hidden',
                  }}
                >
                  <img
                    src={coverUrl}
                    alt={coverAlt || 'Cover preview'}
                    style={{ width: '100%', height: '140px', objectFit: 'cover' }}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setCoverUrl('')}
                  style={{
                    marginTop: '6px',
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    fontSize: '12px',
                    color: 'var(--color-error)',
                    transition: 'opacity 150ms ease',
                  }}
                >
                  Remove
                </button>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleCoverUpload}
              style={{ display: 'none' }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingCover}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '8px 12px',
                border: '1px solid var(--color-border)',
                background: 'var(--color-surface)',
                color: 'var(--color-text-secondary)',
                cursor: uploadingCover ? 'not-allowed' : 'pointer',
                fontSize: '13px',
                opacity: uploadingCover ? 0.6 : 1,
                transition: 'border-color 150ms ease',
              }}
            >
              <Upload size={14} />
              {uploadingCover ? 'Uploading...' : 'Upload Image'}
            </button>
          </div>
        </div>

        {/* Cover Alt */}
        <div style={sectionBase}>
          <label style={labelBase}>Cover Alt Text</label>
          <input
            type="text"
            value={coverAlt}
            onChange={(e) => setCoverAlt(e.target.value)}
            placeholder="Describe the cover image..."
            style={inputBase}
            onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = 'var(--color-accent)'; }}
            onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = 'var(--color-border)'; }}
          />
        </div>

        {/* Published At */}
        <div style={sectionBase}>
          <label style={labelBase}>Published At</label>
          <input
            type="datetime-local"
            value={publishedAt}
            onChange={(e) => setPublishedAt(e.target.value)}
            style={{
              ...inputBase,
              fontFamily: 'var(--font-mono)',
              fontSize: '13px',
            }}
            onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = 'var(--color-accent)'; }}
            onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = 'var(--color-border)'; }}
          />
        </div>

        {/* Flags */}
        <div style={sectionBase}>
          <label style={labelBase}>Flags</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { label: 'Featured', checked: featured, onChange: setFeatured },
              { label: 'Draft', checked: draft, onChange: setDraft },
              { label: 'Affiliate Disclosure', checked: affiliateDisclosure, onChange: setAffiliateDisclosure },
            ].map((flag) => (
              <label
                key={flag.label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '13px',
                  color: 'var(--color-text-primary)',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={flag.checked}
                  onChange={(e) => flag.onChange(e.target.checked)}
                  style={{ accentColor: 'var(--color-accent)' }}
                />
                {flag.label}
              </label>
            ))}
          </div>
        </div>

        {/* Author */}
        <div style={sectionBase}>
          <label style={labelBase}>Author Name</label>
          <input
            type="text"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder="Author name..."
            style={{ ...inputBase, marginBottom: '12px' }}
            onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = 'var(--color-accent)'; }}
            onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = 'var(--color-border)'; }}
          />
          <label style={labelBase}>Author Slug</label>
          <input
            type="text"
            value={authorSlug}
            onChange={(e) => setAuthorSlug(e.target.value)}
            placeholder="author-slug"
            style={{
              ...inputBase,
              fontFamily: 'var(--font-mono)',
              fontSize: '13px',
            }}
            onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = 'var(--color-accent)'; }}
            onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = 'var(--color-border)'; }}
          />
        </div>

        {/* Lead Magnet */}
        <div style={{ padding: '20px 0' }}>
          <button
            type="button"
            onClick={() => {
              const next = !leadMagnetOpen;
              setLeadMagnetOpen(next);
              if (next && !leadMagnet) {
                setLeadMagnet({ title: '', description: '', file: '' });
              }
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              ...labelBase,
              marginBottom: 0,
            }}
          >
            {leadMagnetOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            Lead Magnet
          </button>

          {leadMagnetOpen && leadMagnet && (
            <div
              style={{
                marginTop: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              <div>
                <label style={labelBase}>Lead Magnet Title</label>
                <input
                  type="text"
                  value={leadMagnet.title}
                  onChange={(e) => setLeadMagnet({ ...leadMagnet, title: e.target.value })}
                  placeholder="Free download title..."
                  style={inputBase}
                />
              </div>
              <div>
                <label style={labelBase}>Lead Magnet Description</label>
                <textarea
                  value={leadMagnet.description}
                  onChange={(e) => setLeadMagnet({ ...leadMagnet, description: e.target.value })}
                  placeholder="Short description..."
                  rows={2}
                  style={{ ...inputBase, resize: 'vertical' as const }}
                />
              </div>
              <div>
                <label style={labelBase}>Lead Magnet File URL</label>
                <input
                  type="text"
                  value={leadMagnet.file}
                  onChange={(e) => setLeadMagnet({ ...leadMagnet, file: e.target.value })}
                  placeholder="https://..."
                  style={{
                    ...inputBase,
                    fontFamily: 'var(--font-mono)',
                    fontSize: '13px',
                  }}
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  setLeadMagnet(null);
                  setLeadMagnetOpen(false);
                }}
                style={{
                  alignSelf: 'flex-start',
                  padding: '6px 12px',
                  border: '1px solid var(--color-border)',
                  background: 'var(--color-surface)',
                  color: 'var(--color-error)',
                  cursor: 'pointer',
                  fontSize: '12px',
                  transition: 'border-color 150ms ease',
                }}
              >
                Remove Lead Magnet
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
