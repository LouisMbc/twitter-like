"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { EnvelopeIcon } from '@heroicons/react/24/outline';
import supabase from '@/lib/supabase';
import SearchBar from '@/components/searchBar/SearchBar';
import { messageService } from '@/services/supabase/message';

export default function Header() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [profileId, setProfileId] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
      
      if (session) {
        // Récupérer l'ID du profil si l'utilisateur est connecté
        const { data } = await supabase
          .from('Profile')
          .select('id')
          .eq('user_id', session.user.id)
          .single();
        
        if (data) {
          setProfileId(data.id);
        }
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
      if (!session) {
        // Réinitialiser profileId si l'utilisateur se déconnecte
        setProfileId(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Récupérer le nombre de messages non lus lorsque l'utilisateur est authentifié
  useEffect(() => {
    if (!profileId) {
      setUnreadCount(0);
      return;
    }
    
    // Fonction pour récupérer le nombre de messages non lus
    const fetchUnreadCount = async () => {
      try {
        const { count } = await messageService.getUnreadCount(profileId);
        setUnreadCount(count);
      } catch (error) {
        console.error("Erreur lors de la récupération des messages non lus:", error);
      }
    };
    
    // Appeler une première fois
    fetchUnreadCount();
    
    // Mettre en place une écoute en temps réel pour les nouveaux messages
    const subscription = supabase
      .channel('messages-count')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'Messages',
        filter: `recipient_id=eq.${profileId}`
      }, () => {
        fetchUnreadCount(); // Recharger le compte à chaque nouveau message
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'Messages',
        filter: `recipient_id=eq.${profileId}`
      }, () => {
        fetchUnreadCount(); // Recharger le compte à chaque message marqué comme lu
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(subscription);
    };
  }, [profileId]);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-white shadow-md z-50">
        <div className="max-w-6xl mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            {/* Ajout du lien vers le feed avec logo Twitter Like */}
            <div className="flex items-center">
              <Link href="/dashboard" className="mr-4 flex items-center">
                <span className="font-bold text-blue-500 text-xl">Twitter Like</span>
              </Link>
              <SearchBar />
            </div>

            <nav className="flex items-center space-x-4">
              
              {isAuthenticated ? (
                <>
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
                  <Link href="/messages" className="flex items-center p-2 hover:bg-gray-100 rounded-md relative">
                    <EnvelopeIcon className="h-5 w-5 mr-2" />
                    <span>Messages</span>
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </Link>
                  
                  <button
                    onClick={async () => {
                      await supabase.auth.signOut();
                      router.push('/auth/login');
                    }}
                    className="px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    Déconnexion
                  </button>
                </>
              ) : (
                <>
                  <Link href="/auth/login" className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600">
                    Connexion
                  </Link>
                  <Link href="/auth/register" className="px-4 py-2 border border-blue-500 text-blue-500 rounded-full hover:bg-blue-50">
                    Inscription
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>
      
      {/* Espace pour que le contenu ne soit pas caché par le header */}
      <div className="pt-16"></div>
    </>
  );
}