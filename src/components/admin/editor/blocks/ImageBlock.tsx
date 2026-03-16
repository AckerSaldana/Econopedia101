import { useState, useRef, useCallback } from 'react';
import { Upload } from 'lucide-react';
import type { ImageBlock as ImageBlockType } from '../../../../types/blocks';
import { supabase } from '../../../../lib/supabase';
import {
  validateFile,
  convertToWebP,
  generateLQIP,
  formatFileSize,
  type UploadStage,
  type ImageMetrics,
} from '../../../../lib/admin/imageUpload';

interface ImageBlockProps {
  block: ImageBlockType;
  onChange: (block: ImageBlockType) => void;
}

const STAGE_TEXT: Record<UploadStage, string> = {
  idle: '',
  validating: 'Checking image...',
  converting: 'Converting to WebP...',
  uploading: 'Uploading...',
  done: '',
  error: '',
};

export default function ImageBlock({ block, onChange }: ImageBlockProps) {
  const [stage, setStage] = useState<UploadStage>('idle');
  const [metrics, setMetrics] = useState<ImageMetrics | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    async (file: File) => {
      setError(null);
      setMetrics(null);

      // Validate
      setStage('validating');
      const validation = await validateFile(file, 'article');
      if (!validation.valid) {
        setError(validation.error!);
        setStage('error');
        return;
      }

      // Convert
      setStage('converting');
      let processed;
      try {
        processed = await convertToWebP(file, validation.image);
      } catch {
        setError('Image conversion failed.');
        setStage('error');
        return;
      }

      // Upload
      setStage('uploading');
      const ext = processed.metrics.format === 'webp' ? 'webp' : 'jpeg';
      const contentType = ext === 'webp' ? 'image/webp' : 'image/jpeg';
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
      const filePath = `uploads/${fileName}`;

      try {
        const { error: uploadError } = await supabase.storage
          .from('article-images')
          .upload(filePath, processed.blob, { contentType });

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from('article-images')
          .getPublicUrl(filePath);

        // LQIP
        const lqip = generateLQIP(processed.imageElement);

        // Clean up object URL
        URL.revokeObjectURL(processed.imageElement.src);

        setMetrics(processed.metrics);
        setStage('done');
        onChange({
          ...block,
          url: data.publicUrl,
          width: processed.metrics.width,
          height: processed.metrics.height,
          lqip,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Upload failed');
        setStage('error');
      }
    },
    [block, onChange],
  );

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const isProcessing =
    stage === 'validating' || stage === 'converting' || stage === 'uploading';

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

          {/* Info bar */}
          {metrics && (
            <div
              className="flex items-center gap-3 mt-1.5"
              style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}
            >
              <span>
                {metrics.width} x {metrics.height}
              </span>
              <span
                style={{
                  color:
                    metrics.savings > 0
                      ? 'var(--color-success)'
                      : 'var(--color-text-muted)',
                }}
              >
                {metrics.format.toUpperCase()} {formatFileSize(metrics.convertedSize)}
                {metrics.savings > 0 && ` (saved ${metrics.savings}%)`}
              </span>
            </div>
          )}

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
          onClick={() => !isProcessing && fileInputRef.current?.click()}
          disabled={isProcessing}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className="w-full flex flex-col items-center justify-center gap-2 py-8"
          style={{
            border: `1px dashed ${dragging ? 'var(--color-accent)' : 'var(--color-accent-muted)'}`,
            borderWidth: dragging ? '2px' : '1px',
            backgroundColor: dragging
              ? 'var(--color-accent-light)'
              : 'var(--color-background)',
            color: 'var(--color-text-muted)',
            cursor: isProcessing ? 'default' : 'pointer',
            transition: 'border-color 150ms ease, background-color 150ms ease',
          }}
          onMouseEnter={(e) => {
            if (!isProcessing && !dragging) {
              (e.currentTarget as HTMLButtonElement).style.borderColor =
                'var(--color-accent)';
            }
          }}
          onMouseLeave={(e) => {
            if (!dragging) {
              (e.currentTarget as HTMLButtonElement).style.borderColor =
                'var(--color-accent-muted)';
            }
          }}
        >
          {isProcessing ? (
            <span className="text-xs">{STAGE_TEXT[stage]}</span>
          ) : (
            <>
              <Upload size={20} />
              <span className="text-xs">Click or drag to upload</span>
              <span
                className="text-xs"
                style={{ color: 'var(--color-text-muted)', opacity: 0.7 }}
              >
                JPEG, PNG, GIF, WebP &mdash; Min 400px wide, max 5 MB
              </span>
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
        <p
          className="mt-1.5 text-xs"
          style={{ color: 'var(--color-error)' }}
        >
          {error}
        </p>
      )}

      <div className="mt-3">
        <label
          className="block text-xs mb-1"
          style={{ color: 'var(--color-text-secondary)' }}
        >
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
          onFocus={(e) => {
            (e.target as HTMLInputElement).style.borderColor =
              'var(--color-accent)';
          }}
          onBlur={(e) => {
            (e.target as HTMLInputElement).style.borderColor =
              'var(--color-border)';
          }}
        />
      </div>

      <div className="mt-2">
        <label
          className="block text-xs mb-1"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          Caption (optional)
        </label>
        <input
          type="text"
          value={block.caption || ''}
          onChange={(e) =>
            onChange({ ...block, caption: e.target.value || undefined })
          }
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
          onFocus={(e) => {
            (e.target as HTMLInputElement).style.borderColor =
              'var(--color-accent)';
          }}
          onBlur={(e) => {
            (e.target as HTMLInputElement).style.borderColor =
              'var(--color-border)';
          }}
        />
      </div>
    </div>
  );
}
