import { useState, useEffect, useRef } from 'react';
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
  Legend,
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

function useThemeColors() {
  const [colors, setColors] = useState({
    accent: '#19155C',
    accentLight: '#E8E7F0',
    accentMuted: '#C8C5E0',
    secondary: '#94A3B8',
    secondaryLight: '#E2E8F0',
    surface: '#FFFFFF',
    surfaceElevated: '#F5F5F4',
    textPrimary: '#0A0A0A',
    textSecondary: '#525252',
    textMuted: '#A3A3A3',
    border: '#E5E5E5',
    borderSubtle: '#F5F5F4',
  });

  useEffect(() => {
    const root = document.documentElement;
    const style = getComputedStyle(root);
    const get = (v: string) => style.getPropertyValue(v).trim();
    setColors({
      accent: get('--color-accent') || '#19155C',
      accentLight: get('--color-accent-light') || '#E8E7F0',
      accentMuted: get('--color-accent-muted') || '#C8C5E0',
      secondary: get('--color-text-secondary') || '#94A3B8',
      secondaryLight: get('--color-border') || '#E2E8F0',
      surface: get('--color-surface') || '#FFFFFF',
      surfaceElevated: get('--color-surface-elevated') || '#F5F5F4',
      textPrimary: get('--color-text-primary') || '#0A0A0A',
      textSecondary: get('--color-text-secondary') || '#525252',
      textMuted: get('--color-text-muted') || '#A3A3A3',
      border: get('--color-border') || '#E5E5E5',
      borderSubtle: get('--color-border-subtle') || '#F5F5F4',
    });
  }, []);

  return colors;
}

function CustomTooltip({
  active,
  payload,
  label,
  formatY,
  colors,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
  formatY?: (value: number) => string;
  colors: ReturnType<typeof useThemeColors>;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div
      style={{
        backgroundColor: colors.surface,
        border: `1px solid ${colors.border}`,
        padding: '10px 14px',
        fontSize: '12px',
        lineHeight: 1.5,
        color: colors.textPrimary,
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      }}
    >
      <p
        style={{
          fontSize: '11px',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          color: colors.textMuted,
          marginBottom: '6px',
        }}
      >
        {label}
      </p>
      {payload.map((entry) => (
        <div
          key={entry.name}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginTop: '2px',
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              backgroundColor: entry.color,
              flexShrink: 0,
            }}
          />
          <span style={{ color: colors.textSecondary }}>{entry.name}</span>
          <span style={{ fontWeight: 600, marginLeft: 'auto' }}>
            {formatY ? formatY(entry.value) : entry.value.toLocaleString('en-GB')}
          </span>
        </div>
      ))}
    </div>
  );
}

