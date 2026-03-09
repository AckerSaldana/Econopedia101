import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

interface SearchResult {
  url: string;
  title: string;
  excerpt: string;
  meta?: Record<string, string>;
}

/**
 * Detect macOS / iOS to show the correct modifier key symbol.
 * Falls back to "Ctrl" on Windows/Linux.
 */
function useModifierKey() {
  const [isMac, setIsMac] = useState(true); // default to Mac for SSR
  useEffect(() => {
    const ua = navigator.userAgent || '';
    setIsMac(/(Macintosh|Mac OS X|iPhone|iPod|iPad)/i.test(ua));
  }, []);
  return isMac ? '\u2318' : 'Ctrl';
}

/**
 * Extract a category slug from a Pagefind result URL.
 * e.g. "/trading/some-article" -> "trading"
 */
function extractCategory(url: string): string | null {
  const categories = [
    'trading',
    'economics',
    'finance',
    'business',
    'banking',
    'education',
    'tools',
  ];
  const segment = url.split('/').filter(Boolean)[0]?.toLowerCase();
  return segment && categories.includes(segment) ? segment : null;
}

const CATEGORY_COLORS: Record<string, string> = {
  trading: '#7C3AED',
  economics: '#2563EB',
  finance: '#16A34A',
  business: '#EA580C',
  banking: '#0891B2',
  education: '#D946EF',
  tools: '#525252',
};

