import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock OCAuth (legacy - kept for redirect page)
vi.mock('@opencampus/ocid-connect-js', () => ({
  useOCAuth: () => ({
    authState: {
      isAuthenticated: false,
      isLoading: false,
      OCId: null,
      ethAddress: null,
    },
    ocAuth: {
      signInWithRedirect: vi.fn(),
      getIdToken: vi.fn(),
    },
  }),
  OCConnect: ({ children }: { children: React.ReactNode }) => children,
  LoginCallBack: () => null,
}));

// Mock ochub-utils
vi.mock('@opencampus/ochub-utils', () => ({
  getInstance: () => ({
    getAuthState: () => ({ OCId: null, ethAddress: null }),
    getOCId: () => undefined,
    getEthAddress: () => undefined,
    isAuthenticated: () => false,
    isSDKInitialized: () => true,
    subscribe: () => () => {},
    getIdToken: () => undefined,
    getAccessToken: () => undefined,
  }),
  OCAccount: class {},
  OCAnalytics: {
    initialize: vi.fn(),
    getInstance: () => ({
      trackEvent: vi.fn(),
      setUserId: vi.fn(),
    }),
  },
}));

// Mock auth context
vi.mock('@/lib/auth-context', () => ({
  useAuth: () => ({
    authState: {},
    isAuthenticated: false,
    ocid: undefined,
    ethAddress: undefined,
    isInitialized: true,
  }),
  getAccount: () => ({
    getIdToken: () => undefined,
    getAccessToken: () => undefined,
    isAuthenticated: () => false,
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock environment variables
vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co');
vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'test-anon-key');
