'use client';

import { useState } from 'react';
import { trackEvent } from '@/lib/analytics';

interface Post {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
  reactions: Record<string, string[]>;
  type: 'post' | 'win' | 'question' | 'resource';
}

const REACTION_OPTIONS = ['🔥', '👏', '💡', '📚', '❤️'];

const TYPE_BADGES: Record<Post['type'], { label: string; color: string }> = {
  post: { label: '', color: '' },
  win: { label: '🎉 Win', color: 'bg-green-100 text-green-700' },
  question: { label: '❓ Question', color: 'bg-blue-100 text-blue-700' },
  resource: { label: '📎 Resource', color: 'bg-purple-100 text-purple-700' },
};

interface PostCardProps {
  post: Post;
  currentUserId: string | null;
  onReact: (postId: string, emoji: string) => void;
}

export function PostCard({ post, currentUserId, onReact }: PostCardProps) {
  const [showReactionPicker, setShowReactionPicker] = useState(false);

  const timeAgo = getTimeAgo(post.createdAt);
  const badge = TYPE_BADGES[post.type];

  const handleReaction = (emoji: string) => {
    onReact(post.id, emoji);
    setShowReactionPicker(false);
    trackEvent('post_reaction', { postId: post.id, emoji });
  };

  const totalReactions = Object.values(post.reactions).reduce(
    (sum, users) => sum + users.length,
    0
  );

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-sm transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-brand-blue/10 flex items-center justify-center">
            <span className="text-brand-blue font-semibold text-sm">
              {post.authorName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <a
              href={`/profile/${post.authorId}`}
              className="font-medium text-gray-900 hover:text-brand-blue"
            >
              {post.authorName}
            </a>
            <p className="text-xs text-gray-500">{timeAgo}</p>
          </div>
        </div>
        {badge.label && (
          <span className={`text-xs px-2 py-1 rounded-full ${badge.color}`}>
            {badge.label}
          </span>
        )}
      </div>

      {/* Content */}
      <p className="text-gray-800 mb-4 whitespace-pre-wrap">{post.content}</p>

      {/* Reactions */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Existing reactions */}
        {Object.entries(post.reactions).map(([emoji, users]) => {
          const hasReacted = currentUserId && users.includes(currentUserId);
          return (
            <button
              key={emoji}
              onClick={() => handleReaction(emoji)}
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm transition-colors ${
                hasReacted
                  ? 'bg-brand-blue/10 border border-brand-blue/30'
                  : 'bg-gray-100 hover:bg-gray-200 border border-transparent'
              }`}
            >
              <span>{emoji}</span>
              <span className="text-gray-600">{users.length}</span>
            </button>
          );
        })}

        {/* Add reaction button */}
        <div className="relative">
          <button
            onClick={() => setShowReactionPicker(!showReactionPicker)}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors"
          >
            +
          </button>

          {showReactionPicker && (
            <div className="absolute bottom-full left-0 mb-2 flex gap-1 bg-white border border-gray-200 rounded-lg p-2 shadow-lg z-10">
              {REACTION_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleReaction(emoji)}
                  className="w-8 h-8 hover:bg-gray-100 rounded flex items-center justify-center transition-colors"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        {totalReactions > 0 && (
          <span className="text-xs text-gray-400 ml-2">
            {totalReactions} reaction{totalReactions !== 1 ? 's' : ''}
          </span>
        )}
      </div>
    </div>
  );
}

function getTimeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString();
}
