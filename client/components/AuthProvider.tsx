'use client';

import { useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { ME } from '@/lib/graphql/queries';
import { useAuthStore } from '@/store/auth-store';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { token, hasHydrated, user, setAuth, setHasHydrated } = useAuthStore();
  const { data } = useQuery(ME, {
    skip: !hasHydrated || !token || !!user,
    fetchPolicy: 'network-only',
    onError: () => {
      // Token is invalid, clear auth
      useAuthStore.getState().logout();
    },
  });

  useEffect(() => {
    if (!hasHydrated) {
      setHasHydrated(true);
    }
  }, [hasHydrated, setHasHydrated]);

  useEffect(() => {
    if (hasHydrated && token && data?.me && !user) {
      setAuth(data.me, token);
    }
  }, [hasHydrated, token, data, user, setAuth]);

  return <>{children}</>;
}

