import { useState, useRef } from 'react';
import { Upload } from 'lucide-react';
import type { ImageBlock as ImageBlockType } from '../../../../types/blocks';
import { supabase } from '../../../../lib/supabase';

interface ImageBlockProps {
  block: ImageBlockType;
  onChange: (block: ImageBlockType) => void;
}

export default function ImageBlock({ block, onChange }: ImageBlockProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setUploading(true);

    try {
      const ext = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
      const filePath = `uploads/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('article-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('article-images')
        .getPublicUrl(filePath);

      onChange({ ...block, url: data.publicUrl });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full">
      {block.url ? (
        <div className="mb-3">
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
              src={block.url}
              alt={block.alt || 'Preview'}
              className="w-full max-h-64 object-contain"
              style={{ backgroundColor: 'var(--color-surface-elevated)' }}
            />
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            style={{
              marginTop: '6px',
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 500,
              color: 'var(--color-accent)',
            }}
          >
            Replace image
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-full flex flex-col items-center justify-center gap-2 py-8"
          style={{
            border: '1px dashed var(--color-accent-muted)',
            backgroundColor: 'var(--color-background)',
            color: 'var(--color-text-muted)',
            cursor: 'pointer',
            transition: 'border-color 150ms ease',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-accent)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-accent-muted)';
          }}
        >
          {uploading ? (
            <span className="text-xs">Uploading...</span>
          ) : (
            <>
              <Upload size={20} />
              <span className="text-xs">Click to upload image</span>
            </>
          )}
        </button>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleUpload}
        className="hidden"
      />

      {error && (
        <p className="mt-1.5 text-xs" style={{ color: 'var(--color-error)' }}>{error}</p>
      )}

      <div className="mt-3">
        <label className="block text-xs mb-1" style={{ color: 'var(--color-text-secondary)' }}>
          Alt text
        </label>
        <input
          type="text"
          value={block.alt}
          onChange={(e) => onChange({ ...block, alt: e.target.value })}
          placeholder="Describe the image for accessibility..."
          className="w-full outline-none"
          style={{
            padding: '10px 12px',
            fontSize: '13px',
            backgroundColor: 'var(--color-background)',
            color: 'var(--color-text-primary)',
            border: '1px solid var(--color-border)',
            transition: 'border-color 150ms ease',
          }}
          onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = 'var(--color-accent)'; }}
          onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = 'var(--color-border)'; }}
        />
      </div>

      <div className="mt-2">
        <label className="block text-xs mb-1" style={{ color: 'var(--color-text-secondary)' }}>
          Caption (optional)
        </label>
        <input
          type="text"
          value={block.caption || ''}
          onChange={(e) => onChange({ ...block, caption: e.target.value || undefined })}
          placeholder="Image caption..."
          className="w-full outline-none"
          style={{
            padding: '10px 12px',
            fontSize: '13px',
            backgroundColor: 'var(--color-background)',
            color: 'var(--color-text-primary)',
            border: '1px solid var(--color-border)',
            transition: 'border-color 150ms ease',
          }}
          onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = 'var(--color-accent)'; }}
          onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = 'var(--color-border)'; }}
        />
      </div>
    </div>
  );
}
