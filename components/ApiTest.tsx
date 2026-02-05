'use client';

import { useOCAuth } from '@opencampus/ocid-connect-js';
import { useState } from 'react';

interface ApiResponse {
  OCId?: string;
  ethAddress?: string;
  error?: string;
}

export function ApiTest() {
  const auth = useOCAuth();
  const authState = auth?.authState;
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const testApi = async () => {
    setLoading(true);
    setResponse(null);

    try {
      const idToken = auth.ocAuth?.getIdToken?.();
      const res = await fetch('/api/me', {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });
      setResponse(await res.json());
    } catch (error) {
      setResponse({ error: String(error) });
    } finally {
      setLoading(false);
    }
  };

  if (!authState || authState.isLoading) {
    return <p className="text-gray-500">Loading...</p>;
  }

  if (!authState.isAuthenticated) {
    return <p className="text-gray-500">Login to test the API</p>;
  }

  return (
    <div className="space-y-4">
      <button
        onClick={testApi}
        disabled={loading}
        className="px-4 py-2 bg-brand-blue hover:opacity-90 text-white rounded-lg transition-opacity disabled:opacity-50"
      >
        {loading ? 'Loading...' : 'Test GET /api/me'}
      </button>

      {response && (
        <pre className="p-4 bg-gray-100 rounded text-sm overflow-auto">
          {JSON.stringify(response, null, 2)}
        </pre>
      )}
    </div>
  );
}