function CustomLegend({
  payload,
  colors,
}: {
  payload?: { value: string; color: string }[];
  colors: ReturnType<typeof useThemeColors>;
}) {
  if (!payload?.length || payload.length < 2) return null;

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '20px',
        paddingTop: '12px',
      }}
    >
      {payload.map((entry) => (
        <div
          key={entry.value}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '11px',
            color: colors.textSecondary,
          }}
        >
          <span
            style={{
              width: 12,
              height: 3,
              backgroundColor: entry.color,
              flexShrink: 0,
            }}
          />
          {entry.value}
        </div>
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
  const [mounted, setMounted] = useState(false);
  const colors = useThemeColors();

  useEffect(() => setMounted(true), []);

  if (!data.length) return null;

  if (!mounted) {
    return (
      <div
        style={{
          marginTop: '2rem',
          marginBottom: '2rem',
          borderTop: '2px solid var(--color-accent)',
          backgroundColor: 'var(--color-surface-elevated)',
          padding: '24px 20px',
        }}
      >
        {yLabel && (
          <div
            style={{
              height: 14,
              width: '40%',
              backgroundColor: 'var(--color-border)',
              marginBottom: 16,
            }}
          />
        )}
        <div
          className="animate-pulse"
          style={{
            height,
            backgroundColor: 'var(--color-border-subtle)',
          }}
        />
      </div>
    );
  }

  const commonProps = {
    data,
    margin: { top: 8, right: 12, left: 0, bottom: 4 },
  };

  const gridElement = (
    <CartesianGrid
      stroke={colors.borderSubtle}
      strokeDasharray="none"
      vertical={false}
    />
  );

  const xAxisElement = (
    <XAxis
      dataKey={xKey}
      tick={{ fontSize: 11, fill: colors.textMuted }}
      axisLine={{ stroke: colors.border }}
      tickLine={false}
      tickMargin={8}
    />
  );

  const yAxisElement = (
    <YAxis
      tick={{ fontSize: 11, fill: colors.textMuted }}
      axisLine={false}
      tickLine={false}
      tickFormatter={formatY}
      width={50}
    />
  );

  const tooltipElement = (
    <Tooltip
      content={<CustomTooltip formatY={formatY} colors={colors} />}
      cursor={{
        stroke: colors.accentMuted,
        strokeWidth: 1,
        strokeDasharray: '4 4',
      }}
    />
  );

  const legendElement = yKey2 ? (
    <Legend content={<CustomLegend colors={colors} />} />
  ) : null;

  const secondaryColor = colors.textMuted;

  return (
    <div
      style={{
        marginTop: '2rem',
        marginBottom: '2rem',
        borderTop: `2px solid ${colors.accent}`,
        backgroundColor: colors.surfaceElevated,
        padding: '20px 16px 16px',
      }}
    >
      {yLabel && (
        <p
          style={{
            fontSize: '12px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            color: colors.textSecondary,
            margin: '0 0 16px 0',
          }}
        >
          {yLabel}
        </p>
      )}

      <ResponsiveContainer width="100%" height={height}>
        {type === 'area' ? (
          <AreaChart {...commonProps}>
            <defs>
              <linearGradient id="gradientPrimary" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={colors.accent} stopOpacity={0.3} />
                <stop offset="100%" stopColor={colors.accent} stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="gradientSecondary" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={secondaryColor} stopOpacity={0.2} />
                <stop offset="100%" stopColor={secondaryColor} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            {gridElement}
            {xAxisElement}
            {yAxisElement}
            {tooltipElement}
            {legendElement}
            {yKey2 && (
              <Area
                type="monotone"
                dataKey={yKey2}
                name={y2Label || yKey2}
                stroke={secondaryColor}
                fill="url(#gradientSecondary)"
                strokeWidth={1.5}
              />
            )}
            <Area
              type="monotone"
              dataKey={yKey}
              name={yLabel || yKey}
              stroke={colors.accent}
              fill="url(#gradientPrimary)"
              strokeWidth={2}
              activeDot={{ r: 4, fill: colors.accent, stroke: colors.surface, strokeWidth: 2 }}
            />
          </AreaChart>
        ) : type === 'bar' ? (
          <BarChart {...commonProps} barCategoryGap="25%">
            {gridElement}
            {xAxisElement}
            {yAxisElement}
            {tooltipElement}
            {legendElement}
            <Bar
              dataKey={yKey}
              name={yLabel || yKey}
              fill={colors.accent}
              radius={[2, 2, 0, 0]}
              maxBarSize={56}
            />
            {yKey2 && (
              <Bar
                dataKey={yKey2}
                name={y2Label || yKey2}
                fill={secondaryColor}
                radius={[2, 2, 0, 0]}
                maxBarSize={56}
              />
            )}
          </BarChart>
        ) : (
          <LineChart {...commonProps}>
            {gridElement}
            {xAxisElement}
            {yAxisElement}
            {tooltipElement}
            {legendElement}
            <Line
              type="monotone"
              dataKey={yKey}
              name={yLabel || yKey}
              stroke={colors.accent}
              strokeWidth={2}
              dot={{ fill: colors.surface, stroke: colors.accent, strokeWidth: 2, r: 3.5 }}
              activeDot={{ r: 5, fill: colors.accent, stroke: colors.surface, strokeWidth: 2 }}
            />
            {yKey2 && (
              <Line
                type="monotone"
                dataKey={yKey2}
                name={y2Label || yKey2}
                stroke={secondaryColor}
                strokeWidth={1.5}
                strokeDasharray="6 3"
                dot={{ fill: colors.surface, stroke: secondaryColor, strokeWidth: 2, r: 3 }}
                activeDot={{ r: 4, fill: secondaryColor, stroke: colors.surface, strokeWidth: 2 }}
              />
            )}
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
