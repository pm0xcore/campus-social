'use client';

import { useFriendRequests } from '@/lib/hooks/useFriendRequests';

export function FriendRequestBanner() {
  const { pendingCount } = useFriendRequests();

  if (pendingCount === 0) return null;

  return (
    <a
      href="/friends?tab=requests"
      className="block mb-6 p-4 bg-gradient-to-r from-brand-blue to-brand-cyan text-white rounded-xl hover:shadow-lg transition-all animate-pulse"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🤝</span>
          <div>
            <p className="font-semibold">
              {pendingCount} new friend {pendingCount === 1 ? 'request' : 'requests'}!
            </p>
            <p className="text-sm text-white/90">
              Tap to view and respond
            </p>
          </div>
        </div>
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </a>
  );
}
