import { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, ChevronRight, Upload, X } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

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

/* ---------- Style helpers ---------- */

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '11px',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  color: 'var(--color-text-muted)',
  fontFamily: 'var(--font-sans)',
  fontWeight: 600,
  marginBottom: '6px',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 10px',
  border: '1px solid var(--color-border)',
  background: 'var(--color-surface)',
  color: 'var(--color-text-primary)',
  fontFamily: 'var(--font-sans)',
  fontSize: '14px',
  lineHeight: '1.5',
  outline: 'none',
};

const checkboxLabelStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontFamily: 'var(--font-sans)',
  fontSize: '13px',
  color: 'var(--color-text-primary)',
  cursor: 'pointer',
};

const sectionStyle: React.CSSProperties = {
  padding: '16px 0',
  borderBottom: '1px solid var(--color-border)',
};

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

  /* Tags as comma-separated string */
  const tagsString = tags.join(', ');
  const handleTagsChange = (value: string) => {
    const parsed = value
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    setTags(parsed);
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
        fontFamily: 'var(--font-sans)',
      }}
    >
      <div style={{ padding: '20px 16px' }}>
        <h2
          style={{
            fontSize: '12px',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--color-text-muted)',
            fontWeight: 700,
            fontFamily: 'var(--font-sans)',
            margin: '0 0 16px',
            paddingBottom: '12px',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          Post Metadata
        </h2>

        {/* Title */}
        <div style={sectionStyle}>
          <label style={labelStyle}>Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Post title..."
            style={inputStyle}
          />
        </div>

        {/* Slug */}
        <div style={sectionStyle}>
          <label style={labelStyle}>Slug</label>
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
              ...inputStyle,
              fontFamily: 'var(--font-mono)',
              fontSize: '13px',
              borderColor: slugError ? 'var(--color-error)' : 'var(--color-border)',
            }}
          />
          {slugError && (
            <p
              style={{
                margin: '4px 0 0',
                fontSize: '12px',
                color: 'var(--color-error)',
              }}
            >
              {slugError}
            </p>
          )}
        </div>

        {/* Description */}
        <div style={sectionStyle}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
            }}
          >
            <label style={labelStyle}>Description</label>
            <span
              style={{
                fontSize: '11px',
                color:
                  description.length > 160
                    ? 'var(--color-error)'
                    : 'var(--color-text-muted)',
                fontFamily: 'var(--font-mono)',
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
            style={{
              ...inputStyle,
              resize: 'vertical',
            }}
          />
        </div>

        {/* Categories */}
        <div style={sectionStyle}>
          <label style={labelStyle}>Categories</label>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            {CATEGORIES.map((cat) => (
              <label key={cat.value} style={checkboxLabelStyle}>
                <input
                  type="checkbox"
                  checked={categories.includes(cat.value)}
                  onChange={() => toggleCategory(cat.value)}
                  style={{ accentColor: 'var(--color-accent)' }}
                />
                {cat.label}
              </label>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div style={sectionStyle}>
          <label style={labelStyle}>Tags</label>
          <input
            type="text"
            value={tagsString}
            onChange={(e) => handleTagsChange(e.target.value)}
            placeholder="tag1, tag2, tag3"
            style={inputStyle}
          />
          <p
            style={{
              margin: '4px 0 0',
              fontSize: '11px',
              color: 'var(--color-text-muted)',
            }}
          >
            Comma-separated
          </p>
        </div>

        {/* Cover Image */}
        <div style={sectionStyle}>
          <label style={labelStyle}>Cover Image</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {coverUrl && (
              <div style={{ position: 'relative' }}>
                <img
                  src={coverUrl}
                  alt={coverAlt || 'Cover preview'}
                  style={{
                    width: '100%',
                    height: '140px',
                    objectFit: 'cover',
                    border: '1px solid var(--color-border)',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setCoverUrl('')}
                  title="Remove cover"
                  style={{
                    position: 'absolute',
                    top: '4px',
                    right: '4px',
                    width: '24px',
                    height: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-error)',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  <X size={14} />
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
                fontFamily: 'var(--font-sans)',
                fontSize: '13px',
                opacity: uploadingCover ? 0.6 : 1,
              }}
            >
              <Upload size={14} />
              {uploadingCover ? 'Uploading...' : 'Upload Image'}
            </button>
          </div>
        </div>

        {/* Cover Alt */}
        <div style={sectionStyle}>
          <label style={labelStyle}>Cover Alt Text</label>
          <input
            type="text"
            value={coverAlt}
            onChange={(e) => setCoverAlt(e.target.value)}
            placeholder="Describe the cover image..."
            style={inputStyle}
          />
        </div>

        {/* Published At */}
        <div style={sectionStyle}>
          <label style={labelStyle}>Published At</label>
          <input
            type="datetime-local"
            value={publishedAt}
            onChange={(e) => setPublishedAt(e.target.value)}
            style={{
              ...inputStyle,
              fontFamily: 'var(--font-mono)',
              fontSize: '13px',
            }}
          />
        </div>

        {/* Flags */}
        <div style={sectionStyle}>
          <label style={labelStyle}>Flags</label>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <label style={checkboxLabelStyle}>
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                style={{ accentColor: 'var(--color-accent)' }}
              />
              Featured
            </label>
            <label style={checkboxLabelStyle}>
              <input
                type="checkbox"
                checked={draft}
                onChange={(e) => setDraft(e.target.checked)}
                style={{ accentColor: 'var(--color-accent)' }}
              />
              Draft
            </label>
            <label style={checkboxLabelStyle}>
              <input
                type="checkbox"
                checked={affiliateDisclosure}
                onChange={(e) => setAffiliateDisclosure(e.target.checked)}
                style={{ accentColor: 'var(--color-accent)' }}
              />
              Affiliate Disclosure
            </label>
          </div>
        </div>

        {/* Author */}
        <div style={sectionStyle}>
          <label style={labelStyle}>Author Name</label>
          <input
            type="text"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder="Author name..."
            style={{ ...inputStyle, marginBottom: '12px' }}
          />
          <label style={labelStyle}>Author Slug</label>
          <input
            type="text"
            value={authorSlug}
            onChange={(e) => setAuthorSlug(e.target.value)}
            placeholder="author-slug"
            style={{
              ...inputStyle,
              fontFamily: 'var(--font-mono)',
              fontSize: '13px',
            }}
          />
        </div>

        {/* Lead Magnet */}
        <div style={{ padding: '16px 0' }}>
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
              color: 'var(--color-text-secondary)',
              fontFamily: 'var(--font-sans)',
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              fontWeight: 600,
            }}
          >
            {leadMagnetOpen ? (
              <ChevronDown size={14} />
            ) : (
              <ChevronRight size={14} />
            )}
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
                <label style={labelStyle}>Lead Magnet Title</label>
                <input
                  type="text"
                  value={leadMagnet.title}
                  onChange={(e) =>
                    setLeadMagnet({ ...leadMagnet, title: e.target.value })
                  }
                  placeholder="Free download title..."
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Lead Magnet Description</label>
                <textarea
                  value={leadMagnet.description}
                  onChange={(e) =>
                    setLeadMagnet({
                      ...leadMagnet,
                      description: e.target.value,
                    })
                  }
                  placeholder="Short description..."
                  rows={2}
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
              </div>
              <div>
                <label style={labelStyle}>Lead Magnet File URL</label>
                <input
                  type="text"
                  value={leadMagnet.file}
                  onChange={(e) =>
                    setLeadMagnet({ ...leadMagnet, file: e.target.value })
                  }
                  placeholder="https://..."
                  style={{
                    ...inputStyle,
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
                  fontFamily: 'var(--font-sans)',
                  fontSize: '12px',
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
