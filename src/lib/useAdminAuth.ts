import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import { supabase } from './supabase';

export function useAdminAuth() {
  const auth = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminLoading, setAdminLoading] = useState(true);

  useEffect(() => {
    if (auth.loading) return;

    if (!auth.user) {
      setIsAdmin(false);
      setAdminLoading(false);
      return;
    }

    const email = auth.user.email;
    if (!email) {
      setIsAdmin(false);
      setAdminLoading(false);
      return;
    }

    supabase
      .from('admin_allowlist')
      .select('email')
      .eq('email', email)
      .single()
      .then(({ data }) => {
        setIsAdmin(!!data);
        setAdminLoading(false);
      });
  }, [auth.user, auth.loading]);

  return {
    user: auth.user,
    isAdmin,
    loading: auth.loading || adminLoading,
    signInWithGoogle: auth.signInWithGoogle,
    signInWithEmail: auth.signInWithEmail,
    signOut: auth.signOut,
  };
}
