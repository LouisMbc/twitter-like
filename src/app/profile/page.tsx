// src/app/profile/page.tsx
"use client";

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import useProfile from '@/hooks/useProfile';
import TweetCard from '@/components/tweets/TweetCard';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileTabs from '@/components/profile/ProfileTabs';
import CommentList from '@/components/comments/CommentList';
import { FaArrowLeft } from 'react-icons/fa';
import Image from 'next/image';
import Sidebar from '@/components/layout/Sidebar';

export default function ProfilePage() {
  const router = useRouter();
  const auth = useAuth();
  const {
    profile,
    tweets,
    comments,
    followersCount,
    followingCount,
    loading,
    currentProfileId
  } = useProfile();
  
  const [activeTab, setActiveTab] = useState<'tweets' | 'comments' | 'media' | 'likes'>('tweets');
  const [isFollowing, setIsFollowing] = useState(false);

  const handleFollowToggle = () => {
    setIsFollowing(!isFollowing);
    // Add actual follow/unfollow logic here
  };
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!auth.loading && !auth.user) {
      router.push('/login');
    }
  }, [auth.loading, auth.user, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="text-center py-20">
          <div className="animate-pulse flex justify-center">
            <Image 
              src="/logo_Flow.png" 
              alt="Flow Logo" 
              width={120} 
              height={40} 
              priority
            />
          </div>
          <div className="mt-4">Chargement...</div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold mb-4">Profil non trouvé</h2>
          <button 
            onClick={() => router.push('/dashboard')} 
            className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-full transition-colors"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-black text-white">
      <Sidebar />
      
      <div className="ml-64 flex-1">
        {/* Header */}
        <div className="sticky top-0 z-40 bg-black bg-opacity-80 backdrop-blur-sm p-4 border-b border-gray-800">
          <div className="max-w-xl mx-auto flex items-center">
            <button 
              onClick={() => router.back()} 
              className="p-2 rounded-full hover:bg-gray-800 mr-4"
              aria-label="Retour"
            >
              <FaArrowLeft />
            </button>
            <div>
              <h1 className="text-xl font-bold">{profile.nickname || profile.name || 'Profil'}</h1>
              <p className="text-sm text-gray-500">{tweets?.length || 0} posts</p>
            </div>
          </div>
        </div>
        
        <div className="max-w-xl mx-auto">
          <ProfileHeader 
            profile={{
              ...profile,
              username: profile.username || '', 
              full_name: `${profile.firstName} ${profile.lastName}`.trim() || profile.name || '',
              languages: profile.languages || ((languages) => languages)
            }}
            followersCount={followersCount}
            followingCount={followingCount}
            currentProfileId={currentProfileId}
            isFollowing={isFollowing}
            onFollowToggle={handleFollowToggle}
          />
          
          <ProfileTabs 
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />

          <div className="divide-y divide-gray-800">
            {activeTab === 'tweets' ? (
              tweets && tweets.length > 0 ? (
                tweets.map(tweet => (
                  <div key={tweet.id} className="py-3">
                    <TweetCard tweet={tweet} />
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <p className="mb-2">Aucun post publié</p>
                  {currentProfileId === profile.id && (
                    <button 
                      onClick={() => router.push('/tweets/create')}
                      className="mt-2 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-full"
                    >
                      Créer un post
                    </button>
                  )}
                </div>
              )
            ) : activeTab === 'comments' ? (
              comments && comments.length > 0 ? (
                <CommentList comments={comments} />
              ) : (
                <div className="text-center text-gray-500 py-8">
                  Aucune réponse
                </div>
              )
            ) : (
              <div className="text-center text-gray-500 py-8">
                {activeTab === 'media' ? 'Aucun média' : 'Aucun contenu à afficher'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}