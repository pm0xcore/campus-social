'use client';

import { useAuth, getAccount } from '@/lib/auth-context';

export function Header() {
  const { isAuthenticated, ocid, isInitialized } = useAuth();

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

  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-white border-b border-gray-200 z-50">
      <div className="max-w-2xl mx-auto h-full px-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-900">Campus Social</h1>
        
        <div className="flex items-center gap-2">
          {!isInitialized ? (
            <span className="text-sm text-gray-400">Loading...</span>
          ) : isAuthenticated && ocid ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 hidden sm:inline">Logged in as:</span>
              <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded text-gray-700 max-w-[150px] truncate">
                {ocid}
              </span>
            </div>
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
