'use client';

import { ReactNode } from 'react';
import { OCConnect } from '@opencampus/ocid-connect-js';
import { AuthProvider } from '@/lib/auth-context';
import { env } from '@/lib/env';

export function Providers({ children }: { children: ReactNode }) {
  const redirectUri = typeof window !== 'undefined' 
    ? `${window.location.origin}/redirect`
    : 'http://localhost:3000/redirect';

  return (
    <OCConnect
      opts={{
        clientId: env.NEXT_PUBLIC_AUTH_CLIENT_ID,
        redirectUri,
        sameSite: false,
        storageType: 'cookie' as const,
      }}
      sandboxMode={env.NEXT_PUBLIC_AUTH_SANDBOX}
    >
      <AuthProvider>{children}</AuthProvider>
    </OCConnect>
  );
}
