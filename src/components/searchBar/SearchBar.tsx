"use client";

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabase';
import { hashtagService } from '@/services/supabase/hashtag';

interface SearchResult {
  id: string;
  nickname: string;
  profilePicture: string | null;
}

interface HashtagResult {
  id: string;
  name: string;
  usage_count: number;
}

export default function SearchBar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [hashtagResults, setHashtagResults] = useState<HashtagResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);

  // Gérer le clic à l'extérieur sans hook personnalisé
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
        setSearchResults([]);
        setHashtagResults([]);
        setSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    if (query.trim().length < 2) {
      setSearchResults([]);
      setHashtagResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    setShowResults(true);

    try {
      // Recherche d'utilisateurs
      const { data: users, error: userError } = await supabase
        .from('Profile')
        .select('id, nickname, profilePicture')
        .ilike('nickname', `%${query}%`)
        .limit(5);

      if (userError) throw userError;

      // Recherche de hashtags si la requête commence par #
      let hashtags: HashtagResult[] = [];
      if (query.startsWith('#')) {
        const hashtagQuery = query.slice(1);
        const { data: hashtagData } = await hashtagService.searchHashtags(hashtagQuery, 5);
        hashtags = hashtagData || [];
      } else {
        // Rechercher aussi les hashtags sans #
        const { data: hashtagData } = await hashtagService.searchHashtags(query, 3);
        hashtags = hashtagData || [];
      }

      setSearchResults(users || []);
      setHashtagResults(hashtags);
    } catch (error) {
      console.error('Erreur de recherche:', error);
      setSearchResults([]);
      setHashtagResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleHashtagClick = (hashtagName: string) => {
    router.push(`/hashtags/${hashtagName}`);
    setSearchResults([]);
    setHashtagResults([]);
    setSearchQuery('');
    setShowResults(false);
  };

  return (
    <div className="relative w-64" ref={searchRef}>
      <input
        type="text"
        placeholder="Rechercher utilisateurs, #hashtags..."
        value={searchQuery}
        onChange={(e) => handleSearch(e.target.value)}
        className="w-full px-4 py-2 rounded-full border focus:outline-none focus:border-blue-500"
      />

      {showResults && (searchResults.length > 0 || hashtagResults.length > 0) && (
        <div className="absolute w-full mt-2 bg-white rounded-lg shadow-lg border max-h-96 overflow-y-auto z-50">
          {/* Résultats hashtags */}
          {hashtagResults.length > 0 && (
            <div>
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 bg-gray-50">
                HASHTAGS
              </div>
              {hashtagResults.map((hashtag) => (
                <div
                  key={hashtag.id}
                  className="p-3 hover:bg-gray-100 cursor-pointer flex items-center justify-between"
                  onClick={() => handleHashtagClick(hashtag.name)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-600 font-bold">#</span>
                    </div>
                    <div>
                      <div className="font-medium text-blue-600">#{hashtag.name}</div>
                      <div className="text-sm text-gray-500">
                        {hashtag.usage_count} tweet{hashtag.usage_count > 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Résultats utilisateurs */}
          {searchResults.length > 0 && (
            <div>
              {hashtagResults.length > 0 && <div className="border-t"></div>}
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 bg-gray-50">
                UTILISATEURS
              </div>
              {searchResults.map((result) => (
                <div
                  key={result.id}
                  className="p-3 hover:bg-gray-100 cursor-pointer flex items-center space-x-3"
                  onClick={() => {
                    router.push(`/profile/${result.id}`);
                    setSearchResults([]);
                    setHashtagResults([]);
                    setSearchQuery('');
                    setShowResults(false);
                  }}
                >
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                    {result.profilePicture ? (
                      <img
                        src={result.profilePicture}
                        alt={result.nickname}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500">
                        {result.nickname.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="font-medium">{result.nickname}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}