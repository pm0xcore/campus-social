'use client';

interface MissionBannerProps {
  title: string;
  description: string;
  progress: number;
  total: number;
  reward: string;
  icon?: string;
}

export function MissionBanner({
  title,
  description,
  progress,
  total,
  reward,
  icon = '🎯',
}: MissionBannerProps) {
  const progressPercent = (progress / total) * 100;
  const isComplete = progress >= total;

  return (
    <div className={`
      p-4 rounded-xl border-2 
      ${isComplete 
        ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300' 
        : 'bg-gradient-to-r from-brand-blue/5 to-brand-cyan/5 border-brand-blue/20'
      }
    `}>
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`
          text-3xl w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0
          ${isComplete ? 'bg-green-100' : 'bg-white'}
        `}>
          {isComplete ? '✅' : icon}
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-semibold text-gray-900">
                {isComplete ? '✨ Mission Complete!' : title}
              </h3>
              <p className="text-sm text-gray-600">{description}</p>
            </div>
            <span className="text-sm font-medium text-brand-blue whitespace-nowrap ml-2">
              {progress}/{total}
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
            <div
              className={`
                h-full transition-all duration-500 ease-out
                ${isComplete 
                  ? 'bg-gradient-to-r from-green-400 to-emerald-500' 
                  : 'bg-gradient-to-r from-brand-blue to-brand-cyan'
                }
              `}
              style={{ width: `${Math.min(progressPercent, 100)}%` }}
            />
          </div>

          {/* Reward */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-500">Reward:</span>
            <span className={`font-medium ${isComplete ? 'text-green-600' : 'text-brand-blue'}`}>
              {reward}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
