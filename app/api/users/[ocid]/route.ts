import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { withAuth } from '@/lib/auth';

/**
 * GET /api/users/[ocid]
 * Returns a user's public profile
 */
export const GET = withAuth(async (
  _request: NextRequest,
  auth,
  context
) => {
  const supabase = createServerClient();
  const targetOcid = decodeURIComponent(context?.params?.ocid as string);

  // Get current user
  const { data: currentUser } = await supabase
    .from('users')
    .select('id')
    .eq('ocid', auth.OCId)
    .single();

  // Get target user
  const { data: user, error } = await supabase
    .from('users')
    .select(`
      id,
      ocid,
      display_name,
      bio,
      avatar_url,
      current_focus,
      created_at,
      university:universities(id, name, logo_url)
    `)
    .eq('ocid', targetOcid)
    .single();

  if (error || !user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const isOwnProfile = currentUser?.id === user.id;

  // Check friendship status
  let friendshipStatus = null;
  let friendshipId = null;
  
  if (currentUser && !isOwnProfile) {
    const { data: friendship } = await supabase
      .from('friendships')
      .select('id, status, requester_id')
      .or(`and(requester_id.eq.${currentUser.id},addressee_id.eq.${user.id}),and(requester_id.eq.${user.id},addressee_id.eq.${currentUser.id})`)
      .single();

    if (friendship) {
      friendshipId = friendship.id;
      friendshipStatus = {
        status: friendship.status,
        isRequester: friendship.requester_id === currentUser.id,
      };
    }
  }

  // Get user's post count
  const { count: postCount } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })
    .eq('author_id', user.id);

  // Get total reactions received
  const { data: userPosts } = await supabase
    .from('posts')
    .select('id')
    .eq('author_id', user.id);

  let reactionCount = 0;
  if (userPosts && userPosts.length > 0) {
    const postIds = userPosts.map(p => p.id);
    const { count } = await supabase
      .from('reactions')
      .select('*', { count: 'exact', head: true })
      .in('post_id', postIds);
    reactionCount = count || 0;
  }

  // Get friend count
  const { count: friendCount } = await supabase
    .from('friendships')
    .select('*', { count: 'exact', head: true })
    .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
    .eq('status', 'accepted');

  return NextResponse.json({
    user: {
      ...user,
      isOwnProfile,
      friendshipStatus,
      friendshipId,
      stats: {
        posts: postCount || 0,
        reactions: reactionCount,
        friends: friendCount || 0,
      },
    },
  });
});
