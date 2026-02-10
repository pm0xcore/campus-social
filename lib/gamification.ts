// Gamification system for Campus Social
// Handles points, levels, achievements, and streaks

export const POINTS = {
  FRIEND_ADDED: 50,
  POST_CREATED: 10,
  WIN_POSTED: 25,
  QUESTION_ASKED: 15,
  RESOURCE_SHARED: 30,
  GROUP_JOINED: 20,
  MESSAGE_SENT: 5,
  DAILY_LOGIN: 10,
  PROFILE_COMPLETED: 100,
  POST_REACTION: 5,
  ANSWER_QUESTION: 15,
} as const;

export type PointEvent = keyof typeof POINTS;

// Level calculation - every 500 points = 1 level
export function calculateLevel(points: number): number {
  return Math.floor(points / 500) + 1;
}

// Calculate XP progress to next level
export function calculateLevelProgress(points: number): { current: number; next: number; progress: number } {
  const level = calculateLevel(points);
  const currentLevelPoints = (level - 1) * 500;
  const nextLevelPoints = level * 500;
  const progressPoints = points - currentLevelPoints;
  const progressPercent = (progressPoints / 500) * 100;

  return {
    current: currentLevelPoints,
    next: nextLevelPoints,
    progress: Math.min(progressPercent, 100),
  };
}

// Achievement trigger types
export type AchievementTrigger = 
  | 'friends_count'
  | 'posts_count'
  | 'streak_days'
  | 'groups_joined_count'
  | 'messages_sent_count'
  | 'questions_answered_count';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  points: number;
  type: 'bronze' | 'silver' | 'gold' | 'diamond';
  trigger_type: AchievementTrigger;
  trigger_threshold: number;
}

export interface UserStats {
  user_id: string;
  university_id: string | null;
  points: number;
  level: number;
  streak_days: number;
  last_active_date: string;
  friends_count: number;
  posts_count: number;
  groups_joined_count: number;
  messages_sent_count: number;
  questions_answered_count: number;
}

// Check if achievements should be unlocked based on current stats
export function checkAchievementUnlocks(
  stats: UserStats,
  achievements: Achievement[],
  earnedAchievementIds: string[]
): Achievement[] {
  const unlocked: Achievement[] = [];

  for (const achievement of achievements) {
    // Skip if already earned
    if (earnedAchievementIds.includes(achievement.id)) {
      continue;
    }

    // Check if threshold met
    const statValue = stats[achievement.trigger_type];
    if (statValue >= achievement.trigger_threshold) {
      unlocked.push(achievement);
    }
  }

  return unlocked;
}

// Calculate streak status
export function calculateStreak(lastActiveDate: string | null, currentDate: Date = new Date()): {
  shouldIncrement: boolean;
  shouldReset: boolean;
  daysAgo: number;
} {
  if (!lastActiveDate) {
    return { shouldIncrement: true, shouldReset: false, daysAgo: 0 };
  }

  const lastActive = new Date(lastActiveDate);
  const today = new Date(currentDate);
  
  // Normalize to start of day for comparison
  lastActive.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const diffTime = today.getTime() - lastActive.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  return {
    shouldIncrement: diffDays === 1, // Exactly 1 day ago - increment streak
    shouldReset: diffDays > 1,       // More than 1 day ago - reset streak
    daysAgo: diffDays,
  };
}

// Event metadata interface
export interface GamificationEventMetadata {
  userId: string;
  eventType: PointEvent;
  additionalData?: Record<string, unknown>;
}

// Result of processing a gamification event
export interface GamificationResult {
  pointsEarned: number;
  newPoints: number;
  newLevel: number;
  leveledUp: boolean;
  achievementsUnlocked: Achievement[];
  streakUpdated: boolean;
  newStreak: number;
}

// Type guard for point events
export function isValidPointEvent(event: string): event is PointEvent {
  return event in POINTS;
}

// Generate daily challenges for a given date
export interface DailyChallenge {
  id: string;
  date: string;
  challenge_type: string;
  description: string;
  points: number;
}

export const CHALLENGE_TEMPLATES = [
  { type: 'add_friend', description: 'Add 1 new friend', points: 50 },
  { type: 'post_win', description: 'Share a win', points: 25 },
  { type: 'ask_question', description: 'Ask a question', points: 15 },
  { type: 'share_resource', description: 'Share a helpful resource', points: 30 },
  { type: 'join_group', description: 'Join a new group', points: 20 },
  { type: 'react_posts', description: 'React to 3 posts', points: 15 },
  { type: 'send_messages', description: 'Send 5 messages', points: 25 },
] as const;

export function generateDailyChallenges(date: Date): { type: string; description: string; points: number }[] {
  // Use date as seed for consistent daily challenges
  const dateString = date.toISOString().split('T')[0];
  const seed = dateString.split('-').reduce((acc, num) => acc + parseInt(num), 0);
  
  // Shuffle and pick 3 challenges
  const challenges = [...CHALLENGE_TEMPLATES];
  const shuffled = challenges.sort(() => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x) - 0.5;
  });
  
  return shuffled.slice(0, 3);
}
