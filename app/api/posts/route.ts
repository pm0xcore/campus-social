import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { withAuth } from '@/lib/auth';

/**
 * GET /api/posts
 * Returns feed posts based on visibility and user's relationships
 */
export const GET = withAuth(async (request: NextRequest, auth) => {
  const supabase = createServerClient();
  const { searchParams } = new URL(request.url);
  const visibility = searchParams.get('visibility');

  // Get current user
  const { data: currentUser } = await supabase
    .from('users')
    .select('id, university_id')
    .eq('ocid', auth.OCId)
    .single();

  if (!currentUser) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // Get user's friends
  const { data: friendships } = await supabase
    .from('friendships')
    .select('requester_id, addressee_id')
    .or(`requester_id.eq.${currentUser.id},addressee_id.eq.${currentUser.id}`)
    .eq('status', 'accepted');

  const friendIds = new Set<string>();
  friendships?.forEach(f => {
    if (f.requester_id === currentUser.id) {
      friendIds.add(f.addressee_id);
    } else {
      friendIds.add(f.requester_id);
    }
  });

  // Build query for visible posts (not in groups)
  let query = supabase
    .from('posts')
    .select(`
      *,
      author:users!posts_author_id_fkey(id, ocid, display_name, avatar_url, university_id)
    `)
    .is('group_id', null)
    .order('created_at', { ascending: false })
    .limit(50);

  // Filter by visibility
  if (visibility) {
    query = query.eq('visibility', visibility);
  }

  const { data: posts, error } = await query;

  if (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }

  // Filter posts based on visibility rules
  const visiblePosts = posts?.filter(post => {
    if (post.visibility === 'public') return true;
    if (post.visibility === 'university') {
      return post.author?.university_id === currentUser.university_id;
    }
    if (post.visibility === 'friends') {
      return post.author_id === currentUser.id || friendIds.has(post.author_id);
    }
    return false;
  });

  // Get reactions for these posts
  const postIds = visiblePosts?.map(p => p.id) || [];
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

  const postsWithReactions = visiblePosts?.map(post => ({
    ...post,
    reactions: reactionsByPost.get(post.id) || {},
  }));

  return NextResponse.json({ posts: postsWithReactions });
});

/**
 * POST /api/posts
 * Creates a new post
 */
export const POST = withAuth(async (request: NextRequest, auth) => {
  const supabase = createServerClient();
  const { content, type, visibility } = await request.json();

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

  // Create post
  const { data: post, error } = await supabase
    .from('posts')
    .insert({
      author_id: currentUser.id,
      content,
      type: type || 'post',
      visibility: visibility || 'public',
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
