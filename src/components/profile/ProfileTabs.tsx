interface ProfileTabsProps {
  activeTab: 'tweets' | 'comments';
  onTabChange: (tab: 'tweets' | 'comments') => void;
}

export default function ProfileTabs({ activeTab, onTabChange }: ProfileTabsProps) {
  return (
    <div className="mb-6">
      <div className="flex space-x-4">
        <button
          className={`px-4 py-2 rounded-lg ${
            activeTab === 'tweets'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700'
          }`}
          onClick={() => onTabChange('tweets')}
        >
          Tweets
        </button>
        <button
          className={`px-4 py-2 rounded-lg ${
            activeTab === 'comments'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700'
          }`}
          onClick={() => onTabChange('comments')}
        >
          Commentaires
        </button>
      </div>
    </div>
  );
}