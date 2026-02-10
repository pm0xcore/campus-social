'use client';

interface ProfileCardProps {
  userId: string;
  isOwnProfile?: boolean;
  stats?: {
    posts: number;
    reactions: number;
  };
  bio?: string;
  currentFocus?: string;
}

export function ProfileCard({
  userId,
  isOwnProfile = false,
  stats = { posts: 0, reactions: 0 },
  bio,
  currentFocus,
}: ProfileCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      {/* Header gradient */}
      <div className="h-20 bg-gradient-to-r from-brand-blue to-brand-cyan" />

      {/* Profile info */}
      <div className="px-6 pb-6">
        {/* Avatar */}
        <div className="-mt-10 mb-4">
          <div className="w-20 h-20 rounded-full bg-white border-4 border-white shadow-sm flex items-center justify-center bg-gradient-to-br from-brand-blue to-brand-blue/80">
            <span className="text-white font-bold text-2xl">
              {userId.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>

        {/* Name and badge */}
        <div className="flex items-center gap-2 mb-1">
          <h2 className="text-xl font-semibold text-gray-900">{userId}</h2>
          {isOwnProfile && (
            <span className="text-xs px-2 py-0.5 bg-brand-cyan/20 text-brand-blue rounded-full">
              You
            </span>
          )}
        </div>

        {/* Bio */}
        {bio ? (
          <p className="text-gray-600 text-sm mb-4">{bio}</p>
        ) : (
          <p className="text-gray-400 text-sm mb-4 italic">No bio yet</p>
        )}

        {/* Current focus */}
        {currentFocus && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">Currently learning</p>
            <p className="text-sm font-medium text-gray-800">{currentFocus}</p>
          </div>
        )}

        {/* Stats */}
        <div className="flex gap-6 pt-4 border-t">
          <div>
            <div className="text-lg font-semibold text-gray-900">{stats.posts}</div>
            <div className="text-xs text-gray-500">Posts</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-gray-900">{stats.reactions}</div>
            <div className="text-xs text-gray-500">Reactions received</div>
          </div>
        </div>
      </div>
    </div>
  );
}
