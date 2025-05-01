"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabase';
import TweetComposer from '@/components/tweets/TweetComposer';
import TweetList from '@/components/tweets/TweetList';
import useFeed from '@/hooks/useFeed';
import Link from 'next/link';
import { FaHome, FaSearch, FaBell, FaEnvelope, FaUser, FaHashtag, FaBookmark, FaEllipsisH } from 'react-icons/fa';
import Image from 'next/image';

export default function DashboardPage() {
  const router = useRouter();
  const { tweets, loading, error, refreshFeed } = useFeed();
  const [user, setUser] = useState<any>(null);

  // Vérifier que l'utilisateur est authentifié
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/auth/login');
      } else {
        const { data: userData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        setUser(userData);
      }
    };
    checkAuth();
  }, [router]);

  if (loading) {  
    return (
      <div className="min-h-screen bg-black">
        <div className="text-center py-20 text-white">
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

  if (error) {
    return (
      <div className="min-h-screen bg-black">
        <div className="text-red-500 text-center py-20">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      {/* Header - Mobile only */}
      <header className="bg-black text-white p-4 border-b border-gray-800 sticky top-0 z-50 md:hidden">
        <div className="flex items-center justify-between">
          {user && (
            <div className="w-8 h-8 rounded-full overflow-hidden">
              {user.avatar_url ? (
                <Image src={user.avatar_url} alt={user.username} width={32} height={32} />
              ) : (
                <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                  <FaUser className="text-gray-400" />
                </div>
              )}
            </div>
          )}
          <div>
            <Image 
              src="/logo_Flow.png" 
              alt="Flow Logo" 
              width={80} 
              height={30} 
              priority
            />
          </div>
          <button className="p-2">
            <FaEllipsisH />
          </button>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar - Desktop */}
        <aside className="hidden md:flex flex-col w-64 border-r border-gray-800 p-4 space-y-6 sticky top-0 h-screen">
          <div className="mb-8 px-4">
            <Image 
              src="/logo_Flow.png" 
              alt="Flow Logo" 
              width={100} 
              height={35} 
              priority
            />
          </div>
          
          <div className="space-y-1">
            <Link href="/dashboard" className="flex items-center space-x-3 text-lg font-medium p-3 rounded-full hover:bg-gray-800 bg-opacity-70 transition-colors text-white">
              <FaHome size={22} />
              <span>Accueil</span>
            </Link>
            <Link href="/explore" className="flex items-center space-x-3 text-lg p-3 rounded-full hover:bg-gray-800 transition-colors text-gray-400 hover:text-white">
              <FaHashtag size={22} />
              <span>Explorer</span>
            </Link>
            <Link href="/notifications" className="flex items-center space-x-3 text-lg p-3 rounded-full hover:bg-gray-800 transition-colors text-gray-400 hover:text-white">
              <FaBell size={22} />
              <span>Notifications</span>
            </Link>
            <Link href="/messages" className="flex items-center space-x-3 text-lg p-3 rounded-full hover:bg-gray-800 transition-colors text-gray-400 hover:text-white">
              <FaEnvelope size={22} />
              <span>Messages</span>
            </Link>
            <Link href="/bookmarks" className="flex items-center space-x-3 text-lg p-3 rounded-full hover:bg-gray-800 transition-colors text-gray-400 hover:text-white">
              <FaBookmark size={22} />
              <span>Signets</span>
            </Link>
            <Link href="/profile" className="flex items-center space-x-3 text-lg p-3 rounded-full hover:bg-gray-800 transition-colors text-gray-400 hover:text-white">
              <FaUser size={22} />
              <span>Profil</span>
            </Link>
          </div>

          <button className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-4 rounded-full mt-4 transition-colors w-full">
            Publier
          </button>

          {user && (
            <div className="mt-auto p-3 rounded-full hover:bg-gray-800 flex items-center space-x-3 cursor-pointer">
              <div className="w-10 h-10 rounded-full overflow-hidden">
                {user.avatar_url ? (
                  <Image src={user.avatar_url} alt={user.username} width={40} height={40} />
                ) : (
                  <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                    <FaUser className="text-gray-400" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold truncate">{user.full_name || "Utilisateur"}</div>
                <div className="text-gray-400 text-sm truncate">@{user.username || "utilisateur"}</div>
              </div>
              <FaEllipsisH className="text-gray-400" />
            </div>
          )}
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          {/* Desktop Header */}
          <div className="sticky top-0 z-40 bg-black bg-opacity-80 backdrop-blur-sm p-4 border-b border-gray-800 hidden md:block">
            <h1 className="text-xl font-bold">Accueil</h1>
          </div>

          <div className="max-w-2xl mx-auto border-x border-gray-800 min-h-screen">
            {/* Section pour créer un nouveau tweet */}
            <div className="border-b border-gray-800 p-4">
              <TweetComposer onSuccess={refreshFeed} />
            </div>

            {/* Fil d'actualité */}
            <div>
              {tweets.length === 0 ? (
                <div className="text-center text-gray-400 py-12 px-4">
                  <h3 className="text-xl font-bold mb-2">Bienvenue sur votre Flow</h3>
                  <p>Commencez à suivre des personnes pour voir leurs publications ici !</p>
                  <button className="mt-4 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-full transition-colors">
                    Découvrir des comptes
                  </button>
                </div>
              ) : (
                <TweetList tweets={tweets} />
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Mobile Navigation */}
      <nav className="md:hidden bg-black border-t border-gray-800 fixed bottom-0 w-full z-50">
        <div className="flex justify-around p-3">
          <Link href="/dashboard" className="p-2 text-white">
            <FaHome size={24} />
          </Link>
          <Link href="/explore" className="p-2 text-gray-400">
            <FaHashtag size={24} />
          </Link>
          <Link href="/notifications" className="p-2 text-gray-400">
            <FaBell size={24} />
          </Link>
          <Link href="/messages" className="p-2 text-gray-400">
            <FaEnvelope size={24} />
          </Link>
        </div>
      </nav>

      {/* Mobile Floating Action Button */}
      <div className="md:hidden fixed right-6 bottom-20 z-50">
        <button className="bg-red-500 hover:bg-red-600 w-14 h-14 rounded-full flex items-center justify-center shadow-lg text-white">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
    </div>
  );
}