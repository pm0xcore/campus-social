import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// Mock analytics
vi.mock('@/lib/analytics', () => ({
  trackEvent: vi.fn(),
}));

import { CreatePost } from '@/components/CreatePost';
import { trackEvent } from '@/lib/analytics';

describe('CreatePost', () => {
  const defaultProps = {
    authorId: 'testuser.edu',
    onPostCreated: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it('renders the post form', () => {
    render(<CreatePost {...defaultProps} />);
    expect(screen.getByPlaceholderText('Share something with the community...')).toBeInTheDocument();
  });

  it('shows author initial avatar', () => {
    render(<CreatePost {...defaultProps} />);
    expect(screen.getByText('T')).toBeInTheDocument(); // First letter of 'testuser.edu'
  });

  it('expands form when textarea is focused', () => {
    render(<CreatePost {...defaultProps} />);
    
    const textarea = screen.getByPlaceholderText('Share something with the community...');
    fireEvent.focus(textarea);

    // Should show post type buttons (use getAllByRole since there's also a submit Post button)
    expect(screen.getByRole('button', { name: /💬 Post/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Win/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Question/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Resource/ })).toBeInTheDocument();
  });

  it('disables submit button when content is empty', () => {
    render(<CreatePost {...defaultProps} />);
    
    const textarea = screen.getByPlaceholderText('Share something with the community...');
    fireEvent.focus(textarea);

    const submitButton = screen.getByRole('button', { name: 'Post' });
    expect(submitButton).toBeDisabled();
  });

  it('enables submit button when content is entered', () => {
    render(<CreatePost {...defaultProps} />);
    
    const textarea = screen.getByPlaceholderText('Share something with the community...');
    fireEvent.focus(textarea);
    fireEvent.change(textarea, { target: { value: 'Test post content' } });

    const submitButton = screen.getByRole('button', { name: 'Post' });
    expect(submitButton).not.toBeDisabled();
  });

  it('submits post and calls onPostCreated on success', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ ok: true });

    render(<CreatePost {...defaultProps} />);
    
    const textarea = screen.getByPlaceholderText('Share something with the community...');
    fireEvent.focus(textarea);
    fireEvent.change(textarea, { target: { value: 'My test post' } });

    const submitButton = screen.getByRole('button', { name: 'Post' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/posts', expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('My test post'),
      }));
    });

    await waitFor(() => {
      expect(defaultProps.onPostCreated).toHaveBeenCalled();
    });
  });

  it('tracks event on successful post creation', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ ok: true });

    render(<CreatePost {...defaultProps} />);
    
    const textarea = screen.getByPlaceholderText('Share something with the community...');
    fireEvent.focus(textarea);
    fireEvent.change(textarea, { target: { value: 'Track this post' } });

    fireEvent.submit(screen.getByRole('button', { name: 'Post' }).closest('form')!);

    await waitFor(() => {
      expect(trackEvent).toHaveBeenCalledWith('post_created', expect.objectContaining({
        type: 'post',
      }));
    });
  });

  it('allows selecting different post types', () => {
    render(<CreatePost {...defaultProps} />);
    
    const textarea = screen.getByPlaceholderText('Share something with the community...');
    fireEvent.focus(textarea);

    const questionButton = screen.getByRole('button', { name: /Question/ });
    fireEvent.click(questionButton);

    // Button should be selected (has different styling)
    expect(questionButton).toHaveClass('bg-brand-blue');
  });

  it('uses auth token when provided', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ ok: true });
    const getAuthToken = vi.fn().mockReturnValue('test-token');

    render(<CreatePost {...defaultProps} getAuthToken={getAuthToken} />);
    
    const textarea = screen.getByPlaceholderText('Share something with the community...');
    fireEvent.focus(textarea);
    fireEvent.change(textarea, { target: { value: 'Auth test post' } });

    fireEvent.submit(screen.getByRole('button', { name: 'Post' }).closest('form')!);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/posts', expect.objectContaining({
        headers: expect.objectContaining({
          'Authorization': 'Bearer test-token',
        }),
      }));
    });
  });

  it('posts to group endpoint when groupId is provided', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ ok: true });

    render(<CreatePost {...defaultProps} groupId="group-123" />);
    
    const textarea = screen.getByPlaceholderText('Share something with the community...');
    fireEvent.focus(textarea);
    fireEvent.change(textarea, { target: { value: 'Group post' } });

    fireEvent.submit(screen.getByRole('button', { name: 'Post' }).closest('form')!);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/groups/group-123/posts', expect.any(Object));
    });
  });

  it('shows visibility options when showVisibility is true', () => {
    render(<CreatePost {...defaultProps} showVisibility />);
    
    const textarea = screen.getByPlaceholderText('Share something with the community...');
    fireEvent.focus(textarea);

    expect(screen.getByRole('button', { name: /Public/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /University/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Friends/ })).toBeInTheDocument();
  });

  it('hides visibility options for group posts', () => {
    render(<CreatePost {...defaultProps} showVisibility groupId="group-123" />);
    
    const textarea = screen.getByPlaceholderText('Share something with the community...');
    fireEvent.focus(textarea);

    expect(screen.queryByRole('button', { name: /Public/ })).not.toBeInTheDocument();
  });
});
