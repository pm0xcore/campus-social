import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { withAuth } from '@/lib/auth';

/**
 * POST /api/groups/[id]/join
 * Joins a group
 */
export const POST = withAuth(async (
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
  const { data: group } = await supabase
    .from('groups')
    .select('id, university_id')
    .eq('id', groupId)
    .single();

  if (!group) {
    return NextResponse.json({ error: 'Group not found' }, { status: 404 });
  }

  // Check university access
  if (group.university_id && group.university_id !== currentUser.university_id) {
    return NextResponse.json({ error: 'Access denied - university restricted' }, { status: 403 });
  }

  // Check if already a member
  const { data: existingMembership } = await supabase
    .from('group_members')
    .select('group_id')
    .eq('group_id', groupId)
    .eq('user_id', currentUser.id)
    .single();

  if (existingMembership) {
    return NextResponse.json({ error: 'Already a member' }, { status: 400 });
  }

  // Join the group
  const { error } = await supabase.from('group_members').insert({
    group_id: groupId,
    user_id: currentUser.id,
    role: 'member',
  });

  if (error) {
    console.error('Error joining group:', error);
    return NextResponse.json({ error: 'Failed to join group' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
});

/**
 * DELETE /api/groups/[id]/join
 * Leaves a group
 */
export const DELETE = withAuth(async (
  _request: NextRequest,
  auth,
  context
) => {
  const supabase = createServerClient();
  const groupId = context?.params?.id as string;

  // Get current user
  const { data: currentUser } = await supabase
    .from('users')
    .select('id')
    .eq('ocid', auth.OCId)
    .single();

  if (!currentUser) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // Check if user is the owner
  const { data: membership } = await supabase
    .from('group_members')
    .select('role')
    .eq('group_id', groupId)
    .eq('user_id', currentUser.id)
    .single();

  if (membership?.role === 'owner') {
    return NextResponse.json({ error: 'Owners cannot leave their group' }, { status: 400 });
  }

  // Leave the group
  const { error } = await supabase
    .from('group_members')
    .delete()
    .eq('group_id', groupId)
    .eq('user_id', currentUser.id);

  if (error) {
    console.error('Error leaving group:', error);
    return NextResponse.json({ error: 'Failed to leave group' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
});
