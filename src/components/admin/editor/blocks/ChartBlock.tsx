import { useState, useMemo } from 'react';
import type { ChartBlock as ChartBlockType } from '../../../../types/blocks';
import ChartDisplay from '../../../calculators/ChartDisplay';

interface ChartBlockProps {
  block: ChartBlockType;
  onChange: (block: ChartBlockType) => void;
}

const CHART_TYPES: { value: ChartBlockType['chartConfig']['type']; label: string }[] = [
  { value: 'line', label: 'Line' },
  { value: 'area', label: 'Area' },
  { value: 'bar', label: 'Bar' },
];

export default function ChartBlock({ block, onChange }: ChartBlockProps) {
  const config = block.chartConfig;
  const [showJson, setShowJson] = useState(false);
  const [jsonStr, setJsonStr] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);

  const updateConfig = (updates: Partial<ChartBlockType['chartConfig']>) => {
    onChange({ ...block, chartConfig: { ...config, ...updates } });
  };

  const columns = useMemo(() => {
    if (!config.data.length) return [];
    return Object.keys(config.data[0]);
  }, [config.data]);

  // Cell update — auto-detect numbers
  const updateCell = (rowIdx: number, col: string, value: string) => {
    const newData = config.data.map((row, i) => {
      if (i !== rowIdx) return row;
      const num = Number(value);
      return { ...row, [col]: value === '' ? '' : isNaN(num) ? value : num };
    });
    updateConfig({ data: newData });
  };

  const addRow = () => {
    const emptyRow: Record<string, unknown> = {};
    for (const col of columns) emptyRow[col] = '';
    updateConfig({ data: [...config.data, emptyRow] });
  };

  const removeRow = (idx: number) => {
    updateConfig({ data: config.data.filter((_, i) => i !== idx) });
  };

  // JSON import
  const openJson = () => {
    setJsonStr(JSON.stringify(config.data, null, 2));
    setJsonError(null);
    setShowJson(true);
  };

  const applyJson = () => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (!Array.isArray(parsed)) { setJsonError('Must be an array'); return; }
      // Auto-detect keys from first row
      const keys = parsed.length ? Object.keys(parsed[0]) : [];
      const updates: Partial<ChartBlockType['chartConfig']> = { data: parsed };
      if (keys.length >= 1 && !keys.includes(config.xKey)) updates.xKey = keys[0];
      if (keys.length >= 2 && !keys.includes(config.yKey)) updates.yKey = keys[1];
      updateConfig(updates);
      setShowJson(false);
    } catch { setJsonError('Invalid JSON'); }
  };

  const hasData = config.data.length > 0 && config.xKey && config.yKey;

  return (
    <div className="w-full">
      {/* Live chart preview */}
      {hasData && (
        <div style={{ marginBottom: '12px' }}>
          <ChartDisplay
            data={config.data}
            xKey={config.xKey}
            yKey={config.yKey}
            yKey2={config.yKey2}
            type={config.type}
            height={200}
            yLabel={config.yLabel}
            y2Label={config.y2Label}
          />
        </div>
      )}

      {/* Controls row */}
      <div className="flex items-center gap-3 mb-3 flex-wrap">
        {/* Chart type */}
        <div className="flex items-center gap-1">
          {CHART_TYPES.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => updateConfig({ type: value })}
              style={{
                padding: '4px 10px',
                fontSize: '11px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                border: '1px solid',
                borderColor: config.type === value ? 'var(--color-accent)' : 'var(--color-border)',
                backgroundColor: config.type === value ? 'var(--color-accent)' : 'transparent',
                color: config.type === value ? '#fff' : 'var(--color-text-secondary)',
                cursor: 'pointer',
                transition: 'all 150ms ease',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Axis selectors */}
        {columns.length > 0 && (
          <div className="flex items-center gap-3" style={{ fontSize: '12px' }}>
            <label className="flex items-center gap-1">
              <span style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-muted)' }}>X</span>
              <select
                value={config.xKey}
                onChange={(e) => updateConfig({ xKey: e.target.value })}
                style={{
                  padding: '3px 6px',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-background)',
                  color: 'var(--color-text-primary)',
                  fontSize: '12px',
                  outline: 'none',
                }}
              >
                {columns.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>
            <label className="flex items-center gap-1">
              <span style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-muted)' }}>Y</span>
              <select
                value={config.yKey}
                onChange={(e) => updateConfig({ yKey: e.target.value })}
                style={{
                  padding: '3px 6px',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-background)',
                  color: 'var(--color-text-primary)',
                  fontSize: '12px',
                  outline: 'none',
                }}
              >
                {columns.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>
            {columns.length > 2 && (
              <label className="flex items-center gap-1">
                <span style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-muted)' }}>Y2</span>
                <select
                  value={config.yKey2 || ''}
                  onChange={(e) => updateConfig({ yKey2: e.target.value || undefined })}
                  style={{
                    padding: '3px 6px',
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-background)',
                    color: 'var(--color-text-primary)',
                    fontSize: '12px',
                    outline: 'none',
                  }}
                >
                  <option value="">None</option>
                  {columns.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </label>
            )}
          </div>
        )}
      </div>

      {/* Data spreadsheet */}
      <div style={{ border: '1px solid var(--color-border)', overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th
                style={{
                  width: '28px',
                  padding: '5px',
                  backgroundColor: 'var(--color-surface)',
                  borderBottom: '1px solid var(--color-border)',
                  borderRight: '1px solid var(--color-border)',
                }}
              />
              {columns.map((col) => (
                <th
                  key={col}
                  style={{
                    padding: '5px 8px',
                    fontSize: '11px',
                    fontWeight: 600,
                    color: col === config.xKey || col === config.yKey || col === config.yKey2
                      ? 'var(--color-accent)'
                      : 'var(--color-text-muted)',
                    backgroundColor: 'var(--color-surface)',
                    borderBottom: '1px solid var(--color-border)',
                    borderRight: '1px solid var(--color-border)',
                    textAlign: 'left',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {config.data.map((row, rowIdx) => (
              <tr key={rowIdx}>
                <td
                  style={{
                    padding: '0 4px',
                    fontSize: '9px',
                    color: 'var(--color-text-muted)',
                    backgroundColor: 'var(--color-surface)',
                    borderBottom: '1px solid var(--color-border)',
                    borderRight: '1px solid var(--color-border)',
                    textAlign: 'center',
                    userSelect: 'none',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => removeRow(rowIdx)}
                    title="Remove row"
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--color-text-muted)',
                      opacity: 0.3,
                      fontSize: '11px',
                      padding: '2px',
                      lineHeight: 1,
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.color = 'var(--color-error)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.3'; e.currentTarget.style.color = 'var(--color-text-muted)'; }}
                  >
                    &times;
                  </button>
                </td>
                {columns.map((col) => (
                  <td
                    key={col}
                    style={{
                      borderBottom: '1px solid var(--color-border)',
                      borderRight: '1px solid var(--color-border)',
                      padding: 0,
                    }}
                  >
                    <input
                      type="text"
                      value={String(row[col] ?? '')}
                      onChange={(e) => updateCell(rowIdx, col, e.target.value)}
                      style={{
                        width: '100%',
                        padding: '5px 8px',
                        fontSize: '12px',
                        border: 'none',
                        outline: 'none',
                        backgroundColor: 'transparent',
                        color: 'var(--color-text-primary)',
                      }}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bottom actions */}
      <div className="flex items-center gap-4 mt-2">
        <button
          type="button"
          onClick={addRow}
          style={{
            fontSize: '11px',
            color: 'var(--color-accent)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 500,
          }}
        >
          + Add row
        </button>
        <button
          type="button"
          onClick={showJson ? () => setShowJson(false) : openJson}
          style={{
            fontSize: '11px',
            color: 'var(--color-text-muted)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            marginLeft: 'auto',
          }}
        >
          {showJson ? 'Close' : 'Paste JSON'}
        </button>
      </div>

      {/* JSON paste area */}
      {showJson && (
        <div className="mt-2">
          <textarea
            value={jsonStr}
            onChange={(e) => { setJsonStr(e.target.value); setJsonError(null); }}
            spellCheck={false}
            rows={6}
            placeholder={'[\n  { "label": "2020", "value": 120 },\n  { "label": "2021", "value": 180 }\n]'}
            style={{
              width: '100%',
              padding: '10px 12px',
              fontSize: '12px',
              lineHeight: 1.5,
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text-primary)',
              border: '1px solid',
              borderColor: jsonError ? 'var(--color-error)' : 'var(--color-border)',
              fontFamily: 'var(--font-mono)',
              tabSize: 2,
              outline: 'none',
              resize: 'vertical',
            }}
          />
          {jsonError && (
            <p style={{ fontSize: '11px', color: 'var(--color-error)', marginTop: '4px' }}>{jsonError}</p>
          )}
          <button
            type="button"
            onClick={applyJson}
            style={{
              marginTop: '6px',
              fontSize: '11px',
              fontWeight: 600,
              color: 'var(--color-accent)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Apply
          </button>
        </div>
      )}
    </div>
  );
}
