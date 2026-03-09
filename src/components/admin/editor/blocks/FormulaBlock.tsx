import { useState, useEffect, useRef } from 'react';
import type { FormulaBlock as FormulaBlockType } from '../../../../types/blocks';

interface FormulaBlockProps {
  block: FormulaBlockType;
  onChange: (block: FormulaBlockType) => void;
}

export default function FormulaBlock({ block, onChange }: FormulaBlockProps) {
  const [renderedHtml, setRenderedHtml] = useState<string>('');
  const [renderError, setRenderError] = useState<string | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!block.latex.trim()) {
      setRenderedHtml('');
      setRenderError(null);
      return;
    }

    try {
      const katex = (window as unknown as { katex?: { renderToString: (latex: string, options?: Record<string, unknown>) => string } }).katex;
      if (!katex) {
        setRenderError('KaTeX not loaded. Include KaTeX script on the page.');
        setRenderedHtml('');
        return;
      }

      const html = katex.renderToString(block.latex, {
        throwOnError: false,
        displayMode: true,
      });
      setRenderedHtml(html);
      setRenderError(null);
    } catch (err) {
      setRenderError(err instanceof Error ? err.message : 'Render error');
      setRenderedHtml('');
    }
  }, [block.latex]);

  return (
    <div className="w-full">
      <label
        className="block text-xs font-medium uppercase tracking-wider mb-2"
        style={{ color: 'var(--color-text-muted)' }}
      >
        Formula (LaTeX)
      </label>

      <input
        type="text"
        value={block.latex}
        onChange={(e) => onChange({ ...block, latex: e.target.value })}
        placeholder="e.g. E = mc^{2}"
        spellCheck={false}
        className="w-full px-3 py-2.5 text-sm border focus:outline-none focus:border-current transition-colors"
        style={{
          backgroundColor: 'var(--color-background)',
          color: 'var(--color-text-primary)',
          borderColor: 'var(--color-border)',
          fontFamily: 'var(--font-mono)',
        }}
      />

      {/* Live preview */}
      {block.latex.trim() && (
        <div
          className="mt-3 px-4 py-4 border text-center overflow-x-auto"
          style={{
            borderColor: 'var(--color-border)',
            backgroundColor: 'var(--color-surface)',
          }}
        >
          {renderError ? (
            <p className="text-xs" style={{ color: 'var(--color-error)' }}>
              {renderError}
            </p>
          ) : (
            <div
              ref={previewRef}
              dangerouslySetInnerHTML={{ __html: renderedHtml }}
            />
          )}
        </div>
      )}

      {!block.latex.trim() && (
        <p className="mt-2 text-xs" style={{ color: 'var(--color-text-muted)' }}>
          Enter a LaTeX expression to see a live preview.
        </p>
      )}
    </div>
  );
}
