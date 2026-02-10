'use client';

import { useState, useEffect, useCallback } from 'react';
import { getAccount } from '@/lib/auth-context';
import { GroupCard } from '@/components/GroupCard';
import { CreateGroup } from '@/components/CreateGroup';
import { useCurrentUser } from '@/lib/hooks/useCurrentUser';
import { trackEvent } from '@/lib/analytics';

interface Group {
  id: string;
  name: string;
  description: string | null;
  type: string;
  university_id: string | null;
  university: { name: string } | null;
  member_count: { count: number }[];
  isMember: boolean;
  userRole: string | null;
}

type FilterType = 'all' | 'my' | 'university';

export default function GroupsPage() {
  const { user, loading: userLoading } = useCurrentUser();
  
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');

  const getAuthToken = useCallback(() => {
    return getAccount()?.getIdToken?.();
  }, []);

  const fetchGroups = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const params = new URLSearchParams();
      if (filter === 'my') params.set('myGroups', 'true');
      if (filter === 'university') params.set('universityOnly', 'true');

      const res = await fetch(`/api/groups?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setGroups(data.groups);
      }
    } catch (error) {
      console.error('Failed to fetch groups:', error);
    } finally {
      setLoading(false);
    }
  }, [filter, getAuthToken]);

  useEffect(() => {
    if (!userLoading) {
      fetchGroups();
      trackEvent('groups_viewed', { filter });
    }
  }, [userLoading, fetchGroups, filter]);

  const handleJoin = async (groupId: string) => {
    const token = getAuthToken();
    if (!token) return;

    const res = await fetch(`/api/groups/${groupId}/join`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
    });

    if (res.ok) {
      fetchGroups();
    }
  };

  const handleLeave = async (groupId: string) => {
    const token = getAuthToken();
    if (!token) return;

    const res = await fetch(`/api/groups/${groupId}/join`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    });

    if (res.ok) {
      fetchGroups();
    }
  };

  const filters: { value: FilterType; label: string }[] = [
    { value: 'all', label: 'All Groups' },
    { value: 'my', label: 'My Groups' },
    ...(user?.university_id
      ? [{ value: 'university' as FilterType, label: user.university?.name || 'My University' }]
      : []),
  ];

  if (userLoading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Loading...</div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Please log in to view groups</p>
          <a href="/" className="text-brand-blue hover:underline">← Back to Home</a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-20">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Groups</h1>
              <p className="text-sm text-gray-500">
                Join communities and connect with others
              </p>
            </div>
            <a href="/" className="text-sm text-gray-500 hover:text-brand-blue">
              ← Home
            </a>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Create Group */}
        <div className="mb-6">
          <CreateGroup
            onCreated={fetchGroups}
            getAuthToken={getAuthToken}
            hasUniversity={!!user.university_id}
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
                filter === f.value
                  ? 'bg-brand-blue text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-brand-blue'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Groups List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 animate-pulse">
                <div className="flex gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-200" />
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-32 mb-2" />
                    <div className="h-3 bg-gray-200 rounded w-24" />
                  </div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-full" />
              </div>
            ))}
          </div>
        ) : groups.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <p className="text-gray-500">
              {filter === 'my'
                ? "You haven't joined any groups yet"
                : 'No groups found'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {groups.map((group) => (
              <GroupCard
                key={group.id}
                group={group}
                onJoin={handleJoin}
                onLeave={handleLeave}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
