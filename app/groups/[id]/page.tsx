'use client';

import { useState, useEffect, useCallback } from 'react';
import { getAccount } from '@/lib/auth-context';
import { PostCard } from '@/components/PostCard';
import { CreatePost } from '@/components/CreatePost';
import { useCurrentUser } from '@/lib/hooks/useCurrentUser';
import { trackEvent } from '@/lib/analytics';

interface Post {
  id: string;
  author_id: string;
  author: { id: string; ocid: string; display_name: string; avatar_url: string | null };
  content: string;
  type: 'post' | 'win' | 'question' | 'resource';
  created_at: string;
  reactions: Record<string, string[]>;
}

interface GroupMember {
  role: string;
  user: { id: string; ocid: string; display_name: string; avatar_url: string | null };
}

interface GroupDetail {
  id: string;
  name: string;
  description: string | null;
  type: string;
  university: { name: string } | null;
  created_by_user: { ocid: string; display_name: string };
  isMember: boolean;
  userRole: string | null;
  members: GroupMember[];
  memberCount: number;
}

export default function GroupDetailPage({ params }: { params: { id: string } }) {
  const { user, loading: userLoading } = useCurrentUser();
  
  const [group, setGroup] = useState<GroupDetail | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const getAuthToken = useCallback(() => {
    return getAccount()?.getIdToken?.();
  }, []);

  const fetchGroup = useCallback(async () => {
    const token = getAuthToken();
    if (!token) return;

    try {
      const res = await fetch(`/api/groups/${params.id}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setGroup(data.group);
      }
    } catch (error) {
      console.error('Failed to fetch group:', error);
    } finally {
      setLoading(false);
    }
  }, [params.id, getAuthToken]);

  const fetchPosts = useCallback(async () => {
    const token = getAuthToken();
    if (!token || !group?.isMember) return;

    try {
      const res = await fetch(`/api/groups/${params.id}/posts`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts);
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    }
  }, [params.id, group?.isMember, getAuthToken]);

  useEffect(() => {
    if (!userLoading) {
      fetchGroup();
      trackEvent('group_viewed', { groupId: params.id });
    }
  }, [userLoading, fetchGroup, params.id]);

  useEffect(() => {
    if (group?.isMember) {
      fetchPosts();
    }
  }, [group?.isMember, fetchPosts]);

  const handleJoin = async () => {
    const token = getAuthToken();
    if (!token) return;

    const res = await fetch(`/api/groups/${params.id}/join`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
    });

    if (res.ok) {
      fetchGroup();
      trackEvent('group_joined', { groupId: params.id });
    }
  };

  const handleLeave = async () => {
    const token = getAuthToken();
    if (!token) return;

    const res = await fetch(`/api/groups/${params.id}/join`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    });

    if (res.ok) {
      fetchGroup();
      trackEvent('group_left', { groupId: params.id });
    }
  };

  const handlePostCreated = async () => {
    const token = getAuthToken();
    if (!token) return;

    // Refetch posts
    fetchPosts();
  };

  const handleReaction = async (postId: string, emoji: string) => {
    const token = getAuthToken();
    if (!token || !user) return;

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

  if (!group) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Group not found or access denied</p>
          <a href="/groups" className="text-brand-blue hover:underline">← Back to Groups</a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <a href="/groups" className="text-sm text-gray-500 hover:text-brand-blue mb-2 inline-block">
            ← Back to Groups
          </a>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">{group.name}</h1>
              <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                <span>{group.memberCount} members</span>
                {group.university && (
                  <>
                    <span>•</span>
                    <span className="text-brand-blue">{group.university.name}</span>
                  </>
                )}
              </div>
            </div>
            {group.isMember ? (
              group.userRole !== 'owner' && (
                <button
                  onClick={handleLeave}
                  className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:border-red-300 hover:text-red-600 transition-colors"
                >
                  Leave
                </button>
              )
            ) : (
              <button
                onClick={handleJoin}
                className="px-4 py-2 text-sm bg-brand-blue text-white rounded-lg hover:opacity-90 transition-opacity"
              >
                Join Group
              </button>
            )}
          </div>
          {group.description && (
            <p className="text-gray-600 mt-3">{group.description}</p>
          )}
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {group.isMember ? (
          <>
            {/* Create Post */}
            <div className="mb-6">
              <CreatePost
                authorId={user?.id || ''}
                onPostCreated={handlePostCreated}
                groupId={params.id}
                getAuthToken={getAuthToken}
              />
            </div>

            {/* Posts */}
            {posts.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                <p className="text-gray-500">No posts yet. Start the conversation!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={{
                      id: post.id,
                      authorId: post.author.id,
                      authorName: post.author.display_name || post.author.ocid,
                      content: post.content,
                      createdAt: post.created_at,
                      reactions: post.reactions,
                      type: post.type,
                    }}
                    currentUserId={user?.id || null}
                    onReact={handleReaction}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <p className="text-gray-500 mb-4">Join this group to see posts and participate</p>
            <button
              onClick={handleJoin}
              className="px-6 py-2 bg-brand-blue text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              Join Group
            </button>
          </div>
        )}

        {/* Members sidebar */}
        {group.isMember && group.members.length > 0 && (
          <div className="mt-8 pt-6 border-t">
            <h3 className="text-sm font-medium text-gray-900 mb-4">Members</h3>
            <div className="grid grid-cols-2 gap-3">
              {group.members.map((member) => (
                <a
                  key={member.user.id}
                  href={`/profile/${member.user.ocid}`}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-brand-blue/10 flex items-center justify-center">
                    <span className="text-brand-blue text-sm font-medium">
                      {(member.user.display_name || member.user.ocid).charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {member.user.display_name || member.user.ocid}
                    </p>
                    {member.role !== 'member' && (
                      <p className="text-xs text-gray-500 capitalize">{member.role}</p>
                    )}
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
