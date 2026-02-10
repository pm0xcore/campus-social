'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useCurrentUser } from '@/lib/hooks/useCurrentUser';

const ONBOARDING_PATH = '/onboarding';
const REDIRECT_PATH = '/redirect';

/**
 * Guard component that redirects users to onboarding if they haven't completed it
 */
export function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, isAuthenticated } = useCurrentUser();

  useEffect(() => {
    // Don't redirect if:
    // - Still loading
    // - Not authenticated
    // - Already on onboarding page
    // - On redirect page (needed for auth flow)
    if (loading || !isAuthenticated) return;
    if (pathname === ONBOARDING_PATH || pathname === REDIRECT_PATH) return;

    // Redirect to onboarding if user hasn't completed it
    if (user && !user.has_completed_onboarding) {
      router.push(ONBOARDING_PATH);
    }
  }, [user, loading, isAuthenticated, pathname, router]);

  return <>{children}</>;
}
