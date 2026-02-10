import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { withAuth } from '@/lib/auth';

/**
 * GET /api/groups/[id]/posts
 * Returns posts in a group
 */
export const GET = withAuth(async (
  _request: NextRequest,
  auth,
  context
) => {
  const supabase = createServerClient();
  const groupId = context?.params?.id as string;

  // Get current user
  const { data: currentUser } = await supabase
    .from('users')
    .select('id, university_id')
    .eq('ocid', auth.OCId)
    .single();

  if (!currentUser) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // Check if user is a member
  const { data: membership } = await supabase
    .from('group_members')
    .select('group_id')
    .eq('group_id', groupId)
    .eq('user_id', currentUser.id)
    .single();

  if (!membership) {
    return NextResponse.json({ error: 'Not a member of this group' }, { status: 403 });
  }

  // Get posts
  const { data: posts, error } = await supabase
    .from('posts')
    .select(`
      *,
      author:users!posts_author_id_fkey(id, ocid, display_name, avatar_url)
    `)
    .eq('group_id', groupId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('Error fetching group posts:', error);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }

  // Get reactions for these posts
  const postIds = posts?.map(p => p.id) || [];
  const { data: reactions } = await supabase
    .from('reactions')
    .select('post_id, emoji, user_id')
    .in('post_id', postIds);

  // Group reactions by post
  const reactionsByPost = new Map<string, Record<string, string[]>>();
  for (const reaction of reactions || []) {
    if (!reactionsByPost.has(reaction.post_id)) {
      reactionsByPost.set(reaction.post_id, {});
    }
    const postReactions = reactionsByPost.get(reaction.post_id)!;
    if (!postReactions[reaction.emoji]) {
      postReactions[reaction.emoji] = [];
    }
    postReactions[reaction.emoji].push(reaction.user_id);
  }

  const postsWithReactions = posts?.map(post => ({
    ...post,
    reactions: reactionsByPost.get(post.id) || {},
  }));

  return NextResponse.json({ posts: postsWithReactions });
});

/**
 * POST /api/groups/[id]/posts
 * Creates a post in a group
 */
export const POST = withAuth(async (
  request: NextRequest,
  auth,
  context
) => {
  const supabase = createServerClient();
  const groupId = context?.params?.id as string;
  const { content, type } = await request.json();

  if (!content) {
    return NextResponse.json({ error: 'Content is required' }, { status: 400 });
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

  // Check if user is a member
  const { data: membership } = await supabase
    .from('group_members')
    .select('group_id')
    .eq('group_id', groupId)
    .eq('user_id', currentUser.id)
    .single();

  if (!membership) {
    return NextResponse.json({ error: 'Not a member of this group' }, { status: 403 });
  }

  // Create the post
  const { data: post, error } = await supabase
    .from('posts')
    .insert({
      author_id: currentUser.id,
      content,
      type: type || 'post',
      group_id: groupId,
      visibility: 'group',
    })
    .select(`
      *,
      author:users!posts_author_id_fkey(id, ocid, display_name, avatar_url)
    `)
    .single();

  if (error) {
    console.error('Error creating post:', error);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }

  return NextResponse.json({ post: { ...post, reactions: {} } }, { status: 201 });
});
