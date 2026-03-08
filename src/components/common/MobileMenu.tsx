import { useState, useEffect } from 'react';

const NAV_ITEMS = [
  { label: 'Trading', href: '/trading' },
  { label: 'Economics', href: '/economics' },
  { label: 'Finance', href: '/finance' },
  { label: 'Business', href: '/business' },
  { label: 'Banking', href: '/banking' },
  { label: 'Education', href: '/education' },
  { label: 'Tools', href: '/tools' },
];

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setIsOpen(false);
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return (
    <>
      {/* Hamburger button */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden p-2 rounded-lg transition-colors"
        style={{ color: 'var(--color-text-secondary)' }}
        aria-label="Open menu"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="4" y1="6" x2="20" y2="6" />
          <line x1="4" y1="12" x2="20" y2="12" />
          <line x1="4" y1="18" x2="20" y2="18" />
        </svg>
      </button>

      {/* Mobile menu overlay + drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 transition-opacity"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer */}
          <div
            className="absolute right-0 top-0 h-full w-80 max-w-[calc(100vw-3rem)] shadow-xl"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderLeftWidth: '1px',
              borderLeftColor: 'var(--color-border)',
            }}
          >
            {/* Close button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-lg transition-colors"
              style={{ color: 'var(--color-text-secondary)' }}
              aria-label="Close menu"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            {/* Logo area */}
            <div className="px-6 pt-6">
              <a href="/" className="flex items-center gap-0.5 no-underline">
                <span
                  className="font-bold text-lg tracking-tight"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  ECONOPEDIA
                </span>
                <span
                  className="font-bold text-lg"
                  style={{ color: 'var(--color-accent)' }}
                >
                  101
                </span>
              </a>
            </div>

            {/* Navigation links */}
            <nav className="mt-8 px-4 flex flex-col gap-1">
              {NAV_ITEMS.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="text-lg font-medium py-3 px-4 rounded-lg transition-colors"
                  style={{
                    color: 'var(--color-text-primary)',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.backgroundColor =
                      'var(--color-surface-elevated)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.backgroundColor =
                      'transparent';
                  }}
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
