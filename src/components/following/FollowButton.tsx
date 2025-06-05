import { FC } from 'react';
import supabase from '@/lib/supabase';

export interface FollowButtonProps {
  currentProfileId: string;
  targetProfileId: string;
  isFollowing: boolean;
  onFollowToggle: () => Promise<void>;
}

const FollowButton: FC<FollowButtonProps> = ({ 
  currentProfileId, 
  targetProfileId, 
  isFollowing, 
  onFollowToggle 
}) => {
  return (
    <button 
      onClick={onFollowToggle} 
      className={`px-4 py-2 rounded-full font-medium transition-colors ${
      isFollowing 
      ? 'bg-gray-100 hover:bg-red-50 hover:text-red-500 text-gray-700' 
      : 'bg-red-600 text-white hover:bg-red-700'
      }`}
    >
      {isFollowing ? 'Se désabonner' : "S'abonner"}
    </button>
  );
};

export default FollowButton;