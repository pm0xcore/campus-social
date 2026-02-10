'use client';

import { useState, useEffect, useCallback } from 'react';
import { getAccount } from '@/lib/auth-context';

interface Challenge {
  id: string;
  challenge_type: string;
  description: string;
  points: number;
  completed: boolean;
}

interface DailyChallengeCardProps {
  streak: number;
}

export function DailyChallengeCard({ streak }: DailyChallengeCardProps) {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchChallenges = useCallback(async () => {
    const token = getAccount()?.getIdToken?.();
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/gamification/challenges/daily', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setChallenges(data.challenges || []);
      }
    } catch (error) {
      console.error('Failed to fetch challenges:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChallenges();
  }, [fetchChallenges]);

  const completedCount = challenges.filter(c => c.completed).length;
  const totalPoints = challenges.reduce((sum, c) => sum + (c.completed ? c.points : 0), 0);

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-4 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-32 mb-3" />
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded" />
          <div className="h-4 bg-gray-200 rounded" />
          <div className="h-4 bg-gray-200 rounded w-3/4" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 hover:border-brand-blue transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">📅</span>
          <h3 className="font-semibold text-gray-900">Today's Challenges</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xl">🔥</span>
          <span className="text-sm font-bold text-gray-900">{streak}</span>
        </div>
      </div>

      {/* Challenges list */}
      <div className="space-y-2 mb-3">
        {challenges.map((challenge) => (
          <div
            key={challenge.id}
            className={`
              flex items-start gap-2 p-2 rounded-lg transition-colors
              ${challenge.completed ? 'bg-green-50' : 'bg-gray-50'}
            `}
          >
            <div className="flex-shrink-0 mt-0.5">
              {challenge.completed ? (
                <span className="text-green-600">✅</span>
              ) : (
                <span className="text-gray-400">⬜</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm ${challenge.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                {challenge.description}
              </p>
            </div>
            <span className={`text-xs font-medium flex-shrink-0 ${challenge.completed ? 'text-green-600' : 'text-brand-blue'}`}>
              {challenge.points} pts
            </span>
          </div>
        ))}
      </div>

      {/* Progress summary */}
      <div className="pt-3 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">
            {completedCount}/{challenges.length} completed
          </span>
          <span className="font-semibold text-brand-blue">
            +{totalPoints} pts earned
          </span>
        </div>
      </div>
    </div>
  );
}
