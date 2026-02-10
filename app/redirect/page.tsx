'use client';

import { LoginCallBack } from '@opencampus/ocid-connect-js';
import { useRouter } from 'next/navigation';

function CustomLoadingComponent() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-brand-blue border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Completing login...</p>
      </div>
    </div>
  );
}

function CustomErrorComponent() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center p-6 bg-red-50 rounded-lg max-w-md">
        <p className="text-red-600 font-medium mb-2">Login Failed</p>
        <p className="text-gray-600 text-sm mb-4">
          There was an error completing your login. Please try again.
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

  const handleSuccess = () => {
    // Give the auth context time to update from the subscription
    setTimeout(() => {
      router.push('/');
    }, 500);
  };

  const handleError = (error: Error) => {
    console.error('Login error:', error);
  };

  return (
    <LoginCallBack
      successCallback={handleSuccess}
      errorCallback={handleError}
      customLoadingComponent={CustomLoadingComponent}
      customErrorComponent={CustomErrorComponent}
    />
  );
}
