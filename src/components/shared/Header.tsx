"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { EnvelopeIcon, BellIcon } from '@heroicons/react/24/outline';
import { Home, Search, Bell, Mail, User, Plus, LogOut } from 'lucide-react';
import supabase from '@/lib/supabase';
import SearchBar from '@/components/searchBar/SearchBar';
import { messageService } from '@/services/supabase/message';
import { notificationService } from '@/services/supabase/notification';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);

  // Vérifier l'authentification et récupérer l'ID du profil
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
      
      if (session) {
        // Get profile data
        const { data } = await supabase
          .from('Profile')
          .select('*')
          .eq('user_id', session.user.id)
          .single();
        
        if (data) {
          setProfileId(data.id);
          setProfile(data);
        }
      }
      setIsAuthChecked(true);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
      if (!session) {
        setProfileId(null);
        setProfile(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

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

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  return (
    <>
      {!isAuthChecked ? null : (
        <div className="flex min-h-screen bg-black text-white">
          {/* Sidebar */}
          {isAuthenticated && (
            <div className="fixed left-0 top-0 h-full w-64 bg-black border-r border-gray-800">
              <div className="p-4">
                <div className="mb-6">
                  <Image 
                    src="/logo_Flow.png" 
                    alt="Flow Logo" 
                    width={90} 
                    height={30} 
                    className="object-contain" 
                  />
                </div>
                
                <nav className="space-y-1">
                  <Link href="/dashboard">
                  <div className={`flex items-center px-4 py-3 ${pathname === '/dashboard' ? 'bg-gray-900 text-red-500 font-bold' : 'text-white hover:bg-gray-900'} rounded-md cursor-pointer`}>
                    <Home className="mr-4" />
                    <span className="text-lg">Accueil</span>
                  </div>
                  </Link>
                  <Link href="/explore">
                  <div className={`flex items-center px-4 py-3 ${pathname === '/explore' ? 'bg-gray-900 text-red-500 font-bold' : 'text-white hover:bg-gray-900'} rounded-md cursor-pointer`}>
                    <Search className="mr-4" />
                    <span className="text-lg">Explorer</span>
                  </div>
                  </Link>
                  <Link href="/notifications">
                  <div className={`flex items-center px-4 py-3 ${pathname === '/notifications' ? 'bg-gray-900 text-red-500 font-bold' : 'text-white hover:bg-gray-900'} rounded-md relative cursor-pointer`}>
                    <span className="relative mr-4">
                    <Bell />
                    {unreadNotificationCount > 0 && (
                      <span className="notif-badge">
                      {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
                      </span>
                    )}
                    </span>
                    <span className="text-lg">Notifications</span>
                  </div>
                  </Link>
                  <Link href="/messages">
                  <div className={`flex items-center px-4 py-3 ${pathname === '/messages' ? 'bg-gray-900 text-red-500 font-bold' : 'text-white hover:bg-gray-900'} rounded-md relative cursor-pointer`}>
                    <Mail className="mr-4" />
                    <span className="text-lg">Messages</span>
                    {unreadMessageCount > 0 && (
                    <span className="absolute left-7 top-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadMessageCount > 99 ? '99+' : unreadMessageCount}
                    </span>
                    )}
                  </div>
                  </Link>
                  <Link href="/profile">
                  <div className={`flex items-center px-4 py-3 ${pathname === '/profile' ? 'bg-gray-900 text-red-500 font-bold' : 'text-white hover:bg-gray-900'} rounded-md cursor-pointer`}>
                    <User className="mr-4" />
                    <span className="text-lg">Profil</span>
                  </div>
                  </Link>
                </nav>
                
                <button 
                  onClick={() => router.push('/tweets')}
                  className="mt-6 w-full bg-red-600 text-white py-3 px-4 rounded-full font-medium hover:bg-red-700"
                >
                  <div className="flex items-center justify-center">
                    <Plus className="mr-2" size={16} />
                    <span>Ajouter un post</span>
                  </div>
                </button>
                
                {/* User profile at bottom */}
                <div className="absolute bottom-16 left-0 right-0 px-4">
                  <div className="flex items-center p-2 hover:bg-gray-800 rounded-full cursor-pointer">
                    <div className="w-10 h-10 bg-gray-600 rounded-full mr-3 flex items-center justify-center">
                      <span>{profile?.username?.substring(0, 2) || 'VP'}</span>
                    </div>
                    <span className="text-sm">{profile?.username || 'Votre_pseudo'}</span>
                  </div>
                </div>
                
                {/* Theme toggle and logout */}
                <div className="absolute bottom-4 left-0 right-0 px-4">
                  <div className="flex items-center justify-between p-2">
                    <button onClick={handleSignOut} className="flex items-center text-red-500">
                      <LogOut className="mr-2" size={16} />
                      <span>Déconnexion</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="pt-16"></div>
        </div>
      )}
    </>
  );
}