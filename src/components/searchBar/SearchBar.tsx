"use client";

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabase';
import { Profile } from '@/types';

export default function SearchBar() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Partial<Profile>[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchResults([]);
        setSearchQuery('');
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

    try {
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
    }
  };

  return (
    <div className="relative w-64" ref={searchRef}>
      <input
        type="text"
        placeholder="Rechercher un utilisateur..."
        value={searchQuery}
        onChange={(e) => handleSearch(e.target.value)}
        className="w-full px-4 py-2 rounded-full border focus:outline-none focus:border-blue-500"
      />

      {searchResults.length > 0 && (
        <div className="absolute w-full mt-2 bg-white rounded-lg shadow-lg border">
          {searchResults.map((result) => (
            <div
              key={result.id}
              className="p-3 hover:bg-gray-100 cursor-pointer flex items-center space-x-3"
              onClick={() => {
                router.push(`/profile/${result.id}`);
                setSearchResults([]);
                setSearchQuery('');
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
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-gray-500">{result.nickname?.charAt(0).toUpperCase()}</span>
                  </div>
                )}
              </div>
              <span className="font-medium">{result.nickname}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}