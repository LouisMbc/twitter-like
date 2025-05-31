"use client";

import { useEffect, useRef, useCallback, useState } from 'react';
import useFeed from '@/hooks/useFeed';
import TweetComposer from '@/components/tweets/TweetComposer';
import TweetList from '@/components/tweets/TweetList';
import SimpleSpinner from '@/components/loader/SimpleSpinner';
import supabase from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { FaSearch } from 'react-icons/fa';
import Header from '@/components/shared/Header';
import Story from '@/components/stories/Story';
export default function DashboardPage() {
  const router = useRouter();
  const { tweets, loading, error, refreshFeed, loadMoreTweets, hasMore } = useFeed();
  const observer = useRef<IntersectionObserver | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const loadMoreRef = useCallback((node: HTMLDivElement) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMoreTweets();
      }
    });
    
    if (node) observer.current.observe(node);
  }, [loading, hasMore, loadMoreTweets]);

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
  return (
    <div className="min-h-screen flex bg-black text-gray-100 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900/20 via-black to-gray-900/20"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gray-800/6 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gray-700/4 rounded-full blur-3xl"></div>

      <Header />
      
      {/* Main content */}
      <div className="ml-64 flex-1 relative z-10">
        {/* Top search bar */}
        <div className="sticky top-0 z-20 bg-gray-900/60 backdrop-blur-sm py-3 px-6 flex items-center justify-between border-b border-gray-800/40">
          <div className="max-w-md w-64">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-gray-600/20 to-gray-500/20 rounded-full blur opacity-0 group-hover:opacity-100 transition duration-300"></div>
              <input 
                type="text" 
                placeholder="Parcourir le flow..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="relative w-full pl-10 pr-4 py-2 bg-gray-800/60 backdrop-blur-sm rounded-full border border-gray-700/50 text-white placeholder-gray-400 focus:outline-none focus:border-red-500/70 focus:ring-2 focus:ring-red-500/20 transition-all duration-300"
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>
        </div>
        
        {/* Stories section */}
        <div className="py-6 px-6 border-b border-gray-800/40">
          <div className="relative group">
            <div className="bg-gray-900/60 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-800/40 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-gray-800/3 to-gray-700/3 rounded-2xl"></div>
              <div className="relative z-10 p-6">
                <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">Stories</h2>
                <Story />
              </div>
            </div>
          </div>
        </div>
        
        {/* Content area */}
        <div className="p-6 space-y-6">
          {/* Section pour créer un nouveau tweet */}
          <div className="relative group">
            <div className="bg-gray-900/60 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-800/40 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-gray-800/3 to-gray-700/3 rounded-2xl"></div>
              <div className="relative z-10 p-6">
                <TweetComposer onSuccess={refreshFeed} />
              </div>
            </div>
          </div>

          {/* Fil d'actualité */}
          <div className="relative group">
            <div className="bg-gray-900/60 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-800/40 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-gray-800/3 to-gray-700/3 rounded-2xl"></div>
              <div className="relative z-10 p-8">
                {tweets.length === 0 && !loading ? (
                  <div className="text-center py-16">
                    <div className="relative group">
                      <div className="absolute -inset-4 bg-gradient-to-r from-gray-600/20 to-gray-400/20 rounded-full blur-xl opacity-50"></div>
                      <svg
                        className="relative w-20 h-20 mx-auto text-gray-400 mb-6 group-hover:text-gray-300 transition-colors duration-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.418 8-9.293 8.293a1 1 0 01-.607-.094L7 18l-2.293.293A1 1 0 014 17V9a8 8 0 018-8c4.418 0 8 3.582 8 8z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-transparent bg-gradient-to-r from-gray-200 to-gray-400 bg-clip-text mb-3">
                      Aucun tweet dans votre fil d'actualité
                    </h3>
                    <p className="text-gray-400 text-lg">
                      Commencez à suivre des personnes pour voir leurs tweets ici !
                    </p>
                  </div>
                ) : (
                  <TweetList tweets={tweets} />
                )}
                
                {/* Indicateur de chargement pour infinite scroll */}
                {loading && tweets.length > 0 && (
                  <div className="flex justify-center p-8">
                    <div className="relative">
                      <div className="w-12 h-12 border-4 border-gray-600 border-t-red-500 rounded-full animate-spin"></div>
                      <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-red-400 rounded-full animate-spin animate-reverse"></div>
                    </div>
                  </div>
                )}
                
                {/* Élément observé pour déclencher le chargement */}
                {hasMore && !loading && tweets.length > 0 && (
                  <div ref={loadMoreRef} className="h-10" />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}