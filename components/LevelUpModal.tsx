'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface LevelUpModalProps {
  newLevel: number;
  onClose: () => void;
}

export function LevelUpModal({ newLevel, onClose }: LevelUpModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Trigger animation
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

  const modal = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${
          isVisible ? 'opacity-50' : 'opacity-0'
        }`}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`
          relative bg-white rounded-2xl p-8 max-w-md w-full
          shadow-2xl transform transition-all duration-500
          ${isVisible ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-75 rotate-12'}
        `}
      >
        {/* Animated background glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/20 to-brand-cyan/20 rounded-2xl animate-pulse" />

        {/* Content */}
        <div className="relative text-center">
          {/* Icon */}
          <div className="mb-4 inline-block">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-brand-blue to-brand-cyan rounded-full animate-ping opacity-75" />
              <div className="relative text-6xl animate-bounce">🚀</div>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-brand-blue to-brand-cyan bg-clip-text text-transparent">
            Level Up!
          </h2>

          {/* Level */}
          <div className="mb-4">
            <div className="text-5xl font-bold text-gray-900 mb-2">
              Level {newLevel}
            </div>
            <p className="text-gray-600">
              You're making amazing progress!
            </p>
          </div>

          {/* Decorative stars */}
          <div className="flex justify-center gap-2 mb-6">
            {[...Array(5)].map((_, i) => (
              <span
                key={i}
                className="text-2xl animate-bounce"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                ⭐
              </span>
            ))}
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gradient-to-r from-brand-blue to-brand-cyan text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}

// Hook to manage level up modal
export function useLevelUpModal() {
  const [level, setLevel] = useState<number | null>(null);

  const showLevelUp = (newLevel: number) => {
    setLevel(newLevel);
  };

  const closeLevelUp = () => {
    setLevel(null);
  };

  return {
    level,
    showLevelUp,
    closeLevelUp,
    LevelUpComponent: level ? (
      <LevelUpModal newLevel={level} onClose={closeLevelUp} />
    ) : null,
  };
}
