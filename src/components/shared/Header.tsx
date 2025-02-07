// src/components/shared/Header.tsx
"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import supabase from '@/lib/supabase';

export default function Header() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
    };
    checkAuth();
  }, []);

  return (
    <header className="bg-white shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo/Accueil */}
          <div className="flex-shrink-0">
            <Link href="/dashboard" className="text-xl font-bold text-gray-800">
              Twitter-Like
            </Link>
          </div>

          {/* Navigation */}
          <div className="flex space-x-4">
            <Link 
              href="/dashboard"
              className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              Accueil
            </Link>
            {isLoggedIn && (
              <Link 
                href="/tweets"
                className="bg-blue-500 text-white hover:bg-blue-600 px-4 py-2 rounded-md text-sm font-medium"
              >
                Créer un post
              </Link>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}