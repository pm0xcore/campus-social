'use client';

import { useCurrentUser } from '@/lib/hooks/useCurrentUser';
import { getAccount } from '@/lib/auth-context';
import { UniversityBadge } from './UniversityBadge';

export function UserInfo() {
  const { user, loading, isAuthenticated } = useCurrentUser();

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

  if (loading) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
        <div className="h-5 bg-gray-200 rounded w-48" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg">
        <p className="text-gray-500 mb-2">Not logged in</p>
        <button
          onClick={handleLogin}
          className="w-full px-4 py-2 bg-brand-blue text-white rounded-lg font-medium hover:bg-brand-blue/90 transition-colors"
        >
          Login with OCID
        </button>
      </div>
    );
  }

  return (
    <a href={`/profile/${user.ocid}`} className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-brand-blue/10 flex items-center justify-center">
          {user.avatar_url ? (
            <img src={user.avatar_url} alt="" className="w-12 h-12 rounded-full object-cover" />
          ) : (
            <span className="text-brand-blue font-semibold text-lg">
              {(user.display_name || user.ocid).charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 truncate">
            {user.display_name || user.ocid}
          </p>
          {user.university ? (
            <UniversityBadge university={user.university} size="sm" />
          ) : (
            <p className="text-xs text-gray-500">No university verified</p>
          )}
        </div>
        <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </a>
  );
}
