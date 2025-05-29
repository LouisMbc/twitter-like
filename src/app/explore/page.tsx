"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FaEllipsisH } from 'react-icons/fa';
import Header from '@/components/shared/Header';
import SearchBar from '@/components/searchBar/SearchBar';
import supabase from '@/lib/supabase';
import { Profile } from '@/types';

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
  
  // Mock data for recommendations
  const recommendations = Array(6).fill({
    tag: '#Kanye West',
    publications: '107.3k publications'
  });

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

  return (
    <div className="min-h-screen flex bg-black text-white">
      <Header />

      {/* Main content area */}
      <div className="ml-64 flex-1">
        {/* Search bar */}
        <div className="sticky top-0 bg-black z-10 p-4 border-b border-gray-800">
          <div className="max-w-2xl mx-auto">
            <SearchBar 
              onSearch={handleSearch}
              initialQuery={query}
              showInlineResults={false}
            />
          </div>
        </div>

        {/* Navigation tabs */}
        <div className="border-b border-gray-800">
          <div className="flex justify-between overflow-x-auto">
            <button 
              className={`px-4 py-3 text-sm font-medium ${activeTab === 'pour-vous' ? 'border-b-2 border-red-500 text-red-500' : 'text-gray-400 hover:text-white'}`}
              onClick={() => setActiveTab('pour-vous')}
            >
              Pour vous
            </button>
            {hasSearched && (
              <button 
                className={`px-4 py-3 text-sm font-medium ${activeTab === 'utilisateurs' ? 'border-b-2 border-red-500 text-red-500' : 'text-gray-400 hover:text-white'}`}
                onClick={() => setActiveTab('utilisateurs')}
              >
                Utilisateurs ({searchResults.length})
              </button>
            )}
            <button 
              className={`px-4 py-3 text-sm font-medium ${activeTab === 'tendances' ? 'border-b-2 border-red-500 text-red-500' : 'text-gray-400 hover:text-white'}`}
              onClick={() => setActiveTab('tendances')}
            >
              Tendances
            </button>
            <button 
              className={`px-4 py-3 text-sm font-medium ${activeTab === 'actualites' ? 'border-b-2 border-red-500 text-red-500' : 'text-gray-400 hover:text-white'}`}
              onClick={() => setActiveTab('actualites')}
            >
              Actualités
            </button>
            <button 
              className={`px-4 py-3 text-sm font-medium ${activeTab === 'sport' ? 'border-b-2 border-red-500 text-red-500' : 'text-gray-400 hover:text-white'}`}
              onClick={() => setActiveTab('sport')}
            >
              Sport
            </button>
            <button 
              className={`px-4 py-3 text-sm font-medium ${activeTab === 'divertissement' ? 'border-b-2 border-red-500 text-red-500' : 'text-gray-400 hover:text-white'}`}
              onClick={() => setActiveTab('divertissement')}
            >
              Divertissement
            </button>
          </div>
        </div>

        {/* Content based on active tab */}
        <div className="p-4">
          {activeTab === 'pour-vous' && (
            <div className="space-y-4">
              <div className="bg-gray-900 rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4">Qui suivre</h2>
                <p className="text-gray-400 mb-4">
                  Utilisez la barre de recherche ci-dessus pour trouver des utilisateurs par leur pseudo.
                </p>
                <div className="text-sm text-gray-500">
                  💡 Astuce : Tapez au moins 2 caractères pour commencer votre recherche
                </div>
              </div>
            </div>
          )}

          {activeTab === 'utilisateurs' && (
            <div>
              {isSearching ? (
                <div className="text-center py-8">
                  <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-400">Recherche en cours...</p>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="space-y-3">
                  {searchResults.map((user) => (
                    <div
                      key={user.id}
                      className="p-4 hover:bg-gray-900 rounded-lg transition-colors border border-gray-800"
                    >
                      <div className="flex items-center justify-between">
                        <div 
                          className="flex items-center space-x-3 flex-1 cursor-pointer"
                          onClick={() => {
                            console.log('Navigation vers profil, user:', user);
                            // Utiliser l'ID du profil pour la navigation
                            router.push(`/profile/${user.id}`);
                          }}
                        >
                          <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-600 flex-shrink-0">
                            {user.profilePicture ? (
                              <img
                                src={user.profilePicture}
                                alt={user.nickname || 'Utilisateur'}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <span className="text-white font-medium">
                                  {user.nickname?.charAt(0).toUpperCase() || '?'}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <p className="font-medium text-white truncate">
                                {user.nickname || 'Utilisateur'}
                              </p>
                            </div>
                            {(user.firstName || user.lastName) && (
                              <p className="text-sm text-gray-400 truncate">
                                {user.firstName || ''} {user.lastName || ''}
                              </p>
                            )}
                            {user.bio && (
                              <p className="text-sm text-gray-300 mt-1 line-clamp-2">
                                {user.bio}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        {/* Bouton Follow/Unfollow */}
                        {currentUserId && user.id !== currentUserId && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleFollowToggle(user.id!, followingStates[user.id!] || false);
                            }}
                            disabled={followingLoading[user.id!]}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ml-3 ${
                              followingStates[user.id!]
                                ? 'bg-transparent border border-gray-600 text-white hover:bg-red-600 hover:border-red-600'
                                : 'bg-red-500 text-white hover:bg-red-600'
                            } disabled:opacity-50`}
                          >
                            {followingLoading[user.id!] ? (
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : followingStates[user.id!] ? (
                              'Ne plus suivre'
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
                  <p className="text-gray-400">Aucun utilisateur trouvé pour "{query}"</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Essayez avec un autre terme de recherche
                  </p>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>Utilisez la barre de recherche pour trouver des utilisateurs</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'tendances' && (
            <div className="divide-y divide-gray-800">
              {recommendations.map((rec, index) => (
                <div key={index} className="p-4 hover:bg-gray-900/50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-gray-400">Tendance dans le monde</p>
                      <p className="font-bold text-white">{rec.tag}</p>
                      <p className="text-sm text-gray-400">{rec.publications}</p>
                    </div>
                    <button className="text-gray-400 hover:text-white">
                      <FaEllipsisH />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Autres onglets avec contenu similaire */}
          {(activeTab === 'actualites' || activeTab === 'sport' || activeTab === 'divertissement') && (
            <div className="text-center py-8 text-gray-500">
              <p>Contenu pour {activeTab} à venir...</p>
              <p className="text-sm mt-2">En attendant, utilisez la recherche pour trouver des utilisateurs !</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
