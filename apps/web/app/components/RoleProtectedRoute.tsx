import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

type UserRole = 'creator' | 'studio' | 'buyer' | 'admin' | 'super_admin';

export default function RoleProtectedRoute({
  allowedRoles,
  children,
}: {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<UserRole | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadRole = async () => {
      if (!supabase) {
        if (mounted) setLoading(false);
        return;
      }

      const { data: authData } = await supabase.auth.getSession();
      if (!authData.session?.user) {
        if (mounted) setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', authData.session.user.id)
        .maybeSingle();

      if (mounted) {
        setRole(error ? null : (data?.role as UserRole | null));
        setLoading(false);
      }
    };

    void loadRole();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return <div className="min-h-screen bg-[#020617] text-zinc-400 grid place-items-center">Checking workspace access…</div>;
  }

  if (!supabase || !role || !allowedRoles.includes(role)) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
