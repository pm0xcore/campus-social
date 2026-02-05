'use client';

import { OCConnect } from '@opencampus/ocid-connect-js';
import { ReactNode } from 'react';
import { env } from '@/lib/env';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <OCConnect
      opts={{
        clientId: env.NEXT_PUBLIC_AUTH_CLIENT_ID,
        sameSite: false,
        storageType: 'cookie' as const,
      }}
      sandboxMode={env.NEXT_PUBLIC_AUTH_SANDBOX}
    >
      {children}
    </OCConnect>
  );
}
