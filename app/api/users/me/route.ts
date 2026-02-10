import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { withAuth } from '@/lib/auth';

/**
 * GET /api/users/me
 * Returns the current authenticated user's profile
 */
export const GET = withAuth(async (_request: NextRequest, auth) => {
  const supabase = createServerClient();

  const { data: user, error } = await supabase
    .from('users')
    .select(`
      *,
      university:universities(*)
    `)
    .eq('ocid', auth.OCId)
    .single();

  if (error || !user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  return NextResponse.json({ user });
});

/**
 * PATCH /api/users/me
 * Updates the current user's profile
 */
export const PATCH = withAuth(async (request: NextRequest, auth) => {
  const supabase = createServerClient();
  const updates = await request.json();

  // Only allow updating specific fields
  const allowedFields = ['display_name', 'bio', 'avatar_url', 'current_focus', 'has_completed_onboarding'];
  const safeUpdates: Record<string, string | boolean> = {};
  
  for (const field of allowedFields) {
    if (updates[field] !== undefined) {
      safeUpdates[field] = updates[field];
    }
  }

  const { data: user, error } = await supabase
    .from('users')
    .update(safeUpdates)
    .eq('ocid', auth.OCId)
    .select(`
      *,
      university:universities(*)
    `)
    .single();

  if (error) {
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }

  return NextResponse.json({ user });
});
