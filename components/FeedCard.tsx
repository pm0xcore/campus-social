'use client';

import { trackEvent } from '@/lib/analytics';

export function FeedCard() {
  const handleClick = () => {
    trackEvent('feed_card_clicked', {});
  };

  return (
    <a
      href="/feed"
      onClick={handleClick}
      className="block p-6 bg-gradient-to-br from-brand-blue to-brand-blue/80 rounded-xl text-white hover:shadow-lg transition-shadow"
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-xl font-semibold mb-2">Campus Feed</h3>
          <p className="text-white/80 text-sm mb-4">
            Share your learning journey, ask questions, and connect with the community.
          </p>
          <div className="inline-flex items-center text-sm font-medium">
            View Feed
            <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
        <span className="text-4xl">💬</span>
      </div>
    </a>
  );
}
