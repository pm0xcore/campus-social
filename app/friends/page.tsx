'use client';

import { useState, useEffect, useCallback } from 'react';
import { getAccount } from '@/lib/auth-context';
import { FriendCard } from '@/components/FriendCard';
import { useCurrentUser } from '@/lib/hooks/useCurrentUser';
import { trackEvent } from '@/lib/analytics';
import { useRouter } from 'next/navigation';

interface Friend {
  id: string;
  ocid: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  current_focus: string | null;
  friendshipId: string;
}

interface FriendRequest {
  id: string;
  created_at: string;
  requester?: Friend;
  addressee?: Friend;
}

type TabType = 'friends' | 'requests' | 'sent';

export default function FriendsPage() {
  const router = useRouter();
  const { user, loading: userLoading } = useCurrentUser();

  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabType>('friends');

  const getAuthToken = useCallback(() => {
    return getAccount()?.getIdToken?.();
  }, []);

  const fetchData = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const [friendsRes, pendingRes, sentRes] = await Promise.all([
        fetch('/api/friends?type=all', {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        fetch('/api/friends?type=pending', {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        fetch('/api/friends?type=sent', {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
      ]);

      if (friendsRes.ok) {
        const data = await friendsRes.json();
        setFriends(data.friends || []);
      }
      if (pendingRes.ok) {
        const data = await pendingRes.json();
        setPendingRequests(data.requests || []);
      }
      if (sentRes.ok) {
        const data = await sentRes.json();
        setSentRequests(data.requests || []);
      }
    } catch (error) {
      console.error('Failed to fetch friends:', error);
    } finally {
      setLoading(false);
    }
  }, [getAuthToken]);

  useEffect(() => {
    if (!userLoading && user) {
      fetchData();
      trackEvent('friends_viewed', {});
    } else if (!userLoading && !user) {
      setLoading(false);
    }
  }, [userLoading, user, fetchData]);

  const handleAccept = async (friendshipId: string) => {
    const token = getAuthToken();
    if (!token) return;

    const res = await fetch(`/api/friends/${friendshipId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ action: 'accept' }),
    });

    if (res.ok) {
      fetchData();
      trackEvent('friend_request_accepted', { friendshipId });
    }
  };

  const handleDecline = async (friendshipId: string) => {
    const token = getAuthToken();
    if (!token) return;

    const res = await fetch(`/api/friends/${friendshipId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ action: 'decline' }),
    });

    if (res.ok) {
      fetchData();
      trackEvent('friend_request_declined', { friendshipId });
    }
  };

  const handleRemove = async (friendshipId: string) => {
    const token = getAuthToken();
    if (!token) return;

    const res = await fetch(`/api/friends/${friendshipId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    });

    if (res.ok) {
      fetchData();
      trackEvent('friend_removed', { friendshipId });
    }
  };

  const handleMessage = (userId: string) => {
    router.push(`/messages/${userId}`);
  };

  const tabs: { value: TabType; label: string; count: number }[] = [
    { value: 'friends', label: 'Friends', count: friends.length },
    { value: 'requests', label: 'Requests', count: pendingRequests.length },
    { value: 'sent', label: 'Sent', count: sentRequests.length },
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
          <p className="text-gray-500 mb-4">Please log in to view friends</p>
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
              <h1 className="text-xl font-semibold text-gray-900">Friends</h1>
              <p className="text-sm text-gray-500">
                {friends.length} friend{friends.length !== 1 ? 's' : ''}
              </p>
            </div>
            <a href="/" className="text-sm text-gray-500 hover:text-brand-blue">
              ← Home
            </a>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {tabs.map((t) => (
            <button
              key={t.value}
              onClick={() => setTab(t.value)}
              className={`px-4 py-2 rounded-full text-sm transition-colors ${
                tab === t.value
                  ? 'bg-brand-blue text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-brand-blue'
              }`}
            >
              {t.label}
              {t.count > 0 && (
                <span className={`ml-1.5 px-1.5 py-0.5 text-xs rounded-full ${
                  tab === t.value ? 'bg-white/20' : 'bg-gray-100'
                }`}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Find friends link */}
        <a
          href="/discover"
          className="block mb-6 p-4 bg-brand-cyan/10 border border-brand-cyan/30 rounded-xl text-center hover:bg-brand-cyan/20 transition-colors"
        >
          <span className="text-brand-blue font-medium">
            Find people at your university →
          </span>
        </a>

        {/* Content */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 animate-pulse">
                <div className="flex gap-3">
                  <div className="w-12 h-12 rounded-full bg-gray-200" />
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-32 mb-2" />
                    <div className="h-3 bg-gray-200 rounded w-48" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {tab === 'friends' && (
              friends.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                  <p className="text-gray-500">No friends yet. Find people to connect with!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {friends.map((friend) => (
                    <FriendCard
                      key={friend.friendshipId}
                      friend={friend}
                      type="friend"
                      onMessage={handleMessage}
                      onRemove={handleRemove}
                    />
                  ))}
                </div>
              )
            )}

            {tab === 'requests' && (
              pendingRequests.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                  <p className="text-gray-500">No pending requests</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingRequests.map((request) => (
                    <FriendCard
                      key={request.id}
                      friend={{
                        ...request.requester!,
                        friendshipId: request.id,
                      }}
                      type="request"
                      onAccept={handleAccept}
                      onDecline={handleDecline}
                    />
                  ))}
                </div>
              )
            )}

            {tab === 'sent' && (
              sentRequests.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                  <p className="text-gray-500">No sent requests</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sentRequests.map((request) => (
                    <FriendCard
                      key={request.id}
                      friend={{
                        ...request.addressee!,
                        friendshipId: request.id,
                      }}
                      type="sent"
                      onRemove={handleRemove}
                    />
                  ))}
                </div>
              )
            )}
          </>
        )}
      </div>
    </main>
  );
}
