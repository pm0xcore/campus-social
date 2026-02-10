import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { withAuth } from '@/lib/auth';

/**
 * PATCH /api/friends/[id]
 * Accept or decline a friend request
 */
export const PATCH = withAuth(async (
  request: NextRequest,
  auth,
  context
) => {
  const supabase = createServerClient();
  const friendshipId = context?.params?.id as string;
  const { action } = await request.json(); // 'accept' or 'decline'

  if (!['accept', 'decline'].includes(action)) {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
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

  // Get the friendship
  const { data: friendship } = await supabase
    .from('friendships')
    .select('*')
    .eq('id', friendshipId)
    .single();

  if (!friendship) {
    return NextResponse.json({ error: 'Request not found' }, { status: 404 });
  }

  // Only the addressee can accept/decline
  if (friendship.addressee_id !== currentUser.id) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }

  if (friendship.status !== 'pending') {
    return NextResponse.json({ error: 'Request already processed' }, { status: 400 });
  }

  // Update the friendship
  const updates = action === 'accept'
    ? { status: 'accepted', accepted_at: new Date().toISOString() }
    : { status: 'declined' };

  const { error } = await supabase
    .from('friendships')
    .update(updates)
    .eq('id', friendshipId);

  if (error) {
    console.error('Error updating friendship:', error);
    return NextResponse.json({ error: 'Failed to update request' }, { status: 500 });
  }

  return NextResponse.json({ success: true, action });
});

/**
 * DELETE /api/friends/[id]
 * Remove a friend or cancel a request
 */
export const DELETE = withAuth(async (
  _request: NextRequest,
  auth,
  context
) => {
  const supabase = createServerClient();
  const friendshipId = context?.params?.id as string;

  // Get current user
  const { data: currentUser } = await supabase
    .from('users')
    .select('id')
    .eq('ocid', auth.OCId)
    .single();

  if (!currentUser) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // Get the friendship
  const { data: friendship } = await supabase
    .from('friendships')
    .select('*')
    .eq('id', friendshipId)
    .single();

  if (!friendship) {
    return NextResponse.json({ error: 'Friendship not found' }, { status: 404 });
  }

  // Check if user is part of this friendship
  if (friendship.requester_id !== currentUser.id && friendship.addressee_id !== currentUser.id) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }

  // Delete the friendship
  const { error } = await supabase
    .from('friendships')
    .delete()
    .eq('id', friendshipId);

  if (error) {
    console.error('Error deleting friendship:', error);
    return NextResponse.json({ error: 'Failed to remove friend' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
});
