import { useAdminAuth } from '../../lib/useAdminAuth';
import AdminLoadingScreen from './AdminLoadingScreen';
import AdminLoginPage from './AdminLoginPage';
import AdminAccessDenied from './AdminAccessDenied';
import AdminShell from './AdminShell';

export default function AdminApp() {
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
