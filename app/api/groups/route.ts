import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { withAuth } from '@/lib/auth';

/**
 * GET /api/groups
 * Returns groups the user can access (their university or public)
 */
export const GET = withAuth(async (request: NextRequest, auth) => {
  const supabase = createServerClient();
  const { searchParams } = new URL(request.url);
  const universityOnly = searchParams.get('universityOnly') === 'true';
  const myGroups = searchParams.get('myGroups') === 'true';

  // Get the current user's university
  const { data: currentUser } = await supabase
    .from('users')
    .select('id, university_id')
    .eq('ocid', auth.OCId)
    .single();

  if (!currentUser) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  let query = supabase
    .from('groups')
    .select(`
      *,
      university:universities(*),
      created_by_user:users!groups_created_by_fkey(id, ocid, display_name),
      member_count:group_members(count)
    `)
    .order('created_at', { ascending: false });

  if (universityOnly && currentUser.university_id) {
    // Only groups from user's university
    query = query.eq('university_id', currentUser.university_id);
  } else if (!universityOnly) {
    // Groups with no university gate OR user's university
    query = query.or(
      `university_id.is.null,university_id.eq.${currentUser.university_id}`
    );
  }

  if (myGroups) {
    // Get groups user is a member of
    const { data: memberships } = await supabase
      .from('group_members')
      .select('group_id')
      .eq('user_id', currentUser.id);

    const groupIds = memberships?.map(m => m.group_id) || [];
    if (groupIds.length > 0) {
      query = query.in('id', groupIds);
    } else {
      return NextResponse.json({ groups: [] });
    }
  }

  const { data: groups, error } = await query;

  if (error) {
    console.error('Error fetching groups:', error);
    return NextResponse.json({ error: 'Failed to fetch groups' }, { status: 500 });
  }

  // Check if user is a member of each group
  const { data: userMemberships } = await supabase
    .from('group_members')
    .select('group_id, role')
    .eq('user_id', currentUser.id);

  const membershipMap = new Map(
    userMemberships?.map(m => [m.group_id, m.role]) || []
  );

  const groupsWithMembership = groups?.map(group => ({
    ...group,
    isMember: membershipMap.has(group.id),
    userRole: membershipMap.get(group.id) || null,
  }));

  return NextResponse.json({ groups: groupsWithMembership });
});

/**
 * POST /api/groups
 * Creates a new group
 */
export const POST = withAuth(async (request: NextRequest, auth) => {
  const supabase = createServerClient();
  const body = await request.json();
  const { name, description, type, universityGated } = body;

  if (!name) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
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

  // Create the group
  const { data: group, error } = await supabase
    .from('groups')
    .insert({
      name,
      description: description || null,
      type: type || 'club',
      university_id: universityGated ? currentUser.university_id : null,
      created_by: currentUser.id,
    })
    .select(`
      *,
      university:universities(*)
    `)
    .single();

  if (error) {
    console.error('Error creating group:', error);
    return NextResponse.json({ error: 'Failed to create group' }, { status: 500 });
  }

  // Add creator as owner
  await supabase.from('group_members').insert({
    group_id: group.id,
    user_id: currentUser.id,
    role: 'owner',
  });

  return NextResponse.json({ group }, { status: 201 });
});
