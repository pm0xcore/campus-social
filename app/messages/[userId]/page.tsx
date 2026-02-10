'use client';

import { useState, useEffect, useCallback } from 'react';
import { getAccount } from '@/lib/auth-context';
import { MessageThread } from '@/components/MessageThread';
import { useCurrentUser } from '@/lib/hooks/useCurrentUser';
import { trackEvent } from '@/lib/analytics';

interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  read_at: string | null;
}

interface Partner {
  id: string;
  ocid: string;
  display_name: string | null;
  avatar_url: string | null;
}

interface MessageRequestStatus {
  status: 'pending' | 'accepted' | 'declined';
  isSender: boolean;
}

export default function ConversationPage({ params }: { params: { userId: string } }) {
  const { user, loading: userLoading } = useCurrentUser();

  const [partner, setPartner] = useState<Partner | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [canMessage, setCanMessage] = useState(false);
  const [isFriend, setIsFriend] = useState(false);
  const [sameUniversity, setSameUniversity] = useState(false);
  const [messageRequestStatus, setMessageRequestStatus] = useState<MessageRequestStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const getAuthToken = useCallback(() => {
    return getAccount()?.getIdToken?.();
  }, []);

  const fetchConversation = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/messages/${params.userId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setPartner(data.partner);
        setMessages(data.messages || []);
        setCanMessage(data.canMessage);
        setIsFriend(data.isFriend);
        setSameUniversity(data.sameUniversity);
        setMessageRequestStatus(data.messageRequestStatus);
      }
    } catch (error) {
      console.error('Failed to fetch conversation:', error);
    } finally {
      setLoading(false);
    }
  }, [params.userId, getAuthToken]);

  useEffect(() => {
    if (!userLoading && user) {
      fetchConversation();
      trackEvent('conversation_viewed', { partnerId: params.userId });

      // Poll for new messages
      const interval = setInterval(fetchConversation, 5000);
      return () => clearInterval(interval);
    } else if (!userLoading && !user) {
      setLoading(false);
    }
  }, [userLoading, user, fetchConversation, params.userId]);

  const handleSend = async (content: string) => {
    const token = getAuthToken();
    if (!token) return;

    const res = await fetch(`/api/messages/${params.userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ content }),
    });

    if (res.ok) {
      const data = await res.json();
      setMessages(prev => [...prev, data.message]);
      trackEvent('message_sent', { recipientId: params.userId });
    }
  };

  const handleSendRequest = async () => {
    const token = getAuthToken();
    if (!token) return;

    const res = await fetch(`/api/messages/request/${params.userId}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
    });

    if (res.ok) {
      setMessageRequestStatus({ status: 'pending', isSender: true });
      trackEvent('message_request_sent', { recipientId: params.userId });
    }
  };

  const handleRespondToRequest = async (action: 'accept' | 'decline') => {
    const token = getAuthToken();
    if (!token) return;

    const res = await fetch(`/api/messages/request/${params.userId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ action }),
    });

    if (res.ok) {
      if (action === 'accept') {
        setCanMessage(true);
        setMessageRequestStatus({ status: 'accepted', isSender: false });
      } else {
        setMessageRequestStatus({ status: 'declined', isSender: false });
      }
      trackEvent(`message_request_${action}ed`, { senderId: params.userId });
    }
  };

  if (userLoading || loading) {
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

  if (!partner) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">User not found</p>
          <a href="/messages" className="text-brand-blue hover:underline">← Back to Messages</a>
        </div>
      </main>
    );
  }

  const displayName = partner.display_name || partner.ocid;

  return (
    <main className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b flex-shrink-0">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <a href="/messages" className="text-gray-500 hover:text-brand-blue">
              ←
            </a>
            <a href={`/profile/${partner.ocid}`} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-blue/10 flex items-center justify-center">
                {partner.avatar_url ? (
                  <img
                    src={partner.avatar_url}
                    alt={displayName}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-brand-blue font-semibold">
                    {displayName.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div>
                <h1 className="font-medium text-gray-900">{displayName}</h1>
                <p className="text-xs text-gray-500">
                  {isFriend ? 'Friend' : sameUniversity ? 'Same university' : 'User'}
                </p>
              </div>
            </a>
          </div>
        </div>
      </header>

      {/* Message Area */}
      <div className="flex-1 max-w-2xl mx-auto w-full flex flex-col overflow-hidden">
        {canMessage ? (
          <MessageThread
            messages={messages}
            currentUserId={user.id}
            onSend={handleSend}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="text-center max-w-sm">
              {!isFriend && sameUniversity && !messageRequestStatus && (
                <>
                  <p className="text-gray-600 mb-4">
                    You and {displayName} are at the same university. Send a message request to start chatting.
                  </p>
                  <button
                    onClick={handleSendRequest}
                    className="px-6 py-2 bg-brand-blue text-white rounded-lg hover:opacity-90 transition-opacity"
                  >
                    Send Message Request
                  </button>
                </>
              )}

              {messageRequestStatus?.status === 'pending' && messageRequestStatus.isSender && (
                <p className="text-gray-600">
                  Message request sent. Waiting for {displayName} to accept.
                </p>
              )}

              {messageRequestStatus?.status === 'pending' && !messageRequestStatus.isSender && (
                <>
                  <p className="text-gray-600 mb-4">
                    {displayName} wants to message you.
                  </p>
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={() => handleRespondToRequest('accept')}
                      className="px-6 py-2 bg-brand-blue text-white rounded-lg hover:opacity-90 transition-opacity"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleRespondToRequest('decline')}
                      className="px-6 py-2 border border-gray-200 text-gray-600 rounded-lg hover:border-red-300 hover:text-red-600 transition-colors"
                    >
                      Decline
                    </button>
                  </div>
                </>
              )}

              {messageRequestStatus?.status === 'declined' && (
                <p className="text-gray-600">
                  Message request was declined.
                </p>
              )}

              {!isFriend && !sameUniversity && (
                <p className="text-gray-600">
                  You can only message friends or people at your university.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
