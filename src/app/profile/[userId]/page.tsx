"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useUserProfile } from '@/hooks/useUserProfile';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileTabs from '@/components/profile/ProfileTabs';
import TweetCard from '@/components/tweets/TweetCard';
import CommentList from '@/components/comments/CommentList';

export default function UserProfilePage() {
  const params = useParams();
  const userId = params.userId as string;
  
  const {
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
  } = useUserProfile(userId);

  // Fonction pour gérer le changement du nombre d'abonnements
  const handleFollowingChange = (change: number) => {
    // Cette fonction peut rester vide car c'est le profil d'un autre utilisateur
    // Le compteur d'abonnements de l'utilisateur courant est géré par handleFollowToggle
  };

  // Empêcher le scroll quand une story est ouverte
  useEffect(() => {
    const body = document.body;
    const html = document.documentElement;
    
    // Plus besoin de gérer isViewingStories car cette propriété n'existe pas
    return () => {
      body.style.overflow = '';
      html.style.overflow = '';
    };
  }, []);

  if (loading) {
    return <div className="flex justify-center p-8 text-gray-900 dark:text-white">Chargement...</div>;
  }

  if (!profile) {
    return <div className="flex justify-center p-8 text-red-500">Profil non trouvé</div>;
  }

  const isCurrentUser = currentProfileId === profile.id;

  return (
    <div className="max-w-4xl mx-auto p-4 mt-20 bg-white dark:bg-black text-gray-900 dark:text-white transition-colors duration-300">
      <ProfileHeader 
        profile={{
          id: profile.id,
          user_id: profile.user_id,
          nickname: profile.nickname || 'Utilisateur',
          firstName: profile.firstName || null,
          lastName: profile.lastName || null,
          bio: profile.bio || null,
          profilePicture: profile.profilePicture || null,
          certified: profile.certified,
          is_premium: profile.is_premium,
          premium_features: profile.premium_features,
          follower_count: profile.follower_count,
          following_count: profile.following_count,
          created_at: profile.created_at
        }}
        followersCount={followersCount}
        followingCount={followingCount}
        currentProfileId={currentProfileId}
        isFollowing={isFollowing}
        onFollowToggle={handleFollowToggle}
      />

      <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-black sticky top-0 z-10 transition-colors duration-300">
        <ProfileTabs 
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </div>

      <div className="space-y-4 bg-white dark:bg-black transition-colors duration-300">
        {activeTab === 'tweets' ? (
          tweets.length > 0 ? (
            tweets.map(tweet => (
              <div key={tweet.id} className="border-b border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-950 transition-colors">
                <TweetCard tweet={tweet} />
              </div>
            ))
          ) : (
            <div className="text-center py-16 px-8">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">Aucune publication</h3>
              <p className="text-gray-500 dark:text-gray-500">{profile.nickname} n'a pas encore publié.</p>
            </div>
          )
        ) : (
          comments.length > 0 ? (
            <CommentList comments={comments.map(comment => ({
              ...comment,
              profile_picture: comment.profile_picture || null,
              profiles: {
                id: comment.id || '',
                nickname: comment.nickname || '',
                firstName: comment.first_name || '',
                lastName: comment.last_name || '',
                profilePicture: comment.profile_picture || null
              }
            }))} />
          ) : (
            <div className="text-center py-16 px-8">
              <div className="text-6xl mb-4">💬</div>
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">Aucune réponse</h3>
              <p className="text-gray-500 dark:text-gray-500">{profile.nickname} n'a pas encore répondu.</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}