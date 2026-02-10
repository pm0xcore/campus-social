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
  created_at: string;
  type: 'post' | 'win' | 'question' | 'resource';
  visibility: string;
  reactions: Record<string, string[]>;
}

type FilterType = 'all' | 'win' | 'question' | 'resource';

export default function FeedPage() {
  const { user, loading: userLoading } = useCurrentUser();

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');

  const getAuthToken = useCallback(() => {
    return getAccount()?.getIdToken?.();
  }, []);

  const fetchPosts = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/posts', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts || []);
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoading(false);
    }
  }, [getAuthToken]);

  useEffect(() => {
    if (!userLoading && user) {
      fetchPosts();
      trackEvent('feed_viewed', {});
    } else if (!userLoading && !user) {
      setLoading(false);
    }
  }, [userLoading, user, fetchPosts]);

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

  const filteredPosts = filter === 'all' 
    ? posts 
    : posts.filter((p) => p.type === filter);

  const filters: { value: FilterType; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'win', label: '🎉 Wins' },
    { value: 'question', label: '❓ Questions' },
    { value: 'resource', label: '📎 Resources' },
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
          <p className="text-gray-500 mb-4">Please log in to view the feed</p>
          <a href="/" className="text-brand-blue hover:underline">← Back to Home</a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-20">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Campus Feed</h1>
              <p className="text-sm text-gray-500">
                Welcome, {user.display_name || user.ocid}
                {user.university && ` • ${user.university.name}`}
              </p>
            </div>
            <a
              href="/"
              className="text-sm text-gray-500 hover:text-brand-blue"
            >
              ← Home
            </a>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Create post */}
        <div className="mb-6">
          <CreatePost 
            authorId={user.id} 
            onPostCreated={fetchPosts}
            getAuthToken={getAuthToken}
            showVisibility={true}
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => {
                setFilter(f.value);
                trackEvent('feed_filtered', { filter: f.value });
              }}
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

        {/* Posts */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 animate-pulse">
                <div className="flex gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gray-200" />
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
                    <div className="h-3 bg-gray-200 rounded w-16" />
                  </div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2" />
                <div className="h-4 bg-gray-200 rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No posts yet. Be the first to share!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPosts.map((post) => (
              <PostCard
                key={post.id}
                post={{
                  id: post.id,
                  authorId: post.author?.id || post.author_id,
                  authorName: post.author?.display_name || post.author?.ocid || 'Unknown',
                  content: post.content,
                  createdAt: post.created_at,
                  reactions: post.reactions,
                  type: post.type,
                }}
                currentUserId={user.id}
                onReact={handleReaction}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
