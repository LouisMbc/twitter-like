"use client";

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabase';
import { hashtagService } from '@/services/supabase/hashtag';
import { Profile } from '@/types';
import Image from 'next/image';

interface SearchBarProps {
  placeholder?: string;
  autoFocus?: boolean;
  onSearch?: (query: string) => void;
  initialQuery?: string;
  showInlineResults?: boolean;
}

interface HashtagResult {
  id: string;
  name: string;
  usage_count: number;
}

export default function SearchBar({ 
  placeholder = "Rechercher utilisateurs, #hashtags...",
  autoFocus = false,
  onSearch,
  initialQuery = '',
  showInlineResults = true
}: SearchBarProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [searchResults, setSearchResults] = useState<Partial<Profile>[]>([]);
  const [hashtagResults, setHashtagResults] = useState<HashtagResult[]>([]);
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

    if (onSearch) {
      onSearch(query);
      return;
    }

    if (query.length < 2) {
      setSearchResults([]);
      setHashtagResults([]);
      setShowResults(false);
      return;
    }

    setIsLoading(true);
    setShowResults(true);

    try {
      const { data: users, error: userError } = await supabase
        .from('Profile')
        .select('id, user_id, nickname, profilePicture, firstName, lastName')
        .ilike('nickname', `%${query}%`)
        .limit(8);

      if (userError) throw userError;

      let hashtags: HashtagResult[] = [];
      if (query.startsWith('#')) {
        const hashtagQuery = query.slice(1);
        const { data: hashtagData } = await hashtagService.searchHashtags(hashtagQuery, 5);
        hashtags = hashtagData || [];
      } else {
        const { data: hashtagData } = await hashtagService.searchHashtags(query, 3);
        hashtags = hashtagData || [];
      }

      setSearchResults(users || []);
      setHashtagResults(hashtags);
    } catch (error) {
      setSearchResults([]);
      setHashtagResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserClick = (profileId: string) => {
    router.push(`/profile/${profileId}`);
    setShowResults(false);
    setSearchQuery('');
  };

  const handleHashtagClick = (hashtagName: string) => {
    router.push(`/hashtags/${hashtagName}`);
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
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>        <input
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
          autoFocus={autoFocus}
          className="w-full pl-10 pr-4 py-2 bg-gray-200/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-full border border-gray-300/50 dark:border-gray-700/50 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-red-500/70 focus:ring-2 focus:ring-red-500/20 transition-all duration-300"
        />
      </div>

      {showInlineResults && showResults && (
        <>          {isLoading && (
            <div className="absolute w-full mt-2 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 p-4 text-center">
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-gray-700 dark:text-gray-300">Recherche en cours...</span>
              </div>
            </div>
          )}

          {!isLoading && searchQuery.length >= 2 && (
            <div className="absolute w-full mt-2 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 max-h-96 overflow-y-auto">
              {(searchResults.length > 0 || hashtagResults.length > 0) ? (
                <>
                  {/* Résultats hashtags */}                  {hashtagResults.length > 0 && (
                    <div>
                      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-300">HASHTAGS</p>
                      </div>
                      {hashtagResults.map((hashtag) => (
                        <div
                          key={hashtag.id}
                          className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors border-b border-gray-200 dark:border-gray-700"
                          onClick={() => handleHashtagClick(hashtag.name)}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                              <span className="text-red-600 dark:text-red-400 font-bold text-xl">#</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-red-600 dark:text-red-400 truncate">#{hashtag.name}</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {hashtag.usage_count} publication{hashtag.usage_count > 1 ? 's' : ''}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Résultats utilisateurs */}                  {searchResults.length > 0 && (
                    <div>
                      {hashtagResults.length > 0 && <div className="border-t border-gray-200 dark:border-gray-700"></div>}
                      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                          UTILISATEURS ({searchResults.length})
                        </p>
                      </div>
                      
                      {searchResults.map((result) => (
                        <div
                          key={result.id}
                          className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors border-b border-gray-200 dark:border-gray-700 last:border-b-0"
                          onClick={() => handleUserClick(result.id!)}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-300 dark:bg-gray-600 flex-shrink-0">
                              {result.profilePicture ? (
                                <img
                                  src={result.profilePicture}
                                  alt={result.nickname || ''}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <span className="text-gray-700 dark:text-white font-medium">
                                    {result.nickname?.charAt(0).toUpperCase() || '?'}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 dark:text-white truncate">
                                {result.nickname}
                              </p>
                              {(result.firstName || result.lastName) && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                  {result.firstName || ''} {result.lastName || ''}
                                </p>
                              )}
                              <p className="text-xs text-gray-500 dark:text-gray-500">Profil utilisateur</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                    <div 
                    className="p-3 text-center text-red-500 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-t border-gray-200 dark:border-gray-700"
                    onClick={handleViewAllResults}
                  >
                    <span className="text-sm font-medium">
                      Voir tous les résultats pour "{searchQuery}"
                    </span>
                  </div>
                </>
              ) : (
                <div className="p-4 text-center">
                  <p className="text-gray-600 dark:text-gray-400">Aucun résultat trouvé pour "{searchQuery}"</p>
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