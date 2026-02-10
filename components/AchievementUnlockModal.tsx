'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import type { Achievement } from '@/lib/gamification';

interface AchievementUnlockModalProps {
  achievement: Achievement;
  onClose: () => void;
}

export function AchievementUnlockModal({ achievement, onClose }: AchievementUnlockModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    requestAnimationFrame(() => {
      setIsVisible(true);
    });

    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, 4000);

    return () => clearTimeout(timer);
  }, [onClose]);

  if (!isMounted) return null;

  const typeColors = {
    bronze: 'from-orange-400 to-orange-600',
    silver: 'from-gray-300 to-gray-500',
    gold: 'from-yellow-400 to-yellow-600',
    diamond: 'from-cyan-400 to-blue-600',
  };

  const modal = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${
          isVisible ? 'opacity-60' : 'opacity-0'
        }`}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`
          relative bg-white rounded-2xl p-8 max-w-md w-full
          shadow-2xl transform transition-all duration-500
          ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}
        `}
      >
        {/* Confetti effect */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-brand-cyan rounded-full animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 0.5}s`,
                animationDuration: `${1 + Math.random()}s`,
              }}
            />
          ))}
        </div>

        {/* Content */}
        <div className="relative text-center">
          {/* Trophy icon */}
          <div className="mb-4 inline-block">
            <div className="relative">
              <div className={`absolute inset-0 bg-gradient-to-br ${typeColors[achievement.type]} rounded-full blur-xl opacity-50 animate-pulse`} />
              <div className="relative text-6xl animate-bounce">{achievement.icon}</div>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold mb-2 text-gray-900">
            Achievement Unlocked!
          </h2>

          {/* Achievement name */}
          <div className={`inline-block px-4 py-2 rounded-full bg-gradient-to-r ${typeColors[achievement.type]} text-white font-semibold mb-3`}>
            {achievement.name}
          </div>

          {/* Description */}
          <p className="text-gray-600 mb-4">
            {achievement.description}
          </p>

          {/* Points */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="text-3xl font-bold text-brand-blue">
              +{achievement.points}
            </span>
            <span className="text-gray-500">points</span>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gradient-to-r from-brand-blue to-brand-cyan text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            Awesome!
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}

// Hook to manage achievement modal
export function useAchievementModal() {
  const [achievement, setAchievement] = useState<Achievement | null>(null);

  const showAchievement = (newAchievement: Achievement) => {
    setAchievement(newAchievement);
  };

  const closeAchievement = () => {
    setAchievement(null);
  };

  return {
    achievement,
    showAchievement,
    closeAchievement,
    AchievementComponent: achievement ? (
      <AchievementUnlockModal achievement={achievement} onClose={closeAchievement} />
    ) : null,
  };
}
