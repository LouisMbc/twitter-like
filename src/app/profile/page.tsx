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
import { FaArrowLeft, FaCog } from 'react-icons/fa';
import Link from 'next/link';
import Image from 'next/image';

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
    currentProfileId,
    error
  } = useProfile();
  
  const [localFollowingCount, setLocalFollowingCount] = useState(followingCount);

  const incrementFollowingCount = () => {
    setLocalFollowingCount(prev => prev + 1);
  };

  const decrementFollowingCount = () => {
    setLocalFollowingCount(prev => prev - 1);
  };
  
  const [activeTab, setActiveTab] = useState<'tweets' | 'comments' | 'media' | 'likes'>('tweets');
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!auth.loading && !auth.user) {
      router.push('/login');
    }
  }, [auth.loading, auth.user, router]);

  // Fonction pour gérer le changement du nombre d'abonnements
  const handleFollowingChange = (change: number) => {
    if (change > 0) {
      incrementFollowingCount();
    } else {
      decrementFollowingCount();
    }
  };

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

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold mb-4">Profil non trouvé</h2>
          <p className="text-gray-400 mb-6">Le profil que vous recherchez n'existe pas ou n'est pas accessible.</p>
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
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-black bg-opacity-80 backdrop-blur-sm p-4 border-b border-gray-800">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <button 
              onClick={() => router.back()} 
              className="p-2 rounded-full hover:bg-gray-800 mr-4 md:hidden"
            >
              <FaArrowLeft />
            </button>
            <div>
              <h1 className="text-xl font-bold">{profile.name || profile.username}</h1>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-2xl mx-auto px-4">
        <ProfileHeader 
          profile={{...profile, username: profile.username || ''}}
          followersCount={followersCount}
          followingCount={localFollowingCount}
          currentProfileId={currentProfileId}
          isFollowing={false}
          onFollowToggle={() => {}}
        />
        
        <ProfileTabs 
          activeTab={activeTab} 
          onTabChange={setActiveTab}
        />

        {activeTab === 'tweets' ? (
          <div>
            {!tweets?.length ? (
              <div className="text-center text-gray-400 py-12 px-4">
                <h3 className="text-xl font-bold mb-2">Aucun post publié</h3>
                <button 
                  onClick={() => router.push('/tweets/create')} 
                  className="mt-4 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-full transition-colors flex items-center justify-center mx-auto"
                >
                  <span className="mr-1">+</span> Ajouter un post
                </button>
              </div>
            ) : (
              <>
                <div className="flex justify-center my-4">
                  <button 
                    onClick={() => router.push('/tweets/create')} 
                    className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-full transition-colors flex items-center justify-center"
                  >
                    <span className="mr-1">+</span> Ajouter un post
                  </button>
                </div>
                {tweets.map(tweet => (
                  <TweetCard key={tweet.id} tweet={tweet} />
                ))}
              </>
            )}
          </div>
        ) : activeTab === 'comments' ? (
          <CommentList comments={comments || []} />
        ) : (
          <div className="text-center text-gray-400 py-12 px-4">
            <h3 className="text-xl font-bold mb-2">Aucun contenu</h3>
          </div>
        )}
      </div>
    </div>
  );
}