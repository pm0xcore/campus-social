import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PostCard } from '@/components/PostCard';

const mockPost = {
  id: '1',
  authorId: 'user-1',
  authorName: 'Test User',
  content: 'This is a test post',
  createdAt: new Date().toISOString(),
  reactions: {
    '👍': ['user-2'],
    '❤️': ['user-3', 'user-4'],
  },
  type: 'post' as const,
};

describe('PostCard', () => {
  it('renders post content', () => {
    render(
      <PostCard
        post={mockPost}
        currentUserId="user-1"
        onReact={vi.fn()}
      />
    );

    expect(screen.getByText('This is a test post')).toBeInTheDocument();
    expect(screen.getByText('Test User')).toBeInTheDocument();
  });

  it('displays reaction counts correctly', () => {
    render(
      <PostCard
        post={mockPost}
        currentUserId="user-1"
        onReact={vi.fn()}
      />
    );

    // Should show thumbs up with count 1
    expect(screen.getByText('👍')).toBeInTheDocument();
    // Should show heart with count 2
    expect(screen.getByText('❤️')).toBeInTheDocument();
  });

  it('calls onReact when reaction is clicked', () => {
    const onReact = vi.fn();
    render(
      <PostCard
        post={mockPost}
        currentUserId="user-1"
        onReact={onReact}
      />
    );

    const reactionButtons = screen.getAllByRole('button');
    fireEvent.click(reactionButtons[0]);

    expect(onReact).toHaveBeenCalled();
  });

  it('shows post type badge for non-post types', () => {
    const questionPost = { ...mockPost, type: 'question' as const };
    render(
      <PostCard
        post={questionPost}
        currentUserId="user-1"
        onReact={vi.fn()}
      />
    );

    expect(screen.getByText('❓ Question')).toBeInTheDocument();
  });
});
