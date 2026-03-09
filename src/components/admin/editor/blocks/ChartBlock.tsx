import { useRef, useEffect, useState } from 'react';
import { BarChart3 } from 'lucide-react';
import type { ChartBlock as ChartBlockType } from '../../../../types/blocks';

interface ChartBlockProps {
  block: ChartBlockType;
  onChange: (block: ChartBlockType) => void;
}

const CHART_TYPES: ChartBlockType['chartConfig']['type'][] = ['area', 'bar', 'line'];

export default function ChartBlock({ block, onChange }: ChartBlockProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [jsonError, setJsonError] = useState<string | null>(null);

  const config = block.chartConfig;

  // Serialize data to JSON string for the textarea
  const [dataStr, setDataStr] = useState(() => {
    try {
      return JSON.stringify(config.data, null, 2);
    } catch {
      return '[]';
    }
  });

  const adjustHeight = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  };

  useEffect(() => {
    adjustHeight();
  }, [dataStr]);

  const handleDataChange = (value: string) => {
    setDataStr(value);
    setJsonError(null);

    try {
      const parsed = JSON.parse(value);
      if (!Array.isArray(parsed)) {
        setJsonError('Data must be an array of objects');
        return;
      }
      onChange({
        ...block,
        chartConfig: { ...config, data: parsed },
      });
    } catch {
      setJsonError('Invalid JSON');
    }
  };

  const updateConfig = (
    updates: Partial<ChartBlockType['chartConfig']>,
  ) => {
    onChange({
      ...block,
      chartConfig: { ...config, ...updates },
    });
  };

  const inputStyle: React.CSSProperties = {
    backgroundColor: 'var(--color-background)',
    color: 'var(--color-text-primary)',
    borderColor: 'var(--color-border)',
  };

  return (
    <div className="w-full">
      <label
        className="block text-xs font-medium uppercase tracking-wider mb-2"
        style={{ color: 'var(--color-text-muted)' }}
      >
        Chart
      </label>

      {/* Chart type selector */}
      <div className="flex items-center gap-1 mb-3">
        <BarChart3
          size={14}
          className="mr-1"
          style={{ color: 'var(--color-text-muted)' }}
        />
        {CHART_TYPES.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => updateConfig({ type })}
            className="px-3 py-1 text-xs font-medium uppercase tracking-wider border transition-colors"
            style={{
              backgroundColor:
                config.type === type ? 'var(--color-accent)' : 'transparent',
              color:
                config.type === type ? '#fff' : 'var(--color-text-secondary)',
              borderColor:
                config.type === type
                  ? 'var(--color-accent)'
                  : 'var(--color-border)',
            }}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Key inputs */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div>
          <label
            className="block text-xs mb-1"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            X Key
          </label>
          <input
            type="text"
            value={config.xKey}
            onChange={(e) => updateConfig({ xKey: e.target.value })}
            placeholder="e.g. year"
            className="w-full px-3 py-2 text-sm border focus:outline-none focus:border-current transition-colors"
            style={inputStyle}
          />
        </div>
        <div>
          <label
            className="block text-xs mb-1"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Y Key
          </label>
          <input
            type="text"
            value={config.yKey}
            onChange={(e) => updateConfig({ yKey: e.target.value })}
            placeholder="e.g. value"
            className="w-full px-3 py-2 text-sm border focus:outline-none focus:border-current transition-colors"
            style={inputStyle}
          />
        </div>
        <div>
          <label
            className="block text-xs mb-1"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Y Key 2 (optional)
          </label>
          <input
            type="text"
            value={config.yKey2 || ''}
            onChange={(e) =>
              updateConfig({ yKey2: e.target.value || undefined })
            }
            placeholder="e.g. value2"
            className="w-full px-3 py-2 text-sm border focus:outline-none focus:border-current transition-colors"
            style={inputStyle}
          />
        </div>
        <div>
          <label
            className="block text-xs mb-1"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Height (optional)
          </label>
          <input
            type="number"
            value={config.height ?? ''}
            onChange={(e) =>
              updateConfig({
                height: e.target.value ? Number(e.target.value) : undefined,
              })
            }
            placeholder="e.g. 300"
            className="w-full px-3 py-2 text-sm border focus:outline-none focus:border-current transition-colors"
            style={inputStyle}
          />
        </div>
        <div>
          <label
            className="block text-xs mb-1"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Y Label (optional)
          </label>
          <input
            type="text"
            value={config.yLabel || ''}
            onChange={(e) =>
              updateConfig({ yLabel: e.target.value || undefined })
            }
            placeholder="e.g. GDP ($B)"
            className="w-full px-3 py-2 text-sm border focus:outline-none focus:border-current transition-colors"
            style={inputStyle}
          />
        </div>
        <div>
          <label
            className="block text-xs mb-1"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Y2 Label (optional)
          </label>
          <input
            type="text"
            value={config.y2Label || ''}
            onChange={(e) =>
              updateConfig({ y2Label: e.target.value || undefined })
            }
            placeholder="e.g. Inflation (%)"
            className="w-full px-3 py-2 text-sm border focus:outline-none focus:border-current transition-colors"
            style={inputStyle}
          />
        </div>
      </div>

      {/* JSON data textarea */}
      <div>
        <label
          className="block text-xs mb-1"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          Data (JSON array)
        </label>
        <textarea
          ref={textareaRef}
          value={dataStr}
          onChange={(e) => handleDataChange(e.target.value)}
          onInput={adjustHeight}
          spellCheck={false}
          rows={6}
          placeholder='[{ "year": 2020, "value": 100 }]'
          className="w-full px-4 py-3 text-sm leading-relaxed resize-none border focus:outline-none focus:border-current transition-colors"
          style={{
            backgroundColor: 'var(--color-surface-elevated, var(--color-background))',
            color: 'var(--color-text-primary)',
            borderColor: jsonError ? 'var(--color-error)' : 'var(--color-border)',
            fontFamily: 'var(--font-mono)',
            tabSize: 2,
          }}
        />
        {jsonError && (
          <p className="mt-1 text-xs" style={{ color: 'var(--color-error)' }}>
            {jsonError}
          </p>
        )}
      </div>
    </div>
  );
}
