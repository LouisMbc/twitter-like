"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/shared/Header';
import SearchBar from '@/components/searchBar/SearchBar';
import supabase from '@/lib/supabase';
import { hashtagService } from '@/services/supabase/hashtag';
import { useAuth } from '@/hooks/useAuth';
import { Profile, Hashtag } from '@/types';
import LogoLoader from "@/components/loader/loader";

export default function ExplorePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [activeTab, setActiveTab] = useState('pour-vous');
  const [searchResults, setSearchResults] = useState<Partial<Profile>[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [followingStates, setFollowingStates] = useState<Record<string, boolean>>({});
  const [followingLoading, setFollowingLoading] = useState<Record<string, boolean>>({});
  const [popularHashtags, setPopularHashtags] = useState<Hashtag[]>([]);
  const [hashtagsLoading, setHashtagsLoading] = useState(true);
  
  useAuth();

  // Recherche automatique si query dans l'URL
  useEffect(() => {
    if (query) {
      handleSearch(query);
      setActiveTab('utilisateurs');
    }
  }, [query]);

  // Récupérer l'utilisateur actuel et vérifier les états de suivi
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase
          .from('Profile')
          .select('id')
          .eq('user_id', session.user.id)
          .single();
        
        if (profile) {
          setCurrentUserId(profile.id);
        }
      }
    };
    
    getCurrentUser();
  }, []);

  // Charger les hashtags populaires
  useEffect(() => {
    const fetchPopularHashtags = async () => {
      try {
        const { data } = await hashtagService.getPopularHashtags(50); // Augmenter la limite pour plus de hashtags
        setPopularHashtags(data || []);
      } catch (error) {
        console.error('Erreur lors du chargement des hashtags populaires:', error);
      } finally {
        setHashtagsLoading(false);
      }
    };

    fetchPopularHashtags();
  }, []);

  // Vérifier l'état de suivi pour chaque utilisateur dans les résultats
  useEffect(() => {
    const checkFollowingStates = async () => {
      if (!currentUserId || searchResults.length === 0) return;

      const userIds = searchResults.map(user => user.id).filter(Boolean) as string[];
      
      const { data: followingData } = await supabase
        .from('Following')
        .select('following_id')
        .eq('follower_id', currentUserId)
        .in('following_id', userIds);

      const followingMap: Record<string, boolean> = {};
      userIds.forEach(id => {
        followingMap[id] = followingData?.some(f => f.following_id === id) || false;
      });
      
      setFollowingStates(followingMap);
    };

    checkFollowingStates();
  }, [currentUserId, searchResults]);

  const handleSearch = async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }

    setIsSearching(true);
    setHasSearched(true);

    try {
      const { data, error } = await supabase
        .from('Profile')
        .select('id, user_id, nickname, profilePicture, firstName, lastName, bio')
        .ilike('nickname', `%${searchQuery}%`)
        .limit(20);

      if (error) throw error;
      setSearchResults(data || []);
    } catch (error) {
      console.error('Erreur de recherche:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleFollowToggle = async (userId: string, isCurrentlyFollowing: boolean) => {
    if (!currentUserId || userId === currentUserId) return;

    setFollowingLoading(prev => ({ ...prev, [userId]: true }));

    try {
      if (isCurrentlyFollowing) {
        // Unfollow
        const { error } = await supabase
          .from('Following')
          .delete()
          .eq('follower_id', currentUserId)
          .eq('following_id', userId);

        if (error) throw error;
      } else {
        // Follow
        const { error } = await supabase
          .from('Following')
          .insert([
            { follower_id: currentUserId, following_id: userId }
          ]);

        if (error) throw error;
      }

      // Mettre à jour l'état local
      setFollowingStates(prev => ({
        ...prev,
        [userId]: !isCurrentlyFollowing
      }));

    } catch (error) {
      console.error('Erreur lors du follow/unfollow:', error);
    } finally {
      setFollowingLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  const handleHashtagClick = (hashtagName: string) => {
    router.push(`/hashtags/${hashtagName}`);
  };

  return (
    <div className="min-h-screen flex bg-white dark:bg-black text-gray-900 dark:text-white transition-colors duration-300">
      <Header />

      {/* Main content area - Responsive margins */}
      <div className="lg:ml-64 flex-1 pt-16 lg:pt-0 pb-20 lg:pb-0">
        {/* Search bar - Responsive padding */}
        <div className="sticky top-16 lg:top-0 bg-white/80 dark:bg-black/80 z-10 p-4 border-b border-gray-300 dark:border-gray-800 backdrop-blur-sm transition-colors duration-300">
          <div className="max-w-2xl">
            <SearchBar 
              onSearch={handleSearch}
              initialQuery={query}
              showInlineResults={false}
            />
          </div>
        </div>

        {/* Navigation tabs - Scrollable on mobile */}
        <div className="border-b border-gray-300 dark:border-gray-800 overflow-x-auto">
          <div className="flex justify-between min-w-max lg:min-w-0">
            <button 
              className={`px-3 lg:px-4 py-3 text-sm font-medium whitespace-nowrap ${activeTab === 'pour-vous' ? 'border-b-2 border-red-500 text-red-500' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
              onClick={() => setActiveTab('pour-vous')}
            >
              Pour vous
            </button>
            {hasSearched && (
              <button 
                className={`px-3 lg:px-4 py-3 text-sm font-medium whitespace-nowrap ${activeTab === 'utilisateurs' ? 'border-b-2 border-red-500 text-red-500' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                onClick={() => setActiveTab('utilisateurs')}
              >
                Utilisateurs ({searchResults.length})
              </button>
            )}
            <button 
              className={`px-3 lg:px-4 py-3 text-sm font-medium whitespace-nowrap ${activeTab === 'tendances' ? 'border-b-2 border-red-500 text-red-500' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
              onClick={() => setActiveTab('tendances')}
            >
              Tendances
            </button>
            <button 
              className={`px-3 lg:px-4 py-3 text-sm font-medium whitespace-nowrap ${activeTab === 'actualites' ? 'border-b-2 border-red-500 text-red-500' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
              onClick={() => setActiveTab('actualites')}
            >
              Actualités
            </button>
            <button 
              className={`px-3 lg:px-4 py-3 text-sm font-medium whitespace-nowrap ${activeTab === 'sport' ? 'border-b-2 border-red-500 text-red-500' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
              onClick={() => setActiveTab('sport')}
            >
              Sport
            </button>
            <button 
              className={`px-3 lg:px-4 py-3 text-sm font-medium whitespace-nowrap ${activeTab === 'divertissement' ? 'border-b-2 border-red-500 text-red-500' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
              onClick={() => setActiveTab('divertissement')}
            >
              Divertissement
            </button>
          </div>
        </div>

        {/* Content based on active tab - Responsive padding */}
        <div className="p-4">
          {activeTab === 'pour-vous' && (
            <div className="space-y-4 lg:space-y-6">
              <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4 lg:p-6 border border-gray-300 dark:border-gray-700 transition-colors duration-300">
                <h2 className="text-lg lg:text-xl font-bold mb-4 text-gray-900 dark:text-white">Qui suivre</h2>
                <p className="text-gray-700 dark:text-gray-400 mb-4 text-sm lg:text-base">
                  Utilisez la barre de recherche ci-dessus pour trouver des utilisateurs par leur pseudo.
                </p>
                <div className="text-sm text-gray-600 dark:text-gray-500">
                  💡 Astuce : Tapez au moins 2 caractères pour commencer votre recherche
                </div>
              </div>

              {/* Section Hashtags populaires - Responsive grid */}
              <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4 lg:p-6 border border-gray-300 dark:border-gray-700 transition-colors duration-300">
                <h2 className="text-lg lg:text-xl font-bold mb-4 text-gray-900 dark:text-white">Tendances populaires</h2>
                
                {hashtagsLoading ? (
                  <div className="text-center py-4">
                    <LogoLoader size="small" />
                  </div>
                ) : popularHashtags.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {popularHashtags.map((hashtag) => (
                      <div
                        key={hashtag.id}
                        onClick={() => router.push(`/hashtags/${hashtag.name}`)}
                        className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 lg:w-12 h-10 lg:h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-red-600 dark:text-red-400 font-bold text-lg lg:text-xl">#</span>
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-semibold text-red-600 dark:text-red-400 truncate">#{hashtag.name}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {hashtag.usage_count} publication{hashtag.usage_count > 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 dark:text-gray-400 py-4">
                    Aucun hashtag populaire pour le moment
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'utilisateurs' && (
            <div>
              {/* ...existing search results with responsive styling... */}
              {isSearching ? (
                <div className="text-center py-8">
                  <LogoLoader size="small" />
                </div>
              ) : searchResults.length > 0 ? (
                <div className="space-y-3">
                  {searchResults.map((user) => (
                    <div
                      key={user.id}
                      className="p-3 lg:p-4 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-lg transition-colors border border-gray-300 dark:border-gray-800"
                    >
                      <div className="flex items-center justify-between">
                        <div 
                          className="flex items-center space-x-3 flex-1 cursor-pointer min-w-0"
                          onClick={() => {
                            router.push(`/profile/${user.id}`);
                          }}
                        >
                          <div className="w-10 lg:w-12 h-10 lg:h-12 rounded-full overflow-hidden bg-gray-300 dark:bg-gray-600 flex-shrink-0 border border-gray-400 dark:border-gray-500">
                            {user.profilePicture ? (
                              <img
                                src={user.profilePicture}
                                alt={user.nickname || 'Utilisateur'}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <span className="text-gray-900 dark:text-white font-medium text-sm lg:text-base">
                                  {user.nickname?.charAt(0).toUpperCase() || '?'}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <p className="font-medium text-gray-900 dark:text-white truncate text-sm lg:text-base">
                                {user.nickname || 'Utilisateur'}
                              </p>
                            </div>
                            {(user.firstName || user.lastName) && (
                              <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-400 truncate">
                                {user.firstName || ''} {user.lastName || ''}
                              </p>
                            )}
                            {user.bio && (
                              <p className="text-xs lg:text-sm text-gray-700 dark:text-gray-300 mt-1 line-clamp-2">
                                {user.bio}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        {/* Bouton Follow/Unfollow - Responsive */}
                        {currentUserId && user.id !== currentUserId && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleFollowToggle(user.id!, followingStates[user.id!] || false);
                            }}
                            disabled={followingLoading[user.id!]}
                            className={`px-3 lg:px-4 py-1.5 rounded-full text-xs lg:text-sm font-medium transition-colors ml-3 border flex-shrink-0 ${
                              followingStates[user.id!]
                                ? 'bg-transparent border-gray-400 dark:border-gray-600 text-gray-900 dark:text-white hover:bg-red-600 hover:border-red-600 hover:text-white'
                                : 'bg-red-500 text-white hover:bg-red-600 border-red-500'
                            } disabled:opacity-50`}
                          >
                            {followingLoading[user.id!] ? (
                              <div className="w-3 lg:w-4 h-3 lg:h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                            ) : followingStates[user.id!] ? (
                              <span className="hidden sm:inline">Ne plus suivre</span>
                            ) : (
                              'Suivre'
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : hasSearched ? (
                <div className="text-center py-8">
                  <p className="text-gray-700 dark:text-gray-400">Aucun utilisateur trouvé pour "{query}"</p>
                  <p className="text-sm text-gray-600 dark:text-gray-500 mt-2">
                    Essayez avec un autre terme de recherche
                  </p>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-600 dark:text-gray-500">
                  <p>Utilisez la barre de recherche pour trouver des utilisateurs</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'tendances' && (
            <div className="space-y-4">
              <div className="mb-6">
                <h2 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Tendances populaires
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm lg:text-base">
                  Découvrez les hashtags les plus populaires en ce moment
                </p>
              </div>

              {hashtagsLoading ? (
                <div className="text-center py-12">
                  <LogoLoader size="small" />
                </div>
              ) : popularHashtags.length > 0 ? (
                <div className="divide-y divide-gray-300 dark:divide-gray-800 border border-gray-300 dark:border-gray-800 rounded-lg overflow-hidden">
                  {popularHashtags.map((hashtag, index) => (
                    <div 
                      key={hashtag.id}
                      onClick={() => handleHashtagClick(hashtag.name)}
                      className="p-4 hover:bg-gray-100 dark:hover:bg-gray-900/50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-red-600 dark:text-red-400 font-bold text-xl">#</span>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Tendance #{index + 1} • Mondial
                            </p>
                            <p className="font-bold text-gray-900 dark:text-white text-lg lg:text-xl">
                              #{hashtag.name}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {hashtag.usage_count} publication{hashtag.usage_count > 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                        <div className="text-gray-400 dark:text-gray-500">
                          <svg 
                            className="w-5 h-5" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth={2} 
                              d="M9 5l7 7-7 7" 
                            />
                          </svg>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border border-gray-300 dark:border-gray-800 rounded-lg">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-gray-400 dark:text-gray-500 text-2xl">#</span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-400 text-lg font-medium mb-2">
                    Aucune tendance disponible
                  </p>
                  <p className="text-gray-600 dark:text-gray-500 text-sm">
                    Les hashtags populaires apparaîtront ici dès qu'ils seront utilisés
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Autres onglets avec contenu similaire */}
          {(activeTab === 'actualites' || activeTab === 'sport' || activeTab === 'divertissement') && (
            <div className="text-center py-8 text-gray-600 dark:text-gray-500 border border-gray-300 dark:border-gray-800 rounded-lg">
              <p>Contenu pour {activeTab} à venir...</p>
              <p className="text-sm mt-2">En attendant, utilisez la recherche pour trouver des utilisateurs !</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
