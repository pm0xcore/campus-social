'use client';

import { useState, useEffect, useCallback } from 'react';
import { getAccount } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { ProfileCard } from '@/components/ProfileCard';
import { PostCard } from '@/components/PostCard';
import { UniversityBadge } from '@/components/UniversityBadge';
import { useCurrentUser } from '@/lib/hooks/useCurrentUser';
import { trackEvent } from '@/lib/analytics';

interface Post {
  id: string;
  author_id: string;
  author: { id: string; ocid: string; display_name: string };
  content: string;
  created_at: string;
  type: 'post' | 'win' | 'question' | 'resource';
  reactions: Record<string, string[]>;
}

interface ProfileUser {
  id: string;
  ocid: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  current_focus: string | null;
  university: { id: string; name: string; logo_url: string | null } | null;
  isOwnProfile: boolean;
  friendshipStatus: { status: string; isRequester: boolean } | null;
  friendshipId: string | null;
  stats: { posts: number; reactions: number; friends: number };
}

export default function ProfilePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user: currentUser, loading: userLoading } = useCurrentUser();

  const [profileUser, setProfileUser] = useState<ProfileUser | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const profileOcid = decodeURIComponent(params.id);

  const getAuthToken = useCallback(() => {
    return getAccount()?.getIdToken?.();
  }, []);

  const fetchProfile = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/users/${encodeURIComponent(profileOcid)}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setProfileUser(data.user);
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  }, [profileOcid, getAuthToken]);

  const fetchPosts = useCallback(async () => {
    const token = getAuthToken();
    if (!token || !profileUser) return;

    try {
      const res = await fetch('/api/posts', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        const userPosts = data.posts?.filter((p: Post) => p.author_id === profileUser.id) || [];
        setPosts(userPosts);
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    }
  }, [profileUser, getAuthToken]);

  useEffect(() => {
    if (!userLoading) {
      fetchProfile();
      trackEvent('profile_viewed', { profileId: profileOcid });
    }
  }, [userLoading, fetchProfile, profileOcid]);

  useEffect(() => {
    if (profileUser) {
      fetchPosts();
    }
  }, [profileUser, fetchPosts]);

  const handleAddFriend = async () => {
    const token = getAuthToken();
    if (!token || !profileUser) return;

    const res = await fetch('/api/friends', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ targetUserId: profileUser.id }),
    });

    if (res.ok) {
      fetchProfile();
      trackEvent('friend_request_sent', { targetUserId: profileUser.id });
    }
  };

  const handleMessage = () => {
    if (profileUser) {
      router.push(`/messages/${profileUser.id}`);
    }
  };

  const handleAcceptRequest = async () => {
    const token = getAuthToken();
    if (!token || !profileUser || !profileUser.friendshipId) return;

    const res = await fetch(`/api/friends/${profileUser.friendshipId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ action: 'accept' }),
    });

    if (res.ok) {
      fetchProfile();
      trackEvent('friend_request_accepted', { friendshipId: profileUser.friendshipId });
    }
  };

  const handleReaction = async (postId: string, emoji: string) => {
    const token = getAuthToken();
    if (!token) return;

    try {
      const res = await fetch(`/api/posts/${postId}/react`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ emoji }),
      });

      if (res.ok) {
        const data = await res.json();
        setPosts((prev) =>
          prev.map((p) => (p.id === postId ? { ...p, reactions: data.post.reactions } : p))
        );
      }
    } catch (error) {
      console.error('Failed to react:', error);
    }
  };

  if (loading || userLoading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Loading...</div>
      </main>
    );
  }

  if (!profileUser) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">User not found</p>
          <a href="/feed" className="text-brand-blue hover:underline">← Back to Feed</a>
        </div>
      </main>
    );
  }

  const displayName = profileUser.display_name || profileUser.ocid;
  const isFriend = profileUser.friendshipStatus?.status === 'accepted';
  const isPending = profileUser.friendshipStatus?.status === 'pending';

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <a href="/feed" className="text-sm text-gray-500 hover:text-brand-blue">
            ← Back to Feed
          </a>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Profile Card */}
        <div className="mb-6">
          <ProfileCard
            userId={displayName}
            isOwnProfile={profileUser.isOwnProfile}
            stats={{ posts: profileUser.stats.posts, reactions: profileUser.stats.reactions }}
            bio={profileUser.bio || undefined}
            currentFocus={profileUser.current_focus || undefined}
          />

          {/* University Badge */}
          {profileUser.university && (
            <div className="mt-4">
              <UniversityBadge university={profileUser.university} />
            </div>
          )}

          {/* Action Buttons */}
          {!profileUser.isOwnProfile && (
            <div className="mt-4 flex gap-2">
              {isFriend ? (
                <button
                  onClick={handleMessage}
                  className="flex-1 py-2 bg-brand-blue text-white rounded-lg hover:opacity-90 transition-opacity"
                >
                  Message
                </button>
              ) : isPending ? (
                profileUser.friendshipStatus?.isRequester ? (
                  <button
                    disabled
                    className="flex-1 py-2 bg-gray-100 text-gray-400 rounded-lg cursor-default"
                  >
                    Request Sent
                  </button>
                ) : (
                  <button
                    onClick={handleAcceptRequest}
                    className="flex-1 py-2 bg-brand-blue text-white rounded-lg hover:opacity-90 transition-opacity"
                  >
                    Accept Request
                  </button>
                )
              ) : (
                <button
                  onClick={handleAddFriend}
                  className="flex-1 py-2 bg-brand-blue text-white rounded-lg hover:opacity-90 transition-opacity"
                >
                  Add Friend
                </button>
              )}
            </div>
          )}
        </div>

        {/* User's Posts */}
        <div className="mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            {profileUser.isOwnProfile ? 'Your Posts' : `Posts by ${displayName}`}
          </h3>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <p className="text-gray-500">
              {profileUser.isOwnProfile 
                ? "You haven't posted anything yet." 
                : "This user hasn't posted anything yet."}
            </p>
            {profileUser.isOwnProfile && (
              <a
                href="/feed"
                className="inline-block mt-4 text-sm text-brand-blue hover:underline"
              >
                Go to feed to create your first post →
              </a>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={{
                  id: post.id,
                  authorId: post.author?.id || post.author_id,
                  authorName: post.author?.display_name || post.author?.ocid || displayName,
                  content: post.content,
                  createdAt: post.created_at,
                  reactions: post.reactions,
                  type: post.type,
                }}
                currentUserId={currentUser?.id || null}
                onReact={handleReaction}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
