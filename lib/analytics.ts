import { OCAnalytics } from '@opencampus/ochub-utils';
import { env } from './env';

let analytics: OCAnalytics | null = null;

function getAnalytics(): OCAnalytics | null {
  if (typeof window === 'undefined') return null;
  if (!analytics && env.NEXT_PUBLIC_GA_ID) {
    analytics = OCAnalytics.initialize('oc-miniapp', {
      containerId: env.NEXT_PUBLIC_GA_ID,
    });
  }
  return analytics;
}

export function trackEvent(
  name: string,
  params?: Record<string, string | number | boolean>
): void {
  getAnalytics()?.trackEvent(name, params || {});
}
