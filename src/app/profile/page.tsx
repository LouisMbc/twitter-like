"use client";

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import useProfile from '@/hooks/useProfile';
import TweetCard from '@/components/tweets/TweetCard';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileTabs from '@/components/profile/ProfileTabs';
import CommentList from '@/components/comments/CommentList';
import { FaArrowLeft, FaEllipsisH, FaCog } from 'react-icons/fa';
import Link from 'next/link';
import Image from 'next/image';

export default function ProfilePage() {
  const router = useRouter();
  const {
    profile,
    tweets,
    comments,
    followersCount,
    followingCount,
    loading,
    currentProfileId
  } = useProfile();
  
  const [activeTab, setActiveTab] = useState<'tweets' | 'comments' | 'languages'>('tweets');
  
  useAuth();
  useAuth();

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
        <div className="flex justify-center p-8">Profil non trouvé</div>
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
              <h1 className="text-xl font-bold">{profile.full_name || profile.username}</h1>
              <p className="text-sm text-gray-500">{tweets.length} publications</p>
            </div>
          </div>
          <Link href="/profile/edit" className="p-2 rounded-full hover:bg-gray-800">
            <FaCog />
          </Link>
        </div>
      </div>

      <div className="max-w-2xl mx-auto border-x border-gray-800">
        <ProfileHeader 
          profile={profile}
          followersCount={followersCount}
          followingCount={followingCount}
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
            {tweets.length === 0 ? (
              <div className="text-center text-gray-400 py-12 px-4">
                <h3 className="text-xl font-bold mb-2">Vous n'avez pas encore publié</h3>
                <p>Partagez vos pensées avec le monde!</p>
                <button onClick={() => router.push('/tweets')} className="mt-4 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-full transition-colors">
                  Créer une publication
                </button>
              </div>
            ) : (
              tweets.map(tweet => (
                <TweetCard key={tweet.id} tweet={tweet} />
              ))
            )}
          </div>
        ) : (
          <CommentList comments={comments} />
        )}
      </div>
    </div>
  );
}