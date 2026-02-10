'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface PointsToastProps {
  points: number;
  message: string;
  onClose: () => void;
  duration?: number;
}

export function PointsToast({ points, message, onClose, duration = 3000 }: PointsToastProps) {
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
      setTimeout(onClose, 300); // Wait for fade out animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isMounted) return null;

  const toast = (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
      <div
        className={`
          px-6 py-3 bg-gradient-to-r from-brand-blue to-brand-cyan
          text-white rounded-full shadow-lg
          flex items-center gap-2 font-medium
          transition-all duration-300 transform
          ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-4 scale-95'}
        `}
      >
        <span className="text-2xl animate-bounce">✨</span>
        <div className="flex flex-col">
          <span className="text-lg font-bold">+{points} points!</span>
          <span className="text-sm text-white/90">{message}</span>
        </div>
      </div>
    </div>
  );

  return createPortal(toast, document.body);
}

// Hook to manage toast state
export function usePointsToast() {
  const [toast, setToast] = useState<{ points: number; message: string } | null>(null);

  const showToast = (points: number, message: string) => {
    setToast({ points, message });
  };

  const clearToast = () => {
    setToast(null);
  };

  return {
    toast,
    showToast,
    clearToast,
    ToastComponent: toast ? (
      <PointsToast
        points={toast.points}
        message={toast.message}
        onClose={clearToast}
      />
    ) : null,
  };
}
