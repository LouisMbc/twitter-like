import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useProfileData } from '@/hooks/useProfileData';

export function useUserProfile(userId?: string) {
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
  } = useProfileData(userId || (params.userId as string));

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!userId) {
        // Gérer le cas où userId est manquant
        return;
      }
      
      // Reste du code
    };
    
    fetchUserProfile();
  }, [userId]);

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