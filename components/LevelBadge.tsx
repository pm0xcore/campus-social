'use client';

interface LevelBadgeProps {
  level: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function LevelBadge({ level, size = 'md', showLabel = false }: LevelBadgeProps) {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-lg',
  };

  return (
    <div className="flex items-center gap-2">
      <div
        className={`
          ${sizes[size]} rounded-full
          bg-gradient-to-br from-brand-blue to-brand-cyan
          flex items-center justify-center
          text-white font-bold
          shadow-lg ring-2 ring-white
        `}
      >
        {level}
      </div>
      {showLabel && (
        <span className="text-sm font-medium text-gray-700">
          Level {level}
        </span>
      )}
    </div>
  );
}
