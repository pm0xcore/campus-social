import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import { verifyAuth } from '@/lib/auth';
import { generateDailyChallenges } from '@/lib/gamification';

export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.authenticated || !authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createClient();
    const userId = authResult.user.id;
    const today = new Date().toISOString().split('T')[0];

    // Get or create today's challenges
    let { data: existingChallenges } = await supabase
      .from('daily_challenges')
      .select('*')
      .eq('date', today);

    // If no challenges exist for today, generate them
    if (!existingChallenges || existingChallenges.length === 0) {
      const templates = generateDailyChallenges(new Date());
      const challengesToInsert = templates.map(t => ({
        date: today,
        challenge_type: t.type,
        description: t.description,
        points: t.points,
      }));

      const { data: newChallenges } = await supabase
        .from('daily_challenges')
        .insert(challengesToInsert)
        .select();

      existingChallenges = newChallenges || [];
    }

    // Get user's progress on these challenges
    const challengeIds = existingChallenges.map(c => c.id);
    const { data: userProgress } = await supabase
      .from('user_challenge_progress')
      .select('challenge_id, completed')
      .eq('user_id', userId)
      .in('challenge_id', challengeIds);

    const progressMap = new Map(
      (userProgress || []).map((p: { challenge_id: string; completed: boolean | null }) => [p.challenge_id, p.completed || false])
    );

    // Combine challenges with user progress
    const challenges = existingChallenges.map((c: any) => ({
      ...c,
      completed: progressMap.get(c.id) || false,
    }));

    return NextResponse.json({ challenges });
  } catch (error) {
    console.error('Daily challenges error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
