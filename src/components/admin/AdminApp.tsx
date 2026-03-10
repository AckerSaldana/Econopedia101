import { Component, type ReactNode } from 'react';
import { captureException } from '../../lib/sentry';
import { useAdminAuth } from '../../lib/useAdminAuth';
import AdminLoadingScreen from './AdminLoadingScreen';
import AdminLoginPage from './AdminLoginPage';
import AdminAccessDenied from './AdminAccessDenied';
import AdminShell from './AdminShell';

class ErrorBoundary extends Component<
  { children: ReactNode },
  { error: Error | null }
> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error) {
    captureException(error);
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: '2rem', fontFamily: 'monospace' }}>
          <h1 style={{ color: '#DC2626', marginBottom: '1rem' }}>Admin Error</h1>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: '13px' }}>
            {this.state.error.message}
          </pre>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: '11px', color: '#666', marginTop: '0.5rem' }}>
            {this.state.error.stack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

function AdminAppInner() {
  const { user, isAdmin, loading, signInWithGoogle, signInWithEmail, signOut } = useAdminAuth();

  if (loading) return <AdminLoadingScreen />;

  if (!user) {
    return <AdminLoginPage signInWithGoogle={signInWithGoogle} signInWithEmail={signInWithEmail} />;
  }

  if (!isAdmin) {
    return <AdminAccessDenied email={user.email || ''} signOut={signOut} />;
  }

  return <AdminShell signOut={signOut} />;
}

export default function AdminApp() {
  return (
    <ErrorBoundary>
      <AdminAppInner />
    </ErrorBoundary>
  );
}
