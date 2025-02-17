import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useProfileData } from '@/hooks/useProfileData';

export const useUserProfile = () => {
  const params = useParams();
  const [activeTab, setActiveTab] = useState<'tweets' | 'comments'>('tweets');
  
  const {
    profile,
    tweets,
    comments,
    followersCount,
    followingCount,
    isFollowing,
    loading,
    currentProfileId,
    handleFollowToggle
  } = useProfileData(params.userId as string);

  useEffect(() => {
    console.log('Commentaires chargés:', comments); // Debug
  }, [comments]);

  return {
    profile,
    tweets,
    comments,
    followersCount,
    followingCount,
    isFollowing,
    loading,
    currentProfileId,
    handleFollowToggle,
    activeTab,
    setActiveTab
  };
};