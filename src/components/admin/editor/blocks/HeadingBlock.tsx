import type { HeadingBlock as HeadingBlockType } from '../../../../types/blocks';

interface HeadingBlockProps {
  block: HeadingBlockType;
  onChange: (block: HeadingBlockType) => void;
}

const LEVELS: (2 | 3 | 4)[] = [2, 3, 4];

export default function HeadingBlock({ block, onChange }: HeadingBlockProps) {
  return (
    <div className="w-full">
      <div className="flex items-center gap-1 mb-2">
        {LEVELS.map((level) => (
          <button
            key={level}
            type="button"
            onClick={() => onChange({ ...block, level })}
            style={{
              padding: '4px 10px',
              fontSize: '11px',
              fontWeight: 600,
              textTransform: 'uppercase' as const,
              letterSpacing: '0.04em',
              border: '1px solid',
              borderColor: block.level === level ? 'var(--color-accent)' : 'var(--color-border)',
              backgroundColor: block.level === level ? 'var(--color-accent)' : 'transparent',
              color: block.level === level ? '#fff' : 'var(--color-text-secondary)',
              cursor: 'pointer',
              transition: 'all 150ms ease',
            }}
          >
            H{level}
          </button>
        ))}
      </div>

      <input
        type="text"
        value={block.text}
        onChange={(e) => onChange({ ...block, text: e.target.value })}
        placeholder={`Heading ${block.level} text...`}
        className="w-full outline-none"
        style={{
          padding: '10px 12px',
          backgroundColor: 'var(--color-background)',
          color: 'var(--color-text-primary)',
          border: '1px solid var(--color-border)',
          fontFamily: 'var(--font-serif)',
          fontSize: block.level === 2 ? '1.25rem' : block.level === 3 ? '1.125rem' : '1rem',
          fontWeight: 600,
          transition: 'border-color 150ms ease',
        }}
        onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = 'var(--color-accent)'; }}
        onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = 'var(--color-border)'; }}
      />
    </div>
  );
}
