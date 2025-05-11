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
    <div className="flex min-h-screen bg-black text-white">
      {/* Sidebar with dark background */}
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
            <Link href="/dashboard" className="flex items-center px-4 py-3 text-white bg-gray-900 rounded-md">
              <Home className="mr-4" />
              <span className="text-lg font-bold">Accueil</span>
            </Link>
            <Link href="/explore" className="flex items-center px-4 py-3 text-white hover:bg-gray-900 rounded-md">
              <Search className="mr-4" />
              <span className="text-lg">Explorer</span>
            </Link>
            <Link href="/notifications" className="flex items-center px-4 py-3 text-white hover:bg-gray-900 rounded-md">
              <Bell className="mr-4" />
              <span className="text-lg">Notifications</span>
            </Link>
            <Link href="/messages" className="flex items-center px-4 py-3 text-white hover:bg-gray-900 rounded-md">
              <Mail className="mr-4" />
              <span className="text-lg">Messages</span>
            </Link>
            <Link href="/profile" className="flex items-center px-4 py-3 text-white hover:bg-gray-900 rounded-md">
              <User className="mr-4" />
              <span className="text-lg">Profil</span>
            </Link>
          </nav>
          
          <button 
            onClick={() => router.push('/tweets/new')}
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
                <span>VP</span>
              </div>
              <span className="text-sm">Votre_pseudo</span>
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
    </div>
  );
}
