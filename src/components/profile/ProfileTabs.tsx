import { useRouter } from 'next/router';
import Link from 'next/link';

interface ProfileTabsProps {
  activeTab: 'tweets' | 'comments' | 'languages';
  onTabChange: (tab: 'tweets' | 'comments' | 'languages') => void;
}

export default function ProfileTabs({ activeTab, onTabChange }: ProfileTabsProps) {
  const { pathname } = useRouter();
  
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
        <Link 
          href="/profile/languages" 
          className={`
            px-4 py-2 text-center
            ${pathname === '/profile/languages' ? 'border-b-2 border-blue-500 font-bold' : 'text-gray-600'}
          `}
        >
          MultiluinguiX
        </Link>
      </div>
    </div>
  );
}