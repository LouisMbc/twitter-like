import React from 'react';

interface ProfileTabsProps {
  activeTab: 'tweets' | 'comments' | 'media' | 'likes';
  onTabChange: (tab: 'tweets' | 'comments' | 'media' | 'likes') => void;
}

export default function ProfileTabs({ activeTab, onTabChange }: ProfileTabsProps) {
  const tabs = [
    { id: 'tweets', label: 'Posts' },
    { id: 'comments', label: 'Réponses' },
    { id: 'media', label: 'Médias' },
    { id: 'likes', label: 'J\'aime' }
  ];
  
  return (
    <div className="border-b border-gray-800">
      <div className="grid grid-cols-4 text-center">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`py-4 ${
              activeTab === tab.id 
                ? 'text-white font-medium border-b-2 border-red-500' 
                : 'text-gray-500'
            }`}
            onClick={() => onTabChange(tab.id as any)}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}