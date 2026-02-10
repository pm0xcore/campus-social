import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// Mock the auth context
const mockUseAuth = vi.fn();

vi.mock('@/lib/auth-context', () => ({
  useAuth: () => mockUseAuth(),
}));

import { SOSButton } from '@/components/SOSButton';

describe('SOSButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns null when not authenticated', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      ocid: undefined,
    });

    const { container } = render(<SOSButton />);
    expect(container.firstChild).toBeNull();
  });

  it('returns null when no ocid', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      ocid: undefined,
    });

    const { container } = render(<SOSButton />);
    expect(container.firstChild).toBeNull();
  });

  it('renders SOS button when authenticated with ocid', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      ocid: 'testuser.edu',
    });

    render(<SOSButton />);
    expect(screen.getByRole('button', { name: 'SOS' })).toBeInTheDocument();
  });

  it('opens modal when SOS button is clicked', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      ocid: 'testuser.edu',
    });

    render(<SOSButton />);
    fireEvent.click(screen.getByRole('button', { name: 'SOS' }));

    // Use heading role to target the h3 specifically
    expect(screen.getByRole('heading', { name: 'Send SOS' })).toBeInTheDocument();
    expect(screen.getByText('testuser.edu')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Describe your emergency...')).toBeInTheDocument();
  });

  it('displays ocid as the sender', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      ocid: 'myocid.edu',
    });

    render(<SOSButton />);
    fireEvent.click(screen.getByRole('button', { name: 'SOS' }));

    expect(screen.getByText('myocid.edu')).toBeInTheDocument();
    expect(screen.getByText('Sending as:')).toBeInTheDocument();
  });

  it('disables submit button when message is empty', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      ocid: 'testuser.edu',
    });

    render(<SOSButton />);
    fireEvent.click(screen.getByRole('button', { name: 'SOS' }));

    const submitButton = screen.getByRole('button', { name: 'Send SOS' });
    expect(submitButton).toBeDisabled();
  });

  it('enables submit button when message is entered', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      ocid: 'testuser.edu',
    });

    render(<SOSButton />);
    fireEvent.click(screen.getByRole('button', { name: 'SOS' }));

    const textarea = screen.getByPlaceholderText('Describe your emergency...');
    fireEvent.change(textarea, { target: { value: 'Help!' } });

    const submitButton = screen.getByRole('button', { name: 'Send SOS' });
    expect(submitButton).not.toBeDisabled();
  });

  it('shows success message after submission', async () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      ocid: 'testuser.edu',
    });

    render(<SOSButton />);
    fireEvent.click(screen.getByRole('button', { name: 'SOS' }));

    const textarea = screen.getByPlaceholderText('Describe your emergency...');
    fireEvent.change(textarea, { target: { value: 'Help me!' } });

    const submitButton = screen.getByRole('button', { name: 'Send SOS' });
    fireEvent.click(submitButton);

    // Wait for the simulated API call
    await waitFor(() => {
      expect(screen.getByText('SOS Sent!')).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('closes modal when close button is clicked', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      ocid: 'testuser.edu',
    });

    render(<SOSButton />);
    fireEvent.click(screen.getByRole('button', { name: 'SOS' }));

    expect(screen.getByRole('heading', { name: 'Send SOS' })).toBeInTheDocument();

    // Find and click the close button (the X icon)
    const closeButtons = screen.getAllByRole('button');
    const closeButton = closeButtons.find(btn => btn.querySelector('svg'));
    if (closeButton) {
      fireEvent.click(closeButton);
    }

    expect(screen.queryByRole('heading', { name: 'Send SOS' })).not.toBeInTheDocument();
  });
});
