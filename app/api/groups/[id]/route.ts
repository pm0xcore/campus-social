import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { withAuth } from '@/lib/auth';

/**
 * GET /api/groups/[id]
 * Returns a single group with members and posts
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

  // Get the group
  const { data: group, error } = await supabase
    .from('groups')
    .select(`
      *,
      university:universities(*),
      created_by_user:users!groups_created_by_fkey(id, ocid, display_name, avatar_url)
    `)
    .eq('id', groupId)
    .single();

  if (error || !group) {
    return NextResponse.json({ error: 'Group not found' }, { status: 404 });
  }

  // Check university access
  if (group.university_id && group.university_id !== currentUser.university_id) {
    return NextResponse.json({ error: 'Access denied - university restricted' }, { status: 403 });
  }

  // Check if user is a member
  const { data: membership } = await supabase
    .from('group_members')
    .select('role')
    .eq('group_id', groupId)
    .eq('user_id', currentUser.id)
    .single();

  // Get members
  const { data: members } = await supabase
    .from('group_members')
    .select(`
      role,
      joined_at,
      user:users(id, ocid, display_name, avatar_url)
    `)
    .eq('group_id', groupId)
    .order('joined_at', { ascending: true })
    .limit(20);

  // Get member count
  const { count: memberCount } = await supabase
    .from('group_members')
    .select('*', { count: 'exact', head: true })
    .eq('group_id', groupId);

  return NextResponse.json({
    group: {
      ...group,
      isMember: !!membership,
      userRole: membership?.role || null,
      members: members || [],
      memberCount: memberCount || 0,
    },
  });
});
