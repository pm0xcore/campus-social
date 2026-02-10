'use client';

interface EmptyStateProps {
  icon: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaHref: string;
  secondaryAction?: {
    text: string;
    onClick: () => void;
  };
}

export function EmptyState({
  icon,
  title,
  subtitle,
  ctaText,
  ctaHref,
  secondaryAction,
}: EmptyStateProps) {
  return (
    <div className="text-center py-12 px-4 bg-white rounded-xl border border-gray-200">
      {/* Icon */}
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-brand-blue/10 to-brand-cyan/10 flex items-center justify-center">
        <span className="text-4xl">{icon}</span>
      </div>

      {/* Title */}
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        {title}
      </h3>

      {/* Subtitle */}
      <p className="text-gray-600 mb-6 max-w-sm mx-auto">
        {subtitle}
      </p>

      {/* CTA Button */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <a
          href={ctaHref}
          className="inline-block px-6 py-3 bg-gradient-to-r from-brand-blue to-brand-cyan text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
        >
          {ctaText}
        </a>

        {secondaryAction && (
          <button
            onClick={secondaryAction.onClick}
            className="inline-block px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            {secondaryAction.text}
          </button>
        )}
      </div>
    </div>
  );
}
