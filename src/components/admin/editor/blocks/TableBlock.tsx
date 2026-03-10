import { X } from 'lucide-react';
import type { TableBlock as TableBlockType } from '../../../../types/blocks';

interface TableBlockProps {
  block: TableBlockType;
  onChange: (block: TableBlockType) => void;
}

export default function TableBlock({ block, onChange }: TableBlockProps) {
  const updateHeader = (colIndex: number, value: string) => {
    const headers = [...block.headers];
    headers[colIndex] = value;
    onChange({ ...block, headers });
  };

  const updateCell = (rowIndex: number, colIndex: number, value: string) => {
    const rows = block.rows.map((row) => [...row]);
    rows[rowIndex][colIndex] = value;
    onChange({ ...block, rows });
  };

  const addColumn = () => {
    const headers = [...block.headers, ''];
    const rows = block.rows.map((row) => [...row, '']);
    onChange({ ...block, headers, rows });
  };

  const removeColumn = (colIndex: number) => {
    if (block.headers.length <= 1) return;
    const headers = block.headers.filter((_, i) => i !== colIndex);
    const rows = block.rows.map((row) => row.filter((_, i) => i !== colIndex));
    onChange({ ...block, headers, rows });
  };

  const addRow = () => {
    const newRow = Array(block.headers.length).fill('');
    onChange({ ...block, rows: [...block.rows, newRow] });
  };

  const removeRow = (rowIndex: number) => {
    const rows = block.rows.filter((_, i) => i !== rowIndex);
    onChange({ ...block, rows });
  };

  return (
    <div className="w-full">
      <div className="overflow-x-auto">
        <table className="w-full" style={{ borderCollapse: 'collapse', border: '1px solid var(--color-border)' }}>
          <thead>
            <tr>
              {block.headers.map((header, colIndex) => (
                <th
                  key={colIndex}
                  className="relative p-0"
                  style={{
                    backgroundColor: 'var(--color-surface-elevated)',
                    borderBottom: '1px solid var(--color-border)',
                  }}
                >
                  <div className="flex items-center">
                    <input
                      type="text"
                      value={header}
                      onChange={(e) => updateHeader(colIndex, e.target.value)}
                      placeholder={`Header ${colIndex + 1}`}
                      className="w-full outline-none"
                      style={{
                        padding: '8px 10px',
                        fontSize: '11px',
                        fontWeight: 600,
                        textTransform: 'uppercase' as const,
                        letterSpacing: '0.05em',
                        backgroundColor: 'transparent',
                        color: 'var(--color-text-secondary)',
                        border: 'none',
                        minWidth: '100px',
                      }}
                    />
                    {block.headers.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeColumn(colIndex)}
                        className="flex-shrink-0 p-1 mr-1"
                        style={{ color: 'var(--color-text-muted)', background: 'none', border: 'none', cursor: 'pointer', opacity: 0.5 }}
                      >
                        <X size={10} />
                      </button>
                    )}
                  </div>
                </th>
              ))}
              <th className="w-8 p-0" style={{ backgroundColor: 'var(--color-surface-elevated)', borderBottom: '1px solid var(--color-border)' }} />
            </tr>
          </thead>
          <tbody>
            {block.rows.map((row, rowIndex) => (
              <tr key={rowIndex} style={{ borderBottom: '1px solid var(--color-border)' }}>
                {row.map((cell, colIndex) => (
                  <td key={colIndex} className="p-0">
                    <input
                      type="text"
                      value={cell}
                      onChange={(e) => updateCell(rowIndex, colIndex, e.target.value)}
                      placeholder="..."
                      className="w-full outline-none"
                      style={{
                        padding: '10px 12px',
                        fontSize: '14px',
                        backgroundColor: 'var(--color-background)',
                        color: 'var(--color-text-primary)',
                        border: 'none',
                      }}
                    />
                  </td>
                ))}
                <td className="w-8 p-0 text-center">
                  <button
                    type="button"
                    onClick={() => removeRow(rowIndex)}
                    className="p-1"
                    style={{ color: 'var(--color-text-muted)', background: 'none', border: 'none', cursor: 'pointer', opacity: 0.5 }}
                  >
                    <X size={12} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-3 mt-2">
        <button
          type="button"
          onClick={addRow}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 500,
            color: 'var(--color-accent)',
          }}
        >
          + Add row
        </button>
        <button
          type="button"
          onClick={addColumn}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 500,
            color: 'var(--color-accent)',
          }}
        >
          + Add column
        </button>
      </div>
    </div>
  );
}
