import type { DividerBlock as DividerBlockType } from '../../../../types/blocks';

interface DividerBlockProps {
  block: DividerBlockType;
  onChange: (block: DividerBlockType) => void;
}

export default function DividerBlock({ block, onChange }: DividerBlockProps) {
  return (
    <div className="w-full flex justify-center py-4">
      <hr
        style={{
          width: '60%',
          border: 'none',
          borderTop: '1px solid var(--color-border)',
        }}
      />
    </div>
  );
}