export default function SearchModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [pagefind, setPagefind] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const modKey = useModifierKey();

  // Load pagefind on first open
  const loadPagefind = useCallback(async () => {
    if (pagefind) return pagefind;
    try {
      const pagefindUrl = '/pagefind/pagefind.js';
      const pf = await import(/* @vite-ignore */ pagefindUrl);
      await pf.init();
      setPagefind(pf);
      return pf;
    } catch {
      return null;
    }
  }, [pagefind]);

  // Keyboard shortcut to open
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Focus input when opened, lock body scroll
  useEffect(() => {
    if (isOpen) {
      loadPagefind();
      requestAnimationFrame(() => inputRef.current?.focus());
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setQuery('');
      setResults([]);
      setSelectedIndex(0);
      setIsSearching(false);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, loadPagefind]);

  // Search when query changes
  useEffect(() => {
    if (!query.trim() || !pagefind) {
      setResults([]);
      setSelectedIndex(0);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    const timer = setTimeout(async () => {
      try {
        const search = await pagefind.search(query);
        const items = await Promise.all(
          search.results.slice(0, 8).map(async (r: any) => {
            const data = await r.data();
            return {
              url: data.url,
              title: data.meta?.title || 'Untitled',
              excerpt: data.excerpt || '',
              meta: data.meta || {},
            };
          }),
        );
        setResults(items);
        setSelectedIndex(0);
      } finally {
        setIsSearching(false);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [query, pagefind]);

  // Scroll selected result into view
  useEffect(() => {
    if (!resultsRef.current) return;
    const selected = resultsRef.current.querySelector(
      `[data-index="${selectedIndex}"]`,
    );
    if (selected) {
      selected.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      window.location.href = results[selectedIndex].url;
    }
  }

  // Expose open function for external triggers
  useEffect(() => {
    (window as any).__openSearch = () => setIsOpen(true);
    return () => {
      delete (window as any).__openSearch;
    };
  }, []);

  // Result count text
  const resultCountText = useMemo(() => {
    if (!query.trim()) return null;
    if (isSearching) return 'Searching...';
    if (results.length === 0) return 'No results';
    return `${results.length} result${results.length !== 1 ? 's' : ''}`;
  }, [query, results.length, isSearching]);

  if (!isOpen) return null;

  return (
    <div
      ref={dialogRef}
      className="search-modal-root"
      role="dialog"
      aria-modal="true"
      aria-label="Search articles"
      onClick={(e) => {
        if (e.target === dialogRef.current) setIsOpen(false);
      }}
      onKeyDown={handleKeyDown}
    >
      {/* Overlay */}
      <div className="search-overlay" aria-hidden="true" />

      {/* Modal container */}
      <div className="search-container">
        {/* Header bar */}
        <div className="search-header">
          <span className="search-header-label">Search</span>
          <div className="search-header-right">
            <kbd className="search-kbd">{modKey}K</kbd>
            <button
              onClick={() => setIsOpen(false)}
              className="search-close-btn"
              aria-label="Close search"
            >
              <kbd className="search-kbd">ESC</kbd>
            </button>
          </div>
        </div>

        {/* Thin rule */}
        <div className="search-rule" />

        {/* Input area */}
        <div className="search-input-area">
          <svg
            className="search-icon"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
            />
          </svg>
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search articles, guides, tools..."
            className="search-input"
            aria-label="Search"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
          />
          {query && (
            <button
              className="search-clear-btn"
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              aria-label="Clear search"
            >
              Clear
            </button>
          )}
        </div>

        {/* Thin rule */}
        <div className="search-rule" />

        {/* Status bar (when there is a query) */}
        {resultCountText && (
          <div className="search-status-bar">
            <span className="search-status-text">{resultCountText}</span>
            {results.length > 0 && (
              <span className="search-status-hint">
                <kbd className="search-kbd-inline">&uarr;</kbd>
                <kbd className="search-kbd-inline">&darr;</kbd> to navigate
                <span className="search-status-separator" />
                <kbd className="search-kbd-inline">&crarr;</kbd> to open
              </span>
            )}
          </div>
        )}

        {/* Results area */}
        <div className="search-results" ref={resultsRef}>
          {/* Empty state — no query */}
          {!query && (
            <div className="search-empty-state">
              <div className="search-empty-icon-container">
                <svg
                  className="search-empty-icon"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"
                  />
                </svg>
              </div>
              <p className="search-empty-title">
                Search the archive
              </p>
              <p className="search-empty-subtitle">
                Find articles on economics, trading, finance, and more
              </p>
            </div>
          )}

          {/* No results state */}
          {query && results.length === 0 && !isSearching && pagefind && (
            <div className="search-empty-state">
              <p className="search-empty-title">
                No articles found for "{query}"
              </p>
              <p className="search-empty-subtitle">
                Try broadening your search or using different keywords
              </p>
            </div>
          )}

          {/* Loading state */}
          {isSearching && results.length === 0 && (
            <div className="search-empty-state">
              <div className="search-loading-bar" />
              <p className="search-empty-subtitle">Searching the archive...</p>
            </div>
          )}

          {/* Result items */}
          {results.map((result, i) => {
            const category = extractCategory(result.url);
            const isSelected = i === selectedIndex;
            return (
              <a
                key={result.url}
                href={result.url}
                data-index={i}
                className={`search-result-item ${isSelected ? 'search-result-item--selected' : ''}`}
                onMouseEnter={() => setSelectedIndex(i)}
              >
                {/* Left accent line on selected */}
                <div
                  className="search-result-accent"
                  style={{
                    opacity: isSelected ? 1 : 0,
                    backgroundColor: category
                      ? CATEGORY_COLORS[category] || 'var(--color-accent)'
                      : 'var(--color-accent)',
                  }}
                />

                <div className="search-result-content">
                  {/* Category + title row */}
                  <div className="search-result-header">
                    {category && (
                      <span
                        className="search-result-category"
                        style={{
                          color: CATEGORY_COLORS[category] || 'var(--color-text-muted)',
                        }}
                      >
                        {category}
                      </span>
                    )}
                    <h4 className="search-result-title">{result.title}</h4>
                  </div>

                  {/* Excerpt */}
                  <p
                    className="search-result-excerpt"
                    dangerouslySetInnerHTML={{ __html: result.excerpt }}
                  />
                </div>

                {/* Arrow indicator */}
                <svg
                  className={`search-result-arrow ${isSelected ? 'search-result-arrow--visible' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                  />
                </svg>
              </a>
            );
          })}
        </div>

        {/* Footer */}
        <div className="search-footer">
          <span className="search-footer-text">
            Powered by Pagefind
          </span>
          <span className="search-footer-brand">
            Econopedia 101
          </span>
        </div>
      </div>

      <style>{`
        /* --------------------------------------------------------
         * SearchModal — Editorial Design System
         * Inspired by FT, Economist, Bloomberg
         * Sharp corners, thin rules, serif accents, no shadows
         * -------------------------------------------------------- */

        .search-modal-root {
          position: fixed;
          inset: 0;
          z-index: 100;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding-top: 12vh;
        }

        /* -- Overlay -- */
        .search-overlay {
          position: absolute;
          inset: 0;
          background: rgba(10, 10, 10, 0.6);
          backdrop-filter: blur(2px);
          -webkit-backdrop-filter: blur(2px);
          animation: searchFadeIn 0.2s ease-out;
        }

        /* -- Container -- */
        .search-container {
          position: relative;
          width: 100%;
          max-width: 640px;
          margin: 0 16px;
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          display: flex;
          flex-direction: column;
          animation: searchSlideDown 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          max-height: 72vh;
        }

        /* -- Header bar -- */
        .search-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 20px;
        }

        .search-header-label {
          font-family: var(--font-serif);
          font-size: 13px;
          font-weight: 500;
          letter-spacing: 0.02em;
          color: var(--color-text-secondary);
        }

        .search-header-right {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        /* -- Keyboard badges -- */
        .search-kbd {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 2px 6px;
          font-family: var(--font-sans);
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.05em;
          line-height: 1;
          color: var(--color-text-muted);
          border: 1px solid var(--color-border);
          background: var(--color-surface-elevated);
          min-width: 22px;
          height: 20px;
          text-transform: uppercase;
        }

        .search-kbd-inline {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 1px 4px;
          font-family: var(--font-sans);
          font-size: 10px;
          font-weight: 500;
          line-height: 1;
          color: var(--color-text-muted);
          border: 1px solid var(--color-border);
          background: var(--color-surface-elevated);
          min-width: 18px;
          height: 18px;
        }

        .search-close-btn {
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
          display: inline-flex;
        }

        .search-close-btn:hover .search-kbd {
          color: var(--color-text-primary);
          border-color: var(--color-text-muted);
        }

        /* -- Thin horizontal rules -- */
        .search-rule {
          height: 1px;
          background: var(--color-border);
          flex-shrink: 0;
        }

        /* -- Input area -- */
        .search-input-area {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 20px;
        }

        .search-icon {
          width: 20px;
          height: 20px;
          color: var(--color-text-muted);
          flex-shrink: 0;
        }

        .search-input {
          flex: 1;
          font-family: var(--font-serif);
          font-size: 20px;
          font-weight: 400;
          line-height: 1.3;
          color: var(--color-text-primary);
          background: transparent;
          border: none;
          outline: none;
          caret-color: var(--color-text-primary);
          letter-spacing: -0.01em;
        }

        .search-input::placeholder {
          color: var(--color-text-muted);
          font-style: italic;
        }

        /* Remove browser search input clear button */
        .search-input::-webkit-search-cancel-button,
        .search-input::-webkit-search-decoration {
          -webkit-appearance: none;
          appearance: none;
        }

        .search-clear-btn {
          font-family: var(--font-sans);
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: var(--color-text-muted);
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px 0;
          flex-shrink: 0;
          transition: color 0.15s ease;
        }

        .search-clear-btn:hover {
          color: var(--color-text-primary);
        }

        /* -- Status bar -- */
        .search-status-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 20px;
          border-bottom: 1px solid var(--color-border);
        }

        .search-status-text {
          font-family: var(--font-sans);
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: var(--color-text-muted);
        }

        .search-status-hint {
          display: none;
          align-items: center;
          gap: 4px;
          font-family: var(--font-sans);
          font-size: 11px;
          color: var(--color-text-muted);
        }

        @media (min-width: 640px) {
          .search-status-hint {
            display: flex;
          }
        }

        .search-status-separator {
          display: inline-block;
          width: 1px;
          height: 12px;
          background: var(--color-border);
          margin: 0 6px;
        }

        /* -- Results area -- */
        .search-results {
          overflow-y: auto;
          flex: 1;
          min-height: 0;
          max-height: 400px;
        }

        /* Subtle scrollbar styling */
        .search-results::-webkit-scrollbar {
          width: 4px;
        }

        .search-results::-webkit-scrollbar-track {
          background: transparent;
        }

        .search-results::-webkit-scrollbar-thumb {
          background: var(--color-border);
        }

        /* -- Empty / no-results state -- */
        .search-empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px 24px;
          text-align: center;
        }

        .search-empty-icon-container {
          margin-bottom: 16px;
        }

        .search-empty-icon {
          width: 32px;
          height: 32px;
          color: var(--color-border);
        }

        .search-empty-title {
          font-family: var(--font-serif);
          font-size: 16px;
          font-weight: 400;
          font-style: italic;
          color: var(--color-text-secondary);
          margin: 0 0 6px;
          line-height: 1.4;
        }

        .search-empty-subtitle {
          font-family: var(--font-sans);
          font-size: 12px;
          color: var(--color-text-muted);
          margin: 0;
          letter-spacing: 0.01em;
        }

        /* -- Loading bar -- */
        .search-loading-bar {
          width: 60px;
          height: 1px;
          background: var(--color-border);
          margin-bottom: 16px;
          position: relative;
          overflow: hidden;
        }

        .search-loading-bar::after {
          content: '';
          position: absolute;
          left: -50%;
          width: 50%;
          height: 100%;
          background: var(--color-text-muted);
          animation: searchLoadingSlide 1s ease-in-out infinite;
        }

        /* -- Result item -- */
        .search-result-item {
          display: flex;
          align-items: center;
          gap: 0;
          padding: 14px 20px 14px 0;
          margin: 0 20px;
          text-decoration: none;
          border-bottom: 1px solid var(--color-border-subtle);
          transition: background-color 0.1s ease;
          position: relative;
          cursor: pointer;
        }

        .search-result-item:last-child {
          border-bottom: none;
        }

        .search-result-item--selected {
          margin: 0;
          padding-left: 20px;
          padding-right: 20px;
          background: var(--color-surface-elevated);
        }

        .search-result-item--selected:last-child {
          border-bottom: none;
        }

        /* -- Left accent bar -- */
        .search-result-accent {
          position: absolute;
          left: 0;
          top: 8px;
          bottom: 8px;
          width: 2px;
          transition: opacity 0.15s ease;
        }

        /* -- Result content -- */
        .search-result-content {
          flex: 1;
          min-width: 0;
          padding-left: 0;
        }

        .search-result-item--selected .search-result-content {
          padding-left: 12px;
        }

        .search-result-header {
          display: flex;
          align-items: baseline;
          gap: 8px;
          margin-bottom: 3px;
        }

        .search-result-category {
          font-family: var(--font-sans);
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          flex-shrink: 0;
          line-height: 1;
        }

        .search-result-title {
          font-family: var(--font-serif);
          font-size: 15px;
          font-weight: 500;
          line-height: 1.35;
          color: var(--color-text-primary);
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .search-result-excerpt {
          font-family: var(--font-sans);
          font-size: 12px;
          line-height: 1.5;
          color: var(--color-text-secondary);
          margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* Highlight matching text in excerpts */
        .search-result-excerpt mark {
          background: none;
          color: var(--color-text-primary);
          font-weight: 600;
        }

        /* -- Arrow indicator -- */
        .search-result-arrow {
          width: 16px;
          height: 16px;
          flex-shrink: 0;
          color: var(--color-text-muted);
          opacity: 0;
          transform: translateX(-4px);
          transition: opacity 0.15s ease, transform 0.15s ease;
          margin-left: 12px;
        }

        .search-result-arrow--visible {
          opacity: 1;
          transform: translateX(0);
        }

        /* -- Footer -- */
        .search-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 20px;
          border-top: 1px solid var(--color-border);
        }

        .search-footer-text {
          font-family: var(--font-sans);
          font-size: 10px;
          letter-spacing: 0.04em;
          color: var(--color-text-muted);
        }

        .search-footer-brand {
          font-family: var(--font-serif);
          font-size: 11px;
          font-weight: 500;
          color: var(--color-text-muted);
          letter-spacing: 0.02em;
        }

        /* --------------------------------------------------------
         * Animations
         * -------------------------------------------------------- */

        @keyframes searchFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        @keyframes searchSlideDown {
          from {
            opacity: 0;
            transform: translateY(-12px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes searchLoadingSlide {
          0%   { left: -50%; }
          100% { left: 100%; }
        }

        @media (prefers-reduced-motion: reduce) {
          .search-overlay,
          .search-container {
            animation: none;
          }
          .search-loading-bar::after {
            animation: none;
          }
          .search-result-arrow {
            transition: none;
          }
          .search-result-accent {
            transition: none;
          }
        }

        /* --------------------------------------------------------
         * Mobile adjustments
         * -------------------------------------------------------- */

        @media (max-width: 639px) {
          .search-modal-root {
            padding-top: 0;
            align-items: flex-start;
          }

          .search-container {
            max-width: 100%;
            margin: 0;
            border-left: none;
            border-right: none;
            border-top: none;
            max-height: 100vh;
            max-height: 100dvh;
          }

          .search-input {
            font-size: 18px;
          }

          .search-results {
            max-height: calc(100vh - 200px);
            max-height: calc(100dvh - 200px);
          }
        }

        /* --------------------------------------------------------
         * Dark mode overrides
         * -------------------------------------------------------- */

        .dark .search-overlay {
          background: rgba(0, 0, 0, 0.75);
        }
      `}</style>
    </div>
  );
}
