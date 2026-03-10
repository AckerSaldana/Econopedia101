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
      <input
        type="text"
        value={block.latex}
        onChange={(e) => onChange({ ...block, latex: e.target.value })}
        placeholder="e.g. E = mc^{2}"
        spellCheck={false}
        className="w-full outline-none"
        style={{
          padding: '10px 12px',
          fontSize: '14px',
          backgroundColor: 'var(--color-background)',
          color: 'var(--color-text-primary)',
          border: '1px solid var(--color-border)',
          fontFamily: 'var(--font-mono)',
          transition: 'border-color 150ms ease',
        }}
        onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = 'var(--color-accent)'; }}
        onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = 'var(--color-border)'; }}
      />

      {block.latex.trim() && (
        <div
          className="mt-3 px-4 py-4 text-center overflow-x-auto"
          style={{
            borderTop: '2px solid var(--color-accent)',
            border: '1px solid var(--color-border)',
            borderTopWidth: '2px',
            borderTopColor: 'var(--color-accent)',
            backgroundColor: 'var(--color-surface)',
          }}
        >
          {renderError ? (
            <p className="text-xs" style={{ color: 'var(--color-error)' }}>{renderError}</p>
          ) : (
            <div ref={previewRef} dangerouslySetInnerHTML={{ __html: renderedHtml }} />
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
