import { usePathname } from 'next/navigation';
import Link from 'next/link';

interface ProfileTabsProps {
  activeTab: 'tweets' | 'comments' | 'media' | 'likes';
  onTabChange: (tab: 'tweets' | 'comments' | 'media' | 'likes') => void;
}

export default function ProfileTabs({ activeTab, onTabChange }: ProfileTabsProps) {
  const pathname = usePathname();
  
  return (
    <div className="border-b border-gray-800">
      <div className="flex">
        <button
          className={`px-6 py-4 text-center ${
            activeTab === 'tweets' 
              ? 'font-bold border-b-2 border-red-500' 
              : 'text-gray-500'
          }`}
          onClick={() => onTabChange('tweets')}
        >
          Posts
        </button>
        <button
          className={`px-6 py-4 text-center ${
            activeTab === 'comments' 
              ? 'font-bold border-b-2 border-red-500' 
              : 'text-gray-500'
          }`}
          onClick={() => onTabChange('comments')}
        >
          Réponses
        </button>
        <button
          className={`px-6 py-4 text-center ${
            activeTab === 'media' 
              ? 'font-bold border-b-2 border-red-500' 
              : 'text-gray-500'
          }`}
          onClick={() => onTabChange('media')}
        >
          Médias
        </button>
        <button
          className={`px-6 py-4 text-center ${
            activeTab === 'likes' 
              ? 'font-bold border-b-2 border-red-500' 
              : 'text-gray-500'
          }`}
          onClick={() => onTabChange('likes')}
        >
          J'aime
        </button>
      </div>
    </div>
  );
}