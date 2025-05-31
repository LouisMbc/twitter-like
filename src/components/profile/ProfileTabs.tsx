import React from 'react';

interface ProfileTabsProps {
  activeTab: 'tweets' | 'comments';
  onTabChange: (tab: 'tweets' | 'comments') => void;
}

export default function ProfileTabs({ activeTab, onTabChange }: ProfileTabsProps) {
  return (
    <div className="relative border-b border-gray-700/50">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-gray-800/20 via-gray-700/20 to-gray-800/20"></div>
      
      <div className="relative flex space-x-1 p-2">
        <button
          className={`relative px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-2 group ${
            activeTab === 'tweets'
              ? 'text-white'
              : 'text-gray-400 hover:text-gray-200'
          }`}
          onClick={() => onTabChange('tweets')}
        >
          {/* Active tab background */}
          {activeTab === 'tweets' && (
            <>
              <div className="absolute -inset-1 bg-gradient-to-r from-red-500/30 to-pink-500/30 rounded-xl blur"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-pink-500/20 rounded-xl"></div>
            </>
          )}
          
          {/* Hover effect for inactive tab */}
          {activeTab !== 'tweets' && (
            <div className="absolute inset-0 bg-gray-700/0 group-hover:bg-gray-700/30 rounded-xl transition-colors duration-300"></div>
          )}
          
          <div className="relative flex items-center space-x-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.418 8-9.293 8.293a1 1 0 01-.607-.094L7 18l-2.293.293A1 1 0 014 17V9a8 8 0 018-8c4.418 0 8 3.582 8 8z" />
            </svg>
            <span>Tweets</span>
          </div>
        </button>
        
        <button
          className={`relative px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-2 group ${
            activeTab === 'comments'
              ? 'text-white'
              : 'text-gray-400 hover:text-gray-200'
          }`}
          onClick={() => onTabChange('comments')}
        >
          {/* Active tab background */}
          {activeTab === 'comments' && (
            <>
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-xl blur"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl"></div>
            </>
          )}
          
          {/* Hover effect for inactive tab */}
          {activeTab !== 'comments' && (
            <div className="absolute inset-0 bg-gray-700/0 group-hover:bg-gray-700/30 rounded-xl transition-colors duration-300"></div>
          )}
          
          <div className="relative flex items-center space-x-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
            <span>Commentaires</span>
          </div>
        </button>
      </div>
      
      {/* Active tab indicator */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5">
        <div 
          className={`h-full transition-all duration-300 ease-out ${
            activeTab === 'tweets' 
              ? 'bg-gradient-to-r from-red-500 to-pink-500 w-24 ml-2' 
              : 'bg-gradient-to-r from-blue-500 to-purple-500 w-32 ml-26'
          }`}
          style={{
            marginLeft: activeTab === 'tweets' ? '8px' : '128px'
          }}
        ></div>
      </div>
    </div>
  );
}