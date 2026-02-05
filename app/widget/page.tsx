'use client';

import { useEffect } from 'react';
import { trackEvent } from '@/lib/analytics';

export default function WidgetPage() {
  useEffect(() => {
    trackEvent('widget_loaded');
  }, []);

  return (
    <div className="h-full w-full bg-linear-to-br from-brand-blue to-brand-cyan p-4">
      <div className="flex h-full flex-col items-center justify-evenly text-white">
        <h2 className="text-xl font-semibold">Sample Widget</h2>
        <p className="text-center text-sm opacity-90">
          This widget can be embedded in the OC Hub home page.
        </p>
      </div>
    </div>
  );
}
