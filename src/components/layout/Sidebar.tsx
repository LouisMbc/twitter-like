"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Bell, Mail, User, Plus, Bookmark, Settings } from 'lucide-react';
import supabase from '@/lib/supabase';

export default function Sidebar() {
  const pathname = usePathname();
  const [profile, setProfile] = useState<any>(null);
  
  useEffect(() => {
    async function loadProfile() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .single();
      
      if (data) {
        setProfile(data);
      }
    }
    
    loadProfile();
  }, []);

  return (
    <div className="w-64 fixed h-full border-r border-gray-800">
      <div className="p-4">
        <Link href="/home">
          <Image 
            src="/logo_Flow.png" 
            alt="Flow" 
            width={100} 
            height={34} 
            priority
            className="mb-8"
          />
        </Link>
        
        <nav className="space-y-3">
          <Link href="/home" 
            className={`flex items-center p-3 text-lg ${pathname === '/home' ? 'font-semibold' : ''} rounded-full hover:bg-gray-800`}
          >
            <Home className="mr-4" />
            Accueil
          </Link>
          <Link href="/explore" 
            className={`flex items-center p-3 text-lg ${pathname === '/explore' ? 'font-semibold' : ''} rounded-full hover:bg-gray-800`}
          >
            <Search className="mr-4" />
            Explorer
          </Link>
          <Link href="/notifications" 
            className={`flex items-center p-3 text-lg ${pathname === '/notifications' ? 'font-semibold' : ''} rounded-full hover:bg-gray-800`}
          >
            <Bell className="mr-4" />
            Notifications
          </Link>
          <Link href="/messages" 
            className={`flex items-center p-3 text-lg ${pathname === '/messages' ? 'font-semibold' : ''} rounded-full hover:bg-gray-800`}
          >
            <Mail className="mr-4" />
            Messages
          </Link>
          <Link href="/bookmarks" 
            className={`flex items-center p-3 text-lg ${pathname === '/bookmarks' ? 'font-semibold' : ''} rounded-full hover:bg-gray-800`}
          >
            <Bookmark className="mr-4" />
            Signets
          </Link>
          {profile && (
            <Link href={`/profile/${profile.id}`} 
              className={`flex items-center p-3 text-lg ${pathname.includes('/profile/') ? 'font-semibold' : ''} rounded-full hover:bg-gray-800`}
            >
              <User className="mr-4" />
              Profil
            </Link>
          )}
          <Link href="/settings" 
            className={`flex items-center p-3 text-lg ${pathname === '/settings' ? 'font-semibold' : ''} rounded-full hover:bg-gray-800`}
          >
            <Settings className="mr-4" />
            Paramètres
          </Link>
        </nav>
        
        <button className="mt-8 bg-red-500 text-white rounded-full py-3 px-4 flex items-center justify-center w-full font-semibold">
          <Plus className="mr-1" size={18} />
          Ajouter un post
        </button>
        
        {profile && (
          <div className="absolute bottom-4 w-full pr-8">
            <div className="flex items-center p-3 hover:bg-gray-800 rounded-full cursor-pointer">
              {profile.profilePicture ? (
                <img 
                  src={profile.profilePicture} 
                  alt={profile.nickname || 'User'} 
                  className="w-10 h-10 rounded-full object-cover mr-2"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center mr-2">
                  <span>{profile.nickname?.charAt(0) || profile.firstName?.charAt(0) || '?'}</span>
                </div>
              )}
              <span className="text-sm ml-2">
                {profile.nickname || 'Votre_pseudo'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
