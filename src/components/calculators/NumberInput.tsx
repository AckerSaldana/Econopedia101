interface NumberInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  prefix?: string;
  suffix?: string;
  error?: string;
  helpText?: string;
  id?: string;
}

export default function NumberInput({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  prefix,
  suffix,
  error,
  helpText,
  id,
}: NumberInputProps) {
  const inputId = id || label.toLowerCase().replace(/\s+/g, '-');
  const helpId = helpText ? `${inputId}-help` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;

  return (
    <div className="flex flex-col">
      <label
        htmlFor={inputId}
        className="text-sm font-medium mb-1.5"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        {label}
      </label>
      <div className="relative flex items-center">
        {prefix && (
          <span
            className="absolute left-3 text-sm pointer-events-none"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {prefix}
          </span>
        )}
        <input
          id={inputId}
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          min={min}
          max={max}
          step={step}
          aria-describedby={[helpId, errorId].filter(Boolean).join(' ') || undefined}
          aria-invalid={error ? true : undefined}
          className="w-full border px-4 py-2.5 text-sm transition-colors tabular-nums focus:outline-none focus:ring-2"
          style={{
            backgroundColor: 'var(--color-surface)',
            color: 'var(--color-text-primary)',
            borderColor: error ? 'var(--color-error)' : 'var(--color-border)',
            paddingLeft: prefix ? '2rem' : undefined,
            paddingRight: suffix ? '3rem' : undefined,
          }}
          onFocus={(e) => {
            e.target.style.borderColor = 'var(--color-accent)';
            e.target.style.setProperty('--tw-ring-color', 'var(--color-accent)');
          }}
          onBlur={(e) => {
            e.target.style.borderColor = error ? 'var(--color-error)' : 'var(--color-border)';
          }}
        />
        {suffix && (
          <span
            className="absolute right-3 text-sm pointer-events-none"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {suffix}
          </span>
        )}
      </div>
      {helpText && !error && (
        <p
          id={helpId}
          className="text-xs mt-1"
          style={{ color: 'var(--color-text-muted)' }}
        >
          {helpText}
        </p>
      )}
      {error && (
        <p
          id={errorId}
          className="text-xs mt-1"
          style={{ color: 'var(--color-error)' }}
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}
