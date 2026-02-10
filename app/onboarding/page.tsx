'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentUser } from '@/lib/hooks/useCurrentUser';

const steps = [
  {
    id: 'welcome',
    title: 'Welcome to Campus Social! 🎓',
    description: 'Your university\'s private network for connecting, learning, and growing together.',
    features: [
      { icon: '🤝', text: 'Connect with classmates' },
      { icon: '💬', text: 'Share wins and ask questions' },
      { icon: '📚', text: 'Join study groups' },
      { icon: '⭐', text: 'Earn points and level up' },
    ],
  },
  {
    id: 'profile',
    title: 'Complete Your Profile',
    description: 'Help others get to know you better.',
  },
  {
    id: 'tutorial',
    title: 'Quick Tour',
    description: 'Here\'s how to get the most out of Campus Social.',
    features: [
      { icon: '🔍', label: 'Discover', text: 'Find and connect with classmates' },
      { icon: '📱', label: 'Feed', text: 'Share your learning journey' },
      { icon: '👥', label: 'Groups', text: 'Join study groups and clubs' },
      { icon: '💬', label: 'Messages', text: 'Chat with your friends' },
    ],
  },
  {
    id: 'mission',
    title: 'Your First Mission 🎯',
    description: 'Ready to start? Complete your first challenge!',
    mission: {
      title: 'Find Your First 3 Classmates',
      reward: '100 points + unlock DMs',
    },
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user, updateProfile } = useCurrentUser();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Profile form state
  const [displayName, setDisplayName] = useState(user?.display_name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [currentFocus, setCurrentFocus] = useState(user?.current_focus || '');

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const isProfileStep = currentStepData.id === 'profile';

  const handleNext = async () => {
    if (isProfileStep) {
      // Save profile
      if (!displayName.trim()) {
        alert('Please enter a display name');
        return;
      }

      setIsSubmitting(true);
      try {
        await updateProfile({
          display_name: displayName,
          bio: bio || undefined,
          current_focus: currentFocus || undefined,
        });
        setCurrentStep(prev => prev + 1);
      } catch (error) {
        console.error('Failed to update profile:', error);
        alert('Failed to save profile. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    } else if (isLastStep) {
      // Complete onboarding
      setIsSubmitting(true);
      try {
        await updateProfile({ has_completed_onboarding: true } as any);
        router.push('/discover');
      } catch (error) {
        console.error('Failed to complete onboarding:', error);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleSkip = () => {
    setCurrentStep(prev => prev + 1);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-brand-blue/5 via-white to-brand-cyan/5 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Progress indicators */}
        <div className="flex justify-center gap-2 mb-8">
          {steps.map((_, idx) => (
            <div
              key={idx}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === currentStep
                  ? 'w-8 bg-gradient-to-r from-brand-blue to-brand-cyan'
                  : idx < currentStep
                  ? 'w-2 bg-brand-blue'
                  : 'w-2 bg-gray-200'
              }`}
            />
          ))}
        </div>

        {/* Content card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-3 text-center">
            {currentStepData.title}
          </h1>
          <p className="text-gray-600 text-center mb-8">
            {currentStepData.description}
          </p>

          {/* Step content */}
          {currentStepData.id === 'welcome' && (
            <div className="grid grid-cols-2 gap-4 mb-8">
              {currentStepData.features?.map((feature, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 text-center"
                >
                  <span className="text-3xl mb-2 block">{feature.icon}</span>
                  <p className="text-sm font-medium text-gray-700">{feature.text}</p>
                </div>
              ))}
            </div>
          )}

          {currentStepData.id === 'profile' && (
            <div className="space-y-4 mb-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Display Name *
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="How should others see you?"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Focus
                </label>
                <input
                  type="text"
                  value={currentFocus}
                  onChange={(e) => setCurrentFocus(e.target.value)}
                  placeholder="e.g., Learning Solidity, DeFi Research"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bio
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about yourself..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent resize-none"
                />
              </div>
            </div>
          )}

          {currentStepData.id === 'tutorial' && (
            <div className="space-y-3 mb-8">
              {currentStepData.features?.map((feature, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3 rounded-lg bg-gray-50"
                >
                  <span className="text-2xl flex-shrink-0">{feature.icon}</span>
                  <div>
                    <p className="font-semibold text-gray-900">{'label' in feature ? feature.label : ''}</p>
                    <p className="text-sm text-gray-600">{feature.text}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {currentStepData.id === 'mission' && (
            <div className="mb-8">
              <div className="p-6 rounded-xl bg-gradient-to-r from-brand-blue/10 to-brand-cyan/10 border-2 border-brand-blue/20">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-4xl">🎯</span>
                  <div>
                    <h3 className="font-bold text-gray-900">
                      {currentStepData.mission?.title}
                    </h3>
                    <p className="text-sm text-brand-blue font-medium">
                      Reward: {currentStepData.mission?.reward}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Connect with your classmates to unlock messaging and start building your campus network!
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            {!isLastStep && !isProfileStep && (
              <button
                onClick={handleSkip}
                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Skip
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-brand-blue to-brand-cyan text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : isLastStep ? 'Start Exploring!' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
