import { Plus, X } from 'lucide-react';
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

  const cellStyle: React.CSSProperties = {
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
        Table
      </label>

      <div className="overflow-x-auto">
        <table
          className="w-full border-collapse border"
          style={{ borderColor: 'var(--color-border)' }}
        >
          {/* Header row */}
          <thead>
            <tr>
              {block.headers.map((header, colIndex) => (
                <th
                  key={colIndex}
                  className="relative border p-0"
                  style={{ borderColor: 'var(--color-border)' }}
                >
                  <div className="flex items-center">
                    <input
                      type="text"
                      value={header}
                      onChange={(e) => updateHeader(colIndex, e.target.value)}
                      placeholder={`Header ${colIndex + 1}`}
                      className="w-full px-2.5 py-2 text-xs font-semibold uppercase tracking-wider border-0 focus:outline-none"
                      style={{
                        backgroundColor: 'var(--color-surface-elevated, var(--color-background))',
                        color: 'var(--color-text-secondary)',
                        minWidth: '100px',
                      }}
                    />
                    {block.headers.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeColumn(colIndex)}
                        className="flex-shrink-0 p-1 mr-1 transition-opacity hover:opacity-70"
                        style={{ color: 'var(--color-text-muted)' }}
                        title="Remove column"
                      >
                        <X size={10} />
                      </button>
                    )}
                  </div>
                </th>
              ))}
              <th className="w-8 border p-0" style={{ borderColor: 'var(--color-border)' }} />
            </tr>
          </thead>

          {/* Data rows */}
          <tbody>
            {block.rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, colIndex) => (
                  <td
                    key={colIndex}
                    className="border p-0"
                    style={{ borderColor: 'var(--color-border)' }}
                  >
                    <input
                      type="text"
                      value={cell}
                      onChange={(e) =>
                        updateCell(rowIndex, colIndex, e.target.value)
                      }
                      placeholder="..."
                      className="w-full px-2.5 py-2 text-sm border-0 focus:outline-none"
                      style={cellStyle}
                    />
                  </td>
                ))}
                <td
                  className="w-8 border p-0 text-center"
                  style={{ borderColor: 'var(--color-border)' }}
                >
                  <button
                    type="button"
                    onClick={() => removeRow(rowIndex)}
                    className="p-1 transition-opacity hover:opacity-70"
                    style={{ color: 'var(--color-text-muted)' }}
                    title="Remove row"
                  >
                    <X size={12} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add row / column buttons */}
      <div className="flex items-center gap-3 mt-2">
        <button
          type="button"
          onClick={addRow}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium border transition-colors hover:opacity-80"
          style={{
            color: 'var(--color-accent)',
            borderColor: 'var(--color-border)',
            backgroundColor: 'transparent',
          }}
        >
          <Plus size={12} />
          Add row
        </button>
        <button
          type="button"
          onClick={addColumn}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium border transition-colors hover:opacity-80"
          style={{
            color: 'var(--color-accent)',
            borderColor: 'var(--color-border)',
            backgroundColor: 'transparent',
          }}
        >
          <Plus size={12} />
          Add column
        </button>
      </div>
    </div>
  );
}
