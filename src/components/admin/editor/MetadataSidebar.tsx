import { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, ChevronRight, Upload, X } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { CATEGORY_COLORS } from '../adminStyles';
import {
  validateFile,
  convertToWebP,
  formatFileSize,
  type UploadStage,
  type ImageMetrics,
} from '../../../lib/admin/imageUpload';

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
  const [coverStage, setCoverStage] = useState<UploadStage>('idle');
  const [coverMetrics, setCoverMetrics] = useState<ImageMetrics | null>(null);
  const [coverError, setCoverError] = useState<string | null>(null);
  const [coverDragging, setCoverDragging] = useState(false);
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
  const processCoverFile = useCallback(
    async (file: File) => {
      setCoverError(null);
      setCoverMetrics(null);

      // Validate
      setCoverStage('validating');
      const validation = await validateFile(file, 'cover');
      if (!validation.valid) {
        setCoverError(validation.error!);
        setCoverStage('error');
        return;
      }

      // Convert
      setCoverStage('converting');
      let processed;
      try {
        processed = await convertToWebP(file, validation.image);
      } catch {
        setCoverError('Image conversion failed.');
        setCoverStage('error');
        return;
      }

      // Upload
      setCoverStage('uploading');
      const ext = processed.metrics.format === 'webp' ? 'webp' : 'jpeg';
      const contentType = ext === 'webp' ? 'image/webp' : 'image/jpeg';
      const path = `covers/${crypto.randomUUID()}.${ext}`;

      try {
        const { error: uploadError } = await supabase.storage
          .from('article-images')
          .upload(path, processed.blob, { contentType, cacheControl: '3600' });

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from('article-images').getPublicUrl(path);

        // Clean up object URL
        URL.revokeObjectURL(processed.imageElement.src);

        setCoverMetrics(processed.metrics);
        setCoverStage('done');
        setCoverUrl(publicUrl);
      } catch (err) {
        setCoverError(err instanceof Error ? err.message : 'Upload failed');
        setCoverStage('error');
      }
    },
    [setCoverUrl],
  );

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processCoverFile(file);
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

  const isProcessing = coverStage === 'validating' || coverStage === 'converting' || coverStage === 'uploading';

  return (
    <aside style={{
      width: '320px',
      flexShrink: 0,
      borderLeft: '1px solid var(--color-border)',
      background: 'var(--color-background)',
      overflowY: 'auto',
      height: '100%',
    }}>
      <div style={{ padding: '24px 20px' }}>
        <h2 style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '16px',
          fontWeight: 600,
          color: 'var(--color-text-primary)',
          margin: '0 0 16px',
          paddingBottom: '12px',
          borderBottom: '2px solid var(--color-accent)',
        }}>Post Metadata</h2>

        {/* Title */}
        <div className="admin-sidebar-section">
          <label className="admin-label">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Post title..."
            className="admin-input"
          />
        </div>

        {/* Slug */}
        <div className="admin-sidebar-section">
          <label className="admin-label">Slug</label>
          <input
            type="text"
            value={slug}
            onChange={(e) => {
              setSlugManual(true);
              setSlug(slugify(e.target.value));
            }}
            onBlur={() => validateSlug(slug)}
            placeholder="post-slug"
            className={`admin-input admin-input--mono${slugError ? ' admin-input--error' : ''}`}
          />
          {slugError && (
            <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--color-error)' }}>
              {slugError}
            </p>
          )}
        </div>

        {/* Description */}
        <div className="admin-sidebar-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <label className="admin-label">Description</label>
            <span style={{
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              color: description.length > 160 ? 'var(--color-error)' : 'var(--color-text-muted)',
              padding: description.length > 160 ? '1px 6px' : undefined,
              backgroundColor: description.length > 160 ? 'rgba(220, 38, 38, 0.08)' : undefined,
            }}>
              {description.length}/160
            </span>
          </div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="A brief description for SEO..."
            rows={3}
            className="admin-input"
            style={{ resize: 'vertical' }}
          />
        </div>

        {/* Categories */}
        <div className="admin-sidebar-section" style={{ paddingBottom: '8px' }}>
          <label className="admin-label" style={{ marginBottom: '10px' }}>Categories</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {CATEGORIES.map((cat) => {
              const selected = categories.includes(cat.value);
              const catColor = CATEGORY_COLORS[cat.value] || 'var(--color-accent)';
              return (
                <button
                  key={cat.value}
                  type="button"
                  className={`admin-category-btn${selected ? ' selected' : ''}`}
                  onClick={() => toggleCategory(cat.value)}
                  style={{
                    borderLeftColor: selected ? catColor : 'transparent',
                  }}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tags */}
        <div className="admin-sidebar-section">
          <label className="admin-label">Tags</label>
          {tags.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
              {tags.map((tag) => (
                <span key={tag} className="admin-tag">
                  {tag}
                  <button
                    type="button"
                    className="admin-tag-remove"
                    onClick={() => removeTag(tag)}
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
            className="admin-input"
            style={{ fontSize: '13px' }}
          />
        </div>

        {/* Cover Image */}
        <div className="admin-sidebar-section">
          <label className="admin-label">Cover Image</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {coverUrl ? (
              <div>
                <div className="admin-card-accent" style={{ overflow: 'hidden' }}>
                  <img
                    src={coverUrl}
                    alt={coverAlt || 'Cover preview'}
                    style={{ width: '100%', height: '140px', objectFit: 'cover' }}
                  />
                </div>
                {coverMetrics && (
                  <div style={{
                    marginTop: '4px',
                    fontSize: '11px',
                    color: 'var(--color-text-muted)',
                    display: 'flex',
                    gap: '6px',
                    flexWrap: 'wrap',
                  }}>
                    <span>{coverMetrics.width} x {coverMetrics.height}</span>
                    <span style={{
                      color: coverMetrics.savings > 0 ? 'var(--color-success)' : 'var(--color-text-muted)',
                    }}>
                      {coverMetrics.format.toUpperCase()} {formatFileSize(coverMetrics.convertedSize)}
                      {coverMetrics.savings > 0 && ` (saved ${coverMetrics.savings}%)`}
                    </span>
                  </div>
                )}
                <div style={{ display: 'flex', gap: '12px', marginTop: '6px' }}>
                  <button
                    type="button"
                    className="admin-link-btn"
                    onClick={() => fileInputRef.current?.click()}
                    style={{ color: 'var(--color-accent)' }}
                  >
                    Replace
                  </button>
                  <button
                    type="button"
                    className="admin-link-btn"
                    onClick={() => {
                      setCoverUrl('');
                      setCoverMetrics(null);
                    }}
                    style={{ color: 'var(--color-error)' }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                className={`admin-upload-zone${coverDragging ? ' dragging' : ''}${isProcessing ? ' processing' : ''}`}
                onClick={() => {
                  if (!isProcessing) fileInputRef.current?.click();
                }}
                onDragOver={(e) => { e.preventDefault(); setCoverDragging(true); }}
                onDragLeave={(e) => { e.preventDefault(); setCoverDragging(false); }}
                onDrop={(e) => {
                  e.preventDefault();
                  setCoverDragging(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) processCoverFile(file);
                }}
              >
                {coverStage === 'validating' ? (
                  <span>Checking image...</span>
                ) : coverStage === 'converting' ? (
                  <span>Converting to WebP...</span>
                ) : coverStage === 'uploading' ? (
                  <span>Uploading...</span>
                ) : (
                  <>
                    <Upload size={16} />
                    <span>Click or drag to upload</span>
                    <span style={{ fontSize: '10px', opacity: 0.7 }}>
                      Min 1200 x 600px &mdash; JPEG, PNG, WebP
                    </span>
                  </>
                )}
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleCoverUpload}
              style={{ display: 'none' }}
            />
            {coverError && (
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--color-error)' }}>
                {coverError}
              </p>
            )}
          </div>
        </div>

        {/* Cover Alt */}
        <div className="admin-sidebar-section">
          <label className="admin-label">Cover Alt Text</label>
          <input
            type="text"
            value={coverAlt}
            onChange={(e) => setCoverAlt(e.target.value)}
            placeholder="Describe the cover image..."
            className="admin-input"
          />
        </div>

        {/* Published At */}
        <div className="admin-sidebar-section">
          <label className="admin-label">Published At</label>
          <input
            type="datetime-local"
            value={publishedAt}
            onChange={(e) => setPublishedAt(e.target.value)}
            className="admin-input admin-input--mono"
          />
        </div>

        {/* Flags */}
        <div className="admin-sidebar-section">
          <label className="admin-label">Flags</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { label: 'Featured', checked: featured, onChange: setFeatured },
              { label: 'Draft', checked: draft, onChange: setDraft },
              { label: 'Affiliate Disclosure', checked: affiliateDisclosure, onChange: setAffiliateDisclosure },
            ].map((flag) => (
              <label key={flag.label} className="admin-checkbox-label">
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
        <div className="admin-sidebar-section">
          <label className="admin-label">Author Name</label>
          <input
            type="text"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder="Author name..."
            className="admin-input"
            style={{ marginBottom: '12px' }}
          />
          <label className="admin-label">Author Slug</label>
          <input
            type="text"
            value={authorSlug}
            onChange={(e) => setAuthorSlug(e.target.value)}
            placeholder="author-slug"
            className="admin-input admin-input--mono"
          />
        </div>

        {/* Lead Magnet */}
        <div style={{ padding: '20px 0' }}>
          <button
            type="button"
            className="admin-label"
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
              marginBottom: 0,
            }}
          >
            {leadMagnetOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            Lead Magnet
          </button>

          {leadMagnetOpen && leadMagnet && (
            <div style={{
              marginTop: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}>
              <div>
                <label className="admin-label">Lead Magnet Title</label>
                <input
                  type="text"
                  value={leadMagnet.title}
                  onChange={(e) => setLeadMagnet({ ...leadMagnet, title: e.target.value })}
                  placeholder="Free download title..."
                  className="admin-input"
                />
              </div>
              <div>
                <label className="admin-label">Lead Magnet Description</label>
                <textarea
                  value={leadMagnet.description}
                  onChange={(e) => setLeadMagnet({ ...leadMagnet, description: e.target.value })}
                  placeholder="Short description..."
                  rows={2}
                  className="admin-input"
                  style={{ resize: 'vertical' }}
                />
              </div>
              <div>
                <label className="admin-label">Lead Magnet File URL</label>
                <input
                  type="text"
                  value={leadMagnet.file}
                  onChange={(e) => setLeadMagnet({ ...leadMagnet, file: e.target.value })}
                  placeholder="https://..."
                  className="admin-input admin-input--mono"
                />
              </div>
              <button
                type="button"
                className="admin-btn-secondary"
                onClick={() => {
                  setLeadMagnet(null);
                  setLeadMagnetOpen(false);
                }}
                style={{
                  alignSelf: 'flex-start',
                  padding: '6px 12px',
                  fontSize: '12px',
                  color: 'var(--color-error)',
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
