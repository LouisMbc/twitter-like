"use client";

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabase';
import { Profile } from '@/types';

// Définir les types pour les résultats de recherche
interface TweetResult {
  id: string;
  content: string;
  authorId: string;
  authorNickname?: string;
  authorProfilePicture?: string;
  type: 'tweet';
}

interface ProfileResult extends Partial<Profile> {
  type: 'profile';
}

type SearchResult = ProfileResult | TweetResult;

export default function SearchBar() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchResults([]);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);

    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);

    try {
      // Recherche des profils
      const { data: profileData, error: profileError } = await supabase
        .from('Profile')
        .select('id, nickname, profilePicture')
        .ilike('nickname', `%${query}%`)
        .limit(3);

      if (profileError) throw profileError;

      // Recherche des tweets
      const { data: tweetData, error: tweetError } = await supabase
        .from('Tweet') // Assurez-vous que le nom de la table est correct
        .select(`
          id,
          content,
          authorId,
          Profile (nickname, profilePicture)
        `)
        .ilike('content', `%${query}%`)
        .limit(3);

      if (tweetError) throw tweetError;

      // Formater les résultats
      const profileResults: ProfileResult[] = (profileData || []).map(profile => ({
        ...profile,
        type: 'profile'
      }));

      const tweetResults: TweetResult[] = (tweetData || []).map(tweet => ({
        id: tweet.id,
        content: tweet.content,
        authorId: tweet.authorId,
        authorNickname: tweet.Profile?.nickname,
        authorProfilePicture: tweet.Profile?.profilePicture,
        type: 'tweet'
      }));

      // Combiner les résultats
      setSearchResults([...profileResults, ...tweetResults]);
    } catch (error) {
      console.error('Erreur de recherche:', error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResultClick = (result: SearchResult) => {
    if (result.type === 'profile') {
      router.push(`/profile/${result.id}`);
    } else {
      router.push(`/tweet/${result.id}`); // Assurez-vous que ce chemin est correct
    }
    setSearchResults([]);
    setSearchQuery('');
  };

  return (
    <div className="relative w-full" ref={searchRef}>
      <div className="relative">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Rechercher des profils, tweets..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-200 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 bg-white text-black"
        />
      </div>

      {isLoading && (
        <div className="absolute w-full mt-1 bg-white rounded-lg shadow-lg border z-10 p-3 text-center">
          <p className="text-gray-500">Recherche en cours...</p>
        </div>
      )}

      {!isLoading && searchResults.length > 0 && (
        <div className="absolute w-full mt-1 bg-white rounded-lg shadow-lg border z-10">
          {searchResults.length > 0 && (
            <div className="p-2 border-b">
              <p className="text-sm font-medium text-gray-500">Résultats ({searchResults.length})</p>
            </div>
          )}
          
          {searchResults.map((result, index) => (
            <div
              key={`${result.type}-${result.id}`}
              className="p-3 hover:bg-gray-50 cursor-pointer"
              onClick={() => handleResultClick(result)}
            >
              {result.type === 'profile' ? (
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                    {result.profilePicture ? (
                      <img
                        src={result.profilePicture}
                        alt={result.nickname}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-gray-500">{result.nickname?.charAt(0).toUpperCase()}</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <span className="font-medium">{result.nickname}</span>
                    <div className="text-xs text-gray-500">Profil</div>
                  </div>
                </div>
              ) : (
                <div className="flex space-x-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                    {result.authorProfilePicture ? (
                      <img
                        src={result.authorProfilePicture}
                        alt={result.authorNickname}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-gray-500">{result.authorNickname?.charAt(0).toUpperCase()}</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Tweet de <span className="font-medium">{result.authorNickname}</span></div>
                    <p className="line-clamp-2">{result.content}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
          
          {searchQuery.length >= 2 && (
            <div 
              className="p-3 text-center text-red-500 hover:bg-gray-50 cursor-pointer border-t"
              onClick={() => router.push(`/search?q=${encodeURIComponent(searchQuery)}`)}
            >
              Voir tous les résultats pour "{searchQuery}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}