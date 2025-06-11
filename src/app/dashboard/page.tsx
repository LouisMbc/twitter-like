"use client";

import { useEffect, useRef, useCallback, useState } from 'react';
import useFeed from '@/hooks/useFeed';
import TweetComposer from '@/components/tweets/TweetComposer';
import TweetList from '@/components/tweets/TweetList';
import LogoLoader from "@/components/loader/loader";
import supabase from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Header from '@/components/shared/Header';
import Story from '@/components/stories/Story';

export default function DashboardPage() {
  const router = useRouter();
  const { tweets, loading, error, refreshFeed, loadMoreTweets, hasMore } = useFeed();
  const observer = useRef<IntersectionObserver | null>(null);
  const [selectedStoryUserId, setSelectedStoryUserId] = useState<string | null>(null);
  const [selectedStoryIndex, setSelectedStoryIndex] = useState<number | null>(null);
  const [isStoryOpen, setIsStoryOpen] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
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
    <div className="min-h-screen flex flex-col lg:flex-row bg-background text-foreground relative overflow-hidden transition-all duration-300">
      {/* Background effects - Responsive sizing */}
      <div className="absolute inset-0 bg-gradient-to-br from-muted/20 via-transparent to-muted/20"></div>
      <div className="absolute top-1/4 left-1/4 w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 bg-primary/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 bg-primary/3 rounded-full blur-3xl"></div>
      
      <Header />
      
      {/* Main content - Responsive layout with proper margins */}
      <div className="xl:ml-64 flex-1 relative z-10 w-full xl:w-auto pt-14 sm:pt-16 xl:pt-0 pb-14 sm:pb-16 xl:pb-0">        {/* Stories section - Responsive padding */}
        <div className="py-3 sm:py-4 lg:py-6 px-3 sm:px-4 lg:px-6 border-b border-border">
          <div className="relative group">
            <div className="bg-card/60 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-2xl border border-border overflow-hidden transition-all duration-300 hover:shadow-3xl">
              <div className="absolute inset-0 bg-gradient-to-r from-muted/10 to-muted/5 rounded-xl sm:rounded-2xl"></div>              <div className="relative z-10 p-3 sm:p-4 lg:p-6">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold mb-3 sm:mb-4 text-foreground">Stories</h2>
                <Story 
                  onStoryClick={handleOpenStory}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Content area - Responsive grid layout */}
        <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
          {/* Colonne principale - Full width sans sidebar */}
          <div className="space-y-4 sm:space-y-6">            {/* Section pour créer un nouveau tweet - Responsive styling */}
            <div className="relative group">
              <div className="bg-card/60 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-2xl border border-border overflow-hidden transition-all duration-300 hover:shadow-3xl">
                <div className="absolute inset-0 bg-gradient-to-r from-muted/10 to-muted/5 rounded-xl sm:rounded-2xl"></div>
                <div className="relative z-10 p-3 sm:p-4 lg:p-6">
                  <TweetComposer onSuccess={handleTweetSuccess} />
                  {isRefreshing && (
                    <div className="mt-2 flex items-center justify-center">
                      <LogoLoader size="small" />
                      <span className="text-sm text-muted-foreground ml-2">Actualisation du feed...</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Fil d'actualité - Responsive styling */}
            <div className="relative group">
              <div className="bg-card/60 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-2xl border border-border overflow-hidden transition-all duration-300 hover:shadow-3xl">
                <div className="absolute inset-0 bg-gradient-to-r from-muted/10 to-muted/5 rounded-xl sm:rounded-2xl"></div>
                <div className="relative z-10 p-3 sm:p-4 lg:p-8">
                  {error && (
                    <div className="mb-4 p-3 sm:p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                      <p className="text-sm sm:text-base text-destructive">Erreur lors du chargement: {error}</p>
                      <button 
                        onClick={refreshFeed}
                        className="mt-2 px-3 sm:px-4 py-2 bg-destructive text-destructive-foreground text-sm sm:text-base rounded-md hover:bg-destructive/90 transition-colors"
                      >
                        Réessayer
                      </button>
                    </div>
                  )}
                    {tweets.length === 0 && !loading ? (
                    <div className="text-center py-8 sm:py-12 lg:py-16">
                      <div className="relative group">
                        <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-primary/10 rounded-full blur-xl opacity-50"></div>
                        <svg
                          className="relative w-16 h-16 sm:w-20 sm:h-20 mx-auto text-muted-foreground mb-4 sm:mb-6 group-hover:text-foreground transition-colors duration-300"
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
                      <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent mb-2 sm:mb-3">
                        Aucun tweet dans votre fil d'actualité
                      </h3>
                      <p className="text-muted-foreground text-base sm:text-lg px-4">
                        Commencez à suivre des personnes pour voir leurs tweets ici !
                      </p>
                    </div>
                  ) : (
                    <TweetList tweets={tweets} />
                  )}

                  {/* Indicateur de chargement pour infinite scroll - Responsive */}
                  {loading && tweets.length > 0 && (
                    <div className="flex justify-center p-4 sm:p-6 lg:p-8">
                      <LogoLoader size="small" />
                    </div>
                  )}
                    {isRefreshing && (
                    <div className="mt-2 flex items-center justify-center">
                      <LogoLoader size="small" />
                      <span className="text-xs sm:text-sm text-muted-foreground ml-2">Actualisation du feed...</span>
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