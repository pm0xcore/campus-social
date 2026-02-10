'use client';

import { useState, useEffect, useCallback } from 'react';
import { getAccount } from '@/lib/auth-context';
import { useCurrentUser } from '@/lib/hooks/useCurrentUser';
import { LevelBadge } from '@/components/LevelBadge';
import { trackEvent } from '@/lib/analytics';

interface LeaderboardEntry {
  user_id: string;
  ocid: string;
  display_name: string | null;
  avatar_url: string | null;
  university_name: string | null;
  points: number;
  level: number;
  rank: number;
}

interface LeaderboardData {
  entries: LeaderboardEntry[];
  userRank: number | null;
  nextUser: LeaderboardEntry | null;
}

type TimeFrame = 'week' | 'month' | 'all';
type Scope = 'university' | 'global';

export default function LeaderboardPage() {
  const { user, loading: userLoading } = useCurrentUser();
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('all');
  const [scope, setScope] = useState<Scope>('university');
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = useCallback(async () => {
    const token = getAccount()?.getIdToken?.();
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const params = new URLSearchParams({
        timeFrame,
        scope,
      });

      const res = await fetch(`/api/gamification/leaderboard?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (res.ok) {
        const result = await res.json();
        setData(result);
      }
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setLoading(false);
    }
  }, [timeFrame, scope]);

  useEffect(() => {
    if (!userLoading && user) {
      fetchLeaderboard();
      trackEvent('leaderboard_viewed', { timeFrame, scope });
    } else if (!userLoading) {
      setLoading(false);
    }
  }, [userLoading, user, timeFrame, scope, fetchLeaderboard]);

  if (userLoading || loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Loading...</div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Please log in to view leaderboard</p>
          <a href="/" className="text-brand-blue hover:underline">← Back to Home</a>
        </div>
      </main>
    );
  }

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-600';
    if (rank === 2) return 'text-gray-500';
    if (rank === 3) return 'text-orange-600';
    return 'text-gray-700';
  };

  const getRankEmoji = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return null;
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-20">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <span>🏆</span>
                Leaderboard
              </h1>
              <p className="text-sm text-gray-500">Top performers in your community</p>
            </div>
            <a href="/" className="text-sm text-gray-500 hover:text-brand-blue">
              ← Home
            </a>
          </div>

          {/* Filters */}
          <div className="space-y-2">
            {/* Time frame */}
            <div className="flex gap-2">
              {(['all', 'month', 'week'] as TimeFrame[]).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeFrame(tf)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    timeFrame === tf
                      ? 'bg-brand-blue text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {tf === 'all' ? 'All Time' : tf === 'month' ? 'This Month' : 'This Week'}
                </button>
              ))}
            </div>

            {/* Scope */}
            {user.university && (
              <div className="flex gap-2">
                <button
                  onClick={() => setScope('university')}
                  className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    scope === 'university'
                      ? 'bg-brand-cyan/20 text-brand-blue border-2 border-brand-cyan'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  🏛️ {user.university.name}
                </button>
                <button
                  onClick={() => setScope('global')}
                  className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    scope === 'global'
                      ? 'bg-brand-cyan/20 text-brand-blue border-2 border-brand-cyan'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  🌍 All Universities
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Your rank card */}
        {data && data.userRank && (
          <div className="mb-6 p-4 bg-gradient-to-r from-brand-blue/10 to-brand-cyan/10 rounded-xl border-2 border-brand-blue/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Your Rank</p>
                <p className="text-2xl font-bold text-brand-blue">
                  #{data.userRank}
                </p>
              </div>
              {data.nextUser && (
                <div className="text-right">
                  <p className="text-sm text-gray-600 mb-1">Next: {data.nextUser.display_name || data.nextUser.ocid}</p>
                  <p className="text-sm font-medium text-brand-blue">
                    +{data.nextUser.points - (data.entries.find(e => e.user_id === user.id)?.points || 0)} points needed
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Leaderboard list */}
        {!data || data.entries.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <p className="text-gray-500">No leaderboard data available yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {data.entries.map((entry) => {
              const isCurrentUser = entry.user_id === user.id;
              const rankEmoji = getRankEmoji(entry.rank);

              return (
                <div
                  key={entry.user_id}
                  className={`
                    flex items-center gap-3 p-4 rounded-xl transition-all
                    ${isCurrentUser 
                      ? 'bg-gradient-to-r from-brand-blue/20 to-brand-cyan/20 border-2 border-brand-blue' 
                      : 'bg-white border border-gray-200 hover:border-brand-blue/30'
                    }
                  `}
                >
                  {/* Rank */}
                  <div className={`w-12 text-center font-bold text-lg ${getRankColor(entry.rank)}`}>
                    {rankEmoji || `#${entry.rank}`}
                  </div>

                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full bg-brand-blue/10 flex items-center justify-center flex-shrink-0">
                    {entry.avatar_url ? (
                      <img
                        src={entry.avatar_url}
                        alt={entry.display_name || entry.ocid}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-brand-blue font-semibold text-lg">
                        {(entry.display_name || entry.ocid).charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>

                  {/* User info */}
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium truncate ${isCurrentUser ? 'text-brand-blue' : 'text-gray-900'}`}>
                      {entry.display_name || entry.ocid}
                      {isCurrentUser && <span className="ml-2 text-xs">(You)</span>}
                    </p>
                    {entry.university_name && (
                      <p className="text-xs text-gray-500 truncate">{entry.university_name}</p>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="text-right flex-shrink-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold text-gray-900">
                        {entry.points.toLocaleString()}
                      </span>
                      <span className="text-xs text-gray-500">pts</span>
                    </div>
                    <LevelBadge level={entry.level} size="sm" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
