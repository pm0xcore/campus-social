import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { withAuth } from '@/lib/auth';

/**
 * GET /api/users/discover
 * Returns users at the same university who aren't already friends
 */
export const GET = withAuth(async (request: NextRequest, auth) => {
  const supabase = createServerClient();
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || '';

  // Get current user
  const { data: currentUser } = await supabase
    .from('users')
    .select('id, university_id')
    .eq('ocid', auth.OCId)
    .single();

  if (!currentUser) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  if (!currentUser.university_id) {
    return NextResponse.json({
      users: [],
      message: 'Verify your university to discover classmates',
    });
  }

  // Get user's existing friends and pending requests
  const { data: friendships } = await supabase
    .from('friendships')
    .select('requester_id, addressee_id')
    .or(`requester_id.eq.${currentUser.id},addressee_id.eq.${currentUser.id}`);

  const connectedIds = new Set<string>();
  connectedIds.add(currentUser.id); // Exclude self
  friendships?.forEach(f => {
    connectedIds.add(f.requester_id);
    connectedIds.add(f.addressee_id);
  });

  // Find users at the same university
  let query = supabase
    .from('users')
    .select('id, ocid, display_name, avatar_url, bio, current_focus')
    .eq('university_id', currentUser.university_id)
    .order('last_seen_at', { ascending: false })
    .limit(50);

  // Search filter
  if (search) {
    query = query.or(`display_name.ilike.%${search}%,ocid.ilike.%${search}%,bio.ilike.%${search}%`);
  }

  const { data: users, error } = await query;

  if (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }

  // Filter out already connected users
  const discoverableUsers = users?.filter(u => !connectedIds.has(u.id)) || [];

  return NextResponse.json({ users: discoverableUsers });
});
