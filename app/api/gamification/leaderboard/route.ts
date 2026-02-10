import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import { verifyAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.authenticated || !authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createClient();
    const userId = authResult.user.id;
    
    const { searchParams } = new URL(request.url);
    const scope = searchParams.get('scope') || 'university';
    const timeFrame = searchParams.get('timeFrame') || 'all';

    // Get current user's university
    const { data: currentUser } = await supabase
      .from('users')
      .select('university_id')
      .eq('id', userId)
      .single();

    // Build query
    let query = supabase
      .from('user_stats')
      .select(`
        user_id,
        points,
        level,
        users!inner(
          ocid,
          display_name,
          avatar_url,
          university_id,
          universities(name)
        )
      `)
      .order('points', { ascending: false })
      .limit(100);

    // Apply scope filter
    if (scope === 'university' && currentUser?.university_id) {
      query = query.eq('users.university_id', currentUser.university_id);
    }

    // Execute query
    const { data: entries, error } = await query;

    if (error) {
      console.error('Leaderboard query error:', error);
      return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
    }

    // Transform and add ranks
    const leaderboard = (entries || []).map((entry: any, index: number) => ({
      user_id: entry.user_id,
      ocid: entry.users.ocid,
      display_name: entry.users.display_name,
      avatar_url: entry.users.avatar_url,
      university_name: entry.users.universities?.name || null,
      points: entry.points,
      level: entry.level,
      rank: index + 1,
    }));

    // Find current user's rank
    const userRank = leaderboard.findIndex((e: any) => e.user_id === userId) + 1;
    const userEntry = leaderboard.find((e: any) => e.user_id === userId);
    const nextUser = userRank > 0 && userRank > 1 ? leaderboard[userRank - 2] : null;

    return NextResponse.json({
      entries: leaderboard,
      userRank: userRank > 0 ? userRank : null,
      nextUser,
    });
  } catch (error) {
    console.error('Leaderboard error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
