'use client';

import { useOCAuth } from '@opencampus/ocid-connect-js';

export function UserInfo() {
  const auth = useOCAuth();
  const authState = auth?.authState;

  if (!authState || authState.isLoading) {
    return <p className="text-gray-500">Loading...</p>;
  }

  if (!authState.isAuthenticated) {
    return <p className="text-gray-500">Not logged in</p>;
  }

  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <p className="text-sm text-gray-600">Logged in as:</p>
      <p className="font-mono text-sm break-all">{authState.OCId}</p>
    </div>
  );
}
