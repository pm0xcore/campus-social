'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAccount } from '@/lib/auth-context';

function LoadingComponent() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-brand-blue border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Completing login...</p>
      </div>
    </div>
  );
}

function ErrorComponent({ error }: { error?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center p-6 bg-red-50 rounded-lg max-w-md">
        <p className="text-red-600 font-medium mb-2">Login Failed</p>
        <p className="text-gray-600 text-sm mb-4">
          {error || 'There was an error completing your login. Please try again.'}
        </p>
        <a
          href="/"
          className="inline-block px-4 py-2 bg-brand-blue text-white rounded-lg"
        >
          Go Home
        </a>
      </div>
    </div>
  );
}

export default function RedirectPage() {
  const router = useRouter();
  const [error, setError] = useState<string>();

  useEffect(() => {
    const handleRedirect = async () => {
      try {
        const account = getAccount();
        if (!account) {
          setError('Authentication system not initialized');
          return;
        }

        // Get the underlying OCID Connect SDK instance
        // The SDK will handle the OAuth redirect callback automatically
        // and update the auth state, which will trigger our auth context subscription
        
        // Wait a moment for the SDK to process the redirect
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Check if authentication succeeded
        if (account.isAuthenticated()) {
          router.push('/');
        } else {
          setError('Authentication did not complete successfully');
        }
      } catch (err) {
        console.error('Redirect error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      }
    };

    handleRedirect();
  }, [router]);

  if (error) {
    return <ErrorComponent error={error} />;
  }

  return <LoadingComponent />;
}
