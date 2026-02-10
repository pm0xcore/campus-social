'use client';

import { useState, useEffect, useCallback } from 'react';
import { getAccount } from '@/lib/auth-context';
import { useCurrentUser } from '@/lib/hooks/useCurrentUser';
import { trackEvent } from '@/lib/analytics';

interface Conversation {
  partner: {
    id: string;
    ocid: string;
    display_name: string | null;
    avatar_url: string | null;
  };
  lastMessage: {
    content: string;
    created_at: string;
    sender_id: string;
  };
  unreadCount: number;
}

export default function MessagesPage() {
  const { user, loading: userLoading } = useCurrentUser();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  const getAuthToken = useCallback(() => {
    return getAccount()?.getIdToken?.();
  }, []);

  const fetchConversations = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/messages', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations || []);
      }
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    } finally {
      setLoading(false);
    }
  }, [getAuthToken]);

  useEffect(() => {
    if (!userLoading && user) {
      fetchConversations();
      trackEvent('messages_viewed', {});
    } else if (!userLoading && !user) {
      setLoading(false);
    }
  }, [userLoading, user, fetchConversations]);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
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
          <p className="text-gray-500 mb-4">Please log in to view messages</p>
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
              <h1 className="text-xl font-semibold text-gray-900">Messages</h1>
              <p className="text-sm text-gray-500">
                {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
              </p>
            </div>
            <a href="/" className="text-sm text-gray-500 hover:text-brand-blue">
              ← Home
            </a>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto">
        {loading ? (
          <div className="p-4 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white border-b p-4 animate-pulse">
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
        ) : conversations.length === 0 ? (
          <div className="text-center py-12 px-4">
            <p className="text-gray-500 mb-4">No conversations yet</p>
            <a href="/friends" className="text-brand-blue hover:underline">
              Find friends to message →
            </a>
          </div>
        ) : (
          <div className="divide-y">
            {conversations.map((conv) => {
              const displayName = conv.partner.display_name || conv.partner.ocid;
              const isOwnMessage = conv.lastMessage.sender_id === user.id;
              
              return (
                <a
                  key={conv.partner.id}
                  href={`/messages/${conv.partner.id}`}
                  className="flex items-center gap-3 p-4 bg-white hover:bg-gray-50 transition-colors"
                >
                  {/* Avatar */}
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-brand-blue/10 flex items-center justify-center">
                      {conv.partner.avatar_url ? (
                        <img
                          src={conv.partner.avatar_url}
                          alt={displayName}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-brand-blue font-semibold text-lg">
                          {displayName.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    {conv.unreadCount > 0 && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-brand-blue text-white text-xs rounded-full flex items-center justify-center">
                        {conv.unreadCount}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className={`font-medium truncate ${conv.unreadCount > 0 ? 'text-gray-900' : 'text-gray-700'}`}>
                        {displayName}
                      </span>
                      <span className="text-xs text-gray-400 ml-2 flex-shrink-0">
                        {formatTime(conv.lastMessage.created_at)}
                      </span>
                    </div>
                    <p className={`text-sm truncate ${conv.unreadCount > 0 ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                      {isOwnMessage && 'You: '}
                      {conv.lastMessage.content}
                    </p>
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
