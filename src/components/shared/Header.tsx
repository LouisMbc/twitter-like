"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import supabase from '@/lib/supabase';
import SearchBar from '@/components/searchBar/SearchBar';

export default function Header() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-white shadow-md z-50">
        <div className="max-w-6xl mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="font-bold text-xl text-blue-500">
              Twitter-like
            </Link>

            <SearchBar />

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
                onClick={async () => {
                  await supabase.auth.signOut();
                  router.push('/auth/login');
                }}
                className="px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-600"
              >
                Déconnexion
              </button>
            </nav>
          </div>
        </div>
      </header>
      <div className="h-16"></div>
    </>
  );
}