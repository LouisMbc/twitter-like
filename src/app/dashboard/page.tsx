"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabase';
import { Home, Search, Bell, Mail, User, Plus } from 'lucide-react';
import TweetList from '@/components/tweets/TweetList';

export default function Dashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tweets, setTweets] = useState([]);

  useEffect(() => {
    async function loadProfile() {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/auth/login');
        return;
      }
      
      // Charger le profil
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .single();
      
      if (profileData) {
        setProfile(profileData);
      }

      // Charger les tweets
      const { data: tweetsData } = await supabase
        .from('tweets')
        .select('*, profiles(*)')
        .order('created_at', { ascending: false });
      
      if (tweetsData) {
        setTweets(tweetsData);
      }
      
      setLoading(false);
    }
    
    loadProfile();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-pulse">
          <Image 
            src="/logo_Flow.png" 
            alt="Flow Logo" 
            width={120} 
            height={40} 
            priority
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 fixed h-full border-r border-gray-800">
          <div className="p-4">
            <Image 
              src="/logo_Flow.png" 
              alt="Flow Logo" 
              width={100} 
              height={34} 
              priority
              className="mb-8"
            />
            
            <nav className="space-y-3">
              <Link href="/home" className="flex items-center p-3 text-lg font-semibold rounded-full hover:bg-gray-800">
                <Home className="mr-4" />
                Accueil
              </Link>
              <Link href="/explore" className="flex items-center p-3 text-lg rounded-full hover:bg-gray-800">
                <Search className="mr-4" />
                Explorer
              </Link>
              <Link href="/notifications" className="flex items-center p-3 text-lg rounded-full hover:bg-gray-800">
                <Bell className="mr-4" />
                Notifications
              </Link>
              <Link href="/messages" className="flex items-center p-3 text-lg rounded-full hover:bg-gray-800">
                <Mail className="mr-4" />
                Messages
              </Link>
              <Link href={`/profile/${profile?.id}`} className="flex items-center p-3 text-lg rounded-full hover:bg-gray-800">
                <User className="mr-4" />
                Profil
              </Link>
            </nav>
            
            <button className="mt-8 bg-red-500 text-white rounded-full py-3 px-4 flex items-center justify-center w-full font-semibold">
              <Plus className="mr-1" size={18} />
              Ajouter un post
            </button>
            
            <div className="absolute bottom-4 w-full pr-8">
              <div className="flex items-center p-3 hover:bg-gray-800 rounded-full cursor-pointer">
                {profile?.profilePicture ? (
                  <img 
                    src={profile.profilePicture} 
                    alt={profile.nickname || 'User'} 
                    className="w-10 h-10 rounded-full object-cover mr-2"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center mr-2">
                    <span>{profile?.nickname?.charAt(0) || profile?.firstName?.charAt(0) || '?'}</span>
                  </div>
                )}
                <span className="text-sm ml-2">
                  {profile?.nickname || 'Votre_pseudo'}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main content */}
        <div className="ml-64 flex-1">
          <div className="border-b border-gray-800 p-4">
            <h1 className="text-xl font-bold">Page d'accueil</h1>
          </div>

          <div className="w-full max-w-2xl mx-auto">
            {/* Tweets list */}
            <TweetList tweets={tweets} />
          </div>
        </div>
        
        {/* Right sidebar could be added here if needed */}
      </div>
    </div>
  );
}