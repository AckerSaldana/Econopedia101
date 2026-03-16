/* ------------------------------------------------------------------ */
/*  Shared image upload utility for the admin panel                    */
/*  Handles validation, WebP conversion, LQIP generation               */
/* ------------------------------------------------------------------ */

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
export const WEBP_QUALITY = 0.85;
export const MAX_DIMENSION = 4096;

export const ACCEPTED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/bmp',
  'image/webp',
  'image/avif',
];

const DIMENSIONS = {
  article: { minWidth: 400, minHeight: 0 },
  cover: { minWidth: 1200, minHeight: 600 },
} as const;

/* --- Types --- */

export type UploadStage =
  | 'idle'
  | 'validating'
  | 'converting'
  | 'uploading'
  | 'done'
  | 'error';

export interface ImageMetrics {
  originalSize: number;
  convertedSize: number;
  width: number;
  height: number;
  format: string;
  savings: number;
}

export interface ProcessedImage {
  blob: Blob;
  metrics: ImageMetrics;
  imageElement: HTMLImageElement;
}

/* --- Helpers --- */

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => resolve(img);
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    img.src = url;
  });
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number,
): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((b) => resolve(b), type, quality);
  });
}

/* --- Validate --- */

export async function validateFile(
  file: File,
  type: 'article' | 'cover',
): Promise<{ valid: boolean; error?: string; image?: HTMLImageElement }> {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Unsupported format. Use JPEG, PNG, GIF, WebP, or AVIF.',
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File too large (${formatFileSize(file.size)}). Maximum is ${formatFileSize(MAX_FILE_SIZE)}.`,
    };
  }

  let img: HTMLImageElement;
  try {
    img = await loadImage(file);
  } catch {
    return { valid: false, error: 'Could not read image file.' };
  }

  const { naturalWidth: w, naturalHeight: h } = img;
  const req = DIMENSIONS[type];

  if (w < req.minWidth) {
    URL.revokeObjectURL(img.src);
    return {
      valid: false,
      error: `Image too narrow (${w}px). Minimum width is ${req.minWidth}px.`,
    };
  }

  if (req.minHeight > 0 && h < req.minHeight) {
    URL.revokeObjectURL(img.src);
    return {
      valid: false,
      error: `Image too short (${h}px). Minimum height is ${req.minHeight}px.`,
    };
  }

  return { valid: true, image: img };
}

/* --- Convert to WebP --- */

export async function convertToWebP(
  file: File,
  img?: HTMLImageElement,
): Promise<ProcessedImage> {
  const image = img || (await loadImage(file));
  let { naturalWidth: w, naturalHeight: h } = image;

  // Downscale if longest side exceeds cap
  if (Math.max(w, h) > MAX_DIMENSION) {
    const scale = MAX_DIMENSION / Math.max(w, h);
    w = Math.round(w * scale);
    h = Math.round(h * scale);
  }

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(image, 0, 0, w, h);

  // Try WebP
  let blob = await canvasToBlob(canvas, 'image/webp', WEBP_QUALITY);
  let format = 'webp';

  // Fall back to JPEG if browser doesn't support WebP canvas export
  if (!blob || blob.size === 0) {
    blob = await canvasToBlob(canvas, 'image/jpeg', WEBP_QUALITY);
    format = 'jpeg';
  }

  if (!blob) throw new Error('Image conversion failed');

  const savings = Math.round((1 - blob.size / file.size) * 100);

  return {
    blob,
    metrics: {
      originalSize: file.size,
      convertedSize: blob.size,
      width: w,
      height: h,
      format,
      savings,
    },
    imageElement: image,
  };
}

/* --- Generate LQIP (Low Quality Image Placeholder) --- */

export function generateLQIP(img: HTMLImageElement): string | undefined {
  try {
    const { naturalWidth: w, naturalHeight: h } = img;
    const canvas = document.createElement('canvas');
    const scale = 20 / w;
    canvas.width = 20;
    canvas.height = Math.round(h * scale);
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/webp', 0.2);
  } catch {
    return undefined;
  }
}
