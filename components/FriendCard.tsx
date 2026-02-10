'use client';

interface FriendCardProps {
  friend: {
    id: string;
    ocid: string;
    display_name: string | null;
    avatar_url: string | null;
    bio: string | null;
    current_focus?: string | null;
    friendshipId?: string;
  };
  type: 'friend' | 'request' | 'sent';
  onAccept?: (friendshipId: string) => void;
  onDecline?: (friendshipId: string) => void;
  onRemove?: (friendshipId: string) => void;
  onMessage?: (userId: string) => void;
}

export function FriendCard({ friend, type, onAccept, onDecline, onRemove, onMessage }: FriendCardProps) {
  const displayName = friend.display_name || friend.ocid;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <a href={`/profile/${friend.ocid}`}>
          <div className="w-12 h-12 rounded-full bg-brand-blue/10 flex items-center justify-center flex-shrink-0">
            {friend.avatar_url ? (
              <img
                src={friend.avatar_url}
                alt={displayName}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <span className="text-brand-blue font-semibold text-lg">
                {displayName.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
        </a>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <a
            href={`/profile/${friend.ocid}`}
            className="font-medium text-gray-900 hover:text-brand-blue block truncate"
          >
            {displayName}
          </a>
          {friend.bio && (
            <p className="text-sm text-gray-500 line-clamp-1">{friend.bio}</p>
          )}
          {friend.current_focus && (
            <p className="text-xs text-brand-blue mt-1">
              Learning: {friend.current_focus}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {type === 'friend' && (
            <>
              {onMessage && (
                <button
                  onClick={() => onMessage(friend.id)}
                  className="px-3 py-1.5 text-sm bg-brand-blue text-white rounded-lg hover:opacity-90 transition-opacity"
                >
                  Message
                </button>
              )}
              {onRemove && friend.friendshipId && (
                <button
                  onClick={() => onRemove(friend.friendshipId!)}
                  className="px-3 py-1.5 text-sm border border-gray-200 text-gray-600 rounded-lg hover:border-red-300 hover:text-red-600 transition-colors"
                >
                  Remove
                </button>
              )}
            </>
          )}

          {type === 'request' && friend.friendshipId && (
            <>
              {onAccept && (
                <button
                  onClick={() => onAccept(friend.friendshipId!)}
                  className="px-3 py-1.5 text-sm bg-brand-blue text-white rounded-lg hover:opacity-90 transition-opacity"
                >
                  Accept
                </button>
              )}
              {onDecline && (
                <button
                  onClick={() => onDecline(friend.friendshipId!)}
                  className="px-3 py-1.5 text-sm border border-gray-200 text-gray-600 rounded-lg hover:border-red-300 hover:text-red-600 transition-colors"
                >
                  Decline
                </button>
              )}
            </>
          )}

          {type === 'sent' && friend.friendshipId && (
            <button
              onClick={() => onRemove?.(friend.friendshipId!)}
              className="px-3 py-1.5 text-sm border border-gray-200 text-gray-600 rounded-lg hover:border-red-300 hover:text-red-600 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
