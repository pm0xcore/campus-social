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

    // Get user stats
    const { data: stats, error } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      // If stats don't exist yet, create them
      if (error.code === 'PGRST116') {
        const { data: newStats, error: insertError } = await supabase
          .from('user_stats')
          .insert({
            user_id: userId,
            points: 0,
            level: 1,
            streak_days: 0,
            last_active_date: new Date().toISOString().split('T')[0],
          })
          .select()
          .single();

        if (insertError) {
          console.error('Error creating stats:', insertError);
          return NextResponse.json({ error: 'Failed to create stats' }, { status: 500 });
        }

        return NextResponse.json({ stats: newStats });
      }

      console.error('Error fetching stats:', error);
      return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
    }

    return NextResponse.json({ stats });
  } catch (error) {
    console.error('Stats fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
