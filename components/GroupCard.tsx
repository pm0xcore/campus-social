'use client';

import { trackEvent } from '@/lib/analytics';

interface GroupCardProps {
  group: {
    id: string;
    name: string;
    description: string | null;
    type: string;
    university?: { name: string } | null;
    member_count?: { count: number }[] | number;
    isMember: boolean;
    userRole: string | null;
  };
  onJoin?: (groupId: string) => void;
  onLeave?: (groupId: string) => void;
}

const TYPE_ICONS: Record<string, string> = {
  university: '🏛️',
  course: '📚',
  club: '🎯',
  study: '✏️',
};

export function GroupCard({ group, onJoin, onLeave }: GroupCardProps) {
  const memberCount = Array.isArray(group.member_count)
    ? group.member_count[0]?.count || 0
    : group.member_count || 0;

  const handleAction = () => {
    if (group.isMember) {
      if (group.userRole !== 'owner') {
        onLeave?.(group.id);
        trackEvent('group_left', { groupId: group.id });
      }
    } else {
      onJoin?.(group.id);
      trackEvent('group_joined', { groupId: group.id });
    }
  };

  return (
    <a
      href={`/groups/${group.id}`}
      className="block bg-white border border-gray-200 rounded-xl p-4 hover:shadow-sm transition-shadow"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-brand-blue/10 flex items-center justify-center text-xl">
            {TYPE_ICONS[group.type] || '👥'}
          </div>
          <div>
            <h3 className="font-medium text-gray-900">{group.name}</h3>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>{memberCount} member{memberCount !== 1 ? 's' : ''}</span>
              {group.university && (
                <>
                  <span>•</span>
                  <span className="text-brand-blue">{group.university.name}</span>
                </>
              )}
            </div>
          </div>
        </div>
        
        {group.isMember ? (
          <span className="px-2 py-1 text-xs bg-brand-cyan/20 text-brand-blue rounded-full">
            {group.userRole === 'owner' ? 'Owner' : 'Member'}
          </span>
        ) : (
          <button
            onClick={(e) => {
              e.preventDefault();
              handleAction();
            }}
            className="px-3 py-1 text-sm bg-brand-blue text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            Join
          </button>
        )}
      </div>

      {group.description && (
        <p className="text-sm text-gray-600 line-clamp-2">{group.description}</p>
      )}
    </a>
  );
}
