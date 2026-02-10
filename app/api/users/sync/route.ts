import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

/**
 * POST /api/users/sync
 * Syncs a user from OCID to Supabase on login
 * Creates the user if they don't exist, updates last_seen if they do
 */
export async function POST(request: NextRequest) {
  try {
    const { ocid, ethAddress } = await request.json();

    if (!ocid) {
      return NextResponse.json({ error: 'OCID is required' }, { status: 400 });
    }

    const supabase = createServerClient();

    // Check if user exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('ocid', ocid)
      .single();

    if (existingUser) {
      // Update last_seen and eth_address if changed
      const { data: updatedUser, error } = await supabase
        .from('users')
        .update({
          last_seen_at: new Date().toISOString(),
          eth_address: ethAddress || existingUser.eth_address,
        })
        .eq('ocid', ocid)
        .select(`
          *,
          university:universities(*)
        `)
        .single();

      if (error) throw error;

      return NextResponse.json({ user: updatedUser, created: false });
    }

    // Create new user
    const displayName = ocid.split('.')[0] || ocid;
    
    // For demo/testing: Auto-assign to test university if it exists
    // In production, users would verify their university separately
    const { data: testUniv } = await supabase
      .from('universities')
      .select('id')
      .eq('id', 'test-univ-1')
      .single();
    
    const { data: newUser, error } = await supabase
      .from('users')
      .insert({
        ocid,
        eth_address: ethAddress,
        display_name: displayName,
        university_id: testUniv?.id || null, // Auto-assign to test university
      })
      .select(`
        *,
        university:universities(*)
      `)
      .single();

    if (error) throw error;

    return NextResponse.json({ user: newUser, created: true });
  } catch (error) {
    console.error('User sync error:', error);
    return NextResponse.json(
      { error: 'Failed to sync user' },
      { status: 500 }
    );
  }
}
