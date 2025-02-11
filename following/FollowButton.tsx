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
      className={`px-4 py-2 rounded-full font-medium ${
        isFollowing 
          ? 'bg-gray-200 hover:bg-red-100 hover:text-red-600' 
          : 'bg-blue-500 text-white hover:bg-blue-600'
      }`}
    >
      {isFollowing ? 'Se désabonner' : "S'abonner"}
    </button>
  );
};

export default FollowButton;
