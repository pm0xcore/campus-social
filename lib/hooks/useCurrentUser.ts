'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth, getAccount } from '@/lib/auth-context';
import type { User, University } from '@/lib/database.types';

export interface CurrentUser extends User {
  university: University | null;
}

export function useCurrentUser() {
  const { isAuthenticated, ocid, ethAddress, isInitialized } = useAuth();
  
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const syncUser = useCallback(async () => {
    if (!isAuthenticated || !ocid) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      // Sync user to Supabase
      const syncRes = await fetch('/api/users/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ocid,
          ethAddress,
        }),
      });

      if (!syncRes.ok) {
        throw new Error('Failed to sync user');
      }

      const { user: syncedUser } = await syncRes.json();
      setUser(syncedUser);

      // If user doesn't have a university, try to verify
      if (!syncedUser.university_id) {
        const account = getAccount();
        const idToken = account?.getIdToken?.();
        if (idToken) {
          const verifyRes = await fetch('/api/auth/verify-university', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ocid,
              authToken: idToken,
            }),
          });

          if (verifyRes.ok) {
            const { verified, university } = await verifyRes.json();
            if (verified && university) {
              setUser(prev => prev ? {
                ...prev,
                university_id: university.id,
                university,
              } : null);
            }
          }
        }
      }
    } catch (err) {
      console.error('Error syncing user:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, ocid, ethAddress]);

  useEffect(() => {
    if (isInitialized) {
      syncUser();
    }
  }, [isInitialized, syncUser]);

  const updateProfile = async (updates: Partial<Pick<User, 'display_name' | 'bio' | 'avatar_url' | 'current_focus'>>) => {
    const account = getAccount();
    const idToken = account?.getIdToken?.();
    if (!idToken) return;

    const res = await fetch('/api/users/me', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`,
      },
      body: JSON.stringify(updates),
    });

    if (res.ok) {
      const { user: updatedUser } = await res.json();
      setUser(updatedUser);
      return updatedUser;
    }
    
    throw new Error('Failed to update profile');
  };

  return {
    user,
    loading: loading || !isInitialized,
    error,
    isAuthenticated,
    updateProfile,
    refresh: syncUser,
  };
}
