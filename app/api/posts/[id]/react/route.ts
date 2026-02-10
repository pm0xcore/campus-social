import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { withAuth } from '@/lib/auth';

/**
 * POST /api/posts/[id]/react
 * Toggles a reaction on a post
 */
export const POST = withAuth(async (
  request: NextRequest,
  auth,
  context
) => {
  const supabase = createServerClient();
  const postId = context?.params?.id as string;
  const { emoji } = await request.json();

  if (!emoji) {
    return NextResponse.json({ error: 'emoji is required' }, { status: 400 });
  }

  // Get current user
  const { data: currentUser } = await supabase
    .from('users')
    .select('id')
    .eq('ocid', auth.OCId)
    .single();

  if (!currentUser) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // Check if reaction already exists
  const { data: existingReaction } = await supabase
    .from('reactions')
    .select('*')
    .eq('post_id', postId)
    .eq('user_id', currentUser.id)
    .eq('emoji', emoji)
    .single();

  if (existingReaction) {
    // Remove reaction
    await supabase
      .from('reactions')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', currentUser.id)
      .eq('emoji', emoji);
  } else {
    // Add reaction
    await supabase
      .from('reactions')
      .insert({
        post_id: postId,
        user_id: currentUser.id,
        emoji,
      });
  }

  // Get updated reactions for this post
  const { data: reactions } = await supabase
    .from('reactions')
    .select('emoji, user_id')
    .eq('post_id', postId);

  // Group reactions by emoji
  const reactionsByEmoji: Record<string, string[]> = {};
  for (const reaction of reactions || []) {
    if (!reactionsByEmoji[reaction.emoji]) {
      reactionsByEmoji[reaction.emoji] = [];
    }
    reactionsByEmoji[reaction.emoji].push(reaction.user_id);
  }

  return NextResponse.json({
    post: {
      id: postId,
      reactions: reactionsByEmoji,
    },
  });
});
