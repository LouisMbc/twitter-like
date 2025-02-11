"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabase';

interface SearchResult {
  id: string; 
  nickname: string;
  profilePicture: string;
}

export default function Header() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };

    checkAuth();

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Si l'utilisateur n'est pas authentifié, ne pas afficher le header
  if (!isAuthenticated) {
    return null;
  }

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from('Profile')
        .select('id, nickname, profilePicture') 
        .ilike('nickname', `%${query}%`)
        .limit(5);

      if (error) throw error;
      setSearchResults(data || []);
    } catch (error) {
      console.error('Erreur de recherche:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.push('/auth/login');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  return (
    <>
      <header className="bg-white shadow-sm fixed top-0 left-0 right-0 z-50 h-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
          {/* Logo */}
          <div className="flex-shrink-0">
            <button onClick={() => router.push('/')} className="text-xl font-bold">
              Twitter-like
            </button>
          </div>

          {/* Barre de recherche */}
          <div className="relative flex-1 max-w-md mx-4">
            <input
              type="text"
              placeholder="Rechercher un utilisateur..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full px-4 py-2 rounded-full border focus:outline-none focus:border-blue-500"
            />
            
            {/* Résultats de recherche */}
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border">
                {searchResults.map((user) => (
                  <button
                    key={user.id} 
                    onClick={() => {
                      router.push(`/profile/${user.id}`); 
                      setSearchResults([]);
                      setSearchQuery('');
                    }}
                    className="flex items-center space-x-3 w-full p-3 hover:bg-gray-50 text-left"
                  >
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full overflow-hidden">
                      {user.profilePicture ? (
                        <img
                          src={user.profilePicture}
                          alt={user.nickname}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-500">
                            {user.nickname.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    <span className="font-medium">{user.nickname}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex items-center space-x-4">
              <button
              onClick={() => router.push('/tweets')}
              className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 flex items-center"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5 mr-2" 
                viewBox="0 0 20 20" 
                fill="currentColor"
              >
                <path 
                  fillRule="evenodd" 
                  d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" 
                  clipRule="evenodd" 
                />
              </svg>
              Poster
            </button>
            <button
              onClick={() => router.push('/profile')}
              className="px-4 py-2 rounded-full hover:bg-gray-100"
            >
              Profil
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-full bg-red-500 text-white hover:bg-red-600"
            >
              Déconnexion
            </button>
          </nav>
        </div>
      </header>
      {/* Spacer div pour compenser la hauteur du header fixe */}
      <div className="h-16"></div>
    </>
  );
}