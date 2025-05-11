"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Search, Bell, Mail, User, Plus, LogOut } from 'lucide-react';
import supabase from '@/lib/supabase';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  
  useEffect(() => {
    async function loadProfile() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/auth/login');
        return;
      }
      
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
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  return (
    <div className="w-[250px] p-4 border-r border-gray-800 flex flex-col h-screen fixed left-0 bg-black text-white">
      <div className="mb-8">
        <Link href="/dashboard">
          <Image
            src="/logo_Flow.png"
            alt="Flow Logo"
            width={100}
            height={50}
            className="object-contain"
          />
        </Link>
      </div>

      <nav className="flex-1">
        <ul className="space-y-4">
          <li>
            <Link 
              href="/dashboard" 
              className={`flex items-center p-2 rounded-full ${pathname === '/dashboard' ? 'bg-gray-800' : 'hover:bg-gray-800'}`}
            >
              <Home className="mr-4 text-2xl" />
              <span className="text-xl">Accueil</span>
            </Link>
          </li>
          <li>
            <Link 
              href="/explore" 
              className={`flex items-center p-2 rounded-full ${pathname === '/explore' ? 'bg-gray-800' : 'hover:bg-gray-800'}`}
            >
              <Search className="mr-4 text-2xl" />
              <span className="text-xl">Explorer</span>
            </Link>
          </li>
          <li>
            <Link 
              href="/notifications" 
              className={`flex items-center p-2 rounded-full ${pathname === '/notifications' ? 'bg-gray-800' : 'hover:bg-gray-800'}`}
            >
              <Bell className="mr-4 text-2xl" />
              <span className="text-xl">Notifications</span>
            </Link>
          </li>
          <li>
            <Link 
              href="/messages" 
              className={`flex items-center p-2 rounded-full ${pathname === '/messages' ? 'bg-gray-800' : 'hover:bg-gray-800'}`}
            >
              <Mail className="mr-4 text-2xl" />
              <span className="text-xl">Messages</span>
            </Link>
          </li>
          {profile && (
            <li>
              <Link 
                href={`/profile/${profile.id}`} 
                className={`flex items-center p-2 rounded-full ${pathname.includes('/profile/') ? 'bg-gray-800' : 'hover:bg-gray-800'}`}
              >
                <User className="mr-4 text-2xl" />
                <span className="text-xl">Profil</span>
              </Link>
            </li>
          )}
        </ul>
      </nav>

      <Link 
        href="/tweets/new"
        className="mt-8 bg-red-600 text-white rounded-full py-3 px-4 flex items-center justify-center w-full font-semibold hover:bg-red-700"
      >
        <Plus className="mr-1" size={18} />
        Ajouter un post
      </Link>

      {profile && (
        <div className="mt-auto mb-4">
          <Link href={`/profile/${profile.id}`} className="flex items-center p-3 hover:bg-gray-800 rounded-full">
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
            <span className="text-sm ml-2 text-white">
              {profile.nickname || 'Votre_pseudo'}
            </span>
          </Link>
        </div>
      )}
      
      <button 
        onClick={handleSignOut}
        className="flex items-center p-3 text-red-500 hover:bg-gray-800 rounded-full w-full cursor-pointer"
      >
        <LogOut className="mr-4" size={18} />
        <span>Déconnexion</span>
      </button>
    </div>
  );
}
