-- Gamification System Migration
-- Adds points, levels, achievements, streaks, and leaderboards

-- Add onboarding flag to existing users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS has_completed_onboarding BOOLEAN DEFAULT false;

-- User stats and progress
CREATE TABLE user_stats (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  university_id UUID REFERENCES universities(id),
  points INT DEFAULT 0,
  level INT DEFAULT 1,
  streak_days INT DEFAULT 0,
  last_active_date DATE DEFAULT CURRENT_DATE,
  friends_count INT DEFAULT 0,
  posts_count INT DEFAULT 0,
  groups_joined_count INT DEFAULT 0,
  messages_sent_count INT DEFAULT 0,
  questions_answered_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for leaderboards and lookups
CREATE INDEX idx_user_stats_university ON user_stats(university_id);
CREATE INDEX idx_user_stats_points ON user_stats(points DESC);
CREATE INDEX idx_user_stats_level ON user_stats(level DESC);
CREATE INDEX idx_user_stats_streak ON user_stats(streak_days DESC);

-- Achievements/badges
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  points INT DEFAULT 0,
  type TEXT NOT NULL CHECK (type IN ('bronze', 'silver', 'gold', 'diamond')),
  trigger_type TEXT NOT NULL,
  trigger_threshold INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User achievements
CREATE TABLE user_achievements (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, achievement_id)
);

CREATE INDEX idx_user_achievements_user ON user_achievements(user_id);
CREATE INDEX idx_user_achievements_earned ON user_achievements(earned_at DESC);

-- Daily challenges
CREATE TABLE daily_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  challenge_type TEXT NOT NULL,
  description TEXT NOT NULL,
  points INT DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(date, challenge_type)
);

CREATE INDEX idx_daily_challenges_date ON daily_challenges(date DESC);

-- User daily challenge progress
CREATE TABLE user_challenge_progress (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  challenge_id UUID NOT NULL REFERENCES daily_challenges(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  PRIMARY KEY (user_id, challenge_id)
);

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('friend_request', 'friend_accepted', 'post_reaction', 'achievement', 'level_up', 'streak_risk', 'challenge_available')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, read) WHERE read = false;
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);

-- Seed achievements
INSERT INTO achievements (name, description, icon, points, type, trigger_type, trigger_threshold) VALUES
  ('First Friend', 'Made your first connection', '🤝', 50, 'bronze', 'friends_count', 1),
  ('Social Starter', 'Connected with 3 classmates', '👥', 100, 'bronze', 'friends_count', 3),
  ('Social Butterfly', 'Made 10 friends', '🦋', 200, 'silver', 'friends_count', 10),
  ('Network Master', 'Connected with 25 friends', '🌟', 500, 'gold', 'friends_count', 25),
  ('Campus Legend', 'Made 50 friends', '👑', 1000, 'diamond', 'friends_count', 50),
  
  ('First Post', 'Shared your first thought', '💬', 25, 'bronze', 'posts_count', 1),
  ('Active Contributor', 'Posted 10 times', '✍️', 100, 'silver', 'posts_count', 10),
  ('Prolific Poster', 'Shared 50 posts', '📝', 500, 'gold', 'posts_count', 50),
  ('Content Creator', 'Posted 100 times', '🎨', 1000, 'diamond', 'posts_count', 100),
  
  ('Week Warrior', 'Maintained 7 day streak', '🔥', 100, 'silver', 'streak_days', 7),
  ('Monthly Master', 'Maintained 30 day streak', '⚡', 500, 'gold', 'streak_days', 30),
  ('Streak Legend', 'Maintained 100 day streak', '💎', 2000, 'diamond', 'streak_days', 100),
  
  ('Helpful Hero', 'Answered 10 questions', '❓', 150, 'silver', 'questions_answered_count', 10),
  ('Community Guide', 'Answered 25 questions', '🎓', 400, 'gold', 'questions_answered_count', 25),
  
  ('Group Explorer', 'Joined your first group', '🎯', 20, 'bronze', 'groups_joined_count', 1),
  ('Community Member', 'Joined 5 groups', '👨‍👩‍👧‍👦', 100, 'silver', 'groups_joined_count', 5);

-- Function to update user stats timestamp
CREATE OR REPLACE FUNCTION update_user_stats_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_stats_updated_at
  BEFORE UPDATE ON user_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_user_stats_timestamp();

-- Function to initialize user stats on user creation
CREATE OR REPLACE FUNCTION initialize_user_stats()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_stats (user_id, university_id)
  VALUES (NEW.id, NEW.university_id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_stats_init
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION initialize_user_stats();
