"use client";

import { useEffect, useRef, useCallback, useState } from 'react';
import useFeed from '@/hooks/useFeed';
import TweetComposer from '@/components/tweets/TweetComposer';
import TweetList from '@/components/tweets/TweetList';
import LogoLoader from "@/components/loader/loader";
import SearchBar from '@/components/searchBar/SearchBar';
import { hashtagService } from '@/services/supabase/hashtag';
import supabase from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Header from '@/components/shared/Header';
import Story from '@/components/stories/Story';
import { ThemeToggle } from '@/components/shared/ThemeToggle';

export default function DashboardPage() {  const router = useRouter();
  const { tweets, loading, error, refreshFeed, loadMoreTweets, hasMore } = useFeed();
  const observer = useRef<IntersectionObserver | null>(null);
  const [selectedStoryUserId, setSelectedStoryUserId] = useState<string | null>(null);
  const [selectedStoryIndex, setSelectedStoryIndex] = useState<number | null>(null);
  const [isStoryOpen, setIsStoryOpen] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);  const [isRefreshing, setIsRefreshing] = useState(false);
  const [trendingHashtags, setTrendingHashtags] = useState<any[]>([]);
  const [trendingLoading, setTrendingLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('Pour vous');
  const [categorizedTrends, setCategorizedTrends] = useState<{[key: string]: any[]}>({});
  
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
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push('/auth/login');
        }
      } catch (error) {
        console.error('Erreur d\'authentification:', error);
      } finally {
        setAuthChecked(true);
      }
    };
    checkAuth();
  }, [router]);
  // Charger les tendances
  useEffect(() => {
    const loadTrending = async () => {
      try {
        setTrendingLoading(true);
        
        // Charger toutes les catégories
        const allCategories = await hashtagService.getAllTrendingCategories(10);
        setCategorizedTrends(allCategories);
        
        // Définir les hashtags de la catégorie sélectionnée
        setTrendingHashtags((allCategories as {[key: string]: any[]})[selectedCategory] || []);
        
      } catch (error) {
        console.error('Erreur lors du chargement des tendances:', error);
      } finally {
        setTrendingLoading(false);
      }
    };

    if (authChecked) {
      loadTrending();
      // Actualiser les tendances toutes les 5 minutes
      const interval = setInterval(loadTrending, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [authChecked]);

  // Mettre à jour les hashtags quand la catégorie change
  useEffect(() => {
    if (categorizedTrends[selectedCategory]) {
      setTrendingHashtags(categorizedTrends[selectedCategory]);
    }
  }, [selectedCategory, categorizedTrends]);

  const handleHashtagClick = (hashtagName: string) => {
    router.push(`/hashtags/${hashtagName}`);
  };

  const handleOpenStory = (userId: string, storyIndex: number = 0) => {
    setSelectedStoryUserId(userId);
    setSelectedStoryIndex(storyIndex);
    setIsStoryOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const handleCloseStory = () => {
    setSelectedStoryUserId(null);
    setSelectedStoryIndex(null);
    setIsStoryOpen(false);
    document.body.style.overflow = 'unset';
  };

  useEffect(() => {
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleTweetSuccess = async () => {
    try {
      setIsRefreshing(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      await refreshFeed();
    } catch (error) {
      console.error('Erreur lors de l\'actualisation du feed:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  if (!authChecked) {
    return <LogoLoader />;
  }

  return (
    <div className="min-h-screen flex bg-white dark:bg-black text-gray-900 dark:text-gray-100 relative overflow-hidden transition-colors duration-300">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-100/20 dark:from-gray-900/20 via-transparent to-gray-100/20 dark:to-gray-900/20"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 dark:bg-gray-800/6 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 dark:bg-gray-700/4 rounded-full blur-3xl"></div>

      <Header />
      
      {/* Main content */}
      <div className="ml-64 flex-1 relative z-10">        {/* Top search bar */}
        <div className="sticky top-0 z-20 bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm py-3 px-6 flex items-center justify-between border-b border-gray-200/40 dark:border-gray-800/40 transition-colors duration-300">
          <div className="max-w-md w-64">
            <SearchBar 
              placeholder="Parcourir le flow..."
              showInlineResults={true}
            />
          </div>
        </div>
        
        {/* Stories section */}
        <div className="py-6 px-6 border-b border-gray-200/40 dark:border-gray-800/40">
          <div className="relative group">
            <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-200/40 dark:border-gray-800/40 overflow-hidden transition-colors duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-gray-800/3 to-gray-700/3 rounded-2xl"></div>
              <div className="relative z-10 p-6">
                <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-gray-900 dark:from-gray-100 via-gray-700 dark:via-gray-200 to-gray-600 dark:to-gray-300 bg-clip-text text-transparent">Stories</h2>
                {/* Afficher les stories sans overlay ici */}
                <Story 
                  onStoryClick={handleOpenStory}
                />
              </div>
            </div>
          </div>
        </div>
          {/* Content area */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Colonne principale */}
            <div className="lg:col-span-2 space-y-6">
              {/* Section pour créer un nouveau tweet */}
              <div className="relative group">
                <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-200/40 dark:border-gray-800/40 overflow-hidden transition-colors duration-300">
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-800/3 to-gray-700/3 rounded-2xl"></div>
                  <div className="relative z-10 p-6">
                    <TweetComposer onSuccess={handleTweetSuccess} />
                    {isRefreshing && (
                      <div className="mt-2 flex items-center justify-center">
                        <LogoLoader size="small" />
                        <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">Actualisation du feed...</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Fil d'actualité */}
              <div className="relative group">
                <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-200/40 dark:border-gray-800/40 overflow-hidden transition-colors duration-300">
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-800/3 to-gray-700/3 rounded-2xl"></div>
                  <div className="relative z-10 p-8">
                    {error && (
                      <div className="mb-4 p-4 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <p className="text-red-700 dark:text-red-400">Erreur lors du chargement: {error}</p>
                        <button 
                          onClick={refreshFeed}
                          className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                        >
                          Réessayer
                        </button>
                      </div>
                    )}
                    
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
                        <h3 className="text-2xl font-bold text-transparent bg-gradient-to-r from-gray-900 dark:from-gray-100 to-gray-600 dark:to-gray-300 bg-clip-text mb-3">
                          Aucun tweet dans votre fil d'actualité
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 text-lg">
                          Commencez à suivre des personnes pour voir leurs tweets ici !
                        </p>
                      </div>
                    ) : (
                      <TweetList tweets={tweets} />
                    )}
                    
                    {/* Indicateur de chargement pour infinite scroll */}
                    {loading && tweets.length > 0 && (
                      <div className="flex justify-center p-8">
                        <LogoLoader size="small" />
                      </div>
                    )}
                    
                    {isRefreshing && (
                      <div className="mt-2 flex items-center justify-center">
                        <LogoLoader size="small" />
                        <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">Actualisation du feed...</span>
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

            {/* Sidebar avec tendances */}
            <div className="lg:col-span-1 space-y-6">              {/* Section Tendances */}
              <div className="relative group sticky top-24">
                <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-200/40 dark:border-gray-800/40 overflow-hidden transition-colors duration-300">
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-800/3 to-gray-700/3 rounded-2xl"></div>
                  <div className="relative z-10">
                    {/* Onglets de catégories */}
                    <div className="border-b border-gray-200 dark:border-gray-700">
                      <div className="flex space-x-0 overflow-x-auto scrollbar-hide">
                        {['Pour vous', 'Tendances', 'Actualités', 'Sport', 'Divertissement'].map((category) => (
                          <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`flex-shrink-0 px-4 py-3 text-sm font-medium border-b-2 transition-all duration-200 ${
                              selectedCategory === category
                                ? 'border-red-500 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20'
                                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600'
                            }`}
                          >
                            {category}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">
                          {selectedCategory === 'Pour vous' ? '🎯 Pour vous' : 
                           selectedCategory === 'Tendances' ? '🔥 Tendances' :
                           selectedCategory === 'Actualités' ? '📰 Actualités' :
                           selectedCategory === 'Sport' ? '⚽ Sport' : '🎬 Divertissement'}
                        </h2>
                        <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span>En direct</span>
                        </div>
                      </div>
                      
                      {trendingLoading ? (
                        <div className="space-y-3">
                          {[...Array(5)].map((_, i) => (
                            <div key={i} className="animate-pulse">
                              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                              <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-1/2"></div>
                            </div>
                          ))}
                        </div>
                      ) : trendingHashtags.length > 0 ? (
                        <div className="space-y-3">
                          {trendingHashtags.map((hashtag, index) => (
                            <div
                              key={hashtag.id}
                              onClick={() => handleHashtagClick(hashtag.name)}
                              className="group cursor-pointer p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all duration-200 border border-transparent hover:border-red-200 dark:hover:border-red-800"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center space-x-2">
                                    <span className={`text-sm font-bold ${
                                      index === 0 ? 'text-yellow-500' : 
                                      index === 1 ? 'text-gray-400' : 
                                      index === 2 ? 'text-amber-600' : 
                                      'text-gray-500 dark:text-gray-400'
                                    }`}>
                                      #{index + 1}
                                    </span>
                                    <span className="text-red-500 dark:text-red-400 font-bold text-lg">#</span>
                                    <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                                      {hashtag.category}
                                    </span>
                                  </div>
                                  <p className="font-semibold text-gray-900 dark:text-gray-100 truncate group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                                    {hashtag.name}
                                  </p>
                                  <div className="flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-400">
                                    <span>{hashtag.totalViews.toLocaleString()} vues</span>
                                    <span>•</span>
                                    <span>{hashtag.usage_count} posts</span>
                                  </div>
                                </div>
                                <div className="flex flex-col items-end">
                                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Score</div>
                                  <div className="text-sm font-bold text-red-500 dark:text-red-400">
                                    {Math.round(hashtag.trendScore)}
                                  </div>
                                  {index < 3 && (
                                    <div className="text-xs text-green-500 flex items-center mt-1">
                                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                      </svg>
                                      Hot
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <div className="text-gray-400 dark:text-gray-500 mb-2">
                            {selectedCategory === 'Pour vous' ? '🎯' :
                             selectedCategory === 'Tendances' ? '📊' :
                             selectedCategory === 'Actualités' ? '📰' :
                             selectedCategory === 'Sport' ? '⚽' : '🎬'}
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Aucune tendance dans {selectedCategory.toLowerCase()} pour le moment
                          </p>
                        </div>
                      )}
                      
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button 
                          onClick={() => router.push('/explore')}
                          className="w-full text-center text-sm text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 font-medium transition-colors"
                        >
                          Voir plus de tendances
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay pour les stories en plein écran */}
      {isStoryOpen && selectedStoryUserId && (
        <div 
          className="fixed inset-0 bg-black/95 backdrop-blur-sm flex items-center justify-center z-[9999]"
          style={{ zIndex: 9999 }}
        >
          <Story 
            userId={selectedStoryUserId} 
            initialStoryIndex={selectedStoryIndex || 0}
            onClose={handleCloseStory}
            isFullScreen={true}
          />
        </div>
      )}
    </div>
  );
}