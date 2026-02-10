'use client';

import { useState } from 'react';
import { trackEvent } from '@/lib/analytics';

type PostType = 'post' | 'win' | 'question' | 'resource';
type Visibility = 'public' | 'university' | 'friends';

interface CreatePostProps {
  authorId: string;
  onPostCreated: () => void;
  groupId?: string;
  getAuthToken?: () => string | undefined;
  showVisibility?: boolean;
}

const POST_TYPES: { value: PostType; label: string; icon: string }[] = [
  { value: 'post', label: 'Post', icon: '💬' },
  { value: 'win', label: 'Win', icon: '🎉' },
  { value: 'question', label: 'Question', icon: '❓' },
  { value: 'resource', label: 'Resource', icon: '📎' },
];

const VISIBILITY_OPTIONS: { value: Visibility; label: string; icon: string }[] = [
  { value: 'public', label: 'Public', icon: '🌍' },
  { value: 'university', label: 'University', icon: '🏛️' },
  { value: 'friends', label: 'Friends', icon: '👥' },
];

export function CreatePost({ authorId, onPostCreated, groupId, getAuthToken, showVisibility = false }: CreatePostProps) {
  const [content, setContent] = useState('');
  const [type, setType] = useState<PostType>('post');
  const [visibility, setVisibility] = useState<Visibility>('public');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      const token = getAuthToken?.();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const endpoint = groupId ? `/api/groups/${groupId}/posts` : '/api/posts';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({ 
          authorId, 
          content: content.trim(), 
          type,
          visibility: groupId ? 'group' : visibility,
        }),
      });

      if (res.ok) {
        setContent('');
        setType('post');
        setVisibility('public');
        setIsExpanded(false);
        onPostCreated();
        trackEvent('post_created', { type, groupId: groupId || '' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-4">
      <div className="flex gap-3">
        <div className="w-10 h-10 rounded-full bg-brand-cyan/20 flex items-center justify-center flex-shrink-0">
          <span className="text-brand-blue font-semibold text-sm">
            {authorId.charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onFocus={() => setIsExpanded(true)}
            placeholder="Share something with the community..."
            rows={isExpanded ? 3 : 1}
            className="w-full resize-none border-0 focus:ring-0 text-gray-800 placeholder-gray-400 p-0"
          />
        </div>
      </div>

      {isExpanded && (
        <div className="mt-4 pt-4 border-t space-y-3">
          <div className="flex gap-1 flex-wrap">
            {POST_TYPES.map((pt) => (
              <button
                key={pt.value}
                type="button"
                onClick={() => setType(pt.value)}
                className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                  type === pt.value
                    ? 'bg-brand-blue text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {pt.icon} {pt.label}
              </button>
            ))}
          </div>
          
          {showVisibility && !groupId && (
            <div className="flex gap-1">
              {VISIBILITY_OPTIONS.map((v) => (
                <button
                  key={v.value}
                  type="button"
                  onClick={() => setVisibility(v.value)}
                  className={`px-3 py-1.5 rounded-full text-xs transition-colors ${
                    visibility === v.value
                      ? 'bg-brand-cyan/20 text-brand-blue border border-brand-cyan'
                      : 'bg-gray-50 text-gray-500 border border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {v.icon} {v.label}
                </button>
              ))}
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!content.trim() || isSubmitting}
              className="px-4 py-2 bg-brand-blue text-white rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {isSubmitting ? 'Posting...' : 'Post'}
            </button>
          </div>
        </div>
      )}
    </form>
  );
}
