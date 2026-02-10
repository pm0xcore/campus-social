'use client';

interface PointsDisplayProps {
  points: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function PointsDisplay({ points, showLabel = true, size = 'md' }: PointsDisplayProps) {
  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const iconSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
  };

  return (
    <div className="flex items-center gap-1.5">
      <span className={`${iconSizes[size]}`}>⭐</span>
      <div className="flex flex-col">
        <span className={`${textSizes[size]} font-bold text-gray-900`}>
          {points.toLocaleString()}
        </span>
        {showLabel && (
          <span className="text-xs text-gray-500">points</span>
        )}
      </div>
    </div>
  );
}
