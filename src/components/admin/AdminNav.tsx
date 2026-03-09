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
      className="w-[220px] flex-shrink-0 border-r flex flex-col h-screen sticky top-0"
      style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
    >
      <div className="p-5 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <a
          href="/"
          className="text-sm font-semibold uppercase tracking-wider"
          style={{ color: 'var(--color-accent)' }}
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
              className="w-full flex items-center gap-2.5 px-5 py-2.5 text-sm text-left transition-colors"
              style={{
                backgroundColor: active ? 'var(--color-accent-light)' : 'transparent',
                color: active ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                fontWeight: active ? 600 : 400,
              }}
            >
              <Icon size={16} />
              {item.label}
            </button>
          );
        })}
      </div>

      <div className="p-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
        <button
          onClick={signOut}
          className="w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-opacity hover:opacity-70"
          style={{ color: 'var(--color-text-muted)' }}
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </nav>
  );
}
