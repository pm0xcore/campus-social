import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { withAuth } from '@/lib/auth';

/**
 * GET /api/messages/[userId]
 * Returns messages between current user and target user
 */
export const GET = withAuth(async (
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

  // Check if they can message (friends or same university with accepted request)
  const { data: friendship } = await supabase
    .from('friendships')
    .select('status')
    .or(`and(requester_id.eq.${currentUser.id},addressee_id.eq.${targetUserId}),and(requester_id.eq.${targetUserId},addressee_id.eq.${currentUser.id})`)
    .eq('status', 'accepted')
    .single();

  // Get target user
  const { data: targetUser } = await supabase
    .from('users')
    .select('id, ocid, display_name, avatar_url, university_id')
    .eq('id', targetUserId)
    .single();

  if (!targetUser) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const isFriend = !!friendship;
  const sameUniversity = currentUser.university_id && 
    currentUser.university_id === targetUser.university_id;

  // Check message request status if not friends
  let messageRequestStatus = null;
  if (!isFriend && sameUniversity) {
    const { data: request } = await supabase
      .from('message_requests')
      .select('status, sender_id')
      .or(`and(sender_id.eq.${currentUser.id},recipient_id.eq.${targetUserId}),and(sender_id.eq.${targetUserId},recipient_id.eq.${currentUser.id})`)
      .single();

    if (request) {
      messageRequestStatus = {
        status: request.status,
        isSender: request.sender_id === currentUser.id,
      };
    }
  }

  const canMessage = isFriend || messageRequestStatus?.status === 'accepted';

  // Get messages if allowed
  let messages: unknown[] = [];
  if (canMessage) {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${currentUser.id},recipient_id.eq.${targetUserId}),and(sender_id.eq.${targetUserId},recipient_id.eq.${currentUser.id})`)
      .order('created_at', { ascending: true })
      .limit(100);

    messages = data || [];

    // Mark messages as read
    await supabase
      .from('messages')
      .update({ read_at: new Date().toISOString() })
      .eq('sender_id', targetUserId)
      .eq('recipient_id', currentUser.id)
      .is('read_at', null);
  }

  return NextResponse.json({
    partner: targetUser,
    messages,
    canMessage,
    isFriend,
    sameUniversity,
    messageRequestStatus,
  });
});

/**
 * POST /api/messages/[userId]
 * Send a message to a user
 */
export const POST = withAuth(async (
  request: NextRequest,
  auth,
  context
) => {
  const supabase = createServerClient();
  const targetUserId = context?.params?.userId as string;
  const { content } = await request.json();

  if (!content?.trim()) {
    return NextResponse.json({ error: 'Content is required' }, { status: 400 });
  }

  // Get current user
  const { data: currentUser } = await supabase
    .from('users')
    .select('id, university_id')
    .eq('ocid', auth.OCId)
    .single();

  if (!currentUser) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // Check if they can message
  const { data: friendship } = await supabase
    .from('friendships')
    .select('status')
    .or(`and(requester_id.eq.${currentUser.id},addressee_id.eq.${targetUserId}),and(requester_id.eq.${targetUserId},addressee_id.eq.${currentUser.id})`)
    .eq('status', 'accepted')
    .single();

  const isFriend = !!friendship;

  if (!isFriend) {
    // Check message request
    const { data: request } = await supabase
      .from('message_requests')
      .select('status')
      .or(`and(sender_id.eq.${currentUser.id},recipient_id.eq.${targetUserId}),and(sender_id.eq.${targetUserId},recipient_id.eq.${currentUser.id})`)
      .eq('status', 'accepted')
      .single();

    if (!request) {
      return NextResponse.json({ error: 'Cannot message this user' }, { status: 403 });
    }
  }

  // Send message
  const { data: message, error } = await supabase
    .from('messages')
    .insert({
      sender_id: currentUser.id,
      recipient_id: targetUserId,
      content: content.trim(),
    })
    .select()
    .single();

  if (error) {
    console.error('Error sending message:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }

  return NextResponse.json({ message }, { status: 201 });
});
