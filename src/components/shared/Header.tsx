"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { EnvelopeIcon, BellIcon } from '@heroicons/react/24/outline';
import supabase from '@/lib/supabase';
import SearchBar from '@/components/searchBar/SearchBar';
import { messageService } from '@/services/supabase/message';
import { notificationService } from '@/services/supabase/notification';

export default function Header() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
<<<<<<< HEAD
  const [profile, setProfile] = useState<any>(null);
=======
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [profileId, setProfileId] = useState<string | null>(null);
>>>>>>> origin/louis

  // Vérifier l'authentification et récupérer l'ID du profil
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
      
      if (session) {
<<<<<<< HEAD
        // Charger le profil
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', session.user.id)
          .single();
        
        if (profileData) {
          setProfile(profileData);
=======
        const { data } = await supabase
          .from('Profile')
          .select('id')
          .eq('user_id', session.user.id)
          .single();
        
        if (data) {
          setProfileId(data.id);
>>>>>>> origin/louis
        }
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
      if (!session) {
        setProfileId(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

<<<<<<< HEAD
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 h-full flex flex-col w-[250px] bg-white border-r border-gray-200 z-50">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center">
          <Link href="/dashboard" className="flex-shrink-0 mr-3">
            <img src="/logo_Flow.png" alt="Flow Logo" className="h-8 w-auto" />
          </Link>
          <div className="w-full">
            <SearchBar />
          </div>
        </div>
      </div>
      
      <nav className="flex flex-col flex-grow">
        <Link href="/home" className="flex items-center py-3 px-4 hover:bg-gray-100">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="font-medium">Accueil</span>
        </Link>
        
        <Link href="/explore" className="flex items-center py-3 px-4 hover:bg-gray-100">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span className="font-medium">Explorer</span>
        </Link>
        
        <Link href="/notifications" className="flex items-center py-3 px-4 hover:bg-gray-100">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="font-medium">Notifications</span>
        </Link>
        
        <Link href="/messages" className="flex items-center py-3 px-4 hover:bg-gray-100">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <span className="font-medium">Messages</span>
        </Link>
        
        <Link href="/profile" className="flex items-center py-3 px-4 hover:bg-gray-100">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="font-medium">Profil</span>
        </Link>
      </nav>
      
      <div className="p-4 mt-auto">
        <button 
          onClick={() => router.push('/tweets/new')}
          className="bg-red-500 text-white w-full py-3 rounded-full font-medium hover:bg-red-600 transition-colors"
        >
          Ajouter un post +
        </button>
      </div>
      
      <div className="p-4 flex items-center">
        <div className="h-10 w-10 rounded-full bg-gray-200 mr-3">
          {profile?.profilePicture && (
            <img
              src={profile.profilePicture}
              alt={profile.nickname || 'User'}
              className="w-full h-full rounded-full object-cover"
            />
          )}
        </div>
        <div className="text-sm overflow-hidden">
          <p className="font-medium truncate">{profile?.nickname || 'Votre_pseudo'}</p>
          <button 
            onClick={handleSignOut}
            className="text-gray-500 text-xs"
          >
            Déconnexion
          </button>
        </div>
      </div>
    </div>
=======
  // Récupérer le nombre de messages non lus
  useEffect(() => {
    if (!profileId) {
      setUnreadMessageCount(0);
      return;
    }
    
    const fetchUnreadMessageCount = async () => {
      try {
        const { count } = await messageService.getUnreadCount(profileId);
        setUnreadMessageCount(count);
      } catch (error) {
        console.error("Erreur lors de la récupération des messages non lus:", error);
      }
    };
    
    fetchUnreadMessageCount();
    
    const subscription = supabase
      .channel('messages-count')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'Messages',
        filter: `recipient_id=eq.${profileId}`
      }, () => {
        fetchUnreadMessageCount();
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'Messages',
        filter: `recipient_id=eq.${profileId}`
      }, () => {
        fetchUnreadMessageCount();
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(subscription);
    };
  }, [profileId]);

  // Récupérer le nombre de notifications non lues
  useEffect(() => {
    if (!profileId) {
      setUnreadNotificationCount(0);
      return;
    }
    
    const fetchUnreadNotificationCount = async () => {
      try {
        const { count } = await notificationService.getUnreadCount(profileId);
        setUnreadNotificationCount(count);
      } catch (error) {
        console.error("Erreur lors de la récupération des notifications non lues:", error);
      }
    };
    
    fetchUnreadNotificationCount();
    
    const subscription = supabase
      .channel('notifications-count')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'Notifications',
        filter: `user_id=eq.${profileId}`
      }, () => {
        fetchUnreadNotificationCount();
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'Notifications',
        filter: `user_id=eq.${profileId}`
      }, () => {
        fetchUnreadNotificationCount();
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
                  
                  {/* Bouton Notifications */}
                  <Link href="/notifications" className="flex items-center p-2 hover:bg-gray-100 rounded-md relative">
                    <BellIcon className="h-5 w-5 mr-2" />
                    <span>Notifications</span>
                    {unreadNotificationCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                        {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
                      </span>
                    )}
                  </Link>
                  
                  {/* Bouton Messages */}
                  <Link href="/messages" className="flex items-center p-2 hover:bg-gray-100 rounded-md relative">
                    <EnvelopeIcon className="h-5 w-5 mr-2" />
                    <span>Messages</span>
                    {unreadMessageCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                        {unreadMessageCount > 99 ? '99+' : unreadMessageCount}
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
>>>>>>> origin/louis
  );
}