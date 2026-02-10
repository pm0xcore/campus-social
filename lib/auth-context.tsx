'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getInstance, type AuthState } from '@opencampus/ochub-utils';
import { env } from '@/lib/env';

interface AuthContextValue {
  authState: AuthState;
  isAuthenticated: boolean;
  ocid: string | undefined;
  ethAddress: string | undefined;
  isInitialized: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// Initialize OCAccount singleton once
let accountInstance: ReturnType<typeof getInstance> | null = null;

function getAccount() {
  if (typeof window === 'undefined') return null;
  
  if (!accountInstance) {
    accountInstance = getInstance({
      opts: {
        clientId: env.NEXT_PUBLIC_AUTH_CLIENT_ID,
        redirectUri: typeof window !== 'undefined' 
          ? `${window.location.origin}/redirect`
          : 'http://localhost:3000/redirect',
      },
      sandboxMode: env.NEXT_PUBLIC_AUTH_SANDBOX,
    });
  }
  return accountInstance;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({});
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const account = getAccount();
    if (!account) return;

    // Get initial state
    setAuthState(account.getAuthState());
    setIsInitialized(account.isSDKInitialized());

    // Subscribe to auth state changes
    const unsubscribe = account.subscribe((newState) => {
      setAuthState(newState);
      setIsInitialized(true);
    });

    // Check initialization periodically until ready
    const checkInit = setInterval(() => {
      if (account.isSDKInitialized()) {
        setIsInitialized(true);
        setAuthState(account.getAuthState());
        clearInterval(checkInit);
      }
    }, 100);

    return () => {
      unsubscribe();
      clearInterval(checkInit);
    };
  }, []);

  const value: AuthContextValue = {
    authState,
    isAuthenticated: !!authState.OCId,
    ocid: authState.OCId,
    ethAddress: authState.ethAddress,
    isInitialized,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  // Return default values during SSR or if context not available
  if (!context) {
    return {
      authState: {},
      isAuthenticated: false,
      ocid: undefined,
      ethAddress: undefined,
      isInitialized: false,
    };
  }
  return context;
}

// Export the account getter for direct access when needed
export { getAccount };
