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

  const navItems = [
    { path: '/dashboard', label: 'Accueil', icon: <Home className="mr-4" /> },
    { path: '/explore', label: 'Explorer', icon: <Search className="mr-4" /> },
    { path: '/notifications', label: 'Notifications', icon: <Bell className="mr-4" /> },
    { path: '/messages', label: 'Messages', icon: <Mail className="mr-4" /> },
  ];

  return (
    <div className="w-64 fixed h-full border-r border-gray-800">
      <div className="p-4">
        <Image 
          src="/logo_Flow.png" 
          alt="Flow" 
          width={100} 
          height={34} 
          priority
          className="mb-8"
        />
        
        <nav className="space-y-3">
          {navItems.map(item => (
            <Link 
              key={item.path}
              href={item.path} 
              className={`flex items-center p-3 text-lg text-black ${pathname === item.path ? 'font-semibold' : ''} rounded-full hover:bg-gray-800`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
          
          {profile && (
            <Link 
              href={`/profile/${profile.id}`} 
              className={`flex items-center p-3 text-lg text-black ${pathname.includes('/profile/') ? 'font-semibold' : ''} rounded-full hover:bg-gray-800`}
            >
              <User className="mr-4" />
              Profil
            </Link>
          )}
        </nav>
        
        <button className="mt-8 bg-red-500 text-white rounded-full py-3 px-4 flex items-center justify-center w-full font-semibold">
          <Plus className="mr-1" size={18} />
          Ajouter un post
        </button>
        
        {profile && (
          <div className="absolute bottom-16 w-full pr-8">
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
        
        <div className="absolute bottom-4 w-full pr-8">
          <button 
            onClick={handleSignOut}
            className="flex items-center p-3 text-red-500 hover:bg-gray-800 rounded-full w-full"
          >
            <LogOut className="mr-4" size={18} />
            <span>Déconnexion</span>
          </button>
        </div>
      </div>
    </div>
  );
}
