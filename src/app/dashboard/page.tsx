"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabase';
import TweetList from '@/components/tweets/TweetList';
import LoadingSpinner from '@/components/layout/LoadingSpinner';
import Sidebar from '@/components/layout/Sidebar';

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

      // Redirect to home page if they're on the dashboard root
      if (window.location.pathname === '/dashboard') {
        router.push('/home');
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
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="flex">
        <Sidebar />

        {/* Main content */}
        <div className="ml-64 flex-1">
          <div className="border-b border-gray-800 p-4">
            <h1 className="text-xl font-bold">Page d'accueil</h1>
          </div>

          <div className="w-full max-w-2xl mx-auto">
            <TweetList tweets={tweets} />
          </div>
        </div>
      </div>
    </div>
  );
}