import type { HeadingBlock as HeadingBlockType } from '../../../../types/blocks';

interface HeadingBlockProps {
  block: HeadingBlockType;
  onChange: (block: HeadingBlockType) => void;
}

const LEVELS: (2 | 3 | 4)[] = [2, 3, 4];

export default function HeadingBlock({ block, onChange }: HeadingBlockProps) {
  return (
    <div className="w-full">
      <label
        className="block text-xs font-medium uppercase tracking-wider mb-2"
        style={{ color: 'var(--color-text-muted)' }}
      >
        Heading
      </label>

      <div className="flex items-center gap-1 mb-2">
        {LEVELS.map((level) => (
          <button
            key={level}
            type="button"
            onClick={() => onChange({ ...block, level })}
            className="px-3 py-1 text-xs font-semibold uppercase tracking-wider border transition-colors"
            style={{
              backgroundColor:
                block.level === level ? 'var(--color-accent)' : 'transparent',
              color:
                block.level === level ? '#fff' : 'var(--color-text-secondary)',
              borderColor:
                block.level === level
                  ? 'var(--color-accent)'
                  : 'var(--color-border)',
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
        className="w-full px-3 py-2.5 text-sm border focus:outline-none focus:border-current transition-colors"
        style={{
          backgroundColor: 'var(--color-background)',
          color: 'var(--color-text-primary)',
          borderColor: 'var(--color-border)',
          fontFamily: 'var(--font-serif)',
          fontSize:
            block.level === 2
              ? '1.25rem'
              : block.level === 3
                ? '1.125rem'
                : '1rem',
          fontWeight: 600,
        }}
      />
    </div>
  );
}
