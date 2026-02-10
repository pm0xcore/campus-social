'use client';

import { useState } from 'react';
import { trackEvent } from '@/lib/analytics';

interface CreateGroupProps {
  onCreated: () => void;
  getAuthToken: () => string | undefined;
  hasUniversity: boolean;
}

const GROUP_TYPES = [
  { value: 'club', label: 'Club', icon: '🎯' },
  { value: 'study', label: 'Study Group', icon: '✏️' },
  { value: 'course', label: 'Course', icon: '📚' },
];

export function CreateGroup({ onCreated, getAuthToken, hasUniversity }: CreateGroupProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('club');
  const [universityGated, setUniversityGated] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || submitting) return;

    const token = getAuthToken();
    if (!token) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          type,
          universityGated,
        }),
      });

      if (res.ok) {
        setName('');
        setDescription('');
        setType('club');
        setUniversityGated(false);
        setIsOpen(false);
        onCreated();
        trackEvent('group_created', { type, universityGated });
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full p-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-brand-blue hover:text-brand-blue transition-colors"
      >
        + Create a Group
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-gray-200 rounded-xl p-4"
    >
      <h3 className="font-medium text-gray-900 mb-4">Create a Group</h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Web3 Study Group"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-blue"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What's this group about?"
            rows={2}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-blue resize-none"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-2">Type</label>
          <div className="flex gap-2">
            {GROUP_TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setType(t.value)}
                className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                  type === t.value
                    ? 'bg-brand-blue text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>
        </div>

        {hasUniversity && (
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={universityGated}
              onChange={(e) => setUniversityGated(e.target.checked)}
              className="w-4 h-4 text-brand-blue rounded"
            />
            <span className="text-sm text-gray-600">
              Only students from my university can join
            </span>
          </label>
        )}
      </div>

      <div className="flex gap-2 mt-4 pt-4 border-t">
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="flex-1 py-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!name.trim() || submitting}
          className="flex-1 py-2 bg-brand-blue text-white rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {submitting ? 'Creating...' : 'Create'}
        </button>
      </div>
    </form>
  );
}
