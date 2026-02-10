'use client';

import { useState, useEffect, useCallback } from 'react';
import { getAccount } from '@/lib/auth-context';
import { useCurrentUser } from './useCurrentUser';

export function useFriendRequests() {
  const { user, isAuthenticated } = useCurrentUser();
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchCount = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setPendingCount(0);
      setLoading(false);
      return;
    }

    const token = getAccount()?.getIdToken?.();
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/friends?type=pending', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (res.ok) {
        const data = await res.json();
        setPendingCount(data.requests?.length || 0);
      }
    } catch (error) {
      console.error('Failed to fetch friend requests count:', error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    fetchCount();
    
    // Poll every 30 seconds
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, [fetchCount]);

  return { pendingCount, loading, refresh: fetchCount };
}
