'use client';

import { useState, useEffect } from 'react';

interface Stats {
  users: number;
  posts: number;
  groups: number;
}

export function StatsCard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    // Simulated stats - in a real app, fetch from API
    setStats({
      users: 1247,
      posts: 3892,
      groups: 156,
    });
  }, []);

  if (!stats) {
    return (
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 bg-gray-50 rounded-lg animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-2" />
            <div className="h-4 bg-gray-200 rounded w-20" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="p-4 bg-gray-50 rounded-lg text-center">
        <div className="text-2xl font-bold text-brand-blue">
          {stats.users.toLocaleString()}
        </div>
        <div className="text-xs text-gray-500">Users</div>
      </div>
      <div className="p-4 bg-gray-50 rounded-lg text-center">
        <div className="text-2xl font-bold text-brand-blue">
          {stats.posts.toLocaleString()}
        </div>
        <div className="text-xs text-gray-500">Posts</div>
      </div>
      <div className="p-4 bg-gray-50 rounded-lg text-center">
        <div className="text-2xl font-bold text-brand-cyan">
          {stats.groups}
        </div>
        <div className="text-xs text-gray-500">Groups</div>
      </div>
    </div>
  );
}
