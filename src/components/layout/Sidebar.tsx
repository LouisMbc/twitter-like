"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Bell, Mail, User, Plus } from 'lucide-react';
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
    <div className="w-64 fixed h-full bg-black border-r border-gray-800">
      <div className="p-4">
        <Link href="/dashboard" className="block mb-8">
          <h1 className="text-red-500 font-bold text-3xl">Flow</h1>
        </Link>
        
        <nav className="space-y-1">
          <Link href="/dashboard" 
            className={`flex items-center p-2 text-base ${pathname === '/dashboard' ? 'font-bold text-white' : 'text-gray-300'}`}
          >
            <Home className="mr-4" size={24} strokeWidth={1.5} />
            Accueil
          </Link>
          <Link href="/explore" 
            className={`flex items-center p-2 text-base ${pathname === '/explore' ? 'font-bold text-white' : 'text-gray-300'}`}
          >
            <Search className="mr-4" size={24} strokeWidth={1.5} />
            Explorer
          </Link>
          <Link href="/notifications" 
            className={`flex items-center p-2 text-base ${pathname === '/notifications' ? 'font-bold text-white' : 'text-gray-300'}`}
          >
            <Bell className="mr-4" size={24} strokeWidth={1.5} />
            Notifications
          </Link>
          <Link href="/messages" 
            className={`flex items-center p-2 text-base ${pathname === '/messages' ? 'font-bold text-white' : 'text-gray-300'}`}
          >
            <Mail className="mr-4" size={24} strokeWidth={1.5} />
            Messages
          </Link>
          <Link href={`/profile/${profile?.id}`} 
            className={`flex items-center p-2 text-base ${pathname.includes('/profile/') ? 'font-bold text-white' : 'text-gray-300'}`}
          >
            <User className="mr-4" size={24} strokeWidth={1.5} />
            Profil
          </Link>
        </nav>
        
        <button className="mt-6 bg-red-500 hover:bg-red-600 text-white rounded-full py-2 px-4 flex items-center justify-center w-full font-medium text-sm">
          <Plus className="mr-2" size={18} />
          Ajouter un post
        </button>
        
        <div className="absolute bottom-4 w-full pr-8">
          <div className="flex items-center p-2 cursor-pointer">
            {profile ? (
              <>
                {profile.profilePicture ? (
                  <img 
                    src={profile.profilePicture} 
                    alt={profile.nickname || 'User'} 
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-white">
                    <span>{profile.nickname?.charAt(0) || profile.firstName?.charAt(0) || '?'}</span>
                  </div>
                )}
                <span className="text-sm ml-2 text-gray-300">
                  {profile.nickname || 'Votre_pseudo'}
                </span>
              </>
            ) : (
              <>
                <div className="w-8 h-8 rounded-full bg-gray-700"></div>
                <span className="text-sm ml-2 text-gray-300">Votre_pseudo</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
