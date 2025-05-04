"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import supabase from '@/lib/supabase';
import TweetComposer from '@/components/tweets/TweetComposer';
import TweetList from '@/components/tweets/TweetList';
import useFeed from '@/hooks/useFeed';
import LoadingSpinner from '@/components/layout/LoadingSpinner'
import Link from 'next/link';
import { FaHome, FaSearch, FaBell, FaEnvelope, FaUser } from 'react-icons/fa';

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
      <div className="min-h-screen p-8">
       l
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-8">
        <div className="text-red-500 text-center">{error}</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar with dark background */}
      <div className="w-80 bg-zinc-900 min-h-screen flex flex-col border-r border-zinc-700">
        <div className="p-4">
          <Image 
            src="/logo_Flow.png" 
            alt="Flow Logo" 
            width={120} 
            height={50} 
            className="object-contain"
          />
        </div>
        
        <nav className="mt-6 flex-1">
          <Link href="/dashboard" className="flex items-center py-3 px-4 bg-zinc-800 rounded-lg mx-2 mb-1">
            <div className="w-10">
              <FaHome className="text-white" size={24} />
            </div>
            <span className="text-lg text-white font-medium">Accueil</span>
          </Link>
          
          <Link href="/explore" className="flex items-center py-3 px-4 hover:bg-zinc-800 rounded-lg mx-2 mb-1">
            <div className="w-10">
              <FaSearch className="text-white" size={24} />
            </div>
            <span className="text-lg text-white">Explorer</span>
          </Link>
          
          <Link href="/notifications" className="flex items-center py-3 px-4 hover:bg-zinc-800 rounded-lg mx-2 mb-1">
            <div className="w-10">
              <FaBell className="text-white" size={24} />
            </div>
            <span className="text-lg text-white">Notifications</span>
          </Link>
          
          <Link href="/messages" className="flex items-center py-3 px-4 hover:bg-zinc-800 rounded-lg mx-2 mb-1">
            <div className="w-10">
              <FaEnvelope className="text-white" size={24} />
            </div>
            <span className="text-lg text-white">Messages</span>
          </Link>
          
          <Link href="/profile" className="flex items-center py-3 px-4 hover:bg-zinc-800 rounded-lg mx-2 mb-1">
            <div className="w-10">
              <FaUser className="text-white" size={24} />
            </div>
            <span className="text-lg text-white">Profil</span>
          </Link>
        </nav>
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Top search bar */}
        <div className="sticky top-0 z-10 bg-zinc-900 py-2 px-4 flex items-center justify-center border-b border-zinc-700">
          <div className="relative w-full max-w-lg">
            <input
              type="text"
              placeholder="Parcourir le flow..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 py-2 w-full rounded-full bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>
        
        {/* Content area */}
        <div className="flex-1 overflow-auto">
          {/* Section pour créer un nouveau tweet */}
          <div className="border-b border-gray-200 p-4">
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
      </div>
    </div>
  );
}