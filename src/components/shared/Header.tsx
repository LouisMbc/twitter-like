"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Home, Search, Bell, Mail, User, Plus, LogOut, Sparkles, ArrowLeft, MoreHorizontal } from "lucide-react";
import supabase from "@/lib/supabase";
import { messageService } from "@/services/supabase/message";
import { notificationService } from "@/services/supabase/notification";
import { ThemeToggle } from './ThemeToggle';

export function Navbar() {
  return (
    <nav className="p-4 flex justify-between items-center">
      <div>Logo</div>
    </nav>
  );
}

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();

  // IMPORTANT: Déclarez tous les hooks useState AVANT tout code conditionnel
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Ne pas afficher le header sur certaines pages
  const authPages = [
    "/auth/login",
    "/auth/register",
    "/auth/callback",
    "/profile/setup",
  ];
  const shouldDisplayHeader = !authPages.some((page) =>
    pathname?.startsWith(page)
  );

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  // Vérifier l'authentification et récupérer l'ID du profil
  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);

      if (session) {
        // Get profile data
        const { data } = await supabase
          .from("Profile")
          .select("*")
          .eq("user_id", session.user.id)
          .single();

        if (data) {
          setProfileId(data.id);
          setProfile(data);
        }
      }
      setIsAuthChecked(true);
    };

    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
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
        console.error(
          "Erreur lors de la récupération des messages non lus:",
          error
        );
      }
    };

    fetchUnreadMessageCount();

    const subscription = supabase
      .channel("messages-count")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "Messages",
          filter: `recipient_id=eq.${profileId}`,
        },
        () => {
          fetchUnreadMessageCount();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "Messages",
          filter: `recipient_id=eq.${profileId}`,
        },
        () => {
          fetchUnreadMessageCount();
        }
      )
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
        console.error(
          "Erreur lors de la récupération des notifications non lues:",
          error
        );
      }
    };

    fetchUnreadNotificationCount();

    const subscription = supabase
      .channel("notifications-count")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "Notifications",
          filter: `user_id=eq.${profileId}`,
        },
        () => {
          fetchUnreadNotificationCount();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "Notifications",
          filter: `user_id=eq.${profileId}`,
        },
        () => {
          fetchUnreadNotificationCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [profileId]);

  // Pages qui nécessitent une flèche de retour
  const pagesWithBackButton = [
    "/premium/success",
    "/premium/cancel",
  ];
  
  const shouldShowBackButton = pagesWithBackButton.some((page) =>
    pathname?.startsWith(page)
  );

  // Retourner null après avoir déclaré tous les hooks si le header ne doit pas s'afficher
  if (!shouldDisplayHeader) {
    return null;
  }

  const menuItems = [
    { icon: Home, label: 'Accueil', path: '/dashboard' },
    { icon: Search, label: 'Explorer', path: '/explore' },
    { icon: Bell, label: 'Notifications', path: '/notifications', badge: unreadNotificationCount },
    { icon: Mail, label: 'Messages', path: '/messages', badge: unreadMessageCount },
    { icon: User, label: 'Profil', path: '/profile' },
    { icon: Sparkles, label: 'Premium', path: '/premium' },
  ];

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-white dark:bg-black border-r border-gray-200 dark:border-gray-800 z-50 flex flex-col transition-colors duration-300">
      {/* Header avec logo et bouton thème */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center">
          <Image
            src="/logo_Flow.png"
            alt="Flow Logo"
            width={120}
            height={40}
            priority
            className="object-contain"
          />
        </div>
        {/* Afficher le ThemeToggle uniquement en développement ou sur certaines pages */}
        {(process.env.NODE_ENV === 'development' || ['/dashboard', '/explore'].some(route => pathname.startsWith(route))) && <ThemeToggle />}
      </div>
      
      {/* Navigation items */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          const IconComponent = item.icon;
          
          return (
            <Link key={item.path} href={item.path}>
              <div
                className={`flex items-center px-4 py-3 ${
                  isActive
                    ? "bg-gray-200 dark:bg-gray-900 text-red-500 font-bold"
                    : "text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-900"
                } rounded-md relative cursor-pointer transition-colors duration-200`}
              >
                <span className="mr-4">
                  <IconComponent />
                </span>
                <span className="text-lg">{item.label}</span>
                
                {item.badge && item.badge > 0 && (
                  <span className="absolute left-7 top-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {item.badge > 99 ? "99+" : item.badge}
                  </span>
                )}
              </div>
            </Link>
          );
        })}

        {/* Bouton Ajouter un post */}
        <button
          onClick={() => router.push("/tweets")}
          className="mt-6 w-full bg-red-600 text-white py-3 px-4 rounded-full font-medium hover:bg-red-700 transition-colors duration-200"
        >
          <div className="flex items-center justify-center">
            <Plus className="mr-2" size={16} />
            <span>Ajouter un post</span>
          </div>
        </button>
      </nav>

      {/* User profile at bottom */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        {profile && (
          <div className="flex items-center p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl cursor-pointer transition-all duration-200 group relative">
            <Link href="/profile" className="flex items-center flex-1">
              {profile.profilePicture || profile.avatar_url ? (
                <div className="w-10 h-10 rounded-full mr-3 overflow-hidden">
                  <Image
                    src={profile.profilePicture || profile.avatar_url}
                    alt={`${profile.nickname || profile.username}'s avatar`}
                    width={40}
                    height={40}
                    className="object-cover w-full h-full"
                  />
                </div>
              ) : (
                <div className="w-10 h-10 bg-gray-500 rounded-full mr-3 flex items-center justify-center text-white">
                  <span className="text-sm font-medium">
                    {(profile.nickname || profile.username || 'U').substring(0, 2).toUpperCase()}
                  </span>
                </div>
              )}
              <div className="flex flex-col min-w-0 flex-1">
                <span className="font-medium text-black dark:text-white truncate">
                  {profile.nickname || profile.username || "Votre pseudo"}
                </span>
              </div>
            </Link>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowProfileMenu(!showProfileMenu);
              }}
              className="ml-2 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-all duration-200"
            >
              <MoreHorizontal className="w-4 h-4 text-gray-400" />
            </button>

            {/* Profile dropdown menu */}
            {showProfileMenu && (
              <div className="absolute bottom-full right-0 mb-2 w-64 bg-white dark:bg-black rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 py-1 z-50">
                <button
                  onClick={() => {
                    handleSignOut();
                    setShowProfileMenu(false);
                  }}
                  className="w-full flex items-center px-4 py-3 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                >
                  <LogOut className="mr-3" size={18} />
                  <span>Se déconnecter de @{profile?.nickname || profile?.username}</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
