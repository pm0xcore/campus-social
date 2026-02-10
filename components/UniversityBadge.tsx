'use client';

interface UniversityBadgeProps {
  university: {
    name: string;
    logo_url?: string | null;
  };
  size?: 'sm' | 'md' | 'lg';
}

export function UniversityBadge({ university, size = 'md' }: UniversityBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 bg-brand-cyan/20 text-brand-blue rounded-full ${sizeClasses[size]}`}>
      {university.logo_url ? (
        <img src={university.logo_url} alt="" className="w-4 h-4 rounded-full" />
      ) : (
        <span>🎓</span>
      )}
      {university.name}
    </span>
  );
}
