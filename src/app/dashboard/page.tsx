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
import { FaHome, FaSearch, FaBell, FaEnvelope, FaUser, FaPlus } from 'react-icons/fa';
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import Story from '@/components/stories/Story';

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
      {/* Sidebar with dark background */}
      <div className="fixed left-0 top-0 h-full w-64 bg-black border-r border-gray-800">
        <div className="p-4">
          <div className="mb-6">
            <Image 
              src="/logo_Flow.png" 
              alt="Flow Logo" 
              width={90} 
              height={30} 
              className="object-contain" 
            />
          </div>
          
          <nav className="space-y-1">
            <Link href="/dashboard" className="flex items-center px-4 py-3 text-white bg-gray-900 rounded-md">
              <FaHome className="mr-4" />
              <span className="text-lg font-bold">Accueil</span>
            </Link>
            <Link href="/explore" className="flex items-center px-4 py-3 text-white hover:bg-gray-900 rounded-md">
              <FaSearch className="mr-4" />
              <span className="text-lg">Explorer</span>
            </Link>
            <Link href="/notifications" className="flex items-center px-4 py-3 text-white hover:bg-gray-900 rounded-md">
              <FaBell className="mr-4" />
              <span className="text-lg">Notifications</span>
            </Link>
            <Link href="/messages" className="flex items-center px-4 py-3 text-white hover:bg-gray-900 rounded-md">
              <FaEnvelope className="mr-4" />
              <span className="text-lg">Messages</span>
            </Link>
            <Link href="/profile" className="flex items-center px-4 py-3 text-white hover:bg-gray-900 rounded-md">
              <FaUser className="mr-4" />
              <span className="text-lg">Profil</span>
            </Link>
          </nav>
          
          <button 
            onClick={() => router.push('/tweets/new')}
            className="mt-6 w-full bg-red-600 text-white py-3 px-4 rounded-full font-medium hover:bg-red-700"
          >
            <div className="flex items-center justify-center">
              <FaPlus className="mr-2" size={16} />
              <span>Ajouter un post</span>
            </div>
          </button>
          
          {/* User profile at bottom */}
          <div className="absolute bottom-16 left-0 right-0 px-4">
            <div className="flex items-center p-2 hover:bg-gray-800 rounded-full cursor-pointer">
              <div className="w-10 h-10 bg-gray-600 rounded-full mr-3 flex items-center justify-center">
                <span>VP</span>
              </div>
              <span className="text-sm">Votre_pseudo</span>
            </div>
          </div>
          
          {/* Theme toggle and logout */}
          <div className="absolute bottom-4 left-0 right-0 px-4">
            <div className="flex items-center justify-between p-2">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>
      
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
                className="w-full pl-10 pr-4 py-2 bg-gray-800 rounded-full border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>
        </div>
        
        {/* Stories section - ajouté juste après la barre de recherche */}
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
      </div>
    </div>
  );
}