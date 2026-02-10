'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';

interface SOSSubmission {
  username: string;
  message: string;
  timestamp: string;
  location?: string;
}

export function SOSButton() {
  const { isAuthenticated, ocid } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Only show when authenticated
  if (!isAuthenticated || !ocid) {
    return null;
  }

  const handleSubmit = async () => {
    if (!message.trim()) return;

    setIsSubmitting(true);

    const sosData: SOSSubmission = {
      username: ocid, // Use ocid as username
      message: message.trim(),
      timestamp: new Date().toISOString(),
    };

    // Get location if available
    if (navigator.geolocation) {
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
        });
        sosData.location = `${position.coords.latitude},${position.coords.longitude}`;
      } catch {
        // Location not available, continue without it
      }
    }

    // Log the SOS submission (in a real app, this would send to a server)
    console.log('SOS Submitted:', sosData);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsSubmitting(false);
    setSubmitted(true);
    setMessage('');

    // Reset after 3 seconds
    setTimeout(() => {
      setSubmitted(false);
      setIsOpen(false);
    }, 3000);
  };

  if (submitted) {
    return (
      <div className="fixed bottom-20 right-4 bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg">
        <p className="font-medium">SOS Sent!</p>
        <p className="text-sm opacity-90">Help is on the way</p>
      </div>
    );
  }

  if (isOpen) {
    return (
      <div className="fixed bottom-20 right-4 bg-white border border-gray-200 rounded-lg shadow-xl p-4 w-72">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold text-gray-900">Send SOS</h3>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="mb-3">
          <p className="text-xs text-gray-500 mb-1">Sending as:</p>
          <p className="text-sm font-mono bg-gray-100 px-2 py-1 rounded truncate">{ocid}</p>
        </div>

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Describe your emergency..."
          className="w-full border border-gray-300 rounded-lg p-2 text-sm resize-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          rows={3}
        />

        <button
          onClick={handleSubmit}
          disabled={isSubmitting || !message.trim()}
          className="mt-3 w-full bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white font-medium py-2 rounded-lg transition-colors"
        >
          {isSubmitting ? 'Sending...' : 'Send SOS'}
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setIsOpen(true)}
      className="fixed bottom-20 right-4 bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-5 rounded-full shadow-lg transition-all hover:scale-105"
    >
      SOS
    </button>
  );
}
