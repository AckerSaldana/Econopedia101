import {
  ResponsiveContainer,
  AreaChart,
  BarChart,
  LineChart,
  Area,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

interface ChartDisplayProps {
  data: Record<string, unknown>[];
  xKey: string;
  yKey: string;
  yKey2?: string;
  type: 'area' | 'bar' | 'line';
  height?: number;
  yLabel?: string;
  y2Label?: string;
  formatY?: (value: number) => string;
}

const ACCENT = '#19155C';
const ACCENT_LIGHT = '#E8E7F0';

function CustomTooltip({
  active,
  payload,
  label,
  formatY,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
  formatY?: (value: number) => string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div
      className="text-xs p-2 border"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
        color: 'var(--color-text-primary)',
      }}
    >
      <p className="font-medium mb-1">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} style={{ color: entry.color }}>
          {entry.name}: {formatY ? formatY(entry.value) : entry.value.toLocaleString('en-GB')}
        </p>
      ))}
    </div>
  );
}

export default function ChartDisplay({
  data,
  xKey,
  yKey,
  yKey2,
  type,
  height = 280,
  yLabel,
  y2Label,
  formatY,
}: ChartDisplayProps) {
  if (!data.length) return null;

  const commonProps = {
    data,
    margin: { top: 5, right: 5, left: 10, bottom: 5 },
  };

  const gridElement = (
    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-subtle)" />
  );
  const xAxisElement = (
    <XAxis
      dataKey={xKey}
      tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
      axisLine={{ stroke: 'var(--color-border)' }}
      tickLine={false}
    />
  );
  const yAxisElement = (
    <YAxis
      tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
      axisLine={{ stroke: 'var(--color-border)' }}
      tickLine={false}
      tickFormatter={formatY}
    />
  );
  const tooltipElement = (
    <Tooltip content={<CustomTooltip formatY={formatY} />} />
  );

  return (
    <div className="border p-4" style={{ borderColor: 'var(--color-border)' }}>
      <ResponsiveContainer width="100%" height={height}>
        {type === 'area' ? (
          <AreaChart {...commonProps}>
            {gridElement}
            {xAxisElement}
            {yAxisElement}
            {tooltipElement}
            {yKey2 && (
              <Area
                type="monotone"
                dataKey={yKey2}
                name={y2Label || yKey2}
                stroke="#94A3B8"
                fill="#E2E8F0"
                fillOpacity={0.4}
                strokeWidth={1.5}
              />
            )}
            <Area
              type="monotone"
              dataKey={yKey}
              name={yLabel || yKey}
              stroke={ACCENT}
              fill={ACCENT_LIGHT}
              fillOpacity={0.6}
              strokeWidth={2}
            />
          </AreaChart>
        ) : type === 'bar' ? (
          <BarChart {...commonProps}>
            {gridElement}
            {xAxisElement}
            {yAxisElement}
            {tooltipElement}
            <Bar dataKey={yKey} name={yLabel || yKey} fill={ACCENT} />
            {yKey2 && (
              <Bar dataKey={yKey2} name={y2Label || yKey2} fill="#94A3B8" />
            )}
          </BarChart>
        ) : (
          <LineChart {...commonProps}>
            {gridElement}
            {xAxisElement}
            {yAxisElement}
            {tooltipElement}
            <Line
              type="monotone"
              dataKey={yKey}
              name={yLabel || yKey}
              stroke={ACCENT}
              strokeWidth={2}
              dot={{ fill: ACCENT, r: 3 }}
            />
            {yKey2 && (
              <Line
                type="monotone"
                dataKey={yKey2}
                name={y2Label || yKey2}
                stroke="#94A3B8"
                strokeWidth={1.5}
                dot={{ fill: '#94A3B8', r: 3 }}
              />
            )}
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
