'use client';

interface StreakIndicatorProps {
  days: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function StreakIndicator({ days, showLabel = true, size = 'md' }: StreakIndicatorProps) {
  const sizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <div className="flex items-center gap-1.5">
      <span className={`${sizes[size]}`}>🔥</span>
      <div className="flex flex-col">
        <span className={`${textSizes[size]} font-bold text-gray-900`}>
          {days}
        </span>
        {showLabel && (
          <span className="text-xs text-gray-500">day{days !== 1 ? 's' : ''}</span>
        )}
      </div>
    </div>
  );
}
