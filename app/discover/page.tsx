'use client';

import { useState, useEffect, useCallback } from 'react';
import { getAccount } from '@/lib/auth-context';
import { useCurrentUser } from '@/lib/hooks/useCurrentUser';
import { trackEvent } from '@/lib/analytics';
import { MissionBanner } from '@/components/MissionBanner';

interface DiscoverUser {
  id: string;
  ocid: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  current_focus: string | null;
}

export default function DiscoverPage() {
  const { user, loading: userLoading } = useCurrentUser();

  const [users, setUsers] = useState<DiscoverUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sentRequests, setSentRequests] = useState<Set<string>>(new Set());
  const [friendsCount, setFriendsCount] = useState(0);

  const getAuthToken = useCallback(() => {
    return getAccount()?.getIdToken?.();
  }, []);

  const fetchUsers = useCallback(async () => {
    const token = getAccount()?.getIdToken?.();
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);

      const res = await fetch(`/api/users/discover?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }

      // Also fetch friends count for mission progress
      const friendsRes = await fetch('/api/friends', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (friendsRes.ok) {
        const friendsData = await friendsRes.json();
        setFriendsCount(friendsData.friends?.length || 0);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  }, [getAuthToken, search]);

  useEffect(() => {
    if (!userLoading && user) {
      fetchUsers();
      trackEvent('discover_viewed', {});
    } else if (!userLoading && !user) {
      setLoading(false);
    }
  }, [userLoading, user, fetchUsers]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!userLoading && user) {
        fetchUsers();
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [search, userLoading, user, fetchUsers]);

  const handleAddFriend = async (targetUserId: string) => {
    const token = getAuthToken();
    if (!token) return;

    const res = await fetch('/api/friends', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ targetUserId }),
    });

    if (res.ok) {
      setSentRequests(prev => new Set([...prev, targetUserId]));
      trackEvent('friend_request_sent', { targetUserId });
    }
  };

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
          <p className="text-gray-500 mb-4">Please log in to discover people</p>
          <a href="/" className="text-brand-blue hover:underline">← Back to Home</a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-20">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Discover</h1>
              <p className="text-sm text-gray-500">
                {user.university ? `People at ${user.university.name}` : 'Find your classmates'}
              </p>
            </div>
            <a href="/" className="text-sm text-gray-500 hover:text-brand-blue">
              ← Home
            </a>
          </div>

          {/* Search */}
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or interests..."
              className="w-full px-4 py-2 pl-10 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-blue"
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Mission Banner */}
        {user.university && friendsCount < 3 && (
          <div className="mb-6">
            <MissionBanner
              title="Find Your First 3 Classmates"
              description="Connect with your campus community"
              progress={friendsCount}
              total={3}
              reward="100 points + unlock DMs"
              icon="🎯"
            />
          </div>
        )}

        {!user.university ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <span className="text-3xl">🎓</span>
            </div>
            <h3 className="font-medium text-gray-900 mb-2">Verify Your University</h3>
            <p className="text-gray-500 max-w-sm mx-auto">
              To discover classmates, you need to verify your university membership through your Open Campus credentials.
            </p>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 animate-pulse">
                <div className="w-16 h-16 rounded-full bg-gray-200 mx-auto mb-3" />
                <div className="h-4 bg-gray-200 rounded w-24 mx-auto mb-2" />
                <div className="h-3 bg-gray-200 rounded w-32 mx-auto" />
              </div>
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <p className="text-gray-500">
              {search ? 'No users found matching your search' : 'No new people to discover right now'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {users.map((discoverUser) => {
              const displayName = discoverUser.display_name || discoverUser.ocid;
              const hasSentRequest = sentRequests.has(discoverUser.id);

              return (
                <div
                  key={discoverUser.id}
                  className="bg-white border border-gray-200 rounded-xl p-4 text-center"
                >
                  {/* Avatar */}
                  <a href={`/profile/${discoverUser.ocid}`}>
                    <div className="w-16 h-16 rounded-full bg-brand-blue/10 flex items-center justify-center mx-auto mb-3">
                      {discoverUser.avatar_url ? (
                        <img
                          src={discoverUser.avatar_url}
                          alt={displayName}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-brand-blue font-semibold text-2xl">
                          {displayName.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                  </a>

                  {/* Name */}
                  <a
                    href={`/profile/${discoverUser.ocid}`}
                    className="font-medium text-gray-900 hover:text-brand-blue block truncate"
                  >
                    {displayName}
                  </a>

                  {/* Current focus */}
                  {discoverUser.current_focus && (
                    <p className="text-xs text-brand-blue mt-1 truncate">
                      {discoverUser.current_focus}
                    </p>
                  )}

                  {/* Bio preview */}
                  {discoverUser.bio && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {discoverUser.bio}
                    </p>
                  )}

                  {/* Add friend button */}
                  <button
                    onClick={() => handleAddFriend(discoverUser.id)}
                    disabled={hasSentRequest}
                    className={`mt-3 w-full py-2 text-sm rounded-lg transition-colors ${
                      hasSentRequest
                        ? 'bg-gray-100 text-gray-400 cursor-default'
                        : 'bg-brand-blue text-white hover:opacity-90'
                    }`}
                  >
                    {hasSentRequest ? 'Request Sent' : 'Add Friend (+50 pts)'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
