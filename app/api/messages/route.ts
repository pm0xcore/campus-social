import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { withAuth } from '@/lib/auth';

/**
 * GET /api/messages
 * Returns conversations (list of users with recent messages)
 */
export const GET = withAuth(async (_request: NextRequest, auth) => {
  const supabase = createServerClient();

  // Get current user
  const { data: currentUser } = await supabase
    .from('users')
    .select('id')
    .eq('ocid', auth.OCId)
    .single();

  if (!currentUser) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // Get all messages involving this user
  const { data: messages } = await supabase
    .from('messages')
    .select(`
      id,
      sender_id,
      recipient_id,
      content,
      read_at,
      created_at
    `)
    .or(`sender_id.eq.${currentUser.id},recipient_id.eq.${currentUser.id}`)
    .order('created_at', { ascending: false });

  // Group by conversation partner
  type Message = {
    id: string;
    sender_id: string;
    recipient_id: string;
    content: string;
    read_at: string | null;
    created_at: string | null;
  };
  
  const conversationsMap = new Map<string, {
    partnerId: string;
    lastMessage: Message;
    unreadCount: number;
  }>();

  for (const msg of (messages || []) as Message[]) {
    const partnerId = msg.sender_id === currentUser.id ? msg.recipient_id : msg.sender_id;
    
    if (!conversationsMap.has(partnerId)) {
      conversationsMap.set(partnerId, {
        partnerId,
        lastMessage: msg,
        unreadCount: 0,
      });
    }

    // Count unread messages sent TO current user
    if (msg.recipient_id === currentUser.id && !msg.read_at) {
      const conv = conversationsMap.get(partnerId)!;
      conv.unreadCount++;
    }
  }

  // Get partner user details
  const partnerIds = Array.from(conversationsMap.keys());
  
  if (partnerIds.length === 0) {
    return NextResponse.json({ conversations: [] });
  }

  const { data: partners } = await supabase
    .from('users')
    .select('id, ocid, display_name, avatar_url')
    .in('id', partnerIds);

  const partnersMap = new Map(partners?.map(p => [p.id, p]) || []);

  const conversations = Array.from(conversationsMap.values())
    .map(conv => ({
      partner: partnersMap.get(conv.partnerId),
      lastMessage: conv.lastMessage,
      unreadCount: conv.unreadCount,
    }))
    .filter(conv => conv.partner)
    .sort((a, b) => 
      new Date(b.lastMessage.created_at || 0).getTime() - new Date(a.lastMessage.created_at || 0).getTime()
    );

  return NextResponse.json({ conversations });
});
