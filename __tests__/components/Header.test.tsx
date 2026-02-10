import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

// Mock the auth context
const mockUseAuth = vi.fn();
const mockGetAccount = vi.fn();

vi.mock('@/lib/auth-context', () => ({
  useAuth: () => mockUseAuth(),
  getAccount: () => mockGetAccount(),
}));

import { Header } from '@/components/Header';

describe('Header', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the app title', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      ocid: undefined,
      isInitialized: true,
    });

    render(<Header />);
    expect(screen.getByText('Campus Social')).toBeInTheDocument();
  });

  it('shows loading state when not initialized', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      ocid: undefined,
      isInitialized: false,
    });

    render(<Header />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('shows login button when not authenticated', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      ocid: undefined,
      isInitialized: true,
    });

    render(<Header />);
    expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
  });

  it('shows OCID when authenticated', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      ocid: 'testuser.edu',
      isInitialized: true,
    });

    render(<Header />);
    expect(screen.getByText('testuser.edu')).toBeInTheDocument();
    expect(screen.getByText('Logged in as:')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Login' })).not.toBeInTheDocument();
  });

  it('calls signInWithRedirect when login button is clicked', async () => {
    const mockSignInWithRedirect = vi.fn();
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      ocid: undefined,
      isInitialized: true,
    });
    mockGetAccount.mockReturnValue({
      getSDKInstance: () => ({
        signInWithRedirect: mockSignInWithRedirect,
      }),
    });

    render(<Header />);
    const loginButton = screen.getByRole('button', { name: 'Login' });
    await fireEvent.click(loginButton);

    expect(mockSignInWithRedirect).toHaveBeenCalledWith({ state: 'campus-social' });
  });

  it('handles login error gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      ocid: undefined,
      isInitialized: true,
    });
    mockGetAccount.mockReturnValue({
      getSDKInstance: () => ({
        signInWithRedirect: vi.fn().mockRejectedValue(new Error('Login failed')),
      }),
    });

    render(<Header />);
    const loginButton = screen.getByRole('button', { name: 'Login' });
    await fireEvent.click(loginButton);

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
