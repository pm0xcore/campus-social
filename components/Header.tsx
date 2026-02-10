'use client';

import { useAuth, getAccount } from '@/lib/auth-context';
import { NotificationBell } from './NotificationBell';
import { usePathname } from 'next/navigation';

export function Header() {
  const { isAuthenticated, ocid, isInitialized } = useAuth();
  const pathname = usePathname();

  // Don't show header on onboarding
  if (pathname?.startsWith('/onboarding')) {
    return null;
  }

  const handleLogin = async () => {
    try {
      const account = getAccount();
      const sdk = account?.getSDKInstance?.();
      if (sdk?.signInWithRedirect) {
        await sdk.signInWithRedirect({ state: 'campus-social' });
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const handleLogout = async () => {
    try {
      const account = getAccount();
      const sdk = account?.getSDKInstance?.();
      if (sdk?.logout) {
        // logout() accepts returnUrl to redirect after logout
        await sdk.logout({ returnUrl: window.location.origin });
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-white border-b border-gray-200 z-50">
      <div className="max-w-2xl mx-auto h-full px-4 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2">
          <span className="text-2xl">🎓</span>
          <h1 className="text-lg font-semibold text-gray-900 hidden sm:inline">Campus Social</h1>
        </a>
        
        <div className="flex items-center gap-3">
          {!isInitialized ? (
            <span className="text-sm text-gray-400">Loading...</span>
          ) : isAuthenticated && ocid ? (
            <>
              <NotificationBell />
              <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded text-gray-700 max-w-[150px] truncate">
                {ocid}
              </span>
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-lg font-medium hover:bg-gray-200 transition-colors"
                title="Logout"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </>
          ) : (
            <button
              onClick={handleLogin}
              className="px-3 py-1.5 bg-brand-blue text-white text-sm rounded-lg font-medium hover:bg-brand-blue/90 transition-colors"
            >
              Login
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
