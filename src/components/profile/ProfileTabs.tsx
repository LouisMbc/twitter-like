import React from 'react';

interface ProfileTabsProps {
  activeTab: 'tweets' | 'comments';
  onTabChange: (tab: 'tweets' | 'comments') => void;
}

export default function ProfileTabs({ activeTab, onTabChange }: ProfileTabsProps) {
  return (
    <div className="bg-black border-b border-gray-800 w-full">
      <div className="flex">
        <button
          onClick={() => onTabChange('tweets')}
          className={`flex-1 py-4 text-center font-medium transition-colors relative ${
            activeTab === 'tweets'
              ? 'text-white border-b-2 border-red-500'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Posts
        </button>
        
        <button
          onClick={() => onTabChange('comments')}
          className={`flex-1 py-4 text-center font-medium transition-colors relative ${
            activeTab === 'comments'
              ? 'text-white border-b-2 border-red-500'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Réponses
        </button>
        
        <button
          className="flex-1 py-4 text-center font-medium text-gray-400 hover:text-gray-300 transition-colors"
          disabled
        >
          Médias
        </button>
        
        <button
          className="flex-1 py-4 text-center font-medium text-gray-400 hover:text-gray-300 transition-colors"
          disabled
        >
          J'aime
        </button>
      </div>
    </div>
  );
}