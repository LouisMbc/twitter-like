import React from 'react';

interface ProfileTabsProps {
  activeTab: 'tweets' | 'comments';
  onTabChange: (tab: 'tweets' | 'comments') => void;
}

export default function ProfileTabs({ activeTab, onTabChange }: ProfileTabsProps) {
  return (
    <div className="border-b border-gray-700">
      <div className="flex space-x-4">
        <button
          className={`px-4 py-2 rounded-lg ${
            activeTab === 'tweets'
              ? 'bg-blue-400 text-white'
              : 'hover:bg-gray-800 text-gray-400'
          }`}
          onClick={() => onTabChange('tweets')}
        >
          Tweets
        </button>
        <button
          className={`px-4 py-2 rounded-lg ${
            activeTab === 'comments'
              ? 'bg-blue-400 text-white'
              : 'hover:bg-gray-800 text-gray-400'
          }`}
          onClick={() => onTabChange('comments')}
        >
          Commentaires
        </button>
      </div>
    </div>
  );
}