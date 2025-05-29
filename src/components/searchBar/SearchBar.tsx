"use client";

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabase';
import { Profile } from '@/types';

interface SearchBarProps {
  placeholder?: string;
  autoFocus?: boolean;
  onSearch?: (query: string) => void;
  initialQuery?: string;
  showInlineResults?: boolean;
}

export default function SearchBar({ 
  placeholder = "Rechercher des utilisateurs...",
  autoFocus = false,
  onSearch,
  initialQuery = '',
  showInlineResults = true
}: SearchBarProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [searchResults, setSearchResults] = useState<Partial<Profile>[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);

    // Si onSearch est fourni, l'utiliser au lieu de la recherche interne
    if (onSearch) {
      onSearch(query);
      return;
    }

    if (query.length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsLoading(true);
    setShowResults(true);

    try {
      const { data, error } = await supabase
        .from('Profile')
        .select('id, user_id, nickname, profilePicture, firstName, lastName')
        .ilike('nickname', `%${query}%`)
        .limit(8);

      if (error) throw error;
      setSearchResults(data || []);
    } catch (error) {
      console.error('Erreur de recherche:', error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserClick = (profileId: string) => {
    console.log('Navigation vers profil depuis SearchBar, profileId:', profileId);
    router.push(`/profile/${profileId}`);
    setShowResults(false);
    setSearchQuery('');
  };

  const handleViewAllResults = () => {
    router.push(`/explore?q=${encodeURIComponent(searchQuery)}`);
    setShowResults(false);
  };

  return (
    <div className="relative w-full" ref={searchRef}>
      <div className="relative">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
          autoFocus={autoFocus}
          className="w-full pl-10 pr-4 py-3 rounded-full border border-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-gray-800 text-white placeholder-gray-400"
        />
      </div>

      {showInlineResults && showResults && (
        <>
          {isLoading && (
            <div className="absolute w-full mt-2 bg-gray-800 rounded-lg shadow-lg border border-gray-700 z-50 p-4 text-center">
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-gray-300">Recherche en cours...</span>
              </div>
            </div>
          )}

          {!isLoading && searchQuery.length >= 2 && (
            <div className="absolute w-full mt-2 bg-gray-800 rounded-lg shadow-lg border border-gray-700 z-50 max-h-96 overflow-y-auto">
              {searchResults.length > 0 ? (
                <>
                  <div className="p-3 border-b border-gray-700">
                    <p className="text-sm font-medium text-gray-300">
                      {searchResults.length} utilisateur{searchResults.length > 1 ? 's' : ''} trouvé{searchResults.length > 1 ? 's' : ''}
                    </p>
                  </div>
                  
                  {searchResults.map((result) => (
                    <div
                      key={result.id}
                      className="p-3 hover:bg-gray-700 cursor-pointer transition-colors border-b border-gray-700 last:border-b-0"
                      onClick={() => handleUserClick(result.id!)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-600 flex-shrink-0">
                          {result.profilePicture ? (
                            <img
                              src={result.profilePicture}
                              alt={result.nickname}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="text-white font-medium">
                                {result.nickname?.charAt(0).toUpperCase() || '?'}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-white truncate">
                            {result.nickname}
                          </p>
                          {(result.firstName || result.lastName) && (
                            <p className="text-sm text-gray-400 truncate">
                              {result.firstName || ''} {result.lastName || ''}
                            </p>
                          )}
                          <p className="text-xs text-gray-500">Profil utilisateur</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <div 
                    className="p-3 text-center text-red-400 hover:bg-gray-700 cursor-pointer border-t border-gray-700"
                    onClick={handleViewAllResults}
                  >
                    <span className="text-sm font-medium">
                      Voir tous les résultats pour "{searchQuery}"
                    </span>
                  </div>
                </>
              ) : (
                <div className="p-4 text-center">
                  <p className="text-gray-400">Aucun utilisateur trouvé pour "{searchQuery}"</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Essayez avec un autre terme de recherche
                  </p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}