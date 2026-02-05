'use client';

import { trackEvent } from '@/lib/analytics';

export function TrackEventButton() {
  const handleClick = () => {
    trackEvent('button_clicked', {
      button: 'sample',
      timestamp: Date.now(),
    });
    alert('Event tracked! Check your analytics dashboard.');
  };

  return (
    <button
      onClick={handleClick}
      className="px-4 py-2 bg-brand-blue hover:opacity-90 text-white rounded-lg transition-opacity"
    >
      Track Sample Event
    </button>
  );
}
