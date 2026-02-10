import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { withAuth } from '@/lib/auth';

/**
 * GET /api/friends
 * Returns the user's friends and pending requests
 */
export const GET = withAuth(async (request: NextRequest, auth) => {
  const supabase = createServerClient();
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'all'; // all, pending, sent

  // Get current user
  const { data: currentUser } = await supabase
    .from('users')
    .select('id')
    .eq('ocid', auth.OCId)
    .single();

  if (!currentUser) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  if (type === 'pending') {
    // Requests received (waiting for user to accept)
    const { data: requests } = await supabase
      .from('friendships')
      .select(`
        id,
        created_at,
        requester:users!friendships_requester_id_fkey(id, ocid, display_name, avatar_url, bio)
      `)
      .eq('addressee_id', currentUser.id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    return NextResponse.json({ requests: requests || [] });
  }

  if (type === 'sent') {
    // Requests sent (waiting for others to accept)
    const { data: requests } = await supabase
      .from('friendships')
      .select(`
        id,
        created_at,
        addressee:users!friendships_addressee_id_fkey(id, ocid, display_name, avatar_url, bio)
      `)
      .eq('requester_id', currentUser.id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    return NextResponse.json({ requests: requests || [] });
  }

  // All accepted friends
  const { data: friendships } = await supabase
    .from('friendships')
    .select(`
      id,
      accepted_at,
      requester:users!friendships_requester_id_fkey(id, ocid, display_name, avatar_url, bio, current_focus),
      addressee:users!friendships_addressee_id_fkey(id, ocid, display_name, avatar_url, bio, current_focus)
    `)
    .or(`requester_id.eq.${currentUser.id},addressee_id.eq.${currentUser.id}`)
    .eq('status', 'accepted')
    .order('accepted_at', { ascending: false });

  // Extract the friend (the other person in the friendship)
  const friends = friendships?.map(f => {
    const friend = f.requester.id === currentUser.id ? f.addressee : f.requester;
    return {
      friendshipId: f.id,
      acceptedAt: f.accepted_at,
      ...friend,
    };
  }) || [];

  return NextResponse.json({ friends });
});

/**
 * POST /api/friends
 * Sends a friend request
 */
export const POST = withAuth(async (request: NextRequest, auth) => {
  const supabase = createServerClient();
  const { targetUserId } = await request.json();

  if (!targetUserId) {
    return NextResponse.json({ error: 'targetUserId is required' }, { status: 400 });
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

  if (currentUser.id === targetUserId) {
    return NextResponse.json({ error: 'Cannot friend yourself' }, { status: 400 });
  }

  // Check if friendship already exists (in either direction)
  const { data: existing } = await supabase
    .from('friendships')
    .select('id, status')
    .or(`and(requester_id.eq.${currentUser.id},addressee_id.eq.${targetUserId}),and(requester_id.eq.${targetUserId},addressee_id.eq.${currentUser.id})`)
    .single();

  if (existing) {
    if (existing.status === 'accepted') {
      return NextResponse.json({ error: 'Already friends' }, { status: 400 });
    }
    if (existing.status === 'pending') {
      return NextResponse.json({ error: 'Request already pending' }, { status: 400 });
    }
  }

  // Create friend request
  const { data: friendship, error } = await supabase
    .from('friendships')
    .insert({
      requester_id: currentUser.id,
      addressee_id: targetUserId,
      status: 'pending',
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating friend request:', error);
    return NextResponse.json({ error: 'Failed to send request' }, { status: 500 });
  }

  return NextResponse.json({ friendship }, { status: 201 });
});
