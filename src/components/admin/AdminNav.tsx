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
      className="w-[240px] flex-shrink-0 flex flex-col"
      style={{
        borderRight: '1px solid var(--color-border)',
        backgroundColor: 'var(--color-surface)',
      }}
    >
      {/* Header */}
      <div
        className="p-8 pb-6"
        style={{ borderBottom: '1px solid var(--color-border)' }}
      >
        <a
          href="/"
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '15px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--color-accent)',
            textDecoration: 'none',
          }}
        >
          Econopedia 101
        </a>
        <p
          className="mt-1"
          style={{
            fontSize: '12px',
            color: 'var(--color-text-muted)',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}
        >
          Admin Panel
        </p>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 py-4">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <button
              key={item.href}
              onClick={() => navigate(item.href)}
              className={`admin-nav-item${active ? ' active' : ''}`}
            >
              <Icon size={16} strokeWidth={1.5} />
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Sign Out */}
      <div
        className="p-4"
        style={{ borderTop: '1px solid var(--color-border)' }}
      >
        <button onClick={signOut} className="admin-signout">
          <LogOut size={16} strokeWidth={1.5} />
          Sign Out
        </button>
      </div>
    </nav>
  );
}
