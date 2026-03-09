import { Minus } from 'lucide-react';
import type { DividerBlock as DividerBlockType } from '../../../../types/blocks';

interface DividerBlockProps {
  block: DividerBlockType;
  onChange: (block: DividerBlockType) => void;
}

export default function DividerBlock({ block, onChange }: DividerBlockProps) {
  return (
    <div className="w-full">
      <div className="flex items-center gap-3 py-2">
        <Minus size={14} style={{ color: 'var(--color-text-muted)' }} />
        <span
          className="text-xs font-medium uppercase tracking-wider"
          style={{ color: 'var(--color-text-muted)' }}
        >
          Divider
        </span>
        <hr
          className="flex-1 border-t"
          style={{ borderColor: 'var(--color-border)' }}
        />
      </div>
    </div>
  );
}
