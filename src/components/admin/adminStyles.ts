import type { CSSProperties } from 'react';

/* ------------------------------------------------------------------ */
/*  Shared admin panel style constants                                 */
/*  New components should use admin.css classes instead of these        */
/*  CSSProperties objects. Kept for backward compatibility with        */
/*  files not yet migrated.                                            */
/* ------------------------------------------------------------------ */

const transition = 'all 150ms ease';

/* --- Inputs & Labels --- */

export const inputBase: CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  border: '1px solid var(--color-border)',
  background: 'var(--color-background)',
  color: 'var(--color-text-primary)',
  fontSize: '14px',
  lineHeight: '1.5',
  outline: 'none',
  transition,
};

export const labelBase: CSSProperties = {
  display: 'block',
  fontSize: '11px',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  color: 'var(--color-text-muted)',
  fontWeight: 600,
  marginBottom: '6px',
};

/* --- Sections --- */

export const sectionBase: CSSProperties = {
  padding: '20px 0',
  borderBottom: '1px solid var(--color-border)',
};

/* --- Buttons (prefer .admin-btn-* CSS classes in new code) --- */

export const btnPrimary: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  padding: '10px 20px',
  backgroundColor: 'var(--color-accent)',
  color: '#fff',
  border: 'none',
  fontSize: '13px',
  fontWeight: 600,
  cursor: 'pointer',
  transition,
};

export const btnSecondary: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  padding: '10px 20px',
  backgroundColor: 'transparent',
  color: 'var(--color-text-secondary)',
  border: '1px solid var(--color-border)',
  fontSize: '13px',
  fontWeight: 600,
  cursor: 'pointer',
  transition,
};

export const btnDanger: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  padding: '10px 20px',
  backgroundColor: 'var(--color-error)',
  color: '#fff',
  border: 'none',
  fontSize: '13px',
  fontWeight: 600,
  cursor: 'pointer',
  transition,
};

/* --- Typography --- */

export const pageTitle: CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontSize: '28px',
  fontWeight: 600,
  letterSpacing: '-0.01em',
  color: 'var(--color-text-primary)',
  lineHeight: 1.2,
};

export const sectionTitle: CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontSize: '18px',
  fontWeight: 600,
  color: 'var(--color-text-primary)',
  lineHeight: 1.3,
};

/* --- Category colors (keyed by slug) --- */

export const CATEGORY_COLORS: Record<string, string> = {
  trading: 'var(--color-cat-trading)',
  economics: 'var(--color-cat-economics)',
  finance: 'var(--color-cat-finance)',
  business: 'var(--color-cat-business)',
  'banking-insurance': 'var(--color-cat-banking)',
  education: 'var(--color-cat-education)',
};
