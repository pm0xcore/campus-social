import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { withAuth } from '@/lib/auth';

/**
 * POST /api/messages/request/[userId]
 * Send a message request to a non-friend at same university
 */
export const POST = withAuth(async (
  _request: NextRequest,
  auth,
  context
) => {
  const supabase = createServerClient();
  const targetUserId = context?.params?.userId as string;

  // Get current user
  const { data: currentUser } = await supabase
    .from('users')
    .select('id, university_id')
    .eq('ocid', auth.OCId)
    .single();

  if (!currentUser) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // Get target user
  const { data: targetUser } = await supabase
    .from('users')
    .select('id, university_id')
    .eq('id', targetUserId)
    .single();

  if (!targetUser) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // Check same university
  if (!currentUser.university_id || currentUser.university_id !== targetUser.university_id) {
    return NextResponse.json({ error: 'Can only request messages from same university' }, { status: 403 });
  }

  // Check if already friends
  const { data: friendship } = await supabase
    .from('friendships')
    .select('status')
    .or(`and(requester_id.eq.${currentUser.id},addressee_id.eq.${targetUserId}),and(requester_id.eq.${targetUserId},addressee_id.eq.${currentUser.id})`)
    .eq('status', 'accepted')
    .single();

  if (friendship) {
    return NextResponse.json({ error: 'Already friends - can message directly' }, { status: 400 });
  }

  // Check existing request
  const { data: existingRequest } = await supabase
    .from('message_requests')
    .select('*')
    .or(`and(sender_id.eq.${currentUser.id},recipient_id.eq.${targetUserId}),and(sender_id.eq.${targetUserId},recipient_id.eq.${currentUser.id})`)
    .single();

  if (existingRequest) {
    return NextResponse.json({ 
      error: 'Request already exists',
      status: existingRequest.status,
    }, { status: 400 });
  }

  // Create request
  const { data: request, error } = await supabase
    .from('message_requests')
    .insert({
      sender_id: currentUser.id,
      recipient_id: targetUserId,
      status: 'pending',
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating message request:', error);
    return NextResponse.json({ error: 'Failed to send request' }, { status: 500 });
  }

  return NextResponse.json({ request }, { status: 201 });
});

/**
 * PATCH /api/messages/request/[userId]
 * Accept or decline a message request
 */
export const PATCH = withAuth(async (
  request: NextRequest,
  auth,
  context
) => {
  const supabase = createServerClient();
  const senderUserId = context?.params?.userId as string;
  const { action } = await request.json();

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

  // Find the request (current user must be recipient)
  const { data: messageRequest } = await supabase
    .from('message_requests')
    .select('*')
    .eq('sender_id', senderUserId)
    .eq('recipient_id', currentUser.id)
    .eq('status', 'pending')
    .single();

  if (!messageRequest) {
    return NextResponse.json({ error: 'Request not found' }, { status: 404 });
  }

  // Update request
  const { error } = await supabase
    .from('message_requests')
    .update({ status: action === 'accept' ? 'accepted' : 'declined' })
    .eq('id', messageRequest.id);

  if (error) {
    console.error('Error updating message request:', error);
    return NextResponse.json({ error: 'Failed to update request' }, { status: 500 });
  }

  return NextResponse.json({ success: true, action });
});
