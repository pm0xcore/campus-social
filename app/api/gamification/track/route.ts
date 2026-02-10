import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import { verifyAuth } from '@/lib/auth';
import { 
  POINTS, 
  calculateLevel, 
  checkAchievementUnlocks, 
  calculateStreak,
  isValidPointEvent,
  type GamificationResult,
  type Achievement,
  type UserStats,
} from '@/lib/gamification';

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (!authResult.authenticated || !authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { event, metadata } = await request.json();

    if (!event || !isValidPointEvent(event)) {
      return NextResponse.json({ error: 'Invalid event type' }, { status: 400 });
    }

    const supabase = createClient();
    const userId = authResult.user.id;

    // Get current user stats
    const { data: currentStats, error: statsError } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (statsError) {
      console.error('Error fetching user stats:', statsError);
      return NextResponse.json({ error: 'Failed to fetch user stats' }, { status: 500 });
    }

    const stats = currentStats as UserStats;

    // Calculate points to award
    const pointsToAward = POINTS[event];
    const newPoints = stats.points + pointsToAward;
    const currentLevel = stats.level;
    const newLevel = calculateLevel(newPoints);
    const leveledUp = newLevel > currentLevel;

    // Check streak status
    const streakInfo = calculateStreak(stats.last_active_date, new Date());
    let newStreak = stats.streak_days;
    let streakUpdated = false;

    if (event === 'DAILY_LOGIN') {
      if (streakInfo.shouldIncrement) {
        newStreak = stats.streak_days + 1;
        streakUpdated = true;
      } else if (streakInfo.shouldReset) {
        newStreak = 1;
        streakUpdated = true;
      }
    }

    // Update user stats
    const { error: updateError } = await supabase
      .from('user_stats')
      .update({
        points: newPoints,
        level: newLevel,
        streak_days: newStreak,
        last_active_date: new Date().toISOString().split('T')[0],
      })
      .eq('user_id', userId);

    if (updateError) {
      console.error('Error updating user stats:', updateError);
      return NextResponse.json({ error: 'Failed to update stats' }, { status: 500 });
    }

    // Check for achievement unlocks
    const { data: allAchievements } = await supabase
      .from('achievements')
      .select('*');

    const { data: earnedAchievements } = await supabase
      .from('user_achievements')
      .select('achievement_id')
      .eq('user_id', userId);

    const earnedIds = (earnedAchievements || []).map((ea: { achievement_id: string }) => ea.achievement_id);
    const updatedStats: UserStats = { ...stats, points: newPoints, level: newLevel, streak_days: newStreak };
    const unlockedAchievements = checkAchievementUnlocks(
      updatedStats,
      (allAchievements || []) as Achievement[],
      earnedIds
    );

    // Save newly unlocked achievements
    if (unlockedAchievements.length > 0) {
      const achievementRecords = unlockedAchievements.map(a => ({
        user_id: userId,
        achievement_id: a.id,
      }));

      await supabase.from('user_achievements').insert(achievementRecords);

      // Award bonus points for achievements
      const achievementPoints = unlockedAchievements.reduce((sum, a) => sum + a.points, 0);
      if (achievementPoints > 0) {
        const finalPoints = newPoints + achievementPoints;
        const finalLevel = calculateLevel(finalPoints);
        
        await supabase
          .from('user_stats')
          .update({ points: finalPoints, level: finalLevel })
          .eq('user_id', userId);
      }

      // Create notifications for achievements
      const achievementNotifications = unlockedAchievements.map(a => ({
        user_id: userId,
        type: 'achievement',
        title: 'Achievement Unlocked!',
        message: `${a.name}: ${a.description}`,
        data: { achievement_id: a.id, points: a.points },
      }));

      await supabase.from('notifications').insert(achievementNotifications);
    }

    // Create level up notification if applicable
    if (leveledUp) {
      await supabase.from('notifications').insert({
        user_id: userId,
        type: 'level_up',
        title: 'Level Up!',
        message: `You've reached level ${newLevel}!`,
        data: { new_level: newLevel },
      });
    }

    const result: GamificationResult = {
      pointsEarned: pointsToAward,
      newPoints,
      newLevel,
      leveledUp,
      achievementsUnlocked: unlockedAchievements,
      streakUpdated,
      newStreak,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Gamification tracking error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
