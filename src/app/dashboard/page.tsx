"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import supabase from '@/lib/supabase';
import TweetComposer from '@/components/tweets/TweetComposer';
import TweetList from '@/components/tweets/TweetList';
import useFeed from '@/hooks/useFeed';
import LoadingSpinner from '@/components/layout/LoadingSpinner'
import { FaSearch } from 'react-icons/fa';
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import Story from '@/components/stories/Story';
import Footer from '@/components/shared/Footer';
import Sidebar from '@/components/layout/Sidebar';

export default function DashboardPage() {
  const router = useRouter();
  const { tweets, loading, error, refreshFeed } = useFeed();
  const [searchQuery, setSearchQuery] = useState('');

  // Vérifier que l'utilisateur est authentifié
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/auth/login');
      }
    };
    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black p-8">
        <div className="text-red-500 text-center">{error}</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-black text-white">
      <Sidebar />
      
      {/* Main content */}
      <div className="ml-64 flex-1">
        {/* Top search bar */}
        <div className="sticky top-0 z-10 bg-black py-2 px-4 flex items-center justify-between border-b border-gray-800">
          <div className="max-w-md w-64">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Parcourir le flow..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white rounded-full border border-gray-600 text-black placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>
        </div>
        
        {/* Stories section */}
        <div className="py-4 px-4 border-b border-gray-800">
          <h2 className="text-xl font-semibold mb-3">Stories</h2>
          <Story />
        </div>
        
        {/* Content area */}
        <div className="p-4">
          {/* Section pour créer un nouveau tweet */}
          <div className="border-b border-gray-800 p-4">
            <TweetComposer onSuccess={refreshFeed} />
          </div>

          {/* Fil d'actualité */}
          <div>
            {tweets.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                Aucun tweet dans votre fil d'actualité.
                Commencez à suivre des personnes pour voir leurs tweets ici !
              </div>
            ) : (
              <TweetList tweets={tweets} />
            )}
          </div>
        </div>
        
        <Footer />
      </div>
    </div>
  );
}