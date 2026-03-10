import { LayoutDashboard, FileText, HelpCircle, LogOut } from 'lucide-react';

interface AdminNavProps {
  path: string;
  navigate: (to: string) => void;
  signOut: () => void;
}

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Posts', href: '/admin/posts', icon: FileText },
  { label: 'Quizzes', href: '/admin/quizzes', icon: HelpCircle },
];

export default function AdminNav({ path, navigate, signOut }: AdminNavProps) {
  const isActive = (href: string) => {
    if (href === '/admin') return path === '/admin' || path === '/admin/';
    return path.startsWith(href);
  };

  return (
    <nav
      className="w-[240px] flex-shrink-0 border-r flex flex-col"
      style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
    >
      <div
        className="p-6"
        style={{ borderBottom: '2px solid var(--color-accent)' }}
      >
        <a
          href="/"
          className="text-[15px] font-semibold uppercase"
          style={{
            fontFamily: 'var(--font-serif)',
            letterSpacing: '0.08em',
            color: 'var(--color-accent)',
            textDecoration: 'none',
          }}
        >
          Econopedia 101
        </a>
        <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
          Admin Panel
        </p>
      </div>

      <div className="flex-1 py-3">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <button
              key={item.href}
              onClick={() => navigate(item.href)}
              className="w-full flex items-center gap-2.5 px-5 py-2.5 text-sm text-left"
              style={{
                backgroundColor: 'transparent',
                color: active ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                fontWeight: 500,
                borderLeft: active ? '3px solid var(--color-accent)' : '3px solid transparent',
                transition: 'all 150ms ease',
                cursor: 'pointer',
                border: 'none',
                borderLeftWidth: '3px',
                borderLeftStyle: 'solid',
                borderLeftColor: active ? 'var(--color-accent)' : 'transparent',
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-text-primary)';
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-text-secondary)';
                }
              }}
            >
              <Icon size={16} strokeWidth={1.5} />
              {item.label}
            </button>
          );
        })}
      </div>

      <div className="p-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
        <button
          onClick={signOut}
          className="w-full flex items-center gap-2.5 px-3 py-2 text-sm"
          style={{
            color: 'var(--color-text-muted)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            transition: 'color 150ms ease',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-error)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-text-muted)';
          }}
        >
          <LogOut size={16} strokeWidth={1.5} />
          Sign Out
        </button>
      </div>
    </nav>
  );
}
